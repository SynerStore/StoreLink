import { BrowserWindowConstructorOptions } from 'electron';

import { EWindowSize, EPages } from '../types';
import { BaseWindow } from './base';
export function getLaunchWindowOptions(): BrowserWindowConstructorOptions {
  return {
    width: EWindowSize.width,
    height: EWindowSize.height,
    titleBarStyle: 'hidden',
    resizable: false,
  };
}

export class LaunchWindow extends BaseWindow {
  page: EPages = EPages.Launch;
  constructor() {
    super();

    this.create(getLaunchWindowOptions());
  }
}
