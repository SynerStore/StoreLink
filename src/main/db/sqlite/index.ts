import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'fs-extra';

import { getUserDataPath } from '@/main/utils';
import { encryptPassword, encryptPasswordWithSecret, isEncrypted, decryptPassword, verifySystemAuth } from '@/main/utils/secret';
import { errorLogger } from '@/main/utils/logger';

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

// Create connections table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    brand TEXT,
    name TEXT NOT NULL,
    config TEXT NOT NULL,
    isCollected INTEGER DEFAULT 0,
    createDate TEXT,
    updateDate TEXT
  )
`);

// Create index for isCollected
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_connections_isCollected
  ON connections(isCollected)
`);

// ============ Connections API ============

const SENSITIVE_KEYS = ['password', 'secretAccessKey', 'accessKeySecret', 'privateKey', 'passphrase'];

function encryptConnectionConfig(config: Record<string, any>): Record<string, any> {
  const cfg = { ...config };
  SENSITIVE_KEYS.forEach((k) => {
    const v = cfg[k];
    if (v && typeof v === 'string' && !isEncrypted(v)) {
      try {
        cfg[`${k}Length`] = v.length;
        cfg[k] = encryptPassword(v);
      } catch (_e) {}
    }
  });
  return cfg;
}

function decryptConnectionConfig(config: Record<string, any>): Record<string, any> {
  const cfg = { ...config };
  SENSITIVE_KEYS.forEach((k) => {
    const v = cfg[k];
    if (v && typeof v === 'string' && isEncrypted(v)) {
      try {
        cfg[k] = decryptPassword(v);
      } catch (e: any) {
        errorLogger.error('Decrypt config failed:', k, e?.message || e);
      }
    }
  });
  return cfg;
}

export interface ConnectionRecord {
  id: string;
  type: string;
  brand: string;
  name: string;
  config: Record<string, any>;
  isCollected: boolean;
  createDate: string;
  updateDate: string;
}

export interface IConnectionsData {
  connections: ConnectionRecord[];
}

export function getConnectionsData(): IConnectionsData {
  const stmt = db.prepare('SELECT * FROM connections ORDER BY isCollected DESC, createDate DESC');
  const rows = stmt.all() as any[];
  const connections = rows.map(row => ({
    id: row.id,
    type: row.type,
    brand: row.brand,
    name: row.name,
    config: JSON.parse(row.config),
    isCollected: !!row.isCollected,
    createDate: row.createDate,
    updateDate: row.updateDate,
  }));
  return { connections };
}

export function getConnectionById(id: string): ConnectionRecord | undefined {
  const stmt = db.prepare('SELECT * FROM connections WHERE id = ?');
  const row = stmt.get(id) as any;
  if (!row) return undefined;
  return {
    id: row.id,
    type: row.type,
    brand: row.brand,
    name: row.name,
    config: JSON.parse(row.config),
    isCollected: !!row.isCollected,
    createDate: row.createDate,
    updateDate: row.updateDate,
  };
}

export function addConnection(connections: ConnectionRecord[]): void {
  const stmt = db.prepare(`
    INSERT INTO connections (id, type, brand, name, config, isCollected, createDate, updateDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const conn of connections) {
    const encryptedConfig = encryptConnectionConfig(conn.config || {});
    stmt.run(
      conn.id,
      conn.type,
      conn.brand || '',
      conn.name,
      JSON.stringify(encryptedConfig),
      conn.isCollected ? 1 : 0,
      conn.createDate || new Date().toLocaleString(),
      conn.updateDate || new Date().toLocaleString()
    );
  }
}

export function removeConnection(id: string): void {
  const stmt = db.prepare('DELETE FROM connections WHERE id = ?');
  stmt.run(id);
}

export function updateConnection(connection: Partial<ConnectionRecord> & { id: string }): ConnectionRecord | undefined {
  const existing = getConnectionById(connection.id);
  if (!existing) return undefined;

  const updatedConfig = connection.config
    ? encryptConnectionConfig(connection.config)
    : JSON.parse(getConnectionById(connection.id)?.config as any || '{}');

  const stmt = db.prepare(`
    UPDATE connections
    SET type = ?, brand = ?, name = ?, config = ?, isCollected = ?, updateDate = ?
    WHERE id = ?
  `);
  stmt.run(
    connection.type || existing.type,
    connection.brand || existing.brand,
    connection.name || existing.name,
    JSON.stringify(updatedConfig),
    connection.isCollected !== undefined ? (connection.isCollected ? 1 : 0) : (existing.isCollected ? 1 : 0),
    new Date().toLocaleString(),
    connection.id
  );
  return getConnectionById(connection.id);
}

export async function updateConnectionCollected(params: { id: string; isCollected: boolean }): Promise<{ id: string; isCollected: boolean }> {
  const stmt = db.prepare('UPDATE connections SET isCollected = ?, updateDate = ? WHERE id = ?');
  stmt.run(params.isCollected ? 1 : 0, new Date().toLocaleString(), params.id);
  return params;
}

export async function exportConnections(dirPath: string): Promise<string> {
  await verifySystemAuth();
  const data = getConnectionsData();
  const decryptedConnections = data.connections.map(c => ({
    ...c,
    config: decryptConnectionConfig(c.config),
  }));
  const filePath = path.join(dirPath, 'connections.json');
  await fs.writeJSON(filePath, { connections: decryptedConnections }, { spaces: 2 });
  return filePath;
}

export async function importConnections(filePath: string, merge: boolean = false): Promise<IConnectionsData> {
  const data = await fs.readJSON(filePath);
  const imported = (data?.connections || []).map((c: any) => ({
    ...c,
    config: encryptConnectionConfig(c.config || {}),
  }));

  if (merge) {
    // Add imported connections to existing
    addConnection(imported);
  } else {
    // Clear existing and add imported
    db.exec('DELETE FROM connections');
    addConnection(imported);
  }
  return getConnectionsData();
}

export async function rotatePasswords(newSecret: string): Promise<ConnectionRecord[]> {
  const connections = getConnectionsData().connections;
  const stmt = db.prepare('UPDATE connections SET config = ?, updateDate = ? WHERE id = ?');

  for (const c of connections) {
    const cfg = { ...c.config };
    let changed = false;
    SENSITIVE_KEYS.forEach((k) => {
      const v = cfg[k];
      if (v && typeof v === 'string') {
        try {
          const plain = isEncrypted(v) ? decryptPassword(v) : v;
          cfg[k] = encryptPasswordWithSecret(newSecret, plain);
          changed = true;
        } catch (e: any) {
          errorLogger.error('Rotate secret failed for connection:', c.id, k, e?.message || e);
        }
      }
    });
    if (changed) {
      stmt.run(JSON.stringify(cfg), new Date().toLocaleString(), c.id);
    }
  }
  return getConnectionsData().connections;
}

export function ensureEncryptedPasswordsOnStartup(): void {
  const connections = getConnectionsData().connections;
  const stmt = db.prepare('UPDATE connections SET config = ? WHERE id = ?');

  for (const c of connections) {
    const cfg = { ...c.config };
    let changed = false;
    SENSITIVE_KEYS.forEach((k) => {
      const v = cfg[k];
      if (v && typeof v === 'string' && !isEncrypted(v)) {
        try {
          cfg[`${k}Length`] = v.length;
          cfg[k] = encryptPassword(v);
          changed = true;
        } catch (_e) {}
      }
    });
    if (changed) {
      stmt.run(JSON.stringify(cfg), c.id);
    }
  }
}

/**
 * 从旧的 connections.json 迁移数据到 SQLite
 * 合并迁移：只添加 SQLite 中不存在的连接
 */
export function migrateFromJsonToSqlite(): void {
  const connectionsPath = path.join(getUserDataPath(), 'connections.json');

  // 检查 JSON 文件是否存在
  if (!fs.existsSync(connectionsPath)) {
    return;
  }

  try {
    const jsonData = fs.readJSONSync(connectionsPath);
    const jsonConnections = jsonData?.connections || [];

    if (jsonConnections.length === 0) {
      return;
    }

    // 获取 SQLite 中已存在的连接 ID
    const existingIds = new Set(
      (db.prepare('SELECT id FROM connections').all() as any[]).map(row => row.id)
    );

    // 过滤出需要迁移的连接（不存在于 SQLite 中的）
    const toMigrate = jsonConnections.filter((conn: any) => !existingIds.has(conn.id));

    if (toMigrate.length > 0) {
      addConnection(toMigrate);
      console.log(`[Migration] Migrated ${toMigrate.length} connections from JSON to SQLite`);
    }
  } catch (e: any) {
    errorLogger.error('Migration from JSON to SQLite failed:', e?.message || e);
  }
}

export default db;
