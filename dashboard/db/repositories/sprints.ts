/**
 * SOLARIA DFO - Sprints Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import {
    sprints,
    type Sprint,
    type NewSprint,
} from '../schema/index.js';

// ============================================================================
// Sprints CRUD
// ============================================================================

export async function findAllSprints(filters?: {
    projectId?: number;
    status?: string;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(sprints.projectId, filters.projectId));
    }
    if (filters?.status) {
        conditions.push(sql`${sprints.status} = ${filters.status}`);
    }

    const query = db.select().from(sprints);

    if (conditions.length > 0) {
        return query
            .where(and(...conditions))
            .orderBy(asc(sprints.phaseOrder), desc(sprints.updatedAt));
    }

    return query.orderBy(asc(sprints.phaseOrder), desc(sprints.updatedAt));
}

export async function findSprintById(id: number) {
    const result = await db
        .select()
        .from(sprints)
        .where(eq(sprints.id, id))
        .limit(1);
    return result[0] || null;
}

export async function findSprintWithStats(id: number) {
    return db.execute(sql`
        SELECT
            s.*,
            p.name as project_name,
            p.code as project_code,
            u.name as created_by_name,
            COALESCE((SELECT COUNT(*) FROM epics e WHERE e.sprint_id = s.id), 0) as epics_count,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id), 0) as tasks_total,
            COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id AND t.status = 'completed'), 0) as tasks_completed,
            COALESCE((SELECT AVG(t.progress) FROM tasks t WHERE t.sprint_id = s.id), 0) as completion_percentage
        FROM sprints s
        LEFT JOIN projects p ON s.project_id = p.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.id = ${id}
    `);
}

export async function createSprint(data: NewSprint): Promise<Sprint> {
    // Get next sprint number for project
    let sprintNumber = 1;
    if (data.projectId) {
        const result = await db.execute(sql`
            SELECT COALESCE(MAX(sprint_number), 0) + 1 as next_number
            FROM sprints WHERE project_id = ${data.projectId}
        `);
        const rows = result[0] as unknown as Array<{ next_number: number }>;
        sprintNumber = rows[0]?.next_number || 1;
    }

    const insertResult = await db.insert(sprints).values({
        ...data,
        sprintNumber,
    });

    return findSprintById(insertResult[0].insertId) as Promise<Sprint>;
}

export async function updateSprint(id: number, data: Partial<NewSprint>) {
    await db.update(sprints).set(data).where(eq(sprints.id, id));
    return findSprintById(id);
}

export async function deleteSprint(id: number) {
    return db.delete(sprints).where(eq(sprints.id, id));
}
