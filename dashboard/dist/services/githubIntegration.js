"use strict";
/**
 * GitHub Webhook Integration
 * SOL-5: Auto-sync commits → DFO tasks
 *
 * Handles GitHub push events and auto-updates DFO tasks referenced in commits.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGitHubPush = handleGitHubPush;
exports.verifyGitHubSignature = verifyGitHubSignature;
const crypto = __importStar(require("crypto"));
/**
 * Process GitHub push webhook
 * Extracts DFO task references from commit messages and updates tasks
 */
async function handleGitHubPush(payload, db) {
    const errors = [];
    let processed = 0;
    // Only process pushes to main branch
    if (payload.ref !== 'refs/heads/main') {
        return {
            status: 'skipped',
            processed: 0,
            errors: [`Branch ${payload.ref} ignored - only main branch is processed`],
        };
    }
    for (const commit of payload.commits) {
        try {
            await processCommit(commit, payload, db);
            processed++;
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            errors.push(`Commit ${commit.id.substring(0, 7)}: ${errMsg}`);
        }
    }
    return {
        status: processed > 0 ? 'processed' : 'no_tasks_found',
        processed,
        errors,
    };
}
/**
 * Process a single commit
 * Extracts [DFO-XXX] references and updates corresponding tasks
 */
async function processCommit(commit, payload, db) {
    const message = commit.message;
    // Extract all [DFO-XXX] references from commit message
    const matches = Array.from(message.matchAll(/\[DFO-(\d+)\]/g));
    if (matches.length === 0) {
        // No DFO references in this commit
        return;
    }
    for (const match of matches) {
        const taskNumber = parseInt(match[1], 10);
        try {
            // Find task by task_code (DFO-XXX)
            const taskCode = `DFO-${taskNumber}`;
            const [tasks] = await db.query('SELECT * FROM tasks WHERE task_code = ? LIMIT 1', [taskCode]);
            if (tasks.length === 0) {
                console.warn(`Task ${taskCode} not found in DFO`);
                continue;
            }
            const task = tasks[0];
            // Log commit activity
            await db.query(`INSERT INTO activity_logs
        (project_id, category, action, level, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`, [
                task.project_id,
                'git_commit',
                `Commit ${commit.id.substring(0, 7)} references ${taskCode}`,
                'info',
                JSON.stringify({
                    commit_sha: commit.id,
                    commit_message: message,
                    author: commit.author.name,
                    author_email: commit.author.email,
                    url: commit.url,
                    repository: payload.repository.full_name,
                    branch: payload.ref,
                    timestamp: commit.timestamp,
                }),
            ]);
            // Check if commit message indicates task completion
            const completionKeywords = /\b(completes?|closes?|fixes?|resolves?|finished?|done)\b.*DFO-\d+/i;
            if (message.match(completionKeywords) && task.status !== 'completed') {
                const completionNotes = `Auto-completed from commit ${commit.id.substring(0, 7)}: ${message}`;
                // Auto-complete the task
                await db.query(`UPDATE tasks
           SET status = 'completed',
               progress = 100,
               completion_notes = ?,
               completed_at = NOW(),
               updated_at = NOW()
           WHERE id = ?`, [completionNotes, task.id]);
                console.log(`✅ Auto-completed task ${taskCode} from commit ${commit.id.substring(0, 7)}`);
                // Log completion activity
                await db.query(`INSERT INTO activity_logs
          (project_id, category, action, level, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())`, [
                    task.project_id,
                    'task_update',
                    `Task ${taskCode} auto-completed from Git commit`,
                    'info',
                    JSON.stringify({
                        commit_sha: commit.id,
                        commit_message: message,
                        author: commit.author.name,
                    }),
                ]);
            }
            else {
                console.log(`📝 Referenced task ${taskCode} in commit ${commit.id.substring(0, 7)}`);
            }
        }
        catch (error) {
            console.error(`Error processing task DFO-${taskNumber}:`, error);
            throw error;
        }
    }
}
/**
 * Verify GitHub webhook signature (HMAC SHA-256)
 * Ensures webhook requests are authentic
 */
function verifyGitHubSignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
//# sourceMappingURL=githubIntegration.js.map