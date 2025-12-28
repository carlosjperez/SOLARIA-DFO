/**
 * Formatters Utilities Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-002
 */

import { describe, it, expect } from '@jest/globals';
import {
  formatTask,
  formatTaskList,
  formatTaskSummary,
  formatProject,
  formatProjectList,
  formatAgent,
  formatAgentList,
  formatSprint,
  formatSprintList,
  formatCapabilities,
  formatTable,
  formatDuration,
  formatPercentage,
  formatProgressBar,
  Formatters,
} from '../utils/formatters';

describe('Task Formatters', () => {
  const mockTask = {
    task_code: 'DFN-001',
    title: 'Agent Capabilities Registry',
    status: 'completed' as const,
    progress: 100,
    agent_name: 'Claude Code',
    priority: 'critical' as const,
    estimated_hours: 8,
    deadline: '2025-12-31T00:00:00Z',
  };

  describe('formatTask', () => {
    it('should format task with all fields', () => {
      const formatted = formatTask(mockTask);

      expect(formatted).toContain('DFN-001');
      expect(formatted).toContain('Agent Capabilities Registry');
      expect(formatted).toContain('completed');
      expect(formatted).toContain('100%');
      expect(formatted).toContain('Claude Code');
      expect(formatted).toContain('critical');
      expect(formatted).toContain('8h');
    });

    it('should include status icon', () => {
      const formatted = formatTask(mockTask);

      expect(formatted).toContain('✅'); // completed icon
    });

    it('should handle minimal task data', () => {
      const minimalTask = {
        task_code: 'TEST-001',
        title: 'Test Task',
        status: 'pending' as const,
        progress: 0,
      };

      const formatted = formatTask(minimalTask);

      expect(formatted).toContain('TEST-001');
      expect(formatted).toContain('Test Task');
      expect(formatted).toContain('pending');
      expect(formatted).toContain('0%');
    });
  });

  describe('formatTaskList', () => {
    it('should format multiple tasks', () => {
      const tasks = [
        { ...mockTask, task_code: 'DFN-001' },
        { ...mockTask, task_code: 'DFN-002', status: 'in_progress' as const, progress: 50 },
      ];

      const formatted = formatTaskList(tasks);

      expect(formatted).toContain('Found 2 tasks:');
      expect(formatted).toContain('DFN-001');
      expect(formatted).toContain('DFN-002');
      expect(formatted).toContain('✅'); // completed
      expect(formatted).toContain('🔄'); // in_progress
    });

    it('should handle empty task list', () => {
      const formatted = formatTaskList([]);

      expect(formatted).toBe('No tasks found.');
    });

    it('should handle singular task', () => {
      const formatted = formatTaskList([mockTask]);

      expect(formatted).toContain('Found 1 task:');
    });
  });

  describe('formatTaskSummary', () => {
    it('should format task statistics', () => {
      const summary = {
        total: 10,
        pending: 2,
        in_progress: 3,
        completed: 4,
        blocked: 1,
      };

      const formatted = formatTaskSummary(summary);

      expect(formatted).toContain('Task Summary:');
      expect(formatted).toContain('Total: 10');
      expect(formatted).toContain('Pending: 2');
      expect(formatted).toContain('In Progress: 3');
      expect(formatted).toContain('Completed: 4');
      expect(formatted).toContain('Blocked: 1');
      expect(formatted).toContain('40%'); // 4/10 completion rate
    });

    it('should handle zero tasks', () => {
      const summary = {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        blocked: 0,
      };

      const formatted = formatTaskSummary(summary);

      expect(formatted).toContain('0%');
    });
  });
});

describe('Project Formatters', () => {
  const mockProject = {
    project_code: 'DFN',
    name: 'DFO Enhancement Plan 2025',
    status: 'active',
    progress: 40,
    budget: 50000,
    deadline: '2025-03-31T00:00:00Z',
  };

  describe('formatProject', () => {
    it('should format project with all fields', () => {
      const formatted = formatProject(mockProject);

      expect(formatted).toContain('DFN');
      expect(formatted).toContain('DFO Enhancement Plan 2025');
      expect(formatted).toContain('active');
      expect(formatted).toContain('40%');
      expect(formatted).toContain('$50,000');
    });

    it('should handle minimal project data', () => {
      const minimalProject = {
        project_code: 'TEST',
        name: 'Test Project',
        status: 'planning',
      };

      const formatted = formatProject(minimalProject);

      expect(formatted).toContain('TEST');
      expect(formatted).toContain('Test Project');
      expect(formatted).toContain('planning');
    });
  });

  describe('formatProjectList', () => {
    it('should format multiple projects', () => {
      const projects = [
        mockProject,
        { ...mockProject, project_code: 'SOL', name: 'SOLARIA' },
      ];

      const formatted = formatProjectList(projects);

      expect(formatted).toContain('Found 2 projects:');
      expect(formatted).toContain('DFN');
      expect(formatted).toContain('SOL');
    });

    it('should handle empty project list', () => {
      const formatted = formatProjectList([]);

      expect(formatted).toBe('No projects found.');
    });
  });
});

describe('Agent Formatters', () => {
  const mockAgent = {
    id: 11,
    name: 'Claude Code',
    role: 'Development Agent',
    status: 'active' as const,
  };

  describe('formatAgent', () => {
    it('should format agent with status icon', () => {
      const formatted = formatAgent(mockAgent);

      expect(formatted).toContain('Agent #11');
      expect(formatted).toContain('Claude Code');
      expect(formatted).toContain('Development Agent');
      expect(formatted).toContain('active');
      expect(formatted).toContain('🟢'); // active icon
    });

    it('should handle different statuses', () => {
      const busyAgent = { ...mockAgent, status: 'busy' as const };
      const formatted = formatAgent(busyAgent);

      expect(formatted).toContain('🟡'); // busy icon
    });
  });

  describe('formatAgentList', () => {
    it('should format multiple agents', () => {
      const agents = [
        mockAgent,
        { ...mockAgent, id: 5, name: 'Backend Architect', status: 'inactive' as const },
      ];

      const formatted = formatAgentList(agents);

      expect(formatted).toContain('Found 2 agents:');
      expect(formatted).toContain('Claude Code (#11)');
      expect(formatted).toContain('Backend Architect (#5)');
      expect(formatted).toContain('🟢'); // active
      expect(formatted).toContain('⚫'); // inactive
    });

    it('should handle empty agent list', () => {
      const formatted = formatAgentList([]);

      expect(formatted).toBe('No agents found.');
    });
  });
});

describe('Sprint Formatters', () => {
  const mockSprint = {
    sprint_number: 1,
    name: 'Sprint 1 - Foundation',
    status: 'active' as const,
    start_date: '2025-12-27T00:00:00Z',
    end_date: '2026-01-10T00:00:00Z',
    progress: 60,
  };

  describe('formatSprint', () => {
    it('should format sprint with all fields', () => {
      const formatted = formatSprint(mockSprint);

      expect(formatted).toContain('Sprint 1');
      expect(formatted).toContain('Foundation');
      expect(formatted).toContain('active');
      expect(formatted).toContain('60%');
      expect(formatted).toContain('🚀'); // active icon
    });

    it('should handle different statuses', () => {
      const completedSprint = { ...mockSprint, status: 'completed' as const };
      const formatted = formatSprint(completedSprint);

      expect(formatted).toContain('✅'); // completed icon
    });
  });

  describe('formatSprintList', () => {
    it('should format multiple sprints', () => {
      const sprints = [
        mockSprint,
        { ...mockSprint, sprint_number: 2, status: 'planned' as const },
      ];

      const formatted = formatSprintList(sprints);

      expect(formatted).toContain('Found 2 sprints:');
      expect(formatted).toContain('Sprint 1');
      expect(formatted).toContain('Sprint 2');
    });

    it('should handle empty sprint list', () => {
      const formatted = formatSprintList([]);

      expect(formatted).toBe('No sprints found.');
    });
  });
});

describe('Capability Formatters', () => {
  describe('formatCapabilities', () => {
    const capabilities = [
      {
        skill_name: 'payload-cms-setup',
        version: '1.2.0',
        active: true,
        registered_at: '2025-12-27T10:00:00Z',
      },
      {
        skill_name: 'tdd-workflow',
        version: '2.0.1',
        active: false,
      },
    ];

    it('should format capabilities with counts', () => {
      const formatted = formatCapabilities(11, capabilities);

      expect(formatted).toContain('Agent 11 Capabilities:');
      expect(formatted).toContain('Total: 2');
      expect(formatted).toContain('Active: 1');
      expect(formatted).toContain('payload-cms-setup v1.2.0');
      expect(formatted).toContain('tdd-workflow v2.0.1');
      expect(formatted).toContain('✓'); // active
      expect(formatted).toContain('✗'); // inactive
    });

    it('should handle empty capabilities', () => {
      const formatted = formatCapabilities(11, []);

      expect(formatted).toContain('no registered capabilities');
    });
  });
});

describe('Table Formatter', () => {
  describe('formatTable', () => {
    it('should format data as table', () => {
      const data = [
        { id: 1, name: 'Alice', role: 'Admin' },
        { id: 2, name: 'Bob', role: 'User' },
      ];

      const formatted = formatTable(data, ['id', 'name', 'role']);

      expect(formatted).toContain('id');
      expect(formatted).toContain('name');
      expect(formatted).toContain('role');
      expect(formatted).toContain('Alice');
      expect(formatted).toContain('Bob');
      expect(formatted).toContain('─'); // separator
    });

    it('should align columns correctly', () => {
      const data = [
        { short: 'A', long: 'Very Long Value' },
      ];

      const formatted = formatTable(data, ['short', 'long']);

      // Check that columns are aligned
      const lines = formatted.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should handle empty data', () => {
      const formatted = formatTable([], ['id', 'name']);

      expect(formatted).toBe('No data available.');
    });
  });
});

describe('Utility Formatters', () => {
  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(125)).toBe('2h 5m');
    });

    it('should format hours only', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0m');
    });
  });

  describe('formatPercentage', () => {
    it('should calculate percentage', () => {
      expect(formatPercentage(50, 100)).toBe('50%');
    });

    it('should round to nearest integer', () => {
      expect(formatPercentage(1, 3)).toBe('33%');
    });

    it('should handle zero total', () => {
      expect(formatPercentage(0, 0)).toBe('0%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(10, 10)).toBe('100%');
    });
  });

  describe('formatProgressBar', () => {
    it('should create progress bar with default width', () => {
      const bar = formatProgressBar(50);

      expect(bar).toContain('█');
      expect(bar).toContain('░');
      expect(bar).toContain('50%');
      expect(bar).toContain('[');
      expect(bar).toContain(']');
    });

    it('should create progress bar with custom width', () => {
      const bar = formatProgressBar(75, 10);

      // Should have approximately 7-8 filled and 2-3 empty
      expect(bar).toContain('█');
      expect(bar).toContain('░');
      expect(bar).toContain('75%');
    });

    it('should handle 0% progress', () => {
      const bar = formatProgressBar(0, 10);

      expect(bar).toContain('░░░░░░░░░░');
      expect(bar).toContain('0%');
    });

    it('should handle 100% progress', () => {
      const bar = formatProgressBar(100, 10);

      expect(bar).toContain('██████████');
      expect(bar).toContain('100%');
    });
  });
});

describe('Formatters Registry', () => {
  it('should export all formatters', () => {
    expect(Formatters.task).toBeDefined();
    expect(Formatters.taskList).toBeDefined();
    expect(Formatters.taskSummary).toBeDefined();
    expect(Formatters.project).toBeDefined();
    expect(Formatters.projectList).toBeDefined();
    expect(Formatters.agent).toBeDefined();
    expect(Formatters.agentList).toBeDefined();
    expect(Formatters.sprint).toBeDefined();
    expect(Formatters.sprintList).toBeDefined();
    expect(Formatters.capabilities).toBeDefined();
    expect(Formatters.table).toBeDefined();
    expect(Formatters.progressBar).toBeDefined();
  });

  it('should use formatters from registry', () => {
    const mockTask = {
      task_code: 'TEST-001',
      title: 'Test',
      status: 'pending' as const,
      progress: 0,
    };

    const formatted = Formatters.task(mockTask);

    expect(formatted).toContain('TEST-001');
    expect(formatted).toContain('Test');
  });
});
