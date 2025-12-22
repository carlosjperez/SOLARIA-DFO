#!/usr/bin/env node
"use strict";
/**
 * SOLARIA Dashboard MCP HTTP Server
 * HTTP transport for remote MCP connections
 *
 * Endpoints:
 *   POST /mcp           - Handle MCP requests (JSON-RPC)
 *   GET  /mcp           - SSE stream for server notifications
 *   POST /mcp/session   - Initialize session with project context
 *   GET  /health        - Health check
 *   GET  /              - Server info
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var crypto_1 = require("crypto");
var handlers_js_1 = require("./handlers.js");
// ============================================================================
// Configuration
// ============================================================================
var PORT = parseInt(process.env.MCP_PORT || "3031", 10);
var DASHBOARD_API = process.env.DASHBOARD_API_URL || "http://localhost:3030/api";
var JWT_SECRET = process.env.JWT_SECRET || "solaria_jwt_secret_2024";
// Session storage (in production, use Redis)
var sessions = new Map();
var SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
// Clean up expired sessions every hour
setInterval(function () {
    var now = Date.now();
    var cleaned = 0;
    for (var _i = 0, _a = sessions.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], sessionId = _b[0], session = _b[1];
        var lastActivity = session.last_activity instanceof Date
            ? session.last_activity.getTime()
            : new Date(session.last_activity).getTime();
        if (now - lastActivity > SESSION_TTL_MS) {
            sessions.delete(sessionId);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log("[SESSION] Cleaned ".concat(cleaned, " expired sessions"));
    }
}, 60 * 60 * 1000);
// ============================================================================
// Express App Setup
// ============================================================================
var app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// CORS configuration - restrict to known origins in production
var ALLOWED_ORIGINS = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["https://dfo.solaria.agency", "https://solaria.agency", "http://localhost:3030", "http://localhost:5173"];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl, Postman, or server-to-server)
        if (!origin)
            return callback(null, true);
        // Allow configured origins
        if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes("*")) {
            return callback(null, true);
        }
        // Log blocked origin for debugging
        console.log("[CORS] Blocked request from origin: ".concat(origin));
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Project-Id", "Mcp-Session-Id"],
}));
app.use(express_1.default.json({ limit: "10mb" }));
// Request logging
app.use(function (req, _res, next) {
    console.log("[".concat(new Date().toISOString(), "] ").concat(req.method, " ").concat(req.path));
    next();
});
// ============================================================================
// Authentication
// ============================================================================
/**
 * Authenticate request using API key or JWT
 */
function authenticateRequest(req) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, apiClient_1, error_1, apiClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authHeader = req.headers.authorization;
                    if (!authHeader) {
                        throw new Error("Authorization header required");
                    }
                    if (!authHeader.startsWith("Bearer ")) return [3 /*break*/, 6];
                    token = authHeader.slice(7);
                    if (!token.startsWith("sk-solaria-")) return [3 /*break*/, 4];
                    apiClient_1 = (0, handlers_js_1.createApiClient)(DASHBOARD_API, {
                        user: process.env.DASHBOARD_USER || "carlosjperez",
                        password: process.env.DASHBOARD_PASS || "bypass",
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // For now, validate by attempting to get projects
                    // In production, validate against api_keys table
                    return [4 /*yield*/, apiClient_1.authenticate()];
                case 2:
                    // For now, validate by attempting to get projects
                    // In production, validate against api_keys table
                    _a.sent();
                    return [2 /*return*/, { type: "api_key", key: token, apiClient: apiClient_1 }];
                case 3:
                    error_1 = _a.sent();
                    throw new Error("Invalid API key");
                case 4:
                    apiClient = (0, handlers_js_1.createApiClient)(DASHBOARD_API, {
                        user: process.env.DASHBOARD_USER || "carlosjperez",
                        password: process.env.DASHBOARD_PASS || "bypass",
                    });
                    return [4 /*yield*/, apiClient.authenticate()];
                case 5:
                    _a.sent();
                    return [2 /*return*/, { type: "jwt", token: token, apiClient: apiClient }];
                case 6: throw new Error("Invalid authorization format");
            }
        });
    });
}
// ============================================================================
// Session Management
// ============================================================================
/**
 * Get existing session by ID
 */
function getSession(sessionId) {
    if (!sessionId)
        return null;
    return sessions.get(sessionId) || null;
}
/**
 * Create a new session
 */
function createSession(projectId) {
    var sessionId = "mcp-".concat(crypto_1.default.randomUUID());
    var session = {
        id: sessionId,
        project_id: projectId,
        created_at: new Date(),
        last_activity: new Date(),
    };
    sessions.set(sessionId, session);
    return session;
}
/**
 * Update session's project ID
 */
function updateSessionProject(sessionId, projectId) {
    var session = sessions.get(sessionId);
    if (session) {
        session.project_id = projectId;
        session.last_activity = new Date();
        return session;
    }
    return null;
}
/**
 * Get existing session or create new one
 */
function getOrCreateSession(sessionId, projectId) {
    if (projectId === void 0) { projectId = null; }
    if (sessionId && sessions.has(sessionId)) {
        return sessions.get(sessionId);
    }
    // Create new session
    return createSession(projectId);
}
// ============================================================================
// Endpoints
// ============================================================================
/**
 * Server info
 */
app.get("/", function (_req, res) {
    res.json({
        name: "SOLARIA Dashboard MCP Server",
        version: "1.0.0",
        transport: "http",
        endpoints: {
            mcp: "/mcp",
            session: "/mcp/session",
            health: "/health",
        },
    });
});
/**
 * Health check (supports both /health and /mcp/health)
 */
function healthHandler(_req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var response, dashboardOk, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(DASHBOARD_API, "/health"))];
                case 1:
                    response = _a.sent();
                    dashboardOk = response.ok;
                    res.json({
                        status: dashboardOk ? "ok" : "degraded",
                        timestamp: new Date().toISOString(),
                        dashboard: dashboardOk ? "connected" : "disconnected",
                        sessions: sessions.size,
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    res.status(503).json({
                        status: "error",
                        error: error_2 instanceof Error ? error_2.message : "Unknown error",
                        timestamp: new Date().toISOString(),
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Register health check on multiple paths
app.get("/health", healthHandler);
app.get("/mcp/health", healthHandler);
/**
 * Initialize MCP session with project context
 */
app.post("/mcp/session", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, project_id, project_name, session, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, authenticateRequest(req)];
            case 1:
                _b.sent();
                _a = req.body, project_id = _a.project_id, project_name = _a.project_name;
                if (!project_id && !project_name) {
                    res.status(400).json({
                        error: "project_id or project_name required",
                    });
                    return [2 /*return*/];
                }
                session = createSession(project_id || null);
                res.json({
                    session_id: session.id,
                    project_id: session.project_id,
                    message: "Session created. Use Mcp-Session-Id header for subsequent requests.",
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                res.status(401).json({ error: error_3 instanceof Error ? error_3.message : "Authentication failed" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Handle MCP JSON-RPC requests
 */
app.post("/mcp", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, jsonrpc, id, method, params, publicMethods, isNotification, isPublicMethod, auth, apiCall, sessionId, projectIdHeader, adminModeHeader, session, context, result, _b, toolName, args, toolResult, actionResult, __action, cleanResult, error_4, uri, resourceData, error_5, errorMessage;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 17, , 18]);
                _a = req.body, jsonrpc = _a.jsonrpc, id = _a.id, method = _a.method, params = _a.params;
                publicMethods = ["initialize", "ping", "tools/list"];
                isNotification = method === null || method === void 0 ? void 0 : method.startsWith("notifications/");
                isPublicMethod = publicMethods.includes(method) || isNotification;
                auth = null;
                apiCall = null;
                if (!!isPublicMethod) return [3 /*break*/, 2];
                return [4 /*yield*/, authenticateRequest(req)];
            case 1:
                auth = _d.sent();
                apiCall = auth.apiClient.apiCall;
                _d.label = 2;
            case 2:
                sessionId = req.headers["mcp-session-id"];
                projectIdHeader = req.headers["x-project-id"];
                adminModeHeader = req.headers["x-admin-mode"];
                session = getSession(sessionId);
                if (!session && !projectIdHeader) {
                    // Create a new session for this connection
                    session = getOrCreateSession(undefined, null);
                    sessionId = session.id;
                }
                context = {
                    session_id: sessionId || (session === null || session === void 0 ? void 0 : session.id),
                    project_id: (session === null || session === void 0 ? void 0 : session.project_id) || (projectIdHeader ? parseInt(projectIdHeader, 10) : null),
                    // Admin mode: explicit header OR no project_id
                    adminMode: adminModeHeader === "true" || adminModeHeader === "1",
                };
                // Update session activity
                if (session) {
                    session.last_activity = new Date();
                }
                if (jsonrpc !== "2.0") {
                    res.status(400).json({
                        jsonrpc: "2.0",
                        id: id,
                        error: { code: -32600, message: "Invalid JSON-RPC version" },
                    });
                    return [2 /*return*/];
                }
                result = void 0;
                _b = method;
                switch (_b) {
                    case "initialize": return [3 /*break*/, 3];
                    case "tools/list": return [3 /*break*/, 4];
                    case "tools/call": return [3 /*break*/, 5];
                    case "resources/list": return [3 /*break*/, 10];
                    case "resources/read": return [3 /*break*/, 11];
                    case "ping": return [3 /*break*/, 13];
                    case "notifications/initialized": return [3 /*break*/, 14];
                    case "notifications/cancelled": return [3 /*break*/, 14];
                    case "notifications/progress": return [3 /*break*/, 14];
                }
                return [3 /*break*/, 15];
            case 3:
                // Create or get session for this connection
                if (!session) {
                    session = createSession(null);
                }
                // Set Mcp-Session-Id header as per MCP Streamable HTTP spec
                res.setHeader("Mcp-Session-Id", session.id);
                result = {
                    protocolVersion: "2025-06-18",
                    capabilities: {
                        tools: {},
                        resources: {},
                    },
                    serverInfo: {
                        name: "solaria-dashboard",
                        version: "3.2.0",
                    },
                };
                return [3 /*break*/, 16];
            case 4:
                result = { tools: handlers_js_1.toolDefinitions };
                return [3 /*break*/, 16];
            case 5:
                toolName = params === null || params === void 0 ? void 0 : params.name;
                args = params === null || params === void 0 ? void 0 : params.arguments;
                _d.label = 6;
            case 6:
                _d.trys.push([6, 8, , 9]);
                return [4 /*yield*/, (0, handlers_js_1.executeTool)(toolName, args, apiCall, context)];
            case 7:
                toolResult = _d.sent();
                // Handle special action to update session context
                if (toolResult && typeof toolResult === 'object' && '__action' in toolResult) {
                    actionResult = toolResult;
                    if (actionResult.__action === "SET_PROJECT_CONTEXT") {
                        // Update session with new project_id
                        if (session) {
                            session.project_id = actionResult.project_id;
                            session.last_activity = new Date();
                            console.log("[SESSION] Updated session ".concat(session.id, " to project ").concat(actionResult.project_id));
                        }
                        else {
                            // Create new session with project
                            session = createSession(actionResult.project_id);
                            sessionId = session.id;
                            console.log("[SESSION] Created new session ".concat(session.id, " for project ").concat(actionResult.project_id));
                        }
                        __action = actionResult.__action, cleanResult = __rest(actionResult, ["__action"]);
                        result = {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(__assign(__assign({}, cleanResult), { session_id: session.id, instruction: "Use this session_id in the 'Mcp-Session-Id' header for subsequent requests to maintain project isolation." }), null, 2),
                                },
                            ],
                            // Include session info in response metadata
                            _session: {
                                id: session.id,
                                project_id: session.project_id,
                            },
                        };
                    }
                }
                else {
                    result = {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(toolResult, null, 2),
                            },
                        ],
                    };
                }
                return [3 /*break*/, 9];
            case 8:
                error_4 = _d.sent();
                result = {
                    content: [
                        {
                            type: "text",
                            text: "Error: ".concat(error_4 instanceof Error ? error_4.message : "Unknown error"),
                        },
                    ],
                    isError: true,
                };
                return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 16];
            case 10:
                result = { resources: handlers_js_1.resourceDefinitions };
                return [3 /*break*/, 16];
            case 11:
                uri = params === null || params === void 0 ? void 0 : params.uri;
                return [4 /*yield*/, (0, handlers_js_1.readResource)(uri, apiCall, context)];
            case 12:
                resourceData = _d.sent();
                result = {
                    contents: [
                        {
                            uri: uri,
                            mimeType: "application/json",
                            text: JSON.stringify(resourceData, null, 2),
                        },
                    ],
                };
                return [3 /*break*/, 16];
            case 13:
                result = {};
                return [3 /*break*/, 16];
            case 14:
                // Per MCP spec, notifications get 202 Accepted with no body
                res.status(202).send();
                return [2 /*return*/];
            case 15:
                res.status(400).json({
                    jsonrpc: "2.0",
                    id: id,
                    error: { code: -32601, message: "Method not found: ".concat(method) },
                });
                return [2 /*return*/];
            case 16:
                // Include session header in all responses (MCP Streamable HTTP spec)
                if (session === null || session === void 0 ? void 0 : session.id) {
                    res.setHeader("Mcp-Session-Id", session.id);
                }
                res.json({
                    jsonrpc: "2.0",
                    id: id,
                    result: result,
                });
                return [3 /*break*/, 18];
            case 17:
                error_5 = _d.sent();
                console.error("MCP Error:", error_5);
                errorMessage = error_5 instanceof Error ? error_5.message : "Unknown error";
                res.status(errorMessage.includes("Authorization") ? 401 : 500).json({
                    jsonrpc: "2.0",
                    id: (_c = req.body) === null || _c === void 0 ? void 0 : _c.id,
                    error: {
                        code: -32000,
                        message: errorMessage,
                    },
                });
                return [3 /*break*/, 18];
            case 18: return [2 /*return*/];
        }
    });
}); });
/**
 * SSE stream for server-to-client notifications (optional)
 * Also handles health check GET requests without auth
 */
app.get("/mcp", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var acceptHeader, keepAlive_1, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                acceptHeader = req.headers.accept || "";
                if (!acceptHeader.includes("text/event-stream")) {
                    res.json({
                        status: "ok",
                        server: "solaria-dashboard",
                        version: "3.1.0",
                        transport: "http",
                    });
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, authenticateRequest(req)];
            case 2:
                _a.sent();
                res.setHeader("Content-Type", "text/event-stream");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("Connection", "keep-alive");
                // Send initial connection event
                res.write("event: connected\ndata: ".concat(JSON.stringify({ status: "ok" }), "\n\n"));
                keepAlive_1 = setInterval(function () {
                    res.write(": keepalive\n\n");
                }, 30000);
                req.on("close", function () {
                    clearInterval(keepAlive_1);
                });
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                res.status(401).json({ error: error_6 instanceof Error ? error_6.message : "Authentication failed" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ============================================================================
// Error Handling
// ============================================================================
app.use(function (err, _req, res, _next) {
    console.error("Server Error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
// ============================================================================
// Start Server
// ============================================================================
app.listen(PORT, "0.0.0.0", function () {
    console.log("\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551           SOLARIA Dashboard MCP HTTP Server                   \u2551\n\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n\u2551  Port:      ".concat(String(PORT).padEnd(48), "\u2551\n\u2551  Dashboard: ").concat(DASHBOARD_API.padEnd(48), "\u2551\n\u2551  Transport: HTTP (Streamable)                                 \u2551\n\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n\u2551  Endpoints:                                                   \u2551\n\u2551    POST /mcp           - MCP JSON-RPC requests                \u2551\n\u2551    GET  /mcp           - SSE stream                           \u2551\n\u2551    POST /mcp/session   - Initialize session                   \u2551\n\u2551    GET  /health        - Health check                         \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n  "));
});
// Graceful shutdown
process.on("SIGTERM", function () {
    console.log("Shutting down MCP HTTP Server...");
    process.exit(0);
});
process.on("SIGINT", function () {
    console.log("Shutting down MCP HTTP Server...");
    process.exit(0);
});
