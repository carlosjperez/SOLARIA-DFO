#!/usr/bin/env node
"use strict";
/**
 * SOLARIA Dashboard MCP Server
 * Model Context Protocol server for interacting with the SOLARIA C-Suite Dashboard
 *
 * This server exposes tools for:
 * - Managing projects, tasks, and agents
 * - Viewing dashboard metrics
 * - Creating and updating tasks
 * - Monitoring agent status
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// ============================================================================
// Configuration
// ============================================================================
var DASHBOARD_API = process.env.DASHBOARD_API_URL || "http://localhost:3030/api";
var AUTH_USER = process.env.DASHBOARD_USER || "carlosjperez";
// seeded password in mysql-init.sql (SHA256 hash of 'bypass')
var AUTH_PASS = process.env.DASHBOARD_PASS || "bypass";
var authToken = null;
// ============================================================================
// API Client
// ============================================================================
/**
 * Make authenticated API calls to the dashboard
 */
function apiCall(endpoint_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, options) {
        var response;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!authToken) return [3 /*break*/, 2];
                    return [4 /*yield*/, authenticate()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, fetch("".concat(DASHBOARD_API).concat(endpoint), __assign(__assign({}, options), { headers: __assign({ "Content-Type": "application/json", Authorization: "Bearer ".concat(authToken) }, options.headers) }))];
                case 3:
                    response = _a.sent();
                    if (!(response.status === 401)) return [3 /*break*/, 5];
                    // Token expired, re-authenticate
                    return [4 /*yield*/, authenticate()];
                case 4:
                    // Token expired, re-authenticate
                    _a.sent();
                    return [2 /*return*/, apiCall(endpoint, options)];
                case 5: return [2 /*return*/, response.json()];
            }
        });
    });
}
/**
 * Authenticate with the dashboard API
 */
function authenticate() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(DASHBOARD_API, "/auth/login"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: AUTH_USER, password: AUTH_PASS }),
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Authentication failed");
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    authToken = data.token;
                    return [2 /*return*/, data];
            }
        });
    });
}
// ============================================================================
// MCP Server Setup
// ============================================================================
var server = new index_js_1.Server({
    name: "solaria-dashboard",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
    },
});
// ============================================================================
// Resources Handlers
// ============================================================================
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                resources: [
                    {
                        uri: "solaria://dashboard/overview",
                        name: "Dashboard Overview",
                        description: "Executive overview with KPIs, task counts, and agent status",
                        mimeType: "application/json",
                    },
                    {
                        uri: "solaria://projects/list",
                        name: "Projects List",
                        description: "All projects in the SOLARIA system",
                        mimeType: "application/json",
                    },
                    {
                        uri: "solaria://tasks/list",
                        name: "Tasks List",
                        description: "All tasks across projects",
                        mimeType: "application/json",
                    },
                    {
                        uri: "solaria://agents/list",
                        name: "Agents List",
                        description: "All SOLARIA AI agents and their status",
                        mimeType: "application/json",
                    },
                ],
            }];
    });
}); });
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var uri, data, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                uri = request.params.uri;
                _a = uri;
                switch (_a) {
                    case "solaria://dashboard/overview": return [3 /*break*/, 1];
                    case "solaria://projects/list": return [3 /*break*/, 3];
                    case "solaria://tasks/list": return [3 /*break*/, 5];
                    case "solaria://agents/list": return [3 /*break*/, 7];
                }
                return [3 /*break*/, 9];
            case 1: return [4 /*yield*/, apiCall("/dashboard/overview")];
            case 2:
                data = _b.sent();
                return [3 /*break*/, 10];
            case 3: return [4 /*yield*/, apiCall("/projects")];
            case 4:
                data = _b.sent();
                return [3 /*break*/, 10];
            case 5: return [4 /*yield*/, apiCall("/tasks")];
            case 6:
                data = _b.sent();
                return [3 /*break*/, 10];
            case 7: return [4 /*yield*/, apiCall("/agents")];
            case 8:
                data = _b.sent();
                return [3 /*break*/, 10];
            case 9: throw new Error("Unknown resource: ".concat(uri));
            case 10: return [2 /*return*/, {
                    contents: [
                        {
                            uri: uri,
                            mimeType: "application/json",
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                }];
        }
    });
}); });
// ============================================================================
// Tools Handlers
// ============================================================================
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                tools: [
                    // Dashboard Tools
                    {
                        name: "get_dashboard_overview",
                        description: "Get the executive dashboard overview with KPIs, project metrics, agent status, and task summaries",
                        inputSchema: {
                            type: "object",
                            properties: {},
                            required: [],
                        },
                    },
                    {
                        name: "get_dashboard_alerts",
                        description: "Get all active alerts from the dashboard",
                        inputSchema: {
                            type: "object",
                            properties: {
                                severity: {
                                    type: "string",
                                    enum: ["critical", "warning", "info"],
                                    description: "Filter alerts by severity level",
                                },
                            },
                        },
                    },
                    // Project Tools
                    {
                        name: "list_projects",
                        description: "List all projects in the SOLARIA system",
                        inputSchema: {
                            type: "object",
                            properties: {},
                        },
                    },
                    {
                        name: "get_project",
                        description: "Get detailed information about a specific project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                project_id: {
                                    type: "number",
                                    description: "The project ID (default: 2 for Akademate.com)",
                                },
                            },
                        },
                    },
                    {
                        name: "update_project",
                        description: "Update project information like budget, deadline, or status",
                        inputSchema: {
                            type: "object",
                            properties: {
                                project_id: { type: "number", description: "Project ID to update" },
                                name: { type: "string", description: "Project name" },
                                description: { type: "string", description: "Project description" },
                                status: {
                                    type: "string",
                                    enum: ["planning", "development", "testing", "deployment", "completed", "on_hold", "cancelled"],
                                },
                                budget: { type: "number", description: "Project budget in dollars" },
                                deadline: { type: "string", description: "Project deadline (YYYY-MM-DD)" },
                            },
                            required: ["project_id"],
                        },
                    },
                    // Task Tools
                    {
                        name: "list_tasks",
                        description: "List all tasks, optionally filtered by status or priority",
                        inputSchema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string",
                                    enum: ["pending", "in_progress", "completed", "blocked"],
                                    description: "Filter by task status",
                                },
                                priority: {
                                    type: "string",
                                    enum: ["critical", "high", "medium", "low"],
                                    description: "Filter by priority",
                                },
                                agent_id: {
                                    type: "number",
                                    description: "Filter by assigned agent ID",
                                },
                            },
                        },
                    },
                    {
                        name: "get_task",
                        description: "Get detailed information about a specific task",
                        inputSchema: {
                            type: "object",
                            properties: {
                                task_id: { type: "number", description: "Task ID" },
                            },
                            required: ["task_id"],
                        },
                    },
                    {
                        name: "create_task",
                        description: "Create a new task in the project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                title: { type: "string", description: "Task title" },
                                description: { type: "string", description: "Task description" },
                                priority: {
                                    type: "string",
                                    enum: ["critical", "high", "medium", "low"],
                                    description: "Task priority",
                                },
                                status: {
                                    type: "string",
                                    enum: ["pending", "in_progress"],
                                    description: "Initial task status",
                                },
                                estimated_hours: { type: "number", description: "Estimated hours" },
                                assigned_agent_id: { type: "number", description: "ID of agent to assign" },
                                project_id: { type: "number", description: "Project ID (default: 2)" },
                            },
                            required: ["title"],
                        },
                    },
                    {
                        name: "update_task",
                        description: "Update an existing task (status, priority, progress, or assignment)",
                        inputSchema: {
                            type: "object",
                            properties: {
                                task_id: { type: "number", description: "Task ID to update" },
                                title: { type: "string" },
                                description: { type: "string" },
                                status: {
                                    type: "string",
                                    enum: ["pending", "in_progress", "completed", "blocked"],
                                },
                                priority: {
                                    type: "string",
                                    enum: ["critical", "high", "medium", "low"],
                                },
                                progress: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                    description: "Progress percentage (0-100)",
                                },
                                assigned_agent_id: { type: "number", description: "Reassign to agent" },
                            },
                            required: ["task_id"],
                        },
                    },
                    {
                        name: "complete_task",
                        description: "Mark a task as completed with 100% progress",
                        inputSchema: {
                            type: "object",
                            properties: {
                                task_id: { type: "number", description: "Task ID to complete" },
                                completion_notes: { type: "string", description: "Notes about what was done" },
                            },
                            required: ["task_id"],
                        },
                    },
                    // Agent Tools
                    {
                        name: "list_agents",
                        description: "List all SOLARIA AI agents and their current status",
                        inputSchema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string",
                                    enum: ["active", "busy", "inactive"],
                                    description: "Filter by agent status",
                                },
                                role: {
                                    type: "string",
                                    description: "Filter by role (e.g., developer, architect, tester)",
                                },
                            },
                        },
                    },
                    {
                        name: "get_agent",
                        description: "Get detailed information about a specific agent including their assigned tasks",
                        inputSchema: {
                            type: "object",
                            properties: {
                                agent_id: { type: "number", description: "Agent ID" },
                            },
                            required: ["agent_id"],
                        },
                    },
                    {
                        name: "get_agent_tasks",
                        description: "Get all tasks assigned to a specific agent",
                        inputSchema: {
                            type: "object",
                            properties: {
                                agent_id: { type: "number", description: "Agent ID" },
                            },
                            required: ["agent_id"],
                        },
                    },
                    {
                        name: "update_agent_status",
                        description: "Update an agent's status",
                        inputSchema: {
                            type: "object",
                            properties: {
                                agent_id: { type: "number", description: "Agent ID" },
                                status: {
                                    type: "string",
                                    enum: ["active", "busy", "inactive", "error", "maintenance"],
                                },
                            },
                            required: ["agent_id", "status"],
                        },
                    },
                    // Logs Tools
                    {
                        name: "get_activity_logs",
                        description: "Get recent activity logs from the system",
                        inputSchema: {
                            type: "object",
                            properties: {
                                limit: { type: "number", description: "Number of logs to retrieve (default: 50)" },
                                level: {
                                    type: "string",
                                    enum: ["info", "warning", "error", "critical"],
                                    description: "Filter by log level",
                                },
                            },
                        },
                    },
                    {
                        name: "log_activity",
                        description: "Log an activity to the system",
                        inputSchema: {
                            type: "object",
                            properties: {
                                action: { type: "string", description: "Action description" },
                                level: {
                                    type: "string",
                                    enum: ["info", "warning", "error"],
                                    default: "info",
                                },
                                category: { type: "string", description: "Activity category" },
                                agent_id: { type: "number", description: "Agent performing the action" },
                            },
                            required: ["action"],
                        },
                    },
                    // Docs Tools
                    {
                        name: "list_docs",
                        description: "List all project documentation files",
                        inputSchema: {
                            type: "object",
                            properties: {},
                        },
                    },
                    // Epic Tools
                    {
                        name: "list_epics",
                        description: "List all epics for a project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                project_id: { type: "number", description: "Project ID" },
                                status: {
                                    type: "string",
                                    enum: ["open", "in_progress", "completed", "cancelled"],
                                    description: "Filter by epic status",
                                },
                            },
                            required: ["project_id"],
                        },
                    },
                    {
                        name: "create_epic",
                        description: "Create a new epic for a project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                project_id: { type: "number", description: "Project ID" },
                                name: { type: "string", description: "Epic name (min 3 chars)" },
                                description: { type: "string", description: "Epic description" },
                                color: { type: "string", description: "Color hex (e.g., #6366f1)" },
                                status: {
                                    type: "string",
                                    enum: ["open", "in_progress", "completed", "cancelled"],
                                },
                                start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
                                target_date: { type: "string", description: "Target date (YYYY-MM-DD)" },
                            },
                            required: ["project_id", "name"],
                        },
                    },
                    {
                        name: "update_epic",
                        description: "Update an existing epic",
                        inputSchema: {
                            type: "object",
                            properties: {
                                epic_id: { type: "number", description: "Epic ID to update" },
                                name: { type: "string", description: "Epic name" },
                                description: { type: "string", description: "Epic description" },
                                color: { type: "string", description: "Color hex" },
                                status: {
                                    type: "string",
                                    enum: ["open", "in_progress", "completed", "cancelled"],
                                },
                                start_date: { type: "string", description: "Start date" },
                                target_date: { type: "string", description: "Target date" },
                            },
                            required: ["epic_id"],
                        },
                    },
                    {
                        name: "delete_epic",
                        description: "Delete an epic (tasks will have epic_id set to NULL)",
                        inputSchema: {
                            type: "object",
                            properties: {
                                epic_id: { type: "number", description: "Epic ID to delete" },
                            },
                            required: ["epic_id"],
                        },
                    },
                    // Sprint Tools
                    {
                        name: "list_sprints",
                        description: "List all sprints for a project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                project_id: { type: "number", description: "Project ID" },
                                status: {
                                    type: "string",
                                    enum: ["planned", "active", "completed", "cancelled"],
                                    description: "Filter by sprint status",
                                },
                            },
                            required: ["project_id"],
                        },
                    },
                    {
                        name: "create_sprint",
                        description: "Create a new sprint for a project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                project_id: { type: "number", description: "Project ID" },
                                name: { type: "string", description: "Sprint name (min 3 chars)" },
                                goal: { type: "string", description: "Sprint goal" },
                                status: {
                                    type: "string",
                                    enum: ["planned", "active", "completed", "cancelled"],
                                },
                                start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
                                end_date: { type: "string", description: "End date (YYYY-MM-DD)" },
                                velocity: { type: "number", description: "Planned velocity (story points)" },
                                capacity: { type: "number", description: "Team capacity (hours)" },
                            },
                            required: ["project_id", "name"],
                        },
                    },
                    {
                        name: "update_sprint",
                        description: "Update an existing sprint",
                        inputSchema: {
                            type: "object",
                            properties: {
                                sprint_id: { type: "number", description: "Sprint ID to update" },
                                name: { type: "string", description: "Sprint name" },
                                goal: { type: "string", description: "Sprint goal" },
                                status: {
                                    type: "string",
                                    enum: ["planned", "active", "completed", "cancelled"],
                                },
                                start_date: { type: "string", description: "Start date" },
                                end_date: { type: "string", description: "End date" },
                                velocity: { type: "number", description: "Actual velocity" },
                            },
                            required: ["sprint_id"],
                        },
                    },
                    {
                        name: "delete_sprint",
                        description: "Delete a sprint (tasks will have sprint_id set to NULL)",
                        inputSchema: {
                            type: "object",
                            properties: {
                                sprint_id: { type: "number", description: "Sprint ID to delete" },
                            },
                            required: ["sprint_id"],
                        },
                    },
                ],
            }];
    });
}); });
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, args, typedArgs, result, _b, endpoint, params, agents, tasks, limit, level, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = request.params, name = _a.name, args = _a.arguments;
                typedArgs = args;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 38, , 39]);
                result = void 0;
                _b = name;
                switch (_b) {
                    case "get_dashboard_overview": return [3 /*break*/, 2];
                    case "get_dashboard_alerts": return [3 /*break*/, 4];
                    case "list_projects": return [3 /*break*/, 6];
                    case "get_project": return [3 /*break*/, 8];
                    case "update_project": return [3 /*break*/, 10];
                    case "list_tasks": return [3 /*break*/, 12];
                    case "get_task": return [3 /*break*/, 14];
                    case "create_task": return [3 /*break*/, 16];
                    case "update_task": return [3 /*break*/, 18];
                    case "complete_task": return [3 /*break*/, 20];
                    case "list_agents": return [3 /*break*/, 22];
                    case "get_agent": return [3 /*break*/, 24];
                    case "get_agent_tasks": return [3 /*break*/, 26];
                    case "update_agent_status": return [3 /*break*/, 28];
                    case "get_activity_logs": return [3 /*break*/, 30];
                    case "log_activity": return [3 /*break*/, 32];
                    case "list_docs": return [3 /*break*/, 34];
                }
                return [3 /*break*/, 36];
            case 2: return [4 /*yield*/, apiCall("/dashboard/overview")];
            case 3:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 4: return [4 /*yield*/, apiCall("/dashboard/alerts".concat((typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.severity) ? "?severity=".concat(typedArgs.severity) : ""))];
            case 5:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 6: return [4 /*yield*/, apiCall("/projects")];
            case 7:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 8: return [4 /*yield*/, apiCall("/projects/".concat((typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.project_id) || 2))];
            case 9:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 10: return [4 /*yield*/, apiCall("/projects/".concat(typedArgs.project_id), {
                    method: "PUT",
                    body: JSON.stringify(typedArgs),
                })];
            case 11:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 12:
                endpoint = "/tasks";
                params = [];
                if (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.status)
                    params.push("status=".concat(typedArgs.status));
                if (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.priority)
                    params.push("priority=".concat(typedArgs.priority));
                if (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.agent_id)
                    params.push("agent_id=".concat(typedArgs.agent_id));
                if (params.length)
                    endpoint += "?".concat(params.join("&"));
                return [4 /*yield*/, apiCall(endpoint)];
            case 13:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 14: return [4 /*yield*/, apiCall("/tasks/".concat(typedArgs.task_id))];
            case 15:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 16: return [4 /*yield*/, apiCall("/tasks", {
                    method: "POST",
                    body: JSON.stringify(__assign(__assign({}, typedArgs), { project_id: (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.project_id) || 2, status: (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.status) || "pending", priority: (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.priority) || "medium" })),
                })];
            case 17:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 18: return [4 /*yield*/, apiCall("/tasks/".concat(typedArgs.task_id), {
                    method: "PUT",
                    body: JSON.stringify(typedArgs),
                })];
            case 19:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 20: return [4 /*yield*/, apiCall("/tasks/".concat(typedArgs.task_id), {
                    method: "PUT",
                    body: JSON.stringify({
                        status: "completed",
                        progress: 100,
                        completion_notes: typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.completion_notes,
                    }),
                })];
            case 21:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 22: return [4 /*yield*/, apiCall("/agents")];
            case 23:
                agents = _c.sent();
                if (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.status) {
                    agents = agents.filter(function (a) { return a.status === typedArgs.status; });
                }
                if (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.role) {
                    agents = agents.filter(function (a) { return a.role === typedArgs.role; });
                }
                result = agents;
                return [3 /*break*/, 37];
            case 24: return [4 /*yield*/, apiCall("/agents/".concat(typedArgs.agent_id))];
            case 25:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 26: return [4 /*yield*/, apiCall("/tasks")];
            case 27:
                tasks = _c.sent();
                result = tasks.filter(function (t) { return t.assigned_agent_id === typedArgs.agent_id; });
                return [3 /*break*/, 37];
            case 28: return [4 /*yield*/, apiCall("/agents/".concat(typedArgs.agent_id, "/status"), {
                    method: "PUT",
                    body: JSON.stringify({ status: typedArgs.status }),
                })];
            case 29:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 30:
                limit = (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.limit) || 50;
                level = (typedArgs === null || typedArgs === void 0 ? void 0 : typedArgs.level) ? "&level=".concat(typedArgs.level) : "";
                return [4 /*yield*/, apiCall("/logs?limit=".concat(limit).concat(level))];
            case 31:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 32: return [4 /*yield*/, apiCall("/logs", {
                    method: "POST",
                    body: JSON.stringify(typedArgs),
                })];
            case 33:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 34: return [4 /*yield*/, apiCall("/docs/list")];
            case 35:
                result = _c.sent();
                return [3 /*break*/, 37];
            case 36: throw new Error("Unknown tool: ".concat(name));
            case 37: return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                }];
            case 38:
                error_1 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error: ".concat(error_1 instanceof Error ? error_1.message : "Unknown error"),
                            },
                        ],
                        isError: true,
                    }];
            case 39: return [2 /*return*/];
        }
    });
}); });
// ============================================================================
// Start Server
// ============================================================================
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("SOLARIA Dashboard MCP Server started");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Server error:", error);
    process.exit(1);
});
