/**
 * SOLARIA DFO - Users Schema (Drizzle ORM)
 */

import {
    mysqlTable,
    int,
    varchar,
    boolean,
    timestamp,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';

// User roles enum
export const userRoleEnum = mysqlEnum('role', [
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
export const users = mysqlTable('users', {
    id: int('id').primaryKey().autoincrement(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 64 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    role: userRoleEnum.notNull().default('viewer'),
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
