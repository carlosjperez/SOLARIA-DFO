"use strict";
/**
 * SOLARIA DFO MCP Server - Type Definitions
 * Base types for MCP protocol, tools, and handlers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_RPC_ERRORS = void 0;
// Standard JSON-RPC error codes
exports.JSON_RPC_ERRORS = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    SERVER_ERROR: -32000,
};
