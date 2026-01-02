/**
 * GitHub Actions Integration Endpoint Implementation
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-3003
 *
 * Provides MCP tools for GitHub Actions integration:
 * - Trigger workflows from DFO tasks
 * - Monitor workflow run status
 * - Auto-create GitHub issues from tasks
 * - Auto-create GitHub pull requests from tasks
 */
import { z } from 'zod';
import { ResponseBuilder, CommonErrors } from '../utils/response-builder.js';
import { db } from '../database.js';
import { GitHubActionsService } from '../../../dashboard/services/githubActionsService.js';
const VERSION = '1.0.0';
// ============================================================================
// Validation Schemas
// ============================================================================
/**
 * Schema for triggering a GitHub Actions workflow
 */
const TriggerWorkflowInputSchema = z.object({
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    workflow_id: z.string().min(1, 'Workflow ID or filename is required'),
    ref: z.string().min(1, 'Git ref (branch/tag/sha) is required').default('main'),
    inputs: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    project_id: z.number().int().positive(),
    task_id: z.number().int().positive().optional(),
    format: z.enum(['json', 'human']).default('json'),
});
/**
 * Schema for getting workflow run status
 */
const GetWorkflowStatusInputSchema = z.object({
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    github_run_id: z.number().int().positive(),
    format: z.enum(['json', 'human']).default('json'),
});
/**
 * Schema for creating GitHub issue from task
 */
const CreateIssueFromTaskInputSchema = z.object({
    task_id: z.number().int().positive(),
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
    format: z.enum(['json', 'human']).default('json'),
});
/**
 * Schema for creating GitHub PR from task
 */
const CreatePRFromTaskInputSchema = z.object({
    task_id: z.number().int().positive(),
    owner: z.string().min(1, 'Repository owner is required'),
    repo: z.string().min(1, 'Repository name is required'),
    head_branch: z.string().min(1, 'Head branch is required'),
    base_branch: z.string().min(1, 'Base branch is required').default('main'),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    format: z.enum(['json', 'human']).default('json'),
});
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Get GitHubActionsService instance
 */
function getGitHubService() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('GITHUB_TOKEN environment variable not configured');
    }
    const config = {
        token,
        baseUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
        userAgent: 'SOLARIA-DFO/4.0',
    };
    return new GitHubActionsService(config, db);
}
/**
 * Check if a task exists and return its details
 */
async function getTaskDetails(taskId) {
    const result = await db.query(`SELECT
            t.id,
            CONCAT(p.code, '-', t.task_number) as code,
            t.title,
            t.description,
            t.status,
            t.project_id
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.id = ?`, [taskId]);
    return result.length > 0 ? result[0] : null;
}
/**
 * Format workflow trigger result for human output
 */
function formatTriggerResult(workflowName, runNumber, runUrl, status) {
    const lines = [
        '✅ Workflow Triggered Successfully',
        '',
        `Workflow: ${workflowName}`,
    ];
    if (runNumber) {
        lines.push(`Run #: ${runNumber}`);
    }
    lines.push(`Status: ${status}`);
    if (runUrl) {
        lines.push('', `View run: ${runUrl}`);
    }
    return lines.join('\n');
}
/**
 * Format workflow status for human output
 */
function formatWorkflowStatus(status) {
    const lines = [
        `🔄 Workflow Run #${status.runNumber}`,
        '',
        `Status: ${status.status}`,
    ];
    if (status.conclusion) {
        const icon = status.conclusion === 'success' ? '✅' : status.conclusion === 'failure' ? '❌' : '⚠️';
        lines.push(`Conclusion: ${icon} ${status.conclusion}`);
    }
    if (status.startedAt) {
        lines.push(`Started: ${new Date(status.startedAt).toLocaleString()}`);
    }
    if (status.completedAt) {
        lines.push(`Completed: ${new Date(status.completedAt).toLocaleString()}`);
    }
    if (status.durationSeconds) {
        const minutes = Math.floor(status.durationSeconds / 60);
        const seconds = status.durationSeconds % 60;
        lines.push(`Duration: ${minutes}m ${seconds}s`);
    }
    lines.push('', `View: ${status.htmlUrl}`);
    return lines.join('\n');
}
/**
 * Format issue creation result for human output
 */
function formatIssueResult(taskCode, issueNumber, issueUrl) {
    return [
        '✅ GitHub Issue Created',
        '',
        `Task: ${taskCode}`,
        `Issue: #${issueNumber}`,
        '',
        `View: ${issueUrl}`,
    ].join('\n');
}
/**
 * Format PR creation result for human output
 */
function formatPRResult(taskCode, prNumber, prUrl, isDraft) {
    return [
        `✅ GitHub Pull Request Created${isDraft ? ' (Draft)' : ''}`,
        '',
        `Task: ${taskCode}`,
        `PR: #${prNumber}`,
        '',
        `View: ${prUrl}`,
    ].join('\n');
}
// ============================================================================
// Endpoint Implementations
// ============================================================================
/**
 * Trigger a GitHub Actions workflow
 */
export const triggerWorkflow = {
    name: 'github_trigger_workflow',
    description: 'Trigger a GitHub Actions workflow from a DFO task. Creates workflow run record and links it to the task.',
    inputSchema: TriggerWorkflowInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            const service = getGitHubService();
            const options = {
                owner: params.owner,
                repo: params.repo,
                workflowId: params.workflow_id,
                ref: params.ref,
                inputs: params.inputs,
                projectId: params.project_id,
                taskId: params.task_id,
            };
            const result = await service.triggerWorkflow(options);
            if (!result.success) {
                return builder.error({
                    code: 'WORKFLOW_TRIGGER_FAILED',
                    message: result.error || 'Failed to trigger workflow',
                    details: { options },
                    suggestion: 'Check GitHub token permissions and workflow configuration',
                });
            }
            // Fetch the created run details for response
            const runDetails = await db.query(`SELECT
                    workflow_name,
                    github_run_number,
                    run_url,
                    status
                FROM github_workflow_runs
                WHERE id = ?`, [result.runId]);
            const run = runDetails[0];
            const data = {
                success: true,
                workflow_id: result.workflowId,
                run_id: result.runId,
                github_run_id: result.githubRunId,
                workflow_name: run?.workflow_name,
                run_number: run?.github_run_number,
                run_url: run?.run_url,
                status: run?.status,
            };
            const formatted = params.format === 'human'
                ? formatTriggerResult(run?.workflow_name || params.workflow_id, run?.github_run_number, run?.run_url, run?.status || 'queued')
                : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
/**
 * Get GitHub Actions workflow run status
 */
export const getWorkflowStatus = {
    name: 'github_get_workflow_status',
    description: 'Get the current status of a GitHub Actions workflow run. Updates DFO records with latest status.',
    inputSchema: GetWorkflowStatusInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            const service = getGitHubService();
            const status = await service.getRunStatus(params.owner, params.repo, params.github_run_id);
            const data = {
                github_run_id: status.id,
                run_number: status.runNumber,
                status: status.status,
                conclusion: status.conclusion,
                started_at: status.startedAt,
                completed_at: status.completedAt,
                duration_seconds: status.durationSeconds,
                html_url: status.htmlUrl,
            };
            const formatted = params.format === 'human' ? formatWorkflowStatus(status) : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
/**
 * Create GitHub issue from DFO task
 */
export const createIssueFromTask = {
    name: 'github_create_issue_from_task',
    description: 'Automatically create a GitHub issue from a DFO task. Uses task title and description, links issue to task.',
    inputSchema: CreateIssueFromTaskInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            // Verify task exists
            const task = await getTaskDetails(params.task_id);
            if (!task) {
                return builder.error(CommonErrors.notFound('task', params.task_id));
            }
            const service = getGitHubService();
            // Prepare issue body with task context
            const body = [
                task.description || 'No description provided',
                '',
                '---',
                `**DFO Task:** ${task.code}`,
                `**Status:** ${task.status}`,
                `**Created from:** SOLARIA DFO`,
            ].join('\n');
            const options = {
                owner: params.owner,
                repo: params.repo,
                title: `[${task.code}] ${task.title}`,
                body,
                labels: params.labels,
                assignees: params.assignees,
                projectId: task.project_id,
                taskId: task.id,
            };
            const result = await service.createIssue(options);
            if (!result.success) {
                return builder.error({
                    code: 'ISSUE_CREATION_FAILED',
                    message: result.error || 'Failed to create GitHub issue',
                    details: { task_id: params.task_id, options },
                    suggestion: 'Check GitHub token permissions and repository access',
                });
            }
            const data = {
                success: true,
                task_id: task.id,
                task_code: task.code,
                issue_number: result.issueNumber,
                issue_url: result.issueUrl,
                task_link_id: result.taskLinkId,
            };
            const formatted = params.format === 'human'
                ? formatIssueResult(task.code, result.issueNumber, result.issueUrl)
                : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
/**
 * Create GitHub pull request from DFO task
 */
export const createPRFromTask = {
    name: 'github_create_pr_from_task',
    description: 'Automatically create a GitHub pull request from a DFO task. Uses task title and description, links PR to task.',
    inputSchema: CreatePRFromTaskInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            // Verify task exists
            const task = await getTaskDetails(params.task_id);
            if (!task) {
                return builder.error(CommonErrors.notFound('task', params.task_id));
            }
            const service = getGitHubService();
            // Prepare PR body with task context
            const body = [
                '## Description',
                task.description || 'No description provided',
                '',
                '## Changes',
                '- [ ] Implementation complete',
                '- [ ] Tests added/updated',
                '- [ ] Documentation updated',
                '',
                '---',
                `**DFO Task:** ${task.code}`,
                `**Status:** ${task.status}`,
                `**Created from:** SOLARIA DFO`,
            ].join('\n');
            const options = {
                owner: params.owner,
                repo: params.repo,
                title: `[${task.code}] ${task.title}`,
                body,
                headBranch: params.head_branch,
                baseBranch: params.base_branch,
                labels: params.labels,
                assignees: params.assignees,
                draft: params.draft,
                projectId: task.project_id,
                taskId: task.id,
            };
            const result = await service.createPR(options);
            if (!result.success) {
                return builder.error({
                    code: 'PR_CREATION_FAILED',
                    message: result.error || 'Failed to create GitHub pull request',
                    details: { task_id: params.task_id, options },
                    suggestion: 'Check GitHub token permissions, branch existence, and ensure head branch has commits',
                });
            }
            const data = {
                success: true,
                task_id: task.id,
                task_code: task.code,
                pr_number: result.prNumber,
                pr_url: result.prUrl,
                task_link_id: result.taskLinkId,
                draft: params.draft,
            };
            const formatted = params.format === 'human'
                ? formatPRResult(task.code, result.prNumber, result.prUrl, params.draft)
                : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
// ============================================================================
// Export
// ============================================================================
export const githubActionsTools = [
    triggerWorkflow,
    getWorkflowStatus,
    createIssueFromTask,
    createPRFromTask,
];
//# sourceMappingURL=github-actions.js.map