import { ipcMain, app } from 'electron';
import * as events from './index';

import { EventData, EChannels } from '../../types';

export default function () {
  // 注册事件
  ipcMain.handle(EChannels.eventsX, (_e, args: EventData) => {
    const { eventName, data } = args;
    const func = events[eventName];
    if (typeof func !== 'function') return;
    return func(data);
  });

  // 获取应用版本
  ipcMain.handle(EChannels.getAppVersion, () => {
    return app.getVersion();
  });
}
