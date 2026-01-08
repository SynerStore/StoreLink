import { EChannels } from '@/types';
// import { ETaskType } from '@/main/tasks/entity';

export const taskRequest = async (action: string, params: any) => {
  if (!window.electronBridge) return;
  return await window.electronBridge.dispatch(EChannels.taskRequest, { action, params });
};

export const createTask = async (type: any, connectionId: string, method: string, params: any, size: number = 0) => {
  return await taskRequest('create', {
    type,
    connectionId,
    method,
    params,
    size,
  });
};
