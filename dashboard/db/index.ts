/**
 * SOLARIA DFO - Drizzle ORM Database Connection
 * Uses mysql2 driver with connection pooling
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema/index.js';

// Database configuration from environment
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'solaria_construction',
    charset: 'utf8mb4',
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema, mode: 'default' });

// Export pool for raw queries if needed
export { pool };

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

// Close pool (for graceful shutdown)
export async function closeDatabaseConnection(): Promise<void> {
    await pool.end();
}
