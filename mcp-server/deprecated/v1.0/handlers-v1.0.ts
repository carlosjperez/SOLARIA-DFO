/**
 * SOLARIA Dashboard MCP Handlers
 * Shared handlers for both stdio and HTTP transports
 *
 * @module handlers
 */

import type {
  Project,
  Task,
  TaskItem,
  Agent,
  Alert,
  Document,
  DocumentMetadata,
  SessionContext,
  CreateTaskCompletionMemory,
  MemoryCreateParams,
  MemoryListParams,
  MemoryGetParams,
  MemoryUpdateParams,
  MemoryDeleteParams,
  MemorySearchParams,
  MemorySemanticSearchParams,
  MemoryBoostParams,
  MemoryRelatedParams,
  MemoryLinkParams,
  SetProjectContextResult
} from './types/params.js';


import type {
  Project,
  Task,
  TaskItem,
  Agent,
  Alert,
// ============================================================================
// Import endpoint tools
// ============================================================================

import type {
  Project,
  Task,
  TaskItem,
  Agent,
  Alert,
  Document,
  DocumentMetadata,
  SessionContext,
  CreateTaskCompletionMemory,
  MemoryCreateParams,
  MemoryListParams,
  MemoryGetParams,
  MemoryUpdateParams,
  MemoryDeleteParams,
  MemorySearchParams,
  MemorySemanticSearchParams,
  MemoryBoostParams,
  MemoryRelatedParams,
  MemoryLinkParams,
  SetProjectContextResult,
  CheckLocalMemoryParams,
} from './types/params.js';

import type {
  Project,
  Task,
  TaskItem,
  Agent,
  Alert,
  Document,
  DocumentMetadata,
  SessionContext,
  CreateTaskCompletionMemory,
  MemoryCreateParams,
  MemoryListParams,
  MemoryGetParams,
  MemoryUpdateParams,
  MemoryDeleteParams,
  MemorySearchParams,
  MemorySemanticSearchParams,
  MemoryBoostParams,
  MemoryRelatedParams,
  MemoryLinkParams,
  SetProjectContextResult,
  CheckLocalMemoryParams,
} from './types/params.js';

import { check_local_memory_tool } from './src/handlers/check-local-memory-handler.js';
import { handleCheckLocalMemory } from '../endpoints/local-memory-check.js';

// ============================================================================
// Resource Definitions
// ============================================================================

export const resourceDefinitions: MCPResource[] = [
  {
    uri: "solaria://dashboard/overview",
    name: "Dashboard Overview",
    description: "Executive overview with KPIs, task counts, and agent status",
    mimeType: "application/json",
  },
  {
    uri: "solaria://projects/list",
    name: "Projects List",
    description: "All projects in the SOLARIA system",
    mimeType: "application/json",
  },
  {
    uri: "solaria://tasks/list",
    name: "Tasks List",
    description: "All tasks across projects",
    mimeType: "application/json",
  },
  {
    uri: "solaria://agents/list",
    name: "Agents List",
    description: "All SOLARIA AI agents and their status",
    mimeType: "application/json",
  },
];

// ============================================================================
// API Client Factory
// ============================================================================

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

  async function apiCall(endpoint: string, options: RequestInit = {}): Promise<unknown> {
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

    return response.json();
  }

  function setToken(token: string): void {
    authToken = token;
  }

  return { apiCall, authenticate, setToken };
}

// ============================================================================
// Tool Execution with Project Isolation
// ============================================================================

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
export async function executeTool(
  name: string,
  args: Record<string, unknown> | undefined,
  apiCall: ApiCallFunction,
  context: MCPContext = {}
): Promise<unknown> {
  // Protocol Enforcement - MANDATORY checks before tool execution
  const sessionId = context.session_id || 'default';
  protocolEnforcer.beforeToolCall(sessionId, name, args);

  // Determine if strict project isolation is active
  const isIsolated = Boolean(context.project_id && !context.adminMode);
  const projectId = context.project_id || (args?.project_id as number | undefined);

  // Helper to validate task belongs to context project
  async function validateTaskProject(taskId: number): Promise<boolean> {
    if (!isIsolated) return true;
    const task = await apiCall(`/tasks/${taskId}`) as Task;
    if (task.project_id !== context.project_id) {
      throw new Error(`ACCESS DENIED: Task #${taskId} does not belong to your project`);
    }
    return true;
  }

  switch (name) {
    // Session Context Management
    case "set_project_context": {
      const params = (args as unknown) as SetProjectContextParams;
      let targetProject: Project | null = null;

      if (params.project_id) {
        const response = await apiCall(`/projects/${params.project_id}`) as { project?: Project } | Project;
        console.log('[DEBUG set_project_context] API response:', JSON.stringify(response).substring(0, 200));
        // Unwrap if API returns { project: {...} } format
        targetProject = 'project' in response ? response.project! : response as Project;
        console.log('[DEBUG set_project_context] targetProject:', targetProject ? { id: targetProject.id, name: targetProject.name } : null);
      } else if (params.project_name) {
        const allProjects = await apiCall("/projects") as { projects?: Project[] } | Project[];
        const projects = Array.isArray(allProjects) ? allProjects : (allProjects.projects || []);

        // Try exact match first
        targetProject = projects.find(p =>
          p.name.toLowerCase() === params.project_name!.toLowerCase()
        ) || null;

        // Try partial match
        if (!targetProject) {
          targetProject = projects.find(p =>
            p.name.toLowerCase().includes(params.project_name!.toLowerCase()) ||
            params.project_name!.toLowerCase().includes(p.name.toLowerCase())
          ) || null;
        }
      } else if (params.working_directory) {
        const dirName = params.working_directory.split('/').pop()?.toLowerCase() || '';
        const allProjects = await apiCall("/projects") as { projects?: Project[] } | Project[];
        const projects = Array.isArray(allProjects) ? allProjects : (allProjects.projects || []);

        targetProject = projects.find(p =>
          p.name.toLowerCase().includes(dirName) ||
          dirName.includes(p.name.toLowerCase().replace(/\s+/g, '-'))
        ) || null;
      }

      if (!targetProject) {
        const allProjects = await apiCall("/projects") as { projects?: Project[] } | Project[];
        const projects = Array.isArray(allProjects) ? allProjects : (allProjects.projects || []);
        return {
          success: false,
          error: "Project not found",
          available_projects: projects.map(p => ({ id: p.id, name: p.name })),
          hint: "Use set_project_context with project_id or exact project_name",
        };
      }

      const result: SetProjectContextResult = {
        __action: "SET_PROJECT_CONTEXT",
        success: true,
        project_id: targetProject.id,
        project_name: targetProject.name,
        message: `Context set to project: ${targetProject.name} (ID: ${targetProject.id}). All subsequent operations will be isolated to this project.`,
      };
      return result;
    }

    case "get_current_context":
      return {
        project_id: context.project_id,
        isolation_enabled: isIsolated,
        admin_mode: context.adminMode || false,
        message: isIsolated
          ? `You are working in project #${context.project_id}. All operations are isolated to this project.`
          : "No project context set. You have access to all projects. Call set_project_context to isolate to a specific project.",
      };

    case "get_work_context":
      return getWorkContext(context.project_id || null, apiCall);

    // Dashboard
    case "get_dashboard_overview":
      if (isIsolated) {
        const [project, allTasks] = await Promise.all([
          apiCall(`/projects/${context.project_id}`) as Promise<Project>,
          apiCall(`/tasks?project_id=${context.project_id}`) as Promise<Task[]>,
        ]);
        const tasks = allTasks || [];
        return {
          project,
          metrics: {
            total_tasks: tasks.length,
            completed: tasks.filter(t => t.status === "completed").length,
            in_progress: tasks.filter(t => t.status === "in_progress").length,
            pending: tasks.filter(t => t.status === "pending").length,
            blocked: tasks.filter(t => t.status === "blocked").length,
          },
          isolation_mode: true,
          project_id: context.project_id,
        };
      }
      return apiCall("/dashboard/overview");

    case "get_dashboard_alerts": {
      const params = (args as unknown) as GetDashboardAlertsParams | undefined;
      if (isIsolated) {
        const alerts = await apiCall(`/dashboard/alerts${params?.severity ? `?severity=${params.severity}` : ""}`) as Alert[];
        return (alerts || []).filter(a => !a.project_id || a.project_id === context.project_id);
      }
      return apiCall(`/dashboard/alerts${params?.severity ? `?severity=${params.severity}` : ""}`);
    }

    // Projects
    case "list_projects":
      if (isIsolated) {
        const project = await apiCall(`/projects/${context.project_id}`);
        return [project];
      }
      return apiCall("/projects");

    case "get_project": {
      const params = (args as unknown) as GetProjectParams | undefined;
      if (!params?.project_id && !projectId) {
        throw new Error("project_id is required");
      }
      const requestedProjectId = params?.project_id || projectId;
      if (isIsolated && requestedProjectId !== context.project_id) {
        throw new Error(`ACCESS DENIED: Cannot access project #${requestedProjectId}. You are isolated to project #${context.project_id}`);
      }
      return apiCall(`/projects/${requestedProjectId}`);
    }

    case "create_project": {
      const params = (args as unknown) as CreateProjectParams;
      const projectPayload = {
        name: params.name,
        client: params.client || "External Client",
        description: params.description || "",
        budget: params.budget || 0,
        deadline: params.deadline,
        status: "planning",
        priority: params.priority || "medium",
      };
      if (isIsolated) {
        console.log(`[PROJECT] Creating new project "${params.name}" from isolated session (project #${context.project_id})`);
      }
      return apiCall("/projects", {
        method: "POST",
        body: JSON.stringify(projectPayload),
      });
    }

    case "update_project": {
      const params = (args as unknown) as UpdateProjectParams;
      if (isIsolated && params.project_id !== context.project_id) {
        console.log(`[PROJECT] Updating project #${params.project_id} from isolated session (project #${context.project_id})`);
      }
      return apiCall(`/projects/${params.project_id}`, {
        method: "PUT",
        body: JSON.stringify(params),
      });
    }

    // Tasks
    case "list_tasks": {
      const params = (args as unknown) as ListTasksParams | undefined;
      let endpoint = "/tasks";
      const queryParams: string[] = [];

      if (isIsolated) {
        queryParams.push(`project_id=${context.project_id}`);
        if (params?.project_id && params.project_id !== context.project_id) {
          console.warn(`[ISOLATION] Blocked attempt to list tasks from project #${params.project_id}`);
        }
      } else if (params?.project_id || projectId) {
        queryParams.push(`project_id=${params?.project_id || projectId}`);
      }
      if (params?.status) queryParams.push(`status=${params.status}`);
      if (params?.priority) queryParams.push(`priority=${params.priority}`);
      if (params?.agent_id) queryParams.push(`agent_id=${params.agent_id}`);
      if (queryParams.length) endpoint += `?${queryParams.join("&")}`;
      return apiCall(endpoint);
    }

    case "get_task": {
      const params = (args as unknown) as GetTaskParams;
      await validateTaskProject(params.task_id);
      return apiCall(`/tasks/${params.task_id}`);
    }

    case "create_task": {
      const params = (args as unknown) as CreateTaskParams;
      if (isIsolated) {
        if (params.project_id && params.project_id !== context.project_id) {
          throw new Error(`ACCESS DENIED: Cannot create tasks in project #${params.project_id}. You are isolated to project #${context.project_id}`);
        }
        return apiCall("/tasks", {
          method: "POST",
          body: JSON.stringify({
            ...params,
            project_id: context.project_id,
            status: params.status || "pending",
            priority: params.priority || "medium",
          }),
        });
      }
      if (!params.project_id && !projectId) {
        throw new Error("project_id is required for creating tasks");
      }
      return apiCall("/tasks", {
        method: "POST",
        body: JSON.stringify({
          ...params,
          project_id: params.project_id || projectId,
          status: params.status || "pending",
          priority: params.priority || "medium",
        }),
      });
    }

    case "update_task": {
      const params = (args as unknown) as UpdateTaskParams;
      await validateTaskProject(params.task_id);
      return apiCall(`/tasks/${params.task_id}`, {
        method: "PUT",
        body: JSON.stringify(params),
      });
    }

    case "complete_task": {
      const params = (args as unknown) as CompleteTaskParams;
      await validateTaskProject(params.task_id);

      // Get task details BEFORE completing (for auto-memory)
      const task = await apiCall(`/tasks/${params.task_id}`) as any;

      // Get subtasks to include in memory
      const itemsResult = await apiCall(`/tasks/${params.task_id}/items`) as { items: any[] };
      const items = itemsResult.items || [];

      // Complete the task
      const result = await apiCall(`/tasks/${params.task_id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "completed",
          progress: 100,
          completion_notes: params.completion_notes,
        }),
      });

      // Auto-create completion memory (SOL-3)
      try {
        await createTaskCompletionMemory(
          {
            id: task.id,
            task_code: task.task_code,
            title: task.title,
            completion_notes: params.completion_notes,
            items_total: items.length,
            items_completed: items.filter((i: any) => i.is_completed).length,
            project_id: task.project_id,
            priority: task.priority,
          },
          apiCall
        );
      } catch (memoryError) {
        // Log but don't fail task completion if memory creation fails
        console.warn('Auto-memory creation failed:', memoryError);
      }

      return result;
    }

    case "delete_task": {
      const params = (args as unknown) as DeleteTaskParams;
      await validateTaskProject(params.task_id);
      return apiCall(`/tasks/${params.task_id}`, {
        method: "DELETE",
      });
    }

    // Task Items
    case "list_task_items": {
      const params = (args as unknown) as ListTaskItemsParams;
      await validateTaskProject(params.task_id);
      const result = await apiCall(`/tasks/${params.task_id}/items`) as { items: TaskItem[] };
      let items = result.items;
      if (params.include_completed === false) {
        items = items.filter(i => !i.is_completed);
      }
      return {
        task_id: params.task_id,
        items,
        summary: {
          total: result.items.length,
          completed: result.items.filter(i => i.is_completed).length,
          pending: result.items.filter(i => !i.is_completed).length,
        },
      };
    }

    case "create_task_items": {
      const params = (args as unknown) as CreateTaskItemsParams;
      await validateTaskProject(params.task_id);
      const result = await apiCall(`/tasks/${params.task_id}/items`, {
        method: "POST",
        body: JSON.stringify({ items: params.items }),
      }) as { items: TaskItem[]; progress: number };
      return {
        success: true,
        task_id: params.task_id,
        items_created: result.items.length,
        items: result.items,
        task_progress: result.progress,
        message: `Created ${result.items.length} checklist items. Task progress: ${result.progress}%`,
      };
    }

    case "complete_task_item": {
      const params = (args as unknown) as CompleteTaskItemParams;
      await validateTaskProject(params.task_id);
      const result = await apiCall(
        `/tasks/${params.task_id}/items/${params.item_id}/complete`,
        {
          method: "PUT",
          body: JSON.stringify({
            notes: params.notes,
            actual_minutes: params.actual_minutes,
          }),
        }
      ) as { item: TaskItem; progress: number; completed: number; total: number };
      return {
        success: true,
        item: result.item,
        task_progress: result.progress,
        items_completed: result.completed,
        items_total: result.total,
        message: `Item completed. Task progress: ${result.completed}/${result.total} (${result.progress}%)`,
      };
    }

    case "update_task_item": {
      const params = (args as unknown) as UpdateTaskItemParams;
      await validateTaskProject(params.task_id);
      const { task_id, item_id, ...updateData } = params;
      const result = await apiCall(`/tasks/${task_id}/items/${item_id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      }) as { item: TaskItem; progress: number };
      return {
        success: true,
        item: result.item,
        task_progress: result.progress,
      };
    }

    case "delete_task_item": {
      const params = (args as unknown) as DeleteTaskItemParams;
      await validateTaskProject(params.task_id);
      const result = await apiCall(`/tasks/${params.task_id}/items/${params.item_id}`, {
        method: "DELETE",
      }) as { progress: number };
      return {
        success: true,
        deleted_item_id: params.item_id,
        task_progress: result.progress,
        message: `Item deleted. Task progress recalculated: ${result.progress}%`,
      };
    }

    // Agents
    case "list_agents": {
      const params = (args as unknown) as ListAgentsParams | undefined;
      let agents = await apiCall("/agents") as Agent[];
      if (params?.status) {
        agents = agents.filter(a => a.status === params.status);
      }
      if (params?.role) {
        agents = agents.filter(a => a.role === params.role);
      }
      return agents;
    }

    case "get_agent": {
      const params = (args as unknown) as GetAgentParams;
      return apiCall(`/agents/${params.agent_id}`);
    }

    case "get_agent_tasks": {
      const params = (args as unknown) as GetAgentTasksParams;
      const tasks = await apiCall("/tasks") as Task[];
      return tasks.filter(t => t.assigned_agent_id === params.agent_id);
    }

    case "update_agent_status": {
      const params = (args as unknown) as UpdateAgentStatusParams;
      return apiCall(`/agents/${params.agent_id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: params.status }),
      });
    }

    // Logs
    case "get_activity_logs": {
      const params = (args as unknown) as GetActivityLogsParams | undefined;
      const limit = params?.limit || 50;
      const level = params?.level ? `&level=${params.level}` : "";
      const project = isIsolated
        ? `&project_id=${context.project_id}`
        : params?.project_id ? `&project_id=${params.project_id}` : "";
      return apiCall(`/logs?limit=${limit}${level}${project}`);
    }

    case "log_activity": {
      const params = (args as unknown) as LogActivityParams;
      return apiCall("/logs", {
        method: "POST",
        body: JSON.stringify({
          ...params,
          project_id: isIsolated ? context.project_id : (params.project_id || projectId),
        }),
      });
    }

    // Docs
    case "list_docs": {
      if (isIsolated) {
        const allDocs = await apiCall("/docs/list") as Array<{ project_id: number }>;
        return (allDocs || []).filter(d => d.project_id === context.project_id);
      }
      return apiCall("/docs/list");
    }

    // Project Extended Data
    case "get_project_client": {
      const params = (args as unknown) as GetProjectClientParams;
      const clientProjectId = isIsolated ? context.project_id : params.project_id;
      if (!clientProjectId) return { error: "project_id required" };
      return apiCall(`/projects/${clientProjectId}/client`);
    }

    case "update_project_client": {
      const params = (args as unknown) as UpdateProjectClientParams;
      const updateClientProjectId = isIsolated ? context.project_id : params.project_id;
      if (!updateClientProjectId) return { error: "project_id required" };
      if (!params.name) return { error: "name required" };
      return apiCall(`/projects/${updateClientProjectId}/client`, {
        method: "PUT",
        body: JSON.stringify({
          name: params.name,
          fiscal_name: params.fiscal_name,
          rfc: params.rfc,
          website: params.website,
          address: params.address,
          contact_name: params.contact_name,
          contact_email: params.contact_email,
          contact_phone: params.contact_phone,
        }),
      });
    }

    case "get_project_documents": {
      const params = (args as unknown) as GetProjectDocumentsParams;
      const docsProjectId = isIsolated ? context.project_id : params.project_id;
      if (!docsProjectId) return { error: "project_id required" };
      return apiCall(`/projects/${docsProjectId}/documents`);
    }

    case "create_project_document": {
      const params = (args as unknown) as CreateProjectDocumentParams;
      const newDocProjectId = isIsolated ? context.project_id : params.project_id;
      if (!newDocProjectId) return { error: "project_id required" };
      if (!params.name || !params.url) return { error: "name and url required" };
      return apiCall(`/projects/${newDocProjectId}/documents`, {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          type: params.type || "other",
          url: params.url,
          description: params.description,
        }),
      });
    }

    case "get_project_requests": {
      const params = (args as unknown) as GetProjectRequestsParams;
      const reqsProjectId = isIsolated ? context.project_id : params.project_id;
      if (!reqsProjectId) return { error: "project_id required" };
      let reqsUrl = `/projects/${reqsProjectId}/requests`;
      const reqsParams: string[] = [];
      if (params.status) reqsParams.push(`status=${params.status}`);
      if (params.priority) reqsParams.push(`priority=${params.priority}`);
      if (reqsParams.length > 0) reqsUrl += `?${reqsParams.join("&")}`;
      return apiCall(reqsUrl);
    }

    case "create_project_request": {
      const params = (args as unknown) as CreateProjectRequestParams;
      const newReqProjectId = isIsolated ? context.project_id : params.project_id;
      if (!newReqProjectId) return { error: "project_id required" };
      if (!params.text) return { error: "text required" };
      return apiCall(`/projects/${newReqProjectId}/requests`, {
        method: "POST",
        body: JSON.stringify({
          text: params.text,
          priority: params.priority || "medium",
          requested_by: params.requested_by,
        }),
      });
    }

    case "update_project_request": {
      const params = (args as unknown) as UpdateProjectRequestParams;
      const updateReqProjectId = isIsolated ? context.project_id : params.project_id;
      if (!updateReqProjectId || !params.request_id) return { error: "project_id and request_id required" };
      return apiCall(`/projects/${updateReqProjectId}/requests/${params.request_id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: params.status,
          priority: params.priority,
          notes: params.notes,
        }),
      });
    }

    // Epic Tools
    case "list_epics": {
      const params = args as { project_id?: number; status?: string };
      const projectId = isIsolated ? context.project_id : params.project_id;
      if (!projectId) return { error: "project_id required" };
      const queryParams = params.status ? `?status=${params.status}` : '';
      return apiCall(`/projects/${projectId}/epics${queryParams}`);
    }

    case "create_epic": {
      const params = args as {
        project_id?: number;
        name: string;
        description?: string;
        color?: string;
        status?: string;
        start_date?: string;
        target_date?: string;
      };
      const projectId = isIsolated ? context.project_id : params.project_id;
      if (!projectId) return { error: "project_id required" };
      if (!params.name) return { error: "name required" };
      return apiCall(`/projects/${projectId}/epics`, {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          description: params.description,
          color: params.color || '#6366f1',
          status: params.status || 'open',
          start_date: params.start_date,
          target_date: params.target_date,
        }),
      });
    }

    case "update_epic": {
      const params = args as {
        epic_id: number;
        name?: string;
        description?: string;
        color?: string;
        status?: string;
        start_date?: string;
        target_date?: string;
      };
      if (!params.epic_id) return { error: "epic_id required" };
      return apiCall(`/epics/${params.epic_id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: params.name,
          description: params.description,
          color: params.color,
          status: params.status,
          start_date: params.start_date,
          target_date: params.target_date,
        }),
      });
    }

    case "delete_epic": {
      const params = args as { epic_id: number };
      if (!params.epic_id) return { error: "epic_id required" };
      return apiCall(`/epics/${params.epic_id}`, { method: "DELETE" });
    }

    // Sprint Tools
    case "list_sprints": {
      const params = args as { project_id?: number; status?: string };
      const projectId = isIsolated ? context.project_id : params.project_id;
      if (!projectId) return { error: "project_id required" };
      const queryParams = params.status ? `?status=${params.status}` : '';
      return apiCall(`/projects/${projectId}/sprints${queryParams}`);
    }

    case "create_sprint": {
      const params = args as {
        project_id?: number;
        title?: string;
        name?: string;
        goal?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        velocity?: number;
        capacity?: number;
      };
      const projectId = isIsolated ? context.project_id : params.project_id;
      if (!projectId) return { error: "project_id required" };

      // Accept either 'title' or 'name' parameter, prefer 'title' for consistency with create_task
      const sprintName = params.title || params.name;
      if (!sprintName) return { error: "Either 'title' or 'name' parameter is required" };

      return apiCall(`/projects/${projectId}/sprints`, {
        method: "POST",
        body: JSON.stringify({
          name: sprintName,
          goal: params.goal,
          status: params.status || 'planned',
          start_date: params.start_date,
          end_date: params.end_date,
          velocity: params.velocity,
          capacity: params.capacity,
        }),
      });
    }

    case "update_sprint": {
      const params = args as {
        sprint_id: number;
        name?: string;
        goal?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        velocity?: number;
      };
      if (!params.sprint_id) return { error: "sprint_id required" };
      return apiCall(`/sprints/${params.sprint_id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: params.name,
          goal: params.goal,
          status: params.status,
          start_date: params.start_date,
          end_date: params.end_date,
          velocity: params.velocity,
        }),
      });
    }

    case "delete_sprint": {
      const params = args as { sprint_id: number };
      if (!params.sprint_id) return { error: "sprint_id required" };
      return apiCall(`/sprints/${params.sprint_id}`, { method: "DELETE" });
    }

    // Memory Tools
    case "memory_create": {
      const params = (args as unknown) as MemoryCreateParams;
      return apiCall("/memories", {
        method: "POST",
        body: JSON.stringify({
          content: params.content,
          summary: params.summary || params.content.substring(0, 200),
          tags: JSON.stringify(params.tags || []),
          metadata: JSON.stringify(params.metadata || {}),
          importance: params.importance || 0.5,
          project_id: isIsolated ? context.project_id : (params.project_id || projectId),
        }),
      });
    }

    case "memory_list": {
      const params = (args as unknown) as MemoryListParams | undefined;
      const memParams: string[] = [];
      if (isIsolated) {
        memParams.push(`project_id=${context.project_id}`);
      }
      if (params?.query) memParams.push(`query=${encodeURIComponent(params.query)}`);
      if (params?.tags) memParams.push(`tags=${encodeURIComponent(JSON.stringify(params.tags))}`);
      if (params?.limit) memParams.push(`limit=${params.limit}`);
      if (params?.offset) memParams.push(`offset=${params.offset}`);
      if (params?.sort_by) memParams.push(`sort_by=${params.sort_by}`);
      const memEndpoint = `/memories${memParams.length ? '?' + memParams.join('&') : ''}`;
      return apiCall(memEndpoint);
    }

    case "memory_get": {
      const params = (args as unknown) as MemoryGetParams;
      return apiCall(`/memories/${params.memory_id}?track_access=true`);
    }

    case "memory_update": {
      const params = (args as unknown) as MemoryUpdateParams;
      const updatePayload: Record<string, unknown> = {};
      if (params.content !== undefined) updatePayload.content = params.content;
      if (params.summary !== undefined) updatePayload.summary = params.summary;
      if (params.tags !== undefined) updatePayload.tags = JSON.stringify(params.tags);
      if (params.metadata !== undefined) updatePayload.metadata = JSON.stringify(params.metadata);
      if (params.importance !== undefined) updatePayload.importance = params.importance;
      return apiCall(`/memories/${params.memory_id}`, {
        method: "PUT",
        body: JSON.stringify(updatePayload),
      });
    }

    case "memory_delete": {
      const params = (args as unknown) as MemoryDeleteParams;
      return apiCall(`/memories/${params.memory_id}`, { method: "DELETE" });
    }

    case "memory_search": {
      const params = (args as unknown) as MemorySearchParams;
      const searchParams = [`query=${encodeURIComponent(params.query)}`];
      if (isIsolated) searchParams.push(`project_id=${context.project_id}`);
      if (params.tags) searchParams.push(`tags=${encodeURIComponent(JSON.stringify(params.tags))}`);
      if (params.min_importance) searchParams.push(`min_importance=${params.min_importance}`);
      if (params.limit) searchParams.push(`limit=${params.limit}`);
      return apiCall(`/memories/search?${searchParams.join('&')}`);
    }

    case "memory_tags":
      return apiCall("/memories/tags");

    case "memory_stats": {
      const statsParams = isIsolated ? `?project_id=${context.project_id}` : '';
      return apiCall(`/memories/stats${statsParams}`);
    }

    case "memory_boost": {
      const params = (args as unknown) as MemoryBoostParams;
      const boostAmount = Math.min(params.boost_amount || 0.1, 0.5);
      return apiCall(`/memories/${params.memory_id}/boost`, {
        method: "POST",
        body: JSON.stringify({ boost_amount: boostAmount }),
      });
    }

    case "memory_related": {
      const params = (args as unknown) as MemoryRelatedParams;
      const relParams = params.relationship_type ? `?type=${params.relationship_type}` : '';
      return apiCall(`/memories/${params.memory_id}/related${relParams}`);
    }

    case "memory_link": {
      const params = (args as unknown) as MemoryLinkParams;
      return apiCall("/memories/crossrefs", {
        method: "POST",
        body: JSON.stringify({
          source_memory_id: params.source_id,
          target_memory_id: params.target_id,
          relationship_type: params.relationship_type || "related",
        }),
      });
    }

    case "memory_semantic_search": {
      const params = (args as unknown) as MemorySemanticSearchParams;
      const searchParams = [`query=${encodeURIComponent(params.query)}`];
      if (isIsolated) searchParams.push(`project_id=${context.project_id}`);
      if (params.min_similarity !== undefined) searchParams.push(`min_similarity=${params.min_similarity}`);
      if (params.limit !== undefined) searchParams.push(`limit=${params.limit}`);
      if (params.include_fulltext !== undefined) searchParams.push(`include_fulltext=${params.include_fulltext}`);
      return apiCall(`/memories/semantic-search?${searchParams.join('&')}`);
    }

    // ============================================================================
    // Task Dependency Tools (DFN-007, DFN-008, DFN-004)
    // ============================================================================

    case "add_dependency":
      return addDependency.execute(args);

    case "remove_dependency":
      return removeDependency.execute(args);

    case "get_dependencies":
      return getDependencies.execute(args);

    case "detect_dependency_cycles":
      return detectDependencyCycles.execute(args);

    case "get_blocked_tasks":
      return getBlockedTasks.execute(args);

    case "get_dependency_tree":
      return getDependencyTree.execute(args);

    case "get_ready_tasks":
      return getReadyTasks.execute(args);

    // ============================================================================
    // System Health & Stats (DFN-003, DFN-005)
    // ============================================================================

    case "get_health":
      return getHealth.execute(args);

    case "get_stats":
      return getStats.execute(args);

    // ============================================================================
    // Inline Documents (DFN-006)
    // ============================================================================

    case "create_inline_document":
      return createInlineDocument.execute(args);

    case "get_inline_document":
      return getInlineDocument.execute(args);

    case "list_inline_documents":
      return listInlineDocuments.execute(args);

    case "update_inline_document":
      return updateInlineDocument.execute(args);

    case "delete_inline_document":
      return deleteInlineDocument.execute(args);

    case "search_documents":
      return searchDocuments.execute(args);

    // ============================================================================
    // Agent Execution Tools (BullMQ Job Management) - DFO-189
    // ============================================================================

    case "queue_agent_job":
      return queueAgentJobTool.execute(args);

    case "get_agent_job_status":
      return getAgentJobStatusTool.execute(args);

    case "cancel_agent_job":
      return cancelAgentJobTool.execute(args);

    case "list_active_agent_jobs":
      return listActiveAgentJobsTool.execute(args);

    // ============================================================================
    // GitHub Actions Integration Tools (SLR-011 - DFO-206 Pattern)
    // ============================================================================

    case "github_trigger_workflow":
      return githubTriggerWorkflowTool.execute(args);

    case "github_get_workflow_status":
      return githubGetWorkflowStatusTool.execute(args);

    case "github_create_issue":
      return githubCreateIssueTool.execute(args);

    case "github_create_pr":
      return githubCreatePRTool.execute(args);

    case "github_create_pr_from_task":
      return githubCreatePRFromTaskTool.execute(args);

    case "proxy_external_tool":
      return proxyExternalTool((args as unknown) as { server_name: string; tool_name: string; parameters?: Record<string, unknown> });

    case "list_external_tools":
      return listExternalTools((args as unknown) as { server_name: string });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ============================================================================
// Resource Reading with Project Isolation
// ============================================================================

export async function readResource(
  uri: string,
  apiCall: ApiCallFunction,
  context: MCPContext = {}
): Promise<unknown> {
  const isIsolated = Boolean(context.project_id && !context.adminMode);

  switch (uri) {
    case "solaria://dashboard/overview":
      if (isIsolated) {
        const [project, tasks] = await Promise.all([
          apiCall(`/projects/${context.project_id}`) as Promise<Project>,
          apiCall(`/tasks?project_id=${context.project_id}`) as Promise<Task[]>,
        ]);
        return {
          project,
          tasks_count: (tasks || []).length,
          isolation_mode: true,
          project_id: context.project_id,
        };
      }
      return apiCall("/dashboard/overview");

    case "solaria://projects/list":
      if (isIsolated) {
        const project = await apiCall(`/projects/${context.project_id}`);
        return [project];
      }
      return apiCall("/projects");

    case "solaria://tasks/list":
      if (isIsolated) {
        return apiCall(`/tasks?project_id=${context.project_id}`);
      }
      return apiCall("/tasks");

    case "solaria://agents/list":
      return apiCall("/agents");

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}
