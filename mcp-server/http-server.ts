#!/usr/bin/env node

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

import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import {
  toolDefinitions,
  resourceDefinitions,
  createApiClient,
  executeTool,
  readResource,
} from "./handlers.js";
import type {
  MCPSession,
  MCPContext,
  MCPToolResult,
  ApiClient,
  JSONRPCRequest,
  JSONRPCResponse,
  JSON_RPC_ERRORS,
} from "./types.js";

// ============================================================================
// Type Definitions
// ============================================================================

interface AuthResult {
  type: "api_key" | "jwt";
  key?: string;
  token?: string;
  apiClient: ApiClient;
}

interface SessionCreateRequest {
  project_id?: number;
  project_name?: string;
}

interface MCPRequestBody extends JSONRPCRequest {
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
    uri?: string;
  };
}

interface HealthResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  dashboard?: string;
  sessions?: number;
  error?: string;
}

interface ServerInfoResponse {
  name: string;
  version: string;
  transport: string;
  endpoints: {
    mcp: string;
    session: string;
    health: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const PORT: number = parseInt(process.env.MCP_PORT || "3031", 10);
const DASHBOARD_API: string = process.env.DASHBOARD_API_URL || "http://localhost:3030/api";
const JWT_SECRET: string = process.env.JWT_SECRET || "solaria_jwt_secret_2024";

// Session storage (in production, use Redis)
const sessions = new Map<string, MCPSession>();
const SESSION_TTL_MS: number = 24 * 60 * 60 * 1000; // 24 hours

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [sessionId, session] of sessions.entries()) {
    const lastActivity = session.last_activity instanceof Date
      ? session.last_activity.getTime()
      : new Date(session.last_activity).getTime();
    if (now - lastActivity > SESSION_TTL_MS) {
      sessions.delete(sessionId);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[SESSION] Cleaned ${cleaned} expired sessions`);
  }
}, 60 * 60 * 1000);

// ============================================================================
// Express App Setup
// ============================================================================

const app: Application = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration - restrict to known origins in production
const ALLOWED_ORIGINS: string[] = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["https://dfo.solaria.agency", "https://solaria.agency", "http://localhost:3030", "http://localhost:5173"];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like curl, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    // Allow configured origins
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes("*")) {
      return callback(null, true);
    }
    // Log blocked origin for debugging
    console.log(`[CORS] Blocked request from origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Project-Id", "Mcp-Session-Id"],
}));

app.use(express.json({ limit: "10mb" }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// Authentication
// ============================================================================

/**
 * Authenticate request using API key or JWT
 */
async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("Authorization header required");
  }

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    // Check if it's an API key (starts with 'sk-solaria-')
    if (token.startsWith("sk-solaria-")) {
      // Validate API key against dashboard
      const apiClient = createApiClient(DASHBOARD_API, {
        user: process.env.DASHBOARD_USER || "carlosjperez",
        password: process.env.DASHBOARD_PASS || "bypass",
      });

      try {
        // For now, validate by attempting to get projects
        // In production, validate against api_keys table
        await apiClient.authenticate();
        return { type: "api_key", key: token, apiClient };
      } catch (error) {
        throw new Error("Invalid API key");
      }
    }

    // It's a JWT token - verify signature with JWT_SECRET
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // JWT is valid, create authenticated API client
      const apiClient = createApiClient(DASHBOARD_API, {
        user: process.env.DASHBOARD_USER || "carlosjperez",
        password: process.env.DASHBOARD_PASS || "bypass",
      });

      // Use the verified JWT token directly instead of re-authenticating
      apiClient.setToken(token);

      console.log(`[AUTH] JWT verified for user: ${decoded.sub || decoded.userId || 'unknown'}`);
      return { type: "jwt", token, apiClient };
    } catch (jwtError) {
      const error = jwtError as VerifyErrors;
      console.log(`[AUTH] JWT verification failed: ${error.message}`);
      throw new Error(`Invalid JWT token: ${error.message}`);
    }
  }

  throw new Error("Invalid authorization format");
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get existing session by ID
 */
function getSession(sessionId: string | undefined): MCPSession | null {
  if (!sessionId) return null;
  return sessions.get(sessionId) || null;
}

/**
 * Create a new session
 */
function createSession(projectId: number | null): MCPSession {
  const sessionId = `mcp-${crypto.randomUUID()}`;
  const session: MCPSession = {
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
function updateSessionProject(sessionId: string, projectId: number): MCPSession | null {
  const session = sessions.get(sessionId);
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
function getOrCreateSession(sessionId: string | undefined, projectId: number | null = null): MCPSession {
  if (sessionId && sessions.has(sessionId)) {
    return sessions.get(sessionId)!;
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
app.get("/", (_req: Request, res: Response<ServerInfoResponse>) => {
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
async function healthHandler(_req: Request, res: Response<HealthResponse>): Promise<void> {
  try {
    // Check dashboard connectivity
    const response = await fetch(`${DASHBOARD_API}/health`);
    const dashboardOk = response.ok;

    res.json({
      status: dashboardOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      dashboard: dashboardOk ? "connected" : "disconnected",
      sessions: sessions.size,
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}

// Register health check on multiple paths
app.get("/health", healthHandler);
app.get("/mcp/health", healthHandler);

/**
 * Initialize MCP session with project context
 */
app.post("/mcp/session", async (req: Request<{}, {}, SessionCreateRequest>, res: Response) => {
  try {
    await authenticateRequest(req);

    const { project_id, project_name } = req.body;

    if (!project_id && !project_name) {
      res.status(400).json({
        error: "project_id or project_name required",
      });
      return;
    }

    const session = createSession(project_id || null);

    res.json({
      session_id: session.id,
      project_id: session.project_id,
      message: "Session created. Use Mcp-Session-Id header for subsequent requests.",
    });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "Authentication failed" });
  }
});

/**
 * Handle MCP JSON-RPC requests
 */
app.post("/mcp", async (req: Request<{}, {}, MCPRequestBody>, res: Response) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    // Allow these methods without authentication (for health check/discovery)
    const publicMethods = ["initialize", "ping", "tools/list"];
    const isNotification = method?.startsWith("notifications/");
    const isPublicMethod = publicMethods.includes(method) || isNotification;

    let auth: AuthResult | null = null;
    let apiCall: ((endpoint: string, options?: RequestInit) => Promise<unknown>) | null = null;

    // Only authenticate for protected methods
    if (!isPublicMethod) {
      auth = await authenticateRequest(req);
      apiCall = auth.apiClient.apiCall;
    }

    // Get session or project context
    let sessionId = req.headers["mcp-session-id"] as string | undefined;
    const projectIdHeader = req.headers["x-project-id"] as string | undefined;
    const adminModeHeader = req.headers["x-admin-mode"] as string | undefined;

    // Auto-create session if not exists
    let session = getSession(sessionId);
    if (!session && !projectIdHeader) {
      // Create a new session for this connection
      session = getOrCreateSession(undefined, null);
      sessionId = session.id;
    }

    const context: MCPContext = {
      session_id: sessionId || session?.id,
      project_id: session?.project_id || (projectIdHeader ? parseInt(projectIdHeader, 10) : null),
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
        id,
        error: { code: -32600, message: "Invalid JSON-RPC version" },
      });
      return;
    }

    let result: unknown;

    switch (method) {
      case "initialize":
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
        break;

      case "tools/list":
        result = { tools: toolDefinitions };
        break;

      case "tools/call": {
        const toolName = params?.name;
        const args = params?.arguments;
        try {
          const toolResult = await executeTool(toolName!, args, apiCall!, context);

          // Handle special action to update session context
          if (toolResult && typeof toolResult === 'object' && '__action' in toolResult) {
            const actionResult = toolResult as { __action: string; project_id: number; [key: string]: unknown };
            if (actionResult.__action === "SET_PROJECT_CONTEXT") {
              // Update session with new project_id
              if (session) {
                session.project_id = actionResult.project_id;
                session.last_activity = new Date();
                console.log(`[SESSION] Updated session ${session.id} to project ${actionResult.project_id}`);
              } else {
                // Create new session with project
                session = createSession(actionResult.project_id);
                sessionId = session.id;
                console.log(`[SESSION] Created new session ${session.id} for project ${actionResult.project_id}`);
              }

              // Remove internal action flag from result
              const { __action, ...cleanResult } = actionResult;
              result = {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      ...cleanResult,
                      session_id: session.id,
                      instruction: "Use this session_id in the 'Mcp-Session-Id' header for subsequent requests to maintain project isolation.",
                    }, null, 2),
                  },
                ],
                // Include session info in response metadata
                _session: {
                  id: session.id,
                  project_id: session.project_id,
                },
              };
            }
          } else {
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(toolResult, null, 2),
                },
              ],
            };
          }
        } catch (error) {
          result = {
            content: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
            isError: true,
          };
        }
        break;
      }

      case "resources/list":
        result = { resources: resourceDefinitions };
        break;

      case "resources/read": {
        const uri = params?.uri;
        // Pass context for project isolation
        const resourceData = await readResource(uri!, apiCall!, context);
        result = {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(resourceData, null, 2),
            },
          ],
        };
        break;
      }

      case "ping":
        result = {};
        break;

      // Handle notifications (client -> server, no response expected)
      case "notifications/initialized":
      case "notifications/cancelled":
      case "notifications/progress":
        // Per MCP spec, notifications get 202 Accepted with no body
        res.status(202).send();
        return;

      default:
        res.status(400).json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        });
        return;
    }

    // Include session header in all responses (MCP Streamable HTTP spec)
    if (session?.id) {
      res.setHeader("Mcp-Session-Id", session.id);
    }

    res.json({
      jsonrpc: "2.0",
      id,
      result,
    });
  } catch (error) {
    console.error("MCP Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(errorMessage.includes("Authorization") ? 401 : 500).json({
      jsonrpc: "2.0",
      id: req.body?.id,
      error: {
        code: -32000,
        message: errorMessage,
      },
    });
  }
});

/**
 * SSE stream for server-to-client notifications (optional)
 * Also handles health check GET requests without auth
 */
app.get("/mcp", async (req: Request, res: Response) => {
  // If not requesting SSE, return simple status (for health checks)
  const acceptHeader = req.headers.accept || "";
  if (!acceptHeader.includes("text/event-stream")) {
    res.json({
      status: "ok",
      server: "solaria-dashboard",
      version: "3.1.0",
      transport: "http",
    });
    return;
  }

  try {
    await authenticateRequest(req);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ status: "ok" })}\n\n`);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(`: keepalive\n\n`);
    }, 30000);

    req.on("close", () => {
      clearInterval(keepAlive);
    });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "Authentication failed" });
  }
});

// ============================================================================
// Error Handling
// ============================================================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           SOLARIA Dashboard MCP HTTP Server                   ║
╠═══════════════════════════════════════════════════════════════╣
║  Port:      ${String(PORT).padEnd(48)}║
║  Dashboard: ${DASHBOARD_API.padEnd(48)}║
║  Transport: HTTP (Streamable)                                 ║
╠═══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                   ║
║    POST /mcp           - MCP JSON-RPC requests                ║
║    GET  /mcp           - SSE stream                           ║
║    POST /mcp/session   - Initialize session                   ║
║    GET  /health        - Health check                         ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down MCP HTTP Server...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Shutting down MCP HTTP Server...");
  process.exit(0);
});
