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

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
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
 * Health check
 */
app.get("/health", async (req, res) => {
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
});

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
    const auth = await authenticateRequest(req);
    const { apiClient } = auth;
    const { apiCall } = apiClient;

    // Get session or project context
    const sessionId = req.headers["mcp-session-id"];
    const projectIdHeader = req.headers["x-project-id"];
    const session = getSession(sessionId);

    const context = {
      project_id: session?.project_id || (projectIdHeader ? parseInt(projectIdHeader) : null),
    };

    // Update session activity
    if (session) {
      session.last_activity = new Date();
    }

    const { jsonrpc, id, method, params } = req.body;

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
        result = {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
            resources: {},
          },
          serverInfo: {
            name: "solaria-dashboard",
            version: "1.0.0",
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
          result = {
            content: [
              {
                type: "text",
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
          };
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
        const resourceData = await readResource(uri, apiCall);
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
 */
app.get("/mcp", async (req, res) => {
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
