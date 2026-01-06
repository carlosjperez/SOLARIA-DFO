/**
 * MCP Tool: get_context
 *
 * Unified endpoint to get system state in a single call
 * Replaces multiple individual tools (get_dashboard_overview, get_stats, get_health, etc.)
 *
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MCP-SKETCH-002
 */

import { z } from 'zod';
import { ResponseBuilder, type StandardResponse } from '../utils/response-builder.js';

// ============================================================================
// Configuration
// ============================================================================

const DASHBOARD_API = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';

// ============================================================================
// Validation Schema
// ============================================================================

const GetContextInputSchema = z.object({
  project_id: z.number().optional(),
  project_name: z.string().optional(),
  include: z.object({
    projects: z.boolean().optional().default(false),
    tasks: z.boolean().optional().default(false),
    agents: z.boolean().optional().default(false),
    stats: z.boolean().optional().default(false),
    health: z.boolean().optional().default(false),
    alerts: z.boolean().optional().default(false),
    sprints: z.boolean().optional().default(false),
    epics: z.boolean().optional().default(false),
  }).optional().default({}),
});

// ============================================================================
// API Client Helper
// ============================================================================

class ApiClient {
  private token: string | null = null;

  constructor(
    private readonly url: string,
    private readonly credentials: { user: string; password: string }
  ) {}

  private async authenticate(): Promise<void> {
    const response = await fetch(`${this.url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.credentials.user,
        password: this.credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json() as { token: string };
    this.token = data.token;
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      await this.authenticate();
    }

    const response = await fetch(`${this.url}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      await this.authenticate();
      return this.request<T>(endpoint, options);
    }

    return response.json();
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getProjects(
  apiClient: ApiClient,
  projectId?: number
): Promise<unknown> {
  if (projectId) {
    return apiClient.request(`/projects/${projectId}`);
  }
  return apiClient.request('/projects');
}

async function getTasks(
  apiClient: ApiClient,
  projectId?: number
): Promise<unknown> {
  const endpoint = projectId ? `/tasks?project_id=${projectId}` : '/tasks';
  return apiClient.request(endpoint);
}

async function getAgents(apiClient: ApiClient): Promise<unknown> {
  return apiClient.request('/agents');
}

async function getStats(
  apiClient: ApiClient,
  projectId?: number
): Promise<unknown> {
  const endpoint = projectId ? `/memories/stats?project_id=${projectId}` : '/memories/stats';
  return apiClient.request(endpoint);
}

async function getHealth(apiClient: ApiClient): Promise<unknown> {
  return apiClient.request('/health');
}

async function getDashboardOverview(
  apiClient: ApiClient,
  projectId?: number
): Promise<unknown> {
  if (projectId) {
    const [project, tasks] = await Promise.all([
      apiClient.request(`/projects/${projectId}`),
      apiClient.request(`/tasks?project_id=${projectId}`),
    ]);

    return {
      project,
      metrics: {
        total_tasks: Array.isArray(tasks) ? tasks.length : 0,
        completed: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'completed').length : 0,
        in_progress: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'in_progress').length : 0,
        pending: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'pending').length : 0,
      },
      isolation_mode: true,
      project_id: projectId,
    };
  }

  return apiClient.request('/dashboard/overview');
}

async function getDashboardAlerts(
  apiClient: ApiClient,
  projectId?: number
): Promise<unknown> {
  const endpoint = projectId ? `/dashboard/alerts?project_id=${projectId}` : '/dashboard/alerts';
  return apiClient.request(endpoint);
}

async function getSprints(
  apiClient: ApiClient,
  projectId: number
): Promise<unknown> {
  return apiClient.request(`/projects/${projectId}/sprints`);
}

async function getEpics(
  apiClient: ApiClient,
  projectId: number
): Promise<unknown> {
  return apiClient.request(`/projects/${projectId}/epics`);
}

// ============================================================================
// MCP Tool Export
// ============================================================================

export const get_context_tool = {
  name: 'get_context',
  description: 'Obtener estado unificado del sistema DFO (projects, tasks, agents, stats, health) en una sola llamada',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'number',
        description: 'ID del proyecto para filtrar contexto (opcional)',
      },
      project_name: {
        type: 'string',
        description: 'Nombre del proyecto para filtrar contexto (opcional, busca coincidencia exacta o parcial)',
      },
      include: {
        type: 'object',
        description: 'Qué componentes incluir en el contexto (default: todos)',
        properties: {
          projects: {
            type: 'boolean',
            description: 'Incluir lista de proyectos',
          },
          tasks: {
            type: 'boolean',
            description: 'Incluir lista de tareas',
          },
          agents: {
            type: 'boolean',
            description: 'Incluir lista de agentes',
          },
          stats: {
            type: 'boolean',
            description: 'Incluir estadísticas de memoria',
          },
          health: {
            type: 'boolean',
            description: 'Incluir health check del sistema',
          },
          alerts: {
            type: 'boolean',
            description: 'Incluir alertas del dashboard',
          },
          sprints: {
            type: 'boolean',
            description: 'Incluir sprints del proyecto (requiere project_id)',
          },
          epics: {
            type: 'boolean',
            description: 'Incluir epics del proyecto (requiere project_id)',
          },
        },
      },
    },
  },
};

// ============================================================================
// Handler Function
// ============================================================================

export async function handleGetContext(params: any, apiClient: ApiClient): Promise<StandardResponse> {
  try {
    // Validate input
    const validated = GetContextInputSchema.parse(params);
    const { project_id, project_name, include } = validated;

    console.log(`[get_context] Fetching context for project: ${project_name || project_id || 'all'}`);

    // Resolve project_id from project_name if needed
    let resolvedProjectId = project_id;
    if (project_name && !project_id) {
      const projects = await apiClient.request<any[]>('/projects');
      const project = projects.find((p: any) =>
        p.name.toLowerCase() === project_name!.toLowerCase() ||
        p.name.toLowerCase().includes(project_name!.toLowerCase())
      );
      if (project) {
        resolvedProjectId = project.id;
        console.log(`[get_context] Resolved project "${project_name}" to ID: ${resolvedProjectId}`);
      }
    }

    // Fetch all requested components in parallel
    const results: Record<string, unknown> = {};

    const fetchTasks: Promise<void>[] = [];

    // Projects
    if (include.projects !== false) {
      fetchTasks.push(
        getProjects(apiClient, resolvedProjectId).then(data => {
          results.projects = data;
        })
      );
    }

    // Tasks
    if (include.tasks !== false) {
      fetchTasks.push(
        getTasks(apiClient, resolvedProjectId).then(data => {
          results.tasks = data;
        })
      );
    }

    // Agents
    if (include.agents) {
      fetchTasks.push(
        getAgents(apiClient).then(data => {
          results.agents = data;
        })
      );
    }

    // Stats
    if (include.stats) {
      fetchTasks.push(
        getStats(apiClient, resolvedProjectId).then(data => {
          results.stats = data;
        })
      );
    }

    // Health
    if (include.health !== false) {
      fetchTasks.push(
        getHealth(apiClient).then(data => {
          results.health = data;
        })
      );
    }

    // Alerts
    if (include.alerts) {
      fetchTasks.push(
        getDashboardAlerts(apiClient, resolvedProjectId).then(data => {
          results.alerts = data;
        })
      );
    }

    // Dashboard overview
    if (include.projects !== false && !resolvedProjectId) {
      fetchTasks.push(
        getDashboardOverview(apiClient, resolvedProjectId).then(data => {
          results.dashboard = data;
        })
      );
    }

    // Sprints (requires project_id)
    if (include.sprints && resolvedProjectId) {
      fetchTasks.push(
        getSprints(apiClient, resolvedProjectId).then(data => {
          results.sprints = data;
        })
      );
    }

    // Epics (requires project_id)
    if (include.epics && resolvedProjectId) {
      fetchTasks.push(
        getEpics(apiClient, resolvedProjectId).then(data => {
          results.epics = data;
        })
      );
    }

    // Execute all fetches in parallel
    await Promise.all(fetchTasks);

    // Build response
    return {
      success: true,
      data: {
        context: results,
        project_id: resolvedProjectId,
        timestamp: new Date().toISOString(),
        message: resolvedProjectId
          ? `Context retrieved for project ID: ${resolvedProjectId}`
          : 'Global context retrieved',
      },
    };

  } catch (error) {
    console.error('[get_context] Error:', error);
    return {
      success: false,
      error: {
        code: 'GET_CONTEXT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// ============================================================================
// Default Export for Handler Integration
// ============================================================================

export default {
  tool: get_context_tool,
  handler: handleGetContext,
};
