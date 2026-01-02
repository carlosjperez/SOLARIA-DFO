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
import type { Connection } from 'mysql2/promise';
/**
 * Configuration for GitHubActionsService
 */
export interface GitHubActionsConfig {
    /** GitHub Personal Access Token or GitHub App token */
    token: string;
    /** Base URL for GitHub API (default: https://api.github.com) */
    baseUrl?: string;
    /** User agent for API requests */
    userAgent?: string;
}
/**
 * Options for triggering a workflow
 */
export interface TriggerWorkflowOptions {
    /** Repository owner */
    owner: string;
    /** Repository name */
    repo: string;
    /** Workflow file name or ID */
    workflowId: string;
    /** Git ref (branch, tag, or SHA) */
    ref: string;
    /** Optional inputs for the workflow */
    inputs?: Record<string, string | number | boolean>;
    /** DFO project ID */
    projectId: number;
    /** Optional DFO task ID that triggered this workflow */
    taskId?: number;
}
/**
 * Result of triggering a workflow
 */
export interface TriggerWorkflowResult {
    success: boolean;
    workflowId: number;
    runId?: number;
    githubRunId?: number;
    error?: string;
}
/**
 * Workflow run status from GitHub
 */
export interface WorkflowRunStatus {
    id: number;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | 'neutral';
    runNumber: number;
    htmlUrl: string;
    startedAt?: string;
    completedAt?: string;
    durationSeconds?: number;
}
/**
 * Options for creating a GitHub issue
 */
export interface CreateIssueOptions {
    /** Repository owner */
    owner: string;
    /** Repository name */
    repo: string;
    /** Issue title */
    title: string;
    /** Issue body/description */
    body: string;
    /** Optional labels */
    labels?: string[];
    /** Optional assignees */
    assignees?: string[];
    /** DFO task ID */
    taskId: number;
    /** DFO project ID */
    projectId: number;
}
/**
 * Result of creating an issue
 */
export interface CreateIssueResult {
    success: boolean;
    issueNumber?: number;
    issueUrl?: string;
    taskLinkId?: number;
    error?: string;
}
/**
 * Options for creating a pull request
 */
export interface CreatePROptions {
    /** Repository owner */
    owner: string;
    /** Repository name */
    repo: string;
    /** PR title */
    title: string;
    /** PR body/description */
    body: string;
    /** Head branch (source) */
    head: string;
    /** Base branch (target) */
    base: string;
    /** Optional labels */
    labels?: string[];
    /** Optional assignees */
    assignees?: string[];
    /** DFO task ID */
    taskId: number;
    /** DFO project ID */
    projectId: number;
}
/**
 * Result of creating a PR
 */
export interface CreatePRResult {
    success: boolean;
    prNumber?: number;
    prUrl?: string;
    taskLinkId?: number;
    error?: string;
}
export declare class GitHubActionsService {
    private octokit;
    private db;
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
    constructor(config: GitHubActionsConfig, db: Connection);
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
    triggerWorkflow(options: TriggerWorkflowOptions): Promise<TriggerWorkflowResult>;
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
    getRunStatus(owner: string, repo: string, runId: number): Promise<WorkflowRunStatus>;
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
    createIssue(options: CreateIssueOptions): Promise<CreateIssueResult>;
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
    createPR(options: CreatePROptions): Promise<CreatePRResult>;
    /**
     * Log activity to DFO activity_logs table
     */
    private logActivity;
}
