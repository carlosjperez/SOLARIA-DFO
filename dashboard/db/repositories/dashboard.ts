/**
 * SOLARIA DFO - Dashboard Repository (Drizzle ORM)
 * Aggregated queries for dashboard views
 */

import { db, pool } from '../index.js';

// ============================================================================
// Dashboard Overview
// ============================================================================

export async function getActiveProjectsOverview(limit = 10) {
    return pool.execute(`
        SELECT
            p.id, p.name, p.code, p.status, p.priority,
            p.completion_percentage, p.deadline,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'in_progress') as active_tasks,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'pending') as pending_tasks
        FROM projects p
        WHERE p.status = 'active' AND (p.archived = FALSE OR p.archived IS NULL)
        ORDER BY p.priority DESC, p.deadline ASC
        LIMIT ?
    `, [limit]);
}

export async function getTodayTasksOverview(limit = 15) {
    return pool.execute(`
        SELECT
            t.id, t.title, t.status, t.priority, t.progress,
            p.name as project_name, p.code as project_code,
            aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE DATE(t.updated_at) = CURDATE() OR t.status = 'in_progress'
        ORDER BY t.priority DESC, t.updated_at DESC
        LIMIT ?
    `, [limit]);
}

export async function getAgentsOverview() {
    return pool.execute(`
        SELECT
            id, name, role, status, last_activity,
            (SELECT COUNT(*) FROM tasks WHERE assigned_agent_id = ai_agents.id AND status = 'in_progress') as active_tasks
        FROM ai_agents
        ORDER BY status DESC, last_activity DESC
    `);
}

export async function getQuickStats() {
    return pool.execute(`
        SELECT
            (SELECT COUNT(*) FROM projects WHERE status = 'active' AND (archived = FALSE OR archived IS NULL)) as active_projects,
            (SELECT COUNT(*) FROM projects WHERE (archived = FALSE OR archived IS NULL)) as total_projects,
            (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress') as tasks_in_progress,
            (SELECT COUNT(*) FROM tasks) as total_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND DATE(completed_at) = CURDATE()) as completed_today,
            (SELECT COUNT(*) FROM tasks WHERE priority = 'critical' AND status != 'completed') as critical_tasks,
            (SELECT COUNT(*) FROM memories WHERE DATE(created_at) = CURDATE()) as memories_today,
            (SELECT COUNT(*) FROM ai_agents) as total_agents
    `);
}

// ============================================================================
// Dashboard Metrics
// ============================================================================

export async function getVelocityMetrics(days = 7) {
    return pool.execute(`
        SELECT
            DATE(completed_at) as date,
            COUNT(*) as tasks_completed,
            SUM(actual_hours) as hours_worked
        FROM tasks
        WHERE status = 'completed'
            AND completed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(completed_at)
        ORDER BY date DESC
    `, [days]);
}

export async function getProjectCompletionRates(limit = 10) {
    return pool.execute(`
        SELECT
            p.id, p.name, p.code,
            p.completion_percentage,
            COUNT(t.id) as total_tasks,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.status = 'active' AND (p.archived = FALSE OR p.archived IS NULL)
        GROUP BY p.id
        ORDER BY p.completion_percentage DESC
        LIMIT ?
    `, [limit]);
}

export async function getPriorityDistribution() {
    return pool.execute(`
        SELECT
            priority,
            COUNT(*) as count
        FROM tasks
        WHERE status != 'completed'
        GROUP BY priority
    `);
}

export async function getEpicProgress(limit = 5) {
    return pool.execute(`
        SELECT
            e.id, e.name,
            COUNT(t.id) as total_tasks,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
            ROUND((SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(t.id)) * 100) as completion_percentage
        FROM epics e
        LEFT JOIN tasks t ON t.epic_id = e.id
        WHERE e.status = 'active'
        GROUP BY e.id
        ORDER BY completion_percentage DESC
        LIMIT ?
    `, [limit]);
}

// ============================================================================
// Dashboard Alerts
// ============================================================================

export async function getOverdueTasks(limit = 20) {
    return pool.execute(`
        SELECT
            t.id, t.title, t.deadline, t.priority, t.status,
            p.name as project_name, p.code as project_code,
            aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.deadline < NOW() AND t.status != 'completed'
        ORDER BY t.deadline ASC
        LIMIT ?
    `, [limit]);
}

export async function getBlockedTasks(limit = 10) {
    return pool.execute(`
        SELECT
            t.id, t.title, t.priority,
            p.name as project_name,
            aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.status = 'blocked'
        ORDER BY t.priority DESC, t.created_at DESC
        LIMIT ?
    `, [limit]);
}

export async function getStaleTasks(days = 7, limit = 15) {
    return pool.execute(`
        SELECT
            t.id, t.title, t.status, t.updated_at,
            p.name as project_name,
            aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.status = 'in_progress'
            AND t.updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        ORDER BY t.updated_at ASC
        LIMIT ?
    `, [days, limit]);
}

export async function getUpcomingDeadlines(days = 7, limit = 10) {
    return pool.execute(`
        SELECT
            t.id, t.title, t.deadline, t.priority,
            p.name as project_name,
            aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
            AND t.status != 'completed'
        ORDER BY t.deadline ASC
        LIMIT ?
    `, [days, limit]);
}

export async function getProjectUpcomingDeadlines(days = 14, limit = 10) {
    return pool.execute(`
        SELECT
            id, name, code, deadline, completion_percentage,
            DATEDIFF(deadline, CURDATE()) as days_remaining
        FROM projects
        WHERE deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND status = 'active'
            AND (archived = FALSE OR archived IS NULL)
        ORDER BY deadline ASC
        LIMIT ?
    `, [days, limit]);
}

export async function getCriticalTasks(limit = 10) {
    return pool.execute(`
        SELECT
            t.id, t.title, t.status, t.progress,
            p.name as project_name,
            aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.priority = 'critical' AND t.status != 'completed'
        ORDER BY t.created_at ASC
        LIMIT ?
    `, [limit]);
}

export async function getHighPriorityPending(limit = 15) {
    return pool.execute(`
        SELECT
            t.id, t.title, t.priority, t.deadline,
            p.name as project_name,
            aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.status = 'pending' AND t.priority IN ('critical', 'high')
        ORDER BY t.priority DESC, t.created_at ASC
        LIMIT ?
    `, [limit]);
}

export async function getRecentAlerts(limit = 10) {
    return pool.execute(`
        SELECT * FROM alerts
        WHERE status = 'active'
        ORDER BY severity DESC, created_at DESC
        LIMIT ?
    `, [limit]);
}

// ============================================================================
// Dashboard Public Stats
// ============================================================================

export async function getProjectStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            SUM(budget) as total_budget,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) as on_hold,
            SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning,
            AVG(completion_percentage) as avg_completion
        FROM projects
        WHERE (archived = FALSE OR archived IS NULL)
    `);
}

export async function getTaskStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN t.priority = 'critical' THEN 1 ELSE 0 END) as critical_count,
            SUM(CASE WHEN t.priority = 'high' THEN 1 ELSE 0 END) as high_count
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE (p.archived = FALSE OR p.archived IS NULL)
    `);
}

export async function getAgentStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'idle' THEN 1 ELSE 0 END) as idle,
            SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) as busy
        FROM ai_agents
    `);
}

export async function getMemoryStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            AVG(importance) as avg_importance,
            SUM(access_count) as total_accesses
        FROM memories
    `);
}

export async function getActivityStats() {
    return pool.execute(`
        SELECT COUNT(*) as last_24h
        FROM activity_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
}

export async function getBusinessStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total_businesses,
            SUM(revenue) as total_revenue,
            SUM(expenses) as total_expenses,
            SUM(profit) as total_profit,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM businesses
    `);
}

export interface StatsFilters {
    project_id?: number;
    sprint_id?: number;
    start_date?: string;
    end_date?: string;
}

export async function getComprehensiveStats(filters: StatsFilters = {}) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.project_id) {
        conditions.push('t.project_id = ?');
        params.push(filters.project_id);
    }

    if (filters.sprint_id) {
        conditions.push('t.sprint_id = ?');
        params.push(filters.sprint_id);
    }

    if (filters.start_date) {
        conditions.push('DATE(t.created_at) >= ?');
        params.push(filters.start_date);
    }

    if (filters.end_date) {
        conditions.push('DATE(t.created_at) <= ?');
        params.push(filters.end_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const whereClauseNoProject = conditions.filter(c => !c.startsWith('t.project_id')).length > 0
        ? `WHERE ${conditions.filter(c => !c.startsWith('t.project_id')).join(' AND ')}`
        : '';

    const projectFilterWhere = filters.project_id ? `WHERE p.id = ${filters.project_id}` : '';

    const [
        [taskStats],
        [projectStats],
        [agentStats],
        [velocityStats],
        [sprintStats],
        [epicStats]
    ] = await Promise.all([
        pool.execute(`
            SELECT
                COUNT(*) as total_tasks,
                SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END) as blocked_tasks,
                SUM(CASE WHEN t.priority = 'critical' THEN 1 ELSE 0 END) as critical_tasks,
                SUM(CASE WHEN t.priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
                SUM(CASE WHEN t.priority = 'medium' THEN 1 ELSE 0 END) as medium_priority_tasks,
                SUM(CASE WHEN t.priority = 'low' THEN 1 ELSE 0 END) as low_priority_tasks,
                AVG(t.progress) as avg_progress,
                SUM(t.estimated_hours) as total_estimated_hours,
                SUM(t.actual_hours) as total_actual_hours
            FROM tasks t
            ${whereClause}
        `, params),

        pool.execute(`
            SELECT
                COUNT(*) as total_projects,
                SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_projects,
                SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
                SUM(CASE WHEN p.status = 'on_hold' THEN 1 ELSE 0 END) as on_hold_projects,
                SUM(CASE WHEN p.status = 'planning' THEN 1 ELSE 0 END) as planning_projects,
                AVG(p.completion_percentage) as avg_completion_percentage,
                SUM(p.budget) as total_budget
            FROM projects p
            ${projectFilterWhere}
        `),

        pool.execute(`
            SELECT
                COUNT(*) as total_agents,
                SUM(CASE WHEN aa.status = 'active' THEN 1 ELSE 0 END) as active_agents,
                SUM(CASE WHEN aa.status = 'idle' THEN 1 ELSE 0 END) as idle_agents,
                SUM(CASE WHEN aa.status = 'busy' THEN 1 ELSE 0 END) as busy_agents
            FROM ai_agents aa
        `),

        pool.execute(`
            SELECT
                DATE(t.completed_at) as date,
                COUNT(*) as tasks_completed,
                SUM(t.actual_hours) as hours_completed
            FROM tasks t
            WHERE t.status = 'completed'
                ${filters.start_date ? `AND DATE(t.completed_at) >= '${filters.start_date}'` : ''}
                ${filters.end_date ? `AND DATE(t.completed_at) <= '${filters.end_date}'` : ''}
            GROUP BY DATE(t.completed_at)
            ORDER BY date DESC
            LIMIT 30
        `),

        pool.execute(`
            SELECT
                s.id,
                s.name,
                s.status,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                ROUND((SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(t.id)) * 100, 2) as completion_percentage
            FROM sprints s
            LEFT JOIN tasks t ON t.sprint_id = s.id
            ${filters.project_id ? `WHERE s.project_id = ${filters.project_id}` : ''}
            GROUP BY s.id
            ORDER BY s.start_date DESC
        `),

        pool.execute(`
            SELECT
                e.id,
                e.name,
                e.status,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                ROUND((SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(t.id)) * 100, 2) as completion_percentage
            FROM epics e
            LEFT JOIN tasks t ON t.epic_id = e.id
            ${filters.project_id ? `WHERE e.project_id = ${filters.project_id}` : ''}
            GROUP BY e.id
            ORDER BY e.created_at DESC
        `)
    ]);

    return {
        tasks: taskStats,
        projects: projectStats,
        agents: agentStats,
        velocity: velocityStats,
        sprints: sprintStats,
        epics: epicStats,
        generated_at: new Date().toISOString()
    };
}
