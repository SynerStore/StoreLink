import { EChannels } from '@/types';
import { useErrorStore } from '@/renderer/store';

export const storeRequest = async (data: Record<string, any>) => {
  if (!window.electronBridge) return;
  try {
    const res = await window.electronBridge.dispatch(EChannels.storeRequest, data);
    if (!res.success) {
      // Check if we should skip global error handling
      // For example, if the caller explicitly requested to handle errors manually
      // Currently assuming all failed requests are errors worth showing unless specified
      
      // We can inspect res.error or res.message
      const errorMessage = res.error || res.message || 'Unknown Error';
      
      // Some operations might return success: false for valid reasons (e.g. checking if file exists)
      // But usually those return specific codes.
      // Let's assume for now we show all errors.
      
      useErrorStore.getState().showError({
        title: 'Operation Failed',
        message: errorMessage,
        details: JSON.stringify(res, null, 2),
      });
    }
    return res;
  } catch (err: any) {
    useErrorStore.getState().showError({
      title: 'System Error',
      message: err.message || 'An unexpected error occurred',
      stack: err.stack,
    });
    return { success: false, error: err };
  }
};

export const storeConnect = async (data: Record<string, any>) => {
  if (!window.electronBridge) return;
  return await window.electronBridge.dispatch(EChannels.storeConnect, data);
};

export const storeRemove = async (id: string) => {
  if (!window.electronBridge) return;
  return await window.electronBridge.dispatch(EChannels.storeRemove, id);
};
