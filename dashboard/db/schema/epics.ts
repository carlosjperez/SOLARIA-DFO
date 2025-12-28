/**
 * SOLARIA DFO - Epics Schema (Drizzle ORM)
 *
 * Represents high-level features or workstreams within a sprint.
 * Epics group related tasks and belong to a specific sprint.
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    date,
    timestamp,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects.js';
import { users } from './users.js';
import { sprints } from './sprints.js';
import { tasks } from './tasks.js';

// Epic status enum
export const epicStatusEnum = mysqlEnum('status', [
    'open',
    'in_progress',
    'completed',
    'cancelled',
]);

// Epics table definition
export const epics = mysqlTable('epics', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    sprintId: int('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
    epicNumber: int('epic_number').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    color: varchar('color', { length: 7 }).default('#6366f1'),
    status: epicStatusEnum.default('open'),
    startDate: date('start_date'),
    targetDate: date('target_date'),
    createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Relations definition
export const epicsRelations = relations(epics, ({ one, many }) => ({
    project: one(projects, {
        fields: [epics.projectId],
        references: [projects.id],
    }),
    sprint: one(sprints, {
        fields: [epics.sprintId],
        references: [sprints.id],
    }),
    createdByUser: one(users, {
        fields: [epics.createdBy],
        references: [users.id],
    }),
    tasks: many(tasks),
}));

// Type exports for TypeScript
export type Epic = typeof epics.$inferSelect;
export type NewEpic = typeof epics.$inferInsert;
