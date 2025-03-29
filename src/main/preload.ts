import { contextBridge, webUtils } from 'electron';
import os from 'os';

import dispatch from './dispatch';
const apiKey = 'electronBridge';

try {
  const api: any = {
    platform: os.platform(),
    versions: process.versions,
    dispatch: dispatch,
    getPathForFile: webUtils.getPathForFile,
  };

  contextBridge.exposeInMainWorld(apiKey, api);
} catch (err) {
  console.error(err);
}
