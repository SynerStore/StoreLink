import fs from 'fs-extra';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { getUserDataPath, getDownloadsPath } from '@/main/utils';

export interface ISettingData {
  downloadPath: string;
}

export const DEFAULT_CONFIG_DATA: ISettingData = {
  downloadPath: getDownloadsPath(),
};

export const USER_DATA_PATH = getUserDataPath();
export const APP_CONFIG_PATH = path.join(USER_DATA_PATH, 'setting.json');

let confDB: Low<ISettingData>;

export async function dbRegistory() {
  fs.ensureFileSync(APP_CONFIG_PATH);

  const adapter = new JSONFile<ISettingData>(APP_CONFIG_PATH);
  confDB = new Low(adapter, DEFAULT_CONFIG_DATA);
  await confDB.read();
}

export function getSettingData(): ISettingData {
  return confDB.data;
}

export async function setSettingData(data: ISettingData) {
  confDB.data = data;
  await confDB.write();
}

export async function updateSettingData(data: Partial<ISettingData>) {
  confDB.data = { ...confDB.data, ...data };
  await confDB.write();
}
