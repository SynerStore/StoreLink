import Store from 'electron-store';
import path from 'node:path';
import fs from 'fs-extra';

import { getUserDataPath } from '@/main/utils';
import { logAction } from '@/main/events/log';
import { encryptPassword, encryptPasswordWithSecret, isEncrypted, decryptPassword } from '@/main/utils/secret';
import { errorLogger } from '@/main/utils/logger';

export interface IConnectionsData {
  connections: any[];
}

export const DEFAULT_CONNECTIONS_DATA: IConnectionsData = {
  connections: [],
};

// 应用配置
export const connectionsStore = new Store<IConnectionsData>({
  name: 'connections',
  cwd: getUserDataPath(),
  defaults: DEFAULT_CONNECTIONS_DATA,
});

export function getConnectionsData(): IConnectionsData {
  // @ts-ignore
  return connectionsStore.store;
}

export async function setConnectionsData(data: Partial<IConnectionsData>) {
  // @ts-ignore
  connectionsStore.store = {
    // @ts-ignore
    ...connectionsStore.store,
    ...data,
  };
}

function encryptConnectionSensitive(connections: any[]) {
  const keys = ['password', 'secretAccessKey', 'accessKeySecret', 'privateKey', 'passphrase'];
  return (connections || []).map((c: any) => {
    const cfg = { ...(c?.config || {}) };
    let changed = false;
    keys.forEach((k) => {
      const v = cfg[k];
      if (v && typeof v === 'string' && !isEncrypted(v)) {
        try {
          cfg[`${k}Length`] = v.length;
          cfg[k] = encryptPassword(v);
          changed = true;
        } catch (_e) {}
      }
    });
    return changed ? { ...c, config: cfg } : c;
  });
}

export function ensureEncryptedPasswordsOnStartup() {
  const curConnections = getConnectionsData().connections || [];
  const next = encryptConnectionSensitive(curConnections);
  // only write if changed length or any differs
  const changed =
    next.length !== curConnections.length ||
    next.some((c: any, i: number) => c?.config?.password !== curConnections[i]?.config?.password);
  if (changed) {
    setConnectionsData({ connections: next });
  }
}

export async function rotatePasswords(newSecret: string) {
  try {
    const curConnections = getConnectionsData().connections || [];
    const next = (curConnections || []).map((c: any) => {
      const cfg = { ...(c?.config || {}) };
      const keys = ['password', 'secretAccessKey', 'accessKeySecret', 'privateKey', 'passphrase'];
      let changed = false;
      keys.forEach((k) => {
        const v = cfg[k];
        if (v && typeof v === 'string') {
          try {
            const plain = isEncrypted(v) ? decryptPassword(v) : v;
            const enc = encryptPasswordWithSecret(newSecret, plain);
            cfg[k] = enc;
            changed = true;
          } catch (e: any) {
            errorLogger.error('Rotate secret failed for connection:', c?.id, k, e?.message || e);
          }
        }
      });
      return changed ? { ...c, config: cfg } : c;
    });
    await setConnectionsData({ connections: next });
    return next;
  } catch (e: any) {
    errorLogger.error('Rotate passwords failed:', e?.message || e);
    throw e;
  }
}

export function addConnection(connections: any[]) {
  const curConnections = getConnectionsData().connections;
  const nextToAdd = encryptConnectionSensitive(connections);
  curConnections.push(...nextToAdd);
  setConnectionsData({
    connections: curConnections,
  });
}
export function removeConnection(id: string) {
  const connections = getConnectionsData().connections;
  const index = connections.findIndex((item: any) => item.id === id);
  if (index > -1) {
    connections.splice(index, 1);
  }
  setConnectionsData({
    connections,
  });
}

export async function exportConnections(dirPath: string) {
  const data = getConnectionsData();
  const filePath = path.join(dirPath, 'connections.json');
  await fs.writeJSON(filePath, data, { spaces: 2 });
  return filePath;
}

export async function importConnections(filePath: string, merge: boolean = false) {
  const data = await fs.readJSON(filePath);
  const cur = getConnectionsData();
  const imported = encryptConnectionSensitive((data?.connections as any[]) || []);
  const next = merge ? { connections: [...cur.connections, ...imported] } : { connections: imported };
  await setConnectionsData(next);
  return next;
}

export async function updateConnectionCollected(params: { id: string; isCollected: boolean }) {
  const data = getConnectionsData();
  const next = (data.connections || []).map((c: any) =>
    c.id === params.id ? { ...c, isCollected: params.isCollected } : c,
  );
  await setConnectionsData({ connections: next });
  logAction({
    action: 'toggle_favorite',
    message: params.isCollected ? 'favorite' : 'unfavorite',
    meta: { connectionId: params.id },
  });
  return params;
}

export async function updateConnection(connection: any) {
  const data = getConnectionsData();
  const payload = encryptConnectionSensitive([connection])[0] || connection;
  const next = (data.connections || []).map((c: any) =>
    c.id === payload.id
      ? {
          ...c,
          ...payload,
          config: { ...(c?.config || {}), ...(payload?.config || {}) },
          updateDate: new Date().toLocaleString(),
        }
      : c,
  );
  await setConnectionsData({ connections: next });
  logAction({
    action: 'update_connection',
    meta: { connectionId: payload.id },
  });
  return payload;
}
