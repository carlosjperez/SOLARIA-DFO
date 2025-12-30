/**
 * BullMQ Queue Configuration
 * DFO 4.0 - Agent Execution Engine
 *
 * Configures Redis connection and default job options for BullMQ queues.
 * Used by AgentExecutionService and Worker processes.
 */
import { QueueOptions, WorkerOptions } from 'bullmq';
import Redis from 'ioredis';
/**
 * Creates a Redis connection for BullMQ
 * Uses the same REDIS_URL as the main server for consistency
 */
export declare function createRedisConnection(): Redis;
/**
 * Centralized queue name registry
 * All queue names should be defined here to avoid typos
 */
export declare const QueueNames: {
    readonly AGENT_EXECUTION: "agent-execution";
    readonly EMBEDDING_GENERATION: "embedding-generation";
    readonly WEBHOOK_DELIVERY: "webhook-delivery";
};
/**
 * Default options for all jobs
 * Can be overridden on a per-job basis
 */
export declare const defaultJobOptions: {
    attempts: number;
    backoff: {
        type: "exponential";
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
/**
 * Default options for queue creation
 */
export declare function getQueueOptions(): QueueOptions;
/**
 * Default options for worker creation
 */
export declare function getWorkerOptions(): Partial<WorkerOptions>;
/**
 * Priority levels for agent execution jobs
 */
export declare const JobPriority: {
    readonly CRITICAL: 1;
    readonly HIGH: 2;
    readonly MEDIUM: 3;
    readonly LOW: 4;
};
/**
 * Maps task priority to job priority
 */
export declare function taskPriorityToJobPriority(taskPriority: string): number;
export type QueueName = typeof QueueNames[keyof typeof QueueNames];
