import { BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { isDev } from '../utils';
import { EWindowSize, EPages } from '../../types';
import { BaseWindow } from './base';
export function getMainWindowOptions(): BrowserWindowConstructorOptions {
  return {
    width: EWindowSize.width,
    height: EWindowSize.height,
    minHeight: EWindowSize.minHeight,
    minWidth: EWindowSize.minWidth,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: {
      y: 12,
      x: 10,
    },
    resizable: true,
    webPreferences: {
      devTools: isDev,
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  };
}

export class MainWindow extends BaseWindow {
  page: EPages = EPages.Main;
  private static instance: MainWindow | null = null;

  constructor() {
    super();
    MainWindow.instance = this;
    this.create(getMainWindowOptions());
  }

  public static getInstance(): MainWindow | null {
    return MainWindow.instance;
  }

  public get window() {
    return this.browserWindow;
  }
}
