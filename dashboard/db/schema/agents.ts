/**
 * SOLARIA DFO - Agents Schema (Drizzle ORM)
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    decimal,
    timestamp,
    mysqlEnum,
    json,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Agent role enum
export const agentRoleEnum = mysqlEnum('role', [
    'project_manager',
    'architect',
    'developer',
    'tester',
    'analyst',
    'designer',
    'devops',
    'technical_writer',
    'security_auditor',
    'deployment_specialist',
]);

// Agent status enum
export const agentStatusEnum = mysqlEnum('status', [
    'active',
    'busy',
    'inactive',
    'error',
    'maintenance',
]);

// AI Agents table
export const aiAgents = mysqlTable('ai_agents', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull(),
    role: agentRoleEnum.notNull(),
    status: agentStatusEnum.default('inactive'),
    capabilities: json('capabilities'),
    configuration: json('configuration'),
    lastActivity: timestamp('last_activity'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Agent states table
export const agentStates = mysqlTable('agent_states', {
    id: int('id').primaryKey().autoincrement(),
    agentId: int('agent_id')
        .notNull()
        .references(() => aiAgents.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).notNull(),
    currentTask: text('current_task'),
    lastHeartbeat: timestamp('last_heartbeat').defaultNow(),
    performanceMetrics: json('performance_metrics'),
});

// Agent metrics table
export const agentMetrics = mysqlTable('agent_metrics', {
    id: int('id').primaryKey().autoincrement(),
    agentId: int('agent_id')
        .notNull()
        .references(() => aiAgents.id, { onDelete: 'cascade' }),
    metricType: varchar('metric_type', { length: 50 }).notNull(),
    metricValue: decimal('metric_value', { precision: 10, scale: 4 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const aiAgentsRelations = relations(aiAgents, ({ one, many }) => ({
    state: one(agentStates, {
        fields: [aiAgents.id],
        references: [agentStates.agentId],
    }),
    metrics: many(agentMetrics),
}));

export const agentStatesRelations = relations(agentStates, ({ one }) => ({
    agent: one(aiAgents, {
        fields: [agentStates.agentId],
        references: [aiAgents.id],
    }),
}));

// Type exports
export type AiAgent = typeof aiAgents.$inferSelect;
export type NewAiAgent = typeof aiAgents.$inferInsert;
export type AgentState = typeof agentStates.$inferSelect;
export type AgentMetric = typeof agentMetrics.$inferSelect;
