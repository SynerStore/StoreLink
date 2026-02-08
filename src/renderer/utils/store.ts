import { EChannels } from '@/types';
import { useErrorStore } from '@/renderer/store';
import i18n from '@/renderer/i18n';

export const storeRequest = async (data: Record<string, any>) => {
  if (!window.electronBridge) {
    return {
      success: false,
      message: i18n.t('errors.bridgeNotAvailable'),
      code: -1,
      data: null,
    };
  }
  try {
    const res = await window.electronBridge.dispatch(EChannels.storeRequest, data);
    if (!res || !res.success) {
      // 检查是否应该跳过全局错误处理
      // 例如，如果调用者明确要求手动处理错误
      // 目前假设所有失败的请求都是值得显示的错误，除非另有说明

      // 我们可以检查 res.error 或 res.message
      const errorMessage = res?.error || res?.message || i18n.t('errors.unknownError');

      // 某些操作可能会因为正当理由返回 success: false（例如检查文件是否存在）
      // 但通常这些操作会返回特定的代码。
      // 目前让我们假设显示所有错误。

      useErrorStore.getState().showError({
        title: i18n.t('errors.operationFailed'),
        message: errorMessage,
        details: JSON.stringify(res, null, 2),
      });
      // 确保即使 res 为 null/undefined 也返回一个对象
      return res || { success: false, message: i18n.t('errors.noResponse') };
    }
    return res;
  } catch (err: any) {
    useErrorStore.getState().showError({
      title: i18n.t('errors.systemError'),
      message: err.message || i18n.t('errors.unexpected'),
      stack: err.stack,
    });
    return { success: false, error: err };
  }
};

export const storeConnect = async (data: Record<string, any>) => {
  if (!window.electronBridge) {
    return { success: false, message: i18n.t('errors.bridgeNotAvailable') };
  }
  return await window.electronBridge.dispatch(EChannels.storeConnect, data);
};

export const storeRemove = async (id: string) => {
  if (!window.electronBridge) {
    return { success: false, message: i18n.t('errors.bridgeNotAvailable') };
  }
  return await window.electronBridge.dispatch(EChannels.storeRemove, id);
};
