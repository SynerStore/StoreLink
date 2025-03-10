import fs from 'fs-extra';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { getUserDataPath } from '@/main/utils';

export interface IConfigData {
  connections: any[];
}

export const DEFAULT_CONFIG_DATA: IConfigData = {
  connections: [],
};

export const USER_DATA_PATH = getUserDataPath();
export const APP_CONFIG_PATH = path.join(USER_DATA_PATH, 'config.json');

let confDB: Low<IConfigData>;

export async function dbRegistory() {
  fs.ensureFileSync(APP_CONFIG_PATH);

  const adapter = new JSONFile<IConfigData>(APP_CONFIG_PATH);
  confDB = new Low(adapter, DEFAULT_CONFIG_DATA);
  await confDB.read();
}

export function getConfData(): IConfigData {
  return confDB.data;
}

export async function setConfData(data: IConfigData) {
  confDB.data = data;
  await confDB.write();
}
