/**
 * Ready Tasks Endpoint Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-004
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getReadyTasks } from '../endpoints/ready-tasks';
import { db } from '../database';

// Mock database
jest.mock('../database', () => ({
  db: {
    query: jest.fn(),
  },
}));

describe('get_ready_tasks Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept valid input with all filters', async () => {
      const mockTasks = [
        {
          id: 1,
          task_code: 'DFN-001',
          title: 'Test Task',
          status: 'pending',
          priority: 'high',
          blocker_count: 0,
          readiness_score: 85,
        },
      ];

      (db.query as jest.Mock).mockResolvedValue(mockTasks);

      const params = {
        project_id: 98,
        agent_id: 11,
        sprint_id: 1,
        epic_id: 5,
        priority: 'high' as const,
        limit: 10,
        format: 'json' as const,
      };

      const result = await getReadyTasks.execute(params);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks).toHaveLength(1);
        expect(result.data.total).toBe(1);
      }
    });

    it('should use default limit of 10', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const params = {
        format: 'json' as const,
      };

      await getReadyTasks.execute(params);

      const queryCall = (db.query as jest.Mock).mock.calls[0];
      const queryParams = queryCall[1];
      expect(queryParams[queryParams.length - 1]).toBe(10);
    });

    it('should reject invalid limit', async () => {
      const params = {
        limit: 150, // Max is 100
        format: 'json' as const,
      };

      await expect(async () => {
        await getReadyTasks.inputSchema.parse(params);
      }).rejects.toThrow();
    });

    it('should reject invalid priority', async () => {
      const params = {
        priority: 'urgent' as any, // Not a valid priority
        format: 'json' as const,
      };

      await expect(async () => {
        await getReadyTasks.inputSchema.parse(params);
      }).rejects.toThrow();
    });
  });

  describe('Readiness Score Calculation', () => {
    it('should prioritize critical priority tasks', async () => {
      const mockTasks = [
        {
          id: 1,
          task_code: 'DFN-001',
          title: 'Critical Task',
          priority: 'critical',
          blocker_count: 0,
          sprint_status: 'active',
          readiness_score: 95, // 50 + 30(critical) + 15(active)
        },
        {
          id: 2,
          task_code: 'DFN-002',
          title: 'Low Task',
          priority: 'low',
          blocker_count: 0,
          sprint_status: null,
          readiness_score: 50, // 50 base
        },
      ];

      (db.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks[0].readiness_score).toBeGreaterThan(
          result.data.tasks[1].readiness_score
        );
      }
    });

    it('should boost active sprint tasks', async () => {
      const mockTasks = [
        {
          id: 1,
          task_code: 'DFN-001',
          title: 'Active Sprint Task',
          priority: 'medium',
          sprint_status: 'active',
          blocker_count: 0,
          readiness_score: 75, // 50 + 10(medium) + 15(active)
        },
        {
          id: 2,
          task_code: 'DFN-002',
          title: 'Planned Sprint Task',
          priority: 'medium',
          sprint_status: 'planned',
          blocker_count: 0,
          readiness_score: 60, // 50 + 10(medium)
        },
      ];

      (db.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks[0].sprint_status).toBe('active');
        expect(result.data.tasks[0].readiness_score).toBeGreaterThan(
          result.data.tasks[1].readiness_score
        );
      }
    });

    it('should boost assigned tasks', async () => {
      const taskWithAgent = {
        id: 1,
        task_code: 'DFN-001',
        assigned_agent_id: 11,
        blocker_count: 0,
        readiness_score: 55, // 50 + 5(assigned)
      };

      const taskUnassigned = {
        id: 2,
        task_code: 'DFN-002',
        assigned_agent_id: null,
        blocker_count: 0,
        readiness_score: 50,
      };

      (db.query as jest.Mock).mockResolvedValue([taskWithAgent, taskUnassigned]);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        const withAgent = result.data.tasks.find((t: any) => t.id === 1);
        const withoutAgent = result.data.tasks.find((t: any) => t.id === 2);
        expect(withAgent.readiness_score).toBeGreaterThan(withoutAgent.readiness_score);
      }
    });
  });

  describe('Dependency Filtering', () => {
    it('should exclude tasks with incomplete blockers', async () => {
      const mockTasks = [
        {
          id: 1,
          task_code: 'DFN-001',
          title: 'Ready Task',
          blocker_count: 0,
          readiness_score: 75,
        },
        // Task with blocker should be filtered out by SQL WHERE blocker_count = 0
      ];

      (db.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks).toHaveLength(1);
        expect(result.data.tasks[0].blocker_count).toBe(0);
      }
    });

    it('should handle missing task_dependencies table gracefully', async () => {
      const dbError = {
        code: 'ER_NO_SUCH_TABLE',
        message: "Table 'dfo.task_dependencies' doesn't exist",
      };

      const fallbackTasks = [
        {
          id: 1,
          task_code: 'DFN-001',
          title: 'Task',
          blocker_count: 0,
          readiness_score: 75,
        },
      ];

      (db.query as jest.Mock)
        .mockRejectedValueOnce(dbError)
        .mockResolvedValueOnce(fallbackTasks);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks).toHaveLength(1);
      }

      // Should call query twice (initial + fallback)
      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('Readiness Reasons', () => {
    it('should generate appropriate readiness reasons', async () => {
      const mockTask = {
        id: 1,
        task_code: 'DFN-001',
        title: 'Test Task',
        priority: 'critical',
        sprint_status: 'active',
        assigned_agent_id: 11,
        agent_name: 'Claude Code',
        estimated_hours: 8,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
        blocker_count: 0,
        readiness_score: 95,
      };

      (db.query as jest.Mock).mockResolvedValue([mockTask]);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        const task = result.data.tasks[0];
        expect(task.readiness_reasons).toContain('✓ No blocking dependencies');
        expect(task.readiness_reasons).toContain('✓ CRITICAL priority');
        expect(task.readiness_reasons).toContain('✓ Part of active sprint');
        expect(task.readiness_reasons).toContain('✓ Assigned to Claude Code');
        expect(task.readiness_reasons).toContain('✓ Estimated: 8h');
        expect(task.readiness_reasons.some((r: string) => r.includes('Deadline in'))).toBe(true);
      }
    });

    it('should mark overdue tasks', async () => {
      const mockTask = {
        id: 1,
        task_code: 'DFN-001',
        title: 'Overdue Task',
        priority: 'high',
        deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        blocker_count: 0,
        readiness_score: 80,
      };

      (db.query as jest.Mock).mockResolvedValue([mockTask]);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        const task = result.data.tasks[0];
        expect(task.readiness_reasons.some((r: string) => r.includes('⚠ OVERDUE'))).toBe(true);
      }
    });
  });

  describe('Human Format Output', () => {
    it('should format human output with icons', async () => {
      const mockTasks = [
        {
          id: 1,
          task_code: 'DFN-001',
          title: 'Critical Task',
          priority: 'critical',
          agent_name: 'Claude Code',
          sprint_name: 'Sprint 1',
          estimated_hours: 8,
          blocker_count: 0,
          readiness_score: 95,
          readiness_reasons: ['✓ No blocking dependencies', '✓ CRITICAL priority'],
        },
      ];

      (db.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getReadyTasks.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.format).toBe('human');
        expect(result.formatted).toBeDefined();
        expect(result.formatted).toContain('📋 Ready Tasks');
        expect(result.formatted).toContain('🔴'); // Critical icon
        expect(result.formatted).toContain('DFN-001');
        expect(result.formatted).toContain('Critical Task');
        expect(result.formatted).toContain('Readiness: 95/100');
      }
    });

    it('should show empty state message when no tasks ready', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const result = await getReadyTasks.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.formatted).toContain('📋 Ready Tasks: None');
        expect(result.formatted).toContain('All tasks are either:');
        expect(result.formatted).toContain('Use /dfo status to see all tasks');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const dbError = new Error('Connection refused');

      (db.query as jest.Mock).mockRejectedValue(dbError);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INTERNAL_ERROR');
        expect(result.error.message).toContain('Connection refused');
      }
    });

    it('should include metadata in responses', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const result = await getReadyTasks.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.metadata).toBeDefined();
        expect(result.metadata?.timestamp).toBeDefined();
        expect(result.metadata?.request_id).toBeDefined();
        expect(result.metadata?.execution_time_ms).toBeGreaterThanOrEqual(0);
        expect(result.metadata?.version).toBe('2.0.0');
      }
    });
  });

  describe('Query Parameter Handling', () => {
    it('should filter by project_id', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      await getReadyTasks.execute({
        project_id: 98,
        format: 'json',
      });

      const queryCall = (db.query as jest.Mock).mock.calls[0];
      const queryParams = queryCall[1];
      expect(queryParams[0]).toBe(98); // First project_id
      expect(queryParams[1]).toBe(98); // Second project_id (for NULL check)
    });

    it('should filter by agent_id', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      await getReadyTasks.execute({
        agent_id: 11,
        format: 'json',
      });

      const queryCall = (db.query as jest.Mock).mock.calls[0];
      const queryParams = queryCall[1];
      expect(queryParams[2]).toBe(11); // First agent_id
      expect(queryParams[3]).toBe(11); // Second agent_id
    });

    it('should return filter metadata', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const result = await getReadyTasks.execute({
        project_id: 98,
        sprint_id: 1,
        priority: 'high',
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filters).toEqual({
          project_id: 98,
          agent_id: undefined,
          sprint_id: 1,
          epic_id: undefined,
          priority: 'high',
        });
      }
    });
  });
});
