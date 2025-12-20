/**
 * API Fixes Tests - DFO-045 Continuation
 * Tests for:
 * - Task creation with undefined/null parameters
 * - Auto-login mechanism
 * - Tag assignment functionality
 */

const API_BASE = process.env.DASHBOARD_API_URL || process.env.API_BASE || 'http://localhost:3030/api';
const PUBLIC_API = `${API_BASE}/public`;
const AUTH_CREDENTIALS = { username: 'carlosjperez', password: 'bypass' };

// Helper function to make requests
async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    return {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : null,
        error: !response.ok ? await response.text() : null
    };
}

// Get auth token
async function getAuthToken() {
    const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(AUTH_CREDENTIALS)
    });
    if (!response.ok) throw new Error('Failed to authenticate');
    return response.data.token;
}

describe('Task Creation API - Undefined Parameter Handling', () => {
    let token;
    let createdTaskIds = [];

    beforeAll(async () => {
        token = await getAuthToken();
    });

    afterAll(async () => {
        // Cleanup created tasks
        for (const taskId of createdTaskIds) {
            try {
                await request(`/tasks/${taskId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    });

    test('should create task with only title (all optional fields undefined)', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - Minimal Fields'
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        expect(response.data.task.title).toBe('Test Task - Minimal Fields');
        createdTaskIds.push(response.data.task.id);
    });

    test('should create task without description field', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - No Description',
                priority: 'high'
                // description is intentionally not included
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        expect(response.data.task.description).toBeNull();
        createdTaskIds.push(response.data.task.id);
    });

    test('should create task with explicit null description', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - Null Description',
                description: null
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        createdTaskIds.push(response.data.task.id);
    });

    test('should create task with empty string description', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - Empty Description',
                description: ''
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        createdTaskIds.push(response.data.task.id);
    });

    test('should create task without project_id', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - No Project'
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        createdTaskIds.push(response.data.task.id);
    });

    test('should create task without assigned_agent_id', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - No Agent',
                project_id: 1
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        createdTaskIds.push(response.data.task.id);
    });

    test('should create task without estimated_hours', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - No Hours Estimate'
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        createdTaskIds.push(response.data.task.id);
    });

    test('should create task without deadline', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - No Deadline',
                estimated_hours: 8
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task).toBeDefined();
        createdTaskIds.push(response.data.task.id);
    });

    test('should auto-generate task code in DFO-XXX format', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Test Task - Code Generation',
                project_id: 1
            })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task.code).toMatch(/^DFO-\d{3}$/);
        createdTaskIds.push(response.data.task.id);
    });
});

describe('Public Tags API', () => {
    test('should return tags without authentication', async () => {
        const response = await request(`${PUBLIC_API}/tags`, {
            method: 'GET'
        });

        expect(response.ok).toBe(true);
        expect(Array.isArray(response.data)).toBe(true);
    });

    test('should return standard tag list', async () => {
        const response = await request(`${PUBLIC_API}/tags`, {
            method: 'GET'
        });

        expect(response.ok).toBe(true);
        const tagNames = response.data.map(t => t.name);
        expect(tagNames).toContain('bug');
        expect(tagNames).toContain('feature');
        expect(tagNames).toContain('docs');
    });

    test('should have color for each tag', async () => {
        const response = await request(`${PUBLIC_API}/tags`, {
            method: 'GET'
        });

        expect(response.ok).toBe(true);
        for (const tag of response.data) {
            expect(tag.color).toBeDefined();
            expect(tag.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });
});

describe('Tag Assignment API', () => {
    let token;
    let testTaskId;

    beforeAll(async () => {
        token = await getAuthToken();

        // Create a test task
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Tag Assignment Test Task',
                project_id: 1
            })
        });
        testTaskId = response.data.task.id;
    });

    afterAll(async () => {
        // Cleanup
        if (testTaskId) {
            await request(`/tasks/${testTaskId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    });

    test('should assign tag to task', async () => {
        const response = await request(`/tasks/${testTaskId}/tags`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ tag: 'bug' })
        });

        expect(response.ok).toBe(true);
    });

    test('should get task tags', async () => {
        const response = await request(`/tasks/${testTaskId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        });

        expect(response.ok).toBe(true);
        expect(response.data.tags).toBeDefined();
    });

    test('should remove tag from task', async () => {
        // First add a tag
        await request(`/tasks/${testTaskId}/tags`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ tag: 'feature' })
        });

        // Then remove it
        const response = await request(`/tasks/${testTaskId}/tags/feature`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        expect(response.ok).toBe(true);
    });

    test('should reject tag assignment without auth', async () => {
        const response = await request(`/tasks/${testTaskId}/tags`, {
            method: 'POST',
            body: JSON.stringify({ tag: 'security' })
        });

        expect(response.status).toBe(401);
    });
});

describe('Authentication and Auto-Login', () => {
    test('should login with valid credentials', async () => {
        const response = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(AUTH_CREDENTIALS)
        });

        expect(response.ok).toBe(true);
        expect(response.data.token).toBeDefined();
        expect(response.data.user).toBeDefined();
    });

    test('should reject invalid credentials', async () => {
        const response = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'invalid', password: 'wrong' })
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(401);
    });

    test('should verify valid token', async () => {
        const loginResponse = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(AUTH_CREDENTIALS)
        });

        const verifyResponse = await request('/auth/verify', {
            method: 'GET',
            headers: { Authorization: `Bearer ${loginResponse.data.token}` }
        });

        expect(verifyResponse.ok).toBe(true);
    });

    test('should reject invalid token', async () => {
        const response = await request('/auth/verify', {
            method: 'GET',
            headers: { Authorization: 'Bearer invalid-token' }
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(401);
    });

    test('should return 401 for protected endpoints without token', async () => {
        const response = await request('/tasks', {
            method: 'POST',
            body: JSON.stringify({ title: 'Test' })
        });

        expect(response.status).toBe(401);
    });
});

describe('Task Update API - Parameter Handling', () => {
    let token;
    let testTaskId;

    beforeAll(async () => {
        token = await getAuthToken();

        // Create a test task
        const response = await request('/tasks', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                title: 'Update Test Task',
                description: 'Original description',
                project_id: 1
            })
        });
        testTaskId = response.data.task.id;
    });

    afterAll(async () => {
        if (testTaskId) {
            await request(`/tasks/${testTaskId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    });

    test('should update task status', async () => {
        const response = await request(`/tasks/${testTaskId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'in_progress' })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task.status).toBe('in_progress');
    });

    test('should update task priority', async () => {
        const response = await request(`/tasks/${testTaskId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ priority: 'critical' })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task.priority).toBe('critical');
    });

    test('should update task progress', async () => {
        const response = await request(`/tasks/${testTaskId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ progress: 50 })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task.progress).toBe(50);
    });

    test('should complete task and set progress to 100', async () => {
        const response = await request(`/tasks/${testTaskId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'completed' })
        });

        expect(response.ok).toBe(true);
        expect(response.data.task.status).toBe('completed');
        expect(response.data.task.progress).toBe(100);
    });

    test('should handle project_id change', async () => {
        const response = await request(`/tasks/${testTaskId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ project_id: 2 })
        });

        expect(response.ok).toBe(true);
    });
});

describe('Health Check', () => {
    test('should return healthy status', async () => {
        const response = await request('/health');

        expect(response.ok).toBe(true);
        expect(response.data.status).toBe('healthy');
        expect(response.data.database).toBe('connected');
    });
});
