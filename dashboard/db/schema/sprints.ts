/**
 * SOLARIA DFO - Sprints Schema (Drizzle ORM)
 *
 * Represents project phases/sprints with phase ordering and type classification.
 * Supports multiple phase types: planning, development, testing, deployment, maintenance, custom
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
import { epics } from './epics.js';
import { tasks } from './tasks.js';

// Sprint status enum
export const sprintStatusEnum = mysqlEnum('status', [
    'planned',
    'active',
    'completed',
    'cancelled',
]);

// Sprint phase type enum
export const phaseTypeEnum = mysqlEnum('phase_type', [
    'planning',
    'development',
    'testing',
    'deployment',
    'maintenance',
    'custom',
]);

// Sprints table definition
export const sprints = mysqlTable('sprints', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    sprintNumber: int('sprint_number').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    goal: text('goal'),
    status: sprintStatusEnum.default('planned'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    velocity: int('velocity').default(0),
    capacity: int('capacity').default(0),
    phaseOrder: int('phase_order').default(0),
    phaseType: phaseTypeEnum.default('custom'),
    createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Relations definition
export const sprintsRelations = relations(sprints, ({ one, many }) => ({
    project: one(projects, {
        fields: [sprints.projectId],
        references: [projects.id],
    }),
    createdByUser: one(users, {
        fields: [sprints.createdBy],
        references: [users.id],
    }),
    epics: many(epics),
    tasks: many(tasks), // Direct task assignments (standalone tasks)
}));

// Type exports for TypeScript
export type Sprint = typeof sprints.$inferSelect;
export type NewSprint = typeof sprints.$inferInsert;
