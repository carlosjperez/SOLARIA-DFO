"use strict";
/**
 * SOLARIA DFO - Agent Execution Service
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Manages BullMQ job queue for autonomous agent execution with:
 * - Job queueing with priority and dependency resolution
 * - Real-time status tracking and progress updates
 * - Retry logic with exponential backoff
 * - Database persistence for job metadata
 * - WebSocket event emission for live updates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentExecutionService = void 0;
const bullmq_1 = require("bullmq");
const queue_js_1 = require("../config/queue.js");
/**
 * AgentExecutionService
 *
 * Central service for managing agent execution jobs through BullMQ.
 * Provides methods for queueing, monitoring, and controlling agent tasks.
 */
class AgentExecutionService {
    /**
     * Initialize the AgentExecutionService
     * @param db - MySQL database connection
     * @param io - Socket.IO server instance for real-time events
     */
    constructor(db, io) {
        this.db = db;
        this.io = io;
        this.redisConnection = (0, queue_js_1.createRedisConnection)();
        this.queue = new bullmq_1.Queue(queue_js_1.QueueNames.AGENT_EXECUTION, (0, queue_js_1.getQueueOptions)(this.redisConnection));
        this.queueEvents = new bullmq_1.QueueEvents(queue_js_1.QueueNames.AGENT_EXECUTION, (0, queue_js_1.getQueueOptions)(this.redisConnection));
        // Setup event listeners
        this.setupEventListeners();
    }
    /**
     * Setup BullMQ event listeners for job lifecycle
     */
    setupEventListeners() {
        // Queue events - job state changes
        this.queue.on('completed', async (job) => {
            console.log(`[AgentExecution] Job ${job.id} completed`);
            await this.handleJobCompleted(job);
        });
        this.queue.on('failed', async (job, err) => {
            if (job) {
                console.error(`[AgentExecution] Job ${job.id} failed:`, err.message);
                await this.handleJobFailed(job, err);
            }
        });
        this.queue.on('progress', async (job, progress) => {
            console.log(`[AgentExecution] Job ${job.id} progress:`, progress);
            await this.handleJobProgress(job, progress);
        });
        // Queue events - worker picks up job (active state)
        this.queueEvents.on('active', async ({ jobId }) => {
            console.log(`[AgentExecution] Job ${jobId} started (active)`);
            await this.handleJobStarted(jobId);
        });
    }
    // ========================================================================
    // Public API - Job Management
    // ========================================================================
    /**
     * Queue a new agent execution job
     *
     * @param data - Job data containing task, agent, and context information
     * @returns BullMQ Job instance with unique ID
     *
     * @example
     * ```typescript
     * const job = await service.queueJob({
     *   taskId: 123,
     *   taskCode: 'DFO-184',
     *   agentId: 11,
     *   agentName: 'Claude Code',
     *   projectId: 1,
     *   metadata: { priority: 'high', estimatedHours: 10 }
     * });
     * console.log(`Job queued: ${job.id}`);
     * ```
     */
    async queueJob(data) {
        try {
            // Convert task priority to BullMQ priority (1-4 scale)
            const jobPriority = (0, queue_js_1.taskPriorityToJobPriority)(data.metadata?.priority || 'medium');
            // Add job to BullMQ queue
            const job = await this.queue.add(`task-${data.taskCode}`, data, {
                priority: jobPriority,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });
            // Persist job metadata to database
            await this.db.execute(`INSERT INTO agent_jobs
                 (bullmq_job_id, queue_name, task_id, task_code, agent_id, project_id,
                  status, progress, job_data, priority, queued_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`, [
                job.id,
                queue_js_1.QueueNames.AGENT_EXECUTION,
                data.taskId,
                data.taskCode,
                data.agentId,
                data.projectId,
                'waiting',
                0,
                JSON.stringify(data),
                jobPriority,
            ]);
            console.log(`[AgentExecution] Queued job ${job.id} for task ${data.taskCode}`);
            // Emit WebSocket event for real-time UI update
            const queuedEvent = {
                jobId: job.id,
                taskId: data.taskId,
                taskCode: data.taskCode,
                agentId: data.agentId,
                agentName: data.agentName,
                projectId: data.projectId,
                priority: data.metadata?.priority || 'medium',
                status: 'waiting',
                queuedAt: new Date().toISOString(),
            };
            this.io.to('notifications').emit('agent_job_queued', queuedEvent);
            this.io.to(`project:${data.projectId}`).emit('agent_job_queued', queuedEvent);
            return job;
        }
        catch (error) {
            console.error('[AgentExecution] Queue job error:', error);
            throw error;
        }
    }
    /**
     * Get the current status of a job
     *
     * @param jobId - BullMQ job ID (string or number)
     * @returns Complete job status including BullMQ state and DB metadata
     *
     * @example
     * ```typescript
     * const status = await service.getJobStatus('123');
     * console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
     * ```
     */
    async getJobStatus(jobId) {
        try {
            // Get job from BullMQ
            const job = await this.queue.getJob(jobId);
            if (!job) {
                return null;
            }
            // Get DB record for additional metadata
            const [rows] = await this.db.execute(`SELECT * FROM agent_jobs WHERE bullmq_job_id = ?`, [jobId]);
            const dbRecord = rows[0];
            if (!dbRecord) {
                return null;
            }
            // Get job state from BullMQ
            const state = await job.getState();
            const progress = job.progress || 0;
            return {
                id: job.id,
                name: job.name,
                data: job.data,
                progress,
                status: state,
                attemptsMade: job.attemptsMade,
                finishedOn: job.finishedOn,
                processedOn: job.processedOn,
                failedReason: job.failedReason,
                returnvalue: job.returnvalue,
                dbRecord: {
                    id: dbRecord.id,
                    taskId: dbRecord.task_id,
                    taskCode: dbRecord.task_code,
                    agentId: dbRecord.agent_id,
                    projectId: dbRecord.project_id,
                    status: dbRecord.status,
                    progress: dbRecord.progress,
                    queuedAt: dbRecord.queued_at,
                    startedAt: dbRecord.started_at,
                    completedAt: dbRecord.completed_at,
                    lastError: dbRecord.last_error,
                    executionTimeMs: dbRecord.execution_time_ms,
                },
            };
        }
        catch (error) {
            console.error('[AgentExecution] Get job status error:', error);
            throw error;
        }
    }
    /**
     * Cancel a running or pending job
     *
     * @param jobId - BullMQ job ID
     * @returns true if job was cancelled, false if not found or already completed
     *
     * @example
     * ```typescript
     * const cancelled = await service.cancelJob('123');
     * if (cancelled) {
     *   console.log('Job cancelled successfully');
     * }
     * ```
     */
    async cancelJob(jobId) {
        try {
            const job = await this.queue.getJob(jobId);
            if (!job) {
                return false;
            }
            // Check if job can be cancelled (not already completed/failed)
            const state = await job.getState();
            if (state === 'completed' || state === 'failed') {
                return false;
            }
            // Remove job from queue
            await job.remove();
            // Update DB status to cancelled
            await this.db.execute(`UPDATE agent_jobs
                 SET status = 'cancelled', updated_at = NOW()
                 WHERE bullmq_job_id = ?`, [jobId]);
            console.log(`[AgentExecution] Cancelled job ${jobId}`);
            return true;
        }
        catch (error) {
            console.error('[AgentExecution] Cancel job error:', error);
            throw error;
        }
    }
    /**
     * Retry a failed job
     *
     * @param jobId - BullMQ job ID of the failed job
     * @returns New job instance if retry succeeded
     *
     * @example
     * ```typescript
     * const newJob = await service.retryJob('123');
     * console.log(`Retrying as job ${newJob.id}`);
     * ```
     */
    async retryJob(jobId) {
        try {
            const job = await this.queue.getJob(jobId);
            if (!job) {
                return null;
            }
            // Check if job is in a retryable state
            const state = await job.getState();
            if (state !== 'failed') {
                return null;
            }
            // Get current retry count from DB
            const [rows] = await this.db.execute(`SELECT attempts_made, max_attempts, job_data FROM agent_jobs WHERE bullmq_job_id = ?`, [jobId]);
            const record = rows[0];
            if (!record) {
                return null;
            }
            // Check if max retries reached
            if (record.attempts_made >= record.max_attempts) {
                console.warn(`[AgentExecution] Job ${jobId} exceeded max retries`);
                return null;
            }
            // Requeue the job with incremented retry count
            const jobData = typeof record.job_data === 'string'
                ? JSON.parse(record.job_data)
                : record.job_data;
            jobData.metadata = jobData.metadata || {};
            jobData.metadata.retryCount = (record.attempts_made || 0) + 1;
            const newJob = await this.queueJob(jobData);
            // Update old job record
            await this.db.execute(`UPDATE agent_jobs
                 SET status = 'cancelled', updated_at = NOW()
                 WHERE bullmq_job_id = ?`, [jobId]);
            console.log(`[AgentExecution] Retried job ${jobId} as ${newJob.id}`);
            return newJob;
        }
        catch (error) {
            console.error('[AgentExecution] Retry job error:', error);
            throw error;
        }
    }
    // ========================================================================
    // Private Event Handlers
    // ========================================================================
    /**
     * Handle job started event (worker picks up job)
     */
    async handleJobStarted(jobId) {
        try {
            // Get job data from database
            const [rows] = await this.db.execute(`SELECT task_id, task_code, agent_id, project_id, job_data
                 FROM agent_jobs
                 WHERE bullmq_job_id = ?`, [jobId]);
            if (rows.length === 0) {
                console.warn(`[AgentExecution] Job ${jobId} not found in database`);
                return;
            }
            const jobRecord = rows[0];
            const jobData = JSON.parse(jobRecord.job_data);
            // Emit WebSocket event for real-time UI update
            const startedEvent = {
                jobId,
                taskId: jobRecord.task_id,
                taskCode: jobRecord.task_code,
                agentId: jobRecord.agent_id,
                agentName: jobData.agentName,
                projectId: jobRecord.project_id,
                status: 'active',
                startedAt: new Date().toISOString(),
            };
            this.io.to('notifications').emit('agent_job_started', startedEvent);
            this.io.to(`project:${jobRecord.project_id}`).emit('agent_job_started', startedEvent);
        }
        catch (error) {
            console.error('[AgentExecution] Handle job started error:', error);
        }
    }
    /**
     * Handle job completion event
     */
    async handleJobCompleted(job) {
        try {
            const result = job.returnvalue;
            const executionTimeMs = job.finishedOn ? job.finishedOn - (job.processedOn || job.finishedOn) : 0;
            await this.db.execute(`UPDATE agent_jobs
                 SET status = 'completed',
                     progress = 100,
                     job_result = ?,
                     completed_at = NOW(),
                     execution_time_ms = ?,
                     updated_at = NOW()
                 WHERE bullmq_job_id = ?`, [
                JSON.stringify(result),
                executionTimeMs,
                job.id,
            ]);
            // Emit WebSocket event for real-time UI update
            const completedEvent = {
                jobId: job.id,
                taskId: job.data.taskId,
                taskCode: job.data.taskCode,
                agentId: job.data.agentId,
                projectId: job.data.projectId,
                status: 'completed',
                progress: 100,
                result: result,
                executionTimeMs,
                completedAt: new Date().toISOString(),
            };
            this.io.to('notifications').emit('agent_job_completed', completedEvent);
            this.io.to(`project:${job.data.projectId}`).emit('agent_job_completed', completedEvent);
        }
        catch (error) {
            console.error('[AgentExecution] Handle job completed error:', error);
        }
    }
    /**
     * Handle job failure event
     */
    async handleJobFailed(job, error) {
        try {
            await this.db.execute(`UPDATE agent_jobs
                 SET status = 'failed',
                     last_error = ?,
                     error_stack = ?,
                     attempts_made = ?,
                     updated_at = NOW()
                 WHERE bullmq_job_id = ?`, [
                error.message,
                error.stack || null,
                job.attemptsMade,
                job.id,
            ]);
            // Emit WebSocket event for real-time UI update
            const failedEvent = {
                jobId: job.id,
                taskId: job.data.taskId,
                taskCode: job.data.taskCode,
                agentId: job.data.agentId,
                projectId: job.data.projectId,
                status: 'failed',
                error: {
                    message: error.message,
                    stack: error.stack,
                },
                attemptsMade: job.attemptsMade,
                failedAt: new Date().toISOString(),
            };
            this.io.to('notifications').emit('agent_job_failed', failedEvent);
            this.io.to(`project:${job.data.projectId}`).emit('agent_job_failed', failedEvent);
        }
        catch (err) {
            console.error('[AgentExecution] Handle job failed error:', err);
        }
    }
    /**
     * Handle job progress update event
     */
    async handleJobProgress(job, progress) {
        try {
            const progressValue = typeof progress === 'number' ? progress : 0;
            await this.db.execute(`UPDATE agent_jobs
                 SET progress = ?,
                     updated_at = NOW()
                 WHERE bullmq_job_id = ?`, [progressValue, job.id]);
            // Emit WebSocket event for real-time UI update
            const progressEvent = {
                jobId: job.id,
                taskId: job.data.taskId,
                taskCode: job.data.taskCode,
                agentId: job.data.agentId,
                projectId: job.data.projectId,
                progress: progressValue,
                status: 'active',
                updatedAt: new Date().toISOString(),
            };
            this.io.to('notifications').emit('agent_job_progress', progressEvent);
            this.io.to(`project:${job.data.projectId}`).emit('agent_job_progress', progressEvent);
        }
        catch (error) {
            console.error('[AgentExecution] Handle job progress error:', error);
        }
    }
    // ========================================================================
    // Query Methods - Monitoring and Debugging
    // ========================================================================
    /**
     * Get all active jobs (waiting, active, delayed)
     *
     * @param limit - Maximum number of jobs to return (default: 50)
     * @returns Array of active jobs with full status
     */
    async getActiveJobs(limit = 50) {
        try {
            const [rows] = await this.db.execute(`SELECT * FROM agent_jobs
                 WHERE status IN ('waiting', 'active', 'delayed')
                 ORDER BY priority ASC, queued_at ASC
                 LIMIT ?`, [limit]);
            const jobs = [];
            for (const row of rows) {
                const status = await this.getJobStatus(row.bullmq_job_id);
                if (status) {
                    jobs.push(status);
                }
            }
            return jobs;
        }
        catch (error) {
            console.error('[AgentExecution] Get active jobs error:', error);
            throw error;
        }
    }
    /**
     * Get all failed jobs
     *
     * @param limit - Maximum number of jobs to return (default: 50)
     * @returns Array of failed jobs with error details
     */
    async getFailedJobs(limit = 50) {
        try {
            const [rows] = await this.db.execute(`SELECT * FROM agent_jobs
                 WHERE status = 'failed'
                 ORDER BY updated_at DESC
                 LIMIT ?`, [limit]);
            const jobs = [];
            for (const row of rows) {
                const status = await this.getJobStatus(row.bullmq_job_id);
                if (status) {
                    jobs.push(status);
                }
            }
            return jobs;
        }
        catch (error) {
            console.error('[AgentExecution] Get failed jobs error:', error);
            throw error;
        }
    }
    /**
     * Get all jobs for a specific agent
     *
     * @param agentId - Agent ID
     * @param statusFilter - Optional status filter
     * @param limit - Maximum number of jobs to return (default: 100)
     * @returns Array of jobs assigned to the agent
     */
    async getJobsByAgent(agentId, statusFilter, limit = 100) {
        try {
            let query = `SELECT * FROM agent_jobs WHERE agent_id = ?`;
            const params = [agentId];
            if (statusFilter) {
                query += ` AND status = ?`;
                params.push(statusFilter);
            }
            query += ` ORDER BY queued_at DESC LIMIT ?`;
            params.push(limit);
            const [rows] = await this.db.execute(query, params);
            return rows;
        }
        catch (error) {
            console.error('[AgentExecution] Get jobs by agent error:', error);
            throw error;
        }
    }
    /**
     * Get all jobs for a specific task
     *
     * @param taskId - Task ID
     * @returns Array of jobs for the task (including retries)
     */
    async getJobsByTask(taskId) {
        try {
            const [rows] = await this.db.execute(`SELECT * FROM agent_jobs
                 WHERE task_id = ?
                 ORDER BY queued_at DESC`, [taskId]);
            return rows;
        }
        catch (error) {
            console.error('[AgentExecution] Get jobs by task error:', error);
            throw error;
        }
    }
    /**
     * Get all jobs for a specific project
     *
     * @param projectId - Project ID
     * @param limit - Maximum number of jobs to return (default: 100)
     * @returns Array of jobs for the project
     */
    async getJobsByProject(projectId, limit = 100) {
        try {
            const [rows] = await this.db.execute(`SELECT * FROM agent_jobs
                 WHERE project_id = ?
                 ORDER BY queued_at DESC
                 LIMIT ?`, [projectId, limit]);
            return rows;
        }
        catch (error) {
            console.error('[AgentExecution] Get jobs by project error:', error);
            throw error;
        }
    }
    /**
     * Get queue metrics and statistics
     *
     * @returns Queue metrics including counts, average times, success rate
     */
    async getQueueMetrics() {
        try {
            // Get counts by status
            const [statusCounts] = await this.db.execute(`SELECT status, COUNT(*) as count
                 FROM agent_jobs
                 GROUP BY status`);
            const metrics = {
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
                delayed: 0,
                cancelled: 0,
                avgExecutionTimeMs: 0,
                successRate: 0,
            };
            for (const row of statusCounts) {
                metrics[row.status] = row.count;
            }
            // Get average execution time (completed jobs only)
            const [avgTime] = await this.db.execute(`SELECT AVG(execution_time_ms) as avg_time
                 FROM agent_jobs
                 WHERE status = 'completed' AND execution_time_ms IS NOT NULL`);
            metrics.avgExecutionTimeMs = avgTime[0]?.avg_time || 0;
            // Calculate success rate
            const totalCompleted = metrics.completed + metrics.failed;
            if (totalCompleted > 0) {
                metrics.successRate = (metrics.completed / totalCompleted) * 100;
            }
            return metrics;
        }
        catch (error) {
            console.error('[AgentExecution] Get queue metrics error:', error);
            throw error;
        }
    }
    /**
     * Clean up old completed jobs (housekeeping)
     *
     * @param olderThanDays - Delete jobs older than this many days (default: 30)
     * @returns Number of jobs deleted
     */
    async cleanupOldJobs(olderThanDays = 30) {
        try {
            const [result] = await this.db.execute(`DELETE FROM agent_jobs
                 WHERE status = 'completed'
                 AND completed_at < DATE_SUB(NOW(), INTERVAL ? DAY)`, [olderThanDays]);
            console.log(`[AgentExecution] Cleaned up ${result.affectedRows} old jobs`);
            return result.affectedRows;
        }
        catch (error) {
            console.error('[AgentExecution] Cleanup old jobs error:', error);
            throw error;
        }
    }
    // ========================================================================
    // Cleanup
    // ========================================================================
    /**
     * Close queue and Redis connections
     */
    async close() {
        await this.queue.close();
        this.redisConnection.disconnect();
    }
}
exports.AgentExecutionService = AgentExecutionService;
exports.default = AgentExecutionService;
