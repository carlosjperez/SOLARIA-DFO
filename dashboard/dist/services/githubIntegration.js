"use strict";
/**
 * GitHub Webhook Integration
 * SOL-5: Auto-sync commits → DFO tasks
 *
 * Handles GitHub push events and auto-updates DFO tasks referenced in commits.
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
exports.handleGitHubPush = handleGitHubPush;
exports.verifyGitHubSignature = verifyGitHubSignature;
exports.handleWorkflowRunEvent = handleWorkflowRunEvent;
var crypto = require("crypto");
/**
 * Process GitHub push webhook
 * Extracts DFO task references from commit messages and updates tasks
 */
function handleGitHubPush(payload, db) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, processed, _i, _a, commit, error_1, errMsg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    errors = [];
                    processed = 0;
                    // Only process pushes to main branch
                    if (payload.ref !== 'refs/heads/main') {
                        return [2 /*return*/, {
                                status: 'skipped',
                                processed: 0,
                                errors: ["Branch ".concat(payload.ref, " ignored - only main branch is processed")],
                            }];
                    }
                    _i = 0, _a = payload.commits;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    commit = _a[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, processCommit(commit, payload, db)];
                case 3:
                    _b.sent();
                    processed++;
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    errMsg = error_1 instanceof Error ? error_1.message : String(error_1);
                    errors.push("Commit ".concat(commit.id.substring(0, 7), ": ").concat(errMsg));
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, {
                        status: processed > 0 ? 'processed' : 'no_tasks_found',
                        processed: processed,
                        errors: errors,
                    }];
            }
        });
    });
}
/**
 * Process a single commit
 * Extracts [DFO-XXX] references and updates corresponding tasks
 */
function processCommit(commit, payload, db) {
    return __awaiter(this, void 0, void 0, function () {
        var message, matches, _i, matches_1, match, taskNumber, taskCode, tasks, task, completionKeywords, completionNotes, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = commit.message;
                    matches = Array.from(message.matchAll(/\[DFO-(\d+)\]/g));
                    if (matches.length === 0) {
                        // No DFO references in this commit
                        return [2 /*return*/];
                    }
                    _i = 0, matches_1 = matches;
                    _a.label = 1;
                case 1:
                    if (!(_i < matches_1.length)) return [3 /*break*/, 11];
                    match = matches_1[_i];
                    taskNumber = parseInt(match[1], 10);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, , 10]);
                    taskCode = "DFO-".concat(taskNumber);
                    return [4 /*yield*/, db.query('SELECT * FROM tasks WHERE task_code = ? LIMIT 1', [taskCode])];
                case 3:
                    tasks = (_a.sent())[0];
                    if (tasks.length === 0) {
                        console.warn("Task ".concat(taskCode, " not found in DFO"));
                        return [3 /*break*/, 10];
                    }
                    task = tasks[0];
                    // Log commit activity
                    return [4 /*yield*/, db.query("INSERT INTO activity_logs\n        (project_id, category, action, level, metadata, created_at)\n        VALUES (?, ?, ?, ?, ?, NOW())", [
                            task.project_id,
                            'git_commit',
                            "Commit ".concat(commit.id.substring(0, 7), " references ").concat(taskCode),
                            'info',
                            JSON.stringify({
                                commit_sha: commit.id,
                                commit_message: message,
                                author: commit.author.name,
                                author_email: commit.author.email,
                                url: commit.url,
                                repository: payload.repository.full_name,
                                branch: payload.ref,
                                timestamp: commit.timestamp,
                            }),
                        ])];
                case 4:
                    // Log commit activity
                    _a.sent();
                    completionKeywords = /\b(completes?|closes?|fixes?|resolves?|finished?|done)\b.*DFO-\d+/i;
                    if (!(message.match(completionKeywords) && task.status !== 'completed')) return [3 /*break*/, 7];
                    completionNotes = "Auto-completed from commit ".concat(commit.id.substring(0, 7), ": ").concat(message);
                    // Auto-complete the task
                    return [4 /*yield*/, db.query("UPDATE tasks\n           SET status = 'completed',\n               progress = 100,\n               completion_notes = ?,\n               completed_at = NOW(),\n               updated_at = NOW()\n           WHERE id = ?", [completionNotes, task.id])];
                case 5:
                    // Auto-complete the task
                    _a.sent();
                    console.log("\u2705 Auto-completed task ".concat(taskCode, " from commit ").concat(commit.id.substring(0, 7)));
                    // Log completion activity
                    return [4 /*yield*/, db.query("INSERT INTO activity_logs\n          (project_id, category, action, level, metadata, created_at)\n          VALUES (?, ?, ?, ?, ?, NOW())", [
                            task.project_id,
                            'task_update',
                            "Task ".concat(taskCode, " auto-completed from Git commit"),
                            'info',
                            JSON.stringify({
                                commit_sha: commit.id,
                                commit_message: message,
                                author: commit.author.name,
                            }),
                        ])];
                case 6:
                    // Log completion activity
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    console.log("\uD83D\uDCDD Referenced task ".concat(taskCode, " in commit ").concat(commit.id.substring(0, 7)));
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    console.error("Error processing task DFO-".concat(taskNumber, ":"), error_2);
                    throw error_2;
                case 10:
                    _i++;
                    return [3 /*break*/, 1];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Verify GitHub webhook signature (HMAC SHA-256)
 * Ensures webhook requests are authentic
 */
function verifyGitHubSignature(payload, signature, secret) {
    var hmac = crypto.createHmac('sha256', secret);
    var digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
/**
 * Process GitHub Actions workflow_run webhook
 * Updates github_workflow_runs table and emits Socket.IO events
 */
function handleWorkflowRunEvent(payload, db, io) {
    return __awaiter(this, void 0, void 0, function () {
        var action, workflow_run, repository, runs, run, durationSeconds, startTime, endTime, error_3, errMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    action = payload.action, workflow_run = payload.workflow_run, repository = payload.repository;
                    // Only process relevant actions
                    if (!['queued', 'in_progress', 'completed'].includes(action)) {
                        return [2 /*return*/, {
                                status: 'skipped',
                                updated: false,
                                error: "Action '".concat(action, "' not handled"),
                            }];
                    }
                    return [4 /*yield*/, db.query('SELECT * FROM github_workflow_runs WHERE github_run_id = ? LIMIT 1', [workflow_run.id])];
                case 1:
                    runs = (_a.sent())[0];
                    if (runs.length === 0) {
                        return [2 /*return*/, {
                                status: 'not_found',
                                updated: false,
                                error: "Workflow run ".concat(workflow_run.id, " not found in DFO"),
                            }];
                    }
                    run = runs[0];
                    durationSeconds = null;
                    if (action === 'completed' && workflow_run.run_started_at) {
                        startTime = new Date(workflow_run.run_started_at).getTime();
                        endTime = new Date(workflow_run.updated_at).getTime();
                        durationSeconds = Math.floor((endTime - startTime) / 1000);
                    }
                    // Update workflow run status
                    return [4 /*yield*/, db.query("UPDATE github_workflow_runs\n       SET status = ?,\n           conclusion = ?,\n           started_at = ?,\n           completed_at = ?,\n           duration_seconds = ?,\n           updated_at = NOW()\n       WHERE id = ?", [
                            workflow_run.status,
                            workflow_run.conclusion || null,
                            workflow_run.run_started_at || null,
                            action === 'completed' ? workflow_run.updated_at : null,
                            durationSeconds,
                            run.id,
                        ])];
                case 2:
                    // Update workflow run status
                    _a.sent();
                    // Log activity
                    return [4 /*yield*/, db.query("INSERT INTO activity_logs\n       (project_id, category, action, level, metadata, created_at)\n       VALUES (?, ?, ?, ?, ?, NOW())", [
                            run.project_id,
                            'github_workflow',
                            "Workflow run #".concat(workflow_run.run_number, " ").concat(action),
                            action === 'completed' && workflow_run.conclusion === 'failure' ? 'error' : 'info',
                            JSON.stringify({
                                github_run_id: workflow_run.id,
                                run_number: workflow_run.run_number,
                                workflow_name: workflow_run.name,
                                repository: repository.full_name,
                                status: workflow_run.status,
                                conclusion: workflow_run.conclusion,
                                branch: workflow_run.head_branch,
                                commit_sha: workflow_run.head_sha,
                                html_url: workflow_run.html_url,
                            }),
                        ])];
                case 3:
                    // Log activity
                    _a.sent();
                    // Emit Socket.IO event if io instance provided
                    if (io) {
                        io.emit('github_workflow_update', {
                            workflow_run_id: run.id,
                            github_run_id: workflow_run.id,
                            run_number: workflow_run.run_number,
                            workflow_name: workflow_run.name,
                            status: workflow_run.status,
                            conclusion: workflow_run.conclusion,
                            action: action,
                            project_id: run.project_id,
                            task_id: run.task_id,
                            html_url: workflow_run.html_url,
                        });
                    }
                    return [2 /*return*/, {
                            status: 'processed',
                            updated: true,
                        }];
                case 4:
                    error_3 = _a.sent();
                    errMsg = error_3 instanceof Error ? error_3.message : String(error_3);
                    console.error('Error processing workflow run event:', error_3);
                    return [2 /*return*/, {
                            status: 'error',
                            updated: false,
                            error: errMsg,
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=githubIntegration.js.map