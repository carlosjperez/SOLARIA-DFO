"use strict";
/**
 * SOLARIA DFO - Projects Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllProjects = findAllProjects;
exports.findProjectById = findProjectById;
exports.findProjectByCode = findProjectByCode;
exports.findProjectsWithStats = findProjectsWithStats;
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.findProjectClient = findProjectClient;
exports.upsertProjectClient = upsertProjectClient;
exports.findProjectDocuments = findProjectDocuments;
exports.createProjectDocument = createProjectDocument;
exports.findProjectRequests = findProjectRequests;
exports.createProjectRequest = createProjectRequest;
exports.updateProjectRequest = updateProjectRequest;
exports.findProjectMetrics = findProjectMetrics;
exports.getLatestMetrics = getLatestMetrics;
const index_js_1 = require("../index.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_2 = require("../schema/index.js");
// ============================================================================
// Projects CRUD
// ============================================================================
async function findAllProjects(limit = 200) {
    return index_js_1.db
        .select()
        .from(index_js_2.projects)
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.projects.updatedAt))
        .limit(limit);
}
async function findProjectById(id) {
    const result = await index_js_1.db
        .select()
        .from(index_js_2.projects)
        .where((0, drizzle_orm_1.eq)(index_js_2.projects.id, id))
        .limit(1);
    return result[0] || null;
}
async function findProjectByCode(code) {
    const result = await index_js_1.db
        .select()
        .from(index_js_2.projects)
        .where((0, drizzle_orm_1.eq)(index_js_2.projects.code, code))
        .limit(1);
    return result[0] || null;
}
async function findProjectsWithStats() {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
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
async function createProject(data) {
    const result = await index_js_1.db.insert(index_js_2.projects).values(data);
    const insertId = result[0].insertId;
    return findProjectById(insertId);
}
async function updateProject(id, data) {
    await index_js_1.db.update(index_js_2.projects).set(data).where((0, drizzle_orm_1.eq)(index_js_2.projects.id, id));
    return findProjectById(id);
}
async function deleteProject(id) {
    return index_js_1.db.delete(index_js_2.projects).where((0, drizzle_orm_1.eq)(index_js_2.projects.id, id));
}
// ============================================================================
// Project Clients
// ============================================================================
async function findProjectClient(projectId) {
    const result = await index_js_1.db
        .select()
        .from(index_js_2.projectClients)
        .where((0, drizzle_orm_1.eq)(index_js_2.projectClients.projectId, projectId))
        .limit(1);
    return result[0] || null;
}
async function upsertProjectClient(projectId, data) {
    const existing = await findProjectClient(projectId);
    if (existing) {
        await index_js_1.db
            .update(index_js_2.projectClients)
            .set(data)
            .where((0, drizzle_orm_1.eq)(index_js_2.projectClients.projectId, projectId));
    }
    else {
        await index_js_1.db.insert(index_js_2.projectClients).values({ ...data, projectId });
    }
    return findProjectClient(projectId);
}
// ============================================================================
// Project Documents
// ============================================================================
async function findProjectDocuments(projectId) {
    return index_js_1.db
        .select()
        .from(index_js_2.projectDocuments)
        .where((0, drizzle_orm_1.eq)(index_js_2.projectDocuments.projectId, projectId))
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.projectDocuments.createdAt));
}
async function createProjectDocument(data) {
    const result = await index_js_1.db.insert(index_js_2.projectDocuments).values(data);
    const insertId = result[0].insertId;
    const docs = await index_js_1.db
        .select()
        .from(index_js_2.projectDocuments)
        .where((0, drizzle_orm_1.eq)(index_js_2.projectDocuments.id, insertId))
        .limit(1);
    return docs[0];
}
// ============================================================================
// Project Requests
// ============================================================================
async function findProjectRequests(projectId) {
    return index_js_1.db
        .select()
        .from(index_js_2.projectRequests)
        .where((0, drizzle_orm_1.eq)(index_js_2.projectRequests.projectId, projectId))
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.projectRequests.createdAt));
}
async function createProjectRequest(data) {
    const result = await index_js_1.db.insert(index_js_2.projectRequests).values(data);
    const insertId = result[0].insertId;
    const requests = await index_js_1.db
        .select()
        .from(index_js_2.projectRequests)
        .where((0, drizzle_orm_1.eq)(index_js_2.projectRequests.id, insertId))
        .limit(1);
    return requests[0];
}
async function updateProjectRequest(id, data) {
    await index_js_1.db.update(index_js_2.projectRequests).set(data).where((0, drizzle_orm_1.eq)(index_js_2.projectRequests.id, id));
    const requests = await index_js_1.db
        .select()
        .from(index_js_2.projectRequests)
        .where((0, drizzle_orm_1.eq)(index_js_2.projectRequests.id, id))
        .limit(1);
    return requests[0] || null;
}
// ============================================================================
// Project Metrics
// ============================================================================
async function findProjectMetrics(projectId, days = 30) {
    return index_js_1.db
        .select()
        .from(index_js_2.projectMetrics)
        .where((0, drizzle_orm_1.eq)(index_js_2.projectMetrics.projectId, projectId))
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.projectMetrics.metricDate))
        .limit(days);
}
async function getLatestMetrics() {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT pm.*
        FROM project_metrics pm
        INNER JOIN (
            SELECT project_id, MAX(metric_date) as max_date
            FROM project_metrics
            GROUP BY project_id
        ) latest ON pm.project_id = latest.project_id AND pm.metric_date = latest.max_date
    `);
}
//# sourceMappingURL=projects.js.map