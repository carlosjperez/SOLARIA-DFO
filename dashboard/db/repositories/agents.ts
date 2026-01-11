/**
 * SOLARIA DFO - Agents Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq, desc, sql, and } from 'drizzle-orm';
import {
    aiAgents,
    agentStates,
    agentMetrics,
    type AiAgent,
    type NewAiAgent,
    type AgentState,
} from '../schema/index.js';

// ============================================================================
// Agents CRUD
// ============================================================================

export async function findAllAgents() {
    return db.select().from(aiAgents).orderBy(desc(aiAgents.lastActivity));
}

export async function findAgentById(id: number) {
    const result = await db
        .select()
        .from(aiAgents)
        .where(eq(aiAgents.id, id))
        .limit(1);
    return result[0] || null;
}

export async function findAgentByName(name: string, status?: string) {
    const conditions = [eq(aiAgents.name, name)];

    if (status) {
        conditions.push(sql`${aiAgents.status} = ${status}`);
    }

    const result = await db
        .select()
        .from(aiAgents)
        .where(and(...conditions))
        .limit(1);
    return result[0] || null;
}

export async function findAgentsWithStats() {
    return db.execute(sql`
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

export async function updateAgentStatus(
    id: number,
    status: 'active' | 'busy' | 'inactive' | 'error' | 'maintenance',
    currentTask?: string
) {
    // Update agent status
    await db.update(aiAgents).set({
        status,
        lastActivity: sql`NOW()`,
    }).where(eq(aiAgents.id, id));

    // Update or insert agent state
    const existingState = await db
        .select()
        .from(agentStates)
        .where(eq(agentStates.agentId, id))
        .limit(1);

    if (existingState.length > 0) {
        await db.update(agentStates).set({
            status,
            currentTask: currentTask || null,
            lastHeartbeat: sql`NOW()`,
        }).where(eq(agentStates.agentId, id));
    } else {
        await db.insert(agentStates).values({
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

export async function getAgentStates() {
    return db.execute(sql`
        SELECT
            s.*,
            a.name as agent_name,
            a.role as agent_role
        FROM agent_states s
        INNER JOIN ai_agents a ON s.agent_id = a.id
        ORDER BY s.last_heartbeat DESC
    `);
}

export async function getActiveAgents() {
    return db
        .select()
        .from(aiAgents)
        .where(eq(aiAgents.status, 'active'));
}

export async function getBusyAgents() {
    return db
        .select()
        .from(aiAgents)
        .where(eq(aiAgents.status, 'busy'));
}

// ============================================================================
// Agent Metrics
// ============================================================================

export async function recordAgentMetric(
    agentId: number,
    metricType: string,
    metricValue: number
) {
    await db.insert(agentMetrics).values({
        agentId,
        metricType,
        metricValue: metricValue.toString(),
    });
}

export async function getAgentMetrics(agentId: number, metricType?: string, limit = 100) {
    const conditions = [eq(agentMetrics.agentId, agentId)];

    if (metricType) {
        conditions.push(eq(agentMetrics.metricType, metricType));
    }

    return db
        .select()
        .from(agentMetrics)
        .where(and(...conditions))
        .orderBy(desc(agentMetrics.createdAt))
        .limit(limit);
}

export async function getAgentReports() {
    return db.execute(sql`
        SELECT
            aa.name as agent_name,
            aa.role,
            COUNT(t.id) as total_tasks,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
            AVG(am.metric_value) as avg_performance,
            as_.status as current_status
        FROM ai_agents aa
        LEFT JOIN tasks t ON aa.id = t.assigned_agent_id
        LEFT JOIN agent_metrics am ON aa.id = am.agent_id
        LEFT JOIN agent_states as_ ON aa.id = as_.agent_id
        GROUP BY aa.id, aa.name, aa.role, as_.status
        ORDER BY avg_performance DESC
    `);
}

// ============================================================================
// Agent Tasks
// ============================================================================

export async function getAgentTasks(agentId: number, status?: string) {
    const statusFilter = status ? sql`AND t.status = ${status}` : sql``;

    return db.execute(sql`
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

export async function getAgentPerformance(agentId: number, days = 7) {
    return db.execute(sql`
        SELECT
            DATE(completed_at) as date,
            COUNT(*) as tasks_completed,
            AVG(actual_hours) as avg_hours,
            AVG(progress) as avg_progress
        FROM tasks
        WHERE assigned_agent_id = ${agentId}
            AND status = 'completed'
            AND completed_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
        GROUP BY DATE(completed_at)
        ORDER BY date DESC
    `);
}

// ============================================================================
// Project Agents (for getProject endpoint)
// ============================================================================

export async function getProjectAgents(projectId: number) {
    return db.execute(sql`
        SELECT DISTINCT
            aa.*,
            COUNT(t.id) as tasks_assigned,
            COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed
        FROM ai_agents aa
        INNER JOIN tasks t ON aa.id = t.assigned_agent_id
        WHERE t.project_id = ${projectId}
        GROUP BY aa.id
    `);
}
