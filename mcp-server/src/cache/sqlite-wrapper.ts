/**
 * SQLite Wrapper for Offline Cache
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-009
 *
 * Provides a simple SQLite interface for local caching
 */

import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ============================================================================
// Types
// ============================================================================

export interface SQLiteDatabase {
  run(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid: number }>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

export interface CacheConfig {
  projectId: number;
  cacheDir?: string;
}

// ============================================================================
// Cache Directory Management
// ============================================================================

const DEFAULT_CACHE_DIR = join(homedir(), '.dfo-cache');

export function getCacheDir(customDir?: string): string {
  const dir = customDir || DEFAULT_CACHE_DIR;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getProjectCachePath(projectId: number, cacheDir?: string): string {
  const dir = getCacheDir(cacheDir);
  return join(dir, `project-${projectId}.db`);
}

// ============================================================================
// Schema Definitions
// ============================================================================

export const CACHE_SCHEMA = `
-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  task_code TEXT,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  progress INTEGER DEFAULT 0,
  assigned_agent_id INTEGER,
  project_id INTEGER,
  sprint_id INTEGER,
  epic_id INTEGER,
  estimated_hours REAL,
  deadline TEXT,
  synced_at TEXT,
  local_modified INTEGER DEFAULT 0
);

-- Task items table
CREATE TABLE IF NOT EXISTS task_items (
  id INTEGER PRIMARY KEY,
  task_id INTEGER,
  title TEXT,
  description TEXT,
  is_completed INTEGER DEFAULT 0,
  notes TEXT,
  synced_at TEXT,
  local_modified INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY,
  content TEXT,
  summary TEXT,
  importance REAL,
  tags TEXT,
  synced_at TEXT,
  local_modified INTEGER DEFAULT 0
);

-- Dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id INTEGER PRIMARY KEY,
  task_id INTEGER,
  depends_on_task_id INTEGER,
  dependency_type TEXT,
  synced_at TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Sync metadata
CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_task_items_task ON task_items(task_id);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance DESC);
`;

// ============================================================================
// SQLite Wrapper Class (Mock for now - requires better-sqlite3 or sql.js)
// ============================================================================

/**
 * In-memory mock SQLite for environments without native SQLite
 * For production, use better-sqlite3 or sql.js
 */
export class MockSQLiteDatabase implements SQLiteDatabase {
  private tables: Map<string, any[]> = new Map();
  private autoIncrements: Map<string, number> = new Map();
  private closed: boolean = false;

  constructor(private dbPath: string) {
    // Initialize with empty tables
    this.tables.set('tasks', []);
    this.tables.set('task_items', []);
    this.tables.set('memories', []);
    this.tables.set('task_dependencies', []);
    this.tables.set('sync_meta', []);
  }

  async run(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> {
    if (this.closed) throw new Error('Database is closed');

    // Parse simple INSERT/UPDATE/DELETE
    const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
    if (insertMatch) {
      const table = insertMatch[1].toLowerCase();
      const rows = this.tables.get(table) || [];
      const id = (this.autoIncrements.get(table) || 0) + 1;
      this.autoIncrements.set(table, id);
      rows.push({ id, ...this.parseValues(sql, params) });
      this.tables.set(table, rows);
      return { changes: 1, lastInsertRowid: id };
    }

    const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET/i);
    if (updateMatch) {
      const table = updateMatch[1].toLowerCase();
      const rows = this.tables.get(table) || [];
      // Simple update - in real implementation, parse WHERE clause
      return { changes: rows.length > 0 ? 1 : 0, lastInsertRowid: 0 };
    }

    const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
    if (deleteMatch) {
      const table = deleteMatch[1].toLowerCase();
      const rows = this.tables.get(table) || [];
      // Simple delete - in real implementation, parse WHERE clause
      const count = rows.length;
      this.tables.set(table, []);
      return { changes: count, lastInsertRowid: 0 };
    }

    return { changes: 0, lastInsertRowid: 0 };
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (this.closed) throw new Error('Database is closed');

    const selectMatch = sql.match(/SELECT\s+.+\s+FROM\s+(\w+)/i);
    if (selectMatch) {
      const table = selectMatch[1].toLowerCase();
      const rows = this.tables.get(table) || [];
      return rows[0] as T;
    }
    return undefined;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (this.closed) throw new Error('Database is closed');

    const selectMatch = sql.match(/SELECT\s+.+\s+FROM\s+(\w+)/i);
    if (selectMatch) {
      const table = selectMatch[1].toLowerCase();
      return (this.tables.get(table) || []) as T[];
    }
    return [];
  }

  async exec(sql: string): Promise<void> {
    if (this.closed) throw new Error('Database is closed');
    // Execute schema - for mock, just initialize tables
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  private parseValues(sql: string, params: any[]): Record<string, any> {
    // Simple value parsing - in real implementation, properly parse SQL
    const obj: Record<string, any> = {};
    const valuesMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
    if (valuesMatch) {
      const columns = valuesMatch[1].split(',').map((c) => c.trim());
      columns.forEach((col, i) => {
        if (params[i] !== undefined) {
          obj[col] = params[i];
        }
      });
    }
    return obj;
  }
}

// ============================================================================
// SQLite Cache Class
// ============================================================================

export class SQLiteCache {
  private db: SQLiteDatabase | null = null;
  private projectId: number;
  private dbPath: string;

  constructor(config: CacheConfig) {
    this.projectId = config.projectId;
    this.dbPath = getProjectCachePath(config.projectId, config.cacheDir);
  }

  async initialize(): Promise<void> {
    // Use mock for now - in production, use better-sqlite3
    this.db = new MockSQLiteDatabase(this.dbPath);
    await this.db.exec(CACHE_SCHEMA);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async clear(): Promise<void> {
    if (existsSync(this.dbPath)) {
      await this.close();
      unlinkSync(this.dbPath);
    }
  }

  // ============================================================================
  // Task Operations
  // ============================================================================

  async cacheTasks(tasks: any[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    for (const task of tasks) {
      await this.db.run(
        `INSERT OR REPLACE INTO tasks
         (id, task_code, title, description, status, priority, progress,
          assigned_agent_id, project_id, sprint_id, epic_id, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.task_code,
          task.title,
          task.description,
          task.status,
          task.priority,
          task.progress,
          task.assigned_agent_id,
          task.project_id,
          task.sprint_id,
          task.epic_id,
          now,
        ]
      );
    }
  }

  async getCachedTasks(filters?: { status?: string }): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = 'SELECT * FROM tasks';
    const params: any[] = [];

    if (filters?.status) {
      sql += ' WHERE status = ?';
      params.push(filters.status);
    }

    return this.db.all(sql, params);
  }

  async getCachedTask(taskId: number): Promise<any | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  }

  async updateCachedTask(taskId: number, updates: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClauses: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = ?`);
      params.push(value);
    }

    setClauses.push('local_modified = 1');
    params.push(taskId);

    await this.db.run(
      `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
  }

  // ============================================================================
  // Sync Metadata
  // ============================================================================

  async setMeta(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(
      `INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)`,
      [key, value, new Date().toISOString()]
    );
  }

  async getMeta(key: string): Promise<string | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get<{ value: string }>(
      'SELECT value FROM sync_meta WHERE key = ?',
      [key]
    );
    return row?.value;
  }

  async getLastSyncTime(): Promise<Date | null> {
    const timestamp = await this.getMeta('last_sync');
    return timestamp ? new Date(timestamp) : null;
  }

  async setLastSyncTime(date: Date = new Date()): Promise<void> {
    await this.setMeta('last_sync', date.toISOString());
  }

  // ============================================================================
  // Local Modifications
  // ============================================================================

  async getModifiedTasks(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.all('SELECT * FROM tasks WHERE local_modified = 1');
  }

  async clearModifiedFlag(taskId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('UPDATE tasks SET local_modified = 0 WHERE id = ?', [taskId]);
  }

  // ============================================================================
  // Stats
  // ============================================================================

  async getStats(): Promise<{
    totalTasks: number;
    modifiedTasks: number;
    lastSync: Date | null;
    cacheSize: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const totalRow = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM tasks');
    const modifiedRow = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE local_modified = 1'
    );
    const lastSync = await this.getLastSyncTime();

    return {
      totalTasks: totalRow?.count || 0,
      modifiedTasks: modifiedRow?.count || 0,
      lastSync,
      cacheSize: 0, // Would need fs.statSync in real implementation
    };
  }
}
