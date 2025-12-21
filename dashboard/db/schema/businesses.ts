/**
 * SOLARIA DFO - Businesses Schema (Drizzle ORM)
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    decimal,
    timestamp,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';

// Business status enum
export const businessStatusEnum = mysqlEnum('status', [
    'inactive',
    'planning',
    'active',
    'paused',
]);

// Businesses table
export const businesses = mysqlTable('businesses', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    website: varchar('website', { length: 255 }),
    status: businessStatusEnum.default('inactive'),
    revenue: decimal('revenue', { precision: 15, scale: 2 }).default('0'),
    expenses: decimal('expenses', { precision: 15, scale: 2 }).default('0'),
    profit: decimal('profit', { precision: 15, scale: 2 }).default('0'),
    logoUrl: varchar('logo_url', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Type exports
export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
