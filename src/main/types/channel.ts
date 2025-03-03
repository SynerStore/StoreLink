export enum EChannels {
  windowMinimize = 'windowMinimize',
  windowMaximize = 'windowMaximize',
  windowClose = 'windowClose',
}

export type ChannelData = {
  channel: EChannels;
  data?: any;
};
