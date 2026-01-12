/**
 * SOLARIA DFO - Activity Logs Repository (Drizzle ORM)
 * Centralized activity logging for system events
 *
 * Updated: 2026-01-12 - Phase 2.4: BaseRepository pattern migration
 *
 * Note: Complex queries with JOINs use db.execute(sql`...`) for efficiency.
 * Simple CRUD operations use Drizzle query builder.
 */

import { db } from '../index.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import {
    activityLogs,
    type ActivityLog,
    type NewActivityLog,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Activity Logs Repository Class
// ============================================================================

class ActivityLogsRepository extends BaseRepository<ActivityLog, NewActivityLog, typeof activityLogs> {
    constructor() {
        super(activityLogs, 'ActivityLog');
    }

    /**
     * Create activity log entry
     * Override to handle metadata serialization
     */
    async createLog(data: {
        action: string;
        message?: string;
        category?: string;
        level?: string;
        projectId?: number | null;
        agentId?: number | null;
        taskId?: number | null;
        userId?: number | null;
        metadata?: Record<string, unknown>;
    }): Promise<ActivityLog> {
        const insertResult = await db.insert(activityLogs).values({
            action: data.action,
            details: data.message || data.action,
            category: (data.category || 'system') as any,
            level: (data.level || 'info') as any,
            projectId: data.projectId || null,
            agentId: data.agentId || null,
            taskId: data.taskId || null,
            userId: data.userId || null,
        });

        return this.findById(insertResult[0].insertId) as Promise<ActivityLog>;
    }

    /**
     * Find activity logs with filters and pagination
     * Uses dynamic SQL template literal construction
     */
    async findWithFilters(filters: {
        projectId?: number;
        agentId?: number;
        category?: string;
        level?: string;
        fromDate?: string;
        toDate?: string;
        limit: number;
        offset: number;
    }) {
        // Build WHERE conditions dynamically
        const conditions: ReturnType<typeof sql>[] = [];

        if (filters.projectId) {
            conditions.push(sql`al.project_id = ${filters.projectId}`);
        }
        if (filters.agentId) {
            conditions.push(sql`al.agent_id = ${filters.agentId}`);
        }
        if (filters.category) {
            conditions.push(sql`al.category = ${filters.category}`);
        }
        if (filters.level) {
            conditions.push(sql`al.level = ${filters.level}`);
        }
        if (filters.fromDate) {
            conditions.push(sql`al.created_at >= ${filters.fromDate}`);
        }
        if (filters.toDate) {
            conditions.push(sql`al.created_at <= ${filters.toDate}`);
        }

        // Build the WHERE clause
        const whereClause = conditions.length > 0
            ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
            : sql``;

        return db.execute(sql`
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
            ${whereClause}
            ORDER BY al.created_at DESC
            LIMIT ${filters.limit} OFFSET ${filters.offset}
        `);
    }

    /**
     * Count activity logs with filters
     */
    async countWithFilters(filters: {
        projectId?: number;
        agentId?: number;
        category?: string;
        level?: string;
    }): Promise<number> {
        const conditions = [];

        if (filters.projectId) {
            conditions.push(eq(activityLogs.projectId, filters.projectId));
        }
        if (filters.agentId) {
            conditions.push(eq(activityLogs.agentId, filters.agentId));
        }
        if (filters.category) {
            conditions.push(sql`${activityLogs.category} = ${filters.category}`);
        }
        if (filters.level) {
            conditions.push(sql`${activityLogs.level} = ${filters.level}`);
        }

        return this.count(conditions.length > 0 ? conditions : undefined);
    }

    /**
     * Find audit logs for security/compliance
     * Uses dynamic SQL template literal construction
     */
    async findAuditLogs(filters: {
        auditActions: string[];
        projectId?: number;
        userId?: number;
        action?: string;
        limit: number;
        offset: number;
    }) {
        // Build audit actions IN clause
        const auditActionsClause = filters.auditActions.length > 0
            ? sql`al.action IN (${sql.join(filters.auditActions.map(a => sql`${a}`), sql`, `)})`
            : sql`1=0`;

        // Build additional conditions
        const additionalConditions: ReturnType<typeof sql>[] = [];

        if (filters.projectId) {
            additionalConditions.push(sql`al.project_id = ${filters.projectId}`);
        }
        if (filters.userId) {
            additionalConditions.push(sql`al.user_id = ${filters.userId}`);
        }
        if (filters.action) {
            additionalConditions.push(sql`al.action = ${filters.action}`);
        }

        const additionalWhere = additionalConditions.length > 0
            ? sql`AND ${sql.join(additionalConditions, sql` AND `)}`
            : sql``;

        return db.execute(sql`
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
                u.username as user_name
            FROM activity_logs al
            LEFT JOIN projects p ON al.project_id = p.id
            LEFT JOIN users u ON al.user_id = u.id
            WHERE (al.category = 'security' OR ${auditActionsClause})
            ${additionalWhere}
            ORDER BY al.created_at DESC
            LIMIT ${filters.limit} OFFSET ${filters.offset}
        `);
    }

    /**
     * Get audit statistics
     */
    async getAuditStats(auditActions: string[]) {
        // Build audit actions IN clause
        const auditActionsClause = auditActions.length > 0
            ? sql`action IN (${sql.join(auditActions.map(a => sql`${a}`), sql`, `)})`
            : sql`1=0`;

        return db.execute(sql`
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
               OR ${auditActionsClause}
        `);
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const activityLogsRepo = new ActivityLogsRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Create activity log entry
 * @deprecated Use activityLogsRepo.createLog() directly
 */
export async function createActivityLog(data: {
    action: string;
    message?: string;
    category?: string;
    level?: string;
    projectId?: number | null;
    agentId?: number | null;
    metadata?: Record<string, unknown>;
}) {
    return activityLogsRepo.createLog(data);
}

/**
 * Find activity logs with filters
 * @deprecated Use activityLogsRepo.findWithFilters() directly
 */
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
    return activityLogsRepo.findWithFilters(filters);
}

/**
 * Count activity logs
 * @deprecated Use activityLogsRepo.countWithFilters() directly
 */
export async function countActivityLogs(filters: {
    projectId?: number;
    agentId?: number;
    category?: string;
    level?: string;
}) {
    return activityLogsRepo.countWithFilters(filters);
}

/**
 * Find audit logs
 * @deprecated Use activityLogsRepo.findAuditLogs() directly
 */
export async function findAuditLogs(filters: {
    auditActions: string[];
    projectId?: number;
    userId?: number;
    action?: string;
    limit: number;
    offset: number;
}) {
    return activityLogsRepo.findAuditLogs(filters);
}

/**
 * Get audit statistics
 * @deprecated Use activityLogsRepo.getAuditStats() directly
 */
export async function getAuditStats(auditActions: string[]) {
    return activityLogsRepo.getAuditStats(auditActions);
}

// Export repository instance for direct usage
export { activityLogsRepo };
