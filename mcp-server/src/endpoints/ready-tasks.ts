/**
 * Ready Tasks Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-004
 *
 * Intelligently identifies tasks ready to work on (no blockers, actionable state)
 */

import { z } from 'zod';
import { ResponseBuilder } from '../utils/response-builder';
import { db } from '../database';
import { Tool } from '../types/mcp';

// ============================================================================
// Validation Schema
// ============================================================================

const GetReadyTasksInputSchema = z.object({
  project_id: z.number().int().positive().optional(),
  agent_id: z.number().int().positive().optional(),
  sprint_id: z.number().int().positive().optional(),
  epic_id: z.number().int().positive().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  limit: z.number().int().min(1).max(100).default(10),
  format: z.enum(['json', 'human']).default('json'),
});

// ============================================================================
// Helper Functions
// ============================================================================

function generateReadinessReasons(task: any): string[] {
  const reasons: string[] = [];

  // Always true for ready tasks
  reasons.push('✓ No blocking dependencies');

  if (task.priority === 'critical' || task.priority === 'high') {
    reasons.push(`✓ ${task.priority.toUpperCase()} priority`);
  }

  if (task.sprint_status === 'active') {
    reasons.push('✓ Part of active sprint');
  }

  if (task.assigned_agent_id) {
    reasons.push(`✓ Assigned to ${task.agent_name}`);
  } else {
    reasons.push('✓ Available for assignment');
  }

  if (task.estimated_hours) {
    reasons.push(`✓ Estimated: ${task.estimated_hours}h`);
  }

  if (task.deadline) {
    const daysUntil = Math.ceil(
      (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 7 && daysUntil > 0) {
      reasons.push(`⚠ Deadline in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`);
    } else if (daysUntil < 0) {
      reasons.push(`⚠ OVERDUE by ${Math.abs(daysUntil)} days`);
    }
  }

  return reasons;
}

function formatReadyTasks(tasks: any[]): string {
  if (tasks.length === 0) {
    return `
📋 Ready Tasks: None

All tasks are either:
  • Blocked by dependencies
  • Already in progress
  • Completed
  • Waiting for active sprint

Use /dfo status to see all tasks.
    `.trim();
  }

  const lines = [
    `📋 Ready Tasks (${tasks.length}):`,
    '',
  ];

  tasks.forEach((task, index) => {
    const priorityIcon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
    }[task.priority] || '⚪';

    lines.push(
      `${index + 1}. ${priorityIcon} ${task.task_code}: ${task.title}`,
      `   Readiness: ${task.readiness_score}/100 | Priority: ${task.priority}`,
    );

    if (task.agent_name) {
      lines.push(`   Assigned: ${task.agent_name}`);
    }

    if (task.sprint_name) {
      lines.push(`   Sprint: ${task.sprint_name}`);
    }

    if (task.estimated_hours) {
      lines.push(`   Estimated: ${task.estimated_hours}h`);
    }

    lines.push(`   ${task.readiness_reasons.join(' | ')}`);
    lines.push('');
  });

  lines.push('Use /dfo start <task-code> to begin working on a task.');

  return lines.join('\n');
}

// ============================================================================
// Endpoint Implementation
// ============================================================================

export const getReadyTasks: Tool = {
  name: 'get_ready_tasks',
  description: 'Get tasks that are ready to work on (no blockers, actionable state, priority-ordered)',
  inputSchema: GetReadyTasksInputSchema,

  async execute(params: z.infer<typeof GetReadyTasksInputSchema>) {
    const builder = new ResponseBuilder({ version: '2.0.0' });

    try {
      // Note: This query assumes a task_dependencies table exists
      // If it doesn't exist yet, we'll handle the error and return tasks without dependency filtering
      const query = `
        WITH ready_tasks AS (
          SELECT
            t.id,
            t.title,
            t.description,
            t.project_id,
            t.epic_id,
            t.sprint_id,
            t.assigned_agent_id,
            t.priority,
            t.estimated_hours,
            t.deadline,
            t.created_at,
            CONCAT(p.code, '-', t.task_number) AS task_code,
            p.name AS project_name,
            e.name AS epic_name,
            s.name AS sprint_name,
            s.status AS sprint_status,
            a.name AS agent_name,
            COALESCE(
              (
                SELECT COUNT(*)
                FROM task_dependencies td
                JOIN tasks blocker ON td.depends_on_task_id = blocker.id
                WHERE td.task_id = t.id
                  AND td.relationship_type = 'blocks'
                  AND blocker.status != 'completed'
              ),
              0
            ) AS blocker_count
          FROM tasks t
          LEFT JOIN projects p ON t.project_id = p.id
          LEFT JOIN epics e ON t.epic_id = e.id
          LEFT JOIN sprints s ON t.sprint_id = s.id
          LEFT JOIN agents a ON t.assigned_agent_id = a.id
          WHERE t.status = 'pending'
            AND (? IS NULL OR t.project_id = ?)
            AND (? IS NULL OR t.assigned_agent_id = ? OR t.assigned_agent_id IS NULL)
            AND (? IS NULL OR t.sprint_id = ?)
            AND (? IS NULL OR t.epic_id = ?)
            AND (? IS NULL OR t.priority = ?)
            AND (t.sprint_id IS NULL OR s.status IN ('planned', 'active'))
            AND (t.epic_id IS NULL OR e.status != 'cancelled')
        )
        SELECT
          *,
          (
            50
            + CASE priority WHEN 'critical' THEN 30 WHEN 'high' THEN 20 WHEN 'medium' THEN 10 ELSE 0 END
            + CASE WHEN sprint_status = 'active' THEN 15 ELSE 0 END
            + CASE WHEN assigned_agent_id IS NOT NULL THEN 5 ELSE 0 END
            + CASE WHEN estimated_hours > 0 THEN 5 ELSE 0 END
            + CASE
                WHEN deadline IS NOT NULL AND DATEDIFF(deadline, NOW()) <= 7 AND DATEDIFF(deadline, NOW()) > 0 THEN 10
                WHEN deadline IS NOT NULL AND DATEDIFF(deadline, NOW()) < 0 THEN -10
                ELSE 0
              END
            + CASE WHEN blocker_count = 0 THEN 5 ELSE 0 END
          ) AS readiness_score
        FROM ready_tasks
        WHERE blocker_count = 0
        ORDER BY
          readiness_score DESC,
          CASE
            WHEN deadline IS NOT NULL THEN deadline
            ELSE '9999-12-31'
          END ASC,
          created_at ASC
        LIMIT ?
      `;

      const queryParams = [
        params.project_id,
        params.project_id,
        params.agent_id,
        params.agent_id,
        params.sprint_id,
        params.sprint_id,
        params.epic_id,
        params.epic_id,
        params.priority,
        params.priority,
        params.limit,
      ];

      let tasks;
      try {
        tasks = await db.query(query, queryParams);
      } catch (dbError: any) {
        // If task_dependencies table doesn't exist, fall back to simpler query
        if (dbError.code === 'ER_NO_SUCH_TABLE' && dbError.message.includes('task_dependencies')) {
          console.warn('task_dependencies table not found, using simplified query without dependency checks');

          const fallbackQuery = `
            SELECT
              t.id,
              t.title,
              t.description,
              t.project_id,
              t.epic_id,
              t.sprint_id,
              t.assigned_agent_id,
              t.priority,
              t.estimated_hours,
              t.deadline,
              t.created_at,
              CONCAT(p.code, '-', t.task_number) AS task_code,
              p.name AS project_name,
              e.name AS epic_name,
              s.name AS sprint_name,
              s.status AS sprint_status,
              a.name AS agent_name,
              0 AS blocker_count,
              (
                50
                + CASE priority WHEN 'critical' THEN 30 WHEN 'high' THEN 20 WHEN 'medium' THEN 10 ELSE 0 END
                + CASE WHEN s.status = 'active' THEN 15 ELSE 0 END
                + CASE WHEN assigned_agent_id IS NOT NULL THEN 5 ELSE 0 END
                + CASE WHEN estimated_hours > 0 THEN 5 ELSE 0 END
              ) AS readiness_score
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN epics e ON t.epic_id = e.id
            LEFT JOIN sprints s ON t.sprint_id = s.id
            LEFT JOIN agents a ON t.assigned_agent_id = a.id
            WHERE t.status = 'pending'
              AND (? IS NULL OR t.project_id = ?)
              AND (? IS NULL OR t.assigned_agent_id = ? OR t.assigned_agent_id IS NULL)
              AND (? IS NULL OR t.sprint_id = ?)
              AND (? IS NULL OR t.epic_id = ?)
              AND (? IS NULL OR t.priority = ?)
              AND (t.sprint_id IS NULL OR s.status IN ('planned', 'active'))
              AND (t.epic_id IS NULL OR e.status != 'cancelled')
            ORDER BY readiness_score DESC
            LIMIT ?
          `;

          tasks = await db.query(fallbackQuery, queryParams);
        } else {
          throw dbError;
        }
      }

      // Add readiness reasons to each task
      const tasksWithReasons = tasks.map((task: any) => ({
        ...task,
        readiness_reasons: generateReadinessReasons(task),
      }));

      const data = {
        tasks: tasksWithReasons,
        total: tasksWithReasons.length,
        filters: {
          project_id: params.project_id,
          agent_id: params.agent_id,
          sprint_id: params.sprint_id,
          epic_id: params.epic_id,
          priority: params.priority,
        },
      };

      // Human-readable format
      const formatted =
        params.format === 'human' ? formatReadyTasks(tasksWithReasons) : undefined;

      return builder.success(data, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

// ============================================================================
// Export
// ============================================================================

export const readyTasksTools = [getReadyTasks];
