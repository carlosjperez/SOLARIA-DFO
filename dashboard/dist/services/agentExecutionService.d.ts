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
import { Connection, RowDataPacket } from 'mysql2/promise';
import { Job } from 'bullmq';
import { AgentJobData, JobResult, AgentJobStatus } from '../config/queue.js';
import type { TypedIOServer } from '../types.js';
/**
 * AgentExecutionService
 *
 * Central service for managing agent execution jobs through BullMQ.
 * Provides methods for queueing, monitoring, and controlling agent tasks.
 */
export declare class AgentExecutionService {
    private db;
    private queue;
    private queueEvents;
    private redisConnection;
    private io;
    /**
     * Initialize the AgentExecutionService
     * @param db - MySQL database connection
     * @param io - Socket.IO server instance for real-time events
     */
    constructor(db: Connection, io: TypedIOServer);
    /**
     * Setup BullMQ event listeners for job lifecycle
     */
    private setupEventListeners;
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
    queueJob(data: AgentJobData): Promise<Job<AgentJobData, JobResult>>;
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
    getJobStatus(jobId: string): Promise<AgentJobStatus | null>;
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
    cancelJob(jobId: string): Promise<boolean>;
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
    retryJob(jobId: string): Promise<Job<AgentJobData, JobResult> | null>;
    /**
     * Handle job started event (worker picks up job)
     */
    private handleJobStarted;
    /**
     * Handle job completion event
     */
    private handleJobCompleted;
    /**
     * Handle job failure event
     */
    private handleJobFailed;
    /**
     * Handle job progress update event
     */
    private handleJobProgress;
    /**
     * Get all active jobs (waiting, active, delayed)
     *
     * @param limit - Maximum number of jobs to return (default: 50)
     * @returns Array of active jobs with full status
     */
    getActiveJobs(limit?: number): Promise<AgentJobStatus[]>;
    /**
     * Get all failed jobs
     *
     * @param limit - Maximum number of jobs to return (default: 50)
     * @returns Array of failed jobs with error details
     */
    getFailedJobs(limit?: number): Promise<AgentJobStatus[]>;
    /**
     * Get all jobs for a specific agent
     *
     * @param agentId - Agent ID
     * @param statusFilter - Optional status filter
     * @param limit - Maximum number of jobs to return (default: 100)
     * @returns Array of jobs assigned to the agent
     */
    getJobsByAgent(agentId: number, statusFilter?: string, limit?: number): Promise<RowDataPacket[]>;
    /**
     * Get all jobs for a specific task
     *
     * @param taskId - Task ID
     * @returns Array of jobs for the task (including retries)
     */
    getJobsByTask(taskId: number): Promise<RowDataPacket[]>;
    /**
     * Get all jobs for a specific project
     *
     * @param projectId - Project ID
     * @param limit - Maximum number of jobs to return (default: 100)
     * @returns Array of jobs for the project
     */
    getJobsByProject(projectId: number, limit?: number): Promise<RowDataPacket[]>;
    /**
     * Get queue metrics and statistics
     *
     * @returns Queue metrics including counts, average times, success rate
     */
    getQueueMetrics(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        cancelled: number;
        avgExecutionTimeMs: number;
        successRate: number;
    }>;
    /**
     * Clean up old completed jobs (housekeeping)
     *
     * @param olderThanDays - Delete jobs older than this many days (default: 30)
     * @returns Number of jobs deleted
     */
    cleanupOldJobs(olderThanDays?: number): Promise<number>;
    /**
     * Close queue and Redis connections
     */
    close(): Promise<void>;
}
export default AgentExecutionService;
