/**
 * SOLARIA DFO MCP HTTP Server v2.0
 * Sketch Pattern - Simplified 2-tool architecture
 *
 * Core Tools:
 * - get_context: Unified system state retrieval
 * - run_code: Secure sandbox code execution
 *
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @version 2.0.0
 */

import http from 'http';

const PORT = process.env.MCP_PORT || 3032;
const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
const JWT_SECRET = process.env.JWT_SECRET || 'solaria_jwt_secret_2024_min32chars_secure';

// ============================================================================
// Imports (Common for both v1.0 and v2.0)
// ============================================================================

let handlers;
let toolDefinitions;

try {
  const v2Handlers = require('./handlers-v2.js');
  const v2Definitions = require('./tool-definitions-v2.js');

  if (process.env.MCP_VERSION === '2.0') {
    // v2.0 Sketch Pattern
    handlers = v2Handlers;
    toolDefinitions = v2Definitions;
    console.log('[MCP Server] Starting v2.0 Sketch Pattern (2 core tools)');
  } else {
    // v1.0 or fallback to v1.0 handlers
    const v1Handlers = require('./handlers.js');
    const v1Definitions = require('./tool-definitions.js');
    handlers = v1Handlers;
    toolDefinitions = v1Definitions;
    console.log('[MCP Server] Starting v1.0 (70+ tools)');
  }
} catch (error) {
  console.error('[MCP Server] Error loading handlers:', error);
  process.exit(1);
}

// ============================================================================
// HTTP Server Setup
// ============================================================================

const app = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Content-Length, X-MCP-Version, X-Project-Id, Mcp-Session-Id');
  res.setHeader('Access-Control-Expose', 'Content-Length, X-MCP-Version');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Health check endpoint (bypass CORS and auth)
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('v2.0 healthy');
    return;
  }

  // Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': '0' });
    res.end();
    return;
  }

  // Parse request body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const json = JSON.parse(body);
      const { id, method, params } = json;

      console.log(`[${method}] ${id}`, JSON.stringify(params));

      // JSON-RPC v2.0 specification
      if (method === 'tools/list') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            tools: toolDefinitions.map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            }))
          }
        }));
      } else if (method === 'tools/call') {
        const toolName = params?.name;
        const args = params?.arguments || {};

        if (!toolName || typeof toolName !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32602,
              message: 'Invalid params: tool name required and must be string'
            }
          }));
          return;
        }

        const tool = toolDefinitions.find(t => t.name === toolName);

        if (!tool) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Tool not found: ${toolName}`
            }
          }));
          return;
        }

        // Create API client function for tool handlers
        const apiClient = createApiClient(DASHBOARD_API_URL);

        // Execute tool
        const result = await handlers.executeTool(toolName, args, apiClient, {});

        // JSON-RPC v2.0 response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result,
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        }));
      }
    } catch (error) {
      console.error('[MCP Server] Request error:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Invalid JSON request'
        }
      }));
    }
  });
});

// ============================================================================
// API Client Factory
// ============================================================================

function createApiClient(dashboardUrl) {
  let authToken = null;

  return {
    request: async (endpoint, options = {}) => {
      if (!authToken) {
        const response = await fetch(`${dashboardUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: process.env.DASHBOARD_USER || 'carlosjperez',
            password: process.env.DASHBOARD_PASS || 'bypass',
          }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        authToken = data.token;
      }

      const response = await fetch(`${dashboardUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        authToken = null;
        return request(endpoint, options);
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API request failed: ${text}`);
      }

      return response.json();
    }
  };
}

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, '0.0.0.1', () => {
  console.log(`[MCP Server v2.0] Server listening on port ${PORT}`);
  console.log(`[MCP Server v2.0] Dashboard API: ${DASHBOARD_API_URL}`);
  console.log(`[MCP Server v2.0] Loaded ${toolDefinitions.length} tools: ${toolDefinitions.map(t => t.name).join(', ')}`);
  console.log(`[MCP Server v2.0] Health check: http://0.0.0.1:${PORT}/health`);
});

// ============================================================================
// Graceful shutdown
// ============================================================================

const shutdown = (signal) => {
  console.log(`[MCP Server v2.0] Received ${signal}, shutting down gracefully...`);
  app.close(() => {
    console.log('[MCP Server v2.0] Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
