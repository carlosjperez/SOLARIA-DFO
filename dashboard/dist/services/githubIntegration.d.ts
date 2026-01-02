/**
 * GitHub Webhook Integration
 * SOL-5: Auto-sync commits → DFO tasks
 *
 * Handles GitHub push events and auto-updates DFO tasks referenced in commits.
 */
import type { Connection } from 'mysql2/promise';
export interface GitHubCommit {
    id: string;
    message: string;
    author: {
        name: string;
        email: string;
    };
    url: string;
    timestamp: string;
}
export interface GitHubPushPayload {
    ref: string;
    commits: GitHubCommit[];
    repository: {
        name: string;
        full_name: string;
    };
    pusher: {
        name: string;
    };
}
/**
 * Process GitHub push webhook
 * Extracts DFO task references from commit messages and updates tasks
 */
export declare function handleGitHubPush(payload: GitHubPushPayload, db: Connection): Promise<{
    status: string;
    processed: number;
    errors: string[];
}>;
/**
 * Verify GitHub webhook signature (HMAC SHA-256)
 * Ensures webhook requests are authentic
 */
export declare function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean;
export interface GitHubWorkflowRunPayload {
    action: 'queued' | 'in_progress' | 'completed' | 'requested';
    workflow_run: {
        id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        run_number: number;
        event: string;
        status: string;
        conclusion: string | null;
        workflow_id: number;
        html_url: string;
        created_at: string;
        updated_at: string;
        run_started_at: string | null;
    };
    repository: {
        name: string;
        full_name: string;
    };
    sender: {
        login: string;
    };
}
/**
 * Process GitHub Actions workflow_run webhook
 * Updates github_workflow_runs table and emits Socket.IO events
 */
export declare function handleWorkflowRunEvent(payload: GitHubWorkflowRunPayload, db: Connection, io?: any): Promise<{
    status: string;
    updated: boolean;
    error?: string;
}>;
