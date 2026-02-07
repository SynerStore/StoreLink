import { EChannels } from '../../types';

const dispatch = window?.electronBridge?.dispatch;

export const winMinimize = () => {
  return dispatch(EChannels.windowMinimize);
};

export const winClose = () => {
  return dispatch(EChannels.windowClose);
};

export const winFullScreen = () => {
  return dispatch(EChannels.windowFullScreen);
};

export const winReload = () => {
  return dispatch(EChannels.windowReload);
};
