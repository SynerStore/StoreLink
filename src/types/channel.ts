export enum EChannels {
  // window
  windowMinimize = 'windowMinimize',
  windowClose = 'windowClose',
  windowFullScreen = 'windowFullScreen',

  // store
  storeRequest = 'storeRequest',

  // events
  eventsX = 'eventsX',
}

export type ChannelData = {
  channel: EChannels;
  data?: any;
};
