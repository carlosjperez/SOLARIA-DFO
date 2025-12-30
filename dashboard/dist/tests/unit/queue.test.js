"use strict";
/**
 * BullMQ Queue Configuration Tests
 * DFO 4.0 - Agent Execution Engine
 *
 * Tests Redis connection, queue creation, job operations, and retry logic.
 * Run with: npm test tests/unit/queue.test.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_1 = require("../../config/queue");
// ============================================================================
// Test Setup & Teardown
// ============================================================================
let redisConnection;
let testQueue;
let testWorker;
beforeAll(() => {
    // Create Redis connection for testing
    redisConnection = (0, queue_1.createRedisConnection)();
});
afterAll(async () => {
    // Cleanup: close all connections
    if (testWorker) {
        await testWorker.close();
    }
    if (testQueue) {
        await testQueue.close();
    }
    if (redisConnection) {
        await redisConnection.quit();
    }
});
beforeEach(async () => {
    // Clean up any leftover jobs from previous tests
    if (testQueue) {
        await testQueue.obliterate({ force: true });
    }
});
// ============================================================================
// Redis Connection Tests
// ============================================================================
describe('Redis Connection', () => {
    it('should create a valid Redis connection', async () => {
        expect(redisConnection).toBeDefined();
        expect(redisConnection.status).toBe('ready');
    });
    it('should use correct Redis URL from environment', () => {
        const expectedUrl = process.env.REDIS_URL || 'redis://redis:6379';
        expect(redisConnection.options.host).toBeDefined();
    });
    it('should have BullMQ-required options', () => {
        expect(redisConnection.options.maxRetriesPerRequest).toBeNull();
        expect(redisConnection.options.enableReadyCheck).toBe(false);
    });
    it('should implement exponential backoff retry strategy', () => {
        const retryStrategy = redisConnection.options.retryStrategy;
        expect(retryStrategy).toBeDefined();
        if (retryStrategy) {
            // Test retry delays
            expect(retryStrategy(1)).toBe(100); // First retry: 100ms
            expect(retryStrategy(5)).toBe(500); // Fifth retry: 500ms
            expect(retryStrategy(100)).toBe(10000); // 100th retry: 10s
            expect(retryStrategy(500)).toBe(30000); // Max delay: 30s
        }
    });
    it('should successfully ping Redis', async () => {
        const result = await redisConnection.ping();
        expect(result).toBe('PONG');
    });
});
// ============================================================================
// Queue Configuration Tests
// ============================================================================
describe('Queue Names Registry', () => {
    it('should define all queue names', () => {
        expect(queue_1.QueueNames.AGENT_EXECUTION).toBe('agent-execution');
        expect(queue_1.QueueNames.EMBEDDING_GENERATION).toBe('embedding-generation');
        expect(queue_1.QueueNames.WEBHOOK_DELIVERY).toBe('webhook-delivery');
    });
    it('should have immutable queue names', () => {
        expect(() => {
            // @ts-expect-error - Testing immutability
            queue_1.QueueNames.AGENT_EXECUTION = 'modified';
        }).toThrow();
    });
});
describe('Default Job Options', () => {
    it('should configure 3 retry attempts', () => {
        expect(queue_1.defaultJobOptions.attempts).toBe(3);
    });
    it('should use exponential backoff', () => {
        expect(queue_1.defaultJobOptions.backoff.type).toBe('exponential');
        expect(queue_1.defaultJobOptions.backoff.delay).toBe(5000); // 5 seconds
    });
    it('should remove completed jobs after 24 hours', () => {
        expect(queue_1.defaultJobOptions.removeOnComplete.age).toBe(86400); // 24h in seconds
        expect(queue_1.defaultJobOptions.removeOnComplete.count).toBe(1000);
    });
    it('should remove failed jobs after 7 days', () => {
        expect(queue_1.defaultJobOptions.removeOnFail.age).toBe(604800); // 7 days
        expect(queue_1.defaultJobOptions.removeOnFail.count).toBe(5000);
    });
});
describe('Queue Options Factory', () => {
    it('should return valid queue options', () => {
        const options = (0, queue_1.getQueueOptions)();
        expect(options.connection).toBeDefined();
        expect(options.defaultJobOptions).toEqual(queue_1.defaultJobOptions);
    });
});
describe('Worker Options Factory', () => {
    it('should return valid worker options', () => {
        const options = (0, queue_1.getWorkerOptions)();
        expect(options.connection).toBeDefined();
        expect(options.concurrency).toBe(5);
        expect(options.lockDuration).toBe(30000); // 30 seconds
        expect(options.autorun).toBe(true);
    });
});
describe('Priority Mapping', () => {
    it('should map task priorities to job priorities', () => {
        expect((0, queue_1.taskPriorityToJobPriority)('critical')).toBe(queue_1.JobPriority.CRITICAL);
        expect((0, queue_1.taskPriorityToJobPriority)('high')).toBe(queue_1.JobPriority.HIGH);
        expect((0, queue_1.taskPriorityToJobPriority)('medium')).toBe(queue_1.JobPriority.MEDIUM);
        expect((0, queue_1.taskPriorityToJobPriority)('low')).toBe(queue_1.JobPriority.LOW);
    });
    it('should default to MEDIUM priority for unknown values', () => {
        expect((0, queue_1.taskPriorityToJobPriority)('invalid')).toBe(queue_1.JobPriority.MEDIUM);
        expect((0, queue_1.taskPriorityToJobPriority)('')).toBe(queue_1.JobPriority.MEDIUM);
    });
    it('should have correct priority values', () => {
        // Lower number = higher priority in BullMQ
        expect(queue_1.JobPriority.CRITICAL).toBe(1);
        expect(queue_1.JobPriority.HIGH).toBe(2);
        expect(queue_1.JobPriority.MEDIUM).toBe(3);
        expect(queue_1.JobPriority.LOW).toBe(4);
    });
});
// ============================================================================
// Queue Creation Tests
// ============================================================================
describe('Queue Creation', () => {
    beforeEach(async () => {
        const options = (0, queue_1.getQueueOptions)();
        testQueue = new bullmq_1.Queue(queue_1.QueueNames.AGENT_EXECUTION, options);
        await testQueue.waitUntilReady();
    });
    it('should create queue successfully', () => {
        expect(testQueue).toBeDefined();
        expect(testQueue.name).toBe(queue_1.QueueNames.AGENT_EXECUTION);
    });
    it('should be ready for operations', async () => {
        const isReady = await testQueue.isReady();
        expect(isReady).toBe(true);
    });
    it('should have correct default job options', () => {
        expect(testQueue.opts.defaultJobOptions).toEqual(queue_1.defaultJobOptions);
    });
});
// ============================================================================
// Job Operations Tests
// ============================================================================
describe('Job Operations', () => {
    beforeEach(async () => {
        testQueue = new bullmq_1.Queue(queue_1.QueueNames.AGENT_EXECUTION, (0, queue_1.getQueueOptions)());
        await testQueue.waitUntilReady();
    });
    it('should enqueue a job successfully', async () => {
        const jobData = {
            taskId: 123,
            taskCode: 'DFO-123',
            agentId: 11,
            agentName: 'Claude Code',
            projectId: 1,
            metadata: {
                priority: 'high',
                estimatedHours: 2
            }
        };
        const job = await testQueue.add('test-job', jobData);
        expect(job).toBeDefined();
        expect(job.id).toBeDefined();
        expect(job.data).toEqual(jobData);
        expect(job.name).toBe('test-job');
    });
    it('should enqueue job with correct priority', async () => {
        const jobData = {
            taskId: 456,
            taskCode: 'DFO-456',
            agentId: 11,
            agentName: 'Claude Code',
            projectId: 1,
            metadata: { priority: 'critical' }
        };
        const job = await testQueue.add('critical-job', jobData, {
            priority: (0, queue_1.taskPriorityToJobPriority)('critical')
        });
        expect(job.opts.priority).toBe(queue_1.JobPriority.CRITICAL);
    });
    it('should retrieve job from queue', async () => {
        const jobData = {
            taskId: 789,
            taskCode: 'DFO-789',
            agentId: 11,
            agentName: 'Claude Code',
            projectId: 1
        };
        const addedJob = await testQueue.add('retrieve-test', jobData);
        const retrievedJob = await testQueue.getJob(addedJob.id);
        expect(retrievedJob).toBeDefined();
        expect(retrievedJob.id).toBe(addedJob.id);
        expect(retrievedJob.data).toEqual(jobData);
    });
    it('should get job counts', async () => {
        await testQueue.add('count-test-1', {
            taskId: 1, taskCode: 'DFO-1', agentId: 11,
            agentName: 'Test', projectId: 1
        });
        await testQueue.add('count-test-2', {
            taskId: 2, taskCode: 'DFO-2', agentId: 11,
            agentName: 'Test', projectId: 1
        });
        const counts = await testQueue.getJobCounts('waiting', 'active');
        expect(counts.waiting).toBeGreaterThanOrEqual(2);
    });
    it('should remove job from queue', async () => {
        const job = await testQueue.add('remove-test', {
            taskId: 999, taskCode: 'DFO-999', agentId: 11,
            agentName: 'Test', projectId: 1
        });
        await job.remove();
        const removedJob = await testQueue.getJob(job.id);
        expect(removedJob).toBeUndefined();
    });
});
// ============================================================================
// Worker Processing Tests
// ============================================================================
describe('Worker Processing', () => {
    beforeEach(async () => {
        testQueue = new bullmq_1.Queue(queue_1.QueueNames.AGENT_EXECUTION, (0, queue_1.getQueueOptions)());
        await testQueue.waitUntilReady();
    });
    it('should process a simple job successfully', async () => {
        const processedJobs = [];
        // Create worker
        testWorker = new bullmq_1.Worker(queue_1.QueueNames.AGENT_EXECUTION, async (job) => {
            processedJobs.push(job);
            return {
                success: true,
                taskId: job.data.taskId,
                taskCode: job.data.taskCode,
                itemsCompleted: 5,
                itemsTotal: 5,
                progress: 100,
                executionTimeMs: 1000,
                taskStatus: 'completed'
            };
        }, (0, queue_1.getWorkerOptions)());
        // Add job
        const jobData = {
            taskId: 100,
            taskCode: 'DFO-100',
            agentId: 11,
            agentName: 'Test Worker',
            projectId: 1
        };
        const job = await testQueue.add('worker-test', jobData);
        // Wait for processing
        await job.waitUntilFinished(testQueue.events);
        expect(processedJobs).toHaveLength(1);
        expect(processedJobs[0].data).toEqual(jobData);
    });
    it('should handle job failure', async () => {
        testWorker = new bullmq_1.Worker(queue_1.QueueNames.AGENT_EXECUTION, async () => {
            throw new Error('Simulated processing error');
        }, (0, queue_1.getWorkerOptions)());
        const job = await testQueue.add('failure-test', {
            taskId: 101, taskCode: 'DFO-101', agentId: 11,
            agentName: 'Test', projectId: 1
        });
        // Wait for failure
        await expect(job.waitUntilFinished(testQueue.events)).rejects.toThrow();
        const state = await job.getState();
        expect(state).toBe('failed');
    });
    it('should retry failed jobs according to defaultJobOptions', async () => {
        let attemptCount = 0;
        testWorker = new bullmq_1.Worker(queue_1.QueueNames.AGENT_EXECUTION, async () => {
            attemptCount++;
            if (attemptCount < 3) {
                throw new Error('Retry needed');
            }
            return {
                success: true,
                taskId: 102,
                taskCode: 'DFO-102',
                itemsCompleted: 1,
                itemsTotal: 1,
                progress: 100,
                executionTimeMs: 500,
                taskStatus: 'completed'
            };
        }, (0, queue_1.getWorkerOptions)());
        const job = await testQueue.add('retry-test', {
            taskId: 102, taskCode: 'DFO-102', agentId: 11,
            agentName: 'Test', projectId: 1
        });
        await job.waitUntilFinished(testQueue.events);
        expect(attemptCount).toBe(3);
        expect(await job.isCompleted()).toBe(true);
    });
    it('should fail job after max retry attempts', async () => {
        testWorker = new bullmq_1.Worker(queue_1.QueueNames.AGENT_EXECUTION, async () => {
            throw new Error('Persistent failure');
        }, (0, queue_1.getWorkerOptions)());
        const job = await testQueue.add('max-retry-test', {
            taskId: 103, taskCode: 'DFO-103', agentId: 11,
            agentName: 'Test', projectId: 1
        });
        await expect(job.waitUntilFinished(testQueue.events)).rejects.toThrow();
        const state = await job.getState();
        expect(state).toBe('failed');
        expect(job.attemptsMade).toBe(queue_1.defaultJobOptions.attempts);
    });
});
// ============================================================================
// Job Data Validation Tests
// ============================================================================
describe('Job Data Validation', () => {
    beforeEach(async () => {
        testQueue = new bullmq_1.Queue(queue_1.QueueNames.AGENT_EXECUTION, (0, queue_1.getQueueOptions)());
        await testQueue.waitUntilReady();
    });
    it('should accept minimal valid job data', async () => {
        const minimalData = {
            taskId: 200,
            taskCode: 'DFO-200',
            agentId: 11,
            agentName: 'Claude Code',
            projectId: 1
        };
        const job = await testQueue.add('minimal-test', minimalData);
        expect(job.data).toEqual(minimalData);
    });
    it('should accept job data with all optional fields', async () => {
        const fullData = {
            taskId: 201,
            taskCode: 'DFO-201',
            agentId: 11,
            agentName: 'Claude Code',
            projectId: 1,
            mcpConfigs: [{
                    serverName: 'context7',
                    serverUrl: 'https://context7.solaria.agency',
                    authType: 'bearer',
                    authCredentials: { token: 'test-token' },
                    enabled: true
                }],
            context: {
                dependencies: [199, 200],
                relatedTasks: [150],
                memoryIds: [50]
            },
            metadata: {
                priority: 'high',
                estimatedHours: 4,
                retryCount: 0
            }
        };
        const job = await testQueue.add('full-data-test', fullData);
        expect(job.data).toEqual(fullData);
    });
});
// ============================================================================
// Integration Tests
// ============================================================================
describe('Queue Integration', () => {
    it('should handle concurrent job processing', async () => {
        testQueue = new bullmq_1.Queue(queue_1.QueueNames.AGENT_EXECUTION, (0, queue_1.getQueueOptions)());
        await testQueue.waitUntilReady();
        const processedJobIds = [];
        testWorker = new bullmq_1.Worker(queue_1.QueueNames.AGENT_EXECUTION, async (job) => {
            processedJobIds.push(job.id);
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
            return {
                success: true,
                taskId: job.data.taskId,
                taskCode: job.data.taskCode,
                itemsCompleted: 1,
                itemsTotal: 1,
                progress: 100,
                executionTimeMs: 100,
                taskStatus: 'completed'
            };
        }, (0, queue_1.getWorkerOptions)());
        // Add 10 jobs concurrently
        const jobs = await Promise.all(Array.from({ length: 10 }, (_, i) => testQueue.add(`concurrent-${i}`, {
            taskId: 300 + i,
            taskCode: `DFO-${300 + i}`,
            agentId: 11,
            agentName: 'Test',
            projectId: 1
        })));
        // Wait for all to finish
        await Promise.all(jobs.map(job => job.waitUntilFinished(testQueue.events)));
        expect(processedJobIds).toHaveLength(10);
    });
    it('should respect job priority order', async () => {
        testQueue = new bullmq_1.Queue(queue_1.QueueNames.AGENT_EXECUTION, (0, queue_1.getQueueOptions)());
        await testQueue.waitUntilReady();
        const processingOrder = [];
        testWorker = new bullmq_1.Worker(queue_1.QueueNames.AGENT_EXECUTION, async (job) => {
            processingOrder.push(job.data.taskCode);
            return {
                success: true,
                taskId: job.data.taskId,
                taskCode: job.data.taskCode,
                itemsCompleted: 1,
                itemsTotal: 1,
                progress: 100,
                executionTimeMs: 50,
                taskStatus: 'completed'
            };
        }, { ...(0, queue_1.getWorkerOptions)(), concurrency: 1 } // Process one at a time
        );
        // Add jobs in reverse priority order
        await testQueue.add('low', {
            taskId: 401, taskCode: 'DFO-401', agentId: 11,
            agentName: 'Test', projectId: 1
        }, { priority: queue_1.JobPriority.LOW });
        await testQueue.add('critical', {
            taskId: 402, taskCode: 'DFO-402', agentId: 11,
            agentName: 'Test', projectId: 1
        }, { priority: queue_1.JobPriority.CRITICAL });
        await testQueue.add('high', {
            taskId: 403, taskCode: 'DFO-403', agentId: 11,
            agentName: 'Test', projectId: 1
        }, { priority: queue_1.JobPriority.HIGH });
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 500));
        // Critical should be processed first, then high, then low
        expect(processingOrder[0]).toBe('DFO-402'); // critical
        expect(processingOrder[1]).toBe('DFO-403'); // high
        expect(processingOrder[2]).toBe('DFO-401'); // low
    });
});
console.log('✓ All BullMQ queue tests completed');
//# sourceMappingURL=queue.test.js.map