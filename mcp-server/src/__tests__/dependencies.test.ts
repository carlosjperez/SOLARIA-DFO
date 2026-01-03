/**
 * Task Dependencies Endpoint Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-007
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Database, DatabaseResult } from '../database.js';

// Create mock database
const mockQuery = jest.fn<(sql: string, params?: any[]) => Promise<any[]>>();
const mockExecute = jest.fn<(sql: string, params?: any[]) => Promise<DatabaseResult>>();

const mockDb: Database = {
  query: mockQuery,
  execute: mockExecute,
};

// Mock the database module before importing endpoints
jest.unstable_mockModule('../database.js', () => ({
  db: mockDb,
}));

// Import after mocking
const { addDependency, removeDependency, getDependencies, detectDependencyCycles, getBlockedTasks } =
  await import('../endpoints/dependencies.js');

describe('Task Dependencies Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // add_dependency Tests
  // ============================================================================

  describe('add_dependency', () => {
    it('should create a valid dependency', async () => {
      // Mock task existence checks
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }]) // task exists
        .mockResolvedValueOnce([{ id: 2 }]) // depends_on task exists
        .mockResolvedValueOnce([]) // no existing dependencies for cycle check
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode for cycle check
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]) // getTaskCode for depends_on
        .mockResolvedValueOnce([
          {
            id: 1,
            task_id: 1,
            task_code: 'DFN-001',
            task_title: 'Task One',
            depends_on_task_id: 2,
            depends_on_task_code: 'DFN-002',
            depends_on_task_title: 'Task Two',
            depends_on_status: 'pending',
            dependency_type: 'blocks',
            created_at: '2025-12-27T00:00:00Z',
          },
        ]);

      mockExecute.mockResolvedValueOnce({ rows: [], affectedRows: 1, insertId: 1 });

      const result = await addDependency.execute({
        task_id: 1,
        depends_on_task_id: 2,
        dependency_type: 'blocks',
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dependency.task_id).toBe(1);
        expect(result.data.dependency.depends_on_task_id).toBe(2);
        expect(result.data.dependency.is_blocking).toBe(true);
      }
    });

    it('should reject self-dependency', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }]) // task exists
        .mockResolvedValueOnce([{ id: 1 }]); // same task

      const result = await addDependency.execute({
        task_id: 1,
        depends_on_task_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_DEPENDENCY');
        expect(result.error.message).toContain('cannot depend on itself');
      }
    });

    it('should reject non-existent task', async () => {
      mockQuery.mockResolvedValueOnce([]); // task not found

      const result = await addDependency.execute({
        task_id: 999,
        depends_on_task_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TASK_NOT_FOUND');
      }
    });

    it('should reject duplicate dependency', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]);

      mockExecute.mockRejectedValueOnce({
        code: 'ER_DUP_ENTRY',
        message: 'Duplicate entry',
      });

      const result = await addDependency.execute({
        task_id: 1,
        depends_on_task_id: 2,
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DUPLICATE_DEPENDENCY');
      }
    });

    it('should add dependency with notes', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }])
        .mockResolvedValueOnce([
          {
            id: 1,
            task_id: 1,
            depends_on_task_id: 2,
            dependency_type: 'blocks',
            task_code: 'DFN-001',
            depends_on_task_code: 'DFN-002',
            task_title: 'Task One',
            depends_on_task_title: 'Task Two',
            depends_on_status: 'pending',
            notes: 'Requires API completion first',
          },
        ]);

      mockExecute.mockResolvedValueOnce({ rows: [], affectedRows: 1 });

      const result = await addDependency.execute({
        task_id: 1,
        depends_on_task_id: 2,
        notes: 'Requires API completion first',
        format: 'json',
      });

      expect(result.success).toBe(true);
    });

    it('should support different dependency types', async () => {
      const types = ['blocks', 'requires', 'related', 'child_of'] as const;

      for (const type of types) {
        jest.clearAllMocks();
        mockQuery
          .mockResolvedValueOnce([{ id: 1 }])
          .mockResolvedValueOnce([{ id: 2 }])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
          .mockResolvedValueOnce([{ task_code: 'DFN-002' }])
          .mockResolvedValueOnce([
            {
              id: 1,
              task_id: 1,
              depends_on_task_id: 2,
              dependency_type: type,
              task_code: 'DFN-001',
              depends_on_task_code: 'DFN-002',
              task_title: 'Task One',
              depends_on_task_title: 'Task Two',
              depends_on_status: 'pending',
            },
          ]);

        mockExecute.mockResolvedValueOnce({ rows: [], affectedRows: 1 });

        const result = await addDependency.execute({
          task_id: 1,
          depends_on_task_id: 2,
          dependency_type: type,
          format: 'json',
        });

        expect(result.success).toBe(true);
      }
    });
  });

  // ============================================================================
  // remove_dependency Tests
  // ============================================================================

  describe('remove_dependency', () => {
    it('should remove an existing dependency', async () => {
      mockExecute.mockResolvedValueOnce({ rows: [], affectedRows: 1 });
      mockQuery
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]);

      const result = await removeDependency.execute({
        task_id: 1,
        depends_on_task_id: 2,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.removed).toBe(true);
      }
    });

    it('should return error for non-existent dependency', async () => {
      mockExecute.mockResolvedValueOnce({ rows: [], affectedRows: 0 });

      const result = await removeDependency.execute({
        task_id: 1,
        depends_on_task_id: 999,
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DEPENDENCY_NOT_FOUND');
      }
    });

    it('should format human output correctly', async () => {
      mockExecute.mockResolvedValueOnce({ rows: [], affectedRows: 1 });
      mockQuery
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]);

      const result = await removeDependency.execute({
        task_id: 1,
        depends_on_task_id: 2,
        format: 'human',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.format).toBe('human');
        expect(result.formatted).toContain('Dependency Removed');
        expect(result.formatted).toContain('DFN-001');
        expect(result.formatted).toContain('DFN-002');
      }
    });
  });

  // ============================================================================
  // get_dependencies Tests
  // ============================================================================

  describe('get_dependencies', () => {
    it('should get upstream dependencies', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 3 }]) // task exists
        .mockResolvedValueOnce([{ task_code: 'DFN-003' }]) // getTaskCode
        .mockResolvedValueOnce([
          {
            id: 1,
            task_id: 3,
            task_code: 'DFN-003',
            task_title: 'Task Three',
            depends_on_task_id: 1,
            depends_on_task_code: 'DFN-001',
            depends_on_task_title: 'Task One',
            depends_on_status: 'completed',
            depends_on_progress: 100,
            dependency_type: 'blocks',
          },
          {
            id: 2,
            task_id: 3,
            task_code: 'DFN-003',
            task_title: 'Task Three',
            depends_on_task_id: 2,
            depends_on_task_code: 'DFN-002',
            depends_on_task_title: 'Task Two',
            depends_on_status: 'in_progress',
            depends_on_progress: 50,
            dependency_type: 'blocks',
          },
        ]);

      const result = await getDependencies.execute({
        task_id: 3,
        direction: 'upstream',
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.upstream).toHaveLength(2);
        expect(result.data.is_blocked).toBe(true);
        expect(result.data.blocking_count).toBe(1); // Only one is not completed
      }
    });

    it('should get downstream dependencies', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
        .mockResolvedValueOnce([
          {
            id: 1,
            task_id: 2,
            task_code: 'DFN-002',
            task_title: 'Task Two',
            depends_on_task_id: 1,
            depends_on_task_code: 'DFN-001',
            depends_on_task_title: 'Task One',
            depends_on_status: 'pending',
            depends_on_progress: 0,
            dependency_type: 'blocks',
          },
        ]);

      const result = await getDependencies.execute({
        task_id: 1,
        direction: 'downstream',
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.downstream).toHaveLength(1);
        expect(result.data.downstream[0].task_code).toBe('DFN-002');
      }
    });

    it('should get both directions', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 2 }])
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }])
        .mockResolvedValueOnce([
          {
            id: 1,
            task_id: 2,
            depends_on_task_id: 1,
            dependency_type: 'blocks',
            depends_on_status: 'completed',
            depends_on_progress: 100,
            task_code: 'DFN-002',
            depends_on_task_code: 'DFN-001',
            task_title: 'Task Two',
            depends_on_task_title: 'Task One',
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 2,
            task_id: 3,
            depends_on_task_id: 2,
            dependency_type: 'blocks',
            depends_on_status: 'pending',
            depends_on_progress: 0,
            task_code: 'DFN-003',
            depends_on_task_code: 'DFN-002',
            task_title: 'Task Three',
            depends_on_task_title: 'Task Two',
          },
        ]);

      const result = await getDependencies.execute({
        task_id: 2,
        direction: 'both',
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.upstream).toHaveLength(1);
        expect(result.data.downstream).toHaveLength(1);
        expect(result.data.is_blocked).toBe(false); // upstream is completed
      }
    });

    it('should return empty when no dependencies', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
        .mockResolvedValueOnce([]) // no upstream
        .mockResolvedValueOnce([]); // no downstream

      const result = await getDependencies.execute({
        task_id: 1,
        direction: 'both',
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.upstream).toHaveLength(0);
        expect(result.data.downstream).toHaveLength(0);
        expect(result.data.is_blocked).toBe(false);
      }
    });

    it('should format human output with icons', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }])
        .mockResolvedValueOnce([
          {
            id: 1,
            task_id: 1,
            depends_on_task_id: 2,
            dependency_type: 'blocks',
            depends_on_status: 'completed',
            depends_on_progress: 100,
            task_code: 'DFN-001',
            depends_on_task_code: 'DFN-002',
            task_title: 'Task One',
            depends_on_task_title: 'Task Two',
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await getDependencies.execute({
        task_id: 1,
        direction: 'both',
        format: 'human',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.format).toBe('human');
        expect(result.formatted).toContain('Task DFN-001');
        expect(result.formatted).toContain('Upstream Dependencies');
      }
    });

    it('should handle non-existent task', async () => {
      mockQuery.mockResolvedValueOnce([]);

      const result = await getDependencies.execute({
        task_id: 999,
        direction: 'both',
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TASK_NOT_FOUND');
      }
    });
  });

  // ============================================================================
  // detect_dependency_cycles Tests
  // ============================================================================

  describe('detect_dependency_cycles', () => {
    it('should detect no cycle for linear chain', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 3 }]) // taskExists(3)
        .mockResolvedValueOnce([{ id: 2 }]) // taskExists(2)
        .mockResolvedValueOnce([
          { task_id: 2, depends_on_task_id: 1, task_code: 'DFN-002' },
        ]) // allDeps in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-003' }]) // getTaskCode(3) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]) // getTaskCode(2) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-003' }]) // getTaskCode(3) in execute
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]); // getTaskCode(2) in execute

      const result = await detectDependencyCycles.execute({
        task_id: 3,
        depends_on_task_id: 2,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.would_create_cycle).toBe(false);
        expect(result.data.cycle_path).toBeUndefined();
      }
    });

    it('should detect direct cycle (A->B->A)', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }]) // taskExists(1)
        .mockResolvedValueOnce([{ id: 2 }]) // taskExists(2)
        .mockResolvedValueOnce([
          { task_id: 2, depends_on_task_id: 1, task_code: 'DFN-002' },
        ]) // allDeps in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]) // getTaskCode(2) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in execute
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]); // getTaskCode(2) in execute

      const result = await detectDependencyCycles.execute({
        task_id: 1, // DFN-001 depends on DFN-002
        depends_on_task_id: 2, // but DFN-002 already depends on DFN-001
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.would_create_cycle).toBe(true);
        expect(result.data.cycle_path).toBeDefined();
        expect(result.data.cycle_path.length).toBeGreaterThan(0);
      }
    });

    it('should detect indirect cycle (A->B->C->A)', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }]) // taskExists(1)
        .mockResolvedValueOnce([{ id: 3 }]) // taskExists(3)
        .mockResolvedValueOnce([
          { task_id: 2, depends_on_task_id: 1, task_code: 'DFN-002' },
          { task_id: 3, depends_on_task_id: 2, task_code: 'DFN-003' },
        ]) // allDeps in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-003' }]) // getTaskCode(3) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in execute
        .mockResolvedValueOnce([{ task_code: 'DFN-003' }]); // getTaskCode(3) in execute

      const result = await detectDependencyCycles.execute({
        task_id: 1, // DFN-001 depends on DFN-003
        depends_on_task_id: 3, // but DFN-003 -> DFN-002 -> DFN-001
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.would_create_cycle).toBe(true);
      }
    });

    it('should detect self-dependency cycle', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }]) // taskExists(1)
        .mockResolvedValueOnce([{ id: 1 }]) // taskExists(1)
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in detectCycle (early return)
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in execute
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]); // getTaskCode(1) in execute

      const result = await detectDependencyCycles.execute({
        task_id: 1,
        depends_on_task_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.would_create_cycle).toBe(true);
      }
    });

    it('should handle complex graph without cycle', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 5 }]) // taskExists(5)
        .mockResolvedValueOnce([{ id: 4 }]) // taskExists(4)
        .mockResolvedValueOnce([
          { task_id: 2, depends_on_task_id: 1, task_code: 'DFN-002' },
          { task_id: 3, depends_on_task_id: 1, task_code: 'DFN-003' },
          { task_id: 4, depends_on_task_id: 2, task_code: 'DFN-004' },
          { task_id: 4, depends_on_task_id: 3, task_code: 'DFN-004' },
        ]) // allDeps in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-005' }]) // getTaskCode(5) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-004' }]) // getTaskCode(4) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-005' }]) // getTaskCode(5) in execute
        .mockResolvedValueOnce([{ task_code: 'DFN-004' }]); // getTaskCode(4) in execute

      const result = await detectDependencyCycles.execute({
        task_id: 5,
        depends_on_task_id: 4,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.would_create_cycle).toBe(false);
      }
    });

    it('should format human output for cycle detection', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }]) // taskExists(1)
        .mockResolvedValueOnce([{ id: 2 }]) // taskExists(2)
        .mockResolvedValueOnce([]) // allDeps in detectCycle (empty)
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]) // getTaskCode(2) in detectCycle
        .mockResolvedValueOnce([{ task_code: 'DFN-001' }]) // getTaskCode(1) in execute
        .mockResolvedValueOnce([{ task_code: 'DFN-002' }]); // getTaskCode(2) in execute

      const result = await detectDependencyCycles.execute({
        task_id: 1,
        depends_on_task_id: 2,
        format: 'human',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.format).toBe('human');
        expect(result.formatted).toContain('No Cycle');
      }
    });
  });

  // ============================================================================
  // get_blocked_tasks Tests
  // ============================================================================

  describe('get_blocked_tasks', () => {
    it('should return tasks with single blocker', async () => {
      mockQuery
        .mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'DFN-002',
            task_title: 'Task Two',
            status: 'pending',
            blocker_count: 1,
          },
        ])
        .mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'DFN-001',
            task_title: 'Task One',
            status: 'in_progress',
            progress: 50,
          },
        ]);

      const result = await getBlockedTasks.execute({
        include_blocker_details: true,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blocked_tasks).toHaveLength(1);
        expect(result.data.blocked_tasks[0].blockers).toHaveLength(1);
        expect(result.data.total_blocked).toBe(1);
      }
    });

    it('should return tasks with multiple blockers', async () => {
      mockQuery
        .mockResolvedValueOnce([
          {
            task_id: 3,
            task_code: 'DFN-003',
            task_title: 'Task Three',
            status: 'pending',
            blocker_count: 2,
          },
        ])
        .mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'DFN-001',
            task_title: 'Task One',
            status: 'in_progress',
            progress: 75,
          },
          {
            task_id: 2,
            task_code: 'DFN-002',
            task_title: 'Task Two',
            status: 'pending',
            progress: 0,
          },
        ]);

      const result = await getBlockedTasks.execute({
        include_blocker_details: true,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blocked_tasks).toHaveLength(1);
        expect(result.data.blocked_tasks[0].blockers).toHaveLength(2);
      }
    });

    it('should return empty when no blocked tasks', async () => {
      mockQuery.mockResolvedValueOnce([]);

      const result = await getBlockedTasks.execute({
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blocked_tasks).toHaveLength(0);
        expect(result.data.total_blocked).toBe(0);
      }
    });

    it('should filter by project_id', async () => {
      mockQuery
        .mockResolvedValueOnce([
          {
            task_id: 5,
            task_code: 'PROJ-001',
            task_title: 'Project Task',
            status: 'pending',
            blocker_count: 1,
          },
        ])
        .mockResolvedValueOnce([
          {
            task_id: 4,
            task_code: 'PROJ-000',
            task_title: 'Blocker Task',
            status: 'in_progress',
            progress: 30,
          },
        ]);

      const result = await getBlockedTasks.execute({
        project_id: 98,
        include_blocker_details: true,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filters.project_id).toBe(98);
      }
    });

    it('should work without blocker details', async () => {
      mockQuery.mockResolvedValueOnce([
        {
          task_id: 2,
          task_code: 'DFN-002',
          task_title: 'Task Two',
          status: 'pending',
          blocker_count: 1,
        },
      ]);

      const result = await getBlockedTasks.execute({
        include_blocker_details: false,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blocked_tasks).toHaveLength(1);
        expect(result.data.blocked_tasks[0].blockers).toHaveLength(0);
      }
    });

    it('should format human output with icons', async () => {
      mockQuery
        .mockResolvedValueOnce([
          {
            task_id: 2,
            task_code: 'DFN-002',
            task_title: 'Task Two',
            status: 'pending',
            blocker_count: 1,
          },
        ])
        .mockResolvedValueOnce([
          {
            task_id: 1,
            task_code: 'DFN-001',
            task_title: 'Task One',
            status: 'in_progress',
            progress: 45,
          },
        ]);

      const result = await getBlockedTasks.execute({
        include_blocker_details: true,
        format: 'human',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.format).toBe('human');
        expect(result.formatted).toContain('Blocked Tasks');
        expect(result.formatted).toContain('DFN-002');
        expect(result.formatted).toContain('Blocked by');
      }
    });

    it('should show no blocked message in human format', async () => {
      mockQuery.mockResolvedValueOnce([]);

      const result = await getBlockedTasks.execute({
        format: 'human',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.formatted).toContain('No Blocked Tasks');
      }
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle database errors in addDependency', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }])
        .mockRejectedValueOnce(new Error('Connection lost'));

      const result = await addDependency.execute({
        task_id: 1,
        depends_on_task_id: 2,
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INTERNAL_ERROR');
      }
    });

    it('should include metadata in all responses', async () => {
      mockQuery.mockResolvedValueOnce([]);

      const result = await getBlockedTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.metadata).toBeDefined();
        expect(result.metadata?.timestamp).toBeDefined();
        expect(result.metadata?.version).toBe('2.0.0');
      }
    });
  });

  // ============================================================================
  // Input Validation Tests
  // ============================================================================

  describe('Input Validation', () => {
    it('should validate task_id is positive integer', async () => {
      await expect(async () => {
        await addDependency.inputSchema.parse({
          task_id: -1,
          depends_on_task_id: 1,
        });
      }).rejects.toThrow();
    });

    it('should validate dependency_type enum', async () => {
      await expect(async () => {
        await addDependency.inputSchema.parse({
          task_id: 1,
          depends_on_task_id: 2,
          dependency_type: 'invalid',
        });
      }).rejects.toThrow();
    });

    it('should validate notes max length', async () => {
      await expect(async () => {
        await addDependency.inputSchema.parse({
          task_id: 1,
          depends_on_task_id: 2,
          notes: 'a'.repeat(501),
        });
      }).rejects.toThrow();
    });

    it('should validate direction enum', async () => {
      await expect(async () => {
        await getDependencies.inputSchema.parse({
          task_id: 1,
          direction: 'invalid',
        });
      }).rejects.toThrow();
    });

    it('should use default values', () => {
      const parsed = addDependency.inputSchema.parse({
        task_id: 1,
        depends_on_task_id: 2,
      });

      expect(parsed.dependency_type).toBe('blocks');
      expect(parsed.format).toBe('json');
    });
  });
});
