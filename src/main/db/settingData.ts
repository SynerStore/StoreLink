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

const APP_CONFIG_PATH = path.join(getUserDataPath(), 'setting.json');

let db: Low<ISettingData>;

export async function settingDBRegistory() {
  if (!fs.existsSync(APP_CONFIG_PATH)) {
    await fs.writeJSON(APP_CONFIG_PATH, DEFAULT_CONFIG_DATA);
  }
  db = new Low(new JSONFile(APP_CONFIG_PATH), DEFAULT_CONFIG_DATA);
  await db.read();
}

export function getSettingData(): ISettingData {
  return db.data;
}

export async function setSettingData(data: ISettingData) {
  db.data = data;
  await db.write();
}

export async function updateSettingData(data: Partial<ISettingData>) {
  db.data = { ...db.data, ...data };
  await db.write();
}
