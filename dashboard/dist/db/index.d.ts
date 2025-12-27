/**
 * SOLARIA DFO - Drizzle ORM Database Connection
 * Uses mysql2 driver with connection pooling
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import * as schema from './schema/index.js';
declare const pool: mysql.Pool;
export declare const db: import("drizzle-orm/mysql2").MySql2Database<typeof schema> & {
    $client: mysql.Pool;
};
export { pool };
export declare function checkDatabaseConnection(): Promise<boolean>;
export declare function closeDatabaseConnection(): Promise<void>;
