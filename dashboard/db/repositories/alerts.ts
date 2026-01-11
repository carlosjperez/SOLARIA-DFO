/**
 * SOLARIA DFO - Alerts & Logs Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 *
 * Updated: 2026-01-11 - Phase 2: BaseRepository pattern
 */

import { db } from '../index.js';
import { eq, desc, sql, and } from 'drizzle-orm';
import {
    alerts,
    activityLogs,
    type Alert,
    type NewAlert,
    type ActivityLog,
    type NewActivityLog,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Alerts Repository Class
// ============================================================================

class AlertsRepository extends BaseRepository<Alert, NewAlert, typeof alerts> {
    constructor() {
        super(alerts, 'Alert');
    }

    /**
     * Find all alerts with optional filters
     * Custom implementation with filtering
     */
    async findAllAlerts(filters?: {
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

    /**
     * Get critical active alerts
     * Returns top 10 critical alerts that are still active
     */
    async getCriticalAlerts() {
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

    /**
     * Create alert and return the created entity
     */
    async createAlert(data: NewAlert): Promise<Alert> {
        const result = await db.insert(alerts).values(data);
        return this.findById(result[0].insertId) as Promise<Alert>;
    }

    /**
     * Acknowledge an alert
     * Sets status to 'acknowledged' and records who acknowledged it
     */
    async acknowledgeAlert(id: number, userId: number) {
        await db.update(alerts).set({
            status: 'acknowledged',
            acknowledgedBy: userId,
            acknowledgedAt: sql`NOW()`,
        }).where(eq(alerts.id, id));
        return this.findById(id);
    }

    /**
     * Resolve an alert
     * Sets status to 'resolved' and records the resolved timestamp
     */
    async resolveAlert(id: number) {
        await db.update(alerts).set({
            status: 'resolved',
            resolvedAt: sql`NOW()`,
        }).where(eq(alerts.id, id));
        return this.findById(id);
    }
}

// ============================================================================
// Activity Logs Repository Class
// ============================================================================

class ActivityLogsRepository extends BaseRepository<ActivityLog, NewActivityLog, typeof activityLogs> {
    constructor() {
        super(activityLogs, 'ActivityLog');
    }

    /**
     * Find activity logs with optional filters
     * Supports filtering by project, agent, category, level
     */
    async findActivityLogs(filters?: {
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

    /**
     * Create activity log and return the created entity
     */
    async createActivityLog(data: NewActivityLog): Promise<ActivityLog> {
        const result = await db.insert(activityLogs).values(data);
        const logs = await db
            .select()
            .from(activityLogs)
            .where(eq(activityLogs.id, result[0].insertId))
            .limit(1);
        return logs[0];
    }

    /**
     * Get recent activity with joined data
     * Returns activity logs with project, agent, and user names
     */
    async getRecentActivity(limit = 20) {
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
}

// ============================================================================
// Singleton Instances
// ============================================================================

const alertsRepo = new AlertsRepository();
const activityLogsRepo = new ActivityLogsRepository();

// ============================================================================
// Exported Functions (Backward Compatibility) - Alerts
// ============================================================================

/**
 * Find all alerts with optional filters
 * @deprecated Use alertsRepo.findAllAlerts() directly
 */
export async function findAllAlerts(filters?: {
    projectId?: number;
    status?: string;
    severity?: string;
    limit?: number;
}) {
    return alertsRepo.findAllAlerts(filters);
}

/**
 * Find alert by ID
 * @deprecated Use alertsRepo.findById() directly
 */
export async function findAlertById(id: number) {
    return alertsRepo.findById(id);
}

/**
 * Get critical active alerts
 * @deprecated Use alertsRepo.getCriticalAlerts() directly
 */
export async function getCriticalAlerts() {
    return alertsRepo.getCriticalAlerts();
}

/**
 * Create new alert
 * @deprecated Use alertsRepo.createAlert() directly
 */
export async function createAlert(data: NewAlert): Promise<Alert> {
    return alertsRepo.createAlert(data);
}

/**
 * Acknowledge an alert
 * @deprecated Use alertsRepo.acknowledgeAlert() directly
 */
export async function acknowledgeAlert(id: number, userId: number) {
    return alertsRepo.acknowledgeAlert(id, userId);
}

/**
 * Resolve an alert
 * @deprecated Use alertsRepo.resolveAlert() directly
 */
export async function resolveAlert(id: number) {
    return alertsRepo.resolveAlert(id);
}

// ============================================================================
// Exported Functions (Backward Compatibility) - Activity Logs
// ============================================================================

/**
 * Find activity logs with optional filters
 * @deprecated Use activityLogsRepo.findActivityLogs() directly
 */
export async function findActivityLogs(filters?: {
    projectId?: number;
    agentId?: number;
    category?: string;
    level?: string;
    limit?: number;
    offset?: number;
}) {
    return activityLogsRepo.findActivityLogs(filters);
}

/**
 * Create activity log
 * @deprecated Use activityLogsRepo.createActivityLog() directly
 */
export async function createActivityLog(data: NewActivityLog): Promise<ActivityLog> {
    return activityLogsRepo.createActivityLog(data);
}

/**
 * Get recent activity with joined data
 * @deprecated Use activityLogsRepo.getRecentActivity() directly
 */
export async function getRecentActivity(limit = 20) {
    return activityLogsRepo.getRecentActivity(limit);
}

// Export repository instances for direct usage
export { alertsRepo, activityLogsRepo };
