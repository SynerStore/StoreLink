import fs from 'fs-extra';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { getUserDataPath } from '@/main/utils';

export interface IConnectionsData {
  connections: any[];
}

export const DEFAULT_CONNECTIONS_DATA: IConnectionsData = {
  connections: [],
};

const APP_CONNECTIONS_PATH = path.join(getUserDataPath(), 'connections.json');

let db: Low<IConnectionsData>;

export async function connectionsDBRegistory() {
  if (!fs.existsSync(APP_CONNECTIONS_PATH)) {
    await fs.writeJSON(APP_CONNECTIONS_PATH, DEFAULT_CONNECTIONS_DATA);
  }
  db = new Low(new JSONFile(APP_CONNECTIONS_PATH), DEFAULT_CONNECTIONS_DATA);
  await db.read();
}

export function getConnectionsData(): IConnectionsData {
  return db.data;
}

export async function setConnectionsData(data: IConnectionsData) {
  db.data = data;
  await db.write();
}

export async function updateConnectionsData(data: Partial<IConnectionsData>) {
  db.data = { ...db.data, ...data };
  await db.write();
}
