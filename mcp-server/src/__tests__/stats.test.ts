/**
 * Stats Dashboard Endpoint Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-005
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getStats } from '../endpoints/stats';
import { db } from '../database';

// Mock database
jest.mock('../database', () => ({
  db: {
    query: jest.fn(),
  },
}));

describe('get_stats Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock responses
    (db.query as jest.Mock).mockImplementation((query: string) => {
      // Task status query
      if (query.includes('SUM(CASE WHEN status')) {
        return [{
          total: 60,
          pending: 15,
          in_progress: 7,
          completed: 35,
          blocked: 3,
        }];
      }

      // Priority query
      if (query.includes('SUM(CASE WHEN priority')) {
        return [{
          critical: 3,
          high: 12,
          medium: 28,
          low: 17,
        }];
      }

      // Velocity current sprint
      if (query.includes('SELECT COALESCE(SUM')) {
        return [{ points: 42 }];
      }

      // Velocity history
      if (query.includes('FROM sprints s')) {
        return [
          { sprint_id: 3, points: 42 },
          { sprint_id: 2, points: 38 },
          { sprint_id: 1, points: 35 },
        ];
      }

      // Agent workload
      if (query.includes('FROM agents a')) {
        return [
          { agent_id: 1, agent_name: 'Agent 1', agent_status: 'active', tasks_assigned: 15, tasks_completed: 12 },
          { agent_id: 2, agent_name: 'Agent 2', agent_status: 'active', tasks_assigned: 10, tasks_completed: 8 },
          { agent_id: 3, agent_name: 'Agent 3', agent_status: 'inactive', tasks_assigned: 5, tasks_completed: 5 },
        ];
      }

      // Project name
      if (query.includes('FROM projects')) {
        return [{ name: 'DFO Enhancement Plan' }];
      }

      return [];
    });
  });

  describe('Input Validation', () => {
    it('should accept empty input for system-wide stats', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
    });

    it('should accept valid project_id', async () => {
      const result = await getStats.execute({ project_id: 98 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.project_id).toBe(98);
      }
    });

    it('should accept valid sprint_id', async () => {
      const result = await getStats.execute({ sprint_id: 1 });

      expect(result.success).toBe(true);
    });

    it('should accept valid date_from and date_to', async () => {
      const result = await getStats.execute({
        date_from: '2025-01-01T00:00:00Z',
        date_to: '2025-12-31T23:59:59Z',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.period.from).toBe('2025-01-01T00:00:00Z');
      }
    });

    it('should reject invalid format values via schema', async () => {
      const schema = getStats.inputSchema;

      expect(() => {
        schema.parse({ format: 'xml' });
      }).toThrow();
    });

    it('should reject negative project_id via schema', async () => {
      const schema = getStats.inputSchema;

      expect(() => {
        schema.parse({ project_id: -1 });
      }).toThrow();
    });
  });

  describe('Task Calculations', () => {
    it('should return correct task count by status', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks.by_status.pending).toBe(15);
        expect(result.data.tasks.by_status.in_progress).toBe(7);
        expect(result.data.tasks.by_status.completed).toBe(35);
        expect(result.data.tasks.by_status.blocked).toBe(3);
      }
    });

    it('should return correct task count by priority', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks.by_priority.critical).toBe(3);
        expect(result.data.tasks.by_priority.high).toBe(12);
        expect(result.data.tasks.by_priority.medium).toBe(28);
        expect(result.data.tasks.by_priority.low).toBe(17);
      }
    });

    it('should calculate completion rate correctly', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        // 35/60 = 58.33% rounded to 58
        expect(result.data.tasks.completion_rate).toBe(58);
      }
    });

    it('should handle zero tasks gracefully', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SUM(CASE WHEN status')) {
          return [{ total: 0, pending: 0, in_progress: 0, completed: 0, blocked: 0 }];
        }
        if (query.includes('SUM(CASE WHEN priority')) {
          return [{ critical: 0, high: 0, medium: 0, low: 0 }];
        }
        if (query.includes('SELECT COALESCE(SUM')) {
          return [{ points: 0 }];
        }
        if (query.includes('FROM sprints s')) {
          return [];
        }
        if (query.includes('FROM agents a')) {
          return [];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks.total).toBe(0);
        expect(result.data.tasks.completion_rate).toBe(0);
      }
    });
  });

  describe('Velocity Calculations', () => {
    it('should return current sprint velocity', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.velocity.current_sprint).toBe(42);
      }
    });

    it('should calculate average velocity correctly', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        // (42 + 38 + 35) / 3 = 38.33 rounded to 38
        expect(result.data.velocity.average).toBe(38);
      }
    });

    it('should detect upward velocity trend', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('FROM sprints s')) {
          return [
            { sprint_id: 3, points: 50 },
            { sprint_id: 2, points: 35 },
          ];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.velocity.trend).toBe('up');
      }
    });

    it('should detect downward velocity trend', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('FROM sprints s')) {
          return [
            { sprint_id: 3, points: 30 },
            { sprint_id: 2, points: 50 },
          ];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.velocity.trend).toBe('down');
      }
    });

    it('should detect stable velocity trend', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('FROM sprints s')) {
          return [
            { sprint_id: 3, points: 40 },
            { sprint_id: 2, points: 41 },
          ];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.velocity.trend).toBe('stable');
      }
    });
  });

  describe('Health Score Calculation', () => {
    it('should calculate health score correctly', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.health_score).toBeGreaterThan(0);
        expect(result.data.health_score).toBeLessThanOrEqual(100);
      }
    });

    it('should return 100 for empty project', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SUM(CASE WHEN status')) {
          return [{ total: 0, pending: 0, in_progress: 0, completed: 0, blocked: 0 }];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.health_score).toBe(100);
      }
    });
  });

  describe('Filtering', () => {
    it('should filter by project_id', async () => {
      const result = await getStats.execute({ project_id: 98 });

      expect(result.success).toBe(true);
      expect(db.query).toHaveBeenCalled();

      // Check that project_id was passed to queries
      const calls = (db.query as jest.Mock).mock.calls;
      const hasProjectFilter = calls.some(call =>
        call[1]?.includes(98)
      );
      expect(hasProjectFilter).toBe(true);
    });

    it('should filter by sprint_id', async () => {
      const result = await getStats.execute({ sprint_id: 1 });

      expect(result.success).toBe(true);
    });

    it('should filter by date range', async () => {
      const result = await getStats.execute({
        date_from: '2025-01-01',
        date_to: '2025-12-31',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.period.from).toBe('2025-01-01');
      }
    });

    it('should handle combined filters', async () => {
      const result = await getStats.execute({
        project_id: 98,
        sprint_id: 1,
        date_from: '2025-01-01',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Agent Workload', () => {
    it('should count tasks per agent', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agents.workload.length).toBe(3);
        expect(result.data.agents.workload[0].tasks_assigned).toBe(15);
      }
    });

    it('should calculate efficiency correctly', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        // 12/15 = 80%
        expect(result.data.agents.workload[0].efficiency).toBe(80);
      }
    });

    it('should handle agents with no tasks', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('FROM agents a')) {
          return [
            { agent_id: 1, agent_name: 'Agent 1', agent_status: 'active', tasks_assigned: 0, tasks_completed: 0 },
          ];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agents.workload[0].efficiency).toBe(0);
      }
    });

    it('should count active agents correctly', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agents.active).toBe(2); // 2 active out of 3
        expect(result.data.agents.total).toBe(3);
      }
    });
  });

  describe('Human Format Output', () => {
    it('should include progress bars', async () => {
      const result = await getStats.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('[');
        expect(result.formatted).toContain(']');
      }
    });

    it('should include priority icons', async () => {
      const result = await getStats.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('🔴');
        expect(result.formatted).toContain('🟠');
        expect(result.formatted).toContain('🟡');
        expect(result.formatted).toContain('🔵');
      }
    });

    it('should include velocity trend arrow', async () => {
      const result = await getStats.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        // Should have one of the trend arrows
        const hasTrendArrow = result.formatted.includes('↑') ||
          result.formatted.includes('↓') ||
          result.formatted.includes('→');
        expect(hasTrendArrow).toBe(true);
      }
    });

    it('should include all sections', async () => {
      const result = await getStats.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('Task Distribution');
        expect(result.formatted).toContain('Priority Distribution');
        expect(result.formatted).toContain('Velocity');
        expect(result.formatted).toContain('Key Metrics');
      }
    });

    it('should format numbers correctly', async () => {
      const result = await getStats.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toMatch(/\(\d+\)/); // Numbers in parentheses
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty project returns zeros', async () => {
      (db.query as jest.Mock).mockReturnValue([]);

      const result = await getStats.execute({ project_id: 999 });

      expect(result.success).toBe(true);
    });

    it('should handle single task project', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SUM(CASE WHEN status')) {
          return [{ total: 1, pending: 0, in_progress: 0, completed: 1, blocked: 0 }];
        }
        if (query.includes('SUM(CASE WHEN priority')) {
          return [{ critical: 1, high: 0, medium: 0, low: 0 }];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks.total).toBe(1);
        expect(result.data.tasks.completion_rate).toBe(100);
      }
    });

    it('should handle all tasks completed', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SUM(CASE WHEN status')) {
          return [{ total: 50, pending: 0, in_progress: 0, completed: 50, blocked: 0 }];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks.completion_rate).toBe(100);
      }
    });

    it('should handle all tasks blocked', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SUM(CASE WHEN status')) {
          return [{ total: 10, pending: 0, in_progress: 0, completed: 0, blocked: 10 }];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks.by_status.blocked).toBe(10);
      }
    });

    it('should handle no active agents', async () => {
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('FROM agents a')) {
          return [];
        }
        return [];
      });

      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agents.total).toBe(0);
        expect(result.data.agents.active).toBe(0);
      }
    });
  });

  describe('Metadata', () => {
    it('should include metadata in responses', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.metadata).toBeDefined();
        expect(result.metadata?.timestamp).toBeDefined();
        expect(result.metadata?.request_id).toBeDefined();
        expect(result.metadata?.version).toBe('2.0.0');
      }
    });

    it('should measure execution time', async () => {
      const result = await getStats.execute({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.metadata?.execution_time_ms).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const result = await getStats.execute({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Database connection failed');
      }
    });
  });
});
