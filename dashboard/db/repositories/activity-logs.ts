/**
 * SOLARIA DFO - Activity Logs Repository (Drizzle ORM)
 * Centralized activity logging for system events
 */

import { pool } from '../index.js';

export async function createActivityLog(data: {
    action: string;
    message?: string;
    category?: string;
    level?: string;
    projectId?: number | null;
    agentId?: number | null;
    metadata?: Record<string, unknown>;
}) {
    const [result] = await pool.execute(`
        INSERT INTO activity_logs (action, message, category, level, project_id, agent_id, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        data.action,
        data.message || data.action,
        data.category || 'system',
        data.level || 'info',
        data.projectId || null,
        data.agentId || null,
        data.metadata ? JSON.stringify(data.metadata) : null
    ]);

    return result;
}

export async function findActivityLogsWithFilters(filters: {
    projectId?: number;
    agentId?: number;
    category?: string;
    level?: string;
    fromDate?: string;
    toDate?: string;
    limit: number;
    offset: number;
}) {
    let query = `
        SELECT
            al.id,
            al.project_id,
            al.agent_id,
            al.task_id,
            al.user_id,
            al.action,
            al.details,
            al.category,
            al.level,
            al.timestamp,
            al.created_at,
            p.name as project_name,
            p.code as project_code,
            aa.name as agent_name,
            t.title as task_title,
            t.task_number,
            u.username as user_name
        FROM activity_logs al
        LEFT JOIN projects p ON al.project_id = p.id
        LEFT JOIN ai_agents aa ON al.agent_id = aa.id
        LEFT JOIN tasks t ON al.task_id = t.id
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (filters.projectId) {
        query += ' AND al.project_id = ?';
        params.push(filters.projectId);
    }
    if (filters.agentId) {
        query += ' AND al.agent_id = ?';
        params.push(filters.agentId);
    }
    if (filters.category) {
        query += ' AND al.category = ?';
        params.push(filters.category);
    }
    if (filters.level) {
        query += ' AND al.level = ?';
        params.push(filters.level);
    }
    if (filters.fromDate) {
        query += ' AND al.created_at >= ?';
        params.push(filters.fromDate);
    }
    if (filters.toDate) {
        query += ' AND al.created_at <= ?';
        params.push(filters.toDate);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit, filters.offset);

    return pool.execute(query, params);
}

export async function countActivityLogs(filters: {
    projectId?: number;
    agentId?: number;
    category?: string;
    level?: string;
}) {
    let query = 'SELECT COUNT(*) as total FROM activity_logs al WHERE 1=1';
    const params: (string | number)[] = [];

    if (filters.projectId) {
        query += ' AND al.project_id = ?';
        params.push(filters.projectId);
    }
    if (filters.agentId) {
        query += ' AND al.agent_id = ?';
        params.push(filters.agentId);
    }
    if (filters.category) {
        query += ' AND al.category = ?';
        params.push(filters.category);
    }
    if (filters.level) {
        query += ' AND al.level = ?';
        params.push(filters.level);
    }

    return pool.execute(query, params);
}

export async function findAuditLogs(filters: {
    auditActions: string[];
    projectId?: number;
    userId?: number;
    action?: string;
    limit: number;
    offset: number;
}) {
    let query = `
        SELECT
            al.id,
            al.project_id,
            al.agent_id,
            al.task_id,
            al.user_id,
            al.action,
            al.details,
            al.category,
            al.level,
            al.timestamp,
            al.created_at,
            p.name as project_name,
            p.code as project_code,
            u.username as user_name,
            INET_NTOA(CONV(SUBSTRING(al.details, LOCATE('"ip":"', al.details) + 6,
                LOCATE('"', al.details, LOCATE('"ip":"', al.details) + 6) - LOCATE('"ip":"', al.details) - 6
            ), 10, 10)) as ip_address
        FROM activity_logs al
        LEFT JOIN projects p ON al.project_id = p.id
        LEFT JOIN users u ON al.user_id = u.id
        WHERE (al.category = 'security' OR al.action IN (${filters.auditActions.map(() => '?').join(',')}))
    `;
    const params: (string | number)[] = [...filters.auditActions];

    if (filters.projectId) {
        query += ' AND al.project_id = ?';
        params.push(filters.projectId);
    }
    if (filters.userId) {
        query += ' AND al.user_id = ?';
        params.push(filters.userId);
    }
    if (filters.action) {
        query += ' AND al.action = ?';
        params.push(filters.action);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit, filters.offset);

    return pool.execute(query, params);
}

export async function getAuditStats(auditActions: string[]) {
    return pool.execute(`
        SELECT
            COUNT(*) as total_entries,
            COUNT(CASE WHEN level = 'warning' THEN 1 END) as warnings,
            COUNT(CASE WHEN level = 'error' THEN 1 END) as errors,
            COUNT(CASE WHEN level = 'critical' THEN 1 END) as critical,
            COUNT(CASE WHEN action LIKE 'login_failed%' THEN 1 END) as failed_logins,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT project_id) as affected_projects
        FROM activity_logs
        WHERE category = 'security'
           OR action IN (${auditActions.map(() => '?').join(',')})
    `, auditActions);
}
