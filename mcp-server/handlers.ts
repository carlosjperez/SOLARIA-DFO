/**
 * SOLARIA Dashboard MCP Handlers
 * Shared handlers for both stdio and HTTP transports
 *
 * @module handlers
 */

import type {
  MCPToolDefinition,
  MCPResource,
  MCPContext,
  ApiCallFunction,
  ApiCredentials,
  ApiClient,
  SetProjectContextParams,
  GetDashboardAlertsParams,
  GetProjectParams,
  CreateProjectParams,
  UpdateProjectParams,
  ListTasksParams,
  GetTaskParams,
  CreateTaskParams,
  UpdateTaskParams,
  CompleteTaskParams,
  DeleteTaskParams,
  ListTaskItemsParams,
  CreateTaskItemsParams,
  CompleteTaskItemParams,
  UpdateTaskItemParams,
  DeleteTaskItemParams,
  ListAgentsParams,
  GetAgentParams,
  GetAgentTasksParams,
  UpdateAgentStatusParams,
  GetActivityLogsParams,
  LogActivityParams,
  ListDocsParams,
  GetProjectClientParams,
  UpdateProjectClientParams,
  GetProjectDocumentsParams,
  CreateProjectDocumentParams,
  GetProjectRequestsParams,
  CreateProjectRequestParams,
  UpdateProjectRequestParams,
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
} from './types.js';

import type {
  Project,
  Task,
  TaskItem,
  Agent,
  Alert,
} from './types/database.js';

// ============================================================================
// Tool Definitions
// ============================================================================

export const toolDefinitions: MCPToolDefinition[] = [
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
  {
    name: "delete_task",
    description: "Permanently delete a task and all its associated items (subtasks, tags). Use with caution.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID to delete" },
      },
      required: ["task_id"],
    },
  },

  // Task Items (Subtasks/Checklist) Tools
  {
    name: "list_task_items",
    description: "Get all checklist/subtask items for a task. Use this to see the detailed breakdown of work.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID to get items for" },
        include_completed: { type: "boolean", description: "Include completed items (default: true)" },
      },
      required: ["task_id"],
    },
  },
  {
    name: "create_task_items",
    description: "Create subtask/checklist items for a task. IMPORTANT: Use this when you start working on a task to break it down into granular steps. This enables progress tracking and context persistence.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID to add items to" },
        items: {
          type: "array",
          description: "Array of items to create",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Item title (what needs to be done)" },
              description: { type: "string", description: "Optional detailed description" },
              estimated_minutes: { type: "number", description: "Estimated time in minutes" },
            },
          },
        },
      },
      required: ["task_id", "items"],
    },
  },
  {
    name: "complete_task_item",
    description: "Mark a checklist item as completed. This automatically updates the parent task's progress percentage.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID" },
        item_id: { type: "number", description: "Item ID to mark as completed" },
        notes: { type: "string", description: "Optional completion notes" },
        actual_minutes: { type: "number", description: "Actual time spent in minutes" },
      },
      required: ["task_id", "item_id"],
    },
  },
  {
    name: "update_task_item",
    description: "Update a checklist item's details (title, description, completion status)",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID" },
        item_id: { type: "number", description: "Item ID to update" },
        title: { type: "string", description: "New title" },
        description: { type: "string", description: "New description" },
        is_completed: { type: "boolean", description: "Completion status" },
        notes: { type: "string", description: "Notes" },
      },
      required: ["task_id", "item_id"],
    },
  },
  {
    name: "delete_task_item",
    description: "Delete a checklist item from a task",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "number", description: "Task ID" },
        item_id: { type: "number", description: "Item ID to delete" },
      },
      required: ["task_id", "item_id"],
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

  // Project Extended Data Tools
  {
    name: "get_project_client",
    description: "Get client information for a project (name, fiscal data, contact info)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "update_project_client",
    description: "Update or create client information for a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        name: { type: "string", description: "Client commercial name" },
        fiscal_name: { type: "string", description: "Client fiscal/legal name" },
        rfc: { type: "string", description: "Tax ID (RFC in Mexico)" },
        website: { type: "string", description: "Client website URL" },
        address: { type: "string", description: "Physical address" },
        contact_name: { type: "string", description: "Primary contact person" },
        contact_email: { type: "string", description: "Contact email" },
        contact_phone: { type: "string", description: "Contact phone" },
      },
      required: ["project_id", "name"],
    },
  },
  {
    name: "get_project_documents",
    description: "Get all documents associated with a project (specs, contracts, manuals, designs)",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "create_project_document",
    description: "Add a new document to a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        name: { type: "string", description: "Document name" },
        type: { type: "string", enum: ["spec", "contract", "manual", "design", "report", "other"], description: "Document type" },
        url: { type: "string", description: "Document URL" },
        description: { type: "string", description: "Document description" },
      },
      required: ["project_id", "name", "url"],
    },
  },
  {
    name: "get_project_requests",
    description: "Get all client requests/petitions for a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        status: { type: "string", enum: ["pending", "approved", "in_review", "in_progress", "completed", "rejected"], description: "Filter by status" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Filter by priority" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "create_project_request",
    description: "Create a new client request/petition for a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        text: { type: "string", description: "Request description" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Request priority" },
        requested_by: { type: "string", description: "Name of person who made the request" },
      },
      required: ["project_id", "text"],
    },
  },
  {
    name: "update_project_request",
    description: "Update a client request status or details",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        request_id: { type: "number", description: "Request ID" },
        status: { type: "string", enum: ["pending", "approved", "in_review", "in_progress", "completed", "rejected"], description: "New status" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "New priority" },
        notes: { type: "string", description: "Update notes" },
      },
      required: ["project_id", "request_id"],
    },
  },

  // Epic Tools
  {
    name: "list_epics",
    description: "List all epics for a project with task counts and progress",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        status: {
          type: "string",
          enum: ["open", "in_progress", "completed", "cancelled"],
          description: "Filter by epic status",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "create_epic",
    description: "Create a new epic for a project. Epics group related tasks into major features or milestones.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        name: { type: "string", description: "Epic name (min 3 chars, e.g., 'User Authentication')" },
        description: { type: "string", description: "Epic description" },
        color: { type: "string", description: "Color hex code (e.g., #6366f1)" },
        status: {
          type: "string",
          enum: ["open", "in_progress", "completed", "cancelled"],
          description: "Epic status (default: open)",
        },
        start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
        target_date: { type: "string", description: "Target completion date (YYYY-MM-DD)" },
      },
      required: ["project_id", "name"],
    },
  },
  {
    name: "update_epic",
    description: "Update an existing epic's details or status",
    inputSchema: {
      type: "object",
      properties: {
        epic_id: { type: "number", description: "Epic ID to update" },
        name: { type: "string", description: "New epic name" },
        description: { type: "string", description: "New description" },
        color: { type: "string", description: "New color hex code" },
        status: {
          type: "string",
          enum: ["open", "in_progress", "completed", "cancelled"],
        },
        start_date: { type: "string", description: "New start date" },
        target_date: { type: "string", description: "New target date" },
      },
      required: ["epic_id"],
    },
  },
  {
    name: "delete_epic",
    description: "Delete an epic. Tasks will have their epic_id set to NULL.",
    inputSchema: {
      type: "object",
      properties: {
        epic_id: { type: "number", description: "Epic ID to delete" },
      },
      required: ["epic_id"],
    },
  },

  // Sprint Tools
  {
    name: "list_sprints",
    description: "List all sprints for a project with task counts and velocity",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        status: {
          type: "string",
          enum: ["planned", "active", "completed", "cancelled"],
          description: "Filter by sprint status",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "create_sprint",
    description: "Create a new sprint for a project. Sprints are time-boxed iterations for completing tasks.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "number", description: "Project ID" },
        name: { type: "string", description: "Sprint name (min 3 chars, e.g., 'Sprint 1 - MVP')" },
        goal: { type: "string", description: "Sprint goal - what success looks like" },
        status: {
          type: "string",
          enum: ["planned", "active", "completed", "cancelled"],
          description: "Sprint status (default: planned)",
        },
        start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
        end_date: { type: "string", description: "End date (YYYY-MM-DD)" },
        velocity: { type: "number", description: "Planned velocity in story points" },
        capacity: { type: "number", description: "Team capacity in hours" },
      },
      required: ["project_id", "name"],
    },
  },
  {
    name: "update_sprint",
    description: "Update an existing sprint's details, status, or velocity",
    inputSchema: {
      type: "object",
      properties: {
        sprint_id: { type: "number", description: "Sprint ID to update" },
        name: { type: "string", description: "New sprint name" },
        goal: { type: "string", description: "New sprint goal" },
        status: {
          type: "string",
          enum: ["planned", "active", "completed", "cancelled"],
        },
        start_date: { type: "string", description: "New start date" },
        end_date: { type: "string", description: "New end date" },
        velocity: { type: "number", description: "Actual velocity (for retrospective)" },
      },
      required: ["sprint_id"],
    },
  },
  {
    name: "delete_sprint",
    description: "Delete a sprint. Tasks will have their sprint_id set to NULL.",
    inputSchema: {
      type: "object",
      properties: {
        sprint_id: { type: "number", description: "Sprint ID to delete" },
      },
      required: ["sprint_id"],
    },
  },

  // Memory Tools
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
  {
    name: "memory_semantic_search",
    description: "Search memories using vector embeddings for semantic similarity. More powerful than memory_search for finding conceptually related content even with different wording. Uses hybrid scoring: 60% semantic similarity + 40% keyword match.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language search query" },
        min_similarity: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Minimum cosine similarity threshold (default: 0.5)",
        },
        limit: { type: "number", description: "Max results to return (default: 10)" },
        include_fulltext: {
          type: "boolean",
          description: "Include FULLTEXT keyword scoring in hybrid results (default: true)",
        },
      },
      required: ["query"],
    },
  },
];

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
    const response = await fetch(`${dashboardUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user, password }),
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data = await response.json() as { token: string };
    authToken = data.token;
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
        targetProject = await apiCall(`/projects/${params.project_id}`) as Project;
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
      return apiCall(`/tasks/${params.task_id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "completed",
          progress: 100,
          completion_notes: params.completion_notes,
        }),
      });
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
        name: string;
        goal?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        velocity?: number;
        capacity?: number;
      };
      const projectId = isIsolated ? context.project_id : params.project_id;
      if (!projectId) return { error: "project_id required" };
      if (!params.name) return { error: "name required" };
      return apiCall(`/projects/${projectId}/sprints`, {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
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
