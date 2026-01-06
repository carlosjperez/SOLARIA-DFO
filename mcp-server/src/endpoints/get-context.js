"use strict";
/**
 * MCP Tool: get_context
 *
 * Unified endpoint to get system state in a single call
 * Replaces multiple individual tools (get_dashboard_overview, get_stats, get_health, etc.)
 *
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MCP-SKETCH-002
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
exports.get_context_tool = void 0;
exports.handleGetContext = handleGetContext;
var zod_1 = require("zod");
// ============================================================================
// Configuration
// ============================================================================
var DASHBOARD_API = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
// ============================================================================
// Validation Schema
// ============================================================================
var GetContextInputSchema = zod_1.z.object({
    project_id: zod_1.z.number().optional(),
    project_name: zod_1.z.string().optional(),
    include: zod_1.z.object({
        projects: zod_1.z.boolean().optional().default(false),
        tasks: zod_1.z.boolean().optional().default(false),
        agents: zod_1.z.boolean().optional().default(false),
        stats: zod_1.z.boolean().optional().default(false),
        health: zod_1.z.boolean().optional().default(false),
        alerts: zod_1.z.boolean().optional().default(false),
        sprints: zod_1.z.boolean().optional().default(false),
        epics: zod_1.z.boolean().optional().default(false),
    }).optional().default({}),
});
// ============================================================================
// API Client Helper
// ============================================================================
var ApiClient = /** @class */ (function () {
    function ApiClient(url, credentials) {
        this.url = url;
        this.credentials = credentials;
        this.token = null;
    }
    ApiClient.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.url, "/auth/login"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: this.credentials.user,
                                password: this.credentials.password,
                            }),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Authentication failed');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        this.token = data.token;
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiClient.prototype.request = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options) {
            var response;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.token) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.authenticate()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, fetch("".concat(this.url).concat(endpoint), __assign(__assign({}, options), { headers: __assign({ 'Content-Type': 'application/json', Authorization: "Bearer ".concat(this.token) }, options.headers) }))];
                    case 3:
                        response = _a.sent();
                        if (!(response.status === 401)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.authenticate()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.request(endpoint, options)];
                    case 5: return [2 /*return*/, response.json()];
                }
            });
        });
    };
    return ApiClient;
}());
// ============================================================================
// Helper Functions
// ============================================================================
function getProjects(apiClient, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (projectId) {
                return [2 /*return*/, apiClient.request("/projects/".concat(projectId))];
            }
            return [2 /*return*/, apiClient.request('/projects')];
        });
    });
}
function getTasks(apiClient, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint;
        return __generator(this, function (_a) {
            endpoint = projectId ? "/tasks?project_id=".concat(projectId) : '/tasks';
            return [2 /*return*/, apiClient.request(endpoint)];
        });
    });
}
function getAgents(apiClient) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiClient.request('/agents')];
        });
    });
}
function getStats(apiClient, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint;
        return __generator(this, function (_a) {
            endpoint = projectId ? "/memories/stats?project_id=".concat(projectId) : '/memories/stats';
            return [2 /*return*/, apiClient.request(endpoint)];
        });
    });
}
function getHealth(apiClient) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiClient.request('/health')];
        });
    });
}
function getDashboardOverview(apiClient, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, project, tasks;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!projectId) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all([
                            apiClient.request("/projects/".concat(projectId)),
                            apiClient.request("/tasks?project_id=".concat(projectId)),
                        ])];
                case 1:
                    _a = _b.sent(), project = _a[0], tasks = _a[1];
                    return [2 /*return*/, {
                            project: project,
                            metrics: {
                                total_tasks: Array.isArray(tasks) ? tasks.length : 0,
                                completed: Array.isArray(tasks) ? tasks.filter(function (t) { return t.status === 'completed'; }).length : 0,
                                in_progress: Array.isArray(tasks) ? tasks.filter(function (t) { return t.status === 'in_progress'; }).length : 0,
                                pending: Array.isArray(tasks) ? tasks.filter(function (t) { return t.status === 'pending'; }).length : 0,
                            },
                            isolation_mode: true,
                            project_id: projectId,
                        }];
                case 2: return [2 /*return*/, apiClient.request('/dashboard/overview')];
            }
        });
    });
}
function getDashboardAlerts(apiClient, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint;
        return __generator(this, function (_a) {
            endpoint = projectId ? "/dashboard/alerts?project_id=".concat(projectId) : '/dashboard/alerts';
            return [2 /*return*/, apiClient.request(endpoint)];
        });
    });
}
function getSprints(apiClient, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiClient.request("/projects/".concat(projectId, "/sprints"))];
        });
    });
}
function getEpics(apiClient, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, apiClient.request("/projects/".concat(projectId, "/epics"))];
        });
    });
}
// ============================================================================
// MCP Tool Export
// ============================================================================
exports.get_context_tool = {
    name: 'get_context',
    description: 'Obtener estado unificado del sistema DFO (projects, tasks, agents, stats, health) en una sola llamada',
    inputSchema: {
        type: 'object',
        properties: {
            project_id: {
                type: 'number',
                description: 'ID del proyecto para filtrar contexto (opcional)',
            },
            project_name: {
                type: 'string',
                description: 'Nombre del proyecto para filtrar contexto (opcional, busca coincidencia exacta o parcial)',
            },
            include: {
                type: 'object',
                description: 'Qué componentes incluir en el contexto (default: todos)',
                properties: {
                    projects: {
                        type: 'boolean',
                        description: 'Incluir lista de proyectos',
                    },
                    tasks: {
                        type: 'boolean',
                        description: 'Incluir lista de tareas',
                    },
                    agents: {
                        type: 'boolean',
                        description: 'Incluir lista de agentes',
                    },
                    stats: {
                        type: 'boolean',
                        description: 'Incluir estadísticas de memoria',
                    },
                    health: {
                        type: 'boolean',
                        description: 'Incluir health check del sistema',
                    },
                    alerts: {
                        type: 'boolean',
                        description: 'Incluir alertas del dashboard',
                    },
                    sprints: {
                        type: 'boolean',
                        description: 'Incluir sprints del proyecto (requiere project_id)',
                    },
                    epics: {
                        type: 'boolean',
                        description: 'Incluir epics del proyecto (requiere project_id)',
                    },
                },
            },
        },
    },
};
// ============================================================================
// Handler Function
// ============================================================================
function handleGetContext(params, apiClient) {
    return __awaiter(this, void 0, void 0, function () {
        var validated, project_id, project_name_1, include, resolvedProjectId, projects, project, results_1, fetchTasks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    validated = GetContextInputSchema.parse(params);
                    project_id = validated.project_id, project_name_1 = validated.project_name, include = validated.include;
                    console.log("[get_context] Fetching context for project: ".concat(project_name_1 || project_id || 'all'));
                    resolvedProjectId = project_id;
                    if (!(project_name_1 && !project_id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, apiClient.request('/projects')];
                case 1:
                    projects = _a.sent();
                    project = projects.find(function (p) {
                        return p.name.toLowerCase() === project_name_1.toLowerCase() ||
                            p.name.toLowerCase().includes(project_name_1.toLowerCase());
                    });
                    if (project) {
                        resolvedProjectId = project.id;
                        console.log("[get_context] Resolved project \"".concat(project_name_1, "\" to ID: ").concat(resolvedProjectId));
                    }
                    _a.label = 2;
                case 2:
                    results_1 = {};
                    fetchTasks = [];
                    // Projects
                    if (include.projects !== false) {
                        fetchTasks.push(getProjects(apiClient, resolvedProjectId).then(function (data) {
                            results_1.projects = data;
                        }));
                    }
                    // Tasks
                    if (include.tasks !== false) {
                        fetchTasks.push(getTasks(apiClient, resolvedProjectId).then(function (data) {
                            results_1.tasks = data;
                        }));
                    }
                    // Agents
                    if (include.agents) {
                        fetchTasks.push(getAgents(apiClient).then(function (data) {
                            results_1.agents = data;
                        }));
                    }
                    // Stats
                    if (include.stats) {
                        fetchTasks.push(getStats(apiClient, resolvedProjectId).then(function (data) {
                            results_1.stats = data;
                        }));
                    }
                    // Health
                    if (include.health !== false) {
                        fetchTasks.push(getHealth(apiClient).then(function (data) {
                            results_1.health = data;
                        }));
                    }
                    // Alerts
                    if (include.alerts) {
                        fetchTasks.push(getDashboardAlerts(apiClient, resolvedProjectId).then(function (data) {
                            results_1.alerts = data;
                        }));
                    }
                    // Dashboard overview
                    if (include.projects !== false && !resolvedProjectId) {
                        fetchTasks.push(getDashboardOverview(apiClient, resolvedProjectId).then(function (data) {
                            results_1.dashboard = data;
                        }));
                    }
                    // Sprints (requires project_id)
                    if (include.sprints && resolvedProjectId) {
                        fetchTasks.push(getSprints(apiClient, resolvedProjectId).then(function (data) {
                            results_1.sprints = data;
                        }));
                    }
                    // Epics (requires project_id)
                    if (include.epics && resolvedProjectId) {
                        fetchTasks.push(getEpics(apiClient, resolvedProjectId).then(function (data) {
                            results_1.epics = data;
                        }));
                    }
                    // Execute all fetches in parallel
                    return [4 /*yield*/, Promise.all(fetchTasks)];
                case 3:
                    // Execute all fetches in parallel
                    _a.sent();
                    // Build response
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                context: results_1,
                                project_id: resolvedProjectId,
                                timestamp: new Date().toISOString(),
                                message: resolvedProjectId
                                    ? "Context retrieved for project ID: ".concat(resolvedProjectId)
                                    : 'Global context retrieved',
                            },
                        }];
                case 4:
                    error_1 = _a.sent();
                    console.error('[get_context] Error:', error_1);
                    return [2 /*return*/, {
                            success: false,
                            error: {
                                code: 'GET_CONTEXT_ERROR',
                                message: error_1 instanceof Error ? error_1.message : 'Unknown error',
                            },
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// Default Export for Handler Integration
// ============================================================================
exports.default = {
    tool: exports.get_context_tool,
    handler: handleGetContext,
};
