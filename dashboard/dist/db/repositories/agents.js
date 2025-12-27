"use strict";
/**
 * SOLARIA DFO - Agents Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllAgents = findAllAgents;
exports.findAgentById = findAgentById;
exports.findAgentsWithStats = findAgentsWithStats;
exports.updateAgentStatus = updateAgentStatus;
exports.getAgentStates = getAgentStates;
exports.getActiveAgents = getActiveAgents;
exports.getBusyAgents = getBusyAgents;
exports.recordAgentMetric = recordAgentMetric;
exports.getAgentMetrics = getAgentMetrics;
exports.getAgentTasks = getAgentTasks;
const index_js_1 = require("../index.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_2 = require("../schema/index.js");
// ============================================================================
// Agents CRUD
// ============================================================================
async function findAllAgents() {
    return index_js_1.db.select().from(index_js_2.aiAgents).orderBy((0, drizzle_orm_1.desc)(index_js_2.aiAgents.lastActivity));
}
async function findAgentById(id) {
    const result = await index_js_1.db
        .select()
        .from(index_js_2.aiAgents)
        .where((0, drizzle_orm_1.eq)(index_js_2.aiAgents.id, id))
        .limit(1);
    return result[0] || null;
}
async function findAgentsWithStats() {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT
            a.*,
            s.status as current_status,
            s.current_task,
            s.last_heartbeat,
            s.performance_metrics,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.assigned_agent_id = a.id AND t.status = 'completed'), 0) as tasks_completed,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.assigned_agent_id = a.id AND t.status IN ('in_progress', 'review')), 0) as tasks_in_progress,
            COALESCE((SELECT AVG(actual_hours) FROM tasks t WHERE t.assigned_agent_id = a.id AND t.status = 'completed'), 0) as avg_task_time
        FROM ai_agents a
        LEFT JOIN agent_states s ON a.id = s.agent_id
        ORDER BY a.last_activity DESC
    `);
}
async function updateAgentStatus(id, status, currentTask) {
    // Update agent status
    await index_js_1.db.update(index_js_2.aiAgents).set({
        status,
        lastActivity: (0, drizzle_orm_1.sql) `NOW()`,
    }).where((0, drizzle_orm_1.eq)(index_js_2.aiAgents.id, id));
    // Update or insert agent state
    const existingState = await index_js_1.db
        .select()
        .from(index_js_2.agentStates)
        .where((0, drizzle_orm_1.eq)(index_js_2.agentStates.agentId, id))
        .limit(1);
    if (existingState.length > 0) {
        await index_js_1.db.update(index_js_2.agentStates).set({
            status,
            currentTask: currentTask || null,
            lastHeartbeat: (0, drizzle_orm_1.sql) `NOW()`,
        }).where((0, drizzle_orm_1.eq)(index_js_2.agentStates.agentId, id));
    }
    else {
        await index_js_1.db.insert(index_js_2.agentStates).values({
            agentId: id,
            status,
            currentTask: currentTask || null,
        });
    }
    return findAgentById(id);
}
// ============================================================================
// Agent States
// ============================================================================
async function getAgentStates() {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT
            s.*,
            a.name as agent_name,
            a.role as agent_role
        FROM agent_states s
        INNER JOIN ai_agents a ON s.agent_id = a.id
        ORDER BY s.last_heartbeat DESC
    `);
}
async function getActiveAgents() {
    return index_js_1.db
        .select()
        .from(index_js_2.aiAgents)
        .where((0, drizzle_orm_1.eq)(index_js_2.aiAgents.status, 'active'));
}
async function getBusyAgents() {
    return index_js_1.db
        .select()
        .from(index_js_2.aiAgents)
        .where((0, drizzle_orm_1.eq)(index_js_2.aiAgents.status, 'busy'));
}
// ============================================================================
// Agent Metrics
// ============================================================================
async function recordAgentMetric(agentId, metricType, metricValue) {
    await index_js_1.db.insert(index_js_2.agentMetrics).values({
        agentId,
        metricType,
        metricValue: metricValue.toString(),
    });
}
async function getAgentMetrics(agentId, metricType, limit = 100) {
    const conditions = [(0, drizzle_orm_1.eq)(index_js_2.agentMetrics.agentId, agentId)];
    if (metricType) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.agentMetrics.metricType, metricType));
    }
    return index_js_1.db
        .select()
        .from(index_js_2.agentMetrics)
        .where((0, drizzle_orm_1.and)(...conditions))
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.agentMetrics.createdAt))
        .limit(limit);
}
// ============================================================================
// Agent Tasks
// ============================================================================
async function getAgentTasks(agentId, status) {
    const statusFilter = status ? (0, drizzle_orm_1.sql) `AND t.status = ${status}` : (0, drizzle_orm_1.sql) ``;
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT
            t.*,
            p.name as project_name,
            p.code as project_code,
            CONCAT(p.code, '-', LPAD(t.task_number, 3, '0')) as task_code
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_agent_id = ${agentId} ${statusFilter}
        ORDER BY t.updated_at DESC
        LIMIT 50
    `);
}
//# sourceMappingURL=agents.js.map