import Store from 'electron-store';

import { getUserDataPath, getDownloadsPath } from '@/main/utils';

// 表格列宽配置
export interface ColumnWidthConfig {
  size?: number;
  lastModified?: number;
  storageClass?: number;
}

// 各存储类型的列宽配置
export interface TableColumnWidths {
  s3?: ColumnWidthConfig;
  oss?: ColumnWidthConfig;
  cos?: ColumnWidthConfig;
  local?: ColumnWidthConfig;
  sftp?: ColumnWidthConfig;
  webdav?: ColumnWidthConfig;
  synology?: ColumnWidthConfig;
}

export interface ISettingData {
  downloadPath: string;
  lang: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark' | 'system';
  siderWidth?: number;
  systemNotification?: boolean;
  tableColumnWidths?: TableColumnWidths;
}

export const DEFAULT_SETTING_DATA: ISettingData = {
  downloadPath: getDownloadsPath(),
  lang: 'zh-CN',
  theme: 'light',
};

// 应用配置
export const settingStore = new Store<ISettingData>({
  name: 'setting',
  cwd: getUserDataPath(),
  defaults: DEFAULT_SETTING_DATA,
});

export function getSettingData(): ISettingData {
  // @ts-ignore
  return settingStore.store;
}

export async function setSettingData(data: Partial<ISettingData>) {
  // @ts-ignore
  settingStore.store = {
    // @ts-ignore
    ...settingStore.store,
    ...data,
  };
}
