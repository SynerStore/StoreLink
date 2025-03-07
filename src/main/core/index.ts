import { app } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

import Windows from '../windows';
import { storeRequestRegistry } from '../stores';
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
    // this.installExtension();

    app.on('activate', () => {
      this.windows?.hiddenLaunchWindow();
      this.windows?.showMainWindow();
    });
  }

  private resistry() {
    storeRequestRegistry();
  }

  private async installExtension() {
    if (isDev) {
      await installExtension([REACT_DEVELOPER_TOOLS.id, REDUX_DEVTOOLS.id]);
    }
  }

  quitApp() {
    this.logger.info('app quit');
    app.quit();
  }
}
