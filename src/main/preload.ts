import { contextBridge, webUtils, ipcRenderer } from 'electron';
import os from 'os';

import dispatch from './dispatch';
const apiKey = 'electronBridge';

const listeners = new Map<string, Map<Function, Function>>();

try {
  const api: any = {
    platform: os.platform(),
    versions: process.versions,
    dispatch: dispatch,
    getPathForFile: webUtils.getPathForFile,
    on: (channel: string, listener: (...args: any[]) => void) => {
      const wrapped = (_event: any, ...args: any[]) => listener(...args);
      if (!listeners.has(channel)) {
        listeners.set(channel, new Map());
      }
      listeners.get(channel)!.set(listener, wrapped);
      ipcRenderer.on(channel, wrapped);
    },
    removeListener: (channel: string, listener: (...args: any[]) => void) => {
      const channelListeners = listeners.get(channel);
      if (channelListeners && channelListeners.has(listener)) {
        const wrapped = channelListeners.get(listener);
        ipcRenderer.removeListener(channel, wrapped as any);
        channelListeners.delete(listener);
      }
    },
  };

  contextBridge.exposeInMainWorld(apiKey, api);
} catch (err) {
  console.error(err);
}
