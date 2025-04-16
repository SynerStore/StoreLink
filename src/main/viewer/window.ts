import { BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { isDev } from '../utils';
import { EWindowSize, EPages } from '../../types';
import { BaseWindow } from '../windows/base';
export function getMainWindowOptions(): BrowserWindowConstructorOptions {
  return {
    width: EWindowSize.width - 50,
    height: EWindowSize.height - 50,
    minHeight: EWindowSize.minHeight,
    minWidth: EWindowSize.minWidth,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: {
      y: 12,
      x: 10,
    },
    resizable: true,
    webPreferences: {
      webSecurity: false,
      devTools: isDev,
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  };
}

export class ViewerWindow extends BaseWindow {
  page: EPages = EPages.Viewer;
  id: string | undefined = undefined;
  constructor(query: Record<string, any>) {
    super();
    this.create(getMainWindowOptions(), query);
  }
}
