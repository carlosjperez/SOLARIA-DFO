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
