import Store from 'electron-store';

import { getUserDataPath, getDownloadsPath } from '@/main/utils';

export interface ISettingData {
  downloadPath: string;
}

export const DEFAULT_SETTING_DATA: ISettingData = {
  downloadPath: getDownloadsPath(),
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
