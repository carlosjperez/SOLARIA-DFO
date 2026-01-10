/**
 * SOLARIA Dashboard MCP Handlers v2.0 (Sketch Pattern)
 * Simplified handlers with only 2 core tools: get_context + run_code
 *
 * @module handlers
 * @version 2.0.0
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MCP-SKETCH-018
 */

import type {
  ApiCallFunction,
  ApiClient,
  ApiCredentials,
  SetProjectContextResult,
  Project,
  Task,
  Agent,
  Sprint,
  Epic,
  SessionContext,
  SetProjectContextParams,
} from './types.ts';

import { toolDefinitions } from './tool-definitions.js';

import { handleGetContext } from './src/endpoints/get-context.js';
import { handleRunCode } from './src/endpoints/run-code.js';

import { protocolEnforcer } from './src/utils/protocol-enforcement.js';

// ============================================================================
// Tool Executor
// ============================================================================

export async function executeTool(
  name: string,
  args: Record<string, unknown> | undefined,
  apiCall: ApiCallFunction,
  context: SessionContext = {}
): Promise<unknown> {
  const sessionId = context.session_id || 'default';
  const dashboardUrl = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
  const credentials = {
    user: process.env.DASHBOARD_USER || 'carlosjperez',
    password: process.env.DASHBOARD_PASS || 'bypass',
  };

  let result: unknown;

  protocolEnforcer.beforeToolCall(sessionId, name, args);

  switch (name) {
    case 'get_context': {
      const handler = await import('./src/endpoints/get-context.js');
      result = await handler.default.handler(args as any);
      break;
    }

    case 'run_code': {
      const handler = await import('./src/endpoints/run-code.js');
      result = await handler.default.handler(args, {
        user: credentials.user,
        password: credentials.password,
      });
      break;
    }

    case 'set_project_context': {
      const params = args as SetProjectContextParams;
      let targetProject: Project | null = null;

      if (params.project_id) {
        targetProject = await apiCall<Project>(`/projects/${params.project_id}`);
      } else if (params.project_name) {
        const allProjects = await apiCall<Project[]>('/projects');
        const projects = Array.isArray(allProjects) ? allProjects : (allProjects as any).projects || [];

        targetProject = projects.find((p: Project) =>
          p.name.toLowerCase() === params.project_name!.toLowerCase()
        ) || null;

        if (!targetProject) {
          targetProject = projects.find((p: Project) =>
            p.name.toLowerCase().includes(params.project_name!.toLowerCase()) ||
            params.project_name!.toLowerCase().includes(p.name.toLowerCase())
          ) || null;
        }
      } else if (params.working_directory) {
        const dirName = params.working_directory.split('/').pop()?.toLowerCase() || '';
        const allProjects = await apiCall<Project[]>('/projects');
        const projects = Array.isArray(allProjects) ? allProjects : (allProjects as any).projects || [];

        targetProject = projects.find((p: Project) =>
          p.name.toLowerCase().includes(dirName) ||
          dirName.includes(p.name.toLowerCase().replace(/\s+/g, '-'))
        ) || null;
      }

      if (!targetProject) {
        const allProjects = await apiCall<Project[]>('/projects');
        const projects = Array.isArray(allProjects) ? allProjects : (allProjects as any).projects || [];
        return {
          success: false,
          error: 'Project not found',
          available_projects: projects.map((p: Project) => ({ id: p.id, name: p.name })),
          hint: 'Use set_project_context with project_id or exact project_name',
        };
      }

      const setContextResult: SetProjectContextResult = {
        __action: 'SET_PROJECT_CONTEXT',
        success: true,
        project_id: targetProject.id,
        project_name: targetProject.name,
        message: `Context set to project: ${targetProject.name} (ID: ${targetProject.id}). All subsequent operations will be isolated to this project.`,
      };
      result = setContextResult;
      break;
    }

    case 'get_current_context': {
      result = {
        project_id: context.project_id,
        isolation_enabled: Boolean(context.project_id),
        admin_mode: context.adminMode || false,
        message: context.project_id
          ? `You are working in project #${context.project_id}. All operations are isolated to this project.`
          : 'No project context set. You have access to all projects. Call set_project_context to isolate to a specific project.',
      };
      break;
    }

    case 'get_work_context': {
      if (!context.project_id) {
        result = {
          project: null,
          current_tasks: [],
          recent_context: [],
          ready_tasks: [],
          suggested_next_actions: [{
            action: 'start_task',
            task_id: 0,
            reason: 'No project context set. Call set_project_context first.',
          }]
        };
      } else {
        const [project, allTasks] = await Promise.all([
          apiCall<Project>(`/projects/${context.project_id}`),
          apiCall<Task[]>(`/tasks?project_id=${context.project_id}`),
        ]);

        const tasks = allTasks || [];
        const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress');

        result = {
          project,
          current_tasks: inProgressTasks,
          recent_context: [],
          ready_tasks: tasks.filter((t: any) => t.status === 'pending'),
          suggested_next_actions: inProgressTasks.length === 0
            ? [{ action: 'start_task', task_id: tasks[0]?.id, reason: 'No tasks in progress. Consider starting next pending task.' }]
            : [],
        };
      }
      break;
    }

    default:
      throw new Error(`Unknown tool: ${name}. In Sketch Pattern v2.0, use run_code() to execute custom operations.`);
  }

  protocolEnforcer.afterToolCall(sessionId, name, result);

  return result;
}

// ============================================================================
// Resource Reader
// ============================================================================

export async function readResource(
  uri: string,
  apiCall: ApiCallFunction,
  context: SessionContext = {}
): Promise<unknown> {
  const sessionId = context.session_id || 'default';
  protocolEnforcer.beforeToolCall(sessionId, `readResource: ${uri}`, { uri, context });

  switch (uri) {
    case 'solaria://dashboard/overview':
      if (context.project_id) {
        const [project, allTasks] = await Promise.all([
          apiCall<Project>(`/projects/${context.project_id}`),
          apiCall<Task[]>(`/tasks?project_id=${context.project_id}`),
        ]);

        return {
          project,
          tasks_count: (allTasks || []).length,
          isolation_mode: true,
          project_id: context.project_id,
        };
      }
      return apiCall('/dashboard/overview');

    case 'solaria://projects/list':
      if (context.project_id) {
        return [await apiCall<Project>(`/projects/${context.project_id}`)];
      }
      return apiCall('/projects');

    case 'solaria://tasks/list':
      if (context.project_id) {
        return apiCall(`/tasks?project_id=${context.project_id}`);
      }
      return apiCall('/tasks');

    case 'solaria://agents/list':
      return apiCall('/agents');

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}

// ============================================================================
// API Client Factory (v1.0 compatibility)
// ============================================================================

/**
 * Creates an authenticated API client for Dashboard API calls
 * Legacy v1.0 compatibility - used by http-server.ts
 */
export function createApiClient(dashboardUrl: string, credentials: ApiCredentials): ApiClient {
  let authToken: string | null = null;
  const { user, password } = credentials;

  async function authenticate(): Promise<{ token: string }> {
    console.log('[DEBUG apiClient] Authenticating with dashboard:', dashboardUrl);
    const response = await fetch(`${dashboardUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password }),
    });

    console.log('[DEBUG apiClient] Auth response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[DEBUG apiClient] Auth failed:', errorText);
      throw new Error("Authentication failed");
    }

    const data = await response.json() as { token: string };
    authToken = data.token;
    console.log('[DEBUG apiClient] Auth successful, got token');
    return data;
  }

  async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!authToken) {
      await authenticate();
    }

    const response = await fetch(`${dashboardUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, re-authenticate
      await authenticate();
      return apiCall(endpoint, options);
    }

    return response.json() as Promise<T>;
  }

  function setToken(token: string): void {
    authToken = token;
  }

  // Implement request() for v2.0 compatibility
  async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiCall<T>(endpoint, options);
  }

  return { apiCall, authenticate, setToken, request };
}

// ============================================================================
// HTTP Server Test Helpers
// ============================================================================

/**
 * Handle MCP request for HTTP test server
 */
export async function handleMCPRequest(body: any): Promise<any> {
  if (!body || !body.method) {
    return {
      jsonrpc: '2.0',
      id: body?.id || null,
      error: {
        code: -32600,
        message: 'Invalid Request'
      }
    };
  }

  if (body.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: body.id,
      result: {
        tools: toolDefinitions
      }
    };
  }

  if (body.method === 'tools/call') {
    const { name, arguments: args } = body.params || {};
    try {
      // Create a simple API call function for testing
      const apiCall = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
        // This is a stub - actual implementation would make real API calls
        return Promise.resolve({} as T);
      };

      const result = await executeTool(name, args, apiCall, { session_id: 'test-session' });
      return {
        jsonrpc: '2.0',
        id: body.id,
        result: { content: [{ type: 'text', text: JSON.stringify(result) }] }
      };
    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id: body.id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id: body.id,
    error: {
      code: -32601,
      message: 'Method not found'
    }
  };
}

/**
 * List available tools
 */
export function listTools(): any[] {
  return toolDefinitions;
}

// ============================================================================
// Exports
// ============================================================================

export {
  toolDefinitions,
};
