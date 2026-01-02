"use strict";
/**
 * BullMQ Queue Configuration
 * DFO 4.0 - Agent Execution Engine
 *
 * Configures Redis connection and default job options for BullMQ queues.
 * Used by AgentExecutionService and Worker processes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPriority = exports.defaultJobOptions = exports.QueueNames = void 0;
exports.createRedisConnection = createRedisConnection;
exports.getQueueOptions = getQueueOptions;
exports.getWorkerOptions = getWorkerOptions;
exports.taskPriorityToJobPriority = taskPriorityToJobPriority;
const ioredis_1 = __importDefault(require("ioredis"));
// ============================================================================
// Redis Connection
// ============================================================================
/**
 * Creates a Redis connection for BullMQ
 * Uses the same REDIS_URL as the main server for consistency
 */
function createRedisConnection() {
    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
    return new ioredis_1.default(redisUrl, {
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false, // Required for BullMQ
        retryStrategy: (times) => {
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
exports.QueueNames = {
    AGENT_EXECUTION: 'agent-execution',
    EMBEDDING_GENERATION: 'embedding-generation',
    WEBHOOK_DELIVERY: 'webhook-delivery'
};
// ============================================================================
// Default Job Options
// ============================================================================
/**
 * Default options for all jobs
 * Can be overridden on a per-job basis
 */
exports.defaultJobOptions = {
    attempts: 3, // Retry up to 3 times
    backoff: {
        type: 'exponential',
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
function getQueueOptions() {
    return {
        connection: createRedisConnection(),
        defaultJobOptions: exports.defaultJobOptions
    };
}
// ============================================================================
// Worker Options
// ============================================================================
/**
 * Default options for worker creation
 */
function getWorkerOptions() {
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
exports.JobPriority = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4
};
/**
 * Maps task priority to job priority
 */
function taskPriorityToJobPriority(taskPriority) {
    const map = {
        'critical': exports.JobPriority.CRITICAL,
        'high': exports.JobPriority.HIGH,
        'medium': exports.JobPriority.MEDIUM,
        'low': exports.JobPriority.LOW
    };
    return map[taskPriority] || exports.JobPriority.MEDIUM;
}
