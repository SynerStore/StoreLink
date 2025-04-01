import { ipcMain } from 'electron';

import { EChannels } from '@/types';
import { getStoreInstance, storeConnect, storeRemove } from './storeManage';

// store request 注册
export const storeRequestRegistry = () => {
  ipcMain.handle(EChannels.storeRequest, async (_event: any, data: any) => {
    const { id, method, params } = data;
    const store = getStoreInstance(id);
    const result = await store[method](params);
    return result;
  });

  ipcMain.handle(EChannels.storeConnect, async (_event: any, data: any) => {
    const result = await storeConnect(data);
    return result;
  });

  ipcMain.handle(EChannels.storeRemove, (_event: any, data: any) => {
    storeRemove(data);
  });
};
