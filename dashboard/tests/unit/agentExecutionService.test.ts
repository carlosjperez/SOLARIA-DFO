/**
 * SOLARIA DFO - AgentExecutionService Tests
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Comprehensive unit tests for AgentExecutionService
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mysql, { Connection } from 'mysql2/promise';
import { Queue, Worker } from 'bullmq';
import AgentExecutionService from '../../services/agentExecutionService.js';
import { AgentJobData, JobResult, QueueNames, createRedisConnection } from '../../config/queue.js';

describe('AgentExecutionService', () => {
    let db: Connection;
    let service: AgentExecutionService;
    let redisConnection: any;
    let testWorker: Worker<AgentJobData, JobResult>;

    // Test data
    const testJobData: AgentJobData = {
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

    beforeAll(async () => {
        // Connect to test database
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'solaria_construction_test',
        });

        // Initialize Redis connection
        redisConnection = createRedisConnection();

        // Create service instance
        service = new AgentExecutionService(db);

        // Wait for connections to be ready
        await new Promise((resolve) => setTimeout(resolve, 100));
    });

    afterAll(async () => {
        // Cleanup
        if (testWorker) {
            await testWorker.close();
        }
        await service.close();
        await db.end();
    });

    beforeEach(async () => {
        // Clean up test data before each test
        await db.execute('DELETE FROM agent_jobs WHERE task_code LIKE "TEST-%"');
    });

    // ========================================================================
    // Job Queueing Tests
    // ========================================================================

    describe('queueJob()', () => {
        it('should queue a job successfully', async () => {
            const job = await service.queueJob(testJobData);

            expect(job).toBeDefined();
            expect(job.id).toBeDefined();
            expect(job.name).toBe(`task-${testJobData.taskCode}`);
            expect(job.data).toMatchObject(testJobData);
        });

        it('should persist job metadata to database', async () => {
            const job = await service.queueJob(testJobData);

            const [rows] = await db.execute(
                'SELECT * FROM agent_jobs WHERE bullmq_job_id = ?',
                [job.id]
            );

            const dbRecord = (rows as any)[0];
            expect(dbRecord).toBeDefined();
            expect(dbRecord.task_id).toBe(testJobData.taskId);
            expect(dbRecord.task_code).toBe(testJobData.taskCode);
            expect(dbRecord.agent_id).toBe(testJobData.agentId);
            expect(dbRecord.project_id).toBe(testJobData.projectId);
            expect(dbRecord.status).toBe('waiting');
            expect(dbRecord.progress).toBe(0);
        });

        it('should assign correct priority based on task priority', async () => {
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
            expect(criticalJob.opts.priority).toBe(1);
            expect(mediumJob.opts.priority).toBe(3);
            expect(lowJob.opts.priority).toBe(4);
        });

        it('should include retry configuration in job options', async () => {
            const job = await service.queueJob(testJobData);

            expect(job.opts.attempts).toBe(3);
            expect(job.opts.backoff).toMatchObject({
                type: 'exponential',
                delay: 5000,
            });
        });
    });

    // ========================================================================
    // Job Status Tests
    // ========================================================================

    describe('getJobStatus()', () => {
        it('should return null for non-existent job', async () => {
            const status = await service.getJobStatus('non-existent-id');
            expect(status).toBeNull();
        });

        it('should return complete job status', async () => {
            const job = await service.queueJob(testJobData);
            const status = await service.getJobStatus(job.id!);

            expect(status).toBeDefined();
            expect(status!.id).toBe(job.id);
            expect(status!.data).toMatchObject(testJobData);
            expect(status!.status).toBe('waiting');
            expect(status!.dbRecord).toBeDefined();
            expect(status!.dbRecord.taskId).toBe(testJobData.taskId);
        });

        it('should reflect progress updates', async () => {
            const job = await service.queueJob(testJobData);

            // Simulate progress update
            await db.execute(
                'UPDATE agent_jobs SET progress = ? WHERE bullmq_job_id = ?',
                [50, job.id]
            );

            const status = await service.getJobStatus(job.id!);
            expect(status!.dbRecord.progress).toBe(50);
        });
    });

    // ========================================================================
    // Job Cancellation Tests
    // ========================================================================

    describe('cancelJob()', () => {
        it('should cancel a pending job', async () => {
            const job = await service.queueJob(testJobData);
            const cancelled = await service.cancelJob(job.id!);

            expect(cancelled).toBe(true);

            // Verify DB status
            const [rows] = await db.execute(
                'SELECT status FROM agent_jobs WHERE bullmq_job_id = ?',
                [job.id]
            );
            const dbRecord = (rows as any)[0];
            expect(dbRecord.status).toBe('cancelled');
        });

        it('should return false for non-existent job', async () => {
            const cancelled = await service.cancelJob('non-existent-id');
            expect(cancelled).toBe(false);
        });

        it('should return false for already completed job', async () => {
            const job = await service.queueJob(testJobData);

            // Mark as completed
            await db.execute(
                'UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?',
                ['completed', job.id]
            );
            await job.moveToCompleted({ success: true } as any, job.id!, false);

            const cancelled = await service.cancelJob(job.id!);
            expect(cancelled).toBe(false);
        });
    });

    // ========================================================================
    // Job Retry Tests
    // ========================================================================

    describe('retryJob()', () => {
        it('should retry a failed job', async () => {
            const job = await service.queueJob(testJobData);

            // Mark job as failed
            await job.moveToFailed(new Error('Test failure'), job.id!, false);
            await db.execute(
                'UPDATE agent_jobs SET status = ?, attempts_made = ? WHERE bullmq_job_id = ?',
                ['failed', 1, job.id]
            );

            const newJob = await service.retryJob(job.id!);

            expect(newJob).toBeDefined();
            expect(newJob!.id).not.toBe(job.id); // Should be a new job
            expect(newJob!.data.metadata?.retryCount).toBe(2);
        });

        it('should return null for non-failed job', async () => {
            const job = await service.queueJob(testJobData);
            const retried = await service.retryJob(job.id!);

            expect(retried).toBeNull();
        });

        it('should return null when max retries exceeded', async () => {
            const job = await service.queueJob(testJobData);

            // Mark as failed with max attempts
            await job.moveToFailed(new Error('Test failure'), job.id!, false);
            await db.execute(
                `UPDATE agent_jobs
                 SET status = 'failed', attempts_made = 3, max_attempts = 3
                 WHERE bullmq_job_id = ?`,
                [job.id]
            );

            const retried = await service.retryJob(job.id!);
            expect(retried).toBeNull();
        });
    });

    // ========================================================================
    // Query Methods Tests
    // ========================================================================

    describe('getActiveJobs()', () => {
        it('should return only active jobs', async () => {
            // Create jobs with different statuses
            const activeJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-ACTIVE',
            });

            const completedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-COMPLETED',
            });
            await db.execute(
                'UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?',
                ['completed', completedJob.id]
            );

            const activeJobs = await service.getActiveJobs(10);

            expect(activeJobs.length).toBeGreaterThan(0);
            expect(activeJobs.every((job) => ['waiting', 'active', 'delayed'].includes(job.status))).toBe(true);
        });

        it('should respect limit parameter', async () => {
            // Create multiple active jobs
            for (let i = 0; i < 5; i++) {
                await service.queueJob({
                    ...testJobData,
                    taskCode: `TEST-LIMIT-${i}`,
                });
            }

            const activeJobs = await service.getActiveJobs(3);
            expect(activeJobs.length).toBeLessThanOrEqual(3);
        });
    });

    describe('getFailedJobs()', () => {
        it('should return only failed jobs', async () => {
            const failedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-FAILED',
            });

            await db.execute(
                'UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?',
                ['failed', failedJob.id]
            );

            const failedJobs = await service.getFailedJobs(10);
            expect(failedJobs.length).toBeGreaterThan(0);
            expect(failedJobs.every((job) => job.status === 'failed')).toBe(true);
        });
    });

    describe('getJobsByAgent()', () => {
        it('should return jobs for specific agent', async () => {
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
            expect(jobs.length).toBe(2);
            expect(jobs.every((job: any) => job.agent_id === agentId)).toBe(true);
        });

        it('should filter by status when provided', async () => {
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

            await db.execute(
                'UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?',
                ['failed', job2.id]
            );

            const waitingJobs = await service.getJobsByAgent(agentId, 'waiting');
            expect(waitingJobs.length).toBe(1);
            expect((waitingJobs[0] as any).status).toBe('waiting');
        });
    });

    describe('getJobsByTask()', () => {
        it('should return all jobs for a task including retries', async () => {
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
            expect(jobs.length).toBe(2);
            expect(jobs.every((job: any) => job.task_id === taskId)).toBe(true);
        });
    });

    describe('getJobsByProject()', () => {
        it('should return jobs for specific project', async () => {
            const projectId = 99;
            await service.queueJob({
                ...testJobData,
                projectId,
                taskCode: 'TEST-PROJECT-1',
            });

            const jobs = await service.getJobsByProject(projectId);
            expect(jobs.length).toBeGreaterThan(0);
            expect(jobs.every((job: any) => job.project_id === projectId)).toBe(true);
        });
    });

    describe('getQueueMetrics()', () => {
        it('should return metrics with correct structure', async () => {
            const metrics = await service.getQueueMetrics();

            expect(metrics).toHaveProperty('waiting');
            expect(metrics).toHaveProperty('active');
            expect(metrics).toHaveProperty('completed');
            expect(metrics).toHaveProperty('failed');
            expect(metrics).toHaveProperty('avgExecutionTimeMs');
            expect(metrics).toHaveProperty('successRate');

            expect(typeof metrics.waiting).toBe('number');
            expect(typeof metrics.successRate).toBe('number');
        });

        it('should calculate success rate correctly', async () => {
            // Create completed job
            const completedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-METRICS-COMPLETED',
            });
            await db.execute(
                'UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?',
                ['completed', completedJob.id]
            );

            // Create failed job
            const failedJob = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-METRICS-FAILED',
            });
            await db.execute(
                'UPDATE agent_jobs SET status = ? WHERE bullmq_job_id = ?',
                ['failed', failedJob.id]
            );

            const metrics = await service.getQueueMetrics();
            expect(metrics.successRate).toBeGreaterThan(0);
            expect(metrics.successRate).toBeLessThanOrEqual(100);
        });
    });

    describe('cleanupOldJobs()', () => {
        it('should delete old completed jobs', async () => {
            const job = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-CLEANUP',
            });

            // Mark as completed 31 days ago
            await db.execute(
                `UPDATE agent_jobs
                 SET status = 'completed',
                     completed_at = DATE_SUB(NOW(), INTERVAL 31 DAY)
                 WHERE bullmq_job_id = ?`,
                [job.id]
            );

            const deletedCount = await service.cleanupOldJobs(30);
            expect(deletedCount).toBeGreaterThan(0);
        });

        it('should not delete recent completed jobs', async () => {
            const job = await service.queueJob({
                ...testJobData,
                taskCode: 'TEST-CLEANUP-RECENT',
            });

            await db.execute(
                'UPDATE agent_jobs SET status = ?, completed_at = NOW() WHERE bullmq_job_id = ?',
                ['completed', job.id]
            );

            const deletedCount = await service.cleanupOldJobs(30);

            // Verify job still exists
            const [rows] = await db.execute(
                'SELECT * FROM agent_jobs WHERE bullmq_job_id = ?',
                [job.id]
            );
            expect((rows as any).length).toBe(1);
        });
    });

    // ========================================================================
    // Event Handler Tests
    // ========================================================================

    describe('Event Handlers', () => {
        it('should update database when job completes', async () => {
            const job = await service.queueJob(testJobData);

            const result: JobResult = {
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
            await job.moveToCompleted(result, job.id!, false);

            // Wait for event handler
            await new Promise((resolve) => setTimeout(resolve, 200));

            const [rows] = await db.execute(
                'SELECT * FROM agent_jobs WHERE bullmq_job_id = ?',
                [job.id]
            );
            const dbRecord = (rows as any)[0];

            expect(dbRecord.status).toBe('completed');
            expect(dbRecord.progress).toBe(100);
            expect(dbRecord.job_result).toBeDefined();
        });

        it('should update database when job fails', async () => {
            const job = await service.queueJob(testJobData);
            const error = new Error('Test error');

            await job.moveToFailed(error, job.id!, false);

            // Wait for event handler
            await new Promise((resolve) => setTimeout(resolve, 200));

            const [rows] = await db.execute(
                'SELECT * FROM agent_jobs WHERE bullmq_job_id = ?',
                [job.id]
            );
            const dbRecord = (rows as any)[0];

            expect(dbRecord.status).toBe('failed');
            expect(dbRecord.last_error).toContain('Test error');
        });
    });
});
