/**
 * SOLARIA DFO - Reserved Project Codes Schema (Drizzle ORM)
 * Stores reserved project codes that cannot be used for new projects
 *
 * Created: 2026-01-12 - Phase 2.4: Schema creation for Drizzle migration
 */

import {
    mysqlTable,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

// ============================================================================
// Reserved Project Codes Table
// ============================================================================

/**
 * reserved_project_codes table
 * Stores codes that are reserved and cannot be used as project codes
 * Examples: API, SQL, GET, PUT, etc.
 */
export const reservedProjectCodes = mysqlTable('reserved_project_codes', {
    code: varchar('code', { length: 3 }).primaryKey(),
    reason: varchar('reason', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type ReservedProjectCode = typeof reservedProjectCodes.$inferSelect;
export type NewReservedProjectCode = typeof reservedProjectCodes.$inferInsert;
