import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'fs-extra';
import { app } from 'electron';

import { getUserDataPath } from '@/main/utils';

const dbPath = path.join(getUserDataPath(), 'database.sqlite');

// Ensure the directory exists
fs.ensureDirSync(path.dirname(dbPath));

const db = new Database(dbPath);

// Create tasks table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    taskId TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    connectionId TEXT NOT NULL,
    method TEXT NOT NULL,
    params TEXT,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    speed INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    startTime TEXT,
    endTime TEXT,
    createTime TEXT NOT NULL,
    errorMessage TEXT
  )
`);

export default db;
