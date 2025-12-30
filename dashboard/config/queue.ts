/**
 * BullMQ Queue Configuration
 * DFO 4.0 - Agent Execution Engine
 *
 * Configures Redis connection and default job options for BullMQ queues.
 * Used by AgentExecutionService and Worker processes.
 */

import { QueueOptions, WorkerOptions, ConnectionOptions } from 'bullmq';
import Redis from 'ioredis';

// ============================================================================
// Redis Connection
// ============================================================================

/**
 * Creates a Redis connection for BullMQ
 * Uses the same REDIS_URL as the main server for consistency
 */
export function createRedisConnection(): Redis {
    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

    return new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false, // Required for BullMQ
        retryStrategy: (times: number) => {
            // Exponential backoff with max 30 seconds
            const delay = Math.min(times * 100, 30000);
            return delay;
        }
    });
}

// ============================================================================
// Queue Names
// ============================================================================

/**
 * Centralized queue name registry
 * All queue names should be defined here to avoid typos
 */
export const QueueNames = {
    AGENT_EXECUTION: 'agent-execution',
    EMBEDDING_GENERATION: 'embedding-generation',
    WEBHOOK_DELIVERY: 'webhook-delivery'
} as const;

// ============================================================================
// Default Job Options
// ============================================================================

/**
 * Default options for all jobs
 * Can be overridden on a per-job basis
 */
export const defaultJobOptions = {
    attempts: 3, // Retry up to 3 times
    backoff: {
        type: 'exponential' as const,
        delay: 5000 // Initial delay: 5 seconds
    },
    removeOnComplete: {
        age: 86400, // Remove completed jobs after 24 hours
        count: 1000 // Keep max 1000 completed jobs
    },
    removeOnFail: {
        age: 604800, // Remove failed jobs after 7 days
        count: 5000 // Keep max 5000 failed jobs
    }
};

// ============================================================================
// Queue Options
// ============================================================================

/**
 * Default options for queue creation
 */
export function getQueueOptions(): QueueOptions {
    return {
        connection: createRedisConnection(),
        defaultJobOptions
    };
}

// ============================================================================
// Worker Options
// ============================================================================

/**
 * Default options for worker creation
 */
export function getWorkerOptions(): Partial<WorkerOptions> {
    return {
        connection: createRedisConnection(),
        concurrency: 5, // Process up to 5 jobs concurrently
        lockDuration: 30000, // Job lock duration: 30 seconds
        autorun: true
    };
}

// ============================================================================
// Agent Execution Specific Configuration
// ============================================================================

/**
 * Priority levels for agent execution jobs
 */
export const JobPriority = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4
} as const;

/**
 * Maps task priority to job priority
 */
export function taskPriorityToJobPriority(taskPriority: string): number {
    const map: Record<string, number> = {
        'critical': JobPriority.CRITICAL,
        'high': JobPriority.HIGH,
        'medium': JobPriority.MEDIUM,
        'low': JobPriority.LOW
    };

    return map[taskPriority] || JobPriority.MEDIUM;
}

// ============================================================================
// Type Exports
// ============================================================================

export type QueueName = typeof QueueNames[keyof typeof QueueNames];
