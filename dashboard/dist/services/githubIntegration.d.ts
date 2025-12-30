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
