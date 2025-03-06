// 控制所有的窗口的创建，销毁，最小化，最大化，全屏，隐藏，显示等操作
// 带有一个 窗口池 来进行窗口实例的存储和查找

import { BrowserWindow, ipcMain } from 'electron';

import { EPages, EChannels } from '../../types';
import { BaseWindow } from './base';
import { MainWindow } from './main';
import { logger } from '../utils';
import Core from '../core';

export default class Windows {
  logger = logger.scope('Windows');
  windowsPools = new Map<EPages, BaseWindow>();
  private RegisterWindows = [MainWindow];
  private core: Core;
  constructor(core: Core) {
    this.core = core;
    this.init();
  }

  init() {
    this.RegisterWindows.forEach((WindowClass) => {
      const instance = new WindowClass();
      this.windowsPools.set(instance.page, instance);
    });

    // events
    ipcMain.on(EChannels.windowClose, (event) => {
      this.logger.info(EChannels.windowClose);
      const { sender } = event;

      const mainWindow = this.getBrowserWindow(EPages.Main);
      if (sender.id === mainWindow?.id) {
        this.core.quitApp();
      } else {
        const browserWindow = BrowserWindow.fromWebContents(sender);
        browserWindow?.closable && browserWindow.close();
      }
    });

    ipcMain.on(EChannels.windowMaximize, (event) => {
      this.logger.info(EChannels.windowMaximize);
      const { sender } = event;
      const browserWindow = BrowserWindow.fromWebContents(sender);
      if (browserWindow?.maximizable) {
        if (browserWindow.isMaximized()) {
          browserWindow.unmaximize();
        } else {
          browserWindow.maximize();
        }
      }
    });

    ipcMain.on(EChannels.windowMinimize, (event) => {
      this.logger.info(EChannels.windowMinimize);
      const { sender } = event;
      const browserWindow = BrowserWindow.fromWebContents(sender);
      browserWindow?.minimizable && browserWindow.minimize();
    });
  }

  getWindowInstance(page: EPages) {
    return this.windowsPools.get(page) || null;
  }

  getBrowserWindow(page: EPages) {
    const windowInstance = this.getWindowInstance(page);
    return windowInstance?.browserWindow || null;
  }

  showMainWindow() {
    const mainWindow = this.getWindowInstance(EPages.Main);
    if (mainWindow) {
      mainWindow.show();
    }
  }

  hiddenMainWindow() {
    const mainWindow = this.getWindowInstance(EPages.Main);
    if (mainWindow) {
      mainWindow.show();
    }
  }

  hiddenLaunchWindow() {
    const launchWindow = this.getWindowInstance(EPages.Launch);
    if (launchWindow) {
      launchWindow.hidden();
    }
  }
}
