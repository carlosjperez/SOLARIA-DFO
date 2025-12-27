"use strict";
/**
 * SOLARIA DFO - Users Schema (Drizzle ORM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.userRoleEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// User roles enum
exports.userRoleEnum = (0, mysql_core_1.mysqlEnum)('role', [
    'ceo',
    'cto',
    'coo',
    'cfo',
    'admin',
    'viewer',
    'manager',
    'agent',
]);
// Users table
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    username: (0, mysql_core_1.varchar)('username', { length: 50 }).notNull().unique(),
    email: (0, mysql_core_1.varchar)('email', { length: 100 }).notNull().unique(),
    passwordHash: (0, mysql_core_1.varchar)('password_hash', { length: 64 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    role: exports.userRoleEnum.notNull().default('viewer'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
    lastLogin: (0, mysql_core_1.timestamp)('last_login'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
//# sourceMappingURL=users.js.map