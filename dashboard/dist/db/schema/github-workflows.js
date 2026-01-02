"use strict";
/**
 * SOLARIA DFO - GitHub Workflows Schema (Drizzle ORM)
 * DFO 4.0 - GitHub Actions Integration
 *
 * Schema for GitHub Actions workflows, runs, and task-GitHub resource links
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubTaskLinksRelations = exports.githubWorkflowRunsRelations = exports.githubWorkflowsRelations = exports.githubTaskLinks = exports.githubWorkflowRuns = exports.githubWorkflows = exports.syncStatusEnum = exports.resourceTypeEnum = exports.lastRunStatusEnum = exports.runConclusionEnum = exports.workflowRunStatusEnum = exports.triggerTypeEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const tasks_js_1 = require("./tasks.js");
const projects_js_1 = require("./projects.js");
const agents_js_1 = require("./agents.js");
// ============================================================================
// Enums
// ============================================================================
// Workflow trigger types
exports.triggerTypeEnum = (0, mysql_core_1.mysqlEnum)('trigger_type', [
    'manual',
    'push',
    'pull_request',
    'schedule',
    'workflow_dispatch',
]);
// Workflow run status
exports.workflowRunStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'queued',
    'in_progress',
    'completed',
]);
// Workflow run conclusion
exports.runConclusionEnum = (0, mysql_core_1.mysqlEnum)('conclusion', [
    'success',
    'failure',
    'cancelled',
    'skipped',
    'timed_out',
    'action_required',
    'neutral',
]);
// Last run status enum (for workflows table)
exports.lastRunStatusEnum = (0, mysql_core_1.mysqlEnum)('last_run_status', [
    'success',
    'failure',
    'in_progress',
    'cancelled',
    'skipped',
    'pending',
]);
// GitHub resource types
exports.resourceTypeEnum = (0, mysql_core_1.mysqlEnum)('resource_type', [
    'pull_request',
    'issue',
    'branch',
    'commit',
    'release',
]);
// Sync status
exports.syncStatusEnum = (0, mysql_core_1.mysqlEnum)('sync_status', ['pending', 'synced', 'error']);
// ============================================================================
// Tables
// ============================================================================
/**
 * github_workflows table
 * Stores GitHub Actions workflow definitions and trigger configurations
 */
exports.githubWorkflows = (0, mysql_core_1.mysqlTable)('github_workflows', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    // Project and Task Context
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    taskId: (0, mysql_core_1.int)('task_id').references(() => tasks_js_1.tasks.id, { onDelete: 'set null' }),
    // Workflow Identification
    workflowName: (0, mysql_core_1.varchar)('workflow_name', { length: 255 }).notNull(),
    workflowPath: (0, mysql_core_1.varchar)('workflow_path', { length: 500 }).notNull(),
    repository: (0, mysql_core_1.varchar)('repository', { length: 255 }).notNull(),
    // Configuration
    description: (0, mysql_core_1.text)('description'),
    triggerType: exports.triggerTypeEnum.default('manual'),
    triggerConfig: (0, mysql_core_1.json)('trigger_config').$type(),
    // Status and Metadata
    enabled: (0, mysql_core_1.boolean)('enabled').default(true),
    autoTrigger: (0, mysql_core_1.boolean)('auto_trigger').default(false),
    lastRunId: (0, mysql_core_1.int)('last_run_id'),
    lastRunStatus: exports.lastRunStatusEnum,
    lastRunAt: (0, mysql_core_1.timestamp)('last_run_at'),
    // Statistics
    totalRuns: (0, mysql_core_1.int)('total_runs').default(0),
    successfulRuns: (0, mysql_core_1.int)('successful_runs').default(0),
    failedRuns: (0, mysql_core_1.int)('failed_runs').default(0),
    // Metadata
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
    createdByAgentId: (0, mysql_core_1.int)('created_by_agent_id').references(() => agents_js_1.aiAgents.id, {
        onDelete: 'set null',
    }),
}, (table) => ({
    // Indexes
    projectIdIdx: (0, mysql_core_1.index)('idx_github_workflows_project_id').on(table.projectId),
    taskIdIdx: (0, mysql_core_1.index)('idx_github_workflows_task_id').on(table.taskId),
    repositoryIdx: (0, mysql_core_1.index)('idx_github_workflows_repository').on(table.repository),
    workflowNameIdx: (0, mysql_core_1.index)('idx_github_workflows_workflow_name').on(table.workflowName),
    enabledIdx: (0, mysql_core_1.index)('idx_github_workflows_enabled').on(table.enabled),
    autoTriggerIdx: (0, mysql_core_1.index)('idx_github_workflows_auto_trigger').on(table.autoTrigger),
    lastRunStatusIdx: (0, mysql_core_1.index)('idx_github_workflows_last_run_status').on(table.lastRunStatus),
    projectEnabledIdx: (0, mysql_core_1.index)('idx_github_workflows_project_enabled').on(table.projectId, table.enabled),
    repoEnabledIdx: (0, mysql_core_1.index)('idx_github_workflows_repo_enabled').on(table.repository, table.enabled),
    lastRunIdx: (0, mysql_core_1.index)('idx_github_workflows_last_run').on(table.lastRunStatus, table.lastRunAt),
    // Unique constraint
    workflowRepoPathUnique: (0, mysql_core_1.unique)('uq_workflow_repo_path').on(table.repository, table.workflowPath),
}));
/**
 * github_workflow_runs table
 * Tracks individual GitHub Actions workflow executions
 */
exports.githubWorkflowRuns = (0, mysql_core_1.mysqlTable)('github_workflow_runs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    // Workflow Association
    workflowId: (0, mysql_core_1.int)('workflow_id')
        .notNull()
        .references(() => exports.githubWorkflows.id, { onDelete: 'cascade' }),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    taskId: (0, mysql_core_1.int)('task_id').references(() => tasks_js_1.tasks.id, { onDelete: 'set null' }),
    // GitHub Run Information
    githubRunId: (0, mysql_core_1.bigint)('github_run_id', { mode: 'number' }).notNull(),
    githubRunNumber: (0, mysql_core_1.int)('github_run_number').notNull(),
    workflowName: (0, mysql_core_1.varchar)('workflow_name', { length: 255 }).notNull(),
    repository: (0, mysql_core_1.varchar)('repository', { length: 255 }).notNull(),
    // Run Context
    triggerEvent: (0, mysql_core_1.varchar)('trigger_event', { length: 100 }),
    triggeredBy: (0, mysql_core_1.varchar)('triggered_by', { length: 100 }),
    branch: (0, mysql_core_1.varchar)('branch', { length: 255 }),
    commitSha: (0, mysql_core_1.varchar)('commit_sha', { length: 40 }),
    commitMessage: (0, mysql_core_1.text)('commit_message'),
    // Status and Timing
    status: exports.workflowRunStatusEnum.default('queued'),
    conclusion: exports.runConclusionEnum,
    startedAt: (0, mysql_core_1.timestamp)('started_at'),
    completedAt: (0, mysql_core_1.timestamp)('completed_at'),
    durationSeconds: (0, mysql_core_1.int)('duration_seconds'),
    // Results and Logs
    runUrl: (0, mysql_core_1.varchar)('run_url', { length: 500 }),
    logsUrl: (0, mysql_core_1.varchar)('logs_url', { length: 500 }),
    errorMessage: (0, mysql_core_1.text)('error_message'),
    // Webhook Integration
    webhookReceivedAt: (0, mysql_core_1.timestamp)('webhook_received_at'),
    webhookEventType: (0, mysql_core_1.varchar)('webhook_event_type', { length: 100 }),
    webhookDeliveryId: (0, mysql_core_1.varchar)('webhook_delivery_id', { length: 255 }),
    // Metadata
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
    // Indexes
    workflowIdIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_workflow_id').on(table.workflowId),
    projectIdIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_project_id').on(table.projectId),
    taskIdIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_task_id').on(table.taskId),
    repositoryIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_repository').on(table.repository),
    statusIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_status').on(table.status),
    conclusionIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_conclusion').on(table.conclusion),
    startedAtIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_started_at').on(table.startedAt),
    completedAtIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_completed_at').on(table.completedAt),
    workflowStatusIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_workflow_status').on(table.workflowId, table.status),
    projectStatusIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_project_status').on(table.projectId, table.status),
    statusConclusionIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_status_conclusion').on(table.status, table.conclusion),
    recentIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_recent').on(table.workflowId, table.startedAt),
    failedIdx: (0, mysql_core_1.index)('idx_github_workflow_runs_failed').on(table.conclusion, table.completedAt),
    // Unique constraints
    webhookDeliveryUnique: (0, mysql_core_1.unique)('uq_webhook_delivery').on(table.webhookDeliveryId),
    githubRunIdUnique: (0, mysql_core_1.unique)('uq_github_run_id').on(table.githubRunId),
}));
/**
 * github_task_links table
 * Links DFO tasks to GitHub resources (Pull Requests, Issues, Branches)
 */
exports.githubTaskLinks = (0, mysql_core_1.mysqlTable)('github_task_links', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    // Task Association
    taskId: (0, mysql_core_1.int)('task_id')
        .notNull()
        .references(() => tasks_js_1.tasks.id, { onDelete: 'cascade' }),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    // GitHub Resource Identification
    resourceType: exports.resourceTypeEnum.notNull(),
    repository: (0, mysql_core_1.varchar)('repository', { length: 255 }).notNull(),
    // Resource Identifiers
    githubPrNumber: (0, mysql_core_1.int)('github_pr_number'),
    githubIssueNumber: (0, mysql_core_1.int)('github_issue_number'),
    branchName: (0, mysql_core_1.varchar)('branch_name', { length: 255 }),
    commitSha: (0, mysql_core_1.varchar)('commit_sha', { length: 40 }),
    releaseTag: (0, mysql_core_1.varchar)('release_tag', { length: 255 }),
    // Resource Details
    title: (0, mysql_core_1.varchar)('title', { length: 500 }),
    description: (0, mysql_core_1.text)('description'),
    githubUrl: (0, mysql_core_1.varchar)('github_url', { length: 500 }).notNull(),
    // Status and Sync
    resourceStatus: (0, mysql_core_1.varchar)('resource_status', { length: 100 }),
    syncStatus: exports.syncStatusEnum.default('pending'),
    lastSyncedAt: (0, mysql_core_1.timestamp)('last_synced_at'),
    syncError: (0, mysql_core_1.text)('sync_error'),
    // Auto-Creation Tracking
    autoCreated: (0, mysql_core_1.boolean)('auto_created').default(false),
    createdByAgentId: (0, mysql_core_1.int)('created_by_agent_id').references(() => agents_js_1.aiAgents.id, {
        onDelete: 'set null',
    }),
    // Metadata
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
    // Indexes
    taskIdIdx: (0, mysql_core_1.index)('idx_github_task_links_task_id').on(table.taskId),
    projectIdIdx: (0, mysql_core_1.index)('idx_github_task_links_project_id').on(table.projectId),
    repositoryIdx: (0, mysql_core_1.index)('idx_github_task_links_repository').on(table.repository),
    resourceTypeIdx: (0, mysql_core_1.index)('idx_github_task_links_resource_type').on(table.resourceType),
    prNumberIdx: (0, mysql_core_1.index)('idx_github_task_links_pr_number').on(table.repository, table.githubPrNumber),
    issueNumberIdx: (0, mysql_core_1.index)('idx_github_task_links_issue_number').on(table.repository, table.githubIssueNumber),
    branchIdx: (0, mysql_core_1.index)('idx_github_task_links_branch').on(table.repository, table.branchName),
    commitIdx: (0, mysql_core_1.index)('idx_github_task_links_commit').on(table.commitSha),
    syncStatusIdx: (0, mysql_core_1.index)('idx_github_task_links_sync_status').on(table.syncStatus),
    resourceStatusIdx: (0, mysql_core_1.index)('idx_github_task_links_resource_status').on(table.resourceStatus),
    taskTypeIdx: (0, mysql_core_1.index)('idx_github_task_links_task_type').on(table.taskId, table.resourceType),
    repoTypeIdx: (0, mysql_core_1.index)('idx_github_task_links_repo_type').on(table.repository, table.resourceType),
    syncErrorIdx: (0, mysql_core_1.index)('idx_github_task_links_sync_error').on(table.syncStatus, table.lastSyncedAt),
    autoCreatedIdx: (0, mysql_core_1.index)('idx_github_task_links_auto_created').on(table.autoCreated, table.createdAt),
}));
// ============================================================================
// Relations
// ============================================================================
exports.githubWorkflowsRelations = (0, drizzle_orm_1.relations)(exports.githubWorkflows, ({ one, many }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.githubWorkflows.projectId],
        references: [projects_js_1.projects.id],
    }),
    task: one(tasks_js_1.tasks, {
        fields: [exports.githubWorkflows.taskId],
        references: [tasks_js_1.tasks.id],
    }),
    createdBy: one(agents_js_1.aiAgents, {
        fields: [exports.githubWorkflows.createdByAgentId],
        references: [agents_js_1.aiAgents.id],
    }),
    runs: many(exports.githubWorkflowRuns),
}));
exports.githubWorkflowRunsRelations = (0, drizzle_orm_1.relations)(exports.githubWorkflowRuns, ({ one }) => ({
    workflow: one(exports.githubWorkflows, {
        fields: [exports.githubWorkflowRuns.workflowId],
        references: [exports.githubWorkflows.id],
    }),
    project: one(projects_js_1.projects, {
        fields: [exports.githubWorkflowRuns.projectId],
        references: [projects_js_1.projects.id],
    }),
    task: one(tasks_js_1.tasks, {
        fields: [exports.githubWorkflowRuns.taskId],
        references: [tasks_js_1.tasks.id],
    }),
}));
exports.githubTaskLinksRelations = (0, drizzle_orm_1.relations)(exports.githubTaskLinks, ({ one }) => ({
    task: one(tasks_js_1.tasks, {
        fields: [exports.githubTaskLinks.taskId],
        references: [tasks_js_1.tasks.id],
    }),
    project: one(projects_js_1.projects, {
        fields: [exports.githubTaskLinks.projectId],
        references: [projects_js_1.projects.id],
    }),
    createdBy: one(agents_js_1.aiAgents, {
        fields: [exports.githubTaskLinks.createdByAgentId],
        references: [agents_js_1.aiAgents.id],
    }),
}));
