/**
 * Agent Execution Endpoint Implementation
 *
 * @author ECO-Lambda | DFO 4.0 Implementation
 * @date 2025-12-30
 * @task DFO-189
 *
 * MCP tools for BullMQ-based parallel agent execution system.
 * Provides queue management, job status tracking, and worker monitoring.
 */

import { z } from 'zod';
import { ResponseBuilder, CommonErrors } from '../utils/response-builder.js'
import { db } from '../database.js'
import { Tool } from '../types/mcp.js'
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getDFOApiClient } from '../utils/dfo-api-client.js';

const VERSION = '4.0.0';

// ============================================================================
// Validation Schemas
// ============================================================================

const QueueAgentJobInputSchema = z.object({
    task_id: z.number().int().positive('Task ID must be a positive integer'),
    agent_id: z.number().int().positive('Agent ID must be a positive integer'),
    metadata: z
        .object({
            priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
            estimatedHours: z.number().positive().optional(),
            retryCount: z.number().int().nonnegative().optional(),
        })
        .optional(),
    context: z
        .object({
            dependencies: z.array(z.number().int().positive()).optional(),
            relatedTasks: z.array(z.number().int().positive()).optional(),
            memoryIds: z.array(z.number().int().positive()).optional(),
        })
        .optional(),
    mcp_configs: z
        .array(
            z.object({
                serverName: z.string().min(1),
                serverUrl: z.string().url(),
                authType: z.enum(['bearer', 'basic', 'api_key', 'none']),
                authCredentials: z.record(z.unknown()).optional(),
                enabled: z.boolean(),
            })
        )
        .optional(),
    format: z.enum(['json', 'human']).default('json'),
});

const GetJobStatusInputSchema = z.object({
    job_id: z.string().min(1, 'Job ID is required'),
    format: z.enum(['json', 'human']).default('json'),
});

const CancelJobInputSchema = z.object({
    job_id: z.string().min(1, 'Job ID is required'),
    format: z.enum(['json', 'human']).default('json'),
});

const ListActiveJobsInputSchema = z.object({
    limit: z.number().int().positive().max(100).default(10),
    format: z.enum(['json', 'human']).default('json'),
});

// ============================================================================
// Type Definitions
// ============================================================================

interface AgentJobData {
    taskId: number;
    taskCode: string;
    agentId: number;
    agentName: string;
    projectId: number;
    mcpConfigs?: Array<{
        serverName: string;
        serverUrl: string;
        authType: string;
        authCredentials?: Record<string, unknown>;
        enabled: boolean;
    }>;
    context?: {
        dependencies?: number[];
        relatedTasks?: number[];
        memoryIds?: number[];
    };
    metadata?: {
        priority: string;
        estimatedHours?: number;
        retryCount?: number;
    };
}

interface JobStatus {
    jobId: string;
    taskId: number;
    taskCode: string;
    agentId: number;
    agentName: string;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'cancelled';
    progress: number;
    queuedAt: string;
    startedAt?: string;
    completedAt?: string;
    attemptsMade: number;
    maxAttempts: number;
    lastError?: string;
}

interface WorkerMetrics {
    concurrency: number;
    lockDuration: number;
    queueName: string;
    status: string;
    queue: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        cancelled: number;
        avgExecutionTimeMs: number;
        successRate: number;
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format job status for human-readable output
 */
function formatJobStatus(job: JobStatus): string {
    const statusEmoji = {
        waiting: '⏳',
        active: '🔄',
        completed: '✅',
        failed: '❌',
        delayed: '⏸️',
        cancelled: '🚫',
    };

    let output = `Job Status Report\n`;
    output += `════════════════════════════════════════\n`;
    output += `${statusEmoji[job.status]} Status: ${job.status.toUpperCase()}\n`;
    output += `📋 Task: ${job.taskCode} (#${job.taskId})\n`;
    output += `🤖 Agent: ${job.agentName} (#${job.agentId})\n`;
    output += `📊 Progress: ${job.progress}%\n`;
    output += `⏰ Queued: ${new Date(job.queuedAt).toLocaleString()}\n`;

    if (job.startedAt) {
        output += `▶️  Started: ${new Date(job.startedAt).toLocaleString()}\n`;
    }

    if (job.completedAt) {
        output += `🏁 Completed: ${new Date(job.completedAt).toLocaleString()}\n`;
    }

    output += `🔁 Attempts: ${job.attemptsMade}/${job.maxAttempts}\n`;

    if (job.lastError) {
        output += `\n⚠️  Last Error:\n${job.lastError}\n`;
    }

    return output;
}

/**
 * Format worker metrics for human-readable output
 */
function formatWorkerMetrics(metrics: WorkerMetrics): string {
    let output = `Worker & Queue Status\n`;
    output += `════════════════════════════════════════\n`;
    output += `Worker Configuration:\n`;
    output += `  • Concurrency: ${metrics.concurrency} jobs\n`;
    output += `  • Lock Duration: ${metrics.lockDuration}ms\n`;
    output += `  • Queue: ${metrics.queueName}\n`;
    output += `  • Status: ${metrics.status}\n\n`;

    output += `Queue Metrics:\n`;
    output += `  ⏳ Waiting: ${metrics.queue.waiting}\n`;
    output += `  🔄 Active: ${metrics.queue.active}\n`;
    output += `  ✅ Completed: ${metrics.queue.completed}\n`;
    output += `  ❌ Failed: ${metrics.queue.failed}\n`;
    output += `  ⏸️  Delayed: ${metrics.queue.delayed}\n`;
    output += `  🚫 Cancelled: ${metrics.queue.cancelled}\n`;
    output += `  ⚡ Avg Execution: ${Math.round(metrics.queue.avgExecutionTimeMs)}ms\n`;
    output += `  📈 Success Rate: ${metrics.queue.successRate.toFixed(2)}%\n`;

    return output;
}

/**
 * Format active jobs list for human-readable output
 */
function formatActiveJobs(jobs: JobStatus[]): string {
    if (jobs.length === 0) {
        return 'No active jobs currently running.';
    }

    let output = `Active Jobs (${jobs.length})\n`;
    output += `════════════════════════════════════════\n`;

    jobs.forEach((job, index) => {
        const statusEmoji = {
            waiting: '⏳',
            active: '🔄',
            completed: '✅',
            failed: '❌',
            delayed: '⏸️',
            cancelled: '🚫',
        };

        output += `${index + 1}. ${statusEmoji[job.status]} ${job.taskCode}\n`;
        output += `   Agent: ${job.agentName} | Progress: ${job.progress}%\n`;
        output += `   Queued: ${new Date(job.queuedAt).toLocaleString()}\n`;
        if (index < jobs.length - 1) output += `\n`;
    });

    return output;
}

// ============================================================================
// Tool Handlers
// ============================================================================

/**
 * Queue a new agent execution job
 */
async function queueAgentJob(args: z.infer<typeof QueueAgentJobInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to queue the job
        const apiResponse = await apiClient.queueJob({
            taskId: args.task_id,
            agentId: args.agent_id,
            metadata: args.metadata,
            context: args.context,
            mcpConfigs: args.mcp_configs as any,
        });

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const response = apiResponse.data!;

        if (args.format === 'human') {
            return builder.success(response, {
                format: 'human',
                formatted: `✅ Agent job queued successfully\n\n` +
                    `Job ID: ${response.jobId}\n` +
                    `Task: ${response.taskCode} (#${response.taskId})\n` +
                    `Agent: ${response.agentName} (#${response.agentId})\n` +
                    `Priority: ${response.priority}\n` +
                    `Status: ${response.status}\n` +
                    `Queued: ${new Date(response.queuedAt).toLocaleString()}\n\n` +
                    `The job is now waiting in the execution queue and will be processed by the next available worker.`
            });
        }

        return builder.success(response);
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to queue job via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Check that Dashboard API is running and accessible at DFO_API_URL',
        });
    }
}

/**
 * Get the status of a queued job
 */
async function getJobStatus(args: z.infer<typeof GetJobStatusInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to get job status
        const apiResponse = await apiClient.getJobStatus(args.job_id);

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const apiJobStatus = apiResponse.data!;

        // Transform API response to JobStatus format for formatter
        const jobStatus: JobStatus = {
            jobId: apiJobStatus.jobId || '',
            taskId: apiJobStatus.taskId || 0,
            taskCode: apiJobStatus.taskCode || 'N/A',
            agentId: apiJobStatus.agentId || 0,
            agentName: apiJobStatus.agentName || 'Unknown',
            status: apiJobStatus.status || 'waiting',
            progress: apiJobStatus.progress || 0,
            queuedAt: new Date().toISOString(), // API doesn't return this for single job
            attemptsMade: 0, // API doesn't return this for single job
            maxAttempts: 3,
            startedAt: apiJobStatus.startedAt,
            completedAt: apiJobStatus.completedAt,
            lastError: apiJobStatus.error as string | undefined
        };

        if (args.format === 'human') {
            return builder.success(apiJobStatus, {
                format: 'human',
                formatted: formatJobStatus(jobStatus)
            });
        }

        return builder.success(apiJobStatus);
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to get job status via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Check that Dashboard API is running and accessible at DFO_API_URL',
        });
    }
}

/**
 * Cancel a queued or active job
 */
async function cancelJob(args: z.infer<typeof CancelJobInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to cancel the job
        const apiResponse = await apiClient.cancelJob(args.job_id);

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const response = apiResponse.data!;

        if (args.format === 'human') {
            return builder.success(response, {
                format: 'human',
                formatted: `🚫 Job cancelled successfully\n\n` +
                    `Job ID: ${response.jobId}\n` +
                    `Status: ${response.status}\n` +
                    `Cancelled: ${new Date(response.cancelledAt).toLocaleString()}\n\n` +
                    `The job has been removed from the execution queue.`
            });
        }

        return builder.success(response);
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to cancel job via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Check that Dashboard API is running and accessible at DFO_API_URL',
        });
    }
}

/**
 * List all active jobs
 */
async function listActiveJobs(args: z.infer<typeof ListActiveJobsInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });
    const apiClient = getDFOApiClient();

    try {
        // Call Dashboard API to list jobs
        const apiResponse = await apiClient.listJobs({
            statuses: ['waiting', 'active', 'delayed'],
            limit: args.limit
        });

        // Handle API errors
        if (!apiResponse.success) {
            return builder.error(apiResponse.error!);
        }

        const data = apiResponse.data!;

        // Map API response to JobStatus format for formatters
        const jobs: JobStatus[] = data.jobs.map((job: any) => ({
            jobId: job.id || job.jobId,
            taskId: job.dbRecord?.taskId || job.taskId,
            taskCode: job.dbRecord?.taskCode || job.taskCode || 'N/A',
            agentId: job.dbRecord?.agentId || job.agentId,
            agentName: job.dbRecord?.agentName || job.agentName || 'Unknown',
            status: job.status || job.dbRecord?.status || 'unknown',
            progress: job.progress || job.dbRecord?.progress || 0,
            queuedAt: job.dbRecord?.queuedAt || job.queuedAt || new Date().toISOString(),
            startedAt: job.dbRecord?.startedAt || job.startedAt,
            completedAt: job.dbRecord?.completedAt || job.completedAt || job.finishedOn,
            attemptsMade: job.attemptsMade || 0,
            maxAttempts: job.maxAttempts || 3,
            lastError: job.failedReason || job.dbRecord?.lastError
        }));

        if (args.format === 'human') {
            return builder.success({ jobs, count: jobs.length }, {
                format: 'human',
                formatted: formatActiveJobs(jobs)
            });
        }

        return builder.success({ jobs, count: jobs.length });
    } catch (error: any) {
        return builder.error({
            code: 'API_REQUEST_FAILED',
            message: 'Failed to list jobs via Dashboard API',
            details: { originalError: error.message },
            suggestion: 'Ensure DFO Dashboard API is accessible and DFO_API_TOKEN is configured correctly'
        });
    }
}

// ============================================================================
// Tool Definitions
// ============================================================================

export const agentExecutionTools: Tool[] = [
    {
        name: 'queue_agent_job',
        description:
            'Queue a new agent execution job in the BullMQ system. Creates a job that will be picked up by the next available worker for parallel execution. Supports task context, dependencies, and external MCP server configurations.',
        inputSchema: QueueAgentJobInputSchema,
        async execute(args: any) {
            const validated = QueueAgentJobInputSchema.parse(args);
            return queueAgentJob(validated);
        },
    },
    {
        name: 'get_agent_job_status',
        description:
            'Get the current status of a queued agent job. Returns comprehensive information including execution state, progress, timing, and any errors.',
        inputSchema: GetJobStatusInputSchema,
        async execute(args: any) {
            const validated = GetJobStatusInputSchema.parse(args);
            return getJobStatus(validated);
        },
    },
    {
        name: 'cancel_agent_job',
        description:
            'Cancel a queued or active agent job. Jobs that are completed, failed, or already cancelled cannot be cancelled. Removes the job from the execution queue.',
        inputSchema: CancelJobInputSchema,
        async execute(args: any) {
            const validated = CancelJobInputSchema.parse(args);
            return cancelJob(validated);
        },
    },
    {
        name: 'list_active_agent_jobs',
        description:
            'List all active agent jobs currently in the queue. Returns jobs that are waiting, active, or delayed. Useful for monitoring parallel execution and queue status.',
        inputSchema: ListActiveJobsInputSchema,
        async execute(args: any) {
            const validated = ListActiveJobsInputSchema.parse(args);
            return listActiveJobs(validated);
        },
    },
];

// Individual tool exports for handlers.ts registration
export const queueAgentJobTool: Tool = {
    name: 'queue_agent_job',
    description: agentExecutionTools[0].description,
    inputSchema: QueueAgentJobInputSchema,
    async execute(args: any) {
        const validated = QueueAgentJobInputSchema.parse(args);
        return queueAgentJob(validated);
    },
};

export const getAgentJobStatusTool: Tool = {
    name: 'get_agent_job_status',
    description: agentExecutionTools[1].description,
    inputSchema: GetJobStatusInputSchema,
    async execute(args: any) {
        const validated = GetJobStatusInputSchema.parse(args);
        return getJobStatus(validated);
    },
};

export const cancelAgentJobTool: Tool = {
    name: 'cancel_agent_job',
    description: agentExecutionTools[2].description,
    inputSchema: CancelJobInputSchema,
    async execute(args: any) {
        const validated = CancelJobInputSchema.parse(args);
        return cancelJob(validated);
    },
};

export const listActiveAgentJobsTool: Tool = {
    name: 'list_active_agent_jobs',
    description: agentExecutionTools[3].description,
    inputSchema: ListActiveJobsInputSchema,
    async execute(args: any) {
        const validated = ListActiveJobsInputSchema.parse(args);
        return listActiveJobs(validated);
    },
};
