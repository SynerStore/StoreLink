import { BrowserWindow, shell } from 'electron';
import { merge } from 'lodash';

import { EPages } from '../../types';
import { getPageUrl, isDev } from '../utils';

export const DefaultConfig = {
  frame: false,
  show: false,
  webPreferences: {
    devTools: isDev,
    nodeIntegration: true,
    enableRemoteModule: true,
    contextIsolation: false,
  },
};

export class BaseWindow {
  browserWindow: BrowserWindow | null = null;
  page: EPages | null = null;
  constructor() {}

  show() {
    this.browserWindow?.show();
  }

  hidden() {
    this.browserWindow?.hide();
  }

  create(options?: Electron.BrowserWindowConstructorOptions) {
    if (this.browserWindow && !this.browserWindow.isDestroyed()) {
      this.browserWindow.show();
      this.browserWindow.focus();
    } else {
      this.browserWindow = new BrowserWindow(merge({}, DefaultConfig, options));

      this.browserWindow.loadURL(getPageUrl(this.page as EPages));

      this.browserWindow.on('ready-to-show', () => {
        this.browserWindow?.show();
      });

      this.browserWindow.webContents.on('will-navigate', (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
      });

      this.browserWindow.on('close', () => {
        this.browserWindow = null;
      });
    }

    return this.browserWindow;
  }

  destory() {}

  isFullScreen() {
    return this.browserWindow?.isFullScreen();
  }
}
