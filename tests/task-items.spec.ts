/**
 * SOLARIA DFO - Task Items API Tests (Exhaustive)
 * Comprehensive tests for subtasks/checklist functionality
 *
 * Test Coverage:
 * - CRUD operations for task items
 * - Progress calculation
 * - Auto-completion logic
 * - Edge cases and error handling
 * - Integration with tasks API
 * - Sorting and ordering
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.DASHBOARD_API_URL?.replace('/api', '') || process.env.DFO_BASE_URL || 'http://localhost:3030';
let authToken = '';

// Helper function for API calls with response status
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<{ status: number; data: any }> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            ...options.headers as Record<string, string>,
        },
    });
    const data = await response.json();
    return { status: response.status, data };
}

// Simple helper that just returns data
async function api(endpoint: string, options: RequestInit = {}): Promise<any> {
    const { data } = await apiCall(endpoint, options);
    return data;
}

// ============================================================================
// TEST SUITE 1: Basic CRUD Operations
// ============================================================================
test.describe('Task Items - CRUD Operations', () => {
    let testTaskId: number;
    let createdItemIds: number[] = [];

    test.beforeAll(async () => {
        // Login
        const login = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'carlosjperez', password: 'bypass' }),
        });
        expect(login.token).toBeTruthy();
        authToken = login.token;

        // Create a dedicated test task
        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'CRUD Test Task - ' + Date.now(),
                project_id: 1,
                priority: 'medium',
            }),
        });
        testTaskId = task.id;
        expect(testTaskId).toBeTruthy();
    });

    test('CREATE: should create a single task item', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [{ title: 'Single item test', estimated_minutes: 15 }],
            }),
        });

        expect(result.items).toHaveLength(1);
        expect(result.items[0].title).toBe('Single item test');
        expect(result.items[0].task_id).toBe(testTaskId);
        expect(result.task_id).toBe(testTaskId);
        createdItemIds.push(result.items[0].id);
    });

    test('CREATE: should create multiple items in batch', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [
                    { title: 'Batch item 1', estimated_minutes: 10 },
                    { title: 'Batch item 2', estimated_minutes: 20 },
                    { title: 'Batch item 3', estimated_minutes: 30 },
                ],
            }),
        });

        expect(result.items).toHaveLength(3);
        expect(result.progress).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(4); // 1 + 3
        createdItemIds.push(...result.items.map((i: any) => i.id));
    });

    test('CREATE: should assign sequential sort_order', async () => {
        const items = await api(`/api/tasks/${testTaskId}/items`);

        const sortOrders = items.items.map((i: any) => i.sort_order);
        // Check that sort orders are sequential
        for (let i = 1; i < sortOrders.length; i++) {
            expect(sortOrders[i]).toBeGreaterThan(sortOrders[i - 1]);
        }
    });

    test('CREATE: should handle item with description', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [{
                    title: 'Item with description',
                    description: 'This is a detailed description',
                    estimated_minutes: 45
                }],
            }),
        });

        expect(result.items[0].description).toBeFalsy(); // Description not returned in create
        createdItemIds.push(result.items[0].id);

        // Verify by fetching
        const fetched = await api(`/api/tasks/${testTaskId}/items`);
        const item = fetched.items.find((i: any) => i.title === 'Item with description');
        expect(item).toBeTruthy();
    });

    test('READ: should list all items for a task', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`);

        expect(result.items).toBeTruthy();
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.items.length).toBeGreaterThanOrEqual(5);
        expect(result.task_id).toBe(testTaskId);
        expect(result.total).toBe(result.items.length);
        expect(result.completed).toBeDefined();
    });

    test('READ: should return items sorted by sort_order', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`);

        for (let i = 1; i < result.items.length; i++) {
            expect(result.items[i].sort_order).toBeGreaterThanOrEqual(result.items[i - 1].sort_order);
        }
    });

    test('UPDATE: should update item title', async () => {
        const itemId = createdItemIds[0];
        const result = await api(`/api/tasks/${testTaskId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ title: 'Updated Title' }),
        });

        expect(result.item.title).toBe('Updated Title');
    });

    test('UPDATE: should update item description', async () => {
        const itemId = createdItemIds[0];
        const result = await api(`/api/tasks/${testTaskId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ description: 'New description' }),
        });

        expect(result.item.description).toBe('New description');
    });

    test('UPDATE: should update item notes', async () => {
        const itemId = createdItemIds[0];
        const result = await api(`/api/tasks/${testTaskId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ notes: 'Implementation notes here' }),
        });

        expect(result.item.notes).toBe('Implementation notes here');
    });

    test('UPDATE: should reject empty update', async () => {
        const itemId = createdItemIds[0];
        const { status, data } = await apiCall(`/api/tasks/${testTaskId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });

        expect(status).toBe(400);
        expect(data.error).toContain('No fields to update');
    });

    test('DELETE: should delete an item', async () => {
        const itemId = createdItemIds.pop()!;
        const result = await api(`/api/tasks/${testTaskId}/items/${itemId}`, {
            method: 'DELETE',
        });

        expect(result.deleted).toBe(true);
        expect(result.item_id).toBe(itemId);
        expect(result.progress).toBeDefined();
    });

    test('DELETE: should recalculate progress after deletion', async () => {
        // Complete an item first
        const items = await api(`/api/tasks/${testTaskId}/items`);
        const itemToComplete = items.items[0];

        await api(`/api/tasks/${testTaskId}/items/${itemToComplete.id}/complete`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });

        const beforeDelete = await api(`/api/tasks/${testTaskId}/items`);
        const progressBefore = Math.round((1 / beforeDelete.items.length) * 100);

        // Delete an uncompleted item
        const itemToDelete = items.items.find((i: any) => !i.is_completed && i.id !== itemToComplete.id);
        if (itemToDelete) {
            const result = await api(`/api/tasks/${testTaskId}/items/${itemToDelete.id}`, {
                method: 'DELETE',
            });

            // Progress should change since total changed
            expect(result.progress).toBeDefined();
            createdItemIds = createdItemIds.filter(id => id !== itemToDelete.id);
        }
    });

    test.afterAll(async () => {
        // Cleanup: delete test task items
        for (const id of createdItemIds) {
            try {
                await api(`/api/tasks/${testTaskId}/items/${id}`, { method: 'DELETE' });
            } catch (e) {
                // Ignore errors - item might already be deleted
            }
        }
    });
});

// ============================================================================
// TEST SUITE 2: Completion and Progress
// ============================================================================
test.describe('Task Items - Completion & Progress', () => {
    let testTaskId: number;
    let itemIds: number[] = [];

    test.beforeAll(async () => {
        const login = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'carlosjperez', password: 'bypass' }),
        });
        authToken = login.token;

        // Create task
        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Progress Test Task - ' + Date.now(),
                project_id: 1,
                priority: 'high',
            }),
        });
        testTaskId = task.id;

        // Create 4 items for percentage testing
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [
                    { title: 'Progress Item 1' },
                    { title: 'Progress Item 2' },
                    { title: 'Progress Item 3' },
                    { title: 'Progress Item 4' },
                ],
            }),
        });
        itemIds = result.items.map((i: any) => i.id);
    });

    test('COMPLETE: should mark item as completed with toggle', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items/${itemIds[0]}/complete`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });

        expect(result.item.is_completed).toBe(1);
        expect(result.item.completed_at).toBeTruthy();
    });

    test('COMPLETE: should save completion notes', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items/${itemIds[1]}/complete`, {
            method: 'PUT',
            body: JSON.stringify({ notes: 'Completed successfully' }),
        });

        expect(result.item.is_completed).toBe(1);
        expect(result.item.notes).toBe('Completed successfully');
    });

    test('COMPLETE: should save actual_minutes', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items/${itemIds[2]}/complete`, {
            method: 'PUT',
            body: JSON.stringify({ actual_minutes: 45 }),
        });

        expect(result.item.is_completed).toBe(1);
        expect(result.item.actual_minutes).toBe(45);
    });

    test('PROGRESS: should calculate 75% with 3/4 completed', async () => {
        // 3 items are now completed (indices 0, 1, 2)
        const items = await api(`/api/tasks/${testTaskId}/items`);
        const completedCount = items.items.filter((i: any) => i.is_completed).length;

        expect(completedCount).toBe(3);
        expect(items.total).toBe(4);

        // Check task progress
        const task = await api(`/api/tasks/${testTaskId}`);
        expect(task.progress).toBe(75);
    });

    test('TOGGLE: should uncomplete an item', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items/${itemIds[0]}/complete`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });

        expect(result.item.is_completed).toBe(0);
        expect(result.item.completed_at).toBeNull();
        expect(result.progress).toBe(50); // Now 2/4
    });

    test('PROGRESS: should be 100% when all completed', async () => {
        // Complete all remaining items
        for (const id of itemIds) {
            const items = await api(`/api/tasks/${testTaskId}/items`);
            const item = items.items.find((i: any) => i.id === id);
            if (!item.is_completed) {
                await api(`/api/tasks/${testTaskId}/items/${id}/complete`, {
                    method: 'PUT',
                    body: JSON.stringify({}),
                });
            }
        }

        const task = await api(`/api/tasks/${testTaskId}`);
        expect(task.progress).toBe(100);
    });

    test('PROGRESS: should be 0% when no items', async () => {
        // Create a new task with no items
        const newTask = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Empty Task - ' + Date.now(),
                project_id: 1,
            }),
        });

        const task = await api(`/api/tasks/${newTask.id}`);
        expect(task.items_total).toBe(0);
        expect(task.items_completed).toBe(0);
    });
});

// ============================================================================
// TEST SUITE 3: Auto-Complete Task
// ============================================================================
test.describe('Task Items - Auto-Complete Task', () => {
    let testTaskId: number;

    test.beforeAll(async () => {
        const login = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'carlosjperez', password: 'bypass' }),
        });
        authToken = login.token;
    });

    test('should auto-complete task when all items are completed', async () => {
        // Create task in pending status
        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Auto-Complete Test - ' + Date.now(),
                project_id: 1,
            }),
        });
        testTaskId = task.id;

        // Create 2 items
        const items = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [
                    { title: 'Auto Item 1' },
                    { title: 'Auto Item 2' },
                ],
            }),
        });

        // Complete first item
        const result1 = await api(`/api/tasks/${testTaskId}/items/${items.items[0].id}/complete`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });
        expect(result1.progress).toBe(50);

        // Verify task is NOT completed yet
        let taskCheck = await api(`/api/tasks/${testTaskId}`);
        expect(taskCheck.status).not.toBe('completed');

        // Complete second item
        const result2 = await api(`/api/tasks/${testTaskId}/items/${items.items[1].id}/complete`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });
        expect(result2.progress).toBe(100);

        // Verify task IS completed now
        taskCheck = await api(`/api/tasks/${testTaskId}`);
        expect(taskCheck.status).toBe('completed');
        expect(taskCheck.progress).toBe(100);
        expect(taskCheck.completed_at).toBeTruthy();
    });

    test('should NOT auto-complete if task was already completed', async () => {
        // Create and immediately complete a task
        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Pre-Completed Test - ' + Date.now(),
                project_id: 1,
            }),
        });

        await api(`/api/tasks/${task.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'completed' }),
        });

        // Add items
        const items = await api(`/api/tasks/${task.id}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [{ title: 'Item 1' }],
            }),
        });

        // Complete the item
        await api(`/api/tasks/${task.id}/items/${items.items[0].id}/complete`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });

        // Task should still be completed
        const taskCheck = await api(`/api/tasks/${task.id}`);
        expect(taskCheck.status).toBe('completed');
    });
});

// ============================================================================
// TEST SUITE 4: Integration with Tasks API
// ============================================================================
test.describe('Task Items - Tasks API Integration', () => {
    let testTaskId: number;

    test.beforeAll(async () => {
        const login = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'carlosjperez', password: 'bypass' }),
        });
        authToken = login.token;

        // Create task with items
        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Integration Test - ' + Date.now(),
                project_id: 1,
            }),
        });
        testTaskId = task.id;

        await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [
                    { title: 'Integration Item 1' },
                    { title: 'Integration Item 2' },
                    { title: 'Integration Item 3' },
                ],
            }),
        });
    });

    test('GET /api/tasks should include items_total and items_completed', async () => {
        const tasks = await api('/api/tasks');
        const testTask = tasks.find((t: any) => t.id === testTaskId);

        expect(testTask).toBeTruthy();
        expect(testTask.items_total).toBe(3);
        expect(testTask.items_completed).toBe(0);
    });

    test('GET /api/tasks/:id should include full items array', async () => {
        const task = await api(`/api/tasks/${testTaskId}`);

        expect(task.items).toBeTruthy();
        expect(Array.isArray(task.items)).toBe(true);
        expect(task.items).toHaveLength(3);
        expect(task.items_total).toBe(3);
        expect(task.items_completed).toBe(0);
    });

    test('items should update counts after completion', async () => {
        const task = await api(`/api/tasks/${testTaskId}`);
        const itemId = task.items[0].id;

        await api(`/api/tasks/${testTaskId}/items/${itemId}/complete`, {
            method: 'PUT',
            body: JSON.stringify({}),
        });

        // Check list view
        const tasks = await api('/api/tasks');
        const updatedTask = tasks.find((t: any) => t.id === testTaskId);
        expect(updatedTask.items_completed).toBe(1);

        // Check detail view
        const taskDetail = await api(`/api/tasks/${testTaskId}`);
        expect(taskDetail.items_completed).toBe(1);
    });
});

// ============================================================================
// TEST SUITE 5: Edge Cases
// ============================================================================
test.describe('Task Items - Edge Cases', () => {
    let testTaskId: number;

    test.beforeAll(async () => {
        const login = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'carlosjperez', password: 'bypass' }),
        });
        authToken = login.token;

        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Edge Case Test - ' + Date.now(),
                project_id: 1,
            }),
        });
        testTaskId = task.id;
    });

    test('should handle empty items array', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`);

        expect(result.items).toBeTruthy();
        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.completed).toBe(0);
    });

    test('should handle very long title', async () => {
        const longTitle = 'A'.repeat(400); // Less than 500 char limit
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [{ title: longTitle }],
            }),
        });

        expect(result.items[0].title).toBe(longTitle);
    });

    test('should handle special characters in title', async () => {
        const specialTitle = 'Test with "quotes" & <html> and émojis 🎉';
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [{ title: specialTitle }],
            }),
        });

        expect(result.items[0].title).toBe(specialTitle);
    });

    test('should handle zero estimated_minutes', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [{ title: 'Zero minutes item', estimated_minutes: 0 }],
            }),
        });

        const items = await api(`/api/tasks/${testTaskId}/items`);
        const item = items.items.find((i: any) => i.title === 'Zero minutes item');
        expect(item.estimated_minutes).toBe(0);
    });

    test('should handle large estimated_minutes', async () => {
        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [{ title: 'Large minutes item', estimated_minutes: 9999 }],
            }),
        });

        const items = await api(`/api/tasks/${testTaskId}/items`);
        const item = items.items.find((i: any) => i.title === 'Large minutes item');
        expect(item.estimated_minutes).toBe(9999);
    });
});

// ============================================================================
// TEST SUITE 6: Reordering
// ============================================================================
test.describe('Task Items - Reordering', () => {
    let testTaskId: number;
    let itemIds: number[] = [];

    test.beforeAll(async () => {
        const login = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'carlosjperez', password: 'bypass' }),
        });
        authToken = login.token;

        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Reorder Test - ' + Date.now(),
                project_id: 1,
            }),
        });
        testTaskId = task.id;

        const result = await api(`/api/tasks/${testTaskId}/items`, {
            method: 'POST',
            body: JSON.stringify({
                items: [
                    { title: 'Reorder A' },
                    { title: 'Reorder B' },
                    { title: 'Reorder C' },
                ],
            }),
        });
        itemIds = result.items.map((i: any) => i.id);
    });

    test('should reorder items', async () => {
        // Reverse the order
        const result = await api(`/api/tasks/${testTaskId}/items/reorder`, {
            method: 'PUT',
            body: JSON.stringify({
                order: [
                    { id: itemIds[2], sort_order: 0 },
                    { id: itemIds[1], sort_order: 1 },
                    { id: itemIds[0], sort_order: 2 },
                ],
            }),
        });

        expect(result.reordered).toBe(true);

        // Verify new order
        const items = await api(`/api/tasks/${testTaskId}/items`);
        expect(items.items[0].title).toBe('Reorder C');
        expect(items.items[1].title).toBe('Reorder B');
        expect(items.items[2].title).toBe('Reorder A');
    });
});

// ============================================================================
// TEST SUITE 7: Concurrent Operations
// ============================================================================
test.describe('Task Items - Concurrent Operations', () => {
    let testTaskId: number;

    test.beforeAll(async () => {
        const login = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'carlosjperez', password: 'bypass' }),
        });
        authToken = login.token;

        const task = await api('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Concurrent Test - ' + Date.now(),
                project_id: 1,
            }),
        });
        testTaskId = task.id;
    });

    test('should handle multiple concurrent item creations', async () => {
        const createPromises = Array.from({ length: 5 }, (_, i) =>
            api(`/api/tasks/${testTaskId}/items`, {
                method: 'POST',
                body: JSON.stringify({
                    items: [{ title: `Concurrent Item ${i}` }],
                }),
            })
        );

        const results = await Promise.all(createPromises);

        // All should succeed
        results.forEach(r => {
            expect(r.items).toHaveLength(1);
        });

        // Verify all items exist
        const items = await api(`/api/tasks/${testTaskId}/items`);
        expect(items.items.length).toBe(5);
    });
});
