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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentExecutionService = void 0;
var bullmq_1 = require("bullmq");
var queue_js_1 = require("../config/queue.js");
/**
 * AgentExecutionService
 *
 * Central service for managing agent execution jobs through BullMQ.
 * Provides methods for queueing, monitoring, and controlling agent tasks.
 */
var AgentExecutionService = /** @class */ (function () {
    /**
     * Initialize the AgentExecutionService
     * @param db - MySQL database connection
     * @param io - Socket.IO server instance for real-time events
     */
    function AgentExecutionService(db, io) {
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
    AgentExecutionService.prototype.setupEventListeners = function () {
        var _this = this;
        // Queue events - job state changes
        this.queue.on('completed', function (job) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[AgentExecution] Job ".concat(job.id, " completed"));
                        return [4 /*yield*/, this.handleJobCompleted(job)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this.queue.on('failed', function (job, err) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!job) return [3 /*break*/, 2];
                        console.error("[AgentExecution] Job ".concat(job.id, " failed:"), err.message);
                        return [4 /*yield*/, this.handleJobFailed(job, err)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        this.queue.on('progress', function (job, progress) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[AgentExecution] Job ".concat(job.id, " progress:"), progress);
                        return [4 /*yield*/, this.handleJobProgress(job, progress)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Queue events - worker picks up job (active state)
        this.queueEvents.on('active', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var jobId = _b.jobId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("[AgentExecution] Job ".concat(jobId, " started (active)"));
                        return [4 /*yield*/, this.handleJobStarted(jobId)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
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
    AgentExecutionService.prototype.queueJob = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var jobPriority, job, queuedEvent, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        jobPriority = (0, queue_js_1.taskPriorityToJobPriority)(((_a = data.metadata) === null || _a === void 0 ? void 0 : _a.priority) || 'medium');
                        return [4 /*yield*/, this.queue.add("task-".concat(data.taskCode), data, {
                                priority: jobPriority,
                                attempts: 3,
                                backoff: {
                                    type: 'exponential',
                                    delay: 5000,
                                },
                            })];
                    case 1:
                        job = _c.sent();
                        // Persist job metadata to database
                        return [4 /*yield*/, this.db.execute("INSERT INTO agent_jobs\n                 (bullmq_job_id, queue_name, task_id, task_code, agent_id, project_id,\n                  status, progress, job_data, priority, queued_at, created_at, updated_at)\n                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())", [
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
                            ])];
                    case 2:
                        // Persist job metadata to database
                        _c.sent();
                        console.log("[AgentExecution] Queued job ".concat(job.id, " for task ").concat(data.taskCode));
                        queuedEvent = {
                            jobId: job.id,
                            taskId: data.taskId,
                            taskCode: data.taskCode,
                            agentId: data.agentId,
                            agentName: data.agentName,
                            projectId: data.projectId,
                            priority: ((_b = data.metadata) === null || _b === void 0 ? void 0 : _b.priority) || 'medium',
                            status: 'waiting',
                            queuedAt: new Date().toISOString(),
                        };
                        this.io.to('notifications').emit('agent_job_queued', queuedEvent);
                        this.io.to("project:".concat(data.projectId)).emit('agent_job_queued', queuedEvent);
                        return [2 /*return*/, job];
                    case 3:
                        error_1 = _c.sent();
                        console.error('[AgentExecution] Queue job error:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
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
    AgentExecutionService.prototype.getJobStatus = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, rows, dbRecord, state, progress, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.queue.getJob(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!job) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.db.execute("SELECT * FROM agent_jobs WHERE bullmq_job_id = ?", [jobId])];
                    case 2:
                        rows = (_a.sent())[0];
                        dbRecord = rows[0];
                        if (!dbRecord) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, job.getState()];
                    case 3:
                        state = _a.sent();
                        progress = job.progress || 0;
                        return [2 /*return*/, {
                                id: job.id,
                                name: job.name,
                                data: job.data,
                                progress: progress,
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
                            }];
                    case 4:
                        error_2 = _a.sent();
                        console.error('[AgentExecution] Get job status error:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
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
    AgentExecutionService.prototype.cancelJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, state, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.queue.getJob(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!job) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, job.getState()];
                    case 2:
                        state = _a.sent();
                        if (state === 'completed' || state === 'failed') {
                            return [2 /*return*/, false];
                        }
                        // Remove job from queue
                        return [4 /*yield*/, job.remove()];
                    case 3:
                        // Remove job from queue
                        _a.sent();
                        // Update DB status to cancelled
                        return [4 /*yield*/, this.db.execute("UPDATE agent_jobs\n                 SET status = 'cancelled', updated_at = NOW()\n                 WHERE bullmq_job_id = ?", [jobId])];
                    case 4:
                        // Update DB status to cancelled
                        _a.sent();
                        console.log("[AgentExecution] Cancelled job ".concat(jobId));
                        return [2 /*return*/, true];
                    case 5:
                        error_3 = _a.sent();
                        console.error('[AgentExecution] Cancel job error:', error_3);
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
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
    AgentExecutionService.prototype.retryJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, state, rows, record, jobData, newJob, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.queue.getJob(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!job) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, job.getState()];
                    case 2:
                        state = _a.sent();
                        if (state !== 'failed') {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.db.execute("SELECT attempts_made, max_attempts, job_data FROM agent_jobs WHERE bullmq_job_id = ?", [jobId])];
                    case 3:
                        rows = (_a.sent())[0];
                        record = rows[0];
                        if (!record) {
                            return [2 /*return*/, null];
                        }
                        // Check if max retries reached
                        if (record.attempts_made >= record.max_attempts) {
                            console.warn("[AgentExecution] Job ".concat(jobId, " exceeded max retries"));
                            return [2 /*return*/, null];
                        }
                        jobData = typeof record.job_data === 'string'
                            ? JSON.parse(record.job_data)
                            : record.job_data;
                        jobData.metadata = jobData.metadata || {};
                        jobData.metadata.retryCount = (record.attempts_made || 0) + 1;
                        return [4 /*yield*/, this.queueJob(jobData)];
                    case 4:
                        newJob = _a.sent();
                        // Update old job record
                        return [4 /*yield*/, this.db.execute("UPDATE agent_jobs\n                 SET status = 'cancelled', updated_at = NOW()\n                 WHERE bullmq_job_id = ?", [jobId])];
                    case 5:
                        // Update old job record
                        _a.sent();
                        console.log("[AgentExecution] Retried job ".concat(jobId, " as ").concat(newJob.id));
                        return [2 /*return*/, newJob];
                    case 6:
                        error_4 = _a.sent();
                        console.error('[AgentExecution] Retry job error:', error_4);
                        throw error_4;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // Private Event Handlers
    // ========================================================================
    /**
     * Handle job started event (worker picks up job)
     */
    AgentExecutionService.prototype.handleJobStarted = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, jobRecord, jobData, startedEvent, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.execute("SELECT task_id, task_code, agent_id, project_id, job_data\n                 FROM agent_jobs\n                 WHERE bullmq_job_id = ?", [jobId])];
                    case 1:
                        rows = (_a.sent())[0];
                        if (rows.length === 0) {
                            console.warn("[AgentExecution] Job ".concat(jobId, " not found in database"));
                            return [2 /*return*/];
                        }
                        jobRecord = rows[0];
                        jobData = JSON.parse(jobRecord.job_data);
                        startedEvent = {
                            jobId: jobId,
                            taskId: jobRecord.task_id,
                            taskCode: jobRecord.task_code,
                            agentId: jobRecord.agent_id,
                            agentName: jobData.agentName,
                            projectId: jobRecord.project_id,
                            status: 'active',
                            startedAt: new Date().toISOString(),
                        };
                        this.io.to('notifications').emit('agent_job_started', startedEvent);
                        this.io.to("project:".concat(jobRecord.project_id)).emit('agent_job_started', startedEvent);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('[AgentExecution] Handle job started error:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle job completion event
     */
    AgentExecutionService.prototype.handleJobCompleted = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var result, executionTimeMs, completedEvent, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        result = job.returnvalue;
                        executionTimeMs = job.finishedOn ? job.finishedOn - (job.processedOn || job.finishedOn) : 0;
                        return [4 /*yield*/, this.db.execute("UPDATE agent_jobs\n                 SET status = 'completed',\n                     progress = 100,\n                     job_result = ?,\n                     completed_at = NOW(),\n                     execution_time_ms = ?,\n                     updated_at = NOW()\n                 WHERE bullmq_job_id = ?", [
                                JSON.stringify(result),
                                executionTimeMs,
                                job.id,
                            ])];
                    case 1:
                        _a.sent();
                        completedEvent = {
                            jobId: job.id,
                            taskId: job.data.taskId,
                            taskCode: job.data.taskCode,
                            agentId: job.data.agentId,
                            projectId: job.data.projectId,
                            status: 'completed',
                            progress: 100,
                            result: result,
                            executionTimeMs: executionTimeMs,
                            completedAt: new Date().toISOString(),
                        };
                        this.io.to('notifications').emit('agent_job_completed', completedEvent);
                        this.io.to("project:".concat(job.data.projectId)).emit('agent_job_completed', completedEvent);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('[AgentExecution] Handle job completed error:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle job failure event
     */
    AgentExecutionService.prototype.handleJobFailed = function (job, error) {
        return __awaiter(this, void 0, void 0, function () {
            var failedEvent, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.execute("UPDATE agent_jobs\n                 SET status = 'failed',\n                     last_error = ?,\n                     error_stack = ?,\n                     attempts_made = ?,\n                     updated_at = NOW()\n                 WHERE bullmq_job_id = ?", [
                                error.message,
                                error.stack || null,
                                job.attemptsMade,
                                job.id,
                            ])];
                    case 1:
                        _a.sent();
                        failedEvent = {
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
                        this.io.to("project:".concat(job.data.projectId)).emit('agent_job_failed', failedEvent);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error('[AgentExecution] Handle job failed error:', err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle job progress update event
     */
    AgentExecutionService.prototype.handleJobProgress = function (job, progress) {
        return __awaiter(this, void 0, void 0, function () {
            var progressValue, progressEvent, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        progressValue = typeof progress === 'number' ? progress : 0;
                        return [4 /*yield*/, this.db.execute("UPDATE agent_jobs\n                 SET progress = ?,\n                     updated_at = NOW()\n                 WHERE bullmq_job_id = ?", [progressValue, job.id])];
                    case 1:
                        _a.sent();
                        progressEvent = {
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
                        this.io.to("project:".concat(job.data.projectId)).emit('agent_job_progress', progressEvent);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('[AgentExecution] Handle job progress error:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // Query Methods - Monitoring and Debugging
    // ========================================================================
    /**
     * Get all active jobs (waiting, active, delayed)
     *
     * @param limit - Maximum number of jobs to return (default: 50)
     * @returns Array of active jobs with full status
     */
    AgentExecutionService.prototype.getActiveJobs = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var rows, jobs, _i, rows_1, row, status_1, error_8;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.db.execute("SELECT * FROM agent_jobs\n                 WHERE status IN ('waiting', 'active', 'delayed')\n                 ORDER BY priority ASC, queued_at ASC\n                 LIMIT ?", [limit])];
                    case 1:
                        rows = (_a.sent())[0];
                        jobs = [];
                        _i = 0, rows_1 = rows;
                        _a.label = 2;
                    case 2:
                        if (!(_i < rows_1.length)) return [3 /*break*/, 5];
                        row = rows_1[_i];
                        return [4 /*yield*/, this.getJobStatus(row.bullmq_job_id)];
                    case 3:
                        status_1 = _a.sent();
                        if (status_1) {
                            jobs.push(status_1);
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, jobs];
                    case 6:
                        error_8 = _a.sent();
                        console.error('[AgentExecution] Get active jobs error:', error_8);
                        throw error_8;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all failed jobs
     *
     * @param limit - Maximum number of jobs to return (default: 50)
     * @returns Array of failed jobs with error details
     */
    AgentExecutionService.prototype.getFailedJobs = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var rows, jobs, _i, rows_2, row, status_2, error_9;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.db.execute("SELECT * FROM agent_jobs\n                 WHERE status = 'failed'\n                 ORDER BY updated_at DESC\n                 LIMIT ?", [limit])];
                    case 1:
                        rows = (_a.sent())[0];
                        jobs = [];
                        _i = 0, rows_2 = rows;
                        _a.label = 2;
                    case 2:
                        if (!(_i < rows_2.length)) return [3 /*break*/, 5];
                        row = rows_2[_i];
                        return [4 /*yield*/, this.getJobStatus(row.bullmq_job_id)];
                    case 3:
                        status_2 = _a.sent();
                        if (status_2) {
                            jobs.push(status_2);
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, jobs];
                    case 6:
                        error_9 = _a.sent();
                        console.error('[AgentExecution] Get failed jobs error:', error_9);
                        throw error_9;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all jobs for a specific agent
     *
     * @param agentId - Agent ID
     * @param statusFilter - Optional status filter
     * @param limit - Maximum number of jobs to return (default: 100)
     * @returns Array of jobs assigned to the agent
     */
    AgentExecutionService.prototype.getJobsByAgent = function (agentId_1, statusFilter_1) {
        return __awaiter(this, arguments, void 0, function (agentId, statusFilter, limit) {
            var query, params, rows, error_10;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = "SELECT * FROM agent_jobs WHERE agent_id = ?";
                        params = [agentId];
                        if (statusFilter) {
                            query += " AND status = ?";
                            params.push(statusFilter);
                        }
                        query += " ORDER BY queued_at DESC LIMIT ?";
                        params.push(limit);
                        return [4 /*yield*/, this.db.execute(query, params)];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        error_10 = _a.sent();
                        console.error('[AgentExecution] Get jobs by agent error:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all jobs for a specific task
     *
     * @param taskId - Task ID
     * @returns Array of jobs for the task (including retries)
     */
    AgentExecutionService.prototype.getJobsByTask = function (taskId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.execute("SELECT * FROM agent_jobs\n                 WHERE task_id = ?\n                 ORDER BY queued_at DESC", [taskId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        error_11 = _a.sent();
                        console.error('[AgentExecution] Get jobs by task error:', error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all jobs for a specific project
     *
     * @param projectId - Project ID
     * @param limit - Maximum number of jobs to return (default: 100)
     * @returns Array of jobs for the project
     */
    AgentExecutionService.prototype.getJobsByProject = function (projectId_1) {
        return __awaiter(this, arguments, void 0, function (projectId, limit) {
            var rows, error_12;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.execute("SELECT * FROM agent_jobs\n                 WHERE project_id = ?\n                 ORDER BY queued_at DESC\n                 LIMIT ?", [projectId, limit])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        error_12 = _a.sent();
                        console.error('[AgentExecution] Get jobs by project error:', error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get queue metrics and statistics
     *
     * @returns Queue metrics including counts, average times, success rate
     */
    AgentExecutionService.prototype.getQueueMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statusCounts, metrics, _i, statusCounts_1, row, avgTime, totalCompleted, error_13;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.db.execute("SELECT status, COUNT(*) as count\n                 FROM agent_jobs\n                 GROUP BY status")];
                    case 1:
                        statusCounts = (_b.sent())[0];
                        metrics = {
                            waiting: 0,
                            active: 0,
                            completed: 0,
                            failed: 0,
                            delayed: 0,
                            cancelled: 0,
                            avgExecutionTimeMs: 0,
                            successRate: 0,
                        };
                        for (_i = 0, statusCounts_1 = statusCounts; _i < statusCounts_1.length; _i++) {
                            row = statusCounts_1[_i];
                            metrics[row.status] = row.count;
                        }
                        return [4 /*yield*/, this.db.execute("SELECT AVG(execution_time_ms) as avg_time\n                 FROM agent_jobs\n                 WHERE status = 'completed' AND execution_time_ms IS NOT NULL")];
                    case 2:
                        avgTime = (_b.sent())[0];
                        metrics.avgExecutionTimeMs = ((_a = avgTime[0]) === null || _a === void 0 ? void 0 : _a.avg_time) || 0;
                        totalCompleted = metrics.completed + metrics.failed;
                        if (totalCompleted > 0) {
                            metrics.successRate = (metrics.completed / totalCompleted) * 100;
                        }
                        return [2 /*return*/, metrics];
                    case 3:
                        error_13 = _b.sent();
                        console.error('[AgentExecution] Get queue metrics error:', error_13);
                        throw error_13;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up old completed jobs (housekeeping)
     *
     * @param olderThanDays - Delete jobs older than this many days (default: 30)
     * @returns Number of jobs deleted
     */
    AgentExecutionService.prototype.cleanupOldJobs = function () {
        return __awaiter(this, arguments, void 0, function (olderThanDays) {
            var result, error_14;
            if (olderThanDays === void 0) { olderThanDays = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.execute("DELETE FROM agent_jobs\n                 WHERE status = 'completed'\n                 AND completed_at < DATE_SUB(NOW(), INTERVAL ? DAY)", [olderThanDays])];
                    case 1:
                        result = (_a.sent())[0];
                        console.log("[AgentExecution] Cleaned up ".concat(result.affectedRows, " old jobs"));
                        return [2 /*return*/, result.affectedRows];
                    case 2:
                        error_14 = _a.sent();
                        console.error('[AgentExecution] Cleanup old jobs error:', error_14);
                        throw error_14;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // Cleanup
    // ========================================================================
    /**
     * Close queue and Redis connections
     */
    AgentExecutionService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.queue.close()];
                    case 1:
                        _a.sent();
                        this.redisConnection.disconnect();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AgentExecutionService;
}());
exports.AgentExecutionService = AgentExecutionService;
exports.default = AgentExecutionService;
//# sourceMappingURL=agentExecutionService.js.map