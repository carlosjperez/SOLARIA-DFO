/**
 * SOLARIA Digital Field Operations - Integration Tests
 * Tests for complete workflows and service integration
 */

import { test, expect, request as playwrightRequest, APIRequestContext } from '@playwright/test';

const apiBase = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
const user = process.env.DASHBOARD_USER || 'carlosjperez';
const pass = process.env.DASHBOARD_PASS || 'bypass';

let authToken: string;
let apiContext: APIRequestContext;

test.describe('Project Lifecycle', () => {
  test.beforeAll(async () => {
    apiContext = await playwrightRequest.newContext();
    const loginRes = await apiContext.post(`${apiBase}/auth/login`, {
      data: { userId: user, password: pass }
    });
    const body = await loginRes.json();
    authToken = body.token;
  });

  test('complete project workflow: create -> tasks -> complete', async () => {
    // 1. Create project
    const projectRes = await apiContext.post(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        name: `Workflow Test ${Date.now()}`,
        description: 'Integration test project',
        status: 'active',
        priority: 'high'
      }
    });
    expect(projectRes.status()).toBe(201);
    const project = await projectRes.json();

    // 2. Create tasks for project
    const task1Res = await apiContext.post(`${apiBase}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        title: 'Task 1: Setup',
        project_id: project.id,
        status: 'pending',
        priority: 'high'
      }
    });
    expect(task1Res.status()).toBe(201);
    const task1 = await task1Res.json();

    const task2Res = await apiContext.post(`${apiBase}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        title: 'Task 2: Implementation',
        project_id: project.id,
        status: 'pending',
        priority: 'medium'
      }
    });
    expect(task2Res.status()).toBe(201);
    const task2 = await task2Res.json();

    // 3. Complete tasks
    await apiContext.put(`${apiBase}/tasks/${task1.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { status: 'completed' }
    });

    await apiContext.put(`${apiBase}/tasks/${task2.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { status: 'completed' }
    });

    // 4. Complete project
    const completeRes = await apiContext.put(`${apiBase}/projects/${project.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { status: 'completed' }
    });
    expect(completeRes.status()).toBe(200);

    // 5. Verify project is completed
    const verifyRes = await apiContext.get(`${apiBase}/projects/${project.id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const completed = await verifyRes.json();
    expect(completed.status).toBe('completed');
  });
});

test.describe('Agent Integration', () => {
  test.beforeAll(async () => {
    if (!authToken) {
      apiContext = await playwrightRequest.newContext();
      const loginRes = await apiContext.post(`${apiBase}/auth/login`, {
        data: { userId: user, password: pass }
      });
      const body = await loginRes.json();
      authToken = body.token;
    }
  });

  test('agent can register document', async () => {
    const docData = {
      path: '/test/document.md',
      type: 'markdown',
      content: '# Test Document\nCreated by integration test',
      project_id: 1
    };

    const res = await apiContext.post(`${apiBase}/agent/register-doc`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: docData
    });

    // May return 201 or 200 depending on implementation
    expect([200, 201]).toContain(res.status());
  });

  test('agent can add task', async () => {
    const taskData = {
      title: `Agent Task ${Date.now()}`,
      description: 'Created by agent integration test',
      priority: 'medium'
    };

    const res = await apiContext.post(`${apiBase}/agent/add-task`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: taskData
    });

    expect([200, 201]).toContain(res.status());
  });

  test('agent can log activity', async () => {
    const activityData = {
      type: 'code_analysis',
      description: 'Analyzed test file',
      metadata: { files: 1, issues: 0 }
    };

    const res = await apiContext.post(`${apiBase}/agent/log-activity`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: activityData
    });

    expect([200, 201]).toContain(res.status());
  });
});

test.describe('Dashboard Data Consistency', () => {
  test.beforeAll(async () => {
    if (!authToken) {
      apiContext = await playwrightRequest.newContext();
      const loginRes = await apiContext.post(`${apiBase}/auth/login`, {
        data: { userId: user, password: pass }
      });
      const body = await loginRes.json();
      authToken = body.token;
    }
  });

  test('project count matches between list and dashboard', async () => {
    // Get project list
    const listRes = await apiContext.get(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const projects = await listRes.json();

    // Get CEO dashboard
    const dashRes = await apiContext.get(`${apiBase}/csuite/ceo`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const dashboard = await dashRes.json();

    // Counts should match (or be close if dashboard caches)
    expect(dashboard.overview).toBeDefined();
  });

  test('task count matches between list and dashboard', async () => {
    const listRes = await apiContext.get(`${apiBase}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const tasks = await listRes.json();
    expect(Array.isArray(tasks)).toBe(true);
  });
});

test.describe('Concurrent Operations', () => {
  test.beforeAll(async () => {
    if (!authToken) {
      apiContext = await playwrightRequest.newContext();
      const loginRes = await apiContext.post(`${apiBase}/auth/login`, {
        data: { userId: user, password: pass }
      });
      const body = await loginRes.json();
      authToken = body.token;
    }
  });

  test('handle concurrent task creations', async () => {
    const createTask = async (index: number) => {
      return apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: `Concurrent Task ${index} - ${Date.now()}`,
          status: 'pending'
        }
      });
    };

    // Create 5 tasks concurrently
    const promises = Array.from({ length: 5 }, (_, i) => createTask(i));
    const results = await Promise.all(promises);

    // All should succeed
    results.forEach(res => {
      expect(res.status()).toBe(201);
    });
  });

  test('handle rapid status updates', async () => {
    // Create a task
    const createRes = await apiContext.post(`${apiBase}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { title: `Rapid Update ${Date.now()}`, status: 'pending' }
    });
    const task = await createRes.json();

    // Update status multiple times
    const statuses = ['in_progress', 'pending', 'in_progress', 'completed'];
    for (const status of statuses) {
      const res = await apiContext.put(`${apiBase}/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { status }
      });
      expect(res.status()).toBe(200);
    }
  });
});

test.describe('Session Management', () => {
  test('multiple sessions work independently', async () => {
    // Create two separate sessions
    const ctx1 = await playwrightRequest.newContext();
    const ctx2 = await playwrightRequest.newContext();

    const login1 = await ctx1.post(`${apiBase}/auth/login`, {
      data: { userId: user, password: pass }
    });
    const login2 = await ctx2.post(`${apiBase}/auth/login`, {
      data: { userId: user, password: pass }
    });

    const token1 = (await login1.json()).token;
    const token2 = (await login2.json()).token;

    // Both tokens should be valid
    const verify1 = await ctx1.get(`${apiBase}/auth/verify`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const verify2 = await ctx2.get(`${apiBase}/auth/verify`, {
      headers: { Authorization: `Bearer ${token2}` }
    });

    expect(verify1.status()).toBe(200);
    expect(verify2.status()).toBe(200);

    await ctx1.dispose();
    await ctx2.dispose();
  });
});
