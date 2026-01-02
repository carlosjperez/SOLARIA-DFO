"use strict";
/**
 * GitHub Actions Service
 * DFO 4.0 - Epic 3: GitHub Actions Integration
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-3002
 *
 * Service for GitHub Actions workflow automation:
 * - Trigger GitHub Actions workflows from DFO tasks
 * - Monitor workflow run status
 * - Auto-create GitHub issues from tasks
 * - Auto-create pull requests from tasks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubActionsService = void 0;
const rest_1 = require("@octokit/rest");
// ============================================================================
// GitHubActionsService Class
// ============================================================================
class GitHubActionsService {
    /**
     * Create a new GitHubActionsService instance
     *
     * @param config - GitHub API configuration
     * @param db - Database connection
     *
     * @example
     * const service = new GitHubActionsService(
     *   { token: process.env.GITHUB_TOKEN },
     *   dbConnection
     * );
     */
    constructor(config, db) {
        this.db = db;
        this.octokit = new rest_1.Octokit({
            auth: config.token,
            baseUrl: config.baseUrl || 'https://api.github.com',
            userAgent: config.userAgent || 'SOLARIA-DFO/4.0',
        });
    }
    // ========================================================================
    // Workflow Management
    // ========================================================================
    /**
     * Trigger a GitHub Actions workflow
     *
     * Creates or updates workflow record in DFO and triggers the workflow via GitHub API.
     *
     * @param options - Workflow trigger options
     * @returns Result with workflow and run IDs
     *
     * @example
     * const result = await service.triggerWorkflow({
     *   owner: 'solaria-agency',
     *   repo: 'my-project',
     *   workflowId: 'deploy.yml',
     *   ref: 'main',
     *   projectId: 99,
     *   taskId: 544
     * });
     */
    async triggerWorkflow(options) {
        try {
            const { owner, repo, workflowId, ref, inputs, projectId, taskId } = options;
            const repository = `${owner}/${repo}`;
            // Step 1: Find or create workflow record in DFO
            const [existingWorkflows] = await this.db.query(`SELECT * FROM github_workflows
                 WHERE repository = ? AND workflow_path LIKE ?
                 LIMIT 1`, [repository, `%${workflowId}%`]);
            let dfoWorkflowId;
            if (existingWorkflows.length > 0) {
                dfoWorkflowId = existingWorkflows[0].id;
            }
            else {
                // Create new workflow record
                const [result] = await this.db.query(`INSERT INTO github_workflows
                    (project_id, task_id, workflow_name, workflow_path, repository,
                     trigger_type, enabled, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, 'workflow_dispatch', true, NOW(), NOW())`, [projectId, taskId || null, workflowId, `.github/workflows/${workflowId}`, repository]);
                dfoWorkflowId = result.insertId;
            }
            // Step 2: Trigger workflow via GitHub API
            const response = await this.octokit.actions.createWorkflowDispatch({
                owner,
                repo,
                workflow_id: workflowId,
                ref,
                inputs: inputs, // Octokit expects string values
            });
            // GitHub API returns 204 No Content on success
            if (response.status !== 204) {
                throw new Error(`GitHub API returned unexpected status: ${response.status}`);
            }
            // Step 3: Get the most recent run for this workflow (just triggered)
            // Note: There's a small delay before GitHub creates the run record
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            const runsResponse = await this.octokit.actions.listWorkflowRuns({
                owner,
                repo,
                workflow_id: workflowId,
                per_page: 1,
            });
            const latestRun = runsResponse.data.workflow_runs[0];
            if (!latestRun) {
                throw new Error('No workflow run found after triggering');
            }
            // Step 4: Create workflow run record in DFO
            const [runResult] = await this.db.query(`INSERT INTO github_workflow_runs
                (workflow_id, project_id, task_id, github_run_id, github_run_number,
                 workflow_name, repository, trigger_event, triggered_by, branch,
                 commit_sha, status, run_url, started_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                dfoWorkflowId,
                projectId,
                taskId || null,
                latestRun.id,
                latestRun.run_number,
                latestRun.name,
                repository,
                'workflow_dispatch',
                latestRun.actor?.login || 'unknown',
                ref,
                latestRun.head_sha,
                latestRun.status,
                latestRun.html_url,
                latestRun.run_started_at || null,
            ]);
            const dfoRunId = runResult.insertId;
            // Step 5: Update workflow statistics
            await this.db.query(`UPDATE github_workflows
                 SET last_run_id = ?,
                     last_run_status = ?,
                     last_run_at = NOW(),
                     total_runs = total_runs + 1,
                     updated_at = NOW()
                 WHERE id = ?`, [dfoRunId, latestRun.status === 'completed' ? latestRun.conclusion : 'in_progress', dfoWorkflowId]);
            // Step 6: Log activity
            await this.logActivity(projectId, 'github_workflow', `Triggered workflow: ${workflowId}`, {
                workflow_id: dfoWorkflowId,
                github_run_id: latestRun.id,
                run_number: latestRun.run_number,
                repository,
                ref,
                task_id: taskId,
                workflow_name: workflowId,
                html_url: latestRun.html_url,
            });
            return {
                success: true,
                workflowId: dfoWorkflowId,
                runId: dfoRunId,
                githubRunId: latestRun.id,
            };
        }
        catch (error) {
            return {
                success: false,
                workflowId: 0,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Get workflow run status from GitHub
     *
     * Fetches current status of a workflow run and updates DFO database.
     *
     * @param owner - Repository owner
     * @param repo - Repository name
     * @param runId - GitHub run ID
     * @returns Workflow run status
     *
     * @example
     * const status = await service.getRunStatus('solaria-agency', 'my-project', 12345);
     * console.log(status.conclusion); // 'success', 'failure', etc.
     */
    async getRunStatus(owner, repo, runId) {
        try {
            // Step 1: Fetch run status from GitHub API
            const response = await this.octokit.actions.getWorkflowRun({
                owner,
                repo,
                run_id: runId,
            });
            const run = response.data;
            // Step 2: Calculate duration if completed
            let durationSeconds;
            if (run.run_started_at && run.updated_at) {
                const startTime = new Date(run.run_started_at).getTime();
                const endTime = new Date(run.updated_at).getTime();
                durationSeconds = Math.floor((endTime - startTime) / 1000);
            }
            // Step 3: Update DFO database
            const [existingRuns] = await this.db.query(`SELECT * FROM github_workflow_runs
                 WHERE github_run_id = ?
                 LIMIT 1`, [runId]);
            if (existingRuns.length > 0) {
                // Update existing run record
                await this.db.query(`UPDATE github_workflow_runs
                     SET status = ?,
                         conclusion = ?,
                         started_at = ?,
                         completed_at = ?,
                         duration_seconds = ?,
                         updated_at = NOW()
                     WHERE github_run_id = ?`, [
                    run.status,
                    run.conclusion || null,
                    run.run_started_at || null,
                    run.status === 'completed' ? run.updated_at : null,
                    durationSeconds || null,
                    runId,
                ]);
                // Update workflow statistics if completed
                if (run.status === 'completed') {
                    const workflowId = existingRuns[0].workflow_id;
                    const isSuccess = run.conclusion === 'success';
                    await this.db.query(`UPDATE github_workflows
                         SET last_run_status = ?,
                             successful_runs = successful_runs + ?,
                             failed_runs = failed_runs + ?,
                             updated_at = NOW()
                         WHERE id = ?`, [
                        run.conclusion,
                        isSuccess ? 1 : 0,
                        isSuccess ? 0 : 1,
                        workflowId,
                    ]);
                }
            }
            // Step 4: Return status
            return {
                id: run.id,
                status: run.status,
                conclusion: run.conclusion,
                runNumber: run.run_number,
                htmlUrl: run.html_url,
                startedAt: run.run_started_at || undefined,
                completedAt: run.status === 'completed' ? run.updated_at : undefined,
                durationSeconds,
            };
        }
        catch (error) {
            throw new Error(`Failed to get workflow run status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // ========================================================================
    // Issue Management
    // ========================================================================
    /**
     * Create a GitHub issue from a DFO task
     *
     * Creates an issue in GitHub and links it to the DFO task via github_task_links.
     *
     * @param options - Issue creation options
     * @returns Result with issue number and URL
     *
     * @example
     * const result = await service.createIssue({
     *   owner: 'solaria-agency',
     *   repo: 'my-project',
     *   title: 'Fix login bug',
     *   body: 'Description of the issue',
     *   labels: ['bug', 'priority-high'],
     *   taskId: 544,
     *   projectId: 99
     * });
     */
    async createIssue(options) {
        try {
            const { owner, repo, title, body, labels, assignees, taskId, projectId } = options;
            const repository = `${owner}/${repo}`;
            // Step 1: Create issue via GitHub API
            const response = await this.octokit.issues.create({
                owner,
                repo,
                title,
                body,
                labels: labels || [],
                assignees: assignees || [],
            });
            const issue = response.data;
            // Step 2: Create task link record in DFO
            const [linkResult] = await this.db.query(`INSERT INTO github_task_links
                (task_id, project_id, resource_type, repository, github_issue_number,
                 title, description, github_url, resource_status, sync_status,
                 last_synced_at, auto_created, created_at, updated_at)
                VALUES (?, ?, 'issue', ?, ?, ?, ?, ?, ?, 'synced', NOW(), true, NOW(), NOW())`, [
                taskId,
                projectId,
                repository,
                issue.number,
                issue.title,
                issue.body || null,
                issue.html_url,
                issue.state, // 'open' or 'closed'
            ]);
            const taskLinkId = linkResult.insertId;
            // Step 3: Log activity
            await this.logActivity(projectId, 'github_issue', `Created GitHub issue #${issue.number}`, {
                issue_number: issue.number,
                issue_url: issue.html_url,
                task_id: taskId,
                task_link_id: taskLinkId,
                repository,
                title: issue.title,
                labels: labels || [],
            });
            return {
                success: true,
                issueNumber: issue.number,
                issueUrl: issue.html_url,
                taskLinkId,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    // ========================================================================
    // Pull Request Management
    // ========================================================================
    /**
     * Create a GitHub pull request from a DFO task
     *
     * Creates a PR in GitHub and links it to the DFO task via github_task_links.
     *
     * @param options - PR creation options
     * @returns Result with PR number and URL
     *
     * @example
     * const result = await service.createPR({
     *   owner: 'solaria-agency',
     *   repo: 'my-project',
     *   title: 'Feature: User authentication',
     *   body: 'Implements JWT authentication',
     *   head: 'feature/auth',
     *   base: 'main',
     *   taskId: 544,
     *   projectId: 99
     * });
     */
    async createPR(options) {
        try {
            const { owner, repo, title, body, head, base, labels, assignees, taskId, projectId } = options;
            const repository = `${owner}/${repo}`;
            // Step 1: Create pull request via GitHub API
            const response = await this.octokit.pulls.create({
                owner,
                repo,
                title,
                body,
                head,
                base,
            });
            const pr = response.data;
            // Step 2: Add labels if provided
            if (labels && labels.length > 0) {
                await this.octokit.issues.addLabels({
                    owner,
                    repo,
                    issue_number: pr.number,
                    labels,
                });
            }
            // Step 3: Add assignees if provided
            if (assignees && assignees.length > 0) {
                await this.octokit.issues.addAssignees({
                    owner,
                    repo,
                    issue_number: pr.number,
                    assignees,
                });
            }
            // Step 4: Create task link record in DFO
            const [linkResult] = await this.db.query(`INSERT INTO github_task_links
                (task_id, project_id, resource_type, repository, github_pr_number,
                 branch_name, title, description, github_url, resource_status,
                 sync_status, last_synced_at, auto_created, created_at, updated_at)
                VALUES (?, ?, 'pull_request', ?, ?, ?, ?, ?, ?, ?, 'synced', NOW(), true, NOW(), NOW())`, [
                taskId,
                projectId,
                repository,
                pr.number,
                head, // branch name
                pr.title,
                pr.body || null,
                pr.html_url,
                pr.state, // 'open' or 'closed'
            ]);
            const taskLinkId = linkResult.insertId;
            // Step 5: Log activity
            await this.logActivity(projectId, 'github_pr', `Created GitHub PR #${pr.number}`, {
                pr_number: pr.number,
                pr_url: pr.html_url,
                task_id: taskId,
                task_link_id: taskLinkId,
                repository,
                title: pr.title,
                head,
                base,
                labels: labels || [],
            });
            return {
                success: true,
                prNumber: pr.number,
                prUrl: pr.html_url,
                taskLinkId,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    // ========================================================================
    // Private Helper Methods
    // ========================================================================
    /**
     * Log activity to DFO activity_logs table
     */
    async logActivity(projectId, category, action, metadata) {
        try {
            await this.db.query(`INSERT INTO activity_logs
                (project_id, category, action, level, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())`, [projectId, category, action, 'info', JSON.stringify(metadata)]);
        }
        catch (error) {
            console.error('Failed to log activity:', error);
            // Don't throw - logging failure shouldn't break the main operation
        }
    }
}
exports.GitHubActionsService = GitHubActionsService;
