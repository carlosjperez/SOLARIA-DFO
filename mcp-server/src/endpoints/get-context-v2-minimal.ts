/**
 * SOLARIA DFO MCP Tool v2.0 Minimalista
 * Implementa get_context sin dependencias externas
 */

// ============================================================================
// Constants
// ============================================================================

const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
const JWT_SECRET = process.env.JWT_SECRET || 'solaria_jwt_secret_2024_min32chars_secure';

// ============================================================================
// Types inline (para evitar errores de importación)
// ============================================================================

interface GetContextParams {
  project_id?: number;
  project_name?: string;
  include?: {
    projects?: boolean;
    tasks?: boolean;
    agents?: boolean;
    stats?: boolean;
    health?: boolean;
  };
}

interface Project {
  id: number;
  name: string;
  description?: string;
  client?: string;
  created_at: string;
  status?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  project_id: number;
  created_at?: string;
  due_date?: string;
  completed_at?: string;
}

interface SessionContext {
  project_id?: number;
  session_id?: string;
  created_at: string;
}

interface ContextResponse {
  success: boolean;
  data?: {
    context?: {
      projects?: Project[];
      tasks?: Task[];
      agents?: any[];
      stats?: any;
      health?: any;
      alerts?: any[];
    };
  };
  project_id?: number;
  };
  timestamp?: string;
  message?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function createResponse(success: boolean, data?: any, project_id?: number): ContextResponse {
  return {
    success,
    data: {
      context: data,
      project_id,
    },
    timestamp: new Date().toISOString(),
    message: project_id ? `Context retrieved for project ID: ${project_id}` : 'Context retrieved',
  };
}

function createErrorResponse(message: string, code?: number): ContextResponse {
  return {
    success: false,
    data: {
      context: { projects: [], tasks: [] },
      project_id: undefined,
    },
    timestamp: new Date().toISOString(),
    message,
  };
}

function apiRequest(endpoint: string, options?: any): Promise<any> {
  const token = process.env.JWT_SECRET || 'default';
  const url = `${DASHBOARD_API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API Error] ${endpoint}: ${response.status} - ${errorText}`);
    throw new Error(errorText);
  }

  return response.json();
}

// ============================================================================
// Handler: get_context
// ============================================================================

export async function handleGetContext(params: GetContextParams): Promise<ContextResponse> {
  const { project_id, project_name, include } = params;

  try {
    console.log('[get_context] Parameters:', params);

    // Build API endpoint based on parameters
    let endpoint = '/api/dashboard/overview';
    const options: {
      method: 'POST',
      body: JSON.stringify({
        include_projects: include?.projects ?? true,
        include_tasks: include?.tasks ?? false,
        include_agents: include?.agents ?? false,
        include_stats: include?.stats ?? false,
        include_health: include?.health ?? false,
        include_alerts: include?.alerts ?? false,
        include_sprints: include?.sprints ?? false,
        include_epics: include?.epics ?? false,
        project_id,
        project_name,
      }),
    };

    if (project_id) {
      endpoint = '/api/dashboard/projects/context';
    }

    console.log(`[get_context] API Request: ${endpoint}`);

    const apiData = await apiRequest(endpoint, options);

    const context: any = apiData?.context || {
      projects: [],
      tasks: [],
      agents: [],
      stats: {},
      health: {},
      alerts: [],
    };

    return createResponse(true, context, project_id);

  } catch (error: any) {
    console.error('[get_context] Error:', error);
    return createErrorResponse(error.message || 'Failed to get context');
  }
}
