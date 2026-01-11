/**
 * SOLARIA DFO - GitHub Actions Repository (Drizzle ORM)
 * Handles GitHub workflow runs and workflows data access
 */

import { pool } from '../index.js';

// ============================================================================
// GitHub Workflow Runs
// ============================================================================

export async function findWorkflowRunById(runId: number) {
    return pool.execute(`
        SELECT wr.github_run_id, w.owner, w.repo
        FROM github_workflow_runs wr
        JOIN github_workflows w ON wr.workflow_id = w.id
        WHERE wr.id = ?
    `, [runId]);
}
