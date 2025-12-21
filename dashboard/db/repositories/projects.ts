/**
 * SOLARIA DFO - Projects Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
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
