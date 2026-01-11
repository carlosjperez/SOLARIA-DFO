/**
 * SOLARIA DFO - Epics Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db, pool } from '../index.js';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import {
    epics,
    type Epic,
    type NewEpic,
} from '../schema/index.js';

// ============================================================================
// Epics CRUD
// ============================================================================

export async function findAllEpics(filters?: {
    projectId?: number;
    sprintId?: number;
    status?: string;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(epics.projectId, filters.projectId));
    }
    if (filters?.sprintId) {
        conditions.push(eq(epics.sprintId, filters.sprintId));
    }
    if (filters?.status) {
        conditions.push(sql`${epics.status} = ${filters.status}`);
    }

    const query = db.select().from(epics);

    if (conditions.length > 0) {
        return query
            .where(and(...conditions))
            .orderBy(desc(epics.updatedAt));
    }

    return query.orderBy(desc(epics.updatedAt));
}

export async function findEpicById(id: number) {
    const result = await db
        .select()
        .from(epics)
        .where(eq(epics.id, id))
        .limit(1);
    return result[0] || null;
}

export async function findEpicWithStats(id: number) {
    return db.execute(sql`
        SELECT
            e.*,
            p.name as project_name,
            p.code as project_code,
            s.name as sprint_name,
            u.name as created_by_name,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.epic_id = e.id), 0) as tasks_total,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.epic_id = e.id AND t.status = 'completed'), 0) as tasks_completed,
            COALESCE((SELECT AVG(t.progress) FROM tasks t WHERE t.epic_id = e.id), 0) as completion_percentage
        FROM epics e
        LEFT JOIN projects p ON e.project_id = p.id
        LEFT JOIN sprints s ON e.sprint_id = s.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.id = ${id}
    `);
}

export async function findAllEpicsWithStats(filters?: {
    projectId?: number;
    sprintId?: number;
    status?: string;
}) {
    let query = `
        SELECT
            e.*,
            p.name as project_name,
            p.code as project_code,
            s.name as sprint_name,
            s.sprint_number,
            s.status as sprint_status,
            u.name as created_by_name,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.epic_id = e.id), 0) as tasks_total,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.epic_id = e.id AND t.status = 'completed'), 0) as tasks_completed,
            COALESCE((SELECT AVG(t.progress) FROM tasks t WHERE t.epic_id = e.id), 0) as progress
        FROM epics e
        LEFT JOIN projects p ON e.project_id = p.id
        LEFT JOIN sprints s ON e.sprint_id = s.id
        LEFT JOIN users u ON e.created_by = u.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.projectId) {
        query += ' AND e.project_id = ?';
        params.push(filters.projectId);
    }
    if (filters?.sprintId) {
        query += ' AND e.sprint_id = ?';
        params.push(filters.sprintId);
    }
    if (filters?.status) {
        query += ' AND e.status = ?';
        params.push(filters.status);
    }

    query += ' ORDER BY e.updated_at DESC';

    return pool.execute(query, params);
}

export async function createEpic(data: NewEpic): Promise<Epic> {
    // Get next epic number for project
    let epicNumber = 1;
    if (data.projectId) {
        const result = await db.execute(sql`
            SELECT COALESCE(MAX(epic_number), 0) + 1 as next_number
            FROM epics WHERE project_id = ${data.projectId}
        `);
        const rows = result[0] as unknown as Array<{ next_number: number }>;
        epicNumber = rows[0]?.next_number || 1;
    }

    const insertResult = await db.insert(epics).values({
        ...data,
        epicNumber,
    });

    return findEpicById(insertResult[0].insertId) as Promise<Epic>;
}

export async function updateEpic(id: number, data: Partial<NewEpic>) {
    await db.update(epics).set(data).where(eq(epics.id, id));
    return findEpicById(id);
}

export async function deleteEpic(id: number) {
    return db.delete(epics).where(eq(epics.id, id));
}
