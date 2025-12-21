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
export {};
