/**
 * Database Module Stub
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 *
 * This module provides a database interface for the MCP endpoints.
 * In production, this connects to the actual MariaDB instance via the dashboard API.
 * For testing, this module is mocked.
 */

export interface DatabaseResult {
  rows: any[];
  affectedRows?: number;
  insertId?: number;
}

export interface Database {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<DatabaseResult>;
}

/**
 * Database client singleton
 *
 * This is a placeholder that gets its actual implementation
 * from the dashboard API connection. For standalone endpoint testing,
 * this module should be mocked.
 */
export const db: Database = {
  async query(sql: string, params?: any[]): Promise<any[]> {
    // This will be replaced by actual implementation or mocked in tests
    throw new Error('Database not initialized. This module should be mocked in tests or connected via dashboard API.');
  },

  async execute(sql: string, params?: any[]): Promise<DatabaseResult> {
    throw new Error('Database not initialized. This module should be mocked in tests or connected via dashboard API.');
  },
};

/**
 * Initialize database connection
 * Called by the server when starting up
 */
export function initDatabase(connection: Database): void {
  Object.assign(db, connection);
}
