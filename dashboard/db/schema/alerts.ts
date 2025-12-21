/**
 * SOLARIA DFO - Alerts & Activity Logs Schema (Drizzle ORM)
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    timestamp,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects.js';
import { aiAgents } from './agents.js';
import { tasks } from './tasks.js';
import { users } from './users.js';

// Alert severity enum
export const alertSeverityEnum = mysqlEnum('severity', ['low', 'medium', 'high', 'critical']);

// Alert status enum
export const alertStatusEnum = mysqlEnum('status', [
    'active',
    'acknowledged',
    'resolved',
    'dismissed',
]);

// Alerts table
export const alerts = mysqlTable('alerts', {
    id: int('id').primaryKey().autoincrement(),
    title: varchar('title', { length: 200 }).notNull(),
    message: text('message'),
    severity: alertSeverityEnum.default('medium'),
    status: alertStatusEnum.default('active'),
    projectId: int('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    agentId: int('agent_id').references(() => aiAgents.id, { onDelete: 'set null' }),
    taskId: int('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    acknowledgedBy: int('acknowledged_by').references(() => users.id, { onDelete: 'set null' }),
    acknowledgedAt: timestamp('acknowledged_at'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Activity log category enum
export const logCategoryEnum = mysqlEnum('category', [
    'development',
    'testing',
    'deployment',
    'management',
    'security',
    'system',
]);

// Activity log level enum
export const logLevelEnum = mysqlEnum('level', ['debug', 'info', 'warning', 'error', 'critical']);

// Activity logs table
export const activityLogs = mysqlTable('activity_logs', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id').references(() => projects.id, { onDelete: 'set null' }),
    agentId: int('agent_id').references(() => aiAgents.id, { onDelete: 'set null' }),
    taskId: int('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    details: text('details'),
    category: logCategoryEnum.default('system'),
    level: logLevelEnum.default('info'),
    timestamp: timestamp('timestamp').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const alertsRelations = relations(alerts, ({ one }) => ({
    project: one(projects, {
        fields: [alerts.projectId],
        references: [projects.id],
    }),
    agent: one(aiAgents, {
        fields: [alerts.agentId],
        references: [aiAgents.id],
    }),
    task: one(tasks, {
        fields: [alerts.taskId],
        references: [tasks.id],
    }),
    acknowledgedByUser: one(users, {
        fields: [alerts.acknowledgedBy],
        references: [users.id],
    }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    project: one(projects, {
        fields: [activityLogs.projectId],
        references: [projects.id],
    }),
    agent: one(aiAgents, {
        fields: [activityLogs.agentId],
        references: [aiAgents.id],
    }),
    task: one(tasks, {
        fields: [activityLogs.taskId],
        references: [tasks.id],
    }),
    user: one(users, {
        fields: [activityLogs.userId],
        references: [users.id],
    }),
}));

// Type exports
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
