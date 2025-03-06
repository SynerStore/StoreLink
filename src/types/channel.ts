export enum EChannels {
  // window
  windowMinimize = 'windowMinimize',
  windowMaximize = 'windowMaximize',
  windowClose = 'windowClose',
  windowFullScreen = 'windowFullScreen',
  windowUnFullScreen = 'windowUnFullScreen',

  // store
  storeRequest = 'storeRequest',
}

export type ChannelData = {
  channel: EChannels;
  data?: any;
};
