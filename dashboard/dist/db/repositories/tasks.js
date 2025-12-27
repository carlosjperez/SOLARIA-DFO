"use strict";
/**
 * SOLARIA DFO - Tasks Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllTasks = findAllTasks;
exports.findTaskById = findTaskById;
exports.findTaskWithDetails = findTaskWithDetails;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.completeTask = completeTask;
exports.deleteTask = deleteTask;
exports.findTaskItems = findTaskItems;
exports.createTaskItems = createTaskItems;
exports.completeTaskItem = completeTaskItem;
exports.updateTaskProgress = updateTaskProgress;
exports.updateTaskItem = updateTaskItem;
exports.deleteTaskItem = deleteTaskItem;
exports.findAllTags = findAllTags;
exports.findTaskTags = findTaskTags;
exports.addTagToTask = addTagToTask;
exports.removeTagFromTask = removeTagFromTask;
exports.getKanbanBoard = getKanbanBoard;
const index_js_1 = require("../index.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_2 = require("../schema/index.js");
// ============================================================================
// Tasks CRUD
// ============================================================================
async function findAllTasks(filters) {
    const conditions = [];
    if (filters?.projectId) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.tasks.projectId, filters.projectId));
    }
    if (filters?.status) {
        conditions.push((0, drizzle_orm_1.sql) `${index_js_2.tasks.status} = ${filters.status}`);
    }
    if (filters?.priority) {
        conditions.push((0, drizzle_orm_1.sql) `${index_js_2.tasks.priority} = ${filters.priority}`);
    }
    if (filters?.agentId) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.tasks.assignedAgentId, filters.agentId));
    }
    const query = index_js_1.db.select().from(index_js_2.tasks);
    if (conditions.length > 0) {
        return query
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.tasks.updatedAt))
            .limit(filters?.limit || 100);
    }
    return query.orderBy((0, drizzle_orm_1.desc)(index_js_2.tasks.updatedAt)).limit(filters?.limit || 100);
}
async function findTaskById(id) {
    const result = await index_js_1.db
        .select()
        .from(index_js_2.tasks)
        .where((0, drizzle_orm_1.eq)(index_js_2.tasks.id, id))
        .limit(1);
    return result[0] || null;
}
async function findTaskWithDetails(id) {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT
            t.*,
            p.name as project_name,
            p.code as project_code,
            CONCAT(p.code, '-', LPAD(t.task_number, 3, '0')) as task_code,
            a.name as agent_name,
            u.name as assigned_by_name,
            COALESCE((SELECT COUNT(*) FROM task_items ti WHERE ti.task_id = t.id), 0) as items_total,
            COALESCE((SELECT COUNT(*) FROM task_items ti WHERE ti.task_id = t.id AND ti.is_completed = 1), 0) as items_completed
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents a ON t.assigned_agent_id = a.id
        LEFT JOIN users u ON t.assigned_by = u.id
        WHERE t.id = ${id}
    `);
}
async function createTask(data) {
    // Get next task number for project
    let taskNumber = 1;
    if (data.projectId) {
        const result = await index_js_1.db.execute((0, drizzle_orm_1.sql) `
            SELECT COALESCE(MAX(task_number), 0) + 1 as next_number
            FROM tasks WHERE project_id = ${data.projectId}
        `);
        const rows = result[0];
        taskNumber = rows[0]?.next_number || 1;
    }
    const insertResult = await index_js_1.db.insert(index_js_2.tasks).values({
        ...data,
        taskNumber,
    });
    return findTaskById(insertResult[0].insertId);
}
async function updateTask(id, data) {
    await index_js_1.db.update(index_js_2.tasks).set(data).where((0, drizzle_orm_1.eq)(index_js_2.tasks.id, id));
    return findTaskById(id);
}
async function completeTask(id, notes) {
    await index_js_1.db.update(index_js_2.tasks).set({
        status: 'completed',
        progress: 100,
        completedAt: (0, drizzle_orm_1.sql) `NOW()`,
        notes: notes || undefined,
    }).where((0, drizzle_orm_1.eq)(index_js_2.tasks.id, id));
    return findTaskById(id);
}
async function deleteTask(id) {
    return index_js_1.db.delete(index_js_2.tasks).where((0, drizzle_orm_1.eq)(index_js_2.tasks.id, id));
}
// ============================================================================
// Task Items (Subtasks)
// ============================================================================
async function findTaskItems(taskId, includeCompleted = true) {
    const query = index_js_1.db.select().from(index_js_2.taskItems).where((0, drizzle_orm_1.eq)(index_js_2.taskItems.taskId, taskId));
    if (!includeCompleted) {
        return index_js_1.db
            .select()
            .from(index_js_2.taskItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.taskItems.taskId, taskId), (0, drizzle_orm_1.eq)(index_js_2.taskItems.isCompleted, false)))
            .orderBy((0, drizzle_orm_1.asc)(index_js_2.taskItems.sortOrder));
    }
    return query.orderBy((0, drizzle_orm_1.asc)(index_js_2.taskItems.sortOrder));
}
async function createTaskItems(taskId, items) {
    const values = items.map((item, index) => ({
        ...item,
        taskId,
        sortOrder: item.sortOrder ?? index,
    }));
    await index_js_1.db.insert(index_js_2.taskItems).values(values);
    return findTaskItems(taskId);
}
async function completeTaskItem(taskId, itemId, notes, actualMinutes, agentId) {
    await index_js_1.db.update(index_js_2.taskItems).set({
        isCompleted: true,
        completedAt: (0, drizzle_orm_1.sql) `NOW()`,
        notes: notes || undefined,
        actualMinutes: actualMinutes || undefined,
        completedByAgentId: agentId || undefined,
    }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.taskItems.id, itemId), (0, drizzle_orm_1.eq)(index_js_2.taskItems.taskId, taskId)));
    // Update parent task progress
    await updateTaskProgress(taskId);
    return findTaskItems(taskId);
}
async function updateTaskProgress(taskId) {
    const items = await findTaskItems(taskId);
    if (items.length === 0)
        return;
    const completedCount = items.filter(i => i.isCompleted).length;
    const progress = Math.round((completedCount / items.length) * 100);
    await index_js_1.db.update(index_js_2.tasks).set({ progress }).where((0, drizzle_orm_1.eq)(index_js_2.tasks.id, taskId));
}
async function updateTaskItem(taskId, itemId, data) {
    await index_js_1.db.update(index_js_2.taskItems).set(data).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.taskItems.id, itemId), (0, drizzle_orm_1.eq)(index_js_2.taskItems.taskId, taskId)));
    return findTaskItems(taskId);
}
async function deleteTaskItem(taskId, itemId) {
    await index_js_1.db.delete(index_js_2.taskItems).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.taskItems.id, itemId), (0, drizzle_orm_1.eq)(index_js_2.taskItems.taskId, taskId)));
    await updateTaskProgress(taskId);
}
// ============================================================================
// Task Tags
// ============================================================================
async function findAllTags() {
    return index_js_1.db.select().from(index_js_2.taskTags).orderBy((0, drizzle_orm_1.desc)(index_js_2.taskTags.usageCount));
}
async function findTaskTags(taskId) {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT tt.*
        FROM task_tags tt
        INNER JOIN task_tag_assignments tta ON tt.id = tta.tag_id
        WHERE tta.task_id = ${taskId}
    `);
}
async function addTagToTask(taskId, tagId, userId) {
    await index_js_1.db.insert(index_js_2.taskTagAssignments).values({
        taskId,
        tagId,
        assignedBy: userId || undefined,
    });
    // Update usage count
    await index_js_1.db.update(index_js_2.taskTags).set({
        usageCount: (0, drizzle_orm_1.sql) `usage_count + 1`,
    }).where((0, drizzle_orm_1.eq)(index_js_2.taskTags.id, tagId));
    return findTaskTags(taskId);
}
async function removeTagFromTask(taskId, tagId) {
    await index_js_1.db.delete(index_js_2.taskTagAssignments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.taskTagAssignments.taskId, taskId), (0, drizzle_orm_1.eq)(index_js_2.taskTagAssignments.tagId, tagId)));
    // Update usage count
    await index_js_1.db.update(index_js_2.taskTags).set({
        usageCount: (0, drizzle_orm_1.sql) `GREATEST(usage_count - 1, 0)`,
    }).where((0, drizzle_orm_1.eq)(index_js_2.taskTags.id, tagId));
}
// ============================================================================
// Kanban Aggregations
// ============================================================================
async function getKanbanBoard(projectId) {
    const projectFilter = projectId ? (0, drizzle_orm_1.sql) `AND t.project_id = ${projectId}` : (0, drizzle_orm_1.sql) ``;
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT
            t.status,
            COUNT(*) as count,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', t.id,
                    'title', t.title,
                    'priority', t.priority,
                    'progress', t.progress,
                    'project_code', p.code,
                    'task_number', t.task_number
                )
            ) as tasks
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE 1=1 ${projectFilter}
        GROUP BY t.status
        ORDER BY FIELD(t.status, 'pending', 'in_progress', 'review', 'completed', 'blocked')
    `);
}
//# sourceMappingURL=tasks.js.map