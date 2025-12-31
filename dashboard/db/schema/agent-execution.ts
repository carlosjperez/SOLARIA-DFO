/**
 * SOLARIA DFO - Agent Execution Schema (Drizzle ORM)
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Schema for BullMQ-based agent execution system
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    json,
    timestamp,
    boolean,
    mysqlEnum,
    index,
    unique,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { tasks } from './tasks.js';
import { aiAgents } from './agents.js';
import { projects } from './projects.js';

// ============================================================================
// Enums
// ============================================================================

// Job status enum - matches BullMQ job states
export const jobStatusEnum = mysqlEnum('status', [
    'waiting',
    'active',
    'completed',
    'failed',
    'delayed',
    'cancelled',
]);

// MCP authentication types
export const authTypeEnum = mysqlEnum('auth_type', ['bearer', 'basic', 'api_key', 'none']);

// MCP transport protocols
export const transportTypeEnum = mysqlEnum('transport_type', ['http', 'stdio', 'sse']);

// MCP connection status
export const connectionStatusEnum = mysqlEnum('connection_status', [
    'connected',
    'disconnected',
    'error',
]);

// ============================================================================
// Tables
// ============================================================================

/**
 * agent_jobs table
 * Tracks BullMQ execution jobs and their lifecycle
 */
export const agentJobs = mysqlTable(
    'agent_jobs',
    {
        id: int('id').primaryKey().autoincrement(),

        // BullMQ Job Reference
        bullmqJobId: varchar('bullmq_job_id', { length: 255 }).notNull().unique(),
        queueName: varchar('queue_name', { length: 100 }).notNull().default('agent-execution'),

        // Task and Agent Context
        taskId: int('task_id')
            .notNull()
            .references(() => tasks.id, { onDelete: 'cascade' }),
        taskCode: varchar('task_code', { length: 50 }).notNull(),
        agentId: int('agent_id')
            .notNull()
            .references(() => aiAgents.id, { onDelete: 'cascade' }),
        projectId: int('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),

        // Job State
        status: jobStatusEnum.default('waiting'),
        progress: int('progress').default(0),

        // Execution Context (JSON)
        jobData: json('job_data').$type<{
            taskId: number;
            taskCode: string;
            agentId: number;
            agentName: string;
            projectId: number;
            mcpConfigs?: Array<{
                serverName: string;
                serverUrl: string;
                authType: string;
                authCredentials?: Record<string, unknown>;
                enabled: boolean;
            }>;
            context?: {
                dependencies?: number[];
                relatedTasks?: number[];
                memoryIds?: number[];
            };
            metadata?: {
                priority: string;
                estimatedHours?: number;
                retryCount?: number;
            };
        }>(),

        // Job Result (JSON)
        jobResult: json('job_result').$type<{
            success: boolean;
            taskId: number;
            taskCode: string;
            itemsCompleted: number;
            itemsTotal: number;
            progress: number;
            executionTimeMs: number;
            error?: {
                message: string;
                code: string;
                stack?: string;
            };
            output?: string;
            taskStatus: 'pending' | 'in_progress' | 'completed' | 'blocked';
            completionNotes?: string;
        }>(),

        // Timing
        queuedAt: timestamp('queued_at').defaultNow(),
        startedAt: timestamp('started_at'),
        completedAt: timestamp('completed_at'),

        // Retry and Error Handling
        attemptsMade: int('attempts_made').default(0),
        maxAttempts: int('max_attempts').default(3),
        lastError: text('last_error'),
        errorStack: text('error_stack'),

        // Metadata
        priority: int('priority').default(3), // 1=critical, 2=high, 3=medium, 4=low
        executionTimeMs: int('execution_time_ms'),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        // Indexes
        statusIdx: index('idx_agent_jobs_status').on(table.status),
        taskIdIdx: index('idx_agent_jobs_task_id').on(table.taskId),
        agentIdIdx: index('idx_agent_jobs_agent_id').on(table.agentId),
        projectIdIdx: index('idx_agent_jobs_project_id').on(table.projectId),
        queueNameIdx: index('idx_agent_jobs_queue_name').on(table.queueName),
        queuedAtIdx: index('idx_agent_jobs_queued_at').on(table.queuedAt),
        completedAtIdx: index('idx_agent_jobs_completed_at').on(table.completedAt),
        statusPriorityIdx: index('idx_agent_jobs_status_priority').on(table.status, table.priority),
        agentStatusIdx: index('idx_agent_jobs_agent_status').on(table.agentId, table.status),
        taskStatusIdx: index('idx_agent_jobs_task_status').on(table.taskId, table.status),
        // Unique constraint
        bullmqJobIdUnique: unique('uq_bullmq_job_id').on(table.bullmqJobId),
    })
);

/**
 * agent_mcp_configs table
 * Stores MCP server configurations for each agent (Dual MCP Mode)
 */
export const agentMcpConfigs = mysqlTable(
    'agent_mcp_configs',
    {
        id: int('id').primaryKey().autoincrement(),

        // Agent Association
        agentId: int('agent_id')
            .notNull()
            .references(() => aiAgents.id, { onDelete: 'cascade' }),

        // MCP Server Details
        serverName: varchar('server_name', { length: 100 }).notNull(),
        serverUrl: varchar('server_url', { length: 500 }).notNull(),

        // Authentication
        authType: authTypeEnum.default('none'),
        authCredentials: json('auth_credentials').$type<{
            token?: string;
            username?: string;
            password?: string;
            apiKey?: string;
        }>(),

        // Configuration
        enabled: boolean('enabled').default(true),
        transportType: transportTypeEnum.default('http'),
        configOptions: json('config_options').$type<{
            timeout?: number;
            retryAttempts?: number;
            retryDelay?: number;
            headers?: Record<string, string>;
        }>(),

        // Health and Monitoring
        lastConnectedAt: timestamp('last_connected_at'),
        connectionStatus: connectionStatusEnum.default('disconnected'),
        lastError: text('last_error'),

        // Metadata
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
        createdByAgentId: int('created_by_agent_id').references(() => aiAgents.id, {
            onDelete: 'set null',
        }),
    },
    (table) => ({
        // Indexes
        agentIdIdx: index('idx_agent_mcp_configs_agent_id').on(table.agentId),
        serverNameIdx: index('idx_agent_mcp_configs_server_name').on(table.serverName),
        enabledIdx: index('idx_agent_mcp_configs_enabled').on(table.enabled),
        statusIdx: index('idx_agent_mcp_configs_status').on(table.connectionStatus),
        healthIdx: index('idx_agent_mcp_configs_health').on(
            table.connectionStatus,
            table.lastConnectedAt
        ),
        // Unique constraint: one config per agent per server
        agentServerUnique: unique('uq_agent_server').on(table.agentId, table.serverName),
    })
);

// ============================================================================
// Relations
// ============================================================================

export const agentJobsRelations = relations(agentJobs, ({ one }) => ({
    task: one(tasks, {
        fields: [agentJobs.taskId],
        references: [tasks.id],
    }),
    agent: one(aiAgents, {
        fields: [agentJobs.agentId],
        references: [aiAgents.id],
    }),
    project: one(projects, {
        fields: [agentJobs.projectId],
        references: [projects.id],
    }),
}));

export const agentMcpConfigsRelations = relations(agentMcpConfigs, ({ one }) => ({
    agent: one(aiAgents, {
        fields: [agentMcpConfigs.agentId],
        references: [aiAgents.id],
    }),
    createdBy: one(aiAgents, {
        fields: [agentMcpConfigs.createdByAgentId],
        references: [aiAgents.id],
    }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type AgentJob = typeof agentJobs.$inferSelect;
export type NewAgentJob = typeof agentJobs.$inferInsert;
export type AgentMcpConfig = typeof agentMcpConfigs.$inferSelect;
export type NewAgentMcpConfig = typeof agentMcpConfigs.$inferInsert;
