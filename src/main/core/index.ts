import { app, protocol } from 'electron';

import Windows from '../windows';
import ViewerWindowManager from '../viewer';
import { storeRequestRegistry } from '../stores';
import eventsRegistry from '../events/registry';
import { taskRequestRegistry } from '../tasks/manage';
import { logger, isDev, installDevtool } from '../utils';
import { ensureEncryptedPasswordsOnStartup, migrateFromJsonToSqlite } from '../db';
import updateService from '../services/update';

export default class Core {
  logger = logger.scope('Core');
  windows: Windows | null = null;
  viewer: ViewerWindowManager | null = null;

  async startApp() {
    try {
      this.logger.info('app start');
      
      // Log proxy settings for debugging
      if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy) {
        this.logger.info('Proxy environment variables detected:', {
          HTTP_PROXY: process.env.HTTP_PROXY || process.env.http_proxy,
          HTTPS_PROXY: process.env.HTTPS_PROXY || process.env.https_proxy,
          ALL_PROXY: process.env.ALL_PROXY || process.env.all_proxy
        });
      }

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
    // 迁移旧数据到 SQLite（在密码加密之前执行）
    migrateFromJsonToSqlite();
    ensureEncryptedPasswordsOnStartup();
  }

  private async afterAppReady() {
    await this.resistry();
    this.windows = new Windows(this);
    this.viewer = new ViewerWindowManager();
    this.installExtension();
    this.initUpdateService();

    app.on('activate', () => {
      // this.windows?.hiddenLaunchWindow();
      this.windows?.showMainWindow();
    });
  }

  /**
   * 初始化更新服务
   */
  private initUpdateService() {
    updateService.init();
    
    // 启动后静默检查更新
    if (!isDev) {
      setTimeout(() => {
        updateService.checkForUpdates(true);
      }, 3000);
    }
  }

  private async resistry() {
    await storeRequestRegistry();
    await eventsRegistry();
    await taskRequestRegistry();
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
