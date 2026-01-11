/**
 * SOLARIA DFO - C-Suite Dashboards Repository (Drizzle ORM)
 * Executive dashboard queries for CEO, CTO, COO, CFO
 */

import { pool } from '../index.js';

// ============================================================================
// CEO Dashboard
// ============================================================================

export async function getCEOProjectsWithStats() {
    return pool.execute(`
        SELECT
            p.*,
            (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
            (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
            (SELECT COUNT(*) FROM alerts a WHERE a.project_id = p.id AND a.status = 'active') as active_alerts
        FROM projects p
    `);
}

export async function getCEOBudgetSummary() {
    return pool.execute(`
        SELECT
            SUM(budget) as total_budget,
            SUM(actual_cost) as total_spent,
            SUM(budget) - SUM(actual_cost) as remaining,
            AVG(completion_percentage) as avg_completion
        FROM projects
    `);
}

export async function getCEOCriticalAlerts() {
    return pool.execute(`
        SELECT * FROM alerts WHERE severity = 'critical' AND status = 'active'
    `);
}

export async function getCEOTopTasks(limit = 5) {
    return pool.execute(`
        SELECT title, status, priority, project_id, progress, created_at
        FROM tasks
        WHERE status <> 'completed'
        ORDER BY priority DESC, created_at DESC
        LIMIT ?
    `, [limit]);
}

// ============================================================================
// CTO Dashboard
// ============================================================================

export async function getCTOTechMetrics(days = 7) {
    return pool.execute(`
        SELECT
            AVG(code_quality_score) as avg_quality,
            AVG(test_coverage) as avg_coverage,
            AVG(agent_efficiency) as avg_efficiency
        FROM project_metrics WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [days]);
}

export async function getCTOTechDebt() {
    return pool.execute(`
        SELECT COUNT(*) as count FROM tasks WHERE status = 'blocked' OR priority = 'critical'
    `);
}

// ============================================================================
// COO Dashboard
// ============================================================================

export async function getCOORecentTasks(limit = 20) {
    return pool.execute(`
        SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?
    `, [limit]);
}

export async function getCOOTaskStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM tasks
    `);
}

export async function getCOOAgentWorkload() {
    return pool.execute(`
        SELECT
            aa.name, aa.role, aa.status,
            COUNT(t.id) as assigned_tasks,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM ai_agents aa
        LEFT JOIN tasks t ON aa.id = t.assigned_agent_id
        GROUP BY aa.id
    `);
}

// ============================================================================
// CFO Dashboard
// ============================================================================

export async function getCFOFinancials() {
    return pool.execute(`
        SELECT
            SUM(budget) as total_budget,
            SUM(actual_cost) as total_cost,
            SUM(budget) - SUM(actual_cost) as remaining_budget
        FROM projects
    `);
}

export async function getCFOCostByProject() {
    return pool.execute(`
        SELECT name, budget, actual_cost,
            (actual_cost / budget * 100) as burn_rate
        FROM projects
    `);
}

export async function getCFOMonthlySpend(months = 6) {
    return pool.execute(`
        SELECT
            DATE_FORMAT(metric_date, '%Y-%m') as month,
            SUM(budget_used) as monthly_spend
        FROM project_metrics
        GROUP BY DATE_FORMAT(metric_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT ?
    `, [months]);
}

// ============================================================================
// Office Dashboard
// ============================================================================

export async function getOfficeClientStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) as leads,
            SUM(CASE WHEN status = 'prospect' THEN 1 ELSE 0 END) as prospects,
            SUM(lifetime_value) as total_ltv
        FROM office_clients
    `);
}

export async function getOfficeProjectStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'development' THEN 1 ELSE 0 END) as in_development,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(budget) as total_budget
        FROM projects WHERE office_visible = 1
    `);
}

export async function getOfficePaymentStats() {
    return pool.execute(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'received' THEN amount ELSE 0 END) as received,
            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
        FROM office_payments
    `);
}

export async function getOfficeRecentClients(limit = 5) {
    return pool.execute(`
        SELECT id, name, status, created_at
        FROM office_clients
        ORDER BY created_at DESC LIMIT ?
    `, [limit]);
}
