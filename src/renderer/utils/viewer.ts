import { isCanOpenFile } from '@/utils';
import { EChannels } from '../../types';

const dispatch = window?.electronBridge?.dispatch;

export const openViewer = (connectionId: string, data: any) => {
  if (!isCanOpenFile(data.mime)) {
    return Promise.reject(new Error('该文件类型不支持预览'));
  }
  return dispatch(EChannels.openViewer, {
    connectionId,
    ...data,
  });
};

export const getViewerSource = (id: string) => {
  return dispatch(EChannels.getViewerSource, id);
};

export const downloadViewerSource = (id: string, data: { src: string; localPath: string }) => {
  return dispatch(EChannels.downloadViewerSource, { id, ...data });
};
