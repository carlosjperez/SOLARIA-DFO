/**
 * SOLARIA DFO - Tasks Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
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
    status?: string;
    priority?: string;
    agentId?: number;
    limit?: number;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(tasks.projectId, filters.projectId));
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
    const query = db.select().from(taskItems).where(eq(taskItems.taskId, taskId));

    if (!includeCompleted) {
        return db
            .select()
            .from(taskItems)
            .where(and(
                eq(taskItems.taskId, taskId),
                eq(taskItems.isCompleted, false)
            ))
            .orderBy(asc(taskItems.sortOrder));
    }

    return query.orderBy(asc(taskItems.sortOrder));
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

export async function removeTagFromTask(taskId: number, tagId: number) {
    await db.delete(taskTagAssignments).where(and(
        eq(taskTagAssignments.taskId, taskId),
        eq(taskTagAssignments.tagId, tagId)
    ));

    // Update usage count
    await db.update(taskTags).set({
        usageCount: sql`GREATEST(usage_count - 1, 0)`,
    }).where(eq(taskTags.id, tagId));
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
