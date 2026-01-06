import Store from 'electron-store';
import path from 'node:path';
import fs from 'fs-extra';

import { getUserDataPath } from '@/main/utils';

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

// TODO: 这里处理加密逻辑
export function addConnection(connections: any[]) {
  const curConnections = getConnectionsData().connections;
  curConnections.push(...connections);
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
  const next = merge
    ? { connections: [...cur.connections, ...((data?.connections as any[]) || [])] }
    : { connections: (data?.connections as any[]) || [] };
  await setConnectionsData(next);
  return next;
}

export async function updateConnectionCollected(params: { id: string; isCollected: boolean }) {
  const data = getConnectionsData();
  const next = (data.connections || []).map((c: any) =>
    c.id === params.id ? { ...c, isCollected: params.isCollected } : c
  );
  await setConnectionsData({ connections: next });
  return params;
}
