import { EChannels } from '@/types';

export const storeRequest = async (data: Record<string, any>) => {
  if (!window.electronBridge) return;
  return await window.electronBridge.dispatch(EChannels.storeRequest, data);
};

export const storeConnect = async (data: Record<string, any>) => {
  if (!window.electronBridge) return;
  return await window.electronBridge.dispatch(EChannels.storeConnect, data);
};
