import { contextBridge, webUtils } from 'electron';
import os from 'os';

import dispatch from './dispatch';
const apiKey = 'electronBridge';

const api: any = {
  platform: os.platform(),
  versions: process.versions,
  dispatch: dispatch,
  getPathForFile: webUtils.getPathForFile,
};

contextBridge.exposeInMainWorld(apiKey, api);
