/**
 * SOLARIA DFO - Alerts & Logs Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import {
    alerts,
    activityLogs,
    type Alert,
    type NewAlert,
    type ActivityLog,
    type NewActivityLog,
} from '../schema/index.js';

// ============================================================================
// Alerts CRUD
// ============================================================================

export async function findAllAlerts(filters?: {
    projectId?: number;
    status?: string;
    severity?: string;
    limit?: number;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(alerts.projectId, filters.projectId));
    }
    if (filters?.status) {
        conditions.push(sql`${alerts.status} = ${filters.status}`);
    }
    if (filters?.severity) {
        conditions.push(sql`${alerts.severity} = ${filters.severity}`);
    }

    let query = db.select().from(alerts);

    if (conditions.length > 0) {
        return query
            .where(and(...conditions))
            .orderBy(desc(alerts.createdAt))
            .limit(filters?.limit || 100);
    }

    return query.orderBy(desc(alerts.createdAt)).limit(filters?.limit || 100);
}

export async function findAlertById(id: number) {
    const result = await db
        .select()
        .from(alerts)
        .where(eq(alerts.id, id))
        .limit(1);
    return result[0] || null;
}

export async function getCriticalAlerts() {
    return db
        .select()
        .from(alerts)
        .where(and(
            sql`${alerts.severity} = 'critical'`,
            sql`${alerts.status} = 'active'`
        ))
        .orderBy(desc(alerts.createdAt))
        .limit(10);
}

export async function createAlert(data: NewAlert): Promise<Alert> {
    const result = await db.insert(alerts).values(data);
    return findAlertById(result[0].insertId) as Promise<Alert>;
}

export async function acknowledgeAlert(id: number, userId: number) {
    await db.update(alerts).set({
        status: 'acknowledged',
        acknowledgedBy: userId,
        acknowledgedAt: sql`NOW()`,
    }).where(eq(alerts.id, id));
    return findAlertById(id);
}

export async function resolveAlert(id: number) {
    await db.update(alerts).set({
        status: 'resolved',
        resolvedAt: sql`NOW()`,
    }).where(eq(alerts.id, id));
    return findAlertById(id);
}

// ============================================================================
// Activity Logs
// ============================================================================

export async function findActivityLogs(filters?: {
    projectId?: number;
    agentId?: number;
    category?: string;
    level?: string;
    limit?: number;
    offset?: number;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(activityLogs.projectId, filters.projectId));
    }
    if (filters?.agentId) {
        conditions.push(eq(activityLogs.agentId, filters.agentId));
    }
    if (filters?.category) {
        conditions.push(sql`${activityLogs.category} = ${filters.category}`);
    }
    if (filters?.level) {
        conditions.push(sql`${activityLogs.level} = ${filters.level}`);
    }

    let query = db.select().from(activityLogs);

    if (conditions.length > 0) {
        return query
            .where(and(...conditions))
            .orderBy(desc(activityLogs.createdAt))
            .limit(filters?.limit || 100)
            .offset(filters?.offset || 0);
    }

    return query
        .orderBy(desc(activityLogs.createdAt))
        .limit(filters?.limit || 100);
}

export async function createActivityLog(data: NewActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values(data);
    const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.id, result[0].insertId))
        .limit(1);
    return logs[0];
}

export async function getRecentActivity(limit = 20) {
    return db.execute(sql`
        SELECT
            al.*,
            p.name as project_name,
            a.name as agent_name,
            u.name as user_name
        FROM activity_logs al
        LEFT JOIN projects p ON al.project_id = p.id
        LEFT JOIN ai_agents a ON al.agent_id = a.id
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT ${limit}
    `);
}
