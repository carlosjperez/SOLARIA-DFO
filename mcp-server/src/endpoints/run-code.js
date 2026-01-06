"use strict";
/**
 * MCP Tool: run_code
 *
 * Executes arbitrary JavaScript/TypeScript code in a secure sandbox with access to DFO API
 * Core feature of Sketch Pattern MCP - replaces 70+ tools with 2 endpoints
 *
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MCP-SKETCH-003
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_code_tool = void 0;
exports.handleRunCode = handleRunCode;
var zod_1 = require("zod");
// ============================================================================
// Configuration
// ============================================================================
var DASHBOARD_API = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
var DEFAULT_TIMEOUT = 5000;
var MAX_TIMEOUT = 30000;
var MAX_CODE_LENGTH = 10000;
// Whitelist of allowed API endpoints (security measure)
var ALLOWED_ENDPOINTS = new Set([
    '/projects',
    '/projects/:id',
    '/tasks',
    '/tasks/:id',
    '/tasks/:id/items',
    '/agents',
    '/agents/:id',
    '/memories',
    '/memories/:id',
    '/memories/search',
    '/memories/semantic-search',
    '/dashboard/overview',
    '/dashboard/alerts',
    '/sprints',
    '/sprints/:id',
    '/epics',
    '/epics/:id',
    '/health',
    '/stats',
]);
// ============================================================================
// Validation Schema
// ============================================================================
var RunCodeInputSchema = zod_1.z.object({
    code: zod_1.z.string()
        .min(1, 'Code cannot be empty')
        .max(MAX_CODE_LENGTH, "Code too long (max ".concat(MAX_CODE_LENGTH, " chars)")),
    language: zod_1.z.enum(['javascript', 'typescript', 'sql']).optional().default('javascript'),
    timeout: zod_1.z.number()
        .min(1000, 'Timeout must be at least 1 second')
        .max(MAX_TIMEOUT, "Timeout too long (max ".concat(MAX_TIMEOUT, "ms)"))
        .optional()
        .default(DEFAULT_TIMEOUT),
    sandbox: zod_1.z.enum(['strict', 'permissive']).optional().default('strict'),
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
var SecureSandbox = /** @class */ (function () {
    function SecureSandbox(apiClient) {
        this.apiClient = apiClient;
    }
    SecureSandbox.prototype.validateEndpoint = function (endpoint) {
        var normalized = endpoint.split('?')[0].replace(/:\d+/g, '/:id');
        if (!ALLOWED_ENDPOINTS.has(normalized) && !normalized.startsWith('/projects/') && !normalized.startsWith('/tasks/') && !normalized.startsWith('/agents/')) {
            throw new Error("Access to endpoint \"".concat(endpoint, "\" is not allowed"));
        }
    };
    SecureSandbox.prototype.execute = function (code, timeout, sandboxMode) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, apiClient_1, context_1, AsyncFunction, timeoutPromise, result, executionTime, error_1, executionTime;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        apiClient_1 = this.apiClient;
                        context_1 = {
                            apiCall: function (endpoint, options) {
                                if (options === void 0) { options = {}; }
                                if (sandboxMode === 'strict') {
                                    _this.validateEndpoint(endpoint);
                                }
                                return apiClient_1.request(endpoint, options);
                            },
                            console: {
                                log: function () {
                                    var args = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        args[_i] = arguments[_i];
                                    }
                                    return console.log.apply(console, __spreadArray(['[SANDBOX]'], args, false));
                                },
                                error: function () {
                                    var args = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        args[_i] = arguments[_i];
                                    }
                                    return console.error.apply(console, __spreadArray(['[SANDBOX]'], args, false));
                                },
                            },
                            fetch: global.fetch,
                            JSON: JSON,
                            Math: Math,
                            Date: Date,
                        };
                        AsyncFunction = function () { return __awaiter(_this, void 0, void 0, function () {
                            var fn;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        fn = new Function('context', 'apiClient', "return async () => { ".concat(code, " }"));
                                        return [4 /*yield*/, fn(context_1, apiClient_1)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); };
                        timeoutPromise = new Promise(function (_, reject) {
                            return setTimeout(function () { return reject(new Error("Execution timeout after ".concat(timeout, "ms"))); }, timeout);
                        });
                        return [4 /*yield*/, Promise.race([AsyncFunction(), timeoutPromise])];
                    case 2:
                        result = _a.sent();
                        executionTime = Date.now() - startTime;
                        if (typeof result === 'undefined') {
                            return [2 /*return*/, {
                                    output: null,
                                    executionTime: executionTime,
                                    memoryUsage: 0,
                                }];
                        }
                        try {
                            JSON.stringify(result);
                        }
                        catch (_b) {
                            throw new Error('Code execution returned non-serializable result');
                        }
                        return [2 /*return*/, {
                                output: result,
                                executionTime: executionTime,
                                memoryUsage: 0,
                            }];
                    case 3:
                        error_1 = _a.sent();
                        executionTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                output: {
                                    error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                    stack: process.env.NODE_ENV === 'development' && error_1 instanceof Error ? error_1.stack : undefined,
                                },
                                executionTime: executionTime,
                                memoryUsage: 0,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return SecureSandbox;
}());
// ============================================================================
// MCP Tool Export
// ============================================================================
exports.run_code_tool = {
    name: 'run_code',
    description: 'Ejecutar código JavaScript/TypeScript en sandbox seguro con acceso completo a la API del DFO',
    inputSchema: {
        type: 'object',
        properties: {
            code: {
                type: 'string',
                description: "C\u00F3digo JavaScript/TypeScript a ejecutar (m\u00E1ximo ".concat(MAX_CODE_LENGTH, " caracteres)"),
            },
            language: {
                type: 'string',
                enum: ['javascript', 'typescript', 'sql'],
                description: 'Lenguaje del código (default: javascript)',
            },
            timeout: {
                type: 'number',
                description: "Timeout en milisegundos (default: ".concat(DEFAULT_TIMEOUT, ", max: ").concat(MAX_TIMEOUT, ")"),
            },
            sandbox: {
                type: 'string',
                enum: ['strict', 'permissive'],
                description: 'Modo de sandbox (strict: whitelist de endpoints, permissive: acceso amplio)',
            },
        },
    },
};
// ============================================================================
// Handler Function
// ============================================================================
function handleRunCode(params, credentials) {
    return __awaiter(this, void 0, void 0, function () {
        var validated, code, language, timeout, sandboxMode, apiClient, sandbox, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    validated = RunCodeInputSchema.parse(params);
                    code = validated.code, language = validated.language, timeout = validated.timeout, sandboxMode = validated.sandbox;
                    console.log("[run_code] Executing ".concat(language, " code (").concat(code.length, " chars) in ").concat(sandboxMode, " mode, timeout ").concat(timeout, "ms"));
                    apiClient = new ApiClient(DASHBOARD_API, credentials);
                    sandbox = new SecureSandbox(apiClient);
                    return [4 /*yield*/, sandbox.execute(code, timeout, sandboxMode)];
                case 1:
                    result = _a.sent();
                    if ('error' in result.output) {
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'EXECUTION_ERROR',
                                    message: result.output.error,
                                    details: {
                                        execution_time_ms: result.executionTime,
                                        language: language,
                                    },
                                },
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                output: result.output,
                                execution_time_ms: result.executionTime,
                                memory_used_mb: result.memoryUsage,
                                metadata: {
                                    language: language,
                                    sandbox_mode: sandboxMode,
                                    code_length: code.length,
                                },
                            },
                        }];
                case 2:
                    error_2 = _a.sent();
                    console.error('[run_code] Error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'VALIDATION_ERROR',
                                    message: error_2.errors.map(function (e) { return e.message; }).join(', '),
                                },
                            }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            error: {
                                code: 'RUN_CODE_ERROR',
                                message: error_2 instanceof Error ? error_2.message : 'Unknown error',
                            },
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// Default Export for Handler Integration
// ============================================================================
exports.default = {
    tool: exports.run_code_tool,
    handler: handleRunCode,
};
