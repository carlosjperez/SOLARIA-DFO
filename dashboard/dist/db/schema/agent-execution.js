"use strict";
/**
 * SOLARIA DFO - Agent Execution Schema (Drizzle ORM)
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Schema for BullMQ-based agent execution system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentMcpConfigsRelations = exports.agentJobsRelations = exports.agentMcpConfigs = exports.agentJobs = exports.connectionStatusEnum = exports.transportTypeEnum = exports.authTypeEnum = exports.jobStatusEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const tasks_js_1 = require("./tasks.js");
const agents_js_1 = require("./agents.js");
const projects_js_1 = require("./projects.js");
// ============================================================================
// Enums
// ============================================================================
// Job status enum - matches BullMQ job states
exports.jobStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'waiting',
    'active',
    'completed',
    'failed',
    'delayed',
    'cancelled',
]);
// MCP authentication types
exports.authTypeEnum = (0, mysql_core_1.mysqlEnum)('auth_type', ['bearer', 'basic', 'api_key', 'none']);
// MCP transport protocols
exports.transportTypeEnum = (0, mysql_core_1.mysqlEnum)('transport_type', ['http', 'stdio', 'sse']);
// MCP connection status
exports.connectionStatusEnum = (0, mysql_core_1.mysqlEnum)('connection_status', [
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
exports.agentJobs = (0, mysql_core_1.mysqlTable)('agent_jobs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    // BullMQ Job Reference
    bullmqJobId: (0, mysql_core_1.varchar)('bullmq_job_id', { length: 255 }).notNull().unique(),
    queueName: (0, mysql_core_1.varchar)('queue_name', { length: 100 }).notNull().default('agent-execution'),
    // Task and Agent Context
    taskId: (0, mysql_core_1.int)('task_id')
        .notNull()
        .references(() => tasks_js_1.tasks.id, { onDelete: 'cascade' }),
    taskCode: (0, mysql_core_1.varchar)('task_code', { length: 50 }).notNull(),
    agentId: (0, mysql_core_1.int)('agent_id')
        .notNull()
        .references(() => agents_js_1.aiAgents.id, { onDelete: 'cascade' }),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    // Job State
    status: exports.jobStatusEnum.default('waiting'),
    progress: (0, mysql_core_1.int)('progress').default(0),
    // Execution Context (JSON)
    jobData: (0, mysql_core_1.json)('job_data').$type(),
    // Job Result (JSON)
    jobResult: (0, mysql_core_1.json)('job_result').$type(),
    // Timing
    queuedAt: (0, mysql_core_1.timestamp)('queued_at').defaultNow(),
    startedAt: (0, mysql_core_1.timestamp)('started_at'),
    completedAt: (0, mysql_core_1.timestamp)('completed_at'),
    // Retry and Error Handling
    attemptsMade: (0, mysql_core_1.int)('attempts_made').default(0),
    maxAttempts: (0, mysql_core_1.int)('max_attempts').default(3),
    lastError: (0, mysql_core_1.text)('last_error'),
    errorStack: (0, mysql_core_1.text)('error_stack'),
    // Metadata
    priority: (0, mysql_core_1.int)('priority').default(3), // 1=critical, 2=high, 3=medium, 4=low
    executionTimeMs: (0, mysql_core_1.int)('execution_time_ms'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
    // Indexes
    statusIdx: (0, mysql_core_1.index)('idx_agent_jobs_status').on(table.status),
    taskIdIdx: (0, mysql_core_1.index)('idx_agent_jobs_task_id').on(table.taskId),
    agentIdIdx: (0, mysql_core_1.index)('idx_agent_jobs_agent_id').on(table.agentId),
    projectIdIdx: (0, mysql_core_1.index)('idx_agent_jobs_project_id').on(table.projectId),
    queueNameIdx: (0, mysql_core_1.index)('idx_agent_jobs_queue_name').on(table.queueName),
    queuedAtIdx: (0, mysql_core_1.index)('idx_agent_jobs_queued_at').on(table.queuedAt),
    completedAtIdx: (0, mysql_core_1.index)('idx_agent_jobs_completed_at').on(table.completedAt),
    statusPriorityIdx: (0, mysql_core_1.index)('idx_agent_jobs_status_priority').on(table.status, table.priority),
    agentStatusIdx: (0, mysql_core_1.index)('idx_agent_jobs_agent_status').on(table.agentId, table.status),
    taskStatusIdx: (0, mysql_core_1.index)('idx_agent_jobs_task_status').on(table.taskId, table.status),
    // Unique constraint
    bullmqJobIdUnique: (0, mysql_core_1.unique)('uq_bullmq_job_id').on(table.bullmqJobId),
}));
/**
 * agent_mcp_configs table
 * Stores MCP server configurations for each agent (Dual MCP Mode)
 */
exports.agentMcpConfigs = (0, mysql_core_1.mysqlTable)('agent_mcp_configs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    // Agent Association
    agentId: (0, mysql_core_1.int)('agent_id')
        .notNull()
        .references(() => agents_js_1.aiAgents.id, { onDelete: 'cascade' }),
    // MCP Server Details
    serverName: (0, mysql_core_1.varchar)('server_name', { length: 100 }).notNull(),
    serverUrl: (0, mysql_core_1.varchar)('server_url', { length: 500 }).notNull(),
    // Authentication
    authType: exports.authTypeEnum.default('none'),
    authCredentials: (0, mysql_core_1.json)('auth_credentials').$type(),
    // Configuration
    enabled: (0, mysql_core_1.boolean)('enabled').default(true),
    transportType: exports.transportTypeEnum.default('http'),
    configOptions: (0, mysql_core_1.json)('config_options').$type(),
    // Health and Monitoring
    lastConnectedAt: (0, mysql_core_1.timestamp)('last_connected_at'),
    connectionStatus: exports.connectionStatusEnum.default('disconnected'),
    lastError: (0, mysql_core_1.text)('last_error'),
    // Metadata
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
    createdByAgentId: (0, mysql_core_1.int)('created_by_agent_id').references(() => agents_js_1.aiAgents.id, {
        onDelete: 'set null',
    }),
}, (table) => ({
    // Indexes
    agentIdIdx: (0, mysql_core_1.index)('idx_agent_mcp_configs_agent_id').on(table.agentId),
    serverNameIdx: (0, mysql_core_1.index)('idx_agent_mcp_configs_server_name').on(table.serverName),
    enabledIdx: (0, mysql_core_1.index)('idx_agent_mcp_configs_enabled').on(table.enabled),
    statusIdx: (0, mysql_core_1.index)('idx_agent_mcp_configs_status').on(table.connectionStatus),
    healthIdx: (0, mysql_core_1.index)('idx_agent_mcp_configs_health').on(table.connectionStatus, table.lastConnectedAt),
    // Unique constraint: one config per agent per server
    agentServerUnique: (0, mysql_core_1.unique)('uq_agent_server').on(table.agentId, table.serverName),
}));
// ============================================================================
// Relations
// ============================================================================
exports.agentJobsRelations = (0, drizzle_orm_1.relations)(exports.agentJobs, ({ one }) => ({
    task: one(tasks_js_1.tasks, {
        fields: [exports.agentJobs.taskId],
        references: [tasks_js_1.tasks.id],
    }),
    agent: one(agents_js_1.aiAgents, {
        fields: [exports.agentJobs.agentId],
        references: [agents_js_1.aiAgents.id],
    }),
    project: one(projects_js_1.projects, {
        fields: [exports.agentJobs.projectId],
        references: [projects_js_1.projects.id],
    }),
}));
exports.agentMcpConfigsRelations = (0, drizzle_orm_1.relations)(exports.agentMcpConfigs, ({ one }) => ({
    agent: one(agents_js_1.aiAgents, {
        fields: [exports.agentMcpConfigs.agentId],
        references: [agents_js_1.aiAgents.id],
    }),
    createdBy: one(agents_js_1.aiAgents, {
        fields: [exports.agentMcpConfigs.createdByAgentId],
        references: [agents_js_1.aiAgents.id],
    }),
}));
//# sourceMappingURL=agent-execution.js.map