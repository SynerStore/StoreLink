export enum EChannels {
  // window
  windowMinimize = 'windowMinimize',
  windowClose = 'windowClose',
  windowFullScreen = 'windowFullScreen',

  // store
  storeRequest = 'storeRequest',
  storeConnect = 'storeConnect',
  storeRemove = 'storeRemove',

  // events
  eventsX = 'eventsX',

  // viewer
  openViewer = 'openViewer',
  getViewerSource = 'getViewerSource',
}

export type ChannelData = {
  channel: EChannels;
  data?: any;
};
