import { app, protocol } from 'electron';

import Windows from '../windows';
import ViewerWindowManager from '../viewer';
import { storeRequestRegistry } from '../stores';
import eventsRegistry from '../events/registry';
import { logger, isDev, installDevtool } from '../utils';

export default class Core {
  logger = logger.scope('Core');
  windows: Windows | null = null;
  viewer: ViewerWindowManager | null = null;

  async startApp() {
    try {
      this.logger.info('app start');
      await this.beforeAppReady();
      protocol.registerSchemesAsPrivileged([{ scheme: 'localfile', privileges: { bypassCSP: true } }]);
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
    await this.resistry();
    this.windows = new Windows(this);
    this.viewer = new ViewerWindowManager();
    this.installExtension();

    app.on('activate', () => {
      // this.windows?.hiddenLaunchWindow();
      this.windows?.showMainWindow();
    });
  }

  private async resistry() {
    await storeRequestRegistry();
    await eventsRegistry();
  }

  private async installExtension() {
    if (isDev) {
      await installDevtool();
    }
  }

  quitApp() {
    this.logger.info('app quit');
    app.quit();
  }
}
