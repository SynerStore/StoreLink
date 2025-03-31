import { app, session } from 'electron';
import path from 'path';
import os from 'os';

import Windows from '../windows';
import { storeRequestRegistry } from '../stores';
import eventsRegistry from '../events/registry';
import { dbRegistory } from '../db';
import { logger, isDev } from '../utils';

export default class Core {
  logger = logger.scope('Core');
  windows: Windows | null = null;

  async startApp() {
    try {
      this.logger.info('app start');

      await this.beforeAppReady();
      await app.whenReady();
      await this.afterAppReady();

      this.logger.info('app start success');
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async beforeAppReady() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  private async afterAppReady() {
    this.windows = new Windows(this);
    this.resistry();
    this.installExtension();

    app.on('activate', () => {
      this.windows?.hiddenLaunchWindow();
      this.windows?.showMainWindow();
    });
  }

  private resistry() {
    dbRegistory();
    storeRequestRegistry();
    eventsRegistry();
  }

  private async installExtension() {
    if (isDev) {
      const extendsionPath = path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions');
      const reactDevToolsPath = path.join(extendsionPath, '/fmkadmapgofadopljbjfkapdkoienihi/6.1.1_0');
      const reduxDevToolsPath = path.join(extendsionPath, '/lmhkpmbekcpmknklioeibfkpmmfibljd/3.2.7_0');
      await session.defaultSession.loadExtension(reactDevToolsPath);
      await session.defaultSession.loadExtension(reduxDevToolsPath);
    }
  }

  quitApp() {
    this.logger.info('app quit');
    app.quit();
  }
}
