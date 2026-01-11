/**
 * SOLARIA DFO - Projects Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db, pool } from '../index.js';
import { eq, desc, sql, and, like, or } from 'drizzle-orm';
import {
    projects,
    projectClients,
    projectDocuments,
    projectRequests,
    projectMetrics,
    type Project,
    type NewProject,
    type ProjectClient,
    type ProjectDocument,
    type ProjectRequest,
} from '../schema/index.js';

// ============================================================================
// Projects CRUD
// ============================================================================

export async function findAllProjects(limit = 200) {
    return db
        .select()
        .from(projects)
        .orderBy(desc(projects.updatedAt))
        .limit(limit);
}

export async function findProjectById(id: number) {
    const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);
    return result[0] || null;
}

export async function findProjectByCode(code: string) {
    const result = await db
        .select()
        .from(projects)
        .where(eq(projects.code, code))
        .limit(1);
    return result[0] || null;
}

export async function findProjectsWithStats() {
    return db.execute(sql`
        SELECT
            p.*,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id), 0) as total_tasks,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed'), 0) as completed_tasks,
            COALESCE((SELECT COUNT(DISTINCT a.id) FROM ai_agents a JOIN tasks t ON t.assigned_agent_id = a.id WHERE t.project_id = p.id), 0) as agents_assigned,
            COALESCE((SELECT COUNT(*) FROM alerts al WHERE al.project_id = p.id AND al.status = 'active'), 0) as active_alerts
        FROM projects p
        ORDER BY p.updated_at DESC
        LIMIT 200
    `);
}

export async function findAllProjectsWithStats(filters?: {
    status?: string;
    priority?: string;
    archived?: boolean;
    limit?: number;
}) {
    let query = `
        SELECT
            p.*,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id), 0) as task_count,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed'), 0) as completed_tasks
        FROM projects p
        WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
    }
    if (filters?.priority) {
        query += ' AND p.priority = ?';
        params.push(filters.priority);
    }
    if (filters?.archived !== undefined) {
        query += ' AND p.archived = ?';
        params.push(filters.archived);
    }

    query += ' ORDER BY p.updated_at DESC';

    if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    }

    return pool.execute(query, params);
}

export async function createProject(data: NewProject): Promise<Project> {
    const result = await db.insert(projects).values(data);
    const insertId = result[0].insertId;
    return findProjectById(insertId) as Promise<Project>;
}

export async function updateProject(id: number, data: Partial<NewProject>) {
    await db.update(projects).set(data).where(eq(projects.id, id));
    return findProjectById(id);
}

export async function deleteProject(id: number) {
    return db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectMetrics() {
    return db.execute(sql`
        SELECT DATE(updated_at) as date,
               AVG(completion_percentage) as avg_completion,
               COUNT(*) as project_count
        FROM projects
        WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(updated_at)
        ORDER BY date DESC
    `);
}

// ============================================================================
// Project Documents
// ============================================================================

export async function getAllDocuments(limit: number = 50) {
    return db.execute(sql`
        SELECT
            pd.id, pd.name, pd.type, pd.description, pd.url,
            pd.file_size, pd.uploaded_by,
            pd.created_at, pd.updated_at,
            p.name as project_name, p.code as project_code
        FROM project_documents pd
        LEFT JOIN projects p ON pd.project_id = p.id
        ORDER BY pd.updated_at DESC
        LIMIT ${limit}
    `);
}

export async function getProjectReports() {
    return db.execute(sql`
        SELECT
            p.name as project_name,
            COUNT(t.id) as total_tasks,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
            AVG(pm.completion_percentage) as avg_completion,
            AVG(pm.agent_efficiency) as avg_efficiency
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        LEFT JOIN project_metrics pm ON p.id = pm.project_id
        WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY p.id, p.name
        ORDER BY avg_completion DESC
    `);
}

export async function getFinancialReports() {
    return db.execute(sql`
        SELECT
            p.name as project_name,
            p.budget,
            COALESCE(pm.budget_used, 0) as actual_cost,
            p.budget - COALESCE(pm.budget_used, 0) as remaining_budget,
            CASE
                WHEN p.budget > 0 THEN
                    (COALESCE(pm.budget_used, 0) / p.budget) * 100
                ELSE 0
            END as budget_usage_percentage
        FROM projects p
        LEFT JOIN project_metrics pm ON p.id = pm.project_id AND pm.metric_date = CURDATE()
        GROUP BY p.id, p.name, p.budget, pm.budget_used
        ORDER BY budget_usage_percentage DESC
    `);
}

// ============================================================================
// Project Clients
// ============================================================================

export async function findProjectClient(projectId: number) {
    const result = await db
        .select()
        .from(projectClients)
        .where(eq(projectClients.projectId, projectId))
        .limit(1);
    return result[0] || null;
}

export async function upsertProjectClient(
    projectId: number,
    data: Omit<typeof projectClients.$inferInsert, 'id' | 'projectId'>
) {
    const existing = await findProjectClient(projectId);
    if (existing) {
        await db
            .update(projectClients)
            .set(data)
            .where(eq(projectClients.projectId, projectId));
    } else {
        await db.insert(projectClients).values({ ...data, projectId });
    }
    return findProjectClient(projectId);
}

// ============================================================================
// Project Documents
// ============================================================================

export async function findProjectDocuments(projectId: number) {
    return db
        .select()
        .from(projectDocuments)
        .where(eq(projectDocuments.projectId, projectId))
        .orderBy(desc(projectDocuments.createdAt));
}

export async function createProjectDocument(
    data: typeof projectDocuments.$inferInsert
): Promise<ProjectDocument> {
    const result = await db.insert(projectDocuments).values(data);
    const insertId = result[0].insertId;
    const docs = await db
        .select()
        .from(projectDocuments)
        .where(eq(projectDocuments.id, insertId))
        .limit(1);
    return docs[0];
}

export async function deleteProjectDocument(id: number, projectId: number) {
    return db
        .delete(projectDocuments)
        .where(
            and(
                eq(projectDocuments.id, id),
                eq(projectDocuments.projectId, projectId)
            )
        );
}

// ============================================================================
// Project Requests
// ============================================================================

export async function findProjectRequests(projectId: number) {
    return db
        .select()
        .from(projectRequests)
        .where(eq(projectRequests.projectId, projectId))
        .orderBy(desc(projectRequests.createdAt));
}

export async function createProjectRequest(
    data: typeof projectRequests.$inferInsert
): Promise<ProjectRequest> {
    const result = await db.insert(projectRequests).values(data);
    const insertId = result[0].insertId;
    const requests = await db
        .select()
        .from(projectRequests)
        .where(eq(projectRequests.id, insertId))
        .limit(1);
    return requests[0];
}

export async function updateProjectRequest(
    id: number,
    data: Partial<typeof projectRequests.$inferInsert>
) {
    await db.update(projectRequests).set(data).where(eq(projectRequests.id, id));
    const requests = await db
        .select()
        .from(projectRequests)
        .where(eq(projectRequests.id, id))
        .limit(1);
    return requests[0] || null;
}

export async function deleteProjectRequest(id: number, projectId: number) {
    return db
        .delete(projectRequests)
        .where(
            and(
                eq(projectRequests.id, id),
                eq(projectRequests.projectId, projectId)
            )
        );
}

// ============================================================================
// Project Metrics
// ============================================================================

export async function findProjectMetrics(projectId: number, days = 30) {
    return db
        .select()
        .from(projectMetrics)
        .where(eq(projectMetrics.projectId, projectId))
        .orderBy(desc(projectMetrics.metricDate))
        .limit(days);
}

export async function getLatestMetrics() {
    return db.execute(sql`
        SELECT pm.*
        FROM project_metrics pm
        INNER JOIN (
            SELECT project_id, MAX(metric_date) as max_date
            FROM project_metrics
            GROUP BY project_id
        ) latest ON pm.project_id = latest.project_id AND pm.metric_date = latest.max_date
    `);
}

export async function upsertProjectMetrics(
    projectId: number,
    data: {
        completionPercentage?: number;
        agentEfficiency?: number;
        codeQualityScore?: number;
        testCoverage?: number;
        tasksCompleted?: number;
        tasksPending?: number;
        tasksBlocked?: number;
        budgetUsed?: number;
    }
) {
    return pool.execute(`
        INSERT INTO project_metrics (
            project_id, metric_date, completion_percentage, agent_efficiency,
            code_quality_score, test_coverage, tasks_completed, tasks_pending,
            tasks_blocked, budget_used
        ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            completion_percentage = VALUES(completion_percentage),
            agent_efficiency = VALUES(agent_efficiency),
            code_quality_score = VALUES(code_quality_score),
            test_coverage = VALUES(test_coverage),
            tasks_completed = VALUES(tasks_completed),
            tasks_pending = VALUES(tasks_pending),
            tasks_blocked = VALUES(tasks_blocked),
            budget_used = VALUES(budget_used)
    `, [
        projectId,
        data.completionPercentage || 0,
        data.agentEfficiency || 0,
        data.codeQualityScore || 0,
        data.testCoverage || 0,
        data.tasksCompleted || 0,
        data.tasksPending || 0,
        data.tasksBlocked || 0,
        data.budgetUsed || 0
    ]);
}

// ============================================================================
// Client-Specific Queries
// ============================================================================

export async function findProjectsByClient(clientName: string) {
    return pool.execute(`
        SELECT
            id, name, code, status, description,
            start_date, deadline, completion_percentage,
            budget, actual_cost
        FROM projects
        WHERE client = ?
        ORDER BY created_at DESC
    `, [clientName]);
}

export async function getClientFinancialSummary(clientName: string) {
    return pool.execute(`
        SELECT
            SUM(budget) as total_budget,
            SUM(actual_cost) as total_spent,
            COUNT(*) as total_projects,
            AVG(completion_percentage) as avg_progress
        FROM projects
        WHERE client = ?
    `, [clientName]);
}

export async function clearBusinessId(businessId: number) {
    return pool.execute('UPDATE projects SET business_id = NULL WHERE business_id = ?', [businessId]);
}
