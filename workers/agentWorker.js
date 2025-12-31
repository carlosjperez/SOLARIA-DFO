/**
 * SOLARIA DFO - Agent Execution Worker (ESM version for /workers)
 * Processes agent execution jobs from BullMQ queue
 */

import { Worker } from 'bullmq';
import mysql from 'mysql2/promise';
import Redis from 'ioredis';

// ============================================================================
// Configuration
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'agent-execution';

const dbConfig = {
    host: process.env.DB_HOST || 'office',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'solaria_user',
    password: process.env.DB_PASSWORD || 'solaria2024',
    database: process.env.DB_NAME || 'solaria_construction',
};

// ============================================================================
// Database Connection
// ============================================================================

let db;

async function connectToDatabase() {
    const maxRetries = 10;
    const retryDelay = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[agentWorker] Attempting database connection (${attempt}/${maxRetries})...`);

            const connection = await mysql.createConnection(dbConfig);

            console.log('[agentWorker] ✓ Database connected successfully');
            return connection;
        } catch (error) {
            console.error(`[agentWorker] Database connection attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                console.log(`[agentWorker] Retrying in ${retryDelay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            } else {
                throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
            }
        }
    }
}

// ============================================================================
// Context Loading
// ============================================================================

async function loadTaskContext(jobData) {
    const { taskId, projectId } = jobData;

    console.log(`[agentWorker] Loading context for task ${taskId}...`);

    // Load task details
    const [taskRows] = await db.execute(
        `SELECT
            t.*,
            p.name as project_name,
            p.code as project_code,
            e.name as epic_name,
            s.name as sprint_name,
            (SELECT COUNT(*) FROM task_items WHERE task_id = t.id) as items_total,
            (SELECT COUNT(*) FROM task_items WHERE task_id = t.id AND is_completed = 1) as items_completed
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN epics e ON t.epic_id = e.id
        LEFT JOIN sprints s ON t.sprint_id = s.id
        WHERE t.id = ?`,
        [taskId]
    );

    const task = taskRows[0];

    if (!task) {
        throw new Error(`Task ${taskId} not found in database`);
    }

    // Load task items
    const [itemRows] = await db.execute(
        `SELECT * FROM task_items WHERE task_id = ? ORDER BY sort_order ASC`,
        [taskId]
    );

    console.log(`[agentWorker] Task loaded: ${task.title} (${itemRows.length} items)`);

    // Load dependencies
    const [depRows] = await db.execute(
        `SELECT
            td.*,
            t1.title as source_task_title,
            t1.status as source_task_status,
            t2.title as target_task_title,
            t2.status as target_task_status
        FROM task_dependencies td
        LEFT JOIN tasks t1 ON td.source_task_id = t1.id
        LEFT JOIN tasks t2 ON td.target_task_id = t2.id
        WHERE td.source_task_id = ? OR td.target_task_id = ?`,
        [taskId, taskId]
    );

    console.log(`[agentWorker] Loaded ${depRows.length} dependencies`);

    // Load memories
    const searchTerms = [
        task.task_code,
        task.project_code,
        task.title.split(' ').slice(0, 3).join(' '),
    ]
        .filter(Boolean)
        .join(' ');

    const [memoryRows] = await db.execute(
        `SELECT m.*
        FROM memories m
        WHERE (m.project_id = ? OR m.project_id IS NULL)
          AND MATCH(m.content, m.summary) AGAINST(? IN BOOLEAN MODE)
        ORDER BY m.importance DESC, m.created_at DESC
        LIMIT 10`,
        [projectId, searchTerms]
    );

    console.log(`[agentWorker] Loaded ${memoryRows.length} relevant memories`);

    return {
        task: {
            ...task,
            items: itemRows,
            items_pending: itemRows.filter((i) => !i.is_completed),
            items_completed_count: itemRows.filter((i) => i.is_completed).length,
        },
        dependencies: {
            all: depRows,
            blockers: depRows.filter(
                (d) => d.target_task_id === taskId && d.dependency_type === 'blocks' && d.source_task_status !== 'completed'
            ),
        },
        memories: memoryRows.map((m) => ({
            id: m.id,
            content: m.content,
            summary: m.summary,
            importance: m.importance,
        })),
    };
}

// ============================================================================
// Job Processing
// ============================================================================

async function processAgentJob(job) {
    const startTime = Date.now();
    const { taskId, taskCode, agentId, agentName, projectId } = job.data;

    console.log(`[agentWorker] =========================================`);
    console.log(`[agentWorker] Processing job ${job.id}`);
    console.log(`[agentWorker] Task: ${taskCode} - Agent: ${agentName}`);
    console.log(`[agentWorker] =========================================`);

    try {
        // Phase 1: Context Loading
        await job.updateProgress(5);
        const context = await loadTaskContext(job.data);
        const task = context.task;
        const items = task.items;
        const itemsPending = task.items_pending;

        console.log(`[agentWorker] Context loaded:`);
        console.log(`[agentWorker]   - Items: ${items.length} total, ${itemsPending.length} pending`);
        console.log(`[agentWorker]   - Dependencies: ${context.dependencies.all.length}`);
        console.log(`[agentWorker]   - Memories: ${context.memories.length}`);

        await job.updateProgress(20);

        // Phase 2: Validation
        const blockers = context.dependencies.blockers || [];
        if (blockers.length > 0) {
            console.warn(`[agentWorker] ⚠ Task has ${blockers.length} active blockers`);

            const executionTimeMs = Date.now() - startTime;
            return {
                success: false,
                taskId,
                taskCode,
                itemsCompleted: task.items_completed_count,
                itemsTotal: items.length,
                progress: task.progress || 0,
                executionTimeMs,
                error: {
                    message: `Task blocked by ${blockers.length} incomplete dependencies`,
                    code: 'TASK_BLOCKED',
                },
                taskStatus: 'blocked',
            };
        }

        // Update task status to in_progress
        await db.execute('UPDATE tasks SET status = ?, started_at = NOW() WHERE id = ?', ['in_progress', taskId]);

        console.log(`[agentWorker] ✓ No blockers, proceeding with execution`);
        await job.updateProgress(30);

        // Phase 3: Agent Execution (Placeholder)
        console.log(`[agentWorker] [3/5] Executing agent...`);

        // TODO: Implement actual agent execution
        // For now, this is a placeholder

        for (let progress = 40; progress <= 90; progress += 10) {
            await job.updateProgress(progress);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log(`[agentWorker] ✓ Agent execution completed (placeholder)`);
        await job.updateProgress(90);

        // Phase 4: Finalization
        const executionTimeMs = Date.now() - startTime;
        const itemsCompleted = task.items_completed_count;
        const itemsTotal = items.length;
        const progressPercent = itemsTotal > 0 ? Math.round((itemsCompleted / itemsTotal) * 100) : 100;

        const taskStatus = progressPercent === 100 ? 'completed' : 'in_progress';

        if (taskStatus === 'completed') {
            await db.execute('UPDATE tasks SET status = ?, completed_at = NOW(), progress = 100 WHERE id = ?', [
                'completed',
                taskId,
            ]);
            console.log(`[agentWorker] ✓ Task marked as completed`);
        } else {
            await db.execute('UPDATE tasks SET progress = ? WHERE id = ?', [progressPercent, taskId]);
            console.log(`[agentWorker] Task progress updated: ${progressPercent}%`);
        }

        await job.updateProgress(100);

        console.log(`[agentWorker] =========================================`);
        console.log(`[agentWorker] ✓ Job ${job.id} completed successfully`);
        console.log(`[agentWorker] Time: ${executionTimeMs}ms`);
        console.log(`[agentWorker] Progress: ${progressPercent}% (${itemsCompleted}/${itemsTotal} items)`);
        console.log(`[agentWorker] =========================================`);

        return {
            success: true,
            taskId,
            taskCode,
            itemsCompleted,
            itemsTotal,
            progress: progressPercent,
            executionTimeMs,
            taskStatus,
        };
    } catch (error) {
        const executionTimeMs = Date.now() - startTime;

        console.error(`[agentWorker] =========================================`);
        console.error(`[agentWorker] ✗ Job ${job.id} failed`);
        console.error(`[agentWorker] Error: ${error.message}`);
        console.error(`[agentWorker] =========================================`);

        await db.execute('UPDATE tasks SET status = ? WHERE id = ?', ['blocked', taskId]);

        return {
            success: false,
            taskId,
            taskCode,
            itemsCompleted: 0,
            itemsTotal: 0,
            progress: 0,
            executionTimeMs,
            error: {
                message: error.message,
                code: error.code || 'EXECUTION_ERROR',
            },
            taskStatus: 'blocked',
        };
    }
}

// ============================================================================
// Worker Instance
// ============================================================================

const workerOptions = {
    connection: new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    }),
    concurrency: 5,
    lockDuration: 30000,
    autorun: true,
};

const worker = new Worker(QUEUE_NAME, processAgentJob, workerOptions);

// ============================================================================
// Event Handlers
// ============================================================================

worker.on('ready', () => {
    console.log('[agentWorker] =========================================');
    console.log('[agentWorker] SOLARIA DFO - Agent Execution Worker');
    console.log('[agentWorker] =========================================');
    console.log(`[agentWorker] Queue: ${QUEUE_NAME}`);
    console.log(`[agentWorker] Concurrency: ${workerOptions.concurrency}`);
    console.log('[agentWorker] Status: READY');
    console.log('[agentWorker] =========================================');
});

worker.on('active', (job) => {
    console.log(`[agentWorker] ▶ Job ${job.id} started: ${job.data.taskCode}`);
});

worker.on('completed', async (job, result) => {
    console.log(`[agentWorker] ✓ Job ${job.id} completed: ${result.taskCode} (${result.executionTimeMs}ms)`);

    try {
        await db.execute(
            `UPDATE agent_jobs
             SET status = 'completed',
                 job_result = ?,
                 completed_at = NOW(),
                 execution_time_ms = ?,
                 progress = 100
             WHERE bullmq_job_id = ?`,
            [JSON.stringify(result), result.executionTimeMs, job.id]
        );
    } catch (error) {
        console.error(`[agentWorker] ✗ Failed to update database for job ${job.id}:`, error.message);
    }
});

worker.on('failed', async (job, error) => {
    if (!job) {
        console.error('[agentWorker] ✗ Job failed without job data:', error.message);
        return;
    }

    console.error(`[agentWorker] ✗ Job ${job.id} failed:`, error.message);

    try {
        await db.execute(
            `UPDATE agent_jobs
             SET status = 'failed',
                 last_error = ?,
                 completed_at = NOW()
             WHERE bullmq_job_id = ?`,
            [error.message, job.id]
        );
    } catch (dbError) {
        console.error(`[agentWorker] ✗ Failed to update database for job ${job.id}:`, dbError.message);
    }
});

worker.on('error', (error) => {
    console.error('[agentWorker] CRITICAL WORKER ERROR:', error.message);
});

// ============================================================================
// Graceful Shutdown
// ============================================================================

async function shutdown(signal) {
    console.log(`[agentWorker] Received ${signal}, shutting down gracefully...`);

    try {
        await worker.close();
        console.log('[agentWorker] ✓ Worker closed');
    } catch (error) {
        console.error('[agentWorker] ✗ Error closing worker:', error.message);
    }

    try {
        if (db) {
            await db.end();
            console.log('[agentWorker] ✓ Database closed');
        }
    } catch (error) {
        console.error('[agentWorker] ✗ Error closing database:', error.message);
    }

    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============================================================================
// Initialization
// ============================================================================

async function initialize() {
    try {
        db = await connectToDatabase();
        console.log('[agentWorker] Initialization complete, waiting for jobs...');
    } catch (error) {
        console.error('[agentWorker] Initialization failed:', error.message);
        process.exit(1);
    }
}

initialize();

export default worker;
