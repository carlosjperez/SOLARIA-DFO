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

import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import {
  toolDefinitions,
  resourceDefinitions,
  createApiClient,
  executeTool,
  readResource,
} from "./handlers.js";

// Configuration
const PORT = process.env.MCP_PORT || 3031;
const DASHBOARD_API = process.env.DASHBOARD_API_URL || "http://localhost:3030/api";
const JWT_SECRET = process.env.JWT_SECRET || "solaria_jwt_secret_2024";

// Session storage (in production, use Redis)
const sessions = new Map();

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Project-Id", "Mcp-Session-Id"],
}));
app.use(express.json({ limit: "10mb" }));

// Request logging with details
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path === '/mcp') {
    console.log(`  Headers: ${JSON.stringify({
      accept: req.headers.accept,
      'content-type': req.headers['content-type'],
      authorization: req.headers.authorization ? 'Bearer ***' : 'none'
    })}`);
    console.log(`  Body method: ${req.body?.method || 'no body yet'}`);
  }
  next();
});

/**
 * Authenticate request using API key or JWT
 */
async function authenticateRequest(req) {
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

    // It's a JWT token - validate it
    // For simplicity, we just try to use it with the dashboard
    const apiClient = createApiClient(DASHBOARD_API, {
      user: process.env.DASHBOARD_USER || "carlosjperez",
      password: process.env.DASHBOARD_PASS || "bypass",
    });
    await apiClient.authenticate();
    return { type: "jwt", token, apiClient };
  }

  throw new Error("Invalid authorization format");
}

/**
 * Get or create session
 */
function getSession(sessionId) {
  if (!sessionId) return null;
  return sessions.get(sessionId);
}

function createSession(projectId) {
  const sessionId = `mcp-${crypto.randomUUID()}`;
  const session = {
    id: sessionId,
    project_id: projectId,
    created_at: new Date(),
    last_activity: new Date(),
  };
  sessions.set(sessionId, session);
  return session;
}

function updateSessionProject(sessionId, projectId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.project_id = projectId;
    session.last_activity = new Date();
    return session;
  }
  return null;
}

// Auto-create session for new connections
function getOrCreateSession(sessionId, projectId = null) {
  if (sessionId && sessions.has(sessionId)) {
    return sessions.get(sessionId);
  }
  // Create new session
  return createSession(projectId);
}

// ==================== ENDPOINTS ====================

/**
 * Server info
 */
app.get("/", (req, res) => {
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
async function healthHandler(req, res) {
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
      error: error.message,
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
app.post("/mcp/session", async (req, res) => {
  try {
    await authenticateRequest(req);

    const { project_id, project_name } = req.body;

    if (!project_id && !project_name) {
      return res.status(400).json({
        error: "project_id or project_name required",
      });
    }

    const session = createSession(project_id);

    res.json({
      session_id: session.id,
      project_id: session.project_id,
      message: "Session created. Use Mcp-Session-Id header for subsequent requests.",
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * Handle MCP JSON-RPC requests
 */
app.post("/mcp", async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    // Allow these methods without authentication (for health check/discovery)
    const publicMethods = ["initialize", "ping", "tools/list"];
    const isPublicMethod = publicMethods.includes(method);

    let auth = null;
    let apiClient = null;
    let apiCall = null;

    // Only authenticate for protected methods
    if (!isPublicMethod) {
      auth = await authenticateRequest(req);
      apiClient = auth.apiClient;
      apiCall = apiClient.apiCall;
    }

    // Get session or project context
    let sessionId = req.headers["mcp-session-id"];
    const projectIdHeader = req.headers["x-project-id"];
    const adminModeHeader = req.headers["x-admin-mode"];

    // Auto-create session if not exists
    let session = getSession(sessionId);
    if (!session && !projectIdHeader) {
      // Create a new session for this connection
      session = getOrCreateSession(null, null);
      sessionId = session.id;
    }

    const context = {
      session_id: sessionId || session?.id,
      project_id: session?.project_id || (projectIdHeader ? parseInt(projectIdHeader) : null),
      // Admin mode: explicit header OR no project_id
      adminMode: adminModeHeader === "true" || adminModeHeader === "1",
    };

    // Update session activity
    if (session) {
      session.last_activity = new Date();
    }

    if (jsonrpc !== "2.0") {
      return res.status(400).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32600, message: "Invalid JSON-RPC version" },
      });
    }

    let result;

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

      case "tools/call":
        const { name, arguments: args } = params;
        try {
          const toolResult = await executeTool(name, args, apiCall, context);

          // Handle special action to update session context
          if (toolResult?.__action === "SET_PROJECT_CONTEXT") {
            // Update session with new project_id
            if (session) {
              session.project_id = toolResult.project_id;
              session.last_activity = new Date();
              console.log(`[SESSION] Updated session ${session.id} to project ${toolResult.project_id}`);
            } else {
              // Create new session with project
              session = createSession(toolResult.project_id);
              sessionId = session.id;
              console.log(`[SESSION] Created new session ${session.id} for project ${toolResult.project_id}`);
            }

            // Remove internal action flag from result
            const { __action, ...cleanResult } = toolResult;
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
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        break;

      case "resources/list":
        result = { resources: resourceDefinitions };
        break;

      case "resources/read":
        const { uri } = params;
        // Pass context for project isolation
        const resourceData = await readResource(uri, apiCall, context);
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

      case "ping":
        result = {};
        break;

      default:
        return res.status(400).json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        });
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
    res.status(error.message.includes("Authorization") ? 401 : 500).json({
      jsonrpc: "2.0",
      id: req.body?.id,
      error: {
        code: -32000,
        message: error.message,
      },
    });
  }
});

/**
 * SSE stream for server-to-client notifications (optional)
 * Also handles health check GET requests without auth
 */
app.get("/mcp", async (req, res) => {
  // If not requesting SSE, return simple status (for health checks)
  const acceptHeader = req.headers.accept || "";
  if (!acceptHeader.includes("text/event-stream")) {
    return res.json({
      status: "ok",
      server: "solaria-dashboard",
      version: "3.1.0",
      transport: "http",
    });
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
    res.status(401).json({ error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ==================== START SERVER ====================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           SOLARIA Dashboard MCP HTTP Server                   ║
╠═══════════════════════════════════════════════════════════════╣
║  Port:      ${PORT}                                              ║
║  Dashboard: ${DASHBOARD_API.padEnd(44)}║
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
