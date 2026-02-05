import { ipcMain } from 'electron';

import { EChannels, ETaskType, ETaskStatus } from '@/types';
import { getStoreInstance, storeConnect, storeRemove } from './storeManage';
import TaskManager from '@/main/tasks/manage';
import { logAction } from '@/main/events/log';

export * from './storeManage';
export * from './adapters/store';

// store request 注册
export const storeRequestRegistry = () => {
  ipcMain.handle(EChannels.storeRequest, async (_event: any, data: any) => {
    const { id, method, params } = data;

    // Methods that should be handled as background tasks
    const taskTypeMap: Record<string, ETaskType> = {
      get: ETaskType.DOWNLOAD,
      put: ETaskType.UPLOAD,
      delete: ETaskType.DELETE,
      deleteMulti: ETaskType.DELETE,
      putFolder: ETaskType.CREATE_DIR,
      rename: ETaskType.RENAME,
      copy: ETaskType.COPY,
      transfer: ETaskType.TRANSFER,
    };

    if (taskTypeMap[method]) {
      const manager = TaskManager.getInstance();
      const task = await manager.createTask({
        type: taskTypeMap[method],
        connectionId: id,
        method: method,
        params: params,
        size: 0,
        status: ETaskStatus.PENDING,
      });
      return { code: 0, msg: 'Task started', data: task };
    }

    const store = getStoreInstance(id);
    logAction({
      action: 'store_request',
      message: `${method} executed`,
      meta: { connectionId: id, method, params },
    });
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
