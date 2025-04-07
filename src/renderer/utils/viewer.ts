import { EChannels } from '../../types';

const dispatch = window?.electronBridge?.dispatch;

export const openViewer = (connectionId: string, data: any) => {
  return dispatch(EChannels.openViewer, {
    connectionId,
    ...data,
  });
};

export const getViewerSource = (id: string) => {
  return dispatch(EChannels.getViewerSource, id);
};
