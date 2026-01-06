/**
 * SOLARIA DFO MCP Server Types v2.0 (Sketch Pattern)
 * Complete type definitions for simplified MCP with 2 core tools
 *
 * @module types-v2
 * @version 2.0.0
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 */

// ============================================================================
// Standard JSON-RPC Error Codes
// ============================================================================

export const JSON_RPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_ERROR: -32000,
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

export interface ApiClient {
  authenticate(): Promise<{ token: string }>;
  setToken(token: string): void;
  request<T>(endpoint: string, options?: RequestInit): Promise<T>;
}

export type ApiCallFunction = <T>(endpoint: string, options?: RequestInit) => Promise<T>;

// ============================================================================
// MCP Protocol Types
// ============================================================================

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      default?: unknown;
    }>;
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'resource';
    text?: string;
    uri?: string;
    mimeType?: string;
  }>;
  _session?: {
    id: string;
    project_id?: number;
  };
  isError?: boolean;
}

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
    uri?: string;
  };
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: number | string;
  result?: MCPToolResult;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export type JSON_RPC_ERRORS = typeof JSON_RPC_ERRORS;

// ============================================================================
// Session Management
// ============================================================================

export interface MCPSession {
  id: string;
  project_id?: number;
  created_at: Date;
  last_activity: Date;
}

export interface MCPContext {
  session_id?: string;
  project_id?: number;
  adminMode?: boolean;
}

// ============================================================================
// Entity Types
// ============================================================================

export interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  budget: number | string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  task_code: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  project_id: number;
  assigned_agent_id?: number;
  estimated_hours?: number;
  actual_hours?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskItem {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  estimated_minutes?: number;
  actual_minutes?: number;
  position: number;
}

export interface Agent {
  id: number;
  name: string;
  role: 'architect' | 'developer' | 'tester' | 'designer' | 'product-manager';
  status: 'idle' | 'busy' | 'offline';
  assigned_tasks: number;
}

export interface Sprint {
  id: number;
  project_id: number;
  name: string;
  goal?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  velocity?: number;
  capacity?: number;
}

export interface Epic {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  color?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  start_date?: string;
  target_date?: string;
}

// ============================================================================
// Tool Input Parameters
// ============================================================================

export interface GetContextParams {
  project_id?: number;
  project_name?: string;
  include?: {
    projects?: boolean;
    tasks?: boolean;
    agents?: boolean;
    stats?: boolean;
    health?: boolean;
    alerts?: boolean;
    sprints?: boolean;
    epics?: boolean;
  };
}

export interface RunCodeParams {
  code: string;
  language?: 'javascript' | 'typescript' | 'sql';
  timeout?: number;
  sandbox?: 'strict' | 'permissive';
}

export interface SetProjectContextParams {
  project_id?: number;
  project_name?: string;
  working_directory?: string;
}

export interface SetProjectContextResult {
  __action: 'SET_PROJECT_CONTEXT';
  success: boolean;
  project_id: number;
  project_name: string;
  message: string;
  session_id?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface ResponseMetadata {
  timestamp?: string;
  request_id?: string;
  execution_time_ms?: number;
  version?: string;
}

export interface ErrorObject {
  code: string;
  message: string;
  details?: any;
  field?: string;
  suggestion?: string;
}

export interface StandardSuccessResponse<T = any> {
  success: true;
  data: T;
  metadata?: ResponseMetadata;
  format?: 'json' | 'human';
  formatted?: string;
}

export interface StandardErrorResponse {
  success: false;
  error: ErrorObject;
  metadata?: ResponseMetadata;
}

export type StandardResponse<T = any> = StandardSuccessResponse<T> | StandardErrorResponse;

// ============================================================================
// Exports
// ============================================================================

export {
  JSON_RPC_ERRORS,
  type ApiClient,
  type ApiCallFunction,
  type MCPTool,
  type MCPResource,
  type MCPToolResult,
  type JSONRPCRequest,
  type JSONRPCResponse,
  type MCPSession,
  type MCPContext,
  type Project,
  type Task,
  type TaskItem,
  type Agent,
  type Sprint,
  type Epic,
  type GetContextParams,
  type RunCodeParams,
  type SetProjectContextParams,
  type SetProjectContextResult,
  type ResponseMetadata,
  type ErrorObject,
  type StandardSuccessResponse,
  type StandardErrorResponse,
  type StandardResponse,
};
