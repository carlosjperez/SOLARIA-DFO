/**
 * SOLARIA DFO - GitHub Workflows Schema (Drizzle ORM)
 * DFO 4.0 - GitHub Actions Integration
 *
 * Schema for GitHub Actions workflows, runs, and task-GitHub resource links
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    json,
    timestamp,
    boolean,
    bigint,
    mysqlEnum,
    index,
    unique,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { tasks } from './tasks.js';
import { projects } from './projects.js';
import { aiAgents } from './agents.js';

// ============================================================================
// Enums
// ============================================================================

// Workflow trigger types
export const triggerTypeEnum = mysqlEnum('trigger_type', [
    'manual',
    'push',
    'pull_request',
    'schedule',
    'workflow_dispatch',
]);

// Workflow run status
export const workflowRunStatusEnum = mysqlEnum('status', [
    'queued',
    'in_progress',
    'completed',
]);

// Workflow run conclusion
export const runConclusionEnum = mysqlEnum('conclusion', [
    'success',
    'failure',
    'cancelled',
    'skipped',
    'timed_out',
    'action_required',
    'neutral',
]);

// Last run status enum (for workflows table)
export const lastRunStatusEnum = mysqlEnum('last_run_status', [
    'success',
    'failure',
    'in_progress',
    'cancelled',
    'skipped',
    'pending',
]);

// GitHub resource types
export const resourceTypeEnum = mysqlEnum('resource_type', [
    'pull_request',
    'issue',
    'branch',
    'commit',
    'release',
]);

// Sync status
export const syncStatusEnum = mysqlEnum('sync_status', ['pending', 'synced', 'error']);

// ============================================================================
// Tables
// ============================================================================

/**
 * github_workflows table
 * Stores GitHub Actions workflow definitions and trigger configurations
 */
export const githubWorkflows = mysqlTable(
    'github_workflows',
    {
        id: int('id').primaryKey().autoincrement(),

        // Project and Task Context
        projectId: int('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        taskId: int('task_id').references(() => tasks.id, { onDelete: 'set null' }),

        // Workflow Identification
        workflowName: varchar('workflow_name', { length: 255 }).notNull(),
        workflowPath: varchar('workflow_path', { length: 500 }).notNull(),
        repository: varchar('repository', { length: 255 }).notNull(),

        // Configuration
        description: text('description'),
        triggerType: triggerTypeEnum.default('manual'),
        triggerConfig: json('trigger_config').$type<{
            branches?: string[];
            paths?: string[];
            schedule?: string;
            events?: string[];
        }>(),

        // Status and Metadata
        enabled: boolean('enabled').default(true),
        autoTrigger: boolean('auto_trigger').default(false),
        lastRunId: int('last_run_id'),
        lastRunStatus: lastRunStatusEnum,
        lastRunAt: timestamp('last_run_at'),

        // Statistics
        totalRuns: int('total_runs').default(0),
        successfulRuns: int('successful_runs').default(0),
        failedRuns: int('failed_runs').default(0),

        // Metadata
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
        createdByAgentId: int('created_by_agent_id').references(() => aiAgents.id, {
            onDelete: 'set null',
        }),
    },
    (table) => ({
        // Indexes
        projectIdIdx: index('idx_github_workflows_project_id').on(table.projectId),
        taskIdIdx: index('idx_github_workflows_task_id').on(table.taskId),
        repositoryIdx: index('idx_github_workflows_repository').on(table.repository),
        workflowNameIdx: index('idx_github_workflows_workflow_name').on(table.workflowName),
        enabledIdx: index('idx_github_workflows_enabled').on(table.enabled),
        autoTriggerIdx: index('idx_github_workflows_auto_trigger').on(table.autoTrigger),
        lastRunStatusIdx: index('idx_github_workflows_last_run_status').on(table.lastRunStatus),
        projectEnabledIdx: index('idx_github_workflows_project_enabled').on(
            table.projectId,
            table.enabled
        ),
        repoEnabledIdx: index('idx_github_workflows_repo_enabled').on(
            table.repository,
            table.enabled
        ),
        lastRunIdx: index('idx_github_workflows_last_run').on(
            table.lastRunStatus,
            table.lastRunAt
        ),
        // Unique constraint
        workflowRepoPathUnique: unique('uq_workflow_repo_path').on(
            table.repository,
            table.workflowPath
        ),
    })
);

/**
 * github_workflow_runs table
 * Tracks individual GitHub Actions workflow executions
 */
export const githubWorkflowRuns = mysqlTable(
    'github_workflow_runs',
    {
        id: int('id').primaryKey().autoincrement(),

        // Workflow Association
        workflowId: int('workflow_id')
            .notNull()
            .references(() => githubWorkflows.id, { onDelete: 'cascade' }),
        projectId: int('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        taskId: int('task_id').references(() => tasks.id, { onDelete: 'set null' }),

        // GitHub Run Information
        githubRunId: bigint('github_run_id', { mode: 'number' }).notNull(),
        githubRunNumber: int('github_run_number').notNull(),
        workflowName: varchar('workflow_name', { length: 255 }).notNull(),
        repository: varchar('repository', { length: 255 }).notNull(),

        // Run Context
        triggerEvent: varchar('trigger_event', { length: 100 }),
        triggeredBy: varchar('triggered_by', { length: 100 }),
        branch: varchar('branch', { length: 255 }),
        commitSha: varchar('commit_sha', { length: 40 }),
        commitMessage: text('commit_message'),

        // Status and Timing
        status: workflowRunStatusEnum.default('queued'),
        conclusion: runConclusionEnum,

        startedAt: timestamp('started_at'),
        completedAt: timestamp('completed_at'),
        durationSeconds: int('duration_seconds'),

        // Results and Logs
        runUrl: varchar('run_url', { length: 500 }),
        logsUrl: varchar('logs_url', { length: 500 }),
        errorMessage: text('error_message'),

        // Webhook Integration
        webhookReceivedAt: timestamp('webhook_received_at'),
        webhookEventType: varchar('webhook_event_type', { length: 100 }),
        webhookDeliveryId: varchar('webhook_delivery_id', { length: 255 }),

        // Metadata
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        // Indexes
        workflowIdIdx: index('idx_github_workflow_runs_workflow_id').on(table.workflowId),
        projectIdIdx: index('idx_github_workflow_runs_project_id').on(table.projectId),
        taskIdIdx: index('idx_github_workflow_runs_task_id').on(table.taskId),
        repositoryIdx: index('idx_github_workflow_runs_repository').on(table.repository),
        statusIdx: index('idx_github_workflow_runs_status').on(table.status),
        conclusionIdx: index('idx_github_workflow_runs_conclusion').on(table.conclusion),
        startedAtIdx: index('idx_github_workflow_runs_started_at').on(table.startedAt),
        completedAtIdx: index('idx_github_workflow_runs_completed_at').on(table.completedAt),
        workflowStatusIdx: index('idx_github_workflow_runs_workflow_status').on(
            table.workflowId,
            table.status
        ),
        projectStatusIdx: index('idx_github_workflow_runs_project_status').on(
            table.projectId,
            table.status
        ),
        statusConclusionIdx: index('idx_github_workflow_runs_status_conclusion').on(
            table.status,
            table.conclusion
        ),
        recentIdx: index('idx_github_workflow_runs_recent').on(
            table.workflowId,
            table.startedAt
        ),
        failedIdx: index('idx_github_workflow_runs_failed').on(
            table.conclusion,
            table.completedAt
        ),
        // Unique constraints
        webhookDeliveryUnique: unique('uq_webhook_delivery').on(table.webhookDeliveryId),
        githubRunIdUnique: unique('uq_github_run_id').on(table.githubRunId),
    })
);

/**
 * github_task_links table
 * Links DFO tasks to GitHub resources (Pull Requests, Issues, Branches)
 */
export const githubTaskLinks = mysqlTable(
    'github_task_links',
    {
        id: int('id').primaryKey().autoincrement(),

        // Task Association
        taskId: int('task_id')
            .notNull()
            .references(() => tasks.id, { onDelete: 'cascade' }),
        projectId: int('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),

        // GitHub Resource Identification
        resourceType: resourceTypeEnum.notNull(),
        repository: varchar('repository', { length: 255 }).notNull(),

        // Resource Identifiers
        githubPrNumber: int('github_pr_number'),
        githubIssueNumber: int('github_issue_number'),
        branchName: varchar('branch_name', { length: 255 }),
        commitSha: varchar('commit_sha', { length: 40 }),
        releaseTag: varchar('release_tag', { length: 255 }),

        // Resource Details
        title: varchar('title', { length: 500 }),
        description: text('description'),
        githubUrl: varchar('github_url', { length: 500 }).notNull(),

        // Status and Sync
        resourceStatus: varchar('resource_status', { length: 100 }),
        syncStatus: syncStatusEnum.default('pending'),
        lastSyncedAt: timestamp('last_synced_at'),
        syncError: text('sync_error'),

        // Auto-Creation Tracking
        autoCreated: boolean('auto_created').default(false),
        createdByAgentId: int('created_by_agent_id').references(() => aiAgents.id, {
            onDelete: 'set null',
        }),

        // Metadata
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        // Indexes
        taskIdIdx: index('idx_github_task_links_task_id').on(table.taskId),
        projectIdIdx: index('idx_github_task_links_project_id').on(table.projectId),
        repositoryIdx: index('idx_github_task_links_repository').on(table.repository),
        resourceTypeIdx: index('idx_github_task_links_resource_type').on(table.resourceType),
        prNumberIdx: index('idx_github_task_links_pr_number').on(
            table.repository,
            table.githubPrNumber
        ),
        issueNumberIdx: index('idx_github_task_links_issue_number').on(
            table.repository,
            table.githubIssueNumber
        ),
        branchIdx: index('idx_github_task_links_branch').on(table.repository, table.branchName),
        commitIdx: index('idx_github_task_links_commit').on(table.commitSha),
        syncStatusIdx: index('idx_github_task_links_sync_status').on(table.syncStatus),
        resourceStatusIdx: index('idx_github_task_links_resource_status').on(
            table.resourceStatus
        ),
        taskTypeIdx: index('idx_github_task_links_task_type').on(
            table.taskId,
            table.resourceType
        ),
        repoTypeIdx: index('idx_github_task_links_repo_type').on(
            table.repository,
            table.resourceType
        ),
        syncErrorIdx: index('idx_github_task_links_sync_error').on(
            table.syncStatus,
            table.lastSyncedAt
        ),
        autoCreatedIdx: index('idx_github_task_links_auto_created').on(
            table.autoCreated,
            table.createdAt
        ),
    })
);

// ============================================================================
// Relations
// ============================================================================

export const githubWorkflowsRelations = relations(githubWorkflows, ({ one, many }) => ({
    project: one(projects, {
        fields: [githubWorkflows.projectId],
        references: [projects.id],
    }),
    task: one(tasks, {
        fields: [githubWorkflows.taskId],
        references: [tasks.id],
    }),
    createdBy: one(aiAgents, {
        fields: [githubWorkflows.createdByAgentId],
        references: [aiAgents.id],
    }),
    runs: many(githubWorkflowRuns),
}));

export const githubWorkflowRunsRelations = relations(githubWorkflowRuns, ({ one }) => ({
    workflow: one(githubWorkflows, {
        fields: [githubWorkflowRuns.workflowId],
        references: [githubWorkflows.id],
    }),
    project: one(projects, {
        fields: [githubWorkflowRuns.projectId],
        references: [projects.id],
    }),
    task: one(tasks, {
        fields: [githubWorkflowRuns.taskId],
        references: [tasks.id],
    }),
}));

export const githubTaskLinksRelations = relations(githubTaskLinks, ({ one }) => ({
    task: one(tasks, {
        fields: [githubTaskLinks.taskId],
        references: [tasks.id],
    }),
    project: one(projects, {
        fields: [githubTaskLinks.projectId],
        references: [projects.id],
    }),
    createdBy: one(aiAgents, {
        fields: [githubTaskLinks.createdByAgentId],
        references: [aiAgents.id],
    }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type GitHubWorkflow = typeof githubWorkflows.$inferSelect;
export type NewGitHubWorkflow = typeof githubWorkflows.$inferInsert;
export type GitHubWorkflowRun = typeof githubWorkflowRuns.$inferSelect;
export type NewGitHubWorkflowRun = typeof githubWorkflowRuns.$inferInsert;
export type GitHubTaskLink = typeof githubTaskLinks.$inferSelect;
export type NewGitHubTaskLink = typeof githubTaskLinks.$inferInsert;
