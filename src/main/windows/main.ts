import { BrowserWindowConstructorOptions } from 'electron';

import { EWindowSize, EPages } from '../types';
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
  };
}

export class MainWindow extends BaseWindow {
  page: EPages = EPages.Main;
  constructor() {
    super();
    this.create(getMainWindowOptions());
  }
}
