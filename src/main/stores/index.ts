import { ipcMain } from 'electron';
import { EChannels } from '../../types';
import OssStore from './oss';

const storePool = new Map();

const getConfigById = (id: string) => {
  return {
    id: id,
    type: 'oss',
    brand: 'aliyun',
    config: {
      accessKeyId: 'LTAI5tNo1REGXhswci9MwnQv',
      accessKeySecret: 'q7YbuV77iHZE89C6u7eQtFaqJUjnAY',
      region: 'oss-cn-hangzhou',
      bucket: 'ape-resume-hz-dev',
    },
    createDate: '2023-05-05',
    updateDate: '2023-05-05',
  };
};
export const getStoreInstance = (id: string) => {
  if (storePool.has(id)) {
    return storePool.get(id);
  } else {
    const { config } = getConfigById(id);
    const store = new OssStore({
      secretId: config.accessKeyId,
      secretKey: config.accessKeySecret,
      bucket: config.bucket,
    });
    storePool.set(store.id, store);
    return store;
  }
};

// 代理请求方法到实际的store

export const proxyStore = new Proxy(
  {},
  {
    get(_target, prop: any) {
      const store = getStoreInstance(prop.id);
      if (typeof store[prop] === 'function') {
        return (...args: any) => {
          return store[prop](...args);
        };
      }
      return store[prop];
    },
  },
);

// 监听store 的请求

export const storeRequestRegistry = () => {
  ipcMain.handle(EChannels.storeRequest, async (_event: any, data: any) => {
    const { id, method, params } = data;
    const store = getStoreInstance(id);
    const result = await store[method](params);
    return result;
  });
};
