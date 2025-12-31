"use strict";
/**
 * SOLARIA DFO - Agent Execution Worker
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * BullMQ worker process that consumes agent execution jobs from the
 * 'agent-execution' queue and delegates execution to assigned agents.
 *
 * Features:
 * - Concurrent job processing (5 workers)
 * - Exponential backoff retry (3 attempts)
 * - Context loading (dependencies, memories, related tasks)
 * - Real-time progress updates
 * - Graceful shutdown handling
 *
 * @example
 * ```bash
 * # Run worker
 * node workers/agentWorker.js
 *
 * # Worker will process jobs from 'agent-execution' queue
 * # Jobs are queued by AgentExecutionService
 * ```
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const promise_1 = __importDefault(require("mysql2/promise"));
const queue_js_1 = require("../config/queue.js");
const mcp_client_manager_js_1 = require("../../mcp-server/dist/src/client/mcp-client-manager.js");
// ============================================================================
// Database Connection
// ============================================================================
let db;
/**
 * Initialize database connection with retry logic
 */
async function connectToDatabase() {
    const maxRetries = 10;
    const retryDelay = 5000; // 5 seconds
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[agentWorker] Attempting database connection (${attempt}/${maxRetries})...`);
            const connection = await promise_1.default.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'solaria_construction',
            });
            console.log('[agentWorker] ✓ Database connected successfully');
            return connection;
        }
        catch (error) {
            console.error(`[agentWorker] Database connection attempt ${attempt} failed:`, error.message);
            if (attempt < maxRetries) {
                console.log(`[agentWorker] Retrying in ${retryDelay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
            else {
                throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
            }
        }
    }
    throw new Error('Database connection failed');
}
// ============================================================================
// Context Loading
// ============================================================================
/**
 * Load task context (dependencies, related tasks, memories)
 *
 * Provides the agent with all necessary context to execute the task:
 * - Task details and subtasks
 * - Dependency information
 * - Related tasks for reference
 * - Relevant memories from previous sessions
 *
 * @param jobData - Job data with task and project info
 * @returns Context object for agent execution
 */
async function loadTaskContext(jobData) {
    const { taskId, projectId } = jobData;
    console.log(`[agentWorker] Loading context for task ${taskId}...`);
    // 1. Load task details with items
    const [taskRows] = await db.execute(`SELECT
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
        WHERE t.id = ?`, [taskId]);
    const task = taskRows[0];
    if (!task) {
        throw new Error(`Task ${taskId} not found in database`);
    }
    // Load task items (subtasks)
    const [itemRows] = await db.execute(`SELECT * FROM task_items WHERE task_id = ? ORDER BY sort_order ASC`, [taskId]);
    const items = itemRows;
    console.log(`[agentWorker] Task loaded: ${task.title} (${items.length} items)`);
    // 2. Load dependencies (both blocks and depends_on)
    const [depRows] = await db.execute(`SELECT
            td.*,
            t1.title as source_task_title,
            t1.status as source_task_status,
            t2.title as target_task_title,
            t2.status as target_task_status
        FROM task_dependencies td
        LEFT JOIN tasks t1 ON td.source_task_id = t1.id
        LEFT JOIN tasks t2 ON td.target_task_id = t2.id
        WHERE td.source_task_id = ? OR td.target_task_id = ?
        ORDER BY td.created_at DESC`, [taskId, taskId]);
    const dependencies = depRows;
    console.log(`[agentWorker] Loaded ${dependencies.length} dependencies`);
    // 3. Load related tasks (same epic or sprint)
    const relatedTasksQuery = task.epic_id
        ? `SELECT t.* FROM tasks t WHERE t.epic_id = ? AND t.id != ? LIMIT 10`
        : task.sprint_id
            ? `SELECT t.* FROM tasks t WHERE t.sprint_id = ? AND t.id != ? LIMIT 10`
            : null;
    let relatedTasks = [];
    if (relatedTasksQuery) {
        const relatedId = task.epic_id || task.sprint_id;
        const [relatedRows] = await db.execute(relatedTasksQuery, [relatedId, taskId]);
        relatedTasks = relatedRows;
        console.log(`[agentWorker] Loaded ${relatedTasks.length} related tasks`);
    }
    // 4. Load relevant memories
    // Search for memories tagged with task code, project, or relevant keywords
    const searchTerms = [
        task.task_code,
        task.project_code,
        task.title.split(' ').slice(0, 3).join(' '), // First 3 words of title
    ]
        .filter(Boolean)
        .join(' ');
    const [memoryRows] = await db.execute(`SELECT m.*
        FROM memories m
        WHERE (m.project_id = ? OR m.project_id IS NULL)
          AND (
            MATCH(m.content, m.summary) AGAINST(? IN BOOLEAN MODE)
            OR EXISTS (
              SELECT 1 FROM memory_tags mt
              JOIN memory_tag_links mtl ON mt.id = mtl.tag_id
              WHERE mtl.memory_id = m.id
                AND mt.name IN ('decision', 'context', 'learning')
            )
          )
        ORDER BY m.importance DESC, m.created_at DESC
        LIMIT 10`, [projectId, searchTerms]);
    const memories = memoryRows;
    console.log(`[agentWorker] Loaded ${memories.length} relevant memories`);
    // Return complete context
    return {
        task: {
            ...task,
            items,
            items_pending: items.filter((i) => !i.is_completed),
            items_completed_count: items.filter((i) => i.is_completed).length,
        },
        dependencies: {
            all: dependencies,
            blockers: dependencies.filter((d) => d.target_task_id === taskId && d.dependency_type === 'blocks' && d.source_task_status !== 'completed'),
            blocks: dependencies.filter((d) => d.source_task_id === taskId && d.dependency_type === 'blocks'),
            depends_on: dependencies.filter((d) => d.source_task_id === taskId && d.dependency_type === 'depends_on'),
        },
        relatedTasks,
        memories: memories.map((m) => ({
            id: m.id,
            content: m.content,
            summary: m.summary,
            importance: m.importance,
            created_at: m.created_at,
        })),
        metadata: {
            loaded_at: new Date().toISOString(),
            project_name: task.project_name,
            epic_name: task.epic_name,
            sprint_name: task.sprint_name,
        },
    };
}
// ============================================================================
// Job Processing
// ============================================================================
/**
 * Process agent execution job
 *
 * Main job processor that:
 * 1. Loads task context
 * 2. Connects to external MCP servers (if configured)
 * 3. Delegates execution to the assigned agent
 * 4. Updates task progress and items
 * 5. Returns execution result
 *
 * @param job - BullMQ job with AgentJobData payload
 * @returns JobResult with execution status and metrics
 */
async function processAgentJob(job) {
    const startTime = Date.now();
    const { taskId, taskCode, agentId, agentName, projectId, mcpConfigs, metadata } = job.data;
    console.log(`[agentWorker] =========================================`);
    console.log(`[agentWorker] Processing job ${job.id}`);
    console.log(`[agentWorker] Task: ${taskCode} - Agent: ${agentName}`);
    console.log(`[agentWorker] Priority: ${metadata?.priority || 'medium'}`);
    console.log(`[agentWorker] =========================================`);
    try {
        // ========================================================================
        // Phase 1: Context Loading (0-20%)
        // ========================================================================
        await job.updateProgress(5);
        console.log(`[agentWorker] [1/5] Loading task context...`);
        const context = await loadTaskContext(job.data);
        const task = context.task;
        const items = task.items;
        const itemsPending = task.items_pending;
        console.log(`[agentWorker] Context loaded:`);
        console.log(`[agentWorker]   - Task: ${task.title}`);
        console.log(`[agentWorker]   - Items: ${items.length} total, ${itemsPending.length} pending`);
        console.log(`[agentWorker]   - Dependencies: ${context.dependencies.all.length}`);
        console.log(`[agentWorker]   - Memories: ${context.memories.length}`);
        await job.updateProgress(20);
        // ========================================================================
        // Phase 2: Validation (20-30%)
        // ========================================================================
        console.log(`[agentWorker] [2/5] Validating execution conditions...`);
        // Check for blockers
        const blockers = context.dependencies.blockers || [];
        if (blockers.length > 0) {
            console.warn(`[agentWorker] ⚠ Task has ${blockers.length} active blockers`);
            blockers.forEach((blocker) => {
                console.warn(`[agentWorker]   - Blocked by: ${blocker.source_task_title} (${blocker.source_task_status})`);
            });
            // Return blocked status
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
        // ========================================================================
        // Phase 3: MCP Server Connection (30-40%)
        // ========================================================================
        console.log(`[agentWorker] [3/5] Connecting to MCP servers...`);
        const connectedServers = [];
        const availableTools = new Map();
        if (mcpConfigs && mcpConfigs.length > 0) {
            console.log(`[agentWorker] Configured MCP servers: ${mcpConfigs.length}`);
            const enabledConfigs = mcpConfigs.filter(config => config.enabled);
            console.log(`[agentWorker] Enabled servers: ${enabledConfigs.length}`);
            if (enabledConfigs.length > 0) {
                const manager = (0, mcp_client_manager_js_1.getMCPClientManager)();
                for (const config of enabledConfigs) {
                    try {
                        console.log(`[agentWorker] Connecting to ${config.serverName}...`);
                        // Check if already connected
                        if (manager.isConnected(config.serverName)) {
                            console.log(`[agentWorker]   ✓ Already connected to ${config.serverName}`);
                        }
                        else {
                            // Connect to MCP server
                            // Note: AgentMCPConfig doesn't have transportType, defaulting to 'http'
                            const transportType = 'http';
                            await manager.connect({
                                name: config.serverName,
                                transport: {
                                    type: transportType,
                                    url: config.serverUrl,
                                },
                                auth: config.authType === 'none'
                                    ? { type: 'none' }
                                    : config.authType === 'bearer'
                                        ? { type: 'bearer', ...(config.authCredentials || {}) }
                                        : { type: 'api-key', ...(config.authCredentials || {}) },
                                healthCheck: {
                                    enabled: true,
                                    interval: 60000,
                                    timeout: 10000,
                                },
                                retry: {
                                    maxAttempts: 3,
                                    backoffMs: 2000,
                                },
                            });
                            console.log(`[agentWorker]   ✓ Connected to ${config.serverName}`);
                        }
                        // Discover available tools
                        const tools = manager.listTools(config.serverName);
                        availableTools.set(config.serverName, tools);
                        connectedServers.push(config.serverName);
                        console.log(`[agentWorker]   📋 Discovered ${tools.length} tools on ${config.serverName}`);
                        tools.forEach((tool, i) => {
                            if (i < 3) { // Show first 3 tools
                                console.log(`[agentWorker]      - ${tool.name}`);
                            }
                        });
                        if (tools.length > 3) {
                            console.log(`[agentWorker]      ... and ${tools.length - 3} more`);
                        }
                    }
                    catch (error) {
                        console.error(`[agentWorker]   ✗ Failed to connect to ${config.serverName}:`, error.message);
                        // Continue with other servers even if one fails
                    }
                }
                console.log(`[agentWorker] ✓ Connected to ${connectedServers.length}/${enabledConfigs.length} servers`);
            }
            else {
                console.log(`[agentWorker] No enabled MCP servers`);
            }
        }
        else {
            console.log(`[agentWorker] No external MCP servers configured`);
        }
        await job.updateProgress(40);
        // ========================================================================
        // Phase 4: Agent Execution (40-90%)
        // ========================================================================
        console.log(`[agentWorker] [4/5] Executing agent...`);
        // Prepare external tools summary for agent context
        const externalToolsSummary = {};
        let totalExternalTools = 0;
        if (connectedServers.length > 0) {
            console.log(`[agentWorker] External MCP tools available:`);
            for (const serverName of connectedServers) {
                const tools = availableTools.get(serverName) || [];
                externalToolsSummary[serverName] = tools.map(t => t.name);
                totalExternalTools += tools.length;
                console.log(`[agentWorker]   ${serverName}: ${tools.length} tools`);
                tools.slice(0, 5).forEach(tool => {
                    console.log(`[agentWorker]      - ${tool.name}: ${tool.description || 'No description'}`);
                });
                if (tools.length > 5) {
                    console.log(`[agentWorker]      ... and ${tools.length - 5} more`);
                }
            }
        }
        // TODO: Implement actual agent execution
        // This is a placeholder for now. Real implementation will:
        // 1. Prepare agent prompt with context
        // 2. Inject external MCP tools (now available in externalToolsSummary)
        // 3. Stream agent execution
        // 4. Update task_items as they complete
        // 5. Capture agent output and logs
        const output = [];
        output.push(`Task: ${task.title}`);
        output.push(`Description: ${task.description || 'No description'}`);
        output.push(`Items to complete: ${itemsPending.length}`);
        output.push('');
        if (totalExternalTools > 0) {
            output.push(`✓ MCP Integration Active:`);
            output.push(`  Connected servers: ${connectedServers.join(', ')}`);
            output.push(`  Total external tools: ${totalExternalTools}`);
            output.push('');
            output.push('External tools available for agent execution:');
            for (const [serverName, toolNames] of Object.entries(externalToolsSummary)) {
                output.push(`  ${serverName}:`);
                toolNames.slice(0, 3).forEach(name => output.push(`    - ${name}`));
                if (toolNames.length > 3) {
                    output.push(`    ... and ${toolNames.length - 3} more`);
                }
            }
            output.push('');
        }
        output.push('--- Agent Execution Placeholder ---');
        output.push('Real agent execution will be implemented in future phase.');
        output.push('For now, this worker validates context and prepares execution environment.');
        output.push('MCP client integration is ready - external tools can be injected when agent execution is implemented.');
        // Simulate progress updates
        for (let progress = 40; progress <= 90; progress += 10) {
            await job.updateProgress(progress);
            await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
        }
        console.log(`[agentWorker] ✓ Agent execution completed (placeholder)`);
        if (totalExternalTools > 0) {
            console.log(`[agentWorker] ℹ External tools ready for injection: ${totalExternalTools} tools from ${connectedServers.length} servers`);
        }
        await job.updateProgress(90);
        // ========================================================================
        // Phase 5: Finalization (90-100%)
        // ========================================================================
        console.log(`[agentWorker] [5/5] Finalizing execution...`);
        // Calculate metrics
        const executionTimeMs = Date.now() - startTime;
        const itemsCompleted = task.items_completed_count;
        const itemsTotal = items.length;
        const progressPercent = itemsTotal > 0 ? Math.round((itemsCompleted / itemsTotal) * 100) : 100;
        // Determine final task status
        const taskStatus = progressPercent === 100 ? 'completed' : 'in_progress';
        // Update task status if completed
        if (taskStatus === 'completed') {
            await db.execute('UPDATE tasks SET status = ?, completed_at = NOW(), progress = 100 WHERE id = ?', [
                'completed',
                taskId,
            ]);
            console.log(`[agentWorker] ✓ Task marked as completed`);
        }
        else {
            await db.execute('UPDATE tasks SET progress = ? WHERE id = ?', [progressPercent, taskId]);
            console.log(`[agentWorker] Task progress updated: ${progressPercent}%`);
        }
        await job.updateProgress(100);
        // Build result
        const result = {
            success: true,
            taskId,
            taskCode,
            itemsCompleted,
            itemsTotal,
            progress: progressPercent,
            executionTimeMs,
            taskStatus,
            output: output.join('\n'),
        };
        console.log(`[agentWorker] =========================================`);
        console.log(`[agentWorker] ✓ Job ${job.id} completed successfully`);
        console.log(`[agentWorker] Time: ${executionTimeMs}ms`);
        console.log(`[agentWorker] Progress: ${progressPercent}% (${itemsCompleted}/${itemsTotal} items)`);
        console.log(`[agentWorker] Status: ${taskStatus}`);
        console.log(`[agentWorker] =========================================`);
        return result;
    }
    catch (error) {
        const executionTimeMs = Date.now() - startTime;
        console.error(`[agentWorker] =========================================`);
        console.error(`[agentWorker] ✗ Job ${job.id} failed`);
        console.error(`[agentWorker] Error: ${error.message}`);
        console.error(`[agentWorker] =========================================`);
        // Update task status to blocked
        await db.execute('UPDATE tasks SET status = ? WHERE id = ?', ['blocked', taskId]);
        // Build error result
        const result = {
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
                stack: error.stack,
            },
            taskStatus: 'blocked',
        };
        return result;
    }
}
// ============================================================================
// Worker Instance
// ============================================================================
/**
 * Create BullMQ Worker instance
 */
const worker = new bullmq_1.Worker(queue_js_1.QueueNames.AGENT_EXECUTION, processAgentJob, (0, queue_js_1.getWorkerOptions)());
// ============================================================================
// Event Handlers
// ============================================================================
/**
 * Calculate retry delay using exponential backoff
 * Formula: delay * (2 ^ attemptsMade)
 * @param attemptsMade - Number of failed attempts
 * @returns Delay in milliseconds
 */
function getRetryDelay(attemptsMade) {
    const baseDelay = 5000; // 5 seconds (from queue config)
    return baseDelay * Math.pow(2, attemptsMade - 1);
}
/**
 * Job completed successfully
 */
worker.on('completed', async (job, result) => {
    console.log(`[agentWorker] ✓ Job ${job.id} completed: ${result.taskCode} (${result.executionTimeMs}ms)`);
    try {
        // Update agent_jobs table
        await db.execute(`UPDATE agent_jobs
             SET status = 'completed',
                 job_result = ?,
                 completed_at = NOW(),
                 execution_time_ms = ?,
                 progress = 100
             WHERE bullmq_job_id = ?`, [JSON.stringify(result), result.executionTimeMs, job.id]);
        console.log(`[agentWorker] ✓ Database updated for job ${job.id}`);
    }
    catch (error) {
        console.error(`[agentWorker] ✗ Failed to update database for job ${job.id}:`, error.message);
    }
});
/**
 * Job failed after all retry attempts
 */
worker.on('failed', async (job, error) => {
    if (!job) {
        console.error('[agentWorker] ✗ Job failed without job data:', error.message);
        return;
    }
    const attemptsMade = job.attemptsMade || 0;
    const maxAttempts = job.opts.attempts || 3;
    const isPermanentFailure = attemptsMade >= maxAttempts;
    console.error(`[agentWorker] ✗ Job ${job.id} failed (attempt ${attemptsMade}/${maxAttempts}):`, error.message);
    try {
        if (isPermanentFailure) {
            // Job failed permanently after all retries
            console.error(`[agentWorker] ✗ Job ${job.id} failed permanently after ${attemptsMade} attempts`);
            await db.execute(`UPDATE agent_jobs
                 SET status = 'failed',
                     attempts_made = ?,
                     last_error = ?,
                     error_stack = ?,
                     completed_at = NOW()
                 WHERE bullmq_job_id = ?`, [attemptsMade, error.message, error.stack || '', job.id]);
        }
        else {
            // Job will be retried
            console.warn(`[agentWorker] ⚠ Job ${job.id} will retry in ${getRetryDelay(attemptsMade)}ms (exponential backoff)`);
            await db.execute(`UPDATE agent_jobs
                 SET status = 'delayed',
                     attempts_made = ?,
                     last_error = ?
                 WHERE bullmq_job_id = ?`, [attemptsMade, error.message, job.id]);
        }
        console.log(`[agentWorker] ✓ Database updated for failed job ${job.id}`);
    }
    catch (dbError) {
        console.error(`[agentWorker] ✗ Failed to update database for job ${job.id}:`, dbError.message);
    }
});
/**
 * Job started (active)
 */
worker.on('active', async (job) => {
    console.log(`[agentWorker] ▶ Job ${job.id} started: ${job.data.taskCode}`);
    try {
        await db.execute(`UPDATE agent_jobs
             SET status = 'active',
                 started_at = NOW()
             WHERE bullmq_job_id = ?`, [job.id]);
    }
    catch (error) {
        console.error(`[agentWorker] ✗ Failed to update status for job ${job.id}:`, error.message);
    }
});
/**
 * Job progress update
 */
worker.on('progress', async (job, progress) => {
    const progressValue = typeof progress === 'number' ? progress : 0;
    console.log(`[agentWorker] Progress update: Job ${job.id} at ${progressValue}%`);
    try {
        // Update agent_jobs progress
        await db.execute(`UPDATE agent_jobs
             SET progress = ?
             WHERE bullmq_job_id = ?`, [progressValue, job.id]);
        // TODO (DFO-187): Emit WebSocket event for real-time UI update
        // - Socket.IO broadcast to project room
        // - Event: 'agent_job_progress'
        // - Payload: { jobId, taskId, taskCode, progress }
    }
    catch (error) {
        console.error(`[agentWorker] ✗ Failed to update progress for job ${job.id}:`, error.message);
    }
});
/**
 * Worker ready
 */
worker.on('ready', () => {
    console.log('[agentWorker] =========================================');
    console.log('[agentWorker] SOLARIA DFO - Agent Execution Worker');
    console.log('[agentWorker] =========================================');
    console.log(`[agentWorker] Queue: ${queue_js_1.QueueNames.AGENT_EXECUTION}`);
    console.log(`[agentWorker] Concurrency: ${(0, queue_js_1.getWorkerOptions)().concurrency}`);
    console.log('[agentWorker] Status: READY');
    console.log('[agentWorker] =========================================');
});
/**
 * Worker error (critical)
 */
worker.on('error', (error) => {
    console.error('[agentWorker] =========================================');
    console.error('[agentWorker] CRITICAL WORKER ERROR');
    console.error('[agentWorker] =========================================');
    console.error('[agentWorker] Error:', error.message);
    console.error('[agentWorker] Stack:', error.stack);
    console.error('[agentWorker] =========================================');
    // TODO (DFO-187): Emit critical alert
    // - Log to error tracking system (Sentry, etc.)
    // - Emit WebSocket alert to dashboard
    // - Send notification to operations team
});
/**
 * Job stalled (appears stuck)
 */
worker.on('stalled', async (jobId) => {
    console.warn('[agentWorker] ⚠ Job stalled (appears stuck):', jobId);
    try {
        // Mark job as delayed in database
        await db.execute(`UPDATE agent_jobs
             SET status = 'delayed',
                 last_error = 'Job stalled and will be retried'
             WHERE bullmq_job_id = ?`, [jobId]);
        console.log(`[agentWorker] ✓ Stalled job ${jobId} marked for retry`);
    }
    catch (error) {
        console.error(`[agentWorker] ✗ Failed to update stalled job ${jobId}:`, error.message);
    }
});
/**
 * Queue drained (all jobs processed)
 */
worker.on('drained', () => {
    console.log('[agentWorker] ℹ Queue drained - all jobs processed, waiting for new jobs...');
});
/**
 * Worker paused
 */
worker.on('paused', () => {
    console.log('[agentWorker] ⏸ Worker paused');
});
/**
 * Worker resumed
 */
worker.on('resumed', () => {
    console.log('[agentWorker] ▶ Worker resumed');
});
// ============================================================================
// Graceful Shutdown
// ============================================================================
/**
 * Shutdown handler
 *
 * Ensures graceful shutdown:
 * 1. Stop accepting new jobs
 * 2. Wait for active jobs to complete (with timeout)
 * 3. Close worker connections
 * 4. Close database connection
 * 5. Exit process
 *
 * @param signal - Signal received (SIGTERM, SIGINT)
 */
async function shutdown(signal) {
    console.log('[agentWorker] =========================================');
    console.log(`[agentWorker] Received ${signal}, shutting down gracefully...`);
    console.log('[agentWorker] =========================================');
    const SHUTDOWN_TIMEOUT = 30000; // 30 seconds
    let shutdownTimer = null;
    try {
        // Set force shutdown timer
        shutdownTimer = setTimeout(() => {
            console.error('[agentWorker] ✗ Shutdown timeout exceeded, forcing exit...');
            process.exit(1);
        }, SHUTDOWN_TIMEOUT);
        // Check active jobs
        const jobCounts = await worker.getJobCounts('waiting', 'active', 'delayed');
        console.log('[agentWorker] Job counts before shutdown:');
        console.log(`[agentWorker]   - Waiting: ${jobCounts.waiting}`);
        console.log(`[agentWorker]   - Active: ${jobCounts.active}`);
        console.log(`[agentWorker]   - Delayed: ${jobCounts.delayed}`);
        if (jobCounts.active > 0) {
            console.log(`[agentWorker] Waiting for ${jobCounts.active} active job(s) to complete (timeout: ${SHUTDOWN_TIMEOUT}ms)...`);
        }
        // Close worker (waits for active jobs to complete)
        console.log('[agentWorker] Closing worker...');
        await worker.close();
        console.log('[agentWorker] ✓ Worker closed');
        // Clear timeout
        if (shutdownTimer) {
            clearTimeout(shutdownTimer);
            shutdownTimer = null;
        }
    }
    catch (error) {
        console.error('[agentWorker] ✗ Error closing worker:', error.message);
    }
    try {
        // Close database connection
        if (db) {
            console.log('[agentWorker] Closing database connection...');
            await db.end();
            console.log('[agentWorker] ✓ Database closed');
        }
    }
    catch (error) {
        console.error('[agentWorker] ✗ Error closing database:', error.message);
    }
    console.log('[agentWorker] =========================================');
    console.log('[agentWorker] Shutdown complete');
    console.log('[agentWorker] =========================================');
    process.exit(0);
}
// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// ============================================================================
// Initialization
// ============================================================================
/**
 * Initialize worker
 */
async function initialize() {
    try {
        // Connect to database
        db = await connectToDatabase();
        console.log('[agentWorker] Initialization complete, waiting for jobs...');
    }
    catch (error) {
        console.error('[agentWorker] Initialization failed:', error.message);
        process.exit(1);
    }
}
// Start initialization
initialize();
// ============================================================================
// Export
// ============================================================================
exports.default = worker;
//# sourceMappingURL=agentWorker.js.map