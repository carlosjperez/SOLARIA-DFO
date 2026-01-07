import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getProjects, getTasks, getAgents, getHealth, createProject, createTask, updateTaskStatus } from './dashboard-api.js';

export const toolDefinitions = [
  {
    name: 'get_context',
    description: 'Obtiene estado del sistema SOLARIA DFO desde el dashboard real',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number' },
        include: {
          type: 'object',
          properties: {
            projects: { type: 'boolean' },
            tasks: { type: 'boolean' },
            agents: { type: 'boolean' },
            health: { type: 'boolean' }
          }
        }
      }
    }
  },
  {
    name: 'list_projects',
    description: 'Lista todos los proyectos activos del dashboard',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'completed', 'all'] }
      }
    }
  },
  {
    name: 'list_tasks',
    description: 'Lista tareas de un proyecto específico',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'all'] }
      },
      required: ['project_id']
    }
  },
  {
    name: 'update_task_status',
    description: 'Actualiza el estado de una tarea',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] }
      },
      required: ['task_id', 'status']
    }
  },
  {
    name: 'run_code',
    description: 'Ejecuta codigo en sandbox (stub)',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', minLength: 1 },
        language: { type: 'string', enum: ['javascript', 'typescript', 'sql'] },
        timeout: { type: 'number', default: 5000 },
        sandbox: { type: 'string', enum: ['strict', 'permissive'], default: 'strict' }
      },
      required: ['code']
    }
  }
];

const PORT = process.env.MCP_PORT || 3032;
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.post('/mcp', async (req, res) => {
  const { method, id, params } = req.body;
  try {
    if (method !== 'tools/list' && method !== 'tools/call') {
      res.status(32600).json({ id, jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' } });
      return;
    }

    if (method === 'tools/list') {
      res.json({ id, jsonrpc: '2.0', result: { tools: toolDefinitions } });
    } else if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params;
      const tool = toolDefinitions.find(t => t.name === name);
      if (!tool) {
        res.status(32600).json({ id, jsonrpc: '2.0', error: { code: -32602, message: 'Tool not found' } });
        return;
      }

      let result: any;
      if (name === 'get_context') {
        const includeParams = toolArgs?.include || {};
        const projects = includeParams.projects ? await getProjects() : [];
        const tasks = includeParams.tasks && toolArgs?.project_id ? await getTasks(toolArgs.project_id) : [];
        const agents = includeParams.agents ? await getAgents() : [];
        const health = includeParams.health ? await getHealth() : {};

        result = { success: true, context: { projects, tasks, agents, health } };
      } else if (name === 'list_projects') {
        const projects = await getProjects();
        result = { success: true, projects, count: projects.length };
      } else if (name === 'list_tasks') {
        const projectId = toolArgs?.project_id;
        if (!projectId) {
          res.status(32600).json({ id, jsonrpc: '2.0', error: { code: -32603, message: 'project_id is required' } });
          return;
        }
        const tasks = await getTasks(projectId);
        result = { success: true, tasks, count: tasks.length };
      } else if (name === 'update_task_status') {
        const taskId = toolArgs?.task_id;
        const status = toolArgs?.status;
        if (!taskId || !status) {
          res.status(32600).json({ id, jsonrpc: '2.0', error: { code: -32603, message: 'task_id and status are required' } });
          return;
        }
        const updated = await updateTaskStatus(taskId, status);
        result = { success: true, updated, task_id: taskId, status };
      } else if (name === 'run_code') {
        result = { success: true, output: null, execution_time_ms: 0, message: 'Code execution stub - not implemented' };
      }

      res.json({ id, jsonrpc: '2.0', result });
    }
  } catch (error: any) {
    console.error('[MCP v2.0] Error:', error);
    res.status(500).json({ id, jsonrpc: '2.0', error: { code: -32000, message: error.message || 'Internal error' } });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0-real-integration', mode: 'full', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('[MCP v2.0 Real Integration] Starting on port ' + PORT);
  console.log('[MCP v2.0 Real Integration] Health: http://localhost:' + PORT + '/health');
  console.log('[MCP v2.0 Real Integration] Tools: ' + toolDefinitions.map(t => t.name).join(', '));
  console.log('[MCP v2.0 Real Integration] Dashboard API: ' + (process.env.DASHBOARD_API_URL || 'http://office:3030/api'));
});
