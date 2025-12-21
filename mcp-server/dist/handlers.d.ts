/**
 * SOLARIA Dashboard MCP Handlers
 * Shared handlers for both stdio and HTTP transports
 *
 * @module handlers
 */
import type { MCPToolDefinition, MCPResource, MCPContext, ApiCallFunction, ApiCredentials, ApiClient } from './types.js';
export declare const toolDefinitions: MCPToolDefinition[];
export declare const resourceDefinitions: MCPResource[];
export declare function createApiClient(dashboardUrl: string, credentials: ApiCredentials): ApiClient;
/**
 * Execute a tool call with PROJECT ISOLATION
 *
 * ISOLATION RULES:
 * - When context.project_id is set, agent can ONLY access that project's data
 * - list_projects → Returns only the assigned project
 * - list_tasks → Always filtered by project_id
 * - get_task → Validates task belongs to project
 * - create_task → Forces project_id from context
 * - Admin mode (context.adminMode=true) bypasses isolation
 */
export declare function executeTool(name: string, args: Record<string, unknown> | undefined, apiCall: ApiCallFunction, context?: MCPContext): Promise<unknown>;
export declare function readResource(uri: string, apiCall: ApiCallFunction, context?: MCPContext): Promise<unknown>;
