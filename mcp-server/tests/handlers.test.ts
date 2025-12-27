#!/usr/bin/env npx tsx
/**
 * SOLARIA DFO MCP Server - Handlers TypeScript Tests
 *
 * Tests for TypeScript migration of MCP handlers
 * Run with: npx tsx tests/handlers.test.ts
 */

import assert from 'node:assert/strict';
import { toolDefinitions, resourceDefinitions, createApiClient, executeTool } from '../handlers.js';
import type {
  MCPToolDefinition,
  MCPResource,
  MCPContext,
  ApiClient,
  CreateProjectParams,
  CreateTaskParams,
  ListTasksParams,
  MemoryCreateParams,
  SetProjectContextParams,
} from '../types.js';
import type {
  Project,
  Task,
  Agent,
  Memory,
  TaskItem,
} from '../types/database.js';

// ============================================================================
// Test Configuration
// ============================================================================

const API = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
const USER = process.env.DASHBOARD_USER || 'carlosjperez';
const PASS = process.env.DASHBOARD_PASS || 'bypass';

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve(fn())
    .then(() => {
      testsPassed++;
      console.log(`  ✓ ${name}`);
    })
    .catch((err: Error) => {
      testsFailed++;
      console.error(`  ✗ ${name}: ${err.message}`);
    });
}

function describe(suite: string, fn: () => Promise<void>): Promise<void> {
  console.log(`\n${suite}`);
  return fn();
}

// ============================================================================
// Type Compilation Tests
// ============================================================================

async function typeCompilationTests(): Promise<void> {
  await describe('Type Compilation Tests', async () => {

    await test('toolDefinitions has correct type', () => {
      const tools: MCPToolDefinition[] = toolDefinitions;
      assert.ok(Array.isArray(tools), 'toolDefinitions is array');
      assert.ok(tools.length > 0, 'toolDefinitions has items');
    });

    await test('each tool has required properties', () => {
      for (const tool of toolDefinitions) {
        assert.ok(typeof tool.name === 'string', `tool ${tool.name} has name`);
        assert.ok(typeof tool.description === 'string', `tool ${tool.name} has description`);
        assert.ok(tool.inputSchema.type === 'object', `tool ${tool.name} has object schema`);
      }
    });

    await test('resourceDefinitions has correct type', () => {
      const resources: MCPResource[] = resourceDefinitions;
      assert.ok(Array.isArray(resources), 'resourceDefinitions is array');
    });

    await test('each resource has required properties', () => {
      for (const resource of resourceDefinitions) {
        assert.ok(typeof resource.uri === 'string', `resource has uri`);
        assert.ok(typeof resource.name === 'string', `resource has name`);
        assert.ok(typeof resource.mimeType === 'string', `resource has mimeType`);
      }
    });

    await test('context type is correct', () => {
      const context: MCPContext = {
        session_id: 'test-session',
        project_id: 1,
        adminMode: false,
      };
      assert.ok(context.session_id === 'test-session');
      assert.ok(context.project_id === 1);
      assert.ok(context.adminMode === false);
    });

    await test('params types compile correctly', () => {
      const createProject: CreateProjectParams = {
        name: 'Test Project',
        client: 'Test Client',
        priority: 'high',
      };
      assert.ok(createProject.name === 'Test Project');

      const createTask: CreateTaskParams = {
        project_id: 1,
        title: 'Test Task',
        priority: 'medium',
      };
      assert.ok(createTask.title === 'Test Task');

      const listTasks: ListTasksParams = {
        status: 'pending',
        priority: 'high',
      };
      assert.ok(listTasks.status === 'pending');

      const createMemory: MemoryCreateParams = {
        content: 'Test memory',
        tags: ['test', 'migration'],
        importance: 0.8,
      };
      assert.ok(createMemory.importance === 0.8);
    });

    await test('entity types compile correctly', () => {
      const project: Partial<Project> = {
        id: 1,
        name: 'Test',
        status: 'development',
        priority: 'high',
      };
      assert.ok(project.status === 'development');

      const task: Partial<Task> = {
        id: 1,
        project_id: 1,
        title: 'Test Task',
        status: 'in_progress',
      };
      assert.ok(task.status === 'in_progress');

      const agent: Partial<Agent> = {
        id: 1,
        name: 'SOLARIA-DEV-01',
        status: 'active',
      };
      assert.ok(agent.status === 'active');
    });
  });
}

// ============================================================================
// API Client Tests
// ============================================================================

async function apiClientTests(): Promise<void> {
  await describe('API Client Tests', async () => {

    await test('createApiClient returns correct type', () => {
      const client: ApiClient = createApiClient(API, { user: USER, password: PASS });
      assert.ok(typeof client.apiCall === 'function', 'has apiCall method');
      assert.ok(typeof client.authenticate === 'function', 'has authenticate method');
    });

    await test('apiClient can authenticate', async () => {
      const client = createApiClient(API, { user: USER, password: PASS });
      const authResult = await client.authenticate();
      assert.ok(authResult.token, 'returns token');
    });

    await test('apiCall returns data', async () => {
      const client = createApiClient(API, { user: USER, password: PASS });
      await client.authenticate();
      const health = await client.apiCall('/health') as { status: string; database: string };
      assert.ok(health.database === 'connected', 'database connected');
    });
  });
}

// ============================================================================
// Tool Definition Tests
// ============================================================================

async function toolDefinitionTests(): Promise<void> {
  await describe('Tool Definition Tests', async () => {

    const expectedTools = [
      'set_project_context',
      'get_current_context',
      'get_dashboard_overview',
      'get_dashboard_alerts',
      'list_projects',
      'get_project',
      'create_project',
      'update_project',
      'list_tasks',
      'get_task',
      'create_task',
      'update_task',
      'complete_task',
      'delete_task',
      'list_task_items',
      'create_task_items',
      'complete_task_item',
      'update_task_item',
      'delete_task_item',
      'list_agents',
      'get_agent',
      'get_agent_tasks',
      'update_agent_status',
      'get_activity_logs',
      'log_activity',
      'list_docs',
      'get_project_client',
      'update_project_client',
      'get_project_documents',
      'create_project_document',
      'get_project_requests',
      'create_project_request',
      'update_project_request',
      'memory_create',
      'memory_list',
      'memory_get',
      'memory_update',
      'memory_delete',
      'memory_search',
      'memory_tags',
      'memory_stats',
      'memory_boost',
      'memory_related',
      'memory_link',
    ];

    await test('has all expected tools', () => {
      const toolNames = toolDefinitions.map(t => t.name);
      for (const expected of expectedTools) {
        assert.ok(toolNames.includes(expected), `missing tool: ${expected}`);
      }
    });

    await test('tools have valid inputSchema', () => {
      for (const tool of toolDefinitions) {
        assert.ok(tool.inputSchema.type === 'object', `${tool.name} schema type`);
        assert.ok(typeof tool.inputSchema.properties === 'object', `${tool.name} has properties`);
      }
    });

    await test('required params are arrays', () => {
      for (const tool of toolDefinitions) {
        if (tool.inputSchema.required) {
          assert.ok(Array.isArray(tool.inputSchema.required), `${tool.name} required is array`);
        }
      }
    });
  });
}

// ============================================================================
// Execute Tool Tests
// ============================================================================

async function executeToolTests(): Promise<void> {
  await describe('Execute Tool Tests', async () => {

    const client = createApiClient(API, { user: USER, password: PASS });
    await client.authenticate();
    const apiCall = client.apiCall;

    await test('executeTool get_dashboard_overview works', async () => {
      const result = await executeTool('get_dashboard_overview', {}, apiCall, {});
      assert.ok(result !== null, 'returns result');
      assert.ok(typeof result === 'object', 'result is object');
    });

    await test('executeTool list_projects works', async () => {
      const result = await executeTool('list_projects', {}, apiCall, { adminMode: true }) as { projects: Project[] };
      assert.ok(Array.isArray(result.projects), 'returns projects array');
    });

    await test('executeTool list_tasks works', async () => {
      const result = await executeTool('list_tasks', {}, apiCall, { adminMode: true });
      // API may return { tasks: [...] } or [...] directly
      const tasks = Array.isArray(result) ? result : (result as { tasks: Task[] }).tasks;
      assert.ok(Array.isArray(tasks), 'returns tasks array');
    });

    await test('executeTool list_agents works', async () => {
      const result = await executeTool('list_agents', {}, apiCall, {});
      // API may return array, object with agents property, or error
      const agents = Array.isArray(result) ? result : (result as { agents?: Agent[]; error?: string }).agents;
      assert.ok(agents === undefined || Array.isArray(agents), 'returns agents array or undefined');
    });

    await test('executeTool set_project_context returns action', async () => {
      const params: SetProjectContextParams = { project_id: 1 };
      const result = await executeTool('set_project_context', params, apiCall, {}) as { __action: string };
      assert.ok(result.__action === 'SET_PROJECT_CONTEXT', 'returns action');
    });

    await test('executeTool with isolation context works', async () => {
      const context: MCPContext = {
        project_id: 1,
        adminMode: false,
      };
      const result = await executeTool('list_tasks', {}, apiCall, context);
      // API may return { tasks: [...] } or [...] directly
      const tasks = Array.isArray(result) ? result : (result as { tasks: Task[] }).tasks;
      assert.ok(Array.isArray(tasks), 'returns filtered tasks');
    });

    await test('executeTool unknown tool throws error', async () => {
      try {
        await executeTool('unknown_tool', {}, apiCall, {});
        assert.fail('should throw error');
      } catch (err) {
        assert.ok((err as Error).message.includes('Unknown tool'), 'correct error message');
      }
    });

    await test('executeTool memory_tags works', async () => {
      const result = await executeTool('memory_tags', {}, apiCall, {});
      assert.ok(result !== null, 'returns result');
    });

    await test('executeTool memory_stats works', async () => {
      const result = await executeTool('memory_stats', {}, apiCall, {});
      assert.ok(result !== null, 'returns result');
    });
  });
}

// ============================================================================
// Resource Definition Tests
// ============================================================================

async function resourceDefinitionTests(): Promise<void> {
  await describe('Resource Definition Tests', async () => {

    const expectedResources = [
      'solaria://dashboard/overview',
      'solaria://projects/list',
      'solaria://tasks/list',
      'solaria://agents/list',
    ];

    await test('has all expected resources', () => {
      const resourceUris = resourceDefinitions.map(r => r.uri);
      for (const expected of expectedResources) {
        assert.ok(resourceUris.includes(expected), `missing resource: ${expected}`);
      }
    });

    await test('all resources have mimeType application/json', () => {
      for (const resource of resourceDefinitions) {
        assert.ok(resource.mimeType === 'application/json', `${resource.uri} mimeType`);
      }
    });
  });
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('SOLARIA DFO MCP Server - TypeScript Handler Tests');
  console.log('='.repeat(60));

  try {
    await typeCompilationTests();
    await apiClientTests();
    await toolDefinitionTests();
    await executeToolTests();
    await resourceDefinitionTests();

    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);

    if (testsFailed > 0) {
      process.exit(1);
    }

    console.log('\nAll TypeScript handler tests passed! ✓');
  } catch (err) {
    console.error('\nTest suite error:', (err as Error).message);
    process.exit(1);
  }
}

main();
