/**
 * GitHub Actions Integration Endpoint
 *
 * @author ECO-Lambda | DFO 4.0 Implementation
 * @date 2026-01-01
 * @task SLR-011 (Refactor GitHub MCP tools to use DFOApiClient)
 *
 * MCP tools for triggering GitHub Actions workflows, creating issues/PRs,
 * and tracking deployment status. All operations delegate to Dashboard API
 * to maintain container architecture (DFO-206 pattern).
 */

import { z } from 'zod';
import { ResponseBuilder, CommonErrors } from '../utils/response-builder.js';
import { getDFOApiClient } from '../utils/dfo-api-client.js';
import { Tool } from '../types/mcp.js';
import { db } from '../database.js';

const VERSION = '4.0.0';

// ============================================================================
// Validation Schemas
// ============================================================================

const TriggerWorkflowInputSchema = z.object({
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    workflow_id: z.string().min(1, 'Workflow ID or filename is required'),
    ref: z.string().min(1, 'Git ref (branch/tag) is required'),
    inputs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    project_id: z.number().int().positive('Project ID must be a positive integer'),
    task_id: z.number().int().positive().optional(),
    format: z.enum(['json', 'human']).default('json'),
});

const GetWorkflowStatusInputSchema = z.object({
    run_id: z.number().int().positive('Run ID must be a positive integer'),
    format: z.enum(['json', 'human']).default('json'),
});

const CreateIssueInputSchema = z.object({
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    title: z.string().min(1, 'Issue title is required'),
    body: z.string().min(1, 'Issue body is required'),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
    task_id: z.number().int().positive('Task ID must be a positive integer'),
    project_id: z.number().int().positive('Project ID must be a positive integer'),
    format: z.enum(['json', 'human']).default('json'),
});

const CreatePRInputSchema = z.object({
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    title: z.string().min(1, 'PR title is required'),
    body: z.string().min(1, 'PR body is required'),
    head: z.string().min(1, 'Head branch is required'),
    base: z.string().min(1, 'Base branch is required'),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
    task_id: z.number().int().positive('Task ID must be a positive integer'),
    project_id: z.number().int().positive('Project ID must be a positive integer'),
    format: z.enum(['json', 'human']).default('json'),
});

const CreatePRFromTaskInputSchema = z.object({
    task_id: z.number().int().positive('Task ID must be a positive integer'),
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    head_branch: z.string().optional(),
    base_branch: z.string().default('main'),
    draft: z.boolean().default(false),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
    format: z.enum(['json', 'human']).default('json'),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format workflow trigger result for human-readable output
 */
function formatWorkflowTrigger(data: {
    workflowId: number;
    runId: number;
    githubRunId: number;
    owner: string;
    repo: string;
    ref: string;
    triggeredAt: string;
}): string {
    let output = `GitHub Workflow Triggered Successfully\n`;
    output += `════════════════════════════════════════\n`;
    output += `✅ Workflow ID: ${data.workflowId}\n`;
    output += `🔗 GitHub Run ID: ${data.githubRunId}\n`;
    output += `📦 Repository: ${data.owner}/${data.repo}\n`;
    output += `🌿 Ref: ${data.ref}\n`;
    output += `⏰ Triggered: ${new Date(data.triggeredAt).toLocaleString()}\n`;
    output += `\n💡 Use github_get_workflow_status with run_id=${data.runId} to check progress.\n`;

    return output;
}

/**
 * Format workflow status for human-readable output
 */
function formatWorkflowStatus(data: {
    runId: number;
    githubRunId: number;
    status: string;
    conclusion: string | null;
    runNumber: number;
    htmlUrl: string;
    startedAt: string;
    completedAt?: string;
    durationSeconds?: number;
}): string {
    const statusEmoji = {
        queued: '⏳',
        in_progress: '🔄',
        completed: '✅',
    };

    const conclusionEmoji = {
        success: '✅',
        failure: '❌',
        cancelled: '🚫',
        skipped: '⊘',
    };

    let output = `GitHub Workflow Status\n`;
    output += `════════════════════════════════════════\n`;
    output += `${statusEmoji[data.status as keyof typeof statusEmoji] || '📊'} Status: ${data.status.toUpperCase()}\n`;

    if (data.conclusion) {
        output += `${conclusionEmoji[data.conclusion as keyof typeof conclusionEmoji] || '❓'} Conclusion: ${data.conclusion.toUpperCase()}\n`;
    }

    output += `🔢 Run #${data.runNumber}\n`;
    output += `🔗 URL: ${data.htmlUrl}\n`;
    output += `▶️  Started: ${new Date(data.startedAt).toLocaleString()}\n`;

    if (data.completedAt) {
        output += `🏁 Completed: ${new Date(data.completedAt).toLocaleString()}\n`;
    }

    if (data.durationSeconds) {
        const minutes = Math.floor(data.durationSeconds / 60);
        const seconds = data.durationSeconds % 60;
        output += `⏱️  Duration: ${minutes}m ${seconds}s\n`;
    }

    return output;
}

/**
 * Format issue creation result for human-readable output
 */
function formatIssueCreation(data: {
    issueNumber: number;
    issueUrl: string;
    taskLinkId: number;
}): string {
    let output = `GitHub Issue Created Successfully\n`;
    output += `════════════════════════════════════════\n`;
    output += `✅ Issue #${data.issueNumber}\n`;
    output += `🔗 URL: ${data.issueUrl}\n`;
    output += `🔗 Task Link ID: ${data.taskLinkId}\n`;
    output += `\n💡 The issue has been linked to the DFO task for tracking.\n`;

    return output;
}

/**
 * Format PR creation result for human-readable output
 */
function formatPRCreation(data: {
    prNumber: number;
    prUrl: string;
    taskLinkId: number;
    head: string;
    base: string;
}): string {
    let output = `GitHub Pull Request Created Successfully\n`;
    output += `════════════════════════════════════════\n`;
    output += `✅ PR #${data.prNumber}\n`;
    output += `🔗 URL: ${data.prUrl}\n`;
    output += `🌿 ${data.head} → ${data.base}\n`;
    output += `🔗 Task Link ID: ${data.taskLinkId}\n`;
    output += `\n💡 The PR has been linked to the DFO task for tracking.\n`;

    return output;
}

// ============================================================================
// Tool Handlers
// ============================================================================

/**
 * Trigger a GitHub Actions workflow
 */
async function triggerWorkflow(args: z.infer<typeof TriggerWorkflowInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to trigger workflow
        const apiResponse = await apiClient.triggerWorkflow({
            owner: args.owner,
            repo: args.repo,
            workflowId: args.workflow_id,
            ref: args.ref,
            inputs: args.inputs,
            projectId: args.project_id,
            taskId: args.task_id,
        });

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const response = apiResponse.data!;

        if (args.format === 'human') {
            return builder.success(response, {
                format: 'human',
                formatted: formatWorkflowTrigger(response),
            });
        }

        return builder.success(response);
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to trigger workflow via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Check that Dashboard API is running and accessible at DFO_API_URL',
        });
    }
}

/**
 * Get the status of a GitHub Actions workflow run
 */
async function getWorkflowStatus(args: z.infer<typeof GetWorkflowStatusInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to get workflow status
        const apiResponse = await apiClient.getWorkflowStatus(args.run_id);

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const status = apiResponse.data!;

        if (args.format === 'human') {
            return builder.success(status, {
                format: 'human',
                formatted: formatWorkflowStatus(status),
            });
        }

        return builder.success(status);
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to get workflow status via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Check that Dashboard API is running and accessible at DFO_API_URL',
        });
    }
}

/**
 * Create a GitHub issue from a DFO task
 */
async function createIssue(args: z.infer<typeof CreateIssueInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to create issue
        const apiResponse = await apiClient.createIssue({
            owner: args.owner,
            repo: args.repo,
            title: args.title,
            body: args.body,
            labels: args.labels,
            assignees: args.assignees,
            taskId: args.task_id,
            projectId: args.project_id,
        });

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const response = apiResponse.data!;

        if (args.format === 'human') {
            return builder.success(response, {
                format: 'human',
                formatted: formatIssueCreation(response),
            });
        }

        return builder.success(response);
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to create issue via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Check that Dashboard API is running and accessible at DFO_API_URL',
        });
    }
}

/**
 * Create a GitHub pull request from a DFO task
 */
async function createPR(args: z.infer<typeof CreatePRInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to create PR
        const apiResponse = await apiClient.createPR({
            owner: args.owner,
            repo: args.repo,
            title: args.title,
            body: args.body,
            head: args.head,
            base: args.base,
            labels: args.labels,
            assignees: args.assignees,
            taskId: args.task_id,
            projectId: args.project_id,
        });

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const response = apiResponse.data!;

        if (args.format === 'human') {
            return builder.success(response, {
                format: 'human',
                formatted: formatPRCreation(response),
            });
        }

        return builder.success(response);
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to create PR via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Check that Dashboard API is running and accessible at DFO_API_URL',
        });
    }
}

/**
 * Create a GitHub pull request automatically from a DFO task
 * Fetches task details and auto-generates PR title, body, and branch name
 */
async function createPRFromTask(args: z.infer<typeof CreatePRFromTaskInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Fetch task details from database
        const taskQuery = `
            SELECT
                t.id,
                t.title,
                t.description,
                t.project_id,
                t.task_number,
                p.code as project_code,
                t.epic_id,
                COALESCE(e.epic_number, 0) as epic_number
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            LEFT JOIN epics e ON t.epic_id = e.id
            WHERE t.id = ?
        `;

        const [taskRows] = await db.query(taskQuery, [args.task_id]);
        const tasks = taskRows as any[];

        if (tasks.length === 0) {
            return builder.error({
                code: 'TASK_NOT_FOUND',
                message: `Task with ID ${args.task_id} not found`,
                details: { task_id: args.task_id },
                suggestion: 'Verify the task ID exists in the database',
            });
        }

        const task = tasks[0];
        const taskCode = `${task.project_code}-${task.task_number}${task.epic_number > 0 ? `-EPIC${task.epic_number}` : ''}`;

        // Auto-generate head branch if not provided
        const headBranch = args.head_branch || `feature/${taskCode.toLowerCase()}`;

        // Generate PR title from task title
        const prTitle = task.title;

        // Generate PR body from template
        const prBody = `## Task: ${taskCode} - ${task.title}

${task.description || '_No description provided_'}

## Changes
<!-- Auto-populated from commits when PR is created -->

---
🤖 Generated from [SOLARIA DFO](https://dfo.solaria.agency)
Linked to Task: ${taskCode}`;

        // Call Dashboard API to create PR
        const apiResponse = await apiClient.createPR({
            owner: args.owner,
            repo: args.repo,
            title: prTitle,
            body: prBody,
            head: headBranch,
            base: args.base_branch,
            labels: args.labels,
            assignees: args.assignees,
            taskId: args.task_id,
            projectId: task.project_id,
        });

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const response = apiResponse.data!;

        // Add task code to response for reference
        const enrichedResponse = {
            ...response,
            taskCode,
            headBranch,
            draft: args.draft,
        };

        if (args.format === 'human') {
            let output = `GitHub Pull Request Created from Task\n`;
            output += `════════════════════════════════════════\n`;
            output += `✅ PR #${response.prNumber}\n`;
            output += `📋 Task: ${taskCode}\n`;
            output += `🔗 URL: ${response.prUrl}\n`;
            output += `🌿 ${headBranch} → ${args.base_branch}\n`;
            output += `🔗 Task Link ID: ${response.taskLinkId}\n`;
            if (args.draft) {
                output += `📝 Draft PR (ready for review when you're ready)\n`;
            }
            output += `\n💡 The PR has been linked to task ${taskCode} for tracking.\n`;

            return builder.success(enrichedResponse, {
                format: 'human',
                formatted: output,
            });
        }

        return builder.success(enrichedResponse);
    } catch (error: any) {
        // Check if it's a database error
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return builder.error({
                code: 'DATABASE_CONNECTION_FAILED',
                message: 'Failed to connect to database',
                details: { originalError: error.message },
                suggestion: 'Check that the database is running and accessible',
            });
        }

        return builder.error({
            code: 'PR_CREATION_FAILED',
            message: 'Failed to create PR from task',
            details: { originalError: error.message },
            suggestion: 'Check task ID, repository details, and ensure the branch exists',
        });
    }
}

// ============================================================================
// Tool Definitions
// ============================================================================

export const githubActionsTools: Tool[] = [
    {
        name: 'github_trigger_workflow',
        description:
            'Trigger a GitHub Actions workflow in a repository. Useful for automated deployments, testing, or custom CI/CD pipelines triggered from DFO tasks.',
        inputSchema: TriggerWorkflowInputSchema,
        async execute(args: any) {
            const validated = TriggerWorkflowInputSchema.parse(args);
            return triggerWorkflow(validated);
        },
    },
    {
        name: 'github_get_workflow_status',
        description:
            'Get the current status of a GitHub Actions workflow run. Returns execution state, conclusion, duration, and logs URL. Use the run_id returned from github_trigger_workflow.',
        inputSchema: GetWorkflowStatusInputSchema,
        async execute(args: any) {
            const validated = GetWorkflowStatusInputSchema.parse(args);
            return getWorkflowStatus(validated);
        },
    },
    {
        name: 'github_create_issue',
        description:
            'Create a GitHub issue from a DFO task. Automatically links the issue to the task for tracking. Useful for bug reports, feature requests, or technical debt documentation.',
        inputSchema: CreateIssueInputSchema,
        async execute(args: any) {
            const validated = CreateIssueInputSchema.parse(args);
            return createIssue(validated);
        },
    },
    {
        name: 'github_create_pr',
        description:
            'Create a GitHub pull request from a DFO task. Automatically links the PR to the task for tracking. Useful for code review workflows and deployment automation.',
        inputSchema: CreatePRInputSchema,
        async execute(args: any) {
            const validated = CreatePRInputSchema.parse(args);
            return createPR(validated);
        },
    },
    {
        name: 'github_create_pr_from_task',
        description:
            'Automatically create a GitHub pull request from a DFO task. Fetches task details, auto-generates PR title, body, and branch name. Requires the branch to already exist and be pushed to GitHub. Useful for streamlined PR creation workflows.',
        inputSchema: CreatePRFromTaskInputSchema,
        async execute(args: any) {
            const validated = CreatePRFromTaskInputSchema.parse(args);
            return createPRFromTask(validated);
        },
    },
];

// Individual tool exports for handlers.ts registration
export const githubTriggerWorkflowTool: Tool = {
    name: 'github_trigger_workflow',
    description: githubActionsTools[0].description,
    inputSchema: TriggerWorkflowInputSchema,
    async execute(args: any) {
        const validated = TriggerWorkflowInputSchema.parse(args);
        return triggerWorkflow(validated);
    },
};

export const githubGetWorkflowStatusTool: Tool = {
    name: 'github_get_workflow_status',
    description: githubActionsTools[1].description,
    inputSchema: GetWorkflowStatusInputSchema,
    async execute(args: any) {
        const validated = GetWorkflowStatusInputSchema.parse(args);
        return getWorkflowStatus(validated);
    },
};

export const githubCreateIssueTool: Tool = {
    name: 'github_create_issue',
    description: githubActionsTools[2].description,
    inputSchema: CreateIssueInputSchema,
    async execute(args: any) {
        const validated = CreateIssueInputSchema.parse(args);
        return createIssue(validated);
    },
};

export const githubCreatePRTool: Tool = {
    name: 'github_create_pr',
    description: githubActionsTools[3].description,
    inputSchema: CreatePRInputSchema,
    async execute(args: any) {
        const validated = CreatePRInputSchema.parse(args);
        return createPR(validated);
    },
};

export const githubCreatePRFromTaskTool: Tool = {
    name: 'github_create_pr_from_task',
    description: githubActionsTools[4].description,
    inputSchema: CreatePRFromTaskInputSchema,
    async execute(args: any) {
        const validated = CreatePRFromTaskInputSchema.parse(args);
        return createPRFromTask(validated);
    },
};
