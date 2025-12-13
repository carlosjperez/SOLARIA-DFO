/**
 * SOLARIA Dashboard MCP Handlers
 * Shared handlers for both stdio and HTTP transports
 */

// Tool definitions (shared between transports)
export const toolDefinitions = [
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
 * Execute a tool call
 * @param {string} name - Tool name
 * @param {object} args - Tool arguments
 * @param {function} apiCall - API call function
 * @param {object} context - Optional context (project_id, etc.)
 */
export async function executeTool(name, args, apiCall, context = {}) {
  // Use context project_id if not provided in args
  const projectId = args?.project_id || context.project_id;

  switch (name) {
    // Dashboard
    case "get_dashboard_overview":
      return apiCall("/dashboard/overview");

    case "get_dashboard_alerts":
      return apiCall(`/dashboard/alerts${args?.severity ? `?severity=${args.severity}` : ""}`);

    // Projects
    case "list_projects":
      return apiCall("/projects");

    case "get_project":
      if (!args?.project_id && !projectId) {
        throw new Error("project_id is required");
      }
      return apiCall(`/projects/${args?.project_id || projectId}`);

    case "create_project":
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
      return apiCall(`/projects/${args.project_id}`, {
        method: "PUT",
        body: JSON.stringify(args),
      });

    // Tasks
    case "list_tasks": {
      let endpoint = "/tasks";
      const params = [];
      if (args?.project_id || projectId) params.push(`project_id=${args?.project_id || projectId}`);
      if (args?.status) params.push(`status=${args.status}`);
      if (args?.priority) params.push(`priority=${args.priority}`);
      if (args?.agent_id) params.push(`agent_id=${args.agent_id}`);
      if (params.length) endpoint += `?${params.join("&")}`;
      return apiCall(endpoint);
    }

    case "get_task":
      return apiCall(`/tasks/${args.task_id}`);

    case "create_task":
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
      return apiCall(`/tasks/${args.task_id}`, {
        method: "PUT",
        body: JSON.stringify(args),
      });

    case "complete_task":
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

    // Logs
    case "get_activity_logs": {
      const limit = args?.limit || 50;
      const level = args?.level ? `&level=${args.level}` : "";
      const project = args?.project_id ? `&project_id=${args.project_id}` : "";
      return apiCall(`/logs?limit=${limit}${level}${project}`);
    }

    case "log_activity":
      return apiCall("/logs", {
        method: "POST",
        body: JSON.stringify({
          ...args,
          project_id: args.project_id || projectId,
        }),
      });

    // Docs
    case "list_docs":
      return apiCall("/docs/list");

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Read a resource
 * @param {string} uri - Resource URI
 * @param {function} apiCall - API call function
 */
export async function readResource(uri, apiCall) {
  switch (uri) {
    case "solaria://dashboard/overview":
      return apiCall("/dashboard/overview");
    case "solaria://projects/list":
      return apiCall("/projects");
    case "solaria://tasks/list":
      return apiCall("/tasks");
    case "solaria://agents/list":
      return apiCall("/agents");
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}
