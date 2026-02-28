/**
 * 版本更新服务
 * 
 * 使用 GitHub Releases 作为版本检测源
 * 无需自建服务器
 */

import { ipcMain } from 'electron';
import axios from 'axios';
import { logger } from '../utils';
import { UpdateInfo, UpdateProgress, EUpdateStatus, EUpdateChannels } from '../../types/update';

class UpdateService {
  private logger = logger.scope('UpdateService');
  
  // 当前更新状态
  private state: {
    status: EUpdateStatus;
    updateInfo?: UpdateInfo;
    progress?: UpdateProgress;
    error?: string;
  } = {
    status: EUpdateStatus.IDLE,
  };

  /**
   * GitHub 仓库配置
   * 修改这里为你自己的仓库
   * 格式: owner/repo
   */
  private githubRepo = 'your-username/your-repo';

  /**
   * 初始化更新服务
   */
  init() {
    this.registerIpcHandlers();
    this.logger.info('Update service initialized');
  }

  /**
   * 注册 IPC 事件处理
   */
  private registerIpcHandlers() {
    // 检查更新
    ipcMain.handle(EUpdateChannels.CHECK_UPDATE, async (_event, silent: boolean = true) => {
      return this.checkForUpdates(silent);
    });

    // 开始下载
    ipcMain.handle(EUpdateChannels.START_DOWNLOAD, async () => {
      return this.downloadUpdate();
    });

    // 安装更新
    ipcMain.handle(EUpdateChannels.INSTALL_UPDATE, async () => {
      return this.installUpdate();
    });

    // 获取当前状态
    ipcMain.handle(EUpdateChannels.GET_STATUS, async () => {
      return this.getStatus();
    });
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return { ...this.state };
  }

  /**
   * 获取版本号
   */
  getVersion() {
    return this.state.updateInfo?.version;
  }

  /**
   * 更新状态
   */
  private setState(partial: Partial<typeof this.state>) {
    this.state = { ...this.state, ...partial };
  }

  /**
   * 检查更新
   */
  async checkForUpdates(silent: boolean = true): Promise<{ hasUpdate: boolean; updateInfo?: UpdateInfo }> {
    this.logger.info('Checking for updates...');
    this.setState({ status: EUpdateStatus.CHECKING, error: undefined });

    try {
      // 获取本地版本
      const currentVersion = require('../../../package.json').version;
      this.logger.info(`Current version: ${currentVersion}`);

      // 从服务器获取最新版本信息
      // 这里需要配置你的版本检测服务器
      const updateInfo = await this.fetchLatestVersion();
      
      if (!updateInfo) {
        this.setState({ status: EUpdateStatus.NO_UPDATE });
        return { hasUpdate: false };
      }

      // 比较版本
      const hasUpdate = this.compareVersion(currentVersion, updateInfo.version);
      
      if (hasUpdate) {
        this.setState({
          status: EUpdateStatus.AVAILABLE,
          updateInfo,
        });
        
        // 如果不是静默检查，通知用户
        if (!silent) {
          this.logger.info(`New version available: ${updateInfo.version}`);
        }
      } else {
        this.setState({ status: EUpdateStatus.NO_UPDATE });
      }

      return { hasUpdate, updateInfo };
    } catch (error: any) {
      this.logger.error('Failed to check updates:', error);
      this.setState({
        status: EUpdateStatus.ERROR,
        error: error.message || '检查更新失败',
      });
      
      if (!silent) {
        return { hasUpdate: false, updateInfo: undefined };
      }
      
      // 静默检查失败不提示用户
      return { hasUpdate: false };
    }
  }

  /**
   * 从 GitHub Releases 获取最新版本信息
   * 无需自建服务器，完全依赖 GitHub
   */
  private async fetchLatestVersion(): Promise<UpdateInfo | null> {
    try {
      this.logger.info(`Checking GitHub releases: ${this.githubRepo}`);
      
      const response = await axios.get(`https://api.github.com/repos/${this.githubRepo}/releases/latest`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.data) {
        const latestVersion = response.data.tag_name?.replace(/^v/, '') || response.data.name;
        
        // 查找 dmg 或 exe 安装包
        const asset = response.data.assets?.find((a: any) => 
          a.name?.endsWith('.dmg') || a.name?.endsWith('.exe') || a.name?.endsWith('.zip')
        );

        return {
          version: latestVersion,
          releaseDate: response.data.published_at,
          releaseNotes: response.data.body || response.data.html_url || '',
          size: asset?.size,
          downloadUrl: asset?.browser_download_url,
        };
      }

      return null;
    } catch (error: any) {
      this.logger.error('Failed to fetch latest version from GitHub:', error?.message || error);
      
      // 开发环境返回模拟数据用于测试
      if (process.env.NODE_ENV === 'development') {
        return this.getMockUpdateInfo();
      }
      
      return null;
    }
  }

  /**
   * 开发环境模拟数据
   */
  private getMockUpdateInfo(): UpdateInfo {
    const currentVersion = require('../../../package.json').version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const nextVersion = `${major}.${minor}.${parseInt(String(patch)) + 1}`;
    
    return {
      version: nextVersion,
      releaseDate: new Date().toISOString(),
      releaseNotes: `# 新版本 ${nextVersion} 更新日志\n\n- 优化了性能\n- 修复了已知问题\n- 改进了用户体验`,
      size: 1024 * 1024 * 150, // 150MB
    };
  }

  /**
   * 比较版本号
   * 返回 true 表示有新版本
   */
  private compareVersion(current: string, latest: string): boolean {
    const currentParts = current.replace(/[^0-9.]/g, '').split('.').map(Number);
    const latestParts = latest.replace(/[^0-9.]/g, '').split('.').map(Number);

    const maxLength = Math.max(currentParts.length, latestParts.length);

    for (let i = 0; i < maxLength; i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;

      if (latestPart > currentPart) {
        return true;
      }
      if (latestPart < currentPart) {
        return false;
      }
    }

    return false;
  }

  /**
   * 下载更新
   */
  async downloadUpdate(): Promise<{ success: boolean; error?: string }> {
    if (!this.state.updateInfo?.downloadUrl) {
      return { success: false, error: '没有可用的下载链接' };
    }

    this.logger.info('Starting download update...');
    this.setState({ status: EUpdateStatus.DOWNLOADING });

    try {
      // 使用 electron-updater 的逻辑
      // 这里简化处理，实际可以使用 electron-updater 或自行实现下载
      await this.downloadFile(
        this.state.updateInfo.downloadUrl,
        (progress) => {
          this.setState({
            progress: {
              transferred: progress.transferred,
              total: progress.total,
              percent: Math.round((progress.transferred / progress.total) * 100),
              bytesPerSecond: progress.bytesPerSecond,
            },
          });
        }
      );

      this.setState({ status: EUpdateStatus.DOWNLOADED });
      return { success: true };
    } catch (error: any) {
      this.logger.error('Failed to download update:', error);
      this.setState({
        status: EUpdateStatus.ERROR,
        error: error.message || '下载更新失败',
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * 下载文件（带进度）
   */
  private async downloadFile(url: string, onProgress: (progress: any) => void): Promise<void> {
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
      timeout: 300000, // 5分钟超时
    });

    const totalLength = parseInt(response.headers['content-length'] || '0', 10);
    let downloaded = 0;

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk: any) => {
        downloaded += chunk.length;
        onProgress({
          transferred: downloaded,
          total: totalLength,
          bytesPerSecond: 0, // 可以计算速度
        });
      });

      response.data.on('end', () => {
        resolve();
      });

      response.data.on('error', (err: any) => {
        reject(err);
      });
    });
  }

  /**
   * 安装更新
   * 注意：实际项目中建议使用 electron-updater 来处理
   */
  async installUpdate(): Promise<{ success: boolean; error?: string }> {
    this.logger.info('Installing update...');
    this.setState({ status: EUpdateStatus.INSTALLING });

    try {
      // 这里可以集成 electron-updater
      // const { autoUpdater } = require('electron-updater');
      // autoUpdater.quitAndInstall(false, true);
      
      // 或者使用简单的命令行方式启动安装程序
      
      return { success: true };
    } catch (error: any) {
      this.logger.error('Failed to install update:', error);
      this.setState({
        status: EUpdateStatus.ERROR,
        error: error.message || '安装更新失败',
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * 设置 GitHub 仓库地址
   * 格式: owner/repo
   * 例如: chrissong1994/StoreLink
   */
  setGithubRepo(repo: string) {
    this.githubRepo = repo;
  }
}

export default new UpdateService();
