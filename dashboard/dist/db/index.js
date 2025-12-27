"use strict";
/**
 * SOLARIA DFO - Drizzle ORM Database Connection
 * Uses mysql2 driver with connection pooling
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.db = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
exports.closeDatabaseConnection = closeDatabaseConnection;
require("dotenv/config");
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const schema = __importStar(require("./schema/index.js"));
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
const pool = promise_1.default.createPool(dbConfig);
exports.pool = pool;
// Create Drizzle instance with schema
exports.db = (0, mysql2_1.drizzle)(pool, { schema, mode: 'default' });
// Health check function
async function checkDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
// Close pool (for graceful shutdown)
async function closeDatabaseConnection() {
    await pool.end();
}
//# sourceMappingURL=index.js.map