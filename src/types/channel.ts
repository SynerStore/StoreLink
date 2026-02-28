export enum EChannels {
  // window
  windowMinimize = 'windowMinimize',
  windowClose = 'windowClose',
  windowFullScreen = 'windowFullScreen',
  windowReload = 'windowReload',

  // store
  storeRequest = 'storeRequest',
  storeConnect = 'storeConnect',
  storeRemove = 'storeRemove',

  // tasks
  taskRequest = 'taskRequest',
  taskUpdate = 'taskUpdate',
  taskStats = 'taskStats',

  // events
  eventsX = 'eventsX',

  // viewer
  openViewer = 'openViewer',
  getViewerSource = 'getViewerSource',
  downloadViewerSource = 'downloadViewerSource',

  // app
  getAppVersion = 'getAppVersion',
}

export type ChannelData = {
  channel: EChannels;
  data?: any;
};
