const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
const JWT_SECRET = process.env.JWT_SECRET || 'solaria_jwt_secret_2024_min32chars_secure';

interface SetProjectContextParams {
  project_id?: number;
  project_name?: string;
  working_directory?: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  client?: string;
  created_at: string;
  status?: string;
}

interface SetProjectContextResult {
  success: boolean;
  project_id: number;
  project_name: string;
  message: string;
  __action: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  available_projects?: Array<{ id: number; name: string }>;
  hint?: string;
}

// ============================================================================
// Helpers
// ============================================================================

async function apiRequest<T>(endpoint: string, options?: any): Promise<T | null> {
  const token = JWT_SECRET;
  const url = `${DASHBOARD_API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API Error] ${endpoint}: ${response.status} - ${errorText}`);
    return null;
  }

  return response.json() as Promise<T>;
}

export const set_project_context_tool = {
  name: 'set_project_context',
  description: 'Establece el contexto del proyecto para aislamiento de sesión. Debe ser llamado primero antes de otras operaciones.',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'number',
        description: 'ID del proyecto (prioridad más alta si se especifica)'
      },
      project_name: {
        type: 'string',
        description: 'Nombre del proyecto (búsqueda exacta o parcial)'
      },
      working_directory: {
        type: 'string',
        description: 'Directorio de trabajo actual para detectar proyecto automáticamente'
      }
    }
  }
};

export async function handleSetProjectContext(params: SetProjectContextParams): Promise<SetProjectContextResult | ErrorResponse> {
  const { project_id, project_name, working_directory } = params;

  if (!project_id && !project_name && !working_directory) {
    return {
      success: false,
      error: 'project_id, project_name, or working_directory required',
      hint: 'Use set_project_context with project_id, project_name, or working_directory'
    };
  }

  try {
    console.log('[set_project_context] Parameters:', params);

    let targetProject: Project | null = null;

    if (project_id) {
      const project = await apiRequest<{ project: Project }>(`/projects/${project_id}`);
      targetProject = project?.project || null;
      console.log('[set_project_context] Found project by ID:', targetProject);
    }

    else if (project_name) {
      const projectsResponse = await apiRequest<{ projects?: Project[] } | Project[]>('/projects');
      const projects = Array.isArray(projectsResponse)
        ? projectsResponse
        : (projectsResponse as any)?.projects || [];

      targetProject = projects.find((p: Project) =>
        p.name.toLowerCase() === project_name!.toLowerCase()
      ) || null;

      if (!targetProject) {
        targetProject = projects.find((p: Project) =>
          p.name.toLowerCase().includes(project_name!.toLowerCase()) ||
          project_name!.toLowerCase().includes(p.name.toLowerCase())
        ) || null;
      }

      console.log('[set_project_context] Found project by name:', targetProject);
    }

    else if (working_directory) {
      const dirName = working_directory.split('/').pop()?.toLowerCase() || '';
      const projectsResponse = await apiRequest<{ projects?: Project[] } | Project[]>('/projects');
      const projects = Array.isArray(projectsResponse)
        ? projectsResponse
        : (projectsResponse as any)?.projects || [];

      targetProject = projects.find((p: Project) => {
        const projectNameClean = p.name.toLowerCase().replace(/\s+/g, '-');
        return projectNameClean.includes(dirName) || dirName.includes(projectNameClean);
      }) || null;

      console.log('[set_project_context] Found project by directory:', targetProject);
    }

    if (!targetProject) {
      const projectsResponse = await apiRequest<{ projects?: Project[] } | Project[]>('/projects');
      const projects = Array.isArray(projectsResponse)
        ? projectsResponse
        : (projectsResponse as any)?.projects || [];

      return {
        success: false,
        error: 'Project not found',
        available_projects: projects.map((p: Project) => ({ id: p.id, name: p.name })),
        hint: 'Use set_project_context with project_id or exact project_name'
      };
    }

    const result: SetProjectContextResult = {
      __action: 'SET_PROJECT_CONTEXT',
      success: true,
      project_id: targetProject.id,
      project_name: targetProject.name,
      message: `Context set to project: ${targetProject.name} (ID: ${targetProject.id}). All subsequent operations will be isolated to this project.`
    };

    return result;

  } catch (error: any) {
    console.error('[set_project_context] Error:', error);

    const projectsResponse = await apiRequest<{ projects?: Project[] } | Project[]>('/projects');
    const projects = Array.isArray(projectsResponse)
      ? projectsResponse
      : (projectsResponse as any)?.projects || [];

    return {
      success: false,
      error: error.message || 'Failed to set project context',
      available_projects: projects.map((p: Project) => ({ id: p.id, name: p.name })),
      hint: 'Use set_project_context with project_id or exact project_name'
    };
  }
}

export default {
  tool: set_project_context_tool,
  handler: handleSetProjectContext,
};
