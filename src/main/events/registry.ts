import { ipcMain } from 'electron';
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
}
