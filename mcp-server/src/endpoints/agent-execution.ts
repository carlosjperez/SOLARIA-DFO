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

        const jobStatus = apiResponse.data!;

        if (args.format === 'human') {
            return builder.success(jobStatus, {
                format: 'human',
                formatted: formatJobStatus(jobStatus)
            });
        }

        return builder.success(jobStatus);
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

    try {
        const [rows] = (await db.execute(
            `SELECT
                aj.bullmq_job_id as jobId,
                aj.task_id as taskId,
                t.code as taskCode,
                aj.agent_id as agentId,
                a.name as agentName,
                aj.status,
                aj.progress,
                aj.queued_at as queuedAt,
                aj.started_at as startedAt,
                aj.completed_at as completedAt,
                aj.attempts_made as attemptsMade,
                aj.max_attempts as maxAttempts,
                aj.last_error as lastError
            FROM agent_jobs aj
            JOIN tasks t ON aj.task_id = t.id
            JOIN agents a ON aj.agent_id = a.id
            WHERE aj.status IN ('waiting', 'active', 'delayed')
            ORDER BY aj.queued_at DESC
            LIMIT ?`,
            [args.limit]
        )) as unknown as [RowDataPacket[], any];

        const jobs = rows as JobStatus[];

        if (args.format === 'human') {
            return builder.success(jobs, {
                format: 'human',
                formatted: formatActiveJobs(jobs)
            });
        }

        return builder.success({ jobs, count: jobs.length });
    } catch (error: any) {
        return builder.error(CommonErrors.databaseError(error));
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
