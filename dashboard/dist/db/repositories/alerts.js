"use strict";
/**
 * SOLARIA DFO - Alerts & Logs Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllAlerts = findAllAlerts;
exports.findAlertById = findAlertById;
exports.getCriticalAlerts = getCriticalAlerts;
exports.createAlert = createAlert;
exports.acknowledgeAlert = acknowledgeAlert;
exports.resolveAlert = resolveAlert;
exports.findActivityLogs = findActivityLogs;
exports.createActivityLog = createActivityLog;
exports.getRecentActivity = getRecentActivity;
const index_js_1 = require("../index.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_2 = require("../schema/index.js");
// ============================================================================
// Alerts CRUD
// ============================================================================
async function findAllAlerts(filters) {
    const conditions = [];
    if (filters?.projectId) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.alerts.projectId, filters.projectId));
    }
    if (filters?.status) {
        conditions.push((0, drizzle_orm_1.sql) `${index_js_2.alerts.status} = ${filters.status}`);
    }
    if (filters?.severity) {
        conditions.push((0, drizzle_orm_1.sql) `${index_js_2.alerts.severity} = ${filters.severity}`);
    }
    let query = index_js_1.db.select().from(index_js_2.alerts);
    if (conditions.length > 0) {
        return query
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.alerts.createdAt))
            .limit(filters?.limit || 100);
    }
    return query.orderBy((0, drizzle_orm_1.desc)(index_js_2.alerts.createdAt)).limit(filters?.limit || 100);
}
async function findAlertById(id) {
    const result = await index_js_1.db
        .select()
        .from(index_js_2.alerts)
        .where((0, drizzle_orm_1.eq)(index_js_2.alerts.id, id))
        .limit(1);
    return result[0] || null;
}
async function getCriticalAlerts() {
    return index_js_1.db
        .select()
        .from(index_js_2.alerts)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${index_js_2.alerts.severity} = 'critical'`, (0, drizzle_orm_1.sql) `${index_js_2.alerts.status} = 'active'`))
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.alerts.createdAt))
        .limit(10);
}
async function createAlert(data) {
    const result = await index_js_1.db.insert(index_js_2.alerts).values(data);
    return findAlertById(result[0].insertId);
}
async function acknowledgeAlert(id, userId) {
    await index_js_1.db.update(index_js_2.alerts).set({
        status: 'acknowledged',
        acknowledgedBy: userId,
        acknowledgedAt: (0, drizzle_orm_1.sql) `NOW()`,
    }).where((0, drizzle_orm_1.eq)(index_js_2.alerts.id, id));
    return findAlertById(id);
}
async function resolveAlert(id) {
    await index_js_1.db.update(index_js_2.alerts).set({
        status: 'resolved',
        resolvedAt: (0, drizzle_orm_1.sql) `NOW()`,
    }).where((0, drizzle_orm_1.eq)(index_js_2.alerts.id, id));
    return findAlertById(id);
}
// ============================================================================
// Activity Logs
// ============================================================================
async function findActivityLogs(filters) {
    const conditions = [];
    if (filters?.projectId) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.activityLogs.projectId, filters.projectId));
    }
    if (filters?.agentId) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.activityLogs.agentId, filters.agentId));
    }
    if (filters?.category) {
        conditions.push((0, drizzle_orm_1.sql) `${index_js_2.activityLogs.category} = ${filters.category}`);
    }
    if (filters?.level) {
        conditions.push((0, drizzle_orm_1.sql) `${index_js_2.activityLogs.level} = ${filters.level}`);
    }
    let query = index_js_1.db.select().from(index_js_2.activityLogs);
    if (conditions.length > 0) {
        return query
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.activityLogs.createdAt))
            .limit(filters?.limit || 100)
            .offset(filters?.offset || 0);
    }
    return query
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.activityLogs.createdAt))
        .limit(filters?.limit || 100);
}
async function createActivityLog(data) {
    const result = await index_js_1.db.insert(index_js_2.activityLogs).values(data);
    const logs = await index_js_1.db
        .select()
        .from(index_js_2.activityLogs)
        .where((0, drizzle_orm_1.eq)(index_js_2.activityLogs.id, result[0].insertId))
        .limit(1);
    return logs[0];
}
async function getRecentActivity(limit = 20) {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
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
//# sourceMappingURL=alerts.js.map