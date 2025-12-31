/**
 * BullMQ Queue Type Definitions
 * DFO 4.0 - Agent Execution Engine
 *
 * Type definitions for job data, results, and queue configuration
 */

import type { Job } from 'bullmq';

// ============================================================================
// Agent Job Data
// ============================================================================

/**
 * Data payload for agent execution jobs
 */
export interface AgentJobData {
    /** DFO task ID to execute */
    taskId: number;

    /** Task code (e.g., DFO-123) for logging */
    taskCode: string;

    /** Agent ID assigned to execute this task */
    agentId: number;

    /** Agent name for logging */
    agentName: string;

    /** Project ID for context loading */
    projectId: number;

    /** MCP server configurations for this agent */
    mcpConfigs?: AgentMCPConfig[];

    /** Task context (dependencies, related tasks, memories) */
    context?: {
        dependencies?: number[];
        relatedTasks?: number[];
        memoryIds?: number[];
    };

    /** Execution metadata */
    metadata?: {
        priority: string;
        estimatedHours?: number;
        retryCount?: number;
    };
}

/**
 * MCP server configuration for agent execution
 */
export interface AgentMCPConfig {
    serverName: string;
    serverUrl: string;
    authType: 'bearer' | 'basic' | 'none';
    authCredentials?: Record<string, unknown>;
    enabled: boolean;
}

// ============================================================================
// Job Result
// ============================================================================

/**
 * Result returned by completed agent execution jobs
 */
export interface JobResult {
    /** Whether execution was successful */
    success: boolean;

    /** Task ID that was executed */
    taskId: number;

    /** Task code */
    taskCode: string;

    /** Number of task items completed */
    itemsCompleted: number;

    /** Total number of task items */
    itemsTotal: number;

    /** Final task progress percentage */
    progress: number;

    /** Execution time in milliseconds */
    executionTimeMs: number;

    /** Error details if failed */
    error?: {
        message: string;
        code: string;
        stack?: string;
    };

    /** Agent output/logs */
    output?: string;

    /** Updated task status */
    taskStatus: 'pending' | 'in_progress' | 'completed' | 'blocked';

    /** Completion notes if task was completed */
    completionNotes?: string;
}

// ============================================================================
// Job Status
// ============================================================================

/**
 * Extended job status with DFO-specific info
 */
export interface AgentJobStatus {
    /** BullMQ job ID */
    jobId: string;

    /** Task ID being executed */
    taskId: number;

    /** Task code */
    taskCode: string;

    /** Agent ID executing */
    agentId: number;

    /** Job state */
    state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

    /** Job progress (0-100) */
    progress: number;

    /** Start timestamp */
    startedAt?: Date;

    /** Completion timestamp */
    completedAt?: Date;

    /** Error if failed */
    failedReason?: string;

    /** Number of retry attempts */
    attemptsMade: number;

    /** Max retry attempts */
    attemptsMax: number;

    /** Job result if completed */
    result?: JobResult;
}

// ============================================================================
// Queue Configuration
// ============================================================================

/**
 * Queue configuration interface
 */
export interface QueueConfig {
    /** Queue name */
    name: string;

    /** Redis connection options */
    connection: {
        host: string;
        port: number;
        password?: string;
    };

    /** Default job options */
    defaultJobOptions: {
        attempts: number;
        backoff: {
            type: 'exponential' | 'fixed';
            delay: number;
        };
        removeOnComplete: {
            age: number;
            count: number;
        };
        removeOnFail: {
            age: number;
            count: number;
        };
    };
}

// ============================================================================
// Worker Context
// ============================================================================

/**
 * Context available to workers during job processing
 */
export interface WorkerContext {
    /** Database connection */
    db: any; // mysql2/promise Connection

    /** Redis client */
    redis: any; // ioredis Redis

    /** MCP client manager (for external tool access) */
    mcpClient?: any; // MCPClientManager

    /** Logger instance */
    logger: {
        info: (message: string, meta?: Record<string, unknown>) => void;
        warn: (message: string, meta?: Record<string, unknown>) => void;
        error: (message: string, meta?: Record<string, unknown>) => void;
    };
}

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Type-safe job wrapper
 */
export type AgentJob = Job<AgentJobData, JobResult, string>;

/**
 * Job processor function signature
 */
export type AgentJobProcessor = (
    job: AgentJob,
    context: WorkerContext
) => Promise<JobResult>;
