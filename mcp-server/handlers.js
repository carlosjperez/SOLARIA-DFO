"use strict";
/**
 * SOLARIA Dashboard MCP Handlers
 * Shared handlers for both stdio and HTTP transports
 *
 * @module handlers
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceDefinitions = exports.toolDefinitions = void 0;
exports.createApiClient = createApiClient;
exports.executeTool = executeTool;
exports.readResource = readResource;
// ============================================================================
// Tool Definitions
// ============================================================================
exports.toolDefinitions = [
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
exports.resourceDefinitions = [
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
function createApiClient(dashboardUrl, credentials) {
    var authToken = null;
    var user = credentials.user, password = credentials.password;
    function authenticate() {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(dashboardUrl, "/auth/login"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: user, password: password }),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Authentication failed");
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        authToken = data.token;
                        return [2 /*return*/, data];
                }
            });
        });
    }
    function apiCall(endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options) {
            var response;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!authToken) return [3 /*break*/, 2];
                        return [4 /*yield*/, authenticate()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, fetch("".concat(dashboardUrl).concat(endpoint), __assign(__assign({}, options), { headers: __assign({ "Content-Type": "application/json", Authorization: "Bearer ".concat(authToken) }, options.headers) }))];
                    case 3:
                        response = _a.sent();
                        if (!(response.status === 401)) return [3 /*break*/, 5];
                        // Token expired, re-authenticate
                        return [4 /*yield*/, authenticate()];
                    case 4:
                        // Token expired, re-authenticate
                        _a.sent();
                        return [2 /*return*/, apiCall(endpoint, options)];
                    case 5: return [2 /*return*/, response.json()];
                }
            });
        });
    }
    return { apiCall: apiCall, authenticate: authenticate };
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
function executeTool(name_1, args_1, apiCall_1) {
    return __awaiter(this, arguments, void 0, function (name, args, apiCall, context) {
        // Helper to validate task belongs to context project
        function validateTaskProject(taskId) {
            return __awaiter(this, void 0, void 0, function () {
                var task;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!isIsolated)
                                return [2 /*return*/, true];
                            return [4 /*yield*/, apiCall("/tasks/".concat(taskId))];
                        case 1:
                            task = _a.sent();
                            if (task.project_id !== context.project_id) {
                                throw new Error("ACCESS DENIED: Task #".concat(taskId, " does not belong to your project"));
                            }
                            return [2 /*return*/, true];
                    }
                });
            });
        }
        var isIsolated, projectId, _a, params_1, targetProject, allProjects, projects, dirName_1, allProjects, projects, allProjects, projects, result, _b, project, allTasks, tasks, params, alerts, project, params, requestedProjectId, params, projectPayload, params, params, endpoint, queryParams, params, params, params, params, params, params, result, items, params, result, params, result, params, task_id, item_id, updateData, result, params, result, params_2, agents, params, params_3, tasks, params, params, limit, level, project, params, allDocs, params, clientProjectId, params, updateClientProjectId, params, docsProjectId, params, newDocProjectId, params, reqsProjectId, reqsUrl, reqsParams, params, newReqProjectId, params, updateReqProjectId, params, params, memParams, memEndpoint, params, params, updatePayload, params, params, searchParams, statsParams, params, boostAmount, params, relParams, params, params, searchParams;
        var _c;
        if (context === void 0) { context = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    isIsolated = Boolean(context.project_id && !context.adminMode);
                    projectId = context.project_id || (args === null || args === void 0 ? void 0 : args.project_id);
                    _a = name;
                    switch (_a) {
                        case "set_project_context": return [3 /*break*/, 1];
                        case "get_current_context": return [3 /*break*/, 10];
                        case "get_dashboard_overview": return [3 /*break*/, 11];
                        case "get_dashboard_alerts": return [3 /*break*/, 14];
                        case "list_projects": return [3 /*break*/, 17];
                        case "get_project": return [3 /*break*/, 20];
                        case "create_project": return [3 /*break*/, 21];
                        case "update_project": return [3 /*break*/, 22];
                        case "list_tasks": return [3 /*break*/, 23];
                        case "get_task": return [3 /*break*/, 24];
                        case "create_task": return [3 /*break*/, 26];
                        case "update_task": return [3 /*break*/, 27];
                        case "complete_task": return [3 /*break*/, 29];
                        case "delete_task": return [3 /*break*/, 31];
                        case "list_task_items": return [3 /*break*/, 33];
                        case "create_task_items": return [3 /*break*/, 36];
                        case "complete_task_item": return [3 /*break*/, 39];
                        case "update_task_item": return [3 /*break*/, 42];
                        case "delete_task_item": return [3 /*break*/, 45];
                        case "list_agents": return [3 /*break*/, 48];
                        case "get_agent": return [3 /*break*/, 50];
                        case "get_agent_tasks": return [3 /*break*/, 51];
                        case "update_agent_status": return [3 /*break*/, 53];
                        case "get_activity_logs": return [3 /*break*/, 54];
                        case "log_activity": return [3 /*break*/, 55];
                        case "list_docs": return [3 /*break*/, 56];
                        case "get_project_client": return [3 /*break*/, 59];
                        case "update_project_client": return [3 /*break*/, 60];
                        case "get_project_documents": return [3 /*break*/, 61];
                        case "create_project_document": return [3 /*break*/, 62];
                        case "get_project_requests": return [3 /*break*/, 63];
                        case "create_project_request": return [3 /*break*/, 64];
                        case "update_project_request": return [3 /*break*/, 65];
                        case "memory_create": return [3 /*break*/, 66];
                        case "memory_list": return [3 /*break*/, 67];
                        case "memory_get": return [3 /*break*/, 68];
                        case "memory_update": return [3 /*break*/, 69];
                        case "memory_delete": return [3 /*break*/, 70];
                        case "memory_search": return [3 /*break*/, 71];
                        case "memory_tags": return [3 /*break*/, 72];
                        case "memory_stats": return [3 /*break*/, 73];
                        case "memory_boost": return [3 /*break*/, 74];
                        case "memory_related": return [3 /*break*/, 75];
                        case "memory_link": return [3 /*break*/, 76];
                        case "memory_semantic_search": return [3 /*break*/, 77];
                    }
                    return [3 /*break*/, 78];
                case 1:
                    params_1 = args;
                    targetProject = null;
                    if (!params_1.project_id) return [3 /*break*/, 3];
                    return [4 /*yield*/, apiCall("/projects/".concat(params_1.project_id))];
                case 2:
                    targetProject = (_d.sent());
                    return [3 /*break*/, 7];
                case 3:
                    if (!params_1.project_name) return [3 /*break*/, 5];
                    return [4 /*yield*/, apiCall("/projects")];
                case 4:
                    allProjects = _d.sent();
                    projects = Array.isArray(allProjects) ? allProjects : (allProjects.projects || []);
                    // Try exact match first
                    targetProject = projects.find(function (p) {
                        return p.name.toLowerCase() === params_1.project_name.toLowerCase();
                    }) || null;
                    // Try partial match
                    if (!targetProject) {
                        targetProject = projects.find(function (p) {
                            return p.name.toLowerCase().includes(params_1.project_name.toLowerCase()) ||
                                params_1.project_name.toLowerCase().includes(p.name.toLowerCase());
                        }) || null;
                    }
                    return [3 /*break*/, 7];
                case 5:
                    if (!params_1.working_directory) return [3 /*break*/, 7];
                    dirName_1 = ((_c = params_1.working_directory.split('/').pop()) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
                    return [4 /*yield*/, apiCall("/projects")];
                case 6:
                    allProjects = _d.sent();
                    projects = Array.isArray(allProjects) ? allProjects : (allProjects.projects || []);
                    targetProject = projects.find(function (p) {
                        return p.name.toLowerCase().includes(dirName_1) ||
                            dirName_1.includes(p.name.toLowerCase().replace(/\s+/g, '-'));
                    }) || null;
                    _d.label = 7;
                case 7:
                    if (!!targetProject) return [3 /*break*/, 9];
                    return [4 /*yield*/, apiCall("/projects")];
                case 8:
                    allProjects = _d.sent();
                    projects = Array.isArray(allProjects) ? allProjects : (allProjects.projects || []);
                    return [2 /*return*/, {
                            success: false,
                            error: "Project not found",
                            available_projects: projects.map(function (p) { return ({ id: p.id, name: p.name }); }),
                            hint: "Use set_project_context with project_id or exact project_name",
                        }];
                case 9:
                    result = {
                        __action: "SET_PROJECT_CONTEXT",
                        success: true,
                        project_id: targetProject.id,
                        project_name: targetProject.name,
                        message: "Context set to project: ".concat(targetProject.name, " (ID: ").concat(targetProject.id, "). All subsequent operations will be isolated to this project."),
                    };
                    return [2 /*return*/, result];
                case 10: return [2 /*return*/, {
                        project_id: context.project_id,
                        isolation_enabled: isIsolated,
                        admin_mode: context.adminMode || false,
                        message: isIsolated
                            ? "You are working in project #".concat(context.project_id, ". All operations are isolated to this project.")
                            : "No project context set. You have access to all projects. Call set_project_context to isolate to a specific project.",
                    }];
                case 11:
                    if (!isIsolated) return [3 /*break*/, 13];
                    return [4 /*yield*/, Promise.all([
                            apiCall("/projects/".concat(context.project_id)),
                            apiCall("/tasks?project_id=".concat(context.project_id)),
                        ])];
                case 12:
                    _b = _d.sent(), project = _b[0], allTasks = _b[1];
                    tasks = allTasks || [];
                    return [2 /*return*/, {
                            project: project,
                            metrics: {
                                total_tasks: tasks.length,
                                completed: tasks.filter(function (t) { return t.status === "completed"; }).length,
                                in_progress: tasks.filter(function (t) { return t.status === "in_progress"; }).length,
                                pending: tasks.filter(function (t) { return t.status === "pending"; }).length,
                                blocked: tasks.filter(function (t) { return t.status === "blocked"; }).length,
                            },
                            isolation_mode: true,
                            project_id: context.project_id,
                        }];
                case 13: return [2 /*return*/, apiCall("/dashboard/overview")];
                case 14:
                    params = args;
                    if (!isIsolated) return [3 /*break*/, 16];
                    return [4 /*yield*/, apiCall("/dashboard/alerts".concat((params === null || params === void 0 ? void 0 : params.severity) ? "?severity=".concat(params.severity) : ""))];
                case 15:
                    alerts = _d.sent();
                    return [2 /*return*/, (alerts || []).filter(function (a) { return !a.project_id || a.project_id === context.project_id; })];
                case 16: return [2 /*return*/, apiCall("/dashboard/alerts".concat((params === null || params === void 0 ? void 0 : params.severity) ? "?severity=".concat(params.severity) : ""))];
                case 17:
                    if (!isIsolated) return [3 /*break*/, 19];
                    return [4 /*yield*/, apiCall("/projects/".concat(context.project_id))];
                case 18:
                    project = _d.sent();
                    return [2 /*return*/, [project]];
                case 19: return [2 /*return*/, apiCall("/projects")];
                case 20:
                    {
                        params = args;
                        if (!(params === null || params === void 0 ? void 0 : params.project_id) && !projectId) {
                            throw new Error("project_id is required");
                        }
                        requestedProjectId = (params === null || params === void 0 ? void 0 : params.project_id) || projectId;
                        if (isIsolated && requestedProjectId !== context.project_id) {
                            throw new Error("ACCESS DENIED: Cannot access project #".concat(requestedProjectId, ". You are isolated to project #").concat(context.project_id));
                        }
                        return [2 /*return*/, apiCall("/projects/".concat(requestedProjectId))];
                    }
                    _d.label = 21;
                case 21:
                    {
                        params = args;
                        projectPayload = {
                            name: params.name,
                            client: params.client || "External Client",
                            description: params.description || "",
                            budget: params.budget || 0,
                            deadline: params.deadline,
                            status: "planning",
                            priority: params.priority || "medium",
                        };
                        if (isIsolated) {
                            console.log("[PROJECT] Creating new project \"".concat(params.name, "\" from isolated session (project #").concat(context.project_id, ")"));
                        }
                        return [2 /*return*/, apiCall("/projects", {
                                method: "POST",
                                body: JSON.stringify(projectPayload),
                            })];
                    }
                    _d.label = 22;
                case 22:
                    {
                        params = args;
                        if (isIsolated && params.project_id !== context.project_id) {
                            console.log("[PROJECT] Updating project #".concat(params.project_id, " from isolated session (project #").concat(context.project_id, ")"));
                        }
                        return [2 /*return*/, apiCall("/projects/".concat(params.project_id), {
                                method: "PUT",
                                body: JSON.stringify(params),
                            })];
                    }
                    _d.label = 23;
                case 23:
                    {
                        params = args;
                        endpoint = "/tasks";
                        queryParams = [];
                        if (isIsolated) {
                            queryParams.push("project_id=".concat(context.project_id));
                            if ((params === null || params === void 0 ? void 0 : params.project_id) && params.project_id !== context.project_id) {
                                console.warn("[ISOLATION] Blocked attempt to list tasks from project #".concat(params.project_id));
                            }
                        }
                        else if ((params === null || params === void 0 ? void 0 : params.project_id) || projectId) {
                            queryParams.push("project_id=".concat((params === null || params === void 0 ? void 0 : params.project_id) || projectId));
                        }
                        if (params === null || params === void 0 ? void 0 : params.status)
                            queryParams.push("status=".concat(params.status));
                        if (params === null || params === void 0 ? void 0 : params.priority)
                            queryParams.push("priority=".concat(params.priority));
                        if (params === null || params === void 0 ? void 0 : params.agent_id)
                            queryParams.push("agent_id=".concat(params.agent_id));
                        if (queryParams.length)
                            endpoint += "?".concat(queryParams.join("&"));
                        return [2 /*return*/, apiCall(endpoint)];
                    }
                    _d.label = 24;
                case 24:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 25:
                    _d.sent();
                    return [2 /*return*/, apiCall("/tasks/".concat(params.task_id))];
                case 26:
                    {
                        params = args;
                        if (isIsolated) {
                            if (params.project_id && params.project_id !== context.project_id) {
                                throw new Error("ACCESS DENIED: Cannot create tasks in project #".concat(params.project_id, ". You are isolated to project #").concat(context.project_id));
                            }
                            return [2 /*return*/, apiCall("/tasks", {
                                    method: "POST",
                                    body: JSON.stringify(__assign(__assign({}, params), { project_id: context.project_id, status: params.status || "pending", priority: params.priority || "medium" })),
                                })];
                        }
                        if (!params.project_id && !projectId) {
                            throw new Error("project_id is required for creating tasks");
                        }
                        return [2 /*return*/, apiCall("/tasks", {
                                method: "POST",
                                body: JSON.stringify(__assign(__assign({}, params), { project_id: params.project_id || projectId, status: params.status || "pending", priority: params.priority || "medium" })),
                            })];
                    }
                    _d.label = 27;
                case 27:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 28:
                    _d.sent();
                    return [2 /*return*/, apiCall("/tasks/".concat(params.task_id), {
                            method: "PUT",
                            body: JSON.stringify(params),
                        })];
                case 29:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 30:
                    _d.sent();
                    return [2 /*return*/, apiCall("/tasks/".concat(params.task_id), {
                            method: "PUT",
                            body: JSON.stringify({
                                status: "completed",
                                progress: 100,
                                completion_notes: params.completion_notes,
                            }),
                        })];
                case 31:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 32:
                    _d.sent();
                    return [2 /*return*/, apiCall("/tasks/".concat(params.task_id), {
                            method: "DELETE",
                        })];
                case 33:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 34:
                    _d.sent();
                    return [4 /*yield*/, apiCall("/tasks/".concat(params.task_id, "/items"))];
                case 35:
                    result = _d.sent();
                    items = result.items;
                    if (params.include_completed === false) {
                        items = items.filter(function (i) { return !i.is_completed; });
                    }
                    return [2 /*return*/, {
                            task_id: params.task_id,
                            items: items,
                            summary: {
                                total: result.items.length,
                                completed: result.items.filter(function (i) { return i.is_completed; }).length,
                                pending: result.items.filter(function (i) { return !i.is_completed; }).length,
                            },
                        }];
                case 36:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 37:
                    _d.sent();
                    return [4 /*yield*/, apiCall("/tasks/".concat(params.task_id, "/items"), {
                            method: "POST",
                            body: JSON.stringify({ items: params.items }),
                        })];
                case 38:
                    result = _d.sent();
                    return [2 /*return*/, {
                            success: true,
                            task_id: params.task_id,
                            items_created: result.items.length,
                            items: result.items,
                            task_progress: result.progress,
                            message: "Created ".concat(result.items.length, " checklist items. Task progress: ").concat(result.progress, "%"),
                        }];
                case 39:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 40:
                    _d.sent();
                    return [4 /*yield*/, apiCall("/tasks/".concat(params.task_id, "/items/").concat(params.item_id, "/complete"), {
                            method: "PUT",
                            body: JSON.stringify({
                                notes: params.notes,
                                actual_minutes: params.actual_minutes,
                            }),
                        })];
                case 41:
                    result = _d.sent();
                    return [2 /*return*/, {
                            success: true,
                            item: result.item,
                            task_progress: result.progress,
                            items_completed: result.completed,
                            items_total: result.total,
                            message: "Item completed. Task progress: ".concat(result.completed, "/").concat(result.total, " (").concat(result.progress, "%)"),
                        }];
                case 42:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 43:
                    _d.sent();
                    task_id = params.task_id, item_id = params.item_id, updateData = __rest(params, ["task_id", "item_id"]);
                    return [4 /*yield*/, apiCall("/tasks/".concat(task_id, "/items/").concat(item_id), {
                            method: "PUT",
                            body: JSON.stringify(updateData),
                        })];
                case 44:
                    result = _d.sent();
                    return [2 /*return*/, {
                            success: true,
                            item: result.item,
                            task_progress: result.progress,
                        }];
                case 45:
                    params = args;
                    return [4 /*yield*/, validateTaskProject(params.task_id)];
                case 46:
                    _d.sent();
                    return [4 /*yield*/, apiCall("/tasks/".concat(params.task_id, "/items/").concat(params.item_id), {
                            method: "DELETE",
                        })];
                case 47:
                    result = _d.sent();
                    return [2 /*return*/, {
                            success: true,
                            deleted_item_id: params.item_id,
                            task_progress: result.progress,
                            message: "Item deleted. Task progress recalculated: ".concat(result.progress, "%"),
                        }];
                case 48:
                    params_2 = args;
                    return [4 /*yield*/, apiCall("/agents")];
                case 49:
                    agents = _d.sent();
                    if (params_2 === null || params_2 === void 0 ? void 0 : params_2.status) {
                        agents = agents.filter(function (a) { return a.status === params_2.status; });
                    }
                    if (params_2 === null || params_2 === void 0 ? void 0 : params_2.role) {
                        agents = agents.filter(function (a) { return a.role === params_2.role; });
                    }
                    return [2 /*return*/, agents];
                case 50:
                    {
                        params = args;
                        return [2 /*return*/, apiCall("/agents/".concat(params.agent_id))];
                    }
                    _d.label = 51;
                case 51:
                    params_3 = args;
                    return [4 /*yield*/, apiCall("/tasks")];
                case 52:
                    tasks = _d.sent();
                    return [2 /*return*/, tasks.filter(function (t) { return t.assigned_agent_id === params_3.agent_id; })];
                case 53:
                    {
                        params = args;
                        return [2 /*return*/, apiCall("/agents/".concat(params.agent_id, "/status"), {
                                method: "PUT",
                                body: JSON.stringify({ status: params.status }),
                            })];
                    }
                    _d.label = 54;
                case 54:
                    {
                        params = args;
                        limit = (params === null || params === void 0 ? void 0 : params.limit) || 50;
                        level = (params === null || params === void 0 ? void 0 : params.level) ? "&level=".concat(params.level) : "";
                        project = isIsolated
                            ? "&project_id=".concat(context.project_id)
                            : (params === null || params === void 0 ? void 0 : params.project_id) ? "&project_id=".concat(params.project_id) : "";
                        return [2 /*return*/, apiCall("/logs?limit=".concat(limit).concat(level).concat(project))];
                    }
                    _d.label = 55;
                case 55:
                    {
                        params = args;
                        return [2 /*return*/, apiCall("/logs", {
                                method: "POST",
                                body: JSON.stringify(__assign(__assign({}, params), { project_id: isIsolated ? context.project_id : (params.project_id || projectId) })),
                            })];
                    }
                    _d.label = 56;
                case 56:
                    if (!isIsolated) return [3 /*break*/, 58];
                    return [4 /*yield*/, apiCall("/docs/list")];
                case 57:
                    allDocs = _d.sent();
                    return [2 /*return*/, (allDocs || []).filter(function (d) { return d.project_id === context.project_id; })];
                case 58: return [2 /*return*/, apiCall("/docs/list")];
                case 59:
                    {
                        params = args;
                        clientProjectId = isIsolated ? context.project_id : params.project_id;
                        if (!clientProjectId)
                            return [2 /*return*/, { error: "project_id required" }];
                        return [2 /*return*/, apiCall("/projects/".concat(clientProjectId, "/client"))];
                    }
                    _d.label = 60;
                case 60:
                    {
                        params = args;
                        updateClientProjectId = isIsolated ? context.project_id : params.project_id;
                        if (!updateClientProjectId)
                            return [2 /*return*/, { error: "project_id required" }];
                        if (!params.name)
                            return [2 /*return*/, { error: "name required" }];
                        return [2 /*return*/, apiCall("/projects/".concat(updateClientProjectId, "/client"), {
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
                            })];
                    }
                    _d.label = 61;
                case 61:
                    {
                        params = args;
                        docsProjectId = isIsolated ? context.project_id : params.project_id;
                        if (!docsProjectId)
                            return [2 /*return*/, { error: "project_id required" }];
                        return [2 /*return*/, apiCall("/projects/".concat(docsProjectId, "/documents"))];
                    }
                    _d.label = 62;
                case 62:
                    {
                        params = args;
                        newDocProjectId = isIsolated ? context.project_id : params.project_id;
                        if (!newDocProjectId)
                            return [2 /*return*/, { error: "project_id required" }];
                        if (!params.name || !params.url)
                            return [2 /*return*/, { error: "name and url required" }];
                        return [2 /*return*/, apiCall("/projects/".concat(newDocProjectId, "/documents"), {
                                method: "POST",
                                body: JSON.stringify({
                                    name: params.name,
                                    type: params.type || "other",
                                    url: params.url,
                                    description: params.description,
                                }),
                            })];
                    }
                    _d.label = 63;
                case 63:
                    {
                        params = args;
                        reqsProjectId = isIsolated ? context.project_id : params.project_id;
                        if (!reqsProjectId)
                            return [2 /*return*/, { error: "project_id required" }];
                        reqsUrl = "/projects/".concat(reqsProjectId, "/requests");
                        reqsParams = [];
                        if (params.status)
                            reqsParams.push("status=".concat(params.status));
                        if (params.priority)
                            reqsParams.push("priority=".concat(params.priority));
                        if (reqsParams.length > 0)
                            reqsUrl += "?".concat(reqsParams.join("&"));
                        return [2 /*return*/, apiCall(reqsUrl)];
                    }
                    _d.label = 64;
                case 64:
                    {
                        params = args;
                        newReqProjectId = isIsolated ? context.project_id : params.project_id;
                        if (!newReqProjectId)
                            return [2 /*return*/, { error: "project_id required" }];
                        if (!params.text)
                            return [2 /*return*/, { error: "text required" }];
                        return [2 /*return*/, apiCall("/projects/".concat(newReqProjectId, "/requests"), {
                                method: "POST",
                                body: JSON.stringify({
                                    text: params.text,
                                    priority: params.priority || "medium",
                                    requested_by: params.requested_by,
                                }),
                            })];
                    }
                    _d.label = 65;
                case 65:
                    {
                        params = args;
                        updateReqProjectId = isIsolated ? context.project_id : params.project_id;
                        if (!updateReqProjectId || !params.request_id)
                            return [2 /*return*/, { error: "project_id and request_id required" }];
                        return [2 /*return*/, apiCall("/projects/".concat(updateReqProjectId, "/requests/").concat(params.request_id), {
                                method: "PUT",
                                body: JSON.stringify({
                                    status: params.status,
                                    priority: params.priority,
                                    notes: params.notes,
                                }),
                            })];
                    }
                    _d.label = 66;
                case 66:
                    {
                        params = args;
                        return [2 /*return*/, apiCall("/memories", {
                                method: "POST",
                                body: JSON.stringify({
                                    content: params.content,
                                    summary: params.summary || params.content.substring(0, 200),
                                    tags: JSON.stringify(params.tags || []),
                                    metadata: JSON.stringify(params.metadata || {}),
                                    importance: params.importance || 0.5,
                                    project_id: isIsolated ? context.project_id : (params.project_id || projectId),
                                }),
                            })];
                    }
                    _d.label = 67;
                case 67:
                    {
                        params = args;
                        memParams = [];
                        if (isIsolated) {
                            memParams.push("project_id=".concat(context.project_id));
                        }
                        if (params === null || params === void 0 ? void 0 : params.query)
                            memParams.push("query=".concat(encodeURIComponent(params.query)));
                        if (params === null || params === void 0 ? void 0 : params.tags)
                            memParams.push("tags=".concat(encodeURIComponent(JSON.stringify(params.tags))));
                        if (params === null || params === void 0 ? void 0 : params.limit)
                            memParams.push("limit=".concat(params.limit));
                        if (params === null || params === void 0 ? void 0 : params.offset)
                            memParams.push("offset=".concat(params.offset));
                        if (params === null || params === void 0 ? void 0 : params.sort_by)
                            memParams.push("sort_by=".concat(params.sort_by));
                        memEndpoint = "/memories".concat(memParams.length ? '?' + memParams.join('&') : '');
                        return [2 /*return*/, apiCall(memEndpoint)];
                    }
                    _d.label = 68;
                case 68:
                    {
                        params = args;
                        return [2 /*return*/, apiCall("/memories/".concat(params.memory_id, "?track_access=true"))];
                    }
                    _d.label = 69;
                case 69:
                    {
                        params = args;
                        updatePayload = {};
                        if (params.content !== undefined)
                            updatePayload.content = params.content;
                        if (params.summary !== undefined)
                            updatePayload.summary = params.summary;
                        if (params.tags !== undefined)
                            updatePayload.tags = JSON.stringify(params.tags);
                        if (params.metadata !== undefined)
                            updatePayload.metadata = JSON.stringify(params.metadata);
                        if (params.importance !== undefined)
                            updatePayload.importance = params.importance;
                        return [2 /*return*/, apiCall("/memories/".concat(params.memory_id), {
                                method: "PUT",
                                body: JSON.stringify(updatePayload),
                            })];
                    }
                    _d.label = 70;
                case 70:
                    {
                        params = args;
                        return [2 /*return*/, apiCall("/memories/".concat(params.memory_id), { method: "DELETE" })];
                    }
                    _d.label = 71;
                case 71:
                    {
                        params = args;
                        searchParams = ["query=".concat(encodeURIComponent(params.query))];
                        if (isIsolated)
                            searchParams.push("project_id=".concat(context.project_id));
                        if (params.tags)
                            searchParams.push("tags=".concat(encodeURIComponent(JSON.stringify(params.tags))));
                        if (params.min_importance)
                            searchParams.push("min_importance=".concat(params.min_importance));
                        if (params.limit)
                            searchParams.push("limit=".concat(params.limit));
                        return [2 /*return*/, apiCall("/memories/search?".concat(searchParams.join('&')))];
                    }
                    _d.label = 72;
                case 72: return [2 /*return*/, apiCall("/memories/tags")];
                case 73:
                    {
                        statsParams = isIsolated ? "?project_id=".concat(context.project_id) : '';
                        return [2 /*return*/, apiCall("/memories/stats".concat(statsParams))];
                    }
                    _d.label = 74;
                case 74:
                    {
                        params = args;
                        boostAmount = Math.min(params.boost_amount || 0.1, 0.5);
                        return [2 /*return*/, apiCall("/memories/".concat(params.memory_id, "/boost"), {
                                method: "POST",
                                body: JSON.stringify({ boost_amount: boostAmount }),
                            })];
                    }
                    _d.label = 75;
                case 75:
                    {
                        params = args;
                        relParams = params.relationship_type ? "?type=".concat(params.relationship_type) : '';
                        return [2 /*return*/, apiCall("/memories/".concat(params.memory_id, "/related").concat(relParams))];
                    }
                    _d.label = 76;
                case 76:
                    {
                        params = args;
                        return [2 /*return*/, apiCall("/memories/crossrefs", {
                                method: "POST",
                                body: JSON.stringify({
                                    source_memory_id: params.source_id,
                                    target_memory_id: params.target_id,
                                    relationship_type: params.relationship_type || "related",
                                }),
                            })];
                    }
                    _d.label = 77;
                case 77:
                    {
                        params = args;
                        searchParams = ["query=".concat(encodeURIComponent(params.query))];
                        if (isIsolated)
                            searchParams.push("project_id=".concat(context.project_id));
                        if (params.min_similarity !== undefined)
                            searchParams.push("min_similarity=".concat(params.min_similarity));
                        if (params.limit !== undefined)
                            searchParams.push("limit=".concat(params.limit));
                        if (params.include_fulltext !== undefined)
                            searchParams.push("include_fulltext=".concat(params.include_fulltext));
                        return [2 /*return*/, apiCall("/memories/semantic-search?".concat(searchParams.join('&')))];
                    }
                    _d.label = 78;
                case 78: throw new Error("Unknown tool: ".concat(name));
            }
        });
    });
}
// ============================================================================
// Resource Reading with Project Isolation
// ============================================================================
function readResource(uri_1, apiCall_1) {
    return __awaiter(this, arguments, void 0, function (uri, apiCall, context) {
        var isIsolated, _a, _b, project, tasks, project;
        if (context === void 0) { context = {}; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    isIsolated = Boolean(context.project_id && !context.adminMode);
                    _a = uri;
                    switch (_a) {
                        case "solaria://dashboard/overview": return [3 /*break*/, 1];
                        case "solaria://projects/list": return [3 /*break*/, 4];
                        case "solaria://tasks/list": return [3 /*break*/, 7];
                        case "solaria://agents/list": return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 9];
                case 1:
                    if (!isIsolated) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all([
                            apiCall("/projects/".concat(context.project_id)),
                            apiCall("/tasks?project_id=".concat(context.project_id)),
                        ])];
                case 2:
                    _b = _c.sent(), project = _b[0], tasks = _b[1];
                    return [2 /*return*/, {
                            project: project,
                            tasks_count: (tasks || []).length,
                            isolation_mode: true,
                            project_id: context.project_id,
                        }];
                case 3: return [2 /*return*/, apiCall("/dashboard/overview")];
                case 4:
                    if (!isIsolated) return [3 /*break*/, 6];
                    return [4 /*yield*/, apiCall("/projects/".concat(context.project_id))];
                case 5:
                    project = _c.sent();
                    return [2 /*return*/, [project]];
                case 6: return [2 /*return*/, apiCall("/projects")];
                case 7:
                    if (isIsolated) {
                        return [2 /*return*/, apiCall("/tasks?project_id=".concat(context.project_id))];
                    }
                    return [2 /*return*/, apiCall("/tasks")];
                case 8: return [2 /*return*/, apiCall("/agents")];
                case 9: throw new Error("Unknown resource: ".concat(uri));
            }
        });
    });
}
