export enum EChannels {
  // window
  windowMinimize = 'windowMinimize',
  windowClose = 'windowClose',
  windowFullScreen = 'windowFullScreen',

  // store
  storeRequest = 'storeRequest',
  storeConnect = 'storeConnect',
  storeRemove = 'storeRemove',

  // tasks
  taskRequest = 'taskRequest',
  taskUpdate = 'taskUpdate',

  // events
  eventsX = 'eventsX',

  // viewer
  openViewer = 'openViewer',
  getViewerSource = 'getViewerSource',
  downloadViewerSource = 'downloadViewerSource',
}

export type ChannelData = {
  channel: EChannels;
  data?: any;
};
