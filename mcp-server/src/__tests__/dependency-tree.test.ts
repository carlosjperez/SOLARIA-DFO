/**
 * Dependency Tree Visualization Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-008
 *
 * Using dependency injection pattern for testing
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import type { Database } from '../database.js';
import { getDependencyTree } from '../endpoints/dependency-tree.js';

// ============================================================================
// Test Suites
// ============================================================================

describe('DFN-008: Dependency Tree Visualization', () => {
  let mockDb: Database;
  let queryResults: any[];

  beforeEach(() => {
    queryResults = [];

    // Create fresh mock database for each test
    mockDb = {
      query: async () => {
        return queryResults.shift() || [];
      },
      execute: async () => ({ affectedRows: 0 })
    };
  });

  describe('get_dependency_tree', () => {
    describe('Validation', () => {
      it('should validate task_id is required', async () => {
        const result = await getDependencyTree.execute({} as any);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should validate task_id is positive', async () => {
        const result = await getDependencyTree.execute({ task_id: -1 } as any);

        expect(result.success).toBe(false);
      });

      it('should use default direction if not specified', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Test Task',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo
          [], // children
        ];

        const result = await getDependencyTree.execute({ task_id: 1 }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.direction).toBe('downstream');
        }
      });

      it('should validate max_depth range (1-10)', async () => {
        const result = await getDependencyTree.execute({
          task_id: 1,
          max_depth: 15,
        } as any);

        expect(result.success).toBe(false);
      });
    });

    describe('Task Not Found', () => {
      it('should return error if task does not exist', async () => {
        queryResults = [
          [], // taskExists returns empty
        ];

        const result = await getDependencyTree.execute({ task_id: 999 }, mockDb);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('TASK_NOT_FOUND');
        }
      });
    });

    describe('Single Node (No Dependencies)', () => {
      it('should return tree with single node', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root Task',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo
          [], // children (no dependencies)
        ];

        const result = await getDependencyTree.execute({ task_id: 1 }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.root).toBeDefined();
          expect(result.data.root.task_id).toBe(1);
          expect(result.data.root.children).toEqual([]);
        }
      });
    });

    describe('Linear Chain (A -> B -> C)', () => {
      it('should build linear dependency chain', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists for task 1
          [{ // getTaskInfo for task 1
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Task A',
            status: 'pending',
            progress: 0,
          }],
          [{ child_id: 2, dependency_type: 'blocks', status: 'pending' }], // children of task 1
          [{ // getTaskInfo for task 2
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Task B',
            status: 'pending',
            progress: 0,
          }],
          [{ child_id: 3, dependency_type: 'blocks', status: 'pending' }], // children of task 2
          [{ // getTaskInfo for task 3
            task_id: 3,
            task_code: 'PRJ-003',
            title: 'Task C',
            status: 'pending',
            progress: 0,
          }],
          [], // children of task 3 (none)
        ];

        const result = await getDependencyTree.execute({ task_id: 1 }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.stats.total_nodes).toBe(3);
          expect(result.data.stats.max_depth_reached).toBe(2);
          expect(result.data.root.children.length).toBe(1);
          expect(result.data.root.children[0].children.length).toBe(1);
        }
      });
    });

    describe('Max Depth Truncation', () => {
      it('should truncate tree at max_depth', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root Task',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo task 1
          [{ child_id: 2, dependency_type: 'blocks', status: 'pending' }], // children of task 1
        ];

        const result = await getDependencyTree.execute({
          task_id: 1,
          max_depth: 1,
        }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.stats.max_depth_reached).toBeLessThanOrEqual(1);
        }
      });
    });

    describe('Mixed Status Nodes', () => {
      it('should count statuses correctly', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Task A',
            status: 'completed',
            progress: 100,
          }], // getTaskInfo task 1
          [
            { child_id: 2, dependency_type: 'blocks', status: 'in_progress' },
            { child_id: 3, dependency_type: 'blocks', status: 'pending' }
          ], // children of task 1
          [{
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Task B',
            status: 'in_progress',
            progress: 50,
          }], // getTaskInfo task 2
          [], // children of task 2
          [{
            task_id: 3,
            task_code: 'PRJ-003',
            title: 'Task C',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo task 3
          [], // children of task 3
        ];

        const result = await getDependencyTree.execute({ task_id: 1 }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.stats.completed_count).toBe(1);
          expect(result.data.stats.in_progress_count).toBe(1);
          expect(result.data.stats.pending_count).toBe(1);
        }
      });
    });

    describe('ASCII Format', () => {
      it('should generate ASCII tree', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root Task',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo
          [], // children
        ];

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'ascii',
        }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.formatted).toBeDefined();
          expect(result.formatted).toContain('PRJ-001');
          expect(result.formatted).toContain('Root Task');
        }
      });

      it('should use correct status icons', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root Task',
            status: 'in_progress',
            progress: 50,
          }], // getTaskInfo
          [], // children
        ];

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'ascii',
        }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.formatted).toContain('⏳'); // in_progress icon
        }
      });
    });

    describe('Human Format', () => {
      it('should generate human-readable summary', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root Task',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo
          [], // children
        ];

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'human',
        }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.formatted).toContain('📊 Dependency Tree');
          expect(result.formatted).toContain('Statistics:');
          expect(result.formatted).toContain('Total nodes:');
        }
      });
    });

    describe('Upstream Direction', () => {
      it('should build upstream tree', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Task A',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo
          [{ child_id: 2, dependency_type: 'depends_on', status: 'pending' }], // upstream dependencies
          [{
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Task B',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo task 2
          [], // children of task 2
        ];

        const result = await getDependencyTree.execute({
          task_id: 1,
          direction: 'upstream',
        }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.direction).toBe('upstream');
          expect(result.data.upstream).toBeDefined();
        }
      });
    });

    describe('Both Directions', () => {
      it('should build both upstream and downstream', async () => {
        queryResults = [
          [{ id: 1 }], // taskExists
          // Upstream tree
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Task A',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo upstream
          [], // upstream children
          // Downstream tree
          [{
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Task A',
            status: 'pending',
            progress: 0,
          }], // getTaskInfo downstream
          [], // downstream children
        ];

        const result = await getDependencyTree.execute({
          task_id: 1,
          direction: 'both',
        }, mockDb);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.direction).toBe('both');
        }
      });
    });
  });
});
