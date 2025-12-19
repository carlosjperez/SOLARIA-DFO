import { test, expect } from '@playwright/test';

/**
 * DFO-036: Task Tags E2E Tests
 * Tests the tag system implementation for tasks
 */

const baseUrl = process.env.TEST_BASE_URL || 'https://dfo.solaria.agency';
const apiBase = `${baseUrl}/api`;

test.describe('DFO-036: Task Tags System', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const loginRes = await request.post(`${apiBase}/auth/login`, {
      data: { username: 'carlosjperez', password: 'bypass' }
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    authToken = loginData.token;
  });

  test('GET /api/tags returns all available tags', async ({ request }) => {
    const res = await request.get(`${apiBase}/tags`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    expect(res.status()).toBe(200);
    const data = await res.json();

    expect(data).toHaveProperty('tags');
    expect(Array.isArray(data.tags)).toBe(true);
    expect(data.tags.length).toBeGreaterThanOrEqual(10); // Predefined tags

    // Verify tag structure
    const tag = data.tags[0];
    expect(tag).toHaveProperty('id');
    expect(tag).toHaveProperty('name');
    expect(tag).toHaveProperty('color');
    expect(tag).toHaveProperty('icon');
  });

  test('tags include predefined types', async ({ request }) => {
    const res = await request.get(`${apiBase}/tags`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json();
    const tagNames = data.tags.map((t: any) => t.name);

    // Verify predefined tags exist
    expect(tagNames).toContain('bug');
    expect(tagNames).toContain('feature');
    expect(tagNames).toContain('improvement');
    expect(tagNames).toContain('refactor');
    expect(tagNames).toContain('docs');
    expect(tagNames).toContain('test');
    expect(tagNames).toContain('security');
    expect(tagNames).toContain('performance');
    expect(tagNames).toContain('ui');
    expect(tagNames).toContain('api');
  });

  test('tags have distinctive colors', async ({ request }) => {
    const res = await request.get(`${apiBase}/tags`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json();
    const colors = new Set(data.tags.map((t: any) => t.color));

    // Each tag should have unique color (at least for predefined 10)
    expect(colors.size).toBeGreaterThanOrEqual(10);

    // Verify colors are hex format
    data.tags.forEach((tag: any) => {
      expect(tag.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test('GET /api/tasks/:id/tags returns tags for a task', async ({ request }) => {
    // First get a task ID
    const tasksRes = await request.get(`${apiBase}/public/tasks`);
    const tasksData = await tasksRes.json();

    if (tasksData.tasks && tasksData.tasks.length > 0) {
      const taskId = tasksData.tasks[0].id;

      const res = await request.get(`${apiBase}/tasks/${taskId}/tags`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('task_id', taskId);
      expect(data).toHaveProperty('tags');
      expect(Array.isArray(data.tags)).toBe(true);
    }
  });

  test('POST /api/tasks/:id/tags adds tag to task', async ({ request }) => {
    // Get a task and add a tag
    const tasksRes = await request.get(`${apiBase}/public/tasks`);
    const tasksData = await tasksRes.json();

    if (tasksData.tasks && tasksData.tasks.length > 0) {
      const taskId = tasksData.tasks[0].id;

      const res = await request.post(`${apiBase}/tasks/${taskId}/tags`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        data: { tag_name: 'feature' }
      });

      // Should be 200 or 409 (already has tag)
      expect([200, 409]).toContain(res.status());
      const data = await res.json();
      expect(data).toHaveProperty('message');
    } else {
      // Skip if no tasks available
      test.skip();
    }
  });

  test('DELETE /api/tasks/:id/tags/:tagId removes tag from task', async ({ request }) => {
    // Get a task that has tags
    const tasksRes = await request.get(`${apiBase}/public/tasks`);
    const tasksData = await tasksRes.json();

    if (tasksData.tasks && tasksData.tasks.length > 0) {
      const taskId = tasksData.tasks[0].id;

      // First add a tag
      await request.post(`${apiBase}/tasks/${taskId}/tags`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        data: { tag_name: 'test' }
      });

      // Get tags to find the tag ID
      const tagsRes = await request.get(`${apiBase}/tasks/${taskId}/tags`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const tagsData = await tagsRes.json();

      if (tagsData.tags && tagsData.tags.length > 0) {
        const tagId = tagsData.tags[0].id;

        const deleteRes = await request.delete(`${apiBase}/tasks/${taskId}/tags/${tagId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect(deleteRes.status()).toBe(200);
      }
    }
  });

  test('GET /api/tasks/by-tag/:tagName filters tasks by tag', async ({ request }) => {
    const res = await request.get(`${apiBase}/tasks/by-tag/feature`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('tag', 'feature');
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('tasks');
    expect(Array.isArray(data.tasks)).toBe(true);
  });

  test('requires authentication for tag operations', async ({ request }) => {
    const res = await request.get(`${apiBase}/tags`);
    expect(res.status()).toBe(401);
  });

  test('UI shows tags section in task modal', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.fill('input[type="text"], input[name="username"]', 'carlosjperez');
    await page.fill('input[type="password"]', 'bypass');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/*', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Navigate to tasks
    await page.click('text=Tareas');
    await page.waitForTimeout(1000);

    // Click on a task to open modal
    const taskRow = page.locator('.task-list tbody tr, .task-card, [data-task-id]').first();
    if (await taskRow.count() > 0) {
      await taskRow.click();
      await page.waitForTimeout(1000);

      // Check for tags section in modal
      const tagsSection = page.locator('#taskTagsContainer, .task-tags, [class*="tag"]');
      await expect(tagsSection.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
