import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'fs-extra';

import { getUserDataPath } from '@/main/utils';

const dbPath = path.join(getUserDataPath(), 'database.sqlite');

// Ensure the directory exists
fs.ensureDirSync(path.dirname(dbPath));

const db = new DatabaseSync(dbPath);

// Create tasks table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    taskId TEXT PRIMARY KEY,
    parentId TEXT,
    type TEXT NOT NULL,
    connectionId TEXT NOT NULL,
    method TEXT NOT NULL,
    params TEXT,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    speed INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 0,
    executionPolicy TEXT,
    checkpoint TEXT,
    startTime TEXT,
    endTime TEXT,
    createTime TEXT NOT NULL,
    errorMessage TEXT,
    errorStack TEXT
  )
`);

// Migration for new columns
[
  'ALTER TABLE tasks ADD COLUMN parentId TEXT',
  'ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 0',
  'ALTER TABLE tasks ADD COLUMN executionPolicy TEXT',
  'ALTER TABLE tasks ADD COLUMN checkpoint TEXT',
  'ALTER TABLE tasks ADD COLUMN errorStack TEXT'
].forEach(sql => {
  try {
    db.exec(sql);
  } catch (err) {
    // Column likely already exists
  }
});

// Create index for status and createTime to optimize task list queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_tasks_status_createTime 
  ON tasks(status, createTime DESC)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_tasks_parentId 
  ON tasks(parentId)
`);

export default db;
