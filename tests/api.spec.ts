/**
 * SOLARIA Digital Field Operations - API Tests
 * Comprehensive test suite for the unified office service
 */

import { test, expect, request as playwrightRequest, APIRequestContext } from '@playwright/test';

const apiBase = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
const user = process.env.DASHBOARD_USER || 'carlosjperez';
const pass = process.env.DASHBOARD_PASS || 'bypass';

let authToken: string;
let apiContext: APIRequestContext;

test.describe('Health & Infrastructure', () => {
  test('health endpoint returns database status', async ({ request }) => {
    const res = await request.get(`${apiBase}/health`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('status', 'healthy');
    expect(body).toHaveProperty('database', 'connected');
    expect(body).toHaveProperty('timestamp');
  });

  test('health endpoint returns quickly (< 500ms)', async ({ request }) => {
    const start = Date.now();
    await request.get(`${apiBase}/health`);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});

test.describe('Authentication', () => {
  test('login with valid credentials returns token', async ({ request }) => {
    const res = await request.post(`${apiBase}/auth/login`, {
      data: { userId: user, password: pass }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('username', user);
  });

  test('login with invalid credentials fails', async ({ request }) => {
    const res = await request.post(`${apiBase}/auth/login`, {
      data: { userId: 'invalid', password: 'wrong' }
    });

    expect(res.status()).toBe(401);
  });

  test('verify token endpoint works', async ({ request }) => {
    // First login
    const loginRes = await request.post(`${apiBase}/auth/login`, {
      data: { userId: user, password: pass }
    });
    const { token } = await loginRes.json();

    // Then verify
    const verifyRes = await request.get(`${apiBase}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(verifyRes.status()).toBe(200);
    const body = await verifyRes.json();
    expect(body).toHaveProperty('valid', true);
  });
});

test.describe('Projects API', () => {
  test.beforeAll(async () => {
    apiContext = await playwrightRequest.newContext();
    const loginRes = await apiContext.post(`${apiBase}/auth/login`, {
      data: { userId: user, password: pass }
    });
    const body = await loginRes.json();
    authToken = body.token;
  });

  test('list projects returns array', async () => {
    const res = await apiContext.get(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('create project succeeds', async () => {
    const projectData = {
      name: `Test Project ${Date.now()}`,
      description: 'Created by API test',
      status: 'active',
      priority: 'high'
    };

    const res = await apiContext.post(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: projectData
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name', projectData.name);
  });

  test('get project by id returns project details', async () => {
    // First create a project
    const createRes = await apiContext.post(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { name: `Detail Test ${Date.now()}`, status: 'active' }
    });
    const created = await createRes.json();

    // Then get it
    const getRes = await apiContext.get(`${apiBase}/projects/${created.id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(getRes.status()).toBe(200);
    const body = await getRes.json();
    expect(body).toHaveProperty('id', created.id);
  });

  test('update project succeeds', async () => {
    // Create
    const createRes = await apiContext.post(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { name: `Update Test ${Date.now()}`, status: 'active' }
    });
    const created = await createRes.json();

    // Update
    const updateRes = await apiContext.put(`${apiBase}/projects/${created.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { status: 'completed' }
    });

    expect(updateRes.status()).toBe(200);
    const body = await updateRes.json();
    expect(body.status).toBe('completed');
  });
});

test.describe('Tasks API', () => {
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

  test('list tasks returns array', async () => {
    const res = await apiContext.get(`${apiBase}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('create task succeeds', async () => {
    const taskData = {
      title: `Test Task ${Date.now()}`,
      description: 'Created by API test',
      status: 'pending',
      priority: 'medium'
    };

    const res = await apiContext.post(`${apiBase}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: taskData
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('title', taskData.title);
  });

  test('update task status succeeds', async () => {
    // Create
    const createRes = await apiContext.post(`${apiBase}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { title: `Status Test ${Date.now()}`, status: 'pending' }
    });
    const created = await createRes.json();

    // Update
    const updateRes = await apiContext.put(`${apiBase}/tasks/${created.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { status: 'completed' }
    });

    expect(updateRes.status()).toBe(200);
  });
});

test.describe('Agents API', () => {
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

  test('list agents returns array', async () => {
    const res = await apiContext.get(`${apiBase}/agents`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

test.describe('C-Suite Dashboards', () => {
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

  test('CEO dashboard returns overview data', async () => {
    const res = await apiContext.get(`${apiBase}/csuite/ceo`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('overview');
  });

  test('CTO dashboard returns tech metrics', async () => {
    const res = await apiContext.get(`${apiBase}/csuite/cto`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(res.status()).toBe(200);
  });
});

test.describe('Error Handling', () => {
  test('protected routes require authentication', async ({ request }) => {
    const res = await request.get(`${apiBase}/projects`);
    expect(res.status()).toBe(401);
  });

  test('invalid token returns 401', async ({ request }) => {
    const res = await request.get(`${apiBase}/projects`, {
      headers: { Authorization: 'Bearer invalid_token' }
    });
    expect(res.status()).toBe(401);
  });

  test('non-existent project returns 404', async () => {
    const res = await apiContext.get(`${apiBase}/projects/99999`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(res.status()).toBe(404);
  });
});
