import { BrowserWindow, shell } from 'electron';
import { merge } from 'lodash';

import { EPages } from '../../types';
import { getPageUrl, isDev } from '../utils';

export const DefaultConfig = {
  frame: false,
  show: false,
  webPreferences: {
    devTools: isDev,
    contextIsolation: true,
  },
};

export class BaseWindow {
  public browserWindow: BrowserWindow | null = null;
  public page: EPages | null = null;
  public options: Electron.BrowserWindowConstructorOptions | null = null;
  constructor() {}

  show() {
    this.create(this.options as Electron.BrowserWindowConstructorOptions);
  }

  hidden() {
    this.browserWindow?.hide();
  }

  create(options?: Electron.BrowserWindowConstructorOptions, query?: Record<string, any>) {
    this.options = options as Electron.BrowserWindowConstructorOptions;
    if (this.browserWindow && !this.browserWindow.isDestroyed()) {
      this.browserWindow.show();
      this.browserWindow.focus();
    } else {
      this.browserWindow = new BrowserWindow(merge({}, DefaultConfig, options));

      this.browserWindow.loadURL(getPageUrl(this.page as EPages, query));

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

    if (options?.webPreferences?.devTools) {
      this.browserWindow.webContents.openDevTools();
    }

    return this.browserWindow;
  }

  destory() {}

  isFullScreen() {
    return this.browserWindow?.isFullScreen();
  }
}
