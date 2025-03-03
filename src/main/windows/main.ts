import { BrowserWindowConstructorOptions } from 'electron';

import { EWindowSize, EPages } from '../types';
import { BaseWindow } from './base';
export function getMainWindowOptions(): BrowserWindowConstructorOptions {
  return {
    width: EWindowSize.width,
    height: EWindowSize.height,
    titleBarStyle: 'hidden',
    resizable: false,
  };
}

export class MainWindow extends BaseWindow {
  page: EPages = EPages.Main;
  constructor() {
    super();
    this.create(getMainWindowOptions());
  }
}
