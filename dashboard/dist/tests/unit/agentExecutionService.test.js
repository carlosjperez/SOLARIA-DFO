"use strict";
/**
 * SOLARIA DFO - AgentExecutionService Tests
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Comprehensive unit tests for AgentExecutionService
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const promise_1 = __importDefault(require("mysql2/promise"));
const agentExecutionService_js_1 = __importDefault(require("../../services/agentExecutionService.js"));
const queue_js_1 = require("../../config/queue.js");
(0, globals_1.describe)('AgentExecutionService', () => {
    let db;
    let service;
    let redisConnection;
    let testWorker;
    // Test data
    const testJobData = {
        taskId: 999,
        taskCode: 'TEST-001',
        agentId: 11,
        agentName: 'Test Agent',
        projectId: 1,
        metadata: {
            priority: 'high',
            estimatedHours: 2,
        },
    };
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
        // Create service instance
        service = new agentExecutionService_js_1.default(db);
        // Wait for connections to be ready
        await new Promise((resolve) => setTimeout(resolve, 100));
    });
    (0, globals_1.afterAll)(async () => {
        // Cleanup
        if (testWorker) {
            await testWorker.close();
        }
        await service.close();
        await db.end();
    });
    (0, globals_1.beforeEach)(async () => {
        // Clean up test data before each test
        await db.execute('DELETE FROM agent_jobs WHERE task_code LIKE "TEST-%"');
    });
    // ========================================================================
    // Job Queueing Tests
    // ========================================================================
    (0, globals_1.describe)('queueJob()', () => {
        (0, globals_1.it)('should queue a job successfully', async () => {
            const job = await service.queueJob(testJobData);
            (0, globals_1.expect)(job).toBeDefined();
            (0, globals_1.expect)(job.id).toBeDefined();
            (0, globals_1.expect)(job.name).toBe(`task-${testJobData.taskCode}`);
            (0, globals_1.expect)(job.data).toMatchObject(testJobData);
        });
        (0, globals_1.it)('should persist job metadata to database', async () => {
            const job = await service.queueJob(testJobData);
            const [rows] = await db.execute('SELECT * FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            const dbRecord = rows[0];
            (0, globals_1.expect)(dbRecord).toBeDefined();
            (0, globals_1.expect)(dbRecord.task_id).toBe(testJobData.taskId);
            (0, globals_1.expect)(dbRecord.task_code).toBe(testJobData.taskCode);
            (0, globals_1.expect)(dbRecord.agent_id).toBe(testJobData.agentId);
            (0, globals_1.expect)(dbRecord.project_id).toBe(testJobData.projectId);
            (0, globals_1.expect)(dbRecord.status).toBe('waiting');
            (0, globals_1.expect)(dbRecord.progress).toBe(0);
        });
        (0, globals_1.it)('should assign correct priority based on task priority', async () => {
            const criticalJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-CRITICAL',
                metadata: { priority: 'critical' },
            });
            const mediumJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-MEDIUM',
                metadata: { priority: 'medium' },
            });
            const lowJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-LOW',
                metadata: { priority: 'low' },
            });
            // Critical should have highest priority (lowest number)
            (0, globals_1.expect)(criticalJob.opts.priority).toBe(1);
            (0, globals_1.expect)(mediumJob.opts.priority).toBe(3);
            (0, globals_1.expect)(lowJob.opts.priority).toBe(4);
        });
        (0, globals_1.it)('should include retry configuration in job options', async () => {
            const job = await service.queueJob(testJobData);
            (0, globals_1.expect)(job.opts.attempts).toBe(3);
            (0, globals_1.expect)(job.opts.backoff).toMatchObject({
                type: 'exponential',
                delay: 5000,
            });
        });
    });
    // ========================================================================
    // Job Status Tests
    // ========================================================================
    (0, globals_1.describe)('getJobStatus()', () => {
        (0, globals_1.it)('should return null for non-existent job', async () => {
            const status = await service.getJobStatus('non-existent-id');
            (0, globals_1.expect)(status).toBeNull();
        });
        (0, globals_1.it)('should return complete job status', async () => {
            const job = await service.queueJob(testJobData);
            const status = await service.getJobStatus(job.id);
            (0, globals_1.expect)(status).toBeDefined();
            (0, globals_1.expect)(status.id).toBe(job.id);
            (0, globals_1.expect)(status.data).toMatchObject(testJobData);
            (0, globals_1.expect)(status.status).toBe('waiting');
            (0, globals_1.expect)(status.dbRecord).toBeDefined();
            (0, globals_1.expect)(status.dbRecord.taskId).toBe(testJobData.taskId);
        });
        (0, globals_1.it)('should reflect progress updates', async () => {
            const job = await service.queueJob(testJobData);
            // Simulate progress update
            await db.execute('UPDATE agent_jobs SET progress = ? WHERE bullmq_job_id = ?', [50, job.id]);
            const status = await service.getJobStatus(job.id);
            (0, globals_1.expect)(status.dbRecord.progress).toBe(50);
        });
    });
    // ========================================================================
    // Job Cancellation Tests
    // ========================================================================
    (0, globals_1.describe)('cancelJob()', () => {
        (0, globals_1.it)('should cancel a pending job', async () => {
            const job = await service.queueJob(testJobData);
            const cancelled = await service.cancelJob(job.id);
            (0, globals_1.expect)(cancelled).toBe(true);
            // Verify DB status
            const [rows] = await db.execute('SELECT status FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            const dbRecord = rows[0];
            (0, globals_1.expect)(dbRecord.status).toBe('cancelled');
        });
        (0, globals_1.it)('should return false for non-existent job', async () => {
            const cancelled = await service.cancelJob('non-existent-id');
            (0, globals_1.expect)(cancelled).toBe(false);
        });
        (0, globals_1.it)('should return false for already completed job', async () => {
            const job = await service.queueJob(testJobData);
            // Mark as completed
            await db.execute('UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?', ['completed', job.id]);
            await job.moveToCompleted({ success: true }, job.id, false);
            const cancelled = await service.cancelJob(job.id);
            (0, globals_1.expect)(cancelled).toBe(false);
        });
    });
    // ========================================================================
    // Job Retry Tests
    // ========================================================================
    (0, globals_1.describe)('retryJob()', () => {
        (0, globals_1.it)('should retry a failed job', async () => {
            const job = await service.queueJob(testJobData);
            // Mark job as failed
            await job.moveToFailed(new Error('Test failure'), job.id, false);
            await db.execute('UPDATE agent_jobs SET status = ?, attempts_made = ? WHERE bullmq_job_id = ?', ['failed', 1, job.id]);
            const newJob = await service.retryJob(job.id);
            (0, globals_1.expect)(newJob).toBeDefined();
            (0, globals_1.expect)(newJob.id).not.toBe(job.id); // Should be a new job
            (0, globals_1.expect)(newJob.data.metadata?.retryCount).toBe(2);
        });
        (0, globals_1.it)('should return null for non-failed job', async () => {
            const job = await service.queueJob(testJobData);
            const retried = await service.retryJob(job.id);
            (0, globals_1.expect)(retried).toBeNull();
        });
        (0, globals_1.it)('should return null when max retries exceeded', async () => {
            const job = await service.queueJob(testJobData);
            // Mark as failed with max attempts
            await job.moveToFailed(new Error('Test failure'), job.id, false);
            await db.execute(`UPDATE agent_jobs
                 SET status = 'failed', attempts_made = 3, max_attempts = 3
                 WHERE bullmq_job_id = ?`, [job.id]);
            const retried = await service.retryJob(job.id);
            (0, globals_1.expect)(retried).toBeNull();
        });
    });
    // ========================================================================
    // Query Methods Tests
    // ========================================================================
    (0, globals_1.describe)('getActiveJobs()', () => {
        (0, globals_1.it)('should return only active jobs', async () => {
            // Create jobs with different statuses
            const activeJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-ACTIVE',
            });
            const completedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-COMPLETED',
            });
            await db.execute('UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?', ['completed', completedJob.id]);
            const activeJobs = await service.getActiveJobs(10);
            (0, globals_1.expect)(activeJobs.length).toBeGreaterThan(0);
            (0, globals_1.expect)(activeJobs.every((job) => ['waiting', 'active', 'delayed'].includes(job.status))).toBe(true);
        });
        (0, globals_1.it)('should respect limit parameter', async () => {
            // Create multiple active jobs
            for (let i = 0; i < 5; i++) {
                await service.queueJob({
                    ...testJobData,
                    taskCode: `TEST-LIMIT-${i}`,
                });
            }
            const activeJobs = await service.getActiveJobs(3);
            (0, globals_1.expect)(activeJobs.length).toBeLessThanOrEqual(3);
        });
    });
    (0, globals_1.describe)('getFailedJobs()', () => {
        (0, globals_1.it)('should return only failed jobs', async () => {
            const failedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-FAILED',
            });
            await db.execute('UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?', ['failed', failedJob.id]);
            const failedJobs = await service.getFailedJobs(10);
            (0, globals_1.expect)(failedJobs.length).toBeGreaterThan(0);
            (0, globals_1.expect)(failedJobs.every((job) => job.status === 'failed')).toBe(true);
        });
    });
    (0, globals_1.describe)('getJobsByAgent()', () => {
        (0, globals_1.it)('should return jobs for specific agent', async () => {
            const agentId = 999;
            await service.queueJob({
                ...testJobData,
                agentId,
                taskCode: 'TEST-AGENT-1',
            });
            await service.queueJob({
                ...testJobData,
                agentId,
                taskCode: 'TEST-AGENT-2',
            });
            const jobs = await service.getJobsByAgent(agentId);
            (0, globals_1.expect)(jobs.length).toBe(2);
            (0, globals_1.expect)(jobs.every((job) => job.agent_id === agentId)).toBe(true);
        });
        (0, globals_1.it)('should filter by status when provided', async () => {
            const agentId = 998;
            const job1 = await service.queueJob({
                ...testJobData,
                agentId,
                taskCode: 'TEST-STATUS-1',
            });
            const job2 = await service.queueJob({
                ...testJobData,
                agentId,
                taskCode: 'TEST-STATUS-2',
            });
            await db.execute('UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?', ['failed', job2.id]);
            const waitingJobs = await service.getJobsByAgent(agentId, 'waiting');
            (0, globals_1.expect)(waitingJobs.length).toBe(1);
            (0, globals_1.expect)(waitingJobs[0].status).toBe('waiting');
        });
    });
    (0, globals_1.describe)('getJobsByTask()', () => {
        (0, globals_1.it)('should return all jobs for a task including retries', async () => {
            const taskId = 9999;
            await service.queueJob({
                ...testJobData,
                taskId,
                taskCode: 'TEST-TASK-RETRY-1',
            });
            await service.queueJob({
                ...testJobData,
                taskId,
                taskCode: 'TEST-TASK-RETRY-2',
            });
            const jobs = await service.getJobsByTask(taskId);
            (0, globals_1.expect)(jobs.length).toBe(2);
            (0, globals_1.expect)(jobs.every((job) => job.task_id === taskId)).toBe(true);
        });
    });
    (0, globals_1.describe)('getJobsByProject()', () => {
        (0, globals_1.it)('should return jobs for specific project', async () => {
            const projectId = 99;
            await service.queueJob({
                ...testJobData,
                projectId,
                taskCode: 'TEST-PROJECT-1',
            });
            const jobs = await service.getJobsByProject(projectId);
            (0, globals_1.expect)(jobs.length).toBeGreaterThan(0);
            (0, globals_1.expect)(jobs.every((job) => job.project_id === projectId)).toBe(true);
        });
    });
    (0, globals_1.describe)('getQueueMetrics()', () => {
        (0, globals_1.it)('should return metrics with correct structure', async () => {
            const metrics = await service.getQueueMetrics();
            (0, globals_1.expect)(metrics).toHaveProperty('waiting');
            (0, globals_1.expect)(metrics).toHaveProperty('active');
            (0, globals_1.expect)(metrics).toHaveProperty('completed');
            (0, globals_1.expect)(metrics).toHaveProperty('failed');
            (0, globals_1.expect)(metrics).toHaveProperty('avgExecutionTimeMs');
            (0, globals_1.expect)(metrics).toHaveProperty('successRate');
            (0, globals_1.expect)(typeof metrics.waiting).toBe('number');
            (0, globals_1.expect)(typeof metrics.successRate).toBe('number');
        });
        (0, globals_1.it)('should calculate success rate correctly', async () => {
            // Create completed job
            const completedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-METRICS-COMPLETED',
            });
            await db.execute('UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?', ['completed', completedJob.id]);
            // Create failed job
            const failedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-METRICS-FAILED',
            });
            await db.execute('UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?', ['failed', failedJob.id]);
            const metrics = await service.getQueueMetrics();
            (0, globals_1.expect)(metrics.successRate).toBeGreaterThan(0);
            (0, globals_1.expect)(metrics.successRate).toBeLessThanOrEqual(100);
        });
    });
    (0, globals_1.describe)('cleanupOldJobs()', () => {
        (0, globals_1.it)('should delete old completed jobs', async () => {
            const job = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-CLEANUP',
            });
            // Mark as completed 31 days ago
            await db.execute(`UPDATE agent_jobs
                 SET status = 'completed',
                     completed_at = DATE_SUB(NOW(), INTERVAL 31 DAY)
                 WHERE bullmq_job_id = ?`, [job.id]);
            const deletedCount = await service.cleanupOldJobs(30);
            (0, globals_1.expect)(deletedCount).toBeGreaterThan(0);
        });
        (0, globals_1.it)('should not delete recent completed jobs', async () => {
            const job = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-CLEANUP-RECENT',
            });
            await db.execute('UPDATE agent_jobs SET status = ?, completed_at = NOW() WHERE bullmq_job_id = ?', ['completed', job.id]);
            const deletedCount = await service.cleanupOldJobs(30);
            // Verify job still exists
            const [rows] = await db.execute('SELECT * FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            (0, globals_1.expect)(rows.length).toBe(1);
        });
    });
    // ========================================================================
    // Event Handler Tests
    // ========================================================================
    (0, globals_1.describe)('Event Handlers', () => {
        (0, globals_1.it)('should update database when job completes', async () => {
            const job = await service.queueJob(testJobData);
            const result = {
                success: true,
                taskId: testJobData.taskId,
                taskCode: testJobData.taskCode,
                itemsCompleted: 5,
                itemsTotal: 5,
                progress: 100,
                executionTimeMs: 1500,
                taskStatus: 'completed',
            };
            // Manually trigger completion
            await job.moveToCompleted(result, job.id, false);
            // Wait for event handler
            await new Promise((resolve) => setTimeout(resolve, 200));
            const [rows] = await db.execute('SELECT * FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            const dbRecord = rows[0];
            (0, globals_1.expect)(dbRecord.status).toBe('completed');
            (0, globals_1.expect)(dbRecord.progress).toBe(100);
            (0, globals_1.expect)(dbRecord.job_result).toBeDefined();
        });
        (0, globals_1.it)('should update database when job fails', async () => {
            const job = await service.queueJob(testJobData);
            const error = new Error('Test error');
            await job.moveToFailed(error, job.id, false);
            // Wait for event handler
            await new Promise((resolve) => setTimeout(resolve, 200));
            const [rows] = await db.execute('SELECT * FROM agent_jobs WHERE bullmq_job_id = ?', [job.id]);
            const dbRecord = rows[0];
            (0, globals_1.expect)(dbRecord.status).toBe('failed');
            (0, globals_1.expect)(dbRecord.last_error).toContain('Test error');
        });
    });
});
//# sourceMappingURL=agentExecutionService.test.js.map