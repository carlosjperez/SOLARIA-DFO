/**
 * SOLARIA DFO - GitHub Actions Repository (Drizzle ORM)
 * Handles GitHub workflow runs and workflows data access
 *
 * Updated: 2026-01-12 - Phase 2.4: Migrated from pool to Drizzle
 */

import { db } from '../index.js';
import { eq, sql } from 'drizzle-orm';
import {
    githubWorkflows,
    githubWorkflowRuns,
    type GitHubWorkflow,
    type NewGitHubWorkflow,
    type GitHubWorkflowRun,
    type NewGitHubWorkflowRun,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// GitHub Workflows Repository Class
// ============================================================================

class GitHubWorkflowsRepository extends BaseRepository<GitHubWorkflow, NewGitHubWorkflow, typeof githubWorkflows> {
    constructor() {
        super(githubWorkflows, 'GitHubWorkflow');
    }

    /**
     * Find workflow by repository and path
     */
    async findByRepoAndPath(repository: string, workflowPath: string): Promise<GitHubWorkflow | null> {
        const result = await db
            .select()
            .from(githubWorkflows)
            .where(
                sql`${githubWorkflows.repository} = ${repository} AND ${githubWorkflows.workflowPath} = ${workflowPath}`
            )
            .limit(1);
        return result[0] || null;
    }

    /**
     * Find workflows by project
     */
    async findByProject(projectId: number): Promise<GitHubWorkflow[]> {
        return db
            .select()
            .from(githubWorkflows)
            .where(eq(githubWorkflows.projectId, projectId));
    }

    /**
     * Find enabled workflows
     */
    async findEnabled(): Promise<GitHubWorkflow[]> {
        return db
            .select()
            .from(githubWorkflows)
            .where(eq(githubWorkflows.enabled, true));
    }
}

// ============================================================================
// GitHub Workflow Runs Repository Class
// ============================================================================

class GitHubWorkflowRunsRepository extends BaseRepository<GitHubWorkflowRun, NewGitHubWorkflowRun, typeof githubWorkflowRuns> {
    constructor() {
        super(githubWorkflowRuns, 'GitHubWorkflowRun');
    }

    /**
     * Find workflow run by ID with owner and repo information
     * Uses JOIN with workflows table to get repository details
     */
    async findByIdWithRepo(runId: number) {
        const result = await db.execute(sql`
            SELECT wr.github_run_id, w.repository as repo,
                   SUBSTRING_INDEX(w.repository, '/', 1) as owner
            FROM github_workflow_runs wr
            JOIN github_workflows w ON wr.workflow_id = w.id
            WHERE wr.id = ${runId}
        `);
        return result;
    }

    /**
     * Find runs by workflow ID
     */
    async findByWorkflow(workflowId: number): Promise<GitHubWorkflowRun[]> {
        return db
            .select()
            .from(githubWorkflowRuns)
            .where(eq(githubWorkflowRuns.workflowId, workflowId));
    }

    /**
     * Find runs by GitHub run ID
     */
    async findByGitHubRunId(githubRunId: number): Promise<GitHubWorkflowRun | null> {
        const result = await db
            .select()
            .from(githubWorkflowRuns)
            .where(eq(githubWorkflowRuns.githubRunId, githubRunId))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Find runs by project
     */
    async findByProject(projectId: number): Promise<GitHubWorkflowRun[]> {
        return db
            .select()
            .from(githubWorkflowRuns)
            .where(eq(githubWorkflowRuns.projectId, projectId));
    }
}

// ============================================================================
// Singleton Instances
// ============================================================================

const githubWorkflowsRepo = new GitHubWorkflowsRepository();
const githubWorkflowRunsRepo = new GitHubWorkflowRunsRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Find workflow run by ID with owner/repo info
 * @deprecated Use githubWorkflowRunsRepo.findByIdWithRepo() directly
 */
export async function findWorkflowRunById(runId: number) {
    return githubWorkflowRunsRepo.findByIdWithRepo(runId);
}

// Export repository instances for direct usage
export { githubWorkflowsRepo, githubWorkflowRunsRepo };
