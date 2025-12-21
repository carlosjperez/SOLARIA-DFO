/**
 * SOLARIA Digital Field Operations - Task Coding System Tests
 * Tests for project codes (3-letter), epics, sprints, and task code suffixes
 */

import { test, expect, request as playwrightRequest, APIRequestContext } from '@playwright/test';

const apiBase = process.env.DASHBOARD_API_URL || (process.env.DFO_BASE_URL ? `${process.env.DFO_BASE_URL}/api` : 'http://localhost:3030/api');
const user = process.env.DASHBOARD_USER || 'carlosjperez';
const pass = process.env.DASHBOARD_PASS || 'bypass';

let authToken: string;
let apiContext: APIRequestContext;

// Test data cleanup tracking
let createdProjectIds: number[] = [];
let createdEpicIds: number[] = [];
let createdSprintIds: number[] = [];
let createdTaskIds: number[] = [];

test.describe('Task Coding System', () => {
  test.beforeAll(async () => {
    apiContext = await playwrightRequest.newContext();
    const loginRes = await apiContext.post(`${apiBase}/auth/login`, {
      data: { userId: user, password: pass }
    });
    const body = await loginRes.json();
    authToken = body.token;
  });

  test.afterAll(async () => {
    // Cleanup created test data
    for (const taskId of createdTaskIds) {
      await apiContext.delete(`${apiBase}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).catch(() => {});
    }
    for (const epicId of createdEpicIds) {
      await apiContext.delete(`${apiBase}/epics/${epicId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).catch(() => {});
    }
    for (const sprintId of createdSprintIds) {
      await apiContext.delete(`${apiBase}/sprints/${sprintId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).catch(() => {});
    }
    for (const projectId of createdProjectIds) {
      await apiContext.delete(`${apiBase}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).catch(() => {});
    }
    await apiContext.dispose();
  });

  // ========================================================================
  // Project Code Tests
  // ========================================================================

  test.describe('Project Code Validation', () => {
    test('check-code endpoint returns available for valid unused code', async () => {
      const res = await apiContext.get(`${apiBase}/projects/check-code/XYZ`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('available', true);
      expect(body).toHaveProperty('code', 'XYZ');
    });

    test('check-code endpoint returns not available for existing code', async () => {
      const res = await apiContext.get(`${apiBase}/projects/check-code/DFO`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('available', false);
      expect(body.reason).toContain('used by project');
    });

    test('check-code endpoint returns not available for reserved code', async () => {
      const res = await apiContext.get(`${apiBase}/projects/check-code/API`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('available', false);
      expect(body.reason).toContain('reserved');
    });

    test('check-code endpoint rejects invalid format (too short)', async () => {
      const res = await apiContext.get(`${apiBase}/projects/check-code/AB`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('available', false);
      expect(body.reason).toContain('3 uppercase letters');
    });

    test('check-code endpoint rejects invalid format (too long)', async () => {
      const res = await apiContext.get(`${apiBase}/projects/check-code/ABCD`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('available', false);
    });

    test('check-code endpoint normalizes lowercase to uppercase', async () => {
      const res = await apiContext.get(`${apiBase}/projects/check-code/xyz`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.code).toBe('XYZ');
    });
  });

  test.describe('Project Creation with Custom Code', () => {
    test('create project with valid 3-letter code succeeds', async () => {
      const uniqueCode = `T${String(Date.now()).slice(-2)}`;
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: `Test Project ${uniqueCode}`,
          code: uniqueCode,
          description: 'Test project with custom code'
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('code', uniqueCode.toUpperCase());
      createdProjectIds.push(body.id);
    });

    test('create project with duplicate code fails with 409', async () => {
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Duplicate Code Project',
          code: 'DFO',  // Already exists
          description: 'Should fail'
        }
      });

      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(body.error).toContain('already in use');
    });

    test('create project with reserved code fails with 400', async () => {
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Reserved Code Project',
          code: 'API',  // Reserved
          description: 'Should fail'
        }
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('reserved');
    });

    test('create project with invalid code format fails', async () => {
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Invalid Code Project',
          code: 'AB',  // Too short
          description: 'Should fail'
        }
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('3 uppercase letters');
    });

    test('create project without code auto-generates from name', async () => {
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Auto Code Generation Test',
          description: 'Should auto-generate code from name'
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('code');
      expect(body.code).toMatch(/^[A-Z0-9]{3}$/);
      createdProjectIds.push(body.id);
    });
  });

  // ========================================================================
  // Epic Tests
  // ========================================================================

  test.describe('Epics CRUD', () => {
    let testProjectId: number;

    test.beforeAll(async () => {
      // Create a test project for epic tests
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Epic Test Project',
          code: 'ETP',
          description: 'Project for testing epics'
        }
      });
      const body = await res.json();
      testProjectId = body.id;
      createdProjectIds.push(testProjectId);
    });

    test('create epic with auto-incrementing number', async () => {
      const res = await apiContext.post(`${apiBase}/projects/${testProjectId}/epics`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Test Epic 1',
          description: 'First test epic',
          color: '#6366f1'
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('epic_number', 1);
      createdEpicIds.push(body.id);
    });

    test('second epic gets epic_number 2', async () => {
      const res = await apiContext.post(`${apiBase}/projects/${testProjectId}/epics`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Test Epic 2',
          description: 'Second test epic'
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.epic_number).toBe(2);
      createdEpicIds.push(body.id);
    });

    test('list project epics returns all epics', async () => {
      const res = await apiContext.get(`${apiBase}/projects/${testProjectId}/epics`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('epics');
      expect(body.epics.length).toBeGreaterThanOrEqual(2);
    });

    test('update epic changes fields', async () => {
      const epicId = createdEpicIds[0];
      const res = await apiContext.put(`${apiBase}/epics/${epicId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Updated Epic Name',
          status: 'in_progress'
        }
      });

      expect(res.status()).toBe(200);
    });

    test('delete epic succeeds', async () => {
      // Create a temporary epic to delete
      const createRes = await apiContext.post(`${apiBase}/projects/${testProjectId}/epics`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Epic to Delete' }
      });
      const { id: epicId } = await createRes.json();

      const deleteRes = await apiContext.delete(`${apiBase}/epics/${epicId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(deleteRes.status()).toBe(200);
    });
  });

  // ========================================================================
  // Sprint Tests
  // ========================================================================

  test.describe('Sprints CRUD', () => {
    let testProjectId: number;

    test.beforeAll(async () => {
      // Create a test project for sprint tests
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Sprint Test Project',
          code: 'STP',
          description: 'Project for testing sprints'
        }
      });
      const body = await res.json();
      testProjectId = body.id;
      createdProjectIds.push(testProjectId);
    });

    test('create sprint with auto-incrementing number', async () => {
      const res = await apiContext.post(`${apiBase}/projects/${testProjectId}/sprints`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Sprint 1',
          goal: 'Complete initial features',
          start_date: '2025-01-01',
          end_date: '2025-01-14'
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('sprint_number', 1);
      createdSprintIds.push(body.id);
    });

    test('second sprint gets sprint_number 2', async () => {
      const res = await apiContext.post(`${apiBase}/projects/${testProjectId}/sprints`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Sprint 2',
          goal: 'Second sprint goals'
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.sprint_number).toBe(2);
      createdSprintIds.push(body.id);
    });

    test('list project sprints returns all sprints', async () => {
      const res = await apiContext.get(`${apiBase}/projects/${testProjectId}/sprints`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('sprints');
      expect(body.sprints.length).toBeGreaterThanOrEqual(2);
    });

    test('update sprint changes fields', async () => {
      const sprintId = createdSprintIds[0];
      const res = await apiContext.put(`${apiBase}/sprints/${sprintId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          status: 'active',
          velocity: 42
        }
      });

      expect(res.status()).toBe(200);
    });

    test('delete sprint succeeds', async () => {
      // Create a temporary sprint to delete
      const createRes = await apiContext.post(`${apiBase}/projects/${testProjectId}/sprints`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Sprint to Delete' }
      });
      const { id: sprintId } = await createRes.json();

      const deleteRes = await apiContext.delete(`${apiBase}/sprints/${sprintId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(deleteRes.status()).toBe(200);
    });
  });

  // ========================================================================
  // Task Code Suffix Tests
  // ========================================================================

  test.describe('Task Code Generation with Suffixes', () => {
    let testProjectId: number;
    let testEpicId: number;
    let testSprintId: number;
    let projectCode: string;

    test.beforeAll(async () => {
      // Create project
      const projectRes = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Task Code Test Project',
          code: 'TCT',
          description: 'Project for testing task codes'
        }
      });
      const projectBody = await projectRes.json();
      testProjectId = projectBody.id;
      projectCode = projectBody.code;
      createdProjectIds.push(testProjectId);

      // Create epic
      const epicRes = await apiContext.post(`${apiBase}/projects/${testProjectId}/epics`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Test Epic for Tasks' }
      });
      const epicBody = await epicRes.json();
      testEpicId = epicBody.id;
      createdEpicIds.push(testEpicId);

      // Create sprint
      const sprintRes = await apiContext.post(`${apiBase}/projects/${testProjectId}/sprints`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Test Sprint for Tasks' }
      });
      const sprintBody = await sprintRes.json();
      testSprintId = sprintBody.id;
      createdSprintIds.push(testSprintId);
    });

    test('task without epic/sprint has no suffix', async () => {
      const res = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Simple Task',
          project_id: testProjectId
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.task_code).toMatch(/^TCT-\d{3}$/);
      createdTaskIds.push(body.id);
    });

    test('task with epic_id has -EPICXX suffix', async () => {
      const res = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Epic Task',
          project_id: testProjectId,
          epic_id: testEpicId
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.task_code).toMatch(/^TCT-\d{3}-EPIC01$/);
      createdTaskIds.push(body.id);
    });

    test('task with sprint_id has -SPXX suffix', async () => {
      const res = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Sprint Task',
          project_id: testProjectId,
          sprint_id: testSprintId
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.task_code).toMatch(/^TCT-\d{3}-SP01$/);
      createdTaskIds.push(body.id);
    });

    test('fetched task includes epic/sprint info in task_code', async () => {
      // Create task with epic
      const createRes = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Task for Fetch Test',
          project_id: testProjectId,
          epic_id: testEpicId
        }
      });
      const { id: taskId } = await createRes.json();
      createdTaskIds.push(taskId);

      // Fetch task
      const fetchRes = await apiContext.get(`${apiBase}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(fetchRes.status()).toBe(200);
      const body = await fetchRes.json();
      expect(body.task_code).toContain('-EPIC01');
    });

    test('update task to add epic updates suffix', async () => {
      // Create task without epic
      const createRes = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Task to Update',
          project_id: testProjectId
        }
      });
      const { id: taskId } = await createRes.json();
      createdTaskIds.push(taskId);

      // Update to add epic
      await apiContext.put(`${apiBase}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { epic_id: testEpicId }
      });

      // Fetch updated task
      const fetchRes = await apiContext.get(`${apiBase}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const body = await fetchRes.json();
      expect(body.task_code).toContain('-EPIC');
    });
  });

  // ========================================================================
  // Task Tag Suffix Tests
  // ========================================================================

  test.describe('Task Code with Tag Suffixes', () => {
    let testProjectId: number;

    test.beforeAll(async () => {
      // Create project for tag tests
      const res = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Tag Suffix Test Project',
          code: 'TGS',
          description: 'Project for testing tag suffixes'
        }
      });
      const body = await res.json();
      testProjectId = body.id;
      createdProjectIds.push(testProjectId);
    });

    test('task with bug tag has -BUG suffix', async () => {
      // Create task
      const createRes = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Bug Fix Task',
          project_id: testProjectId
        }
      });
      const { id: taskId } = await createRes.json();
      createdTaskIds.push(taskId);

      // Add bug tag
      await apiContext.post(`${apiBase}/tasks/${taskId}/tags`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { tag_name: 'bug' }
      });

      // Fetch task - should now have -BUG suffix
      const fetchRes = await apiContext.get(`${apiBase}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const body = await fetchRes.json();
      expect(body.task_code).toContain('-BUG');
    });

    test('task with hotfix tag has -HOT suffix', async () => {
      // Create task
      const createRes = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Hotfix Task',
          project_id: testProjectId
        }
      });
      const { id: taskId } = await createRes.json();
      createdTaskIds.push(taskId);

      // Add hotfix tag
      await apiContext.post(`${apiBase}/tasks/${taskId}/tags`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { tag_name: 'hotfix' }
      });

      // Fetch task - should now have -HOT suffix
      const fetchRes = await apiContext.get(`${apiBase}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const body = await fetchRes.json();
      expect(body.task_code).toContain('-HOT');
    });
  });

  // ========================================================================
  // Suffix Priority Tests
  // ========================================================================

  test.describe('Suffix Priority (Epic > Sprint > Tag)', () => {
    let testProjectId: number;
    let testEpicId: number;
    let testSprintId: number;

    test.beforeAll(async () => {
      // Create project
      const projectRes = await apiContext.post(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Priority Test Project',
          code: 'PRI',
          description: 'Project for testing suffix priority'
        }
      });
      const projectBody = await projectRes.json();
      testProjectId = projectBody.id;
      createdProjectIds.push(testProjectId);

      // Create epic
      const epicRes = await apiContext.post(`${apiBase}/projects/${testProjectId}/epics`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Priority Test Epic' }
      });
      testEpicId = (await epicRes.json()).id;
      createdEpicIds.push(testEpicId);

      // Create sprint
      const sprintRes = await apiContext.post(`${apiBase}/projects/${testProjectId}/sprints`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Priority Test Sprint' }
      });
      testSprintId = (await sprintRes.json()).id;
      createdSprintIds.push(testSprintId);
    });

    test('epic takes priority over sprint', async () => {
      // Create task with both epic and sprint
      const res = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Task with Epic and Sprint',
          project_id: testProjectId,
          epic_id: testEpicId,
          sprint_id: testSprintId
        }
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      // Should show EPIC, not SP
      expect(body.task_code).toContain('-EPIC');
      expect(body.task_code).not.toContain('-SP');
      createdTaskIds.push(body.id);
    });

    test('sprint takes priority over tag when no epic', async () => {
      // Create task with sprint
      const createRes = await apiContext.post(`${apiBase}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          title: 'Task with Sprint and Bug Tag',
          project_id: testProjectId,
          sprint_id: testSprintId
        }
      });
      const { id: taskId } = await createRes.json();
      createdTaskIds.push(taskId);

      // Add bug tag
      await apiContext.post(`${apiBase}/tasks/${taskId}/tags`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { tag_name: 'bug' }
      });

      // Fetch task - should show SP, not BUG
      const fetchRes = await apiContext.get(`${apiBase}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const body = await fetchRes.json();
      expect(body.task_code).toContain('-SP');
      expect(body.task_code).not.toContain('-BUG');
    });
  });
});
