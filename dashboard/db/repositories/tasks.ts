/**
 * SOLARIA DFO - Tasks Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db, pool } from '../index.js';
import { eq, desc, asc, sql, and, or, isNull, isNotNull } from 'drizzle-orm';
import {
    tasks,
    taskItems,
    taskTags,
    taskTagAssignments,
    type Task,
    type NewTask,
    type TaskItem,
    type NewTaskItem,
    type TaskTag,
} from '../schema/index.js';

// ============================================================================
// Tasks CRUD
// ============================================================================

export async function findAllTasks(filters?: {
    projectId?: number;
    epicId?: number;
    sprintId?: number;
    status?: string;
    priority?: string;
    agentId?: number;
    limit?: number;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(tasks.projectId, filters.projectId));
    }
    if (filters?.epicId) {
        conditions.push(eq(tasks.epicId, filters.epicId));
    }
    if (filters?.sprintId) {
        conditions.push(eq(tasks.sprintId, filters.sprintId));
    }
    if (filters?.status) {
        conditions.push(sql`${tasks.status} = ${filters.status}`);
    }
    if (filters?.priority) {
        conditions.push(sql`${tasks.priority} = ${filters.priority}`);
    }
    if (filters?.agentId) {
        conditions.push(eq(tasks.assignedAgentId, filters.agentId));
    }

    const query = db.select().from(tasks);

    if (conditions.length > 0) {
        return query
            .where(and(...conditions))
            .orderBy(desc(tasks.updatedAt))
            .limit(filters?.limit || 100);
    }

    return query.orderBy(desc(tasks.updatedAt)).limit(filters?.limit || 100);
}

export async function findTaskById(id: number) {
    const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);
    return result[0] || null;
}

export async function findTaskWithDetails(id: number) {
    return db.execute(sql`
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

export async function createTask(data: NewTask): Promise<Task> {
    // Get next task number for project
    let taskNumber = 1;
    if (data.projectId) {
        const result = await db.execute(sql`
            SELECT COALESCE(MAX(task_number), 0) + 1 as next_number
            FROM tasks WHERE project_id = ${data.projectId}
        `);
        const rows = result[0] as unknown as Array<{ next_number: number }>;
        taskNumber = rows[0]?.next_number || 1;
    }

    const insertResult = await db.insert(tasks).values({
        ...data,
        taskNumber,
    });

    return findTaskById(insertResult[0].insertId) as Promise<Task>;
}

export async function updateTask(id: number, data: Partial<NewTask>) {
    await db.update(tasks).set(data).where(eq(tasks.id, id));
    return findTaskById(id);
}

export async function completeTask(id: number, notes?: string) {
    await db.update(tasks).set({
        status: 'completed',
        progress: 100,
        completedAt: sql`NOW()`,
        notes: notes || undefined,
    }).where(eq(tasks.id, id));
    return findTaskById(id);
}

export async function deleteTask(id: number) {
    return db.delete(tasks).where(eq(tasks.id, id));
}

// ============================================================================
// Task Items (Subtasks)
// ============================================================================

export async function findTaskItems(taskId: number, includeCompleted = true) {
    const completedFilter = includeCompleted ? '' : 'AND ti.is_completed = 0';

    const [rows] = await pool.execute(`
        SELECT
            ti.*,
            aa.name as completed_by_name
        FROM task_items ti
        LEFT JOIN ai_agents aa ON ti.completed_by = aa.id
        WHERE ti.task_id = ? ${completedFilter}
        ORDER BY ti.sort_order ASC
    `, [taskId]);

    return rows as any[];
}

export async function createTaskItems(
    taskId: number,
    items: Array<Omit<NewTaskItem, 'taskId'>>
): Promise<TaskItem[]> {
    const values = items.map((item, index) => ({
        ...item,
        taskId,
        sortOrder: item.sortOrder ?? index,
    }));

    await db.insert(taskItems).values(values);
    return findTaskItems(taskId);
}

export async function completeTaskItem(
    taskId: number,
    itemId: number,
    notes?: string,
    actualMinutes?: number,
    agentId?: number
) {
    await db.update(taskItems).set({
        isCompleted: true,
        completedAt: sql`NOW()`,
        notes: notes || undefined,
        actualMinutes: actualMinutes || undefined,
        completedByAgentId: agentId || undefined,
    }).where(and(
        eq(taskItems.id, itemId),
        eq(taskItems.taskId, taskId)
    ));

    // Update parent task progress
    await updateTaskProgress(taskId);

    return findTaskItems(taskId);
}

export async function toggleTaskItemComplete(
    taskId: number,
    itemId: number,
    notes?: string,
    actualMinutes?: number,
    agentId?: number
) {
    // Toggle completion status with conditional updates
    await db.execute(sql`
        UPDATE task_items
        SET is_completed = NOT is_completed,
            completed_at = CASE WHEN is_completed = 0 THEN NOW() ELSE NULL END,
            completed_by_agent_id = CASE WHEN is_completed = 0 THEN ${agentId || null} ELSE NULL END,
            notes = COALESCE(${notes || null}, notes),
            actual_minutes = COALESCE(${actualMinutes || null}, actual_minutes)
        WHERE id = ${itemId} AND task_id = ${taskId}
    `);

    // Update parent task progress
    await updateTaskProgress(taskId);

    // Get updated item
    const result = await db.execute(sql`
        SELECT * FROM task_items WHERE id = ${itemId}
    `);

    return {
        item: (result[0] as unknown as any[])[0],
        progress: await getTaskProgress(taskId)
    };
}

async function getTaskProgress(taskId: number) {
    const items = await findTaskItems(taskId);
    if (items.length === 0) return { progress: 0, items_total: 0, items_completed: 0 };

    const completedCount = items.filter(i => i.isCompleted).length;
    const progress = Math.round((completedCount / items.length) * 100);

    return {
        progress,
        items_total: items.length,
        items_completed: completedCount
    };
}

export async function updateTaskProgress(taskId: number) {
    const items = await findTaskItems(taskId);
    if (items.length === 0) return;

    const completedCount = items.filter(i => i.isCompleted).length;
    const progress = Math.round((completedCount / items.length) * 100);

    await db.update(tasks).set({ progress }).where(eq(tasks.id, taskId));
}

export async function updateTaskItem(
    taskId: number,
    itemId: number,
    data: Partial<NewTaskItem>
) {
    await db.update(taskItems).set(data).where(and(
        eq(taskItems.id, itemId),
        eq(taskItems.taskId, taskId)
    ));
    return findTaskItems(taskId);
}

export async function deleteTaskItem(taskId: number, itemId: number) {
    await db.delete(taskItems).where(and(
        eq(taskItems.id, itemId),
        eq(taskItems.taskId, taskId)
    ));
    await updateTaskProgress(taskId);
}

export async function reorderTaskItems(
    taskId: number,
    order: Array<{ id: number; sort_order: number }>
) {
    // Batch update sort_order for multiple items
    for (const item of order) {
        await db.update(taskItems).set({
            sortOrder: item.sort_order
        }).where(and(
            eq(taskItems.id, item.id),
            eq(taskItems.taskId, taskId)
        ));
    }
    return findTaskItems(taskId);
}

// ============================================================================
// Task Tags
// ============================================================================

export async function findAllTags() {
    return db.select().from(taskTags).orderBy(desc(taskTags.usageCount));
}

export async function findTagByName(name: string) {
    const result = await db
        .select()
        .from(taskTags)
        .where(eq(taskTags.name, name.toLowerCase()))
        .limit(1);
    return result[0] || null;
}

export async function findTaskTags(taskId: number) {
    return db.execute(sql`
        SELECT tt.*
        FROM task_tags tt
        INNER JOIN task_tag_assignments tta ON tt.id = tta.tag_id
        WHERE tta.task_id = ${taskId}
    `);
}

export async function addTagToTask(taskId: number, tagId: number, userId?: number) {
    await db.insert(taskTagAssignments).values({
        taskId,
        tagId,
        assignedBy: userId || undefined,
    });

    // Update usage count
    await db.update(taskTags).set({
        usageCount: sql`usage_count + 1`,
    }).where(eq(taskTags.id, tagId));

    return findTaskTags(taskId);
}

export async function removeTagFromTask(taskId: number, tagId: number): Promise<boolean> {
    const result = await db.delete(taskTagAssignments).where(and(
        eq(taskTagAssignments.taskId, taskId),
        eq(taskTagAssignments.tagId, tagId)
    ));

    const deleted = result[0].affectedRows > 0;

    if (deleted) {
        // Update usage count only if something was deleted
        await db.update(taskTags).set({
            usageCount: sql`GREATEST(usage_count - 1, 0)`,
        }).where(eq(taskTags.id, tagId));
    }

    return deleted;
}

// ============================================================================
// Public API Queries
// ============================================================================

export async function findAllTasksPublic(filters?: {
    status?: string;
    priority?: string;
    projectId?: number;
    limit?: number;
}) {
    let query = `
        SELECT
            t.id, t.task_number,
            CONCAT(
                COALESCE(p.code, 'TSK'), '-',
                LPAD(COALESCE(t.task_number, t.id), 3, '0')
            ) as task_code,
            t.title, t.description, t.status, t.priority, t.progress,
            t.estimated_hours, t.actual_hours,
            t.deadline, t.completed_at,
            t.created_at, t.updated_at,
            p.id as project_id, p.name as project_name, p.code as project_code,
            aa.id as agent_id, aa.name as agent_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE (p.archived = FALSE OR p.archived IS NULL)
    `;
    const params: any[] = [];

    if (filters?.status && filters.status !== 'all') {
        query += ' AND t.status = ?';
        params.push(filters.status);
    }

    if (filters?.priority && filters.priority !== 'all') {
        query += ' AND t.priority = ?';
        params.push(filters.priority);
    }

    if (filters?.projectId) {
        query += ' AND t.project_id = ?';
        params.push(filters.projectId);
    }

    query += ' ORDER BY t.updated_at DESC';

    if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    }

    return pool.execute(query, params);
}

export async function getRecentTasksByProject(filters?: {
    days?: number;
    limit?: number;
}) {
    const days = filters?.days || 7;
    const limit = filters?.limit || 30;

    return pool.execute(`
        SELECT
            t.id,
            t.task_number,
            CONCAT(
                COALESCE(p.code, 'TSK'), '-',
                LPAD(COALESCE(t.task_number, t.id), 3, '0'),
                CASE
                    WHEN t.epic_id IS NOT NULL THEN CONCAT('-EPIC', LPAD(e.epic_number, 2, '0'))
                    WHEN t.sprint_id IS NOT NULL THEN CONCAT('-SP', LPAD(sp.sprint_number, 2, '0'))
                    WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'bug') THEN '-BUG'
                    WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'hotfix') THEN '-HOT'
                    ELSE ''
                END
            ) as task_code,
            t.title,
            t.status,
            t.priority,
            t.progress,
            t.created_at,
            t.updated_at,
            p.id as project_id,
            p.name as project_name,
            p.code as project_code,
            e.epic_number, e.name as epic_name,
            sp.sprint_number, sp.name as sprint_name,
            aa.id as agent_id,
            aa.name as agent_name,
            aa.role as agent_role
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN epics e ON t.epic_id = e.id
        LEFT JOIN sprints sp ON t.sprint_id = sp.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ORDER BY t.created_at DESC
        LIMIT ?
    `, [days, limit]);
}

// ============================================================================
// Project Tasks (for getProject endpoint)
// ============================================================================

export async function getProjectTasks(projectId: number) {
    return pool.execute(`
        SELECT
            t.*,
            aa.name as agent_name,
            aa.role as agent_role
        FROM tasks t
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.project_id = ?
        ORDER BY t.created_at DESC
    `, [projectId]);
}

export async function getEpicTasks(epicId: number) {
    return pool.execute(`
        SELECT id, task_number, title, status, progress, priority, estimated_hours
        FROM tasks
        WHERE epic_id = ?
        ORDER BY priority DESC, task_number ASC
    `, [epicId]);
}

export async function getStandaloneSprintTasks(sprintId: number) {
    return pool.execute(`
        SELECT id, task_number, title, status, progress, priority, estimated_hours
        FROM tasks
        WHERE sprint_id = ? AND epic_id IS NULL
        ORDER BY priority DESC, task_number ASC
    `, [sprintId]);
}

// ============================================================================
// Kanban Aggregations
// ============================================================================

export async function getKanbanBoard(projectId?: number) {
    const projectFilter = projectId ? sql`AND t.project_id = ${projectId}` : sql``;

    return db.execute(sql`
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

// ============================================================================
// Task Progress Calculation
// ============================================================================

export async function recalculateTaskProgress(taskId: number): Promise<{ progress: number; completed: number; total: number }> {
    // Get task items counts
    const result = await db.execute(sql`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM task_items
        WHERE task_id = ${taskId}
    `);

    const counts = (result[0] as unknown as any[])[0];
    const total = counts?.total || 0;
    const completed = parseInt(counts?.completed) || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update task progress
    await db.execute(sql`
        UPDATE tasks SET progress = ${progress}, updated_at = NOW() WHERE id = ${taskId}
    `);

    // Auto-complete task if 100%
    if (progress === 100 && total > 0) {
        await db.execute(sql`
            UPDATE tasks SET status = 'completed', completed_at = NOW()
            WHERE id = ${taskId} AND status != 'completed'
        `);
    }

    return { progress, completed, total };
}

// ============================================================================
// Task Queries
// ============================================================================

export async function getRecentCompletedTasks(limit = 20) {
    return db.execute(sql`
        SELECT
            t.id,
            t.task_number,
            CONCAT(
                COALESCE(p.code, 'TSK'), '-',
                LPAD(COALESCE(t.task_number, t.id), 3, '0'),
                CASE
                    WHEN t.epic_id IS NOT NULL THEN CONCAT('-EPIC', LPAD(e.epic_number, 2, '0'))
                    WHEN t.sprint_id IS NOT NULL THEN CONCAT('-SP', LPAD(sp.sprint_number, 2, '0'))
                    WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'bug') THEN '-BUG'
                    WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'hotfix') THEN '-HOT'
                    ELSE ''
                END
            ) as task_code,
            t.title,
            t.status,
            t.priority,
            t.progress,
            t.completed_at,
            t.updated_at,
            p.id as project_id,
            p.name as project_name,
            p.code as project_code,
            e.epic_number, e.name as epic_name,
            sp.sprint_number, sp.name as sprint_name,
            aa.id as agent_id,
            aa.name as agent_name,
            aa.role as agent_role
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN epics e ON t.epic_id = e.id
        LEFT JOIN sprints sp ON t.sprint_id = sp.id
        LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
        WHERE t.status = 'completed'
        ORDER BY COALESCE(t.completed_at, t.updated_at) DESC
        LIMIT ${limit}
    `);
}

// ============================================================================
// Cascade Delete Helpers
// ============================================================================

export async function deleteTaskItems(taskId: number) {
    return pool.execute('DELETE FROM task_items WHERE task_id = ?', [taskId]);
}

export async function deleteTaskTagAssignments(taskId: number) {
    return pool.execute('DELETE FROM task_tag_assignments WHERE task_id = ?', [taskId]);
}
