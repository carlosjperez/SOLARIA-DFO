/**
 * Stats Dashboard Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-005
 *
 * Aggregated statistics for tasks, velocity, completion rates, and agent workload
 */

import { z } from 'zod';
import { ResponseBuilder } from '../utils/response-builder';
import { db } from '../database';
import { formatStats } from '../utils/formatters';
import type { Tool } from '../types/mcp';

// ============================================================================
// Constants
// ============================================================================

const VERSION = '2.0.0';

// ============================================================================
// Types
// ============================================================================

interface TasksByStatus {
  pending: number;
  in_progress: number;
  completed: number;
  blocked: number;
}

interface TasksByPriority {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface VelocityData {
  current_sprint: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  history: Array<{ sprint_id: number; points: number }>;
}

interface AgentWorkload {
  agent_id: number;
  agent_name: string;
  tasks_assigned: number;
  tasks_completed: number;
  efficiency: number;
}

interface StatsData {
  project_id?: number;
  project_name?: string;
  period: {
    from: string;
    to: string;
  };
  tasks: {
    total: number;
    by_status: TasksByStatus;
    by_priority: TasksByPriority;
    completion_rate: number;
  };
  velocity: VelocityData;
  agents: {
    total: number;
    active: number;
    workload: AgentWorkload[];
  };
  health_score: number;
}

// ============================================================================
// Validation Schema
// ============================================================================

const GetStatsInputSchema = z.object({
  project_id: z.number().int().positive().optional(),
  sprint_id: z.number().int().positive().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  format: z.enum(['json', 'human']).default('json'),
});

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get task distribution by status
 */
async function getTasksByStatus(
  projectId?: number,
  dateFrom?: string,
  dateTo?: string
): Promise<{ total: number; by_status: TasksByStatus }> {
  const query = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
    FROM tasks
    WHERE (? IS NULL OR project_id = ?)
      AND (? IS NULL OR created_at >= ?)
      AND (? IS NULL OR created_at <= ?)
  `;

  const params = [projectId, projectId, dateFrom, dateFrom, dateTo, dateTo];
  const [result] = await db.query(query, params);

  return {
    total: Number(result?.total) || 0,
    by_status: {
      pending: Number(result?.pending) || 0,
      in_progress: Number(result?.in_progress) || 0,
      completed: Number(result?.completed) || 0,
      blocked: Number(result?.blocked) || 0,
    },
  };
}

/**
 * Get task distribution by priority
 */
async function getTasksByPriority(projectId?: number): Promise<TasksByPriority> {
  const query = `
    SELECT
      SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low
    FROM tasks
    WHERE (? IS NULL OR project_id = ?)
  `;

  const [result] = await db.query(query, [projectId, projectId]);

  return {
    critical: Number(result?.critical) || 0,
    high: Number(result?.high) || 0,
    medium: Number(result?.medium) || 0,
    low: Number(result?.low) || 0,
  };
}

/**
 * Get velocity data
 */
async function getVelocity(projectId?: number, sprintId?: number): Promise<VelocityData> {
  // Get current sprint velocity
  const currentQuery = `
    SELECT COALESCE(SUM(t.estimated_hours), 0) as points
    FROM tasks t
    JOIN sprints s ON t.sprint_id = s.id
    WHERE t.status = 'completed'
      AND (? IS NULL OR t.project_id = ?)
      AND (? IS NULL OR t.sprint_id = ?)
      AND (s.status = 'active' OR ? IS NOT NULL)
  `;

  const [currentResult] = await db.query(currentQuery, [
    projectId, projectId, sprintId, sprintId, sprintId,
  ]);

  const currentSprint = Number(currentResult?.points) || 0;

  // Get velocity history
  const historyQuery = `
    SELECT
      s.id as sprint_id,
      COALESCE(SUM(t.estimated_hours), 0) as points
    FROM sprints s
    LEFT JOIN tasks t ON t.sprint_id = s.id AND t.status = 'completed'
    WHERE (? IS NULL OR s.project_id = ?)
      AND s.status IN ('completed', 'active')
    GROUP BY s.id
    ORDER BY s.end_date DESC
    LIMIT 5
  `;

  const historyResults = await db.query(historyQuery, [projectId, projectId]);

  const history = historyResults.map((r: any) => ({
    sprint_id: r.sprint_id,
    points: Number(r.points) || 0,
  }));

  // Calculate average
  const average = history.length > 0
    ? Math.round(history.reduce((sum: number, h: any) => sum + h.points, 0) / history.length)
    : 0;

  // Calculate trend (compare last 2 sprints)
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (history.length >= 2) {
    const diff = history[0].points - history[1].points;
    if (diff > average * 0.1) trend = 'up';
    else if (diff < -average * 0.1) trend = 'down';
  }

  return {
    current_sprint: currentSprint,
    average,
    trend,
    history,
  };
}

/**
 * Get agent workload data
 */
async function getAgentWorkload(projectId?: number): Promise<{
  total: number;
  active: number;
  workload: AgentWorkload[];
}> {
  const query = `
    SELECT
      a.id as agent_id,
      a.name as agent_name,
      a.status as agent_status,
      COUNT(t.id) as tasks_assigned,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as tasks_completed
    FROM agents a
    LEFT JOIN tasks t ON t.assigned_agent_id = a.id
      AND (? IS NULL OR t.project_id = ?)
    GROUP BY a.id, a.name, a.status
  `;

  const results = await db.query(query, [projectId, projectId]);

  const workload: AgentWorkload[] = results.map((r: any) => {
    const assigned = Number(r.tasks_assigned) || 0;
    const completed = Number(r.tasks_completed) || 0;
    const efficiency = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

    return {
      agent_id: r.agent_id,
      agent_name: r.agent_name,
      tasks_assigned: assigned,
      tasks_completed: completed,
      efficiency,
    };
  });

  const total = results.length;
  const active = results.filter((r: any) => r.agent_status === 'active').length;

  return { total, active, workload };
}

/**
 * Get project name by ID
 */
async function getProjectName(projectId: number): Promise<string | undefined> {
  const query = 'SELECT name FROM projects WHERE id = ?';
  const [result] = await db.query(query, [projectId]);
  return result?.name;
}

/**
 * Calculate health score
 */
function calculateHealthScore(
  tasksByStatus: TasksByStatus,
  total: number,
  velocity: VelocityData
): number {
  if (total === 0) return 100;

  // Completion rate (30%)
  const completionRate = (tasksByStatus.completed / total) * 100;
  const completionScore = completionRate * 0.30;

  // Blocked ratio inverse (20%)
  const blockedRatio = tasksByStatus.blocked / total;
  const blockedScore = (1 - blockedRatio) * 100 * 0.20;

  // Velocity score (20%)
  let velocityScore = 50; // Default neutral
  if (velocity.trend === 'up') velocityScore = 80;
  else if (velocity.trend === 'down') velocityScore = 30;
  velocityScore = velocityScore * 0.20;

  // Utilization (15%) - based on in_progress ratio
  const inProgressRatio = tasksByStatus.in_progress / total;
  const utilizationScore = Math.min(inProgressRatio * 2, 1) * 100 * 0.15;

  // Progress score (15%) - pending should decrease
  const pendingRatio = tasksByStatus.pending / total;
  const progressScore = (1 - pendingRatio) * 100 * 0.15;

  return Math.round(
    completionScore + blockedScore + velocityScore + utilizationScore + progressScore
  );
}

// ============================================================================
// Endpoint Implementation
// ============================================================================

export const getStats: Tool = {
  name: 'get_stats',
  description: 'Get aggregated system statistics for tasks, velocity, and agent workload',
  inputSchema: GetStatsInputSchema,

  async execute(params: z.infer<typeof GetStatsInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      // Set default date range if not provided
      const now = new Date();
      const dateFrom = params.date_from || undefined;
      const dateTo = params.date_to || now.toISOString();

      // Run queries in parallel
      const [taskData, priorityData, velocityData, agentData] = await Promise.all([
        getTasksByStatus(params.project_id, dateFrom, dateTo),
        getTasksByPriority(params.project_id),
        getVelocity(params.project_id, params.sprint_id),
        getAgentWorkload(params.project_id),
      ]);

      // Get project name if project_id provided
      let projectName: string | undefined;
      if (params.project_id) {
        projectName = await getProjectName(params.project_id);
      }

      // Calculate completion rate
      const completionRate = taskData.total > 0
        ? Math.round((taskData.by_status.completed / taskData.total) * 100)
        : 0;

      // Calculate health score
      const healthScore = calculateHealthScore(
        taskData.by_status,
        taskData.total,
        velocityData
      );

      const statsData: StatsData = {
        project_id: params.project_id,
        project_name: projectName,
        period: {
          from: dateFrom || 'all time',
          to: dateTo,
        },
        tasks: {
          total: taskData.total,
          by_status: taskData.by_status,
          by_priority: priorityData,
          completion_rate: completionRate,
        },
        velocity: velocityData,
        agents: agentData,
        health_score: healthScore,
      };

      // Transform for formatter compatibility
      const formatterData = {
        project_id: params.project_id,
        project_name: projectName,
        tasks: {
          total: taskData.total,
          by_status: taskData.by_status,
          by_priority: priorityData,
        },
        velocity: velocityData,
        completion_rate: completionRate,
        health_score: healthScore,
        agents_active: agentData.active,
        agents_total: agentData.total,
      };

      const formatted = params.format === 'human'
        ? formatStats(formatterData)
        : undefined;

      return builder.success(statsData, {
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

export const statsTools = [getStats];
