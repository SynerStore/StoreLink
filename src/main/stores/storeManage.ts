import S3Store from './adapters/s3';
import LocalStore from './adapters/local';
import OssStore from './adapters/oss';
import CosStore from './adapters/cos';
import WebDAVStore from './adapters/webdev';
import SftpStore from './adapters/sftp';
import SynologyStore from './adapters/synology';
import { getConnectionsData } from '../db';
import { StoreTypes, ETaskStatus } from '@/types';
import TaskManager from '@/main/tasks/manage';
import { decryptPassword, isEncrypted } from '@/main/utils/secret';
import { errorLogger } from '@/main/utils/logger';

type StoreEntry = {
  client: any;
  timeout?: NodeJS.Timeout | null;
};
export const storePool = new Map<string, StoreEntry>();
const IDLE_MS = 5 * 60 * 1000; // 五分钟自动清除

const getConfigById = (id: string) => {
  const dbData = getConnectionsData();
  if (dbData.connections.length) {
    const connection = dbData.connections.find((item: any) => item.id === id);
    return connection;
  }
  return undefined;
};

const createStoreClient = (data: any): any => {
  if (!data) {
    throw new Error('Connection data is required');
  }
  const { id, type } = data;
  const config = (() => {
    try {
      const cfg = { ...(data?.config || {}) };
      if (cfg.password && typeof cfg.password === 'string' && isEncrypted(cfg.password)) {
        cfg.password = decryptPassword(cfg.password);
      }
      if (cfg.secretAccessKey && typeof cfg.secretAccessKey === 'string' && isEncrypted(cfg.secretAccessKey)) {
        cfg.secretAccessKey = decryptPassword(cfg.secretAccessKey);
      }
      if (cfg.accessKeySecret && typeof cfg.accessKeySecret === 'string' && isEncrypted(cfg.accessKeySecret)) {
        cfg.accessKeySecret = decryptPassword(cfg.accessKeySecret);
      }
      return cfg;
    } catch (e: any) {
      errorLogger.error(`Decrypt config for connection ${id} failed:`, e?.message || e);
      throw e;
    }
  })();
  let storeClient;
  switch (type) {
    case StoreTypes.OSS:
      storeClient = new OssStore(id, config);
      break;
    case StoreTypes.COS:
      storeClient = new CosStore(id, config);
      break;
    case StoreTypes.S3:
      storeClient = new S3Store(id, config);
      break;
    case StoreTypes.LOCAL:
      storeClient = new LocalStore(id, config);
      break;
    case StoreTypes.SFTP:
      storeClient = new SftpStore(id, config);
      break;
    case StoreTypes.WEBDAV:
      storeClient = new WebDAVStore(id, config);
      break;
    case StoreTypes.SYNOLOGY:
      storeClient = new SynologyStore(id, config);
      break;
    default:
      break;
  }

  if (!storeClient) {
    return;
  }

  return storeClient;
};

// schedule idle cleanup
const scheduleCleanup = (id: string) => {
  const entry = storePool.get(id);
  if (!entry) return;
  if (entry.timeout) {
    clearTimeout(entry.timeout);
  }
  entry.timeout = setTimeout(() => {
    const cur = storePool.get(id);
    if (!cur) return;
    try {
      const manager = TaskManager.getInstance();
      const running = manager.getTasks({ status: ETaskStatus.RUNNING }).list.some((t: any) => t.connectionId === id);
      if (running) {
        scheduleCleanup(id);
        return;
      }
    } catch (_err) {}
    try {
      cur.client?.destroy?.();
    } catch (_e) {}
    storePool.delete(id);
  }, IDLE_MS);
};

export const getStoreInstance = (id: string) => {
  if (storePool.has(id)) {
    const entry = storePool.get(id)!;
    scheduleCleanup(id);
    return entry.client;
  } else {
    const connectionData = getConfigById(id);
    if (!connectionData) {
      throw new Error(`Connection ${id} not found`);
    }
    const storeClient = createStoreClient(connectionData);
    const entry: StoreEntry = { client: storeClient, timeout: null };
    storePool.set(id, entry);
    scheduleCleanup(id);
    return storeClient;
  }
};

export const storeConnect = async (params: any) => {
  try {
    const storeClient = await createStoreClient(params);
    return storeClient.test();
  } catch (e: any) {
    errorLogger.error('Store connect failed:', e?.message || e);
    return { code: 1, data: null, message: 'decrypt_failed', success: false };
  }
};

export const storeRemove = async (id: string) => {
  const entry = storePool.get(id);
  if (!entry) return;
  if (entry.timeout) {
    clearTimeout(entry.timeout);
  }
  storePool.delete(id);
};
