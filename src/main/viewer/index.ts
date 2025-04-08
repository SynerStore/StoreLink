// 创建一个文件显示窗口管理器
import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import { ViewerWindow } from './window';
import { logger } from '../utils';
import { EChannels } from '../../types';
import { getStoreInstance } from '../stores';

export default class ViewerWindowManager {
  logger = logger.scope('ViewerWindowManager');
  windowsPools = new Map<string, { window: ViewerWindow; data: any }>();

  constructor() {
    this.init();
  }

  init() {
    this.logger.info('ViewerWindowManager init');

    ipcMain.handle(EChannels.openViewer, (_event: any, data: any) => {
      this.logger.info(EChannels.openViewer);
      this.create(data);
    });

    ipcMain.handle(EChannels.getViewerSource, (_event: any, data: any) => {
      return this.getViewerSource(data);
    });
  }

  create(data: any) {
    const id = uuidv4();
    const instance = new ViewerWindow({ id, name: data.name, mime: data.mime });
    instance.id = id;
    this.windowsPools.set(id, { window: instance, data });
  }

  async getViewerSource(id: string) {
    const viewer = this.windowsPools.get(id);
    const store = getStoreInstance(viewer?.data?.connectionId || '');
    const viewerSource = await store.getSourceUrl({
      key: viewer?.data?.key || '',
      bucketName: viewer?.data?.bucketName || '',
      connectionId: viewer?.data?.connectionId || '',
      lastModified: viewer?.data?.lastModified || 0,
    });
    // 获取显示的资源地址
    return {
      src: viewerSource?.data || '',
    };
  }
}
