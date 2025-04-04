import fs from 'fs-extra';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { getUserDataPath } from '@/main/utils';

export interface IViewerData {
  activeTab: string;
  tabs: any[];
}

export const DEFAULT_VIEWER_DATA: IViewerData = {
  activeTab: 'home',
  tabs: [], // 连接
};

const APP_VIEWER_PATH = path.join(getUserDataPath(), 'viewer.json');

let db: Low<IViewerData>;

export async function viewerDBRegistory() {
  if (!fs.existsSync(APP_VIEWER_PATH)) {
    await fs.writeJSON(APP_VIEWER_PATH, DEFAULT_VIEWER_DATA);
  }
  db = new Low(new JSONFile(APP_VIEWER_PATH), DEFAULT_VIEWER_DATA);
  await db.read();
}

export function getViewerData(): IViewerData {
  return db.data;
}

export async function setViewerData(data: IViewerData) {
  db.data = data;
  await db.write();
}

export async function updateViewerData(data: Partial<IViewerData>) {
  db.data = { ...db.data, ...data };
  await db.write();
}
