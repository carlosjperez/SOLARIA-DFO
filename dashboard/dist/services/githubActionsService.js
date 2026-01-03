"use strict";
/**
 * GitHub Actions Service
 * DFO 4.0 - Epic 3: GitHub Actions Integration
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-3002
 *
 * Service for GitHub Actions workflow automation:
 * - Trigger GitHub Actions workflows from DFO tasks
 * - Monitor workflow run status
 * - Auto-create GitHub issues from tasks
 * - Auto-create pull requests from tasks
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
exports.GitHubActionsService = void 0;
var rest_1 = require("@octokit/rest");
// ============================================================================
// GitHubActionsService Class
// ============================================================================
var GitHubActionsService = /** @class */ (function () {
    /**
     * Create a new GitHubActionsService instance
     *
     * @param config - GitHub API configuration
     * @param db - Database connection
     *
     * @example
     * const service = new GitHubActionsService(
     *   { token: process.env.GITHUB_TOKEN },
     *   dbConnection
     * );
     */
    function GitHubActionsService(config, db) {
        this.db = db;
        this.octokit = new rest_1.Octokit({
            auth: config.token,
            baseUrl: config.baseUrl || 'https://api.github.com',
            userAgent: config.userAgent || 'SOLARIA-DFO/4.0',
        });
    }
    // ========================================================================
    // Workflow Management
    // ========================================================================
    /**
     * Trigger a GitHub Actions workflow
     *
     * Creates or updates workflow record in DFO and triggers the workflow via GitHub API.
     *
     * @param options - Workflow trigger options
     * @returns Result with workflow and run IDs
     *
     * @example
     * const result = await service.triggerWorkflow({
     *   owner: 'solaria-agency',
     *   repo: 'my-project',
     *   workflowId: 'deploy.yml',
     *   ref: 'main',
     *   projectId: 99,
     *   taskId: 544
     * });
     */
    GitHubActionsService.prototype.triggerWorkflow = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, workflowId, ref, inputs, projectId, taskId, repository, existingWorkflows, dfoWorkflowId, result, response, runsResponse, latestRun, runResult, dfoRunId, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        owner = options.owner, repo = options.repo, workflowId = options.workflowId, ref = options.ref, inputs = options.inputs, projectId = options.projectId, taskId = options.taskId;
                        repository = "".concat(owner, "/").concat(repo);
                        return [4 /*yield*/, this.db.query("SELECT * FROM github_workflows\n                 WHERE repository = ? AND workflow_path LIKE ?\n                 LIMIT 1", [repository, "%".concat(workflowId, "%")])];
                    case 1:
                        existingWorkflows = (_b.sent())[0];
                        dfoWorkflowId = void 0;
                        if (!(existingWorkflows.length > 0)) return [3 /*break*/, 2];
                        dfoWorkflowId = existingWorkflows[0].id;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.db.query("INSERT INTO github_workflows\n                    (project_id, task_id, workflow_name, workflow_path, repository,\n                     trigger_type, enabled, created_at, updated_at)\n                    VALUES (?, ?, ?, ?, ?, 'workflow_dispatch', true, NOW(), NOW())", [projectId, taskId || null, workflowId, ".github/workflows/".concat(workflowId), repository])];
                    case 3:
                        result = (_b.sent())[0];
                        dfoWorkflowId = result.insertId;
                        _b.label = 4;
                    case 4: return [4 /*yield*/, this.octokit.actions.createWorkflowDispatch({
                            owner: owner,
                            repo: repo,
                            workflow_id: workflowId,
                            ref: ref,
                            inputs: inputs, // Octokit expects string values
                        })];
                    case 5:
                        response = _b.sent();
                        // GitHub API returns 204 No Content on success
                        if (response.status !== 204) {
                            throw new Error("GitHub API returned unexpected status: ".concat(response.status));
                        }
                        // Step 3: Get the most recent run for this workflow (just triggered)
                        // Note: There's a small delay before GitHub creates the run record
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                    case 6:
                        // Step 3: Get the most recent run for this workflow (just triggered)
                        // Note: There's a small delay before GitHub creates the run record
                        _b.sent(); // Wait 2 seconds
                        return [4 /*yield*/, this.octokit.actions.listWorkflowRuns({
                                owner: owner,
                                repo: repo,
                                workflow_id: workflowId,
                                per_page: 1,
                            })];
                    case 7:
                        runsResponse = _b.sent();
                        latestRun = runsResponse.data.workflow_runs[0];
                        if (!latestRun) {
                            throw new Error('No workflow run found after triggering');
                        }
                        return [4 /*yield*/, this.db.query("INSERT INTO github_workflow_runs\n                (workflow_id, project_id, task_id, github_run_id, github_run_number,\n                 workflow_name, repository, trigger_event, triggered_by, branch,\n                 commit_sha, status, run_url, started_at, created_at, updated_at)\n                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())", [
                                dfoWorkflowId,
                                projectId,
                                taskId || null,
                                latestRun.id,
                                latestRun.run_number,
                                latestRun.name,
                                repository,
                                'workflow_dispatch',
                                ((_a = latestRun.actor) === null || _a === void 0 ? void 0 : _a.login) || 'unknown',
                                ref,
                                latestRun.head_sha,
                                latestRun.status,
                                latestRun.html_url,
                                latestRun.run_started_at || null,
                            ])];
                    case 8:
                        runResult = (_b.sent())[0];
                        dfoRunId = runResult.insertId;
                        // Step 5: Update workflow statistics
                        return [4 /*yield*/, this.db.query("UPDATE github_workflows\n                 SET last_run_id = ?,\n                     last_run_status = ?,\n                     last_run_at = NOW(),\n                     total_runs = total_runs + 1,\n                     updated_at = NOW()\n                 WHERE id = ?", [dfoRunId, latestRun.status === 'completed' ? latestRun.conclusion : 'in_progress', dfoWorkflowId])];
                    case 9:
                        // Step 5: Update workflow statistics
                        _b.sent();
                        // Step 6: Log activity
                        return [4 /*yield*/, this.logActivity(projectId, 'github_workflow', "Triggered workflow: ".concat(workflowId), {
                                workflow_id: dfoWorkflowId,
                                github_run_id: latestRun.id,
                                run_number: latestRun.run_number,
                                repository: repository,
                                ref: ref,
                                task_id: taskId,
                                workflow_name: workflowId,
                                html_url: latestRun.html_url,
                            })];
                    case 10:
                        // Step 6: Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                workflowId: dfoWorkflowId,
                                runId: dfoRunId,
                                githubRunId: latestRun.id,
                            }];
                    case 11:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                workflowId: 0,
                                error: error_1 instanceof Error ? error_1.message : String(error_1),
                            }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get workflow run status from GitHub
     *
     * Fetches current status of a workflow run and updates DFO database.
     *
     * @param owner - Repository owner
     * @param repo - Repository name
     * @param runId - GitHub run ID
     * @returns Workflow run status
     *
     * @example
     * const status = await service.getRunStatus('solaria-agency', 'my-project', 12345);
     * console.log(status.conclusion); // 'success', 'failure', etc.
     */
    GitHubActionsService.prototype.getRunStatus = function (owner, repo, runId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, run, durationSeconds, startTime, endTime, existingRuns, workflowId, isSuccess, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.octokit.actions.getWorkflowRun({
                                owner: owner,
                                repo: repo,
                                run_id: runId,
                            })];
                    case 1:
                        response = _a.sent();
                        run = response.data;
                        durationSeconds = void 0;
                        if (run.run_started_at && run.updated_at) {
                            startTime = new Date(run.run_started_at).getTime();
                            endTime = new Date(run.updated_at).getTime();
                            durationSeconds = Math.floor((endTime - startTime) / 1000);
                        }
                        return [4 /*yield*/, this.db.query("SELECT * FROM github_workflow_runs\n                 WHERE github_run_id = ?\n                 LIMIT 1", [runId])];
                    case 2:
                        existingRuns = (_a.sent())[0];
                        if (!(existingRuns.length > 0)) return [3 /*break*/, 5];
                        // Update existing run record
                        return [4 /*yield*/, this.db.query("UPDATE github_workflow_runs\n                     SET status = ?,\n                         conclusion = ?,\n                         started_at = ?,\n                         completed_at = ?,\n                         duration_seconds = ?,\n                         updated_at = NOW()\n                     WHERE github_run_id = ?", [
                                run.status,
                                run.conclusion || null,
                                run.run_started_at || null,
                                run.status === 'completed' ? run.updated_at : null,
                                durationSeconds || null,
                                runId,
                            ])];
                    case 3:
                        // Update existing run record
                        _a.sent();
                        if (!(run.status === 'completed')) return [3 /*break*/, 5];
                        workflowId = existingRuns[0].workflow_id;
                        isSuccess = run.conclusion === 'success';
                        return [4 /*yield*/, this.db.query("UPDATE github_workflows\n                         SET last_run_status = ?,\n                             successful_runs = successful_runs + ?,\n                             failed_runs = failed_runs + ?,\n                             updated_at = NOW()\n                         WHERE id = ?", [
                                run.conclusion,
                                isSuccess ? 1 : 0,
                                isSuccess ? 0 : 1,
                                workflowId,
                            ])];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: 
                    // Step 4: Return status
                    return [2 /*return*/, {
                            id: run.id,
                            status: run.status,
                            conclusion: run.conclusion,
                            runNumber: run.run_number,
                            htmlUrl: run.html_url,
                            startedAt: run.run_started_at || undefined,
                            completedAt: run.status === 'completed' ? run.updated_at : undefined,
                            durationSeconds: durationSeconds,
                        }];
                    case 6:
                        error_2 = _a.sent();
                        throw new Error("Failed to get workflow run status: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // Issue Management
    // ========================================================================
    /**
     * Create a GitHub issue from a DFO task
     *
     * Creates an issue in GitHub and links it to the DFO task via github_task_links.
     *
     * @param options - Issue creation options
     * @returns Result with issue number and URL
     *
     * @example
     * const result = await service.createIssue({
     *   owner: 'solaria-agency',
     *   repo: 'my-project',
     *   title: 'Fix login bug',
     *   body: 'Description of the issue',
     *   labels: ['bug', 'priority-high'],
     *   taskId: 544,
     *   projectId: 99
     * });
     */
    GitHubActionsService.prototype.createIssue = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, title, body, labels, assignees, taskId, projectId, repository, response, issue, linkResult, taskLinkId, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        owner = options.owner, repo = options.repo, title = options.title, body = options.body, labels = options.labels, assignees = options.assignees, taskId = options.taskId, projectId = options.projectId;
                        repository = "".concat(owner, "/").concat(repo);
                        return [4 /*yield*/, this.octokit.issues.create({
                                owner: owner,
                                repo: repo,
                                title: title,
                                body: body,
                                labels: labels || [],
                                assignees: assignees || [],
                            })];
                    case 1:
                        response = _a.sent();
                        issue = response.data;
                        return [4 /*yield*/, this.db.query("INSERT INTO github_task_links\n                (task_id, project_id, resource_type, repository, github_issue_number,\n                 title, description, github_url, resource_status, sync_status,\n                 last_synced_at, auto_created, created_at, updated_at)\n                VALUES (?, ?, 'issue', ?, ?, ?, ?, ?, ?, 'synced', NOW(), true, NOW(), NOW())", [
                                taskId,
                                projectId,
                                repository,
                                issue.number,
                                issue.title,
                                issue.body || null,
                                issue.html_url,
                                issue.state, // 'open' or 'closed'
                            ])];
                    case 2:
                        linkResult = (_a.sent())[0];
                        taskLinkId = linkResult.insertId;
                        // Step 3: Log activity
                        return [4 /*yield*/, this.logActivity(projectId, 'github_issue', "Created GitHub issue #".concat(issue.number), {
                                issue_number: issue.number,
                                issue_url: issue.html_url,
                                task_id: taskId,
                                task_link_id: taskLinkId,
                                repository: repository,
                                title: issue.title,
                                labels: labels || [],
                            })];
                    case 3:
                        // Step 3: Log activity
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                issueNumber: issue.number,
                                issueUrl: issue.html_url,
                                taskLinkId: taskLinkId,
                            }];
                    case 4:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : String(error_3),
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // Pull Request Management
    // ========================================================================
    /**
     * Create a GitHub pull request from a DFO task
     *
     * Creates a PR in GitHub and links it to the DFO task via github_task_links.
     *
     * @param options - PR creation options
     * @returns Result with PR number and URL
     *
     * @example
     * const result = await service.createPR({
     *   owner: 'solaria-agency',
     *   repo: 'my-project',
     *   title: 'Feature: User authentication',
     *   body: 'Implements JWT authentication',
     *   head: 'feature/auth',
     *   base: 'main',
     *   taskId: 544,
     *   projectId: 99
     * });
     */
    GitHubActionsService.prototype.createPR = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, title, body, head, base, labels, assignees, taskId, projectId, repository, response, pr, linkResult, taskLinkId, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        owner = options.owner, repo = options.repo, title = options.title, body = options.body, head = options.head, base = options.base, labels = options.labels, assignees = options.assignees, taskId = options.taskId, projectId = options.projectId;
                        repository = "".concat(owner, "/").concat(repo);
                        return [4 /*yield*/, this.octokit.pulls.create({
                                owner: owner,
                                repo: repo,
                                title: title,
                                body: body,
                                head: head,
                                base: base,
                            })];
                    case 1:
                        response = _a.sent();
                        pr = response.data;
                        if (!(labels && labels.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.octokit.issues.addLabels({
                                owner: owner,
                                repo: repo,
                                issue_number: pr.number,
                                labels: labels,
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(assignees && assignees.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.octokit.issues.addAssignees({
                                owner: owner,
                                repo: repo,
                                issue_number: pr.number,
                                assignees: assignees,
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.db.query("INSERT INTO github_task_links\n                (task_id, project_id, resource_type, repository, github_pr_number,\n                 branch_name, title, description, github_url, resource_status,\n                 sync_status, last_synced_at, auto_created, created_at, updated_at)\n                VALUES (?, ?, 'pull_request', ?, ?, ?, ?, ?, ?, ?, 'synced', NOW(), true, NOW(), NOW())", [
                            taskId,
                            projectId,
                            repository,
                            pr.number,
                            head, // branch name
                            pr.title,
                            pr.body || null,
                            pr.html_url,
                            pr.state, // 'open' or 'closed'
                        ])];
                    case 6:
                        linkResult = (_a.sent())[0];
                        taskLinkId = linkResult.insertId;
                        // Step 5: Log activity
                        return [4 /*yield*/, this.logActivity(projectId, 'github_pr', "Created GitHub PR #".concat(pr.number), {
                                pr_number: pr.number,
                                pr_url: pr.html_url,
                                task_id: taskId,
                                task_link_id: taskLinkId,
                                repository: repository,
                                title: pr.title,
                                head: head,
                                base: base,
                                labels: labels || [],
                            })];
                    case 7:
                        // Step 5: Log activity
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                prNumber: pr.number,
                                prUrl: pr.html_url,
                                taskLinkId: taskLinkId,
                            }];
                    case 8:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_4 instanceof Error ? error_4.message : String(error_4),
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // Private Helper Methods
    // ========================================================================
    /**
     * Log activity to DFO activity_logs table
     */
    GitHubActionsService.prototype.logActivity = function (projectId, category, action, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.query("INSERT INTO activity_logs\n                (project_id, category, action, level, metadata, created_at)\n                VALUES (?, ?, ?, ?, ?, NOW())", [projectId, category, action, 'info', JSON.stringify(metadata)])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Failed to log activity:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return GitHubActionsService;
}());
exports.GitHubActionsService = GitHubActionsService;
//# sourceMappingURL=githubActionsService.js.map