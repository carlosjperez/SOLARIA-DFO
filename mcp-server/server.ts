const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import type { Request, Response } from 'express';
import { getProjects, getTasks, getAgents } from './src/dashboard-api.js';

export const toolDefinitions = [
  {
    name: 'get_context',
    description: 'Obtiene estado del sistema SOLARIA DFO',
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
    name: 'run_code',
    description: 'Ejecuta codigo en sandbox',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', minLength: 1 },
        language: { type: 'string', enum: ['javascript', 'typescript', 'sql'] },
        timeout: { type: 'number', default: 5000 },
        sandbox: { type: 'string', enum: ['strict', 'permissive'], default: 'strict' }
      }
    }
  }
];

const PORT = process.env.MCP_PORT || 3032;
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.post('/mcp', async (req: Request, res: Response) => {
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

      if (name === 'get_context') {
        const includeParams = toolArgs?.include || {};
        const projects = includeParams.projects ? await getProjects() : [];
        const tasks = includeParams.tasks && toolArgs.project_id ? await getTasks(toolArgs.project_id) : [];
        const agents = includeParams.agents ? await getAgents() : [];
        const health = includeParams.health ? { status: 'ok', timestamp: new Date().toISOString() } : {};

        const result = { success: true, context: { projects, tasks, agents, health } };
        res.json({ id, jsonrpc: '2.0', result });
      } else if (name === 'run_code') {
        const result = { success: true, output: null, execution_time_ms: 0 };
        res.json({ id, jsonrpc: '2.0', result });
      }
    }
  } catch (error: any) {
    res.status(500).json({ id, jsonrpc: '2.0', error: { code: -32000, message: error.message } });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '2.0-minimal', mode: 'minimal', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('[MCP v2.0 Minimalista] Starting on port ' + PORT);
  console.log('[MCP v2.0 Minimalista] Health: http://localhost:' + PORT + '/health');
  console.log('[MCP v2.0 Minimalista] Tools: ' + toolDefinitions.map(t => t.name).join(', '));
});

app.listen(PORT, () => {
  console.log('[MCP v2.0 Minimalista] Starting on port ' + PORT);
  console.log('[MCP v2.0 Minimalista] Health: http://localhost:' + PORT + '/health');
  console.log('[MCP v2.0 Minimalista] Tools: ' + toolDefinitions.map(t => t.name).join(', '));
});


app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '2.0-minimal', mode: 'minimal', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('[MCP v2.0 Minimalista] Starting on port ' + PORT);
  console.log('[MCP v2.0 Minimalista] Health: http://localhost:' + PORT + '/health');
});
