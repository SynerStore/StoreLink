import S3Store from './adapters/s3';
import LocalStore from './adapters/local';
import OssStore from './adapters/oss';
import WebDAVStore from './adapters/webdev';
import SftpStore from './adapters/sftp';
import { getConnectionsData } from '../db';
import { StoreTypes } from '@/types';

export const storePool = new Map();

const getConfigById = (id: string) => {
  const dbData = getConnectionsData();
  if (dbData.connections.length) {
    const connection = dbData.connections.find((item: any) => item.id === id);
    return connection;
  }
  return undefined;
};

const createStoreClient = (data: any): any => {
  const { id, type, config } = data;
  let storeClient;
  switch (type) {
    case StoreTypes.OSS:
      storeClient = new OssStore(id, config);
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
    default:
      break;
  }

  if (!storeClient) {
    return;
  }

  return storeClient;
};

export const getStoreInstance = (id: string) => {
  if (storePool.has(id)) {
    return storePool.get(id);
  } else {
    const connectionData = getConfigById(id);
    const storeClient = createStoreClient(connectionData);
    storePool.set(id, storeClient);
    return storeClient;
  }
};

export const storeConnect = async (params: any) => {
  const storeClient = await createStoreClient(params);
  return storeClient.test();
};

export const storeRemove = async (id: string) => {
  storePool.delete(id);
};
