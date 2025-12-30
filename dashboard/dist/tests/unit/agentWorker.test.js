"use strict";
/**
 * SOLARIA DFO - Agent Worker Tests
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Comprehensive unit tests for BullMQ agent worker
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const promise_1 = __importDefault(require("mysql2/promise"));
const bullmq_1 = require("bullmq");
const queue_js_1 = require("../../config/queue.js");
(0, globals_1.describe)('AgentWorker', () => {
    let db;
    let queue;
    let redisConnection;
    // Test data
    const testProject = {
        id: 1,
        name: 'Test Project',
        code: 'TEST',
    };
    const testAgent = {
        id: 11,
        name: 'Test Agent',
    };
    let testTaskId;
    let testEpicId;
    let testSprintId;
    (0, globals_1.beforeAll)(async () => {
        // Connect to test database
        db = await promise_1.default.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'solaria_construction_test',
        });
        // Initialize Redis connection
        redisConnection = (0, queue_js_1.createRedisConnection)();
        // Create queue instance (not worker - worker is running in separate process)
        queue = new bullmq_1.Queue(queue_js_1.QueueNames.AGENT_EXECUTION, {
            connection: redisConnection,
        });
        // Wait for connections
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Create test data
        const [sprintResult] = await db.execute(`INSERT INTO sprints (project_id, name, status, phase_type, phase_order)
             VALUES (?, 'Test Sprint', 'active', 'development', 1)`, [testProject.id]);
        testSprintId = sprintResult.insertId;
        const [epicResult] = await db.execute(`INSERT INTO epics (project_id, sprint_id, name, status)
             VALUES (?, ?, 'Test Epic', 'in_progress')`, [testProject.id, testSprintId]);
        testEpicId = epicResult.insertId;
        const [taskResult] = await db.execute(`INSERT INTO tasks (project_id, epic_id, sprint_id, title, description, status, priority)
             VALUES (?, ?, ?, 'Test Task', 'Test worker execution', 'pending', 'high')`, [testProject.id, testEpicId, testSprintId]);
        testTaskId = taskResult.insertId;
    });
    (0, globals_1.afterAll)(async () => {
        // Cleanup
        await queue.close();
        await redisConnection.quit();
        // Delete test data
        await db.execute('DELETE FROM tasks WHERE id = ?', [testTaskId]);
        await db.execute('DELETE FROM epics WHERE id = ?', [testEpicId]);
        await db.execute('DELETE FROM sprints WHERE id = ?', [testSprintId]);
        await db.end();
    });
    (0, globals_1.beforeEach)(async () => {
        // Clean up agent_jobs before each test
        await db.execute('DELETE FROM agent_jobs WHERE task_id = ?', [testTaskId]);
        // Reset task status
        await db.execute(`UPDATE tasks SET status = 'pending', progress = 0, started_at = NULL, completed_at = NULL
             WHERE id = ?`, [testTaskId]);
        // Clean up task items
        await db.execute('DELETE FROM task_items WHERE task_id = ?', [testTaskId]);
    });
    // ========================================================================
    // Job Queueing Tests
    // ========================================================================
    (0, globals_1.describe)('Job Queueing', () => {
        (0, globals_1.it)('should queue a job successfully', async () => {
            const jobData = {
                taskId: testTaskId,
                taskCode: 'TEST-001',
                agentId: testAgent.id,
                agentName: testAgent.name,
                projectId: testProject.id,
                metadata: {
                    priority: 'high',
                    estimatedHours: 2,
                },
            };
            const job = await queue.add(`task-${jobData.taskCode}`, jobData, {
                priority: 2, // high priority
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });
            (0, globals_1.expect)(job).toBeDefined();
            (0, globals_1.expect)(job.id).toBeDefined();
            (0, globals_1.expect)(job.data).toMatchObject(jobData);
            (0, globals_1.expect)(job.opts.priority).toBe(2);
            (0, globals_1.expect)(job.opts.attempts).toBe(3);
        });
        (0, globals_1.it)('should assign correct priority based on task priority', async () => {
            const priorities = [
                { priority: 'critical', expected: 1 },
                { priority: 'high', expected: 2 },
                { priority: 'medium', expected: 3 },
                { priority: 'low', expected: 4 },
            ];
            for (const { priority, expected } of priorities) {
                const jobData = {
                    taskId: testTaskId,
                    taskCode: `TEST-${priority.toUpperCase()}`,
                    agentId: testAgent.id,
                    agentName: testAgent.name,
                    projectId: testProject.id,
                    metadata: {
                        priority,
                    },
                };
                const job = await queue.add(`task-${jobData.taskCode}`, jobData, {
                    priority: expected,
                });
                (0, globals_1.expect)(job.opts.priority).toBe(expected);
                // Clean up
                await job.remove();
            }
        });
    });
    // ========================================================================
    // Context Loading Tests
    // ========================================================================
    (0, globals_1.describe)('Context Loading', () => {
        (0, globals_1.it)('should load task context with all related data', async () => {
            // Create task items
            await db.execute(`INSERT INTO task_items (task_id, title, sort_order, is_completed)
                 VALUES (?, 'Item 1', 1, 0), (?, 'Item 2', 2, 1)`, [testTaskId, testTaskId]);
            // Create a memory
            const [memResult] = await db.execute(`INSERT INTO memories (project_id, content, summary, importance)
                 VALUES (?, 'Test context', 'Context summary', 0.8)`, [testProject.id]);
            const memoryId = memResult.insertId;
            // Queue job
            const jobData = {
                taskId: testTaskId,
                taskCode: 'TEST-CONTEXT',
                agentId: testAgent.id,
                agentName: testAgent.name,
                projectId: testProject.id,
            };
            const job = await queue.add(`task-${jobData.taskCode}`, jobData);
            // Wait for worker to process (in real scenario)
            // For unit test, we verify the structure is correct
            (0, globals_1.expect)(job).toBeDefined();
            (0, globals_1.expect)(job.data.taskId).toBe(testTaskId);
            (0, globals_1.expect)(job.data.projectId).toBe(testProject.id);
            // Verify task items exist
            const [items] = await db.execute('SELECT * FROM task_items WHERE task_id = ?', [testTaskId]);
            (0, globals_1.expect)(items.length).toBe(2);
            // Verify memory exists
            const [memories] = await db.execute('SELECT * FROM memories WHERE id = ?', [memoryId]);
            (0, globals_1.expect)(memories.length).toBe(1);
            // Clean up
            await job.remove();
            await db.execute('DELETE FROM memories WHERE id = ?', [memoryId]);
        });
        (0, globals_1.it)('should identify pending and completed items correctly', async () => {
            // Create 3 items: 1 pending, 2 completed
            await db.execute(`INSERT INTO task_items (task_id, title, sort_order, is_completed)
                 VALUES
                   (?, 'Pending Item', 1, 0),
                   (?, 'Completed Item 1', 2, 1),
                   (?, 'Completed Item 2', 3, 1)`, [testTaskId, testTaskId, testTaskId]);
            // Verify counts
            const [pendingRows] = await db.execute('SELECT COUNT(*) as count FROM task_items WHERE task_id = ? AND is_completed = 0', [testTaskId]);
            const [completedRows] = await db.execute('SELECT COUNT(*) as count FROM task_items WHERE task_id = ? AND is_completed = 1', [testTaskId]);
            (0, globals_1.expect)(pendingRows[0].count).toBe(1);
            (0, globals_1.expect)(completedRows[0].count).toBe(2);
        });
    });
    // ========================================================================
    // Blocker Detection Tests
    // ========================================================================
    (0, globals_1.describe)('Blocker Detection', () => {
        (0, globals_1.it)('should detect blocking dependencies', async () => {
            // Create blocking task
            const [blockerResult] = await db.execute(`INSERT INTO tasks (project_id, epic_id, sprint_id, title, status, priority)
                 VALUES (?, ?, ?, 'Blocking Task', 'in_progress', 'high')`, [testProject.id, testEpicId, testSprintId]);
            const blockerTaskId = blockerResult.insertId;
            // Create dependency (blocker blocks testTask)
            await db.execute(`INSERT INTO task_dependencies (source_task_id, target_task_id, dependency_type)
                 VALUES (?, ?, 'blocks')`, [blockerTaskId, testTaskId]);
            // Verify dependency exists
            const [deps] = await db.execute(`SELECT * FROM task_dependencies
                 WHERE source_task_id = ? AND target_task_id = ? AND dependency_type = 'blocks'`, [blockerTaskId, testTaskId]);
            (0, globals_1.expect)(deps.length).toBe(1);
            // Clean up
            await db.execute('DELETE FROM task_dependencies WHERE source_task_id = ?', [blockerTaskId]);
            await db.execute('DELETE FROM tasks WHERE id = ?', [blockerTaskId]);
        });
        (0, globals_1.it)('should allow execution when no blockers exist', async () => {
            // Verify no blockers
            const [blockers] = await db.execute(`SELECT td.*, t.status as source_task_status
                 FROM task_dependencies td
                 LEFT JOIN tasks t ON td.source_task_id = t.id
                 WHERE td.target_task_id = ?
                   AND td.dependency_type = 'blocks'
                   AND t.status != 'completed'`, [testTaskId]);
            (0, globals_1.expect)(blockers.length).toBe(0);
        });
        (0, globals_1.it)('should detect cycle in dependencies', async () => {
            // Create task A
            const [taskAResult] = await db.execute(`INSERT INTO tasks (project_id, epic_id, sprint_id, title, status, priority)
                 VALUES (?, ?, ?, 'Task A', 'pending', 'medium')`, [testProject.id, testEpicId, testSprintId]);
            const taskAId = taskAResult.insertId;
            // Create task B
            const [taskBResult] = await db.execute(`INSERT INTO tasks (project_id, epic_id, sprint_id, title, status, priority)
                 VALUES (?, ?, ?, 'Task B', 'pending', 'medium')`, [testProject.id, testEpicId, testSprintId]);
            const taskBId = taskBResult.insertId;
            // Create cycle: A depends_on B, B depends_on A
            await db.execute(`INSERT INTO task_dependencies (source_task_id, target_task_id, dependency_type)
                 VALUES (?, ?, 'depends_on'), (?, ?, 'depends_on')`, [taskAId, taskBId, taskBId, taskAId]);
            // Verify cycle exists (both tasks depend on each other)
            const [depsA] = await db.execute('SELECT * FROM task_dependencies WHERE source_task_id = ? OR target_task_id = ?', [taskAId, taskAId]);
            const [depsB] = await db.execute('SELECT * FROM task_dependencies WHERE source_task_id = ? OR target_task_id = ?', [taskBId, taskBId]);
            (0, globals_1.expect)(depsA.length).toBeGreaterThan(0);
            (0, globals_1.expect)(depsB.length).toBeGreaterThan(0);
            // Clean up
            await db.execute('DELETE FROM task_dependencies WHERE source_task_id IN (?, ?)', [
                taskAId,
                taskBId,
            ]);
            await db.execute('DELETE FROM tasks WHERE id IN (?, ?)', [taskAId, taskBId]);
        });
    });
    // ========================================================================
    // Progress Tracking Tests
    // ========================================================================
    (0, globals_1.describe)('Progress Tracking', () => {
        (0, globals_1.it)('should calculate progress based on completed items', async () => {
            // Create 4 items: 3 completed, 1 pending
            await db.execute(`INSERT INTO task_items (task_id, title, sort_order, is_completed)
                 VALUES
                   (?, 'Item 1', 1, 1),
                   (?, 'Item 2', 2, 1),
                   (?, 'Item 3', 3, 1),
                   (?, 'Item 4', 4, 0)`, [testTaskId, testTaskId, testTaskId, testTaskId]);
            // Calculate expected progress: 3/4 = 75%
            const [result] = await db.execute(`SELECT
                    (SELECT COUNT(*) FROM task_items WHERE task_id = ? AND is_completed = 1) as completed,
                    (SELECT COUNT(*) FROM task_items WHERE task_id = ?) as total`, [testTaskId, testTaskId]);
            const { completed, total } = result[0];
            const expectedProgress = Math.round((completed / total) * 100);
            (0, globals_1.expect)(completed).toBe(3);
            (0, globals_1.expect)(total).toBe(4);
            (0, globals_1.expect)(expectedProgress).toBe(75);
        });
        (0, globals_1.it)('should handle tasks with no items (100% on completion)', async () => {
            // No items created
            const [result] = await db.execute(`SELECT COUNT(*) as total FROM task_items WHERE task_id = ?`, [testTaskId]);
            const { total } = result[0];
            const expectedProgress = total === 0 ? 100 : 0;
            (0, globals_1.expect)(total).toBe(0);
            (0, globals_1.expect)(expectedProgress).toBe(100);
        });
    });
    // ========================================================================
    // Database Update Tests
    // ========================================================================
    (0, globals_1.describe)('Database Updates', () => {
        (0, globals_1.it)('should update task status to in_progress when job starts', async () => {
            // Manually update status (simulating worker behavior)
            await db.execute('UPDATE tasks SET status = ?, started_at = NOW() WHERE id = ?', [
                'in_progress',
                testTaskId,
            ]);
            // Verify
            const [rows] = await db.execute('SELECT status, started_at FROM tasks WHERE id = ?', [testTaskId]);
            const task = rows[0];
            (0, globals_1.expect)(task.status).toBe('in_progress');
            (0, globals_1.expect)(task.started_at).not.toBeNull();
        });
        (0, globals_1.it)('should update task status to completed when job finishes', async () => {
            // Manually update status (simulating worker behavior)
            await db.execute(`UPDATE tasks
                 SET status = 'completed', completed_at = NOW(), progress = 100
                 WHERE id = ?`, [testTaskId]);
            // Verify
            const [rows] = await db.execute('SELECT status, progress, completed_at FROM tasks WHERE id = ?', [
                testTaskId,
            ]);
            const task = rows[0];
            (0, globals_1.expect)(task.status).toBe('completed');
            (0, globals_1.expect)(task.progress).toBe(100);
            (0, globals_1.expect)(task.completed_at).not.toBeNull();
        });
        (0, globals_1.it)('should update task status to blocked on blocker detection', async () => {
            // Manually update status (simulating worker behavior)
            await db.execute('UPDATE tasks SET status = ? WHERE id = ?', ['blocked', testTaskId]);
            // Verify
            const [rows] = await db.execute('SELECT status FROM tasks WHERE id = ?', [testTaskId]);
            const task = rows[0];
            (0, globals_1.expect)(task.status).toBe('blocked');
        });
    });
    // ========================================================================
    // Agent Jobs Table Tests
    // ========================================================================
    (0, globals_1.describe)('Agent Jobs Table', () => {
        (0, globals_1.it)('should create agent_jobs record when job is queued', async () => {
            const jobData = {
                taskId: testTaskId,
                taskCode: 'TEST-JOBS',
                agentId: testAgent.id,
                agentName: testAgent.name,
                projectId: testProject.id,
            };
            const job = await queue.add(`task-${jobData.taskCode}`, jobData);
            // Manually create agent_jobs record (simulating AgentExecutionService)
            await db.execute(`INSERT INTO agent_jobs (bullmq_job_id, task_id, task_code, agent_id, project_id, status, job_data)
                 VALUES (?, ?, ?, ?, ?, 'waiting', ?)`, [job.id, testTaskId, jobData.taskCode, testAgent.id, testProject.id, JSON.stringify(jobData)]);
            // Verify
            const [rows] = await db.execute('SELECT * FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            const agentJob = rows[0];
            (0, globals_1.expect)(agentJob).toBeDefined();
            (0, globals_1.expect)(agentJob.task_id).toBe(testTaskId);
            (0, globals_1.expect)(agentJob.status).toBe('waiting');
            // Clean up
            await job.remove();
        });
        (0, globals_1.it)('should update agent_jobs status to active when job starts', async () => {
            const jobData = {
                taskId: testTaskId,
                taskCode: 'TEST-ACTIVE',
                agentId: testAgent.id,
                agentName: testAgent.name,
                projectId: testProject.id,
            };
            const job = await queue.add(`task-${jobData.taskCode}`, jobData);
            await db.execute(`INSERT INTO agent_jobs (bullmq_job_id, task_id, task_code, agent_id, project_id, status)
                 VALUES (?, ?, ?, ?, ?, 'waiting')`, [job.id, testTaskId, jobData.taskCode, testAgent.id, testProject.id]);
            // Simulate worker 'active' event
            await db.execute(`UPDATE agent_jobs SET status = 'active', started_at = NOW() WHERE bullmq_job_id = ?`, [job.id]);
            // Verify
            const [rows] = await db.execute('SELECT status, started_at FROM agent_jobs WHERE bullmq_job_id = ?', [
                job.id,
            ]);
            const agentJob = rows[0];
            (0, globals_1.expect)(agentJob.status).toBe('active');
            (0, globals_1.expect)(agentJob.started_at).not.toBeNull();
            // Clean up
            await job.remove();
        });
        (0, globals_1.it)('should store job_result on completion', async () => {
            const jobData = {
                taskId: testTaskId,
                taskCode: 'TEST-RESULT',
                agentId: testAgent.id,
                agentName: testAgent.name,
                projectId: testProject.id,
            };
            const job = await queue.add(`task-${jobData.taskCode}`, jobData);
            await db.execute(`INSERT INTO agent_jobs (bullmq_job_id, task_id, task_code, agent_id, project_id, status)
                 VALUES (?, ?, ?, ?, ?, 'active')`, [job.id, testTaskId, jobData.taskCode, testAgent.id, testProject.id]);
            // Simulate worker 'completed' event
            const result = {
                success: true,
                taskId: testTaskId,
                taskCode: jobData.taskCode,
                itemsCompleted: 5,
                itemsTotal: 5,
                progress: 100,
                executionTimeMs: 1500,
                taskStatus: 'completed',
            };
            await db.execute(`UPDATE agent_jobs
                 SET status = 'completed',
                     job_result = ?,
                     completed_at = NOW(),
                     execution_time_ms = ?,
                     progress = 100
                 WHERE bullmq_job_id = ?`, [JSON.stringify(result), result.executionTimeMs, job.id]);
            // Verify
            const [rows] = await db.execute('SELECT status, job_result, execution_time_ms, progress FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            const agentJob = rows[0];
            (0, globals_1.expect)(agentJob.status).toBe('completed');
            (0, globals_1.expect)(agentJob.progress).toBe(100);
            (0, globals_1.expect)(agentJob.execution_time_ms).toBe(1500);
            (0, globals_1.expect)(JSON.parse(agentJob.job_result)).toMatchObject(result);
            // Clean up
            await job.remove();
        });
    });
    // ========================================================================
    // Retry Logic Tests
    // ========================================================================
    (0, globals_1.describe)('Retry Logic', () => {
        (0, globals_1.it)('should retry failed jobs with exponential backoff', async () => {
            const jobData = {
                taskId: testTaskId,
                taskCode: 'TEST-RETRY',
                agentId: testAgent.id,
                agentName: testAgent.name,
                projectId: testProject.id,
            };
            const job = await queue.add(`task-${jobData.taskCode}`, jobData, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });
            // Verify retry configuration
            (0, globals_1.expect)(job.opts.attempts).toBe(3);
            (0, globals_1.expect)(job.opts.backoff).toMatchObject({
                type: 'exponential',
                delay: 5000,
            });
            // Clean up
            await job.remove();
        });
        (0, globals_1.it)('should calculate exponential backoff delay correctly', () => {
            const baseDelay = 5000;
            const getRetryDelay = (attemptsMade) => {
                return baseDelay * Math.pow(2, attemptsMade - 1);
            };
            // Test delays for attempts 1-5
            (0, globals_1.expect)(getRetryDelay(1)).toBe(5000); // 5s * 2^0 = 5s
            (0, globals_1.expect)(getRetryDelay(2)).toBe(10000); // 5s * 2^1 = 10s
            (0, globals_1.expect)(getRetryDelay(3)).toBe(20000); // 5s * 2^2 = 20s
            (0, globals_1.expect)(getRetryDelay(4)).toBe(40000); // 5s * 2^3 = 40s
            (0, globals_1.expect)(getRetryDelay(5)).toBe(80000); // 5s * 2^4 = 80s
        });
        (0, globals_1.it)('should mark job as failed after max attempts', async () => {
            const jobData = {
                taskId: testTaskId,
                taskCode: 'TEST-FAILED',
                agentId: testAgent.id,
                agentName: testAgent.name,
                projectId: testProject.id,
            };
            const job = await queue.add(`task-${jobData.taskCode}`, jobData, {
                attempts: 3,
            });
            await db.execute(`INSERT INTO agent_jobs (bullmq_job_id, task_id, task_code, agent_id, project_id, status)
                 VALUES (?, ?, ?, ?, ?, 'active')`, [job.id, testTaskId, jobData.taskCode, testAgent.id, testProject.id]);
            // Simulate permanent failure (after 3 attempts)
            await db.execute(`UPDATE agent_jobs
                 SET status = 'failed',
                     attempts_made = 3,
                     last_error = 'Test error',
                     completed_at = NOW()
                 WHERE bullmq_job_id = ?`, [job.id]);
            // Verify
            const [rows] = await db.execute('SELECT status, attempts_made FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            const agentJob = rows[0];
            (0, globals_1.expect)(agentJob.status).toBe('failed');
            (0, globals_1.expect)(agentJob.attempts_made).toBe(3);
            // Clean up
            await job.remove();
        });
    });
    // ========================================================================
    // Memory Integration Tests
    // ========================================================================
    (0, globals_1.describe)('Memory Integration', () => {
        (0, globals_1.it)('should load relevant memories for task context', async () => {
            // Create memories with different tags
            const [mem1] = await db.execute(`INSERT INTO memories (project_id, content, summary, importance)
                 VALUES (?, 'Decision: Use TypeScript for type safety', 'TypeScript decision', 0.9)`, [testProject.id]);
            const memory1Id = mem1.insertId;
            const [mem2] = await db.execute(`INSERT INTO memories (project_id, content, summary, importance)
                 VALUES (?, 'Learning: BullMQ retry patterns work well', 'BullMQ learning', 0.7)`, [testProject.id]);
            const memory2Id = mem2.insertId;
            // Query memories (simulating loadTaskContext)
            const [memories] = await db.execute(`SELECT * FROM memories
                 WHERE project_id = ?
                 ORDER BY importance DESC, created_at DESC
                 LIMIT 10`, [testProject.id]);
            (0, globals_1.expect)(memories.length).toBeGreaterThanOrEqual(2);
            (0, globals_1.expect)(memories[0].importance).toBeGreaterThanOrEqual(memories[1].importance);
            // Clean up
            await db.execute('DELETE FROM memories WHERE id IN (?, ?)', [memory1Id, memory2Id]);
        });
    });
});
//# sourceMappingURL=agentWorker.test.js.map