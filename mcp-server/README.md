# SOLARIA Dashboard MCP Server

**MCP v2.0 Sketch Pattern - Simplified Architecture for AI Agents**

## Overview

The SOLARIA Digital Field Operations MCP server allows AI agents (like Claude) to interact directly with the SOLARIA C-Suite dashboard. It provides tools for project management, task operations, agent monitoring, dashboard metrics, and persistent memory.

### Architecture Evolution

**v1.0 (Legacy)**: 70+ individual tools for each operation
- `list_projects`, `create_project`, `get_project`, `update_project`
- `list_tasks`, `create_task`, `get_task`, `update_task`, `complete_task`
- `list_agents`, `get_agent`, `update_agent_status`
- Plus 50+ more tools...

**v2.0 (Sketch Pattern)**: 2 core tools with flexible execution
- `get_context`: Unified system state retrieval (projects, tasks, agents, stats, health)
- `run_code`: Secure sandbox code execution with full API access

### Benefits of v2.0

- **Simplicity**: 97% reduction in API surface (70+ tools → 2 tools)
- **Flexibility**: Users can execute custom operations via `run_code` instead of waiting for new tools
- **Performance**: Single `get_context` call replaces multiple individual calls
- **Security**: Sandbox with whitelist and configurable timeout
- **Maintainability**: Easier to understand and extend

---

## Available Tools

### Core Tools (v2.0 Sketch Pattern)

#### 1. get_context
Obtains unified system state in a single call.

**Parameters:**
- `project_id` (optional): Filter by project ID
- `project_name` (optional): Filter by project name (partial match)
- `include` (optional): Which components to include:
  - `projects`: List all projects (default: true)
  - `tasks`: List all tasks (default: false)
  - `agents`: List all agents (default: false)
  - `stats`: Include memory statistics (default: false)
  - `health`: Include health check (default: true)
  - `alerts`: Include dashboard alerts (default: false)
  - `sprints`: Include project sprints (requires project_id)
  - `epics`: Include project epics (requires project_id)

**Response:**
```json
{
  "success": true,
  "data": {
    "context": {
      "projects": [...],
      "tasks": [...],
      "agents": [...],
      "stats": {...},
      "health": {...},
      "alerts": [...],
      "dashboard": {...}
    },
    "project_id": 1,
    "timestamp": "2026-01-06T22:00:00.000Z",
    "message": "Context retrieved for project ID: 1"
  }
}
```

#### 2. run_code
Ejecutes JavaScript/TypeScript/SQL code in a secure sandbox with access to the DFO API.

**Parameters:**
- `code` (required): JavaScript/TypeScript/SQL code to execute (max 10,000 characters)
- `language` (optional): `javascript` | `typescript` | `sql` (default: `javascript`)
- `timeout` (optional): Execution timeout in ms (default: 5000, max: 30000)
- `sandbox` (optional): `strict` | `permissive` (default: `strict`)

**Response:**
```json
{
  "success": true,
  "data": {
    "output": {...},
    "execution_time_ms": 150,
    "memory_used_mb": 0,
    "metadata": {
      "language": "javascript",
      "sandbox_mode": "strict",
      "code_length": 245
    }
  }
}
```

**Available Context in run_code:**
```javascript
{
  apiCall: <function>(endpoint, options) => Promise<any>,     // Function to call Dashboard API
  console: {
    log: (...args: any[]) => void,      // Console logging
    error: (...args: any[]) => void    // Error logging
  },
  fetch: typeof fetch,                // fetch global
  JSON: typeof JSON,                  // JSON global
  Math: typeof Math,                  // Math global
  Date: typeof Date                   // Date global
}
```

**Whitelisted Endpoints (Strict Mode):**
- `/projects`, `/projects/:id`
- `/tasks`, `/tasks/:id`, `/tasks/:id/items`
- `/agents`, `/agents/:id`
- `/memories`, `/memories/:id`, `/memories/search`, `/memories/semantic-search`
- `/dashboard/overview`, `/dashboard/alerts`
- `/sprints`, `/sprints/:id`
- `/epics`, `/epics/:id`
- `/health`, `/stats`

---

## Template Library

The v2.0 implementation includes pre-defined templates for common operations:

### Projects
- `projects-list`: List all projects
- `projects-get`: Get specific project
- `projects-create`: Create new project
- `projects-update`: Update project

### Tasks
- `tasks-list`: List tasks for a project
- `tasks-create`: Create new task
- `tasks-update`: Update task status/progress
- `tasks-complete`: Mark task as completed

### Agents
- `agents-list`: List all agents
- `agents-update`: Update agent status

### Memory
- `memory-create`: Create a memory entry
- `memory-search`: Search memories
- `memory-semantic`: Semantic search

### Dashboard
- `dashboard-overview`: Get dashboard overview

### Multi-operation
- `multi-operation`: Execute multiple operations in parallel

**Usage Example:**
```javascript
// Get template and execute
const template = await getScriptTemplate('tasks-create');
await run_code({ code: template, timeout: 5000 });
```

---

## Migration from v1.0 to v2.0

### Key Changes:
1. **Reduced Tools**: 70+ tools → 2 core tools
2. **Unified Context**: Single `get_context()` vs multiple individual calls
3. **Flexible Execution**: Custom code via `run_code()` instead of pre-defined tools
4. **Security**: Sandbox with endpoint whitelist and timeout controls

### Migration Example:

**v1.0 (Old Way):**
```javascript
// Multiple API calls
const projects = await list_projects();
const tasks = await list_tasks({ project_id: 1 });
const agents = await list_agents();

// Do something with data...
```

**v2.0 (New Way):**
```javascript
// Single unified call
const context = await get_context({
  project_id: 1,
  include: { projects: true, tasks: true, agents: true }
});

// All data available in one object
const { projects, tasks, agents } = context.data.context;
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_PORT` | HTTP port | 3032 |
| `MCP_VERSION` | MCP version selector | `1.0` or `2.0` |
| `DASHBOARD_API_URL` | Dashboard API URL | `http://office:3030/api` |
| `DASHBOARD_USER` | Dashboard username | `carlosjperez` |
| `DASHBOARD_PASS` | Dashboard password | `bypass` |
| `JWT_SECRET` | JWT signing secret | `solaria_jwt_secret_2024_min32chars_secure` |
| `NODE_ENV` | Environment | `production` |

### Deployment

**Local Development:**
```bash
cd mcp-server
npm install
export DASHBOARD_API_URL=http://localhost:3030/api
npm start
```

**Docker Deployment:**
```bash
# v1.0 (default)
docker-compose up

# v2.0 (with MCP_VERSION=2.0)
docker-compose up
```

---

## Testing

```bash
# Health check
curl http://localhost:3032/mcp/health

# List tools (v2.0)
curl -X POST http://localhost:3032/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Run code (v2.0)
curl -X POST http://localhost:3032/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "run_code",
      "arguments": {
        "code": "const projects = await apiCall('/projects');\nconsole.log('Projects:', projects);\nreturn { projects };"
      }
    }
  }'
```

---

## Documentation

- **Migration Guide**: [MCP-V2-MIGRATION-GUIDE.md](docs/MCP-V2-MIGRATION-GUIDE.md) - Complete guide for migrating from v1.0 to v2.0
- **API Reference**: [MCP-V2-API-REFERENCE.md](docs/MCP-V2-API-REFERENCE.md) - Complete API documentation for v2.0

---

## Contact & Support

- **Dashboard**: https://dfo.solaria.agency
- **MCP API**: https://dfo.solaria.agency/mcp

---

**Version:** 2.0.0 (Sketch Pattern)
**Last Updated:** 2026-01-06
