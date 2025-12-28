/**
 * Dependency Tree Visualization Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-008
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ============================================================================
// Mock Database
// ============================================================================

const mockQuery = jest.fn<(sql: string, params?: any[]) => Promise<any[]>>();

jest.unstable_mockModule('../database.js', () => ({
  db: {
    query: mockQuery,
  },
}));

// ============================================================================
// Import After Mocks
// ============================================================================

const { getDependencyTree } = await import('../endpoints/dependency-tree.js');

// ============================================================================
// Test Suites
// ============================================================================

describe('DFN-008: Dependency Tree Visualization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        mockQuery.mockResolvedValueOnce([{ id: 1 }]); // taskExists
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Test Task',
            status: 'pending',
            progress: 0,
          },
        ]); // getTaskInfo
        mockQuery.mockResolvedValueOnce([]); // children

        const result = await getDependencyTree.execute({ task_id: 1 });

        expect(result.success).toBe(true);
        expect(result.data.direction).toBe('downstream');
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
        mockQuery.mockResolvedValueOnce([]); // taskExists returns empty

        const result = await getDependencyTree.execute({ task_id: 999 });

        expect(result.success).toBe(false);
        expect(result.error.code).toBe('NOT_FOUND');
      });
    });

    describe('Single Node (No Dependencies)', () => {
      it('should return tree with single node', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 1 }]); // taskExists
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Test Task',
            status: 'completed',
            progress: 100,
          },
        ]); // getTaskInfo
        mockQuery.mockResolvedValueOnce([]); // children (empty)

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'json',
        });

        expect(result.success).toBe(true);
        expect(result.data.root).toBeDefined();
        expect(result.data.root.task_id).toBe(1);
        expect(result.data.root.children).toEqual([]);
        expect(result.data.stats.total_nodes).toBe(1);
      });
    });

    describe('Linear Chain (A -> B -> C)', () => {
      it('should build linear dependency chain', async () => {
        // Task A exists
        mockQuery.mockResolvedValueOnce([{ id: 1 }]);
        // Task A info
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Task A',
            status: 'completed',
            progress: 100,
          },
        ]);
        // Task A children (B)
        mockQuery.mockResolvedValueOnce([
          { child_id: 2, dependency_type: 'blocks', status: 'in_progress' },
        ]);
        // Task B info
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Task B',
            status: 'in_progress',
            progress: 50,
          },
        ]);
        // Task B children (C)
        mockQuery.mockResolvedValueOnce([
          { child_id: 3, dependency_type: 'blocks', status: 'pending' },
        ]);
        // Task C info
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 3,
            task_code: 'PRJ-003',
            title: 'Task C',
            status: 'pending',
            progress: 0,
          },
        ]);
        // Task C children (none)
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 1,
          direction: 'downstream',
          format: 'json',
        });

        expect(result.success).toBe(true);
        expect(result.data.stats.total_nodes).toBe(3);
        expect(result.data.stats.max_depth_reached).toBe(2);
        expect(result.data.root.children.length).toBe(1);
        expect(result.data.root.children[0].children.length).toBe(1);
      });
    });

    describe('Max Depth Truncation', () => {
      it('should truncate tree at max_depth', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 1 }]); // taskExists
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root',
            status: 'completed',
            progress: 100,
          },
        ]);
        mockQuery.mockResolvedValueOnce([
          { child_id: 2, dependency_type: 'blocks', status: 'pending' },
        ]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Level 1',
            status: 'pending',
            progress: 0,
          },
        ]);
        // At max_depth=1, should not fetch children of task 2
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 1,
          max_depth: 1,
          format: 'json',
        });

        expect(result.success).toBe(true);
        expect(result.data.stats.max_depth_reached).toBeLessThanOrEqual(1);
      });
    });

    describe('Mixed Status Nodes', () => {
      it('should count statuses correctly', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 1 }]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root',
            status: 'completed',
            progress: 100,
          },
        ]);
        mockQuery.mockResolvedValueOnce([
          { child_id: 2, dependency_type: 'blocks', status: 'in_progress' },
          { child_id: 3, dependency_type: 'blocks', status: 'pending' },
        ]);
        // Task 2
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'In Progress',
            status: 'in_progress',
            progress: 50,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);
        // Task 3
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 3,
            task_code: 'PRJ-003',
            title: 'Pending',
            status: 'pending',
            progress: 0,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'json',
        });

        expect(result.success).toBe(true);
        expect(result.data.stats.completed_count).toBe(1);
        expect(result.data.stats.in_progress_count).toBe(1);
        expect(result.data.stats.pending_count).toBe(1);
      });
    });

    describe('ASCII Format', () => {
      it('should generate ASCII tree', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 1 }]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Root Task',
            status: 'completed',
            progress: 100,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'ascii',
          show_status: true,
          show_progress: true,
        });

        expect(result.success).toBe(true);
        expect(result._formatted).toBeDefined();
        expect(result._formatted).toContain('PRJ-001');
        expect(result._formatted).toContain('Root Task');
        expect(result._formatted).toContain('✓'); // completed icon
        expect(result._formatted).toContain('[100%]');
      });

      it('should use correct status icons', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 1 }]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'In Progress Task',
            status: 'in_progress',
            progress: 50,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'ascii',
        });

        expect(result.success).toBe(true);
        expect(result._formatted).toContain('⏳'); // in_progress icon
      });
    });

    describe('Human Format', () => {
      it('should generate human-readable summary', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 1 }]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Test',
            status: 'pending',
            progress: 0,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 1,
          format: 'human',
        });

        expect(result.success).toBe(true);
        expect(result._formatted).toContain('📊 Dependency Tree');
        expect(result._formatted).toContain('Statistics:');
        expect(result._formatted).toContain('Total nodes:');
      });
    });

    describe('Upstream Direction', () => {
      it('should build upstream tree', async () => {
        mockQuery.mockResolvedValueOnce([{ id: 2 }]); // taskExists
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Child',
            status: 'pending',
            progress: 0,
          },
        ]);
        // Upstream query returns parent
        mockQuery.mockResolvedValueOnce([
          { child_id: 1, dependency_type: 'blocks', status: 'completed' },
        ]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Parent',
            status: 'completed',
            progress: 100,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 2,
          direction: 'upstream',
          format: 'json',
        });

        expect(result.success).toBe(true);
        expect(result.data.direction).toBe('upstream');
        expect(result.data.upstream).toBeDefined();
      });
    });

    describe('Both Directions', () => {
      it('should build both upstream and downstream', async () => {
        // Task exists
        mockQuery.mockResolvedValueOnce([{ id: 2 }]);

        // Upstream tree
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Middle',
            status: 'in_progress',
            progress: 50,
          },
        ]);
        mockQuery.mockResolvedValueOnce([
          { child_id: 1, dependency_type: 'blocks', status: 'completed' },
        ]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'PRJ-001',
            title: 'Parent',
            status: 'completed',
            progress: 100,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        // Downstream tree
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'PRJ-002',
            title: 'Middle',
            status: 'in_progress',
            progress: 50,
          },
        ]);
        mockQuery.mockResolvedValueOnce([
          { child_id: 3, dependency_type: 'blocks', status: 'pending' },
        ]);
        mockQuery.mockResolvedValueOnce([
          {
            task_id: 3,
            task_code: 'PRJ-003',
            title: 'Child',
            status: 'pending',
            progress: 0,
          },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        const result = await getDependencyTree.execute({
          task_id: 2,
          direction: 'both',
          format: 'json',
        });

        expect(result.success).toBe(true);
        expect(result.data.direction).toBe('both');
        expect(result.data.upstream).toBeDefined();
        expect(result.data.downstream).toBeDefined();
      });
    });
  });
});
