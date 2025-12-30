/**
 * SOLARIA DFO - Agent Execution Worker
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * BullMQ worker process that consumes agent execution jobs from the
 * 'agent-execution' queue and delegates execution to assigned agents.
 *
 * Features:
 * - Concurrent job processing (5 workers)
 * - Exponential backoff retry (3 attempts)
 * - Context loading (dependencies, memories, related tasks)
 * - Real-time progress updates
 * - Graceful shutdown handling
 *
 * @example
 * ```bash
 * # Run worker
 * node workers/agentWorker.js
 *
 * # Worker will process jobs from 'agent-execution' queue
 * # Jobs are queued by AgentExecutionService
 * ```
 */
import { Worker } from 'bullmq';
import type { AgentJobData, JobResult } from '../types/queue.js';
/**
 * Create BullMQ Worker instance
 */
declare const worker: Worker<AgentJobData, JobResult, string>;
export default worker;
