import { useState, useEffect, useCallback } from 'react';
import { UpdateInfo, UpdateProgress, EUpdateStatus, EUpdateChannels } from '@/types/update';

/**
 * 版本更新 Hook
 */
export function useUpdate() {
  const [status, setStatus] = useState<EUpdateStatus>(EUpdateStatus.IDLE);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>();
  const [progress, setProgress] = useState<UpdateProgress | undefined>();
  const [error, setError] = useState<string | undefined>();

  // 监听状态变化
  useEffect(() => {
    const handleStatusChanged = (_event: any, state: any) => {
      setStatus(state.status);
      setUpdateInfo(state.updateInfo);
      setProgress(state.progress);
      setError(state.error);
    };

    // @ts-ignore
    window.electronBridge?.on(EUpdateChannels.STATUS_CHANGED, handleStatusChanged);

    // 获取初始状态
    // @ts-ignore
    window.electronBridge?.dispatch(EUpdateChannels.GET_STATUS).then((state: any) => {
      setStatus(state.status);
      setUpdateInfo(state.updateInfo);
      setProgress(state.progress);
      setError(state.error);
    });

    return () => {
      // @ts-ignore
      window.electronBridge?.removeListener(EUpdateChannels.STATUS_CHANGED, handleStatusChanged);
    };
  }, []);

  /**
   * 检查更新
   */
  const checkForUpdates = useCallback(async (silent: boolean = false) => {
    setError(undefined);
    // @ts-ignore
    return await window.electronBridge?.dispatch(EUpdateChannels.CHECK_UPDATE, silent);
  }, []);

  /**
   * 开始下载
   */
  const startDownload = useCallback(async () => {
    setError(undefined);
    // @ts-ignore
    return await window.electronBridge?.dispatch(EUpdateChannels.START_DOWNLOAD);
  }, []);

  /**
   * 安装更新
   */
  const installUpdate = useCallback(async () => {
    setError(undefined);
    // @ts-ignore
    return await window.electronBridge?.dispatch(EUpdateChannels.INSTALL_UPDATE);
  }, []);

  return {
    status,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    startDownload,
    installUpdate,
    // 状态判断
    isIdle: status === EUpdateStatus.IDLE,
    isChecking: status === EUpdateStatus.CHECKING,
    hasUpdate: status === EUpdateStatus.AVAILABLE,
    isNoUpdate: status === EUpdateStatus.NO_UPDATE,
    isDownloading: status === EUpdateStatus.DOWNLOADING,
    isDownloaded: status === EUpdateStatus.DOWNLOADED,
    isInstalling: status === EUpdateStatus.INSTALLING,
    hasError: status === EUpdateStatus.ERROR,
  };
}

export default useUpdate;
