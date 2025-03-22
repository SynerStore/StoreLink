import S3Store from './adapters/s3';
import { getConfData } from '../db';

const storePool = new Map();

const getConfigById = (id: string) => {
  const confData = getConfData();
  if (confData.connections.length) {
    const connection = confData.connections.find((item: any) => item.id === id);
    return connection;
  }
  return undefined;
};

const createStoreClient = (data: any): any => {
  const { type, config } = data;
  let storeClient;
  switch (type) {
    case 's3':
      storeClient = new S3Store(config);
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
