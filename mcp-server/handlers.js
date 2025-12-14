/**
 * SOLARIA Dashboard MCP Handlers
 * Shared handlers for both stdio and HTTP transports
 */

// Tool definitions (shared between transports)
export const toolDefinitions = [
  // Session Context Tool (MUST be called first)
  {
    name: "set_project_context",
    description: "IMPORTANT: Call this FIRST when starting work on a project. Sets the project context for this session to enable project isolation. You can identify the project by name or ID.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: {
          type: "string",
          description: "Project name (e.g., 'PRILABSA Website', 'Akademate'). Will search for matching project.",
        },
        project_id: {
          type: "number",
          description: "Project ID if known",
        },
        working_directory: {
          type: "string",
          description: "Current working directory path (helps identify project)",
        },
      },
    },
  },
  {
    name: "get_current_context",
    description: "Get the current session context including which project you are isolated to",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // Dashboard Tools
  {
    name: "get_dashboard_overview",
    description: "Get the executive dashboard overview with KPIs, project metrics, agent status, and task summaries",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_dashboard_alerts",
    description: "Get all active alerts from the dashboard",
    inputSchema: {
      type: "object",
      properties: {
        severity: {
          type: "string",
          enum: ["critical", "warning", "info"],
          description: "Filter alerts by severity level",
        },
      },
    },
  },

  // Project Tools
  {
    name: "list_projects",
    description: "List all projects in the SOLARIA system",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_project",
    description: "Get detailed information about a specific project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "number",
          description: "The project ID",
        },
      },
    },
  },
  {
    name: "create_project",
    description: "Create a new project in the SOLARIA system",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        client: { type: "string", description: "Client name" },
        description: { type: "string", description: "Project description" },
        budget: { type: "number", description: "Project budget in dollars" },
        deadline: { type: "string", description: "Project deadline (YYYY-MM-DD)" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_project",
    description: "Update project information like budget, deadline, or status",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID to update" },
        name: { type: "string", description: "Project name" },
        description: { type: "string", description: "Project description" },
        status: {
          type: "string",
          enum: ["planning", "development", "testing", "deployment", "completed", "on_hold", "cancelled"],
        },
        budget: { type: "number", description: "Project budget in dollars" },
        deadline: { type: "string", description: "Project deadline (YYYY-MM-DD)" },
      },
      required: ["project_id"],
    },
  },

  // Task Tools
  {
    name: "list_tasks",
    description: "List all tasks, optionally filtered by status, priority, or project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Filter by project ID" },
        status: {
          type: "string",
          enum: ["pending", "in_progress", "completed", "blocked"],
          description: "Filter by task status",
        },
        priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
          description: "Filter by priority",
        },
        agent_id: {
          type: "number",
          description: "Filter by assigned agent ID",
        },
      },
    },
  },
  {
    name: "get_task",
    description: "Get detailed information about a specific task",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID" },
      },
      required: ["task_id"],
    },
  },
  {
    name: "create_task",
    description: "Create a new task in a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID (required for remote clients)" },
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description" },
        priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
          description: "Task priority",
        },
        status: {
          type: "string",
          enum: ["pending", "in_progress"],
          description: "Initial task status",
        },
        estimated_hours: { type: "number", description: "Estimated hours" },
        assigned_agent_id: { type: "number", description: "ID of agent to assign" },
      },
      required: ["title", "project_id"],
    },
  },
  {
    name: "update_task",
    description: "Update an existing task (status, priority, progress, or assignment)",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID to update" },
        title: { type: "string" },
        description: { type: "string" },
        status: {
          type: "string",
          enum: ["pending", "in_progress", "completed", "blocked"],
        },
        priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
        },
        progress: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Progress percentage (0-100)",
        },
        assigned_agent_id: { type: "number", description: "Reassign to agent" },
      },
      required: ["task_id"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed with 100% progress",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID to complete" },
        completion_notes: { type: "string", description: "Notes about what was done" },
      },
      required: ["task_id"],
    },
  },

  // Agent Tools
  {
    name: "list_agents",
    description: "List all SOLARIA AI agents and their current status",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["active", "busy", "inactive"],
          description: "Filter by agent status",
        },
        role: {
          type: "string",
          description: "Filter by role (e.g., developer, architect, tester)",
        },
      },
    },
  },
  {
    name: "get_agent",
    description: "Get detailed information about a specific agent including their assigned tasks",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "number", description: "Agent ID" },
      },
      required: ["agent_id"],
    },
  },
  {
    name: "get_agent_tasks",
    description: "Get all tasks assigned to a specific agent",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "number", description: "Agent ID" },
      },
      required: ["agent_id"],
    },
  },
  {
    name: "update_agent_status",
    description: "Update an agent's status",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "number", description: "Agent ID" },
        status: {
          type: "string",
          enum: ["active", "busy", "inactive", "error", "maintenance"],
        },
      },
      required: ["agent_id", "status"],
    },
  },

  // Logs Tools
  {
    name: "get_activity_logs",
    description: "Get recent activity logs from the system",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of logs to retrieve (default: 50)" },
        level: {
          type: "string",
          enum: ["info", "warning", "error", "critical"],
          description: "Filter by log level",
        },
        project_id: { type: "number", description: "Filter by project ID" },
      },
    },
  },
  {
    name: "log_activity",
    description: "Log an activity to the system",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "Action description" },
        level: {
          type: "string",
          enum: ["info", "warning", "error"],
          default: "info",
        },
        category: { type: "string", description: "Activity category" },
        agent_id: { type: "number", description: "Agent performing the action" },
        project_id: { type: "number", description: "Related project ID" },
      },
      required: ["action"],
    },
  },

  // Docs Tools
  {
    name: "list_docs",
    description: "List all project documentation files",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Filter by project ID" },
      },
    },
  },

  // ============================================================================
  // MEMORY TOOLS (Integrated from Memora)
  // Persistent agent memory with full-text search and cross-references
  // ============================================================================
  {
    name: "memory_create",
    description: "Create a new memory entry. Use this to store important information, decisions, context, or learnings that should persist across sessions.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The memory content (text, notes, code snippets, decisions, etc.)" },
        summary: { type: "string", description: "Optional short summary (max 500 chars) for quick reference" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for categorization (e.g., ['decision', 'architecture', 'bug'])",
        },
        metadata: {
          type: "object",
          description: "Additional metadata (e.g., {source: 'meeting', priority: 'high'})",
        },
        importance: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Importance score 0-1 (default: 0.5). Higher = more relevant in searches",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "memory_list",
    description: "List memories with optional filters. Returns memories sorted by importance and recency.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Text search query (searches content and summary)" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter by tags (returns memories with ANY of these tags)",
        },
        limit: { type: "number", description: "Max results to return (default: 20)" },
        offset: { type: "number", description: "Skip first N results (for pagination)" },
        sort_by: {
          type: "string",
          enum: ["importance", "created_at", "updated_at", "access_count"],
          description: "Sort order (default: importance)",
        },
      },
    },
  },
  {
    name: "memory_get",
    description: "Get a specific memory by ID. Also increments access count and updates last_accessed.",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "number", description: "Memory ID to retrieve" },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "memory_update",
    description: "Update an existing memory. Only provided fields are updated.",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "number", description: "Memory ID to update" },
        content: { type: "string", description: "New content" },
        summary: { type: "string", description: "New summary" },
        tags: { type: "array", items: { type: "string" }, description: "New tags (replaces existing)" },
        metadata: { type: "object", description: "New metadata (merged with existing)" },
        importance: { type: "number", minimum: 0, maximum: 1, description: "New importance score" },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "memory_delete",
    description: "Delete a memory by ID. This also removes all cross-references.",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "number", description: "Memory ID to delete" },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "memory_search",
    description: "Search memories using full-text search. More powerful than memory_list for finding specific information.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (uses MySQL FULLTEXT BOOLEAN MODE)" },
        tags: { type: "array", items: { type: "string" }, description: "Filter by tags" },
        min_importance: { type: "number", minimum: 0, maximum: 1, description: "Minimum importance score" },
        limit: { type: "number", description: "Max results (default: 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "memory_tags",
    description: "List all available memory tags with descriptions and usage counts",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "memory_stats",
    description: "Get statistics about stored memories (counts, top tags, recent activity)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "memory_boost",
    description: "Boost a memory's importance score. Use when a memory proves particularly useful.",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "number", description: "Memory ID to boost" },
        boost_amount: { type: "number", description: "Amount to add (default: 0.1, max: 0.5)" },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "memory_related",
    description: "Get memories related to a specific memory via cross-references",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "number", description: "Memory ID to find relations for" },
        relationship_type: {
          type: "string",
          enum: ["related", "depends_on", "contradicts", "supersedes", "child_of"],
          description: "Filter by relationship type",
        },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "memory_link",
    description: "Create a cross-reference link between two memories",
    inputSchema: {
      type: "object",
      properties: {
        source_id: { type: "number", description: "Source memory ID" },
        target_id: { type: "number", description: "Target memory ID" },
        relationship_type: {
          type: "string",
          enum: ["related", "depends_on", "contradicts", "supersedes", "child_of"],
          description: "Type of relationship (default: related)",
        },
      },
      required: ["source_id", "target_id"],
    },
  },
];

// Resource definitions
export const resourceDefinitions = [
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

/**
 * Create an API client for the Dashboard
 */
export function createApiClient(dashboardUrl, credentials = {}) {
  let authToken = null;
  const { user, password } = credentials;

  async function authenticate() {
    const response = await fetch(`${dashboardUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user, password }),
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data = await response.json();
    authToken = data.token;
    return data;
  }

  async function apiCall(endpoint, options = {}) {
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

  return { apiCall, authenticate };
}

/**
 * Execute a tool call with PROJECT ISOLATION
 * @param {string} name - Tool name
 * @param {object} args - Tool arguments
 * @param {function} apiCall - API call function
 * @param {object} context - Context with project_id for isolation
 *
 * ISOLATION RULES:
 * - When context.project_id is set, agent can ONLY access that project's data
 * - list_projects → Returns only the assigned project
 * - list_tasks → Always filtered by project_id
 * - get_task → Validates task belongs to project
 * - create_task → Forces project_id from context
 * - Admin mode (context.adminMode=true) bypasses isolation
 */
export async function executeTool(name, args, apiCall, context = {}) {
  // Determine if strict project isolation is active
  const isIsolated = context.project_id && !context.adminMode;
  const projectId = context.project_id || args?.project_id;

  // Helper to validate task belongs to context project
  async function validateTaskProject(taskId) {
    if (!isIsolated) return true;
    const task = await apiCall(`/tasks/${taskId}`);
    if (task.project_id !== context.project_id) {
      throw new Error(`ACCESS DENIED: Task #${taskId} does not belong to your project`);
    }
    return true;
  }

  switch (name) {
    // Session Context Management
    case "set_project_context": {
      // Find project by name or ID
      let targetProject = null;

      if (args.project_id) {
        targetProject = await apiCall(`/projects/${args.project_id}`);
      } else if (args.project_name) {
        // Search for project by name
        const allProjects = await apiCall("/projects");
        const projects = allProjects.projects || allProjects || [];

        // Try exact match first
        targetProject = projects.find(p =>
          p.name.toLowerCase() === args.project_name.toLowerCase()
        );

        // Try partial match
        if (!targetProject) {
          targetProject = projects.find(p =>
            p.name.toLowerCase().includes(args.project_name.toLowerCase()) ||
            args.project_name.toLowerCase().includes(p.name.toLowerCase())
          );
        }
      } else if (args.working_directory) {
        // Try to match by directory name
        const dirName = args.working_directory.split('/').pop().toLowerCase();
        const allProjects = await apiCall("/projects");
        const projects = allProjects.projects || allProjects || [];

        targetProject = projects.find(p =>
          p.name.toLowerCase().includes(dirName) ||
          dirName.includes(p.name.toLowerCase().replace(/\s+/g, '-'))
        );
      }

      if (!targetProject) {
        // List available projects to help
        const allProjects = await apiCall("/projects");
        const projects = allProjects.projects || allProjects || [];
        return {
          success: false,
          error: "Project not found",
          available_projects: projects.map(p => ({ id: p.id, name: p.name })),
          hint: "Use set_project_context with project_id or exact project_name",
        };
      }

      // Return special action to update session
      return {
        __action: "SET_PROJECT_CONTEXT",
        success: true,
        project_id: targetProject.id || targetProject.project?.id,
        project_name: targetProject.name || targetProject.project?.name,
        message: `Context set to project: ${targetProject.name || targetProject.project?.name} (ID: ${targetProject.id || targetProject.project?.id}). All subsequent operations will be isolated to this project.`,
      };
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

    // Dashboard - Returns project-specific metrics when isolated
    case "get_dashboard_overview":
      if (isIsolated) {
        // Return project-specific overview
        const [project, allTasks] = await Promise.all([
          apiCall(`/projects/${context.project_id}`),
          apiCall(`/tasks?project_id=${context.project_id}`),
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

    case "get_dashboard_alerts":
      if (isIsolated) {
        const alerts = await apiCall(`/dashboard/alerts${args?.severity ? `?severity=${args.severity}` : ""}`);
        // Filter alerts to only show project-related ones
        return (alerts || []).filter(a => !a.project_id || a.project_id === context.project_id);
      }
      return apiCall(`/dashboard/alerts${args?.severity ? `?severity=${args.severity}` : ""}`);

    // Projects - STRICT ISOLATION
    case "list_projects":
      if (isIsolated) {
        // Only return the assigned project
        const project = await apiCall(`/projects/${context.project_id}`);
        return [project];
      }
      return apiCall("/projects");

    case "get_project":
      if (!args?.project_id && !projectId) {
        throw new Error("project_id is required");
      }
      const requestedProjectId = args?.project_id || projectId;
      // ISOLATION: Can only access own project
      if (isIsolated && requestedProjectId !== context.project_id) {
        throw new Error(`ACCESS DENIED: Cannot access project #${requestedProjectId}. You are isolated to project #${context.project_id}`);
      }
      return apiCall(`/projects/${requestedProjectId}`);

    case "create_project":
      // ISOLATION: Cannot create new projects when isolated
      if (isIsolated) {
        throw new Error("ACCESS DENIED: Cannot create new projects in isolated mode. Use the dashboard for project management.");
      }
      return apiCall("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: args.name,
          client: args.client || "External Client",
          description: args.description || "",
          budget: args.budget || 0,
          deadline: args.deadline,
          status: "planning",
          priority: "medium",
        }),
      });

    case "update_project":
      // ISOLATION: Can only update own project
      if (isIsolated && args.project_id !== context.project_id) {
        throw new Error(`ACCESS DENIED: Cannot update project #${args.project_id}. You are isolated to project #${context.project_id}`);
      }
      return apiCall(`/projects/${args.project_id}`, {
        method: "PUT",
        body: JSON.stringify(args),
      });

    // Tasks - STRICT ISOLATION
    case "list_tasks": {
      let endpoint = "/tasks";
      const params = [];
      // ISOLATION: Always filter by context project_id
      if (isIsolated) {
        params.push(`project_id=${context.project_id}`);
        // Ignore any attempt to query other projects
        if (args?.project_id && args.project_id !== context.project_id) {
          console.warn(`[ISOLATION] Blocked attempt to list tasks from project #${args.project_id}`);
        }
      } else if (args?.project_id || projectId) {
        params.push(`project_id=${args?.project_id || projectId}`);
      }
      if (args?.status) params.push(`status=${args.status}`);
      if (args?.priority) params.push(`priority=${args.priority}`);
      if (args?.agent_id) params.push(`agent_id=${args.agent_id}`);
      if (params.length) endpoint += `?${params.join("&")}`;
      return apiCall(endpoint);
    }

    case "get_task":
      // ISOLATION: Validate task belongs to project before returning
      await validateTaskProject(args.task_id);
      return apiCall(`/tasks/${args.task_id}`);

    case "create_task":
      // ISOLATION: Force project_id from context
      if (isIsolated) {
        if (args.project_id && args.project_id !== context.project_id) {
          throw new Error(`ACCESS DENIED: Cannot create tasks in project #${args.project_id}. You are isolated to project #${context.project_id}`);
        }
        return apiCall("/tasks", {
          method: "POST",
          body: JSON.stringify({
            ...args,
            project_id: context.project_id, // Force context project
            status: args.status || "pending",
            priority: args.priority || "medium",
          }),
        });
      }
      if (!args.project_id && !projectId) {
        throw new Error("project_id is required for creating tasks");
      }
      return apiCall("/tasks", {
        method: "POST",
        body: JSON.stringify({
          ...args,
          project_id: args.project_id || projectId,
          status: args.status || "pending",
          priority: args.priority || "medium",
        }),
      });

    case "update_task":
      // ISOLATION: Validate task belongs to project
      await validateTaskProject(args.task_id);
      return apiCall(`/tasks/${args.task_id}`, {
        method: "PUT",
        body: JSON.stringify(args),
      });

    case "complete_task":
      // ISOLATION: Validate task belongs to project
      await validateTaskProject(args.task_id);
      return apiCall(`/tasks/${args.task_id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "completed",
          progress: 100,
          completion_notes: args.completion_notes,
        }),
      });

    // Agents
    case "list_agents": {
      let agents = await apiCall("/agents");
      if (args?.status) {
        agents = agents.filter((a) => a.status === args.status);
      }
      if (args?.role) {
        agents = agents.filter((a) => a.role === args.role);
      }
      return agents;
    }

    case "get_agent":
      return apiCall(`/agents/${args.agent_id}`);

    case "get_agent_tasks": {
      const tasks = await apiCall("/tasks");
      return tasks.filter((t) => t.assigned_agent_id === args.agent_id);
    }

    case "update_agent_status":
      return apiCall(`/agents/${args.agent_id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: args.status }),
      });

    // Logs - ISOLATED
    case "get_activity_logs": {
      const limit = args?.limit || 50;
      const level = args?.level ? `&level=${args.level}` : "";
      // ISOLATION: Force project filter
      const project = isIsolated
        ? `&project_id=${context.project_id}`
        : args?.project_id ? `&project_id=${args.project_id}` : "";
      return apiCall(`/logs?limit=${limit}${level}${project}`);
    }

    case "log_activity":
      // ISOLATION: Force project_id from context
      return apiCall("/logs", {
        method: "POST",
        body: JSON.stringify({
          ...args,
          project_id: isIsolated ? context.project_id : (args.project_id || projectId),
        }),
      });

    // Docs - ISOLATED
    case "list_docs":
      if (isIsolated) {
        // Filter docs by project
        const allDocs = await apiCall("/docs/list");
        return (allDocs || []).filter(d => d.project_id === context.project_id);
      }
      return apiCall("/docs/list");

    // ========================================================================
    // MEMORY TOOLS - Project Isolated
    // ========================================================================
    case "memory_create":
      return apiCall("/memories", {
        method: "POST",
        body: JSON.stringify({
          content: args.content,
          summary: args.summary || args.content.substring(0, 200),
          tags: JSON.stringify(args.tags || []),
          metadata: JSON.stringify(args.metadata || {}),
          importance: args.importance || 0.5,
          project_id: isIsolated ? context.project_id : (args.project_id || projectId),
        }),
      });

    case "memory_list": {
      const memParams = [];
      if (isIsolated) {
        memParams.push(`project_id=${context.project_id}`);
      }
      if (args?.query) memParams.push(`query=${encodeURIComponent(args.query)}`);
      if (args?.tags) memParams.push(`tags=${encodeURIComponent(JSON.stringify(args.tags))}`);
      if (args?.limit) memParams.push(`limit=${args.limit}`);
      if (args?.offset) memParams.push(`offset=${args.offset}`);
      if (args?.sort_by) memParams.push(`sort_by=${args.sort_by}`);
      const memEndpoint = `/memories${memParams.length ? '?' + memParams.join('&') : ''}`;
      return apiCall(memEndpoint);
    }

    case "memory_get":
      // Get and track access
      return apiCall(`/memories/${args.memory_id}?track_access=true`);

    case "memory_update":
      const updatePayload = {};
      if (args.content !== undefined) updatePayload.content = args.content;
      if (args.summary !== undefined) updatePayload.summary = args.summary;
      if (args.tags !== undefined) updatePayload.tags = JSON.stringify(args.tags);
      if (args.metadata !== undefined) updatePayload.metadata = JSON.stringify(args.metadata);
      if (args.importance !== undefined) updatePayload.importance = args.importance;
      return apiCall(`/memories/${args.memory_id}`, {
        method: "PUT",
        body: JSON.stringify(updatePayload),
      });

    case "memory_delete":
      return apiCall(`/memories/${args.memory_id}`, { method: "DELETE" });

    case "memory_search": {
      const searchParams = [`query=${encodeURIComponent(args.query)}`];
      if (isIsolated) searchParams.push(`project_id=${context.project_id}`);
      if (args?.tags) searchParams.push(`tags=${encodeURIComponent(JSON.stringify(args.tags))}`);
      if (args?.min_importance) searchParams.push(`min_importance=${args.min_importance}`);
      if (args?.limit) searchParams.push(`limit=${args.limit}`);
      return apiCall(`/memories/search?${searchParams.join('&')}`);
    }

    case "memory_tags":
      return apiCall("/memories/tags");

    case "memory_stats": {
      const statsParams = isIsolated ? `?project_id=${context.project_id}` : '';
      return apiCall(`/memories/stats${statsParams}`);
    }

    case "memory_boost":
      const boostAmount = Math.min(args.boost_amount || 0.1, 0.5);
      return apiCall(`/memories/${args.memory_id}/boost`, {
        method: "POST",
        body: JSON.stringify({ boost_amount: boostAmount }),
      });

    case "memory_related":
      const relParams = args.relationship_type ? `?type=${args.relationship_type}` : '';
      return apiCall(`/memories/${args.memory_id}/related${relParams}`);

    case "memory_link":
      return apiCall("/memories/crossrefs", {
        method: "POST",
        body: JSON.stringify({
          source_memory_id: args.source_id,
          target_memory_id: args.target_id,
          relationship_type: args.relationship_type || "related",
        }),
      });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Read a resource with PROJECT ISOLATION
 * @param {string} uri - Resource URI
 * @param {function} apiCall - API call function
 * @param {object} context - Context with project_id for isolation
 */
export async function readResource(uri, apiCall, context = {}) {
  const isIsolated = context.project_id && !context.adminMode;

  switch (uri) {
    case "solaria://dashboard/overview":
      if (isIsolated) {
        const [project, tasks] = await Promise.all([
          apiCall(`/projects/${context.project_id}`),
          apiCall(`/tasks?project_id=${context.project_id}`),
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
