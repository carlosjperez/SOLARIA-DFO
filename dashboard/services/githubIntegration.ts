/**
 * GitHub Webhook Integration
 * SOL-5: Auto-sync commits → DFO tasks
 *
 * Handles GitHub push events and auto-updates DFO tasks referenced in commits.
 */

import type { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import * as crypto from 'crypto';

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
export async function handleGitHubPush(
  payload: GitHubPushPayload,
  db: Connection
): Promise<{ status: string; processed: number; errors: string[] }> {
  const errors: string[] = [];
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
    } catch (error) {
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
async function processCommit(
  commit: GitHubCommit,
  payload: GitHubPushPayload,
  db: Connection
): Promise<void> {
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
      const [tasks] = await db.query<RowDataPacket[]>(
        'SELECT * FROM tasks WHERE task_code = ? LIMIT 1',
        [taskCode]
      );

      if (tasks.length === 0) {
        console.warn(`Task ${taskCode} not found in DFO`);
        continue;
      }

      const task = tasks[0];

      // Log commit activity
      await db.query(
        `INSERT INTO activity_logs
        (project_id, category, action, level, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
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
        ]
      );

      // Check if commit message indicates task completion
      const completionKeywords =
        /\b(completes?|closes?|fixes?|resolves?|finished?|done)\b.*DFO-\d+/i;

      if (message.match(completionKeywords) && task.status !== 'completed') {
        const completionNotes = `Auto-completed from commit ${commit.id.substring(
          0,
          7
        )}: ${message}`;

        // Auto-complete the task
        await db.query(
          `UPDATE tasks
           SET status = 'completed',
               progress = 100,
               completion_notes = ?,
               completed_at = NOW(),
               updated_at = NOW()
           WHERE id = ?`,
          [completionNotes, task.id]
        );

        console.log(
          `✅ Auto-completed task ${taskCode} from commit ${commit.id.substring(
            0,
            7
          )}`
        );

        // Log completion activity
        await db.query(
          `INSERT INTO activity_logs
          (project_id, category, action, level, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            task.project_id,
            'task_update',
            `Task ${taskCode} auto-completed from Git commit`,
            'info',
            JSON.stringify({
              commit_sha: commit.id,
              commit_message: message,
              author: commit.author.name,
            }),
          ]
        );
      } else {
        console.log(
          `📝 Referenced task ${taskCode} in commit ${commit.id.substring(
            0,
            7
          )}`
        );
      }
    } catch (error) {
      console.error(`Error processing task DFO-${taskNumber}:`, error);
      throw error;
    }
  }
}

/**
 * Verify GitHub webhook signature (HMAC SHA-256)
 * Ensures webhook requests are authentic
 */
export function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
