/**
 * SOLARIA DFO - Sprints Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 *
 * Updated: 2026-01-11 - Phase 1: Standardized filter types
 * Updated: 2026-01-11 - Phase 2: BaseRepository pattern
 */

import { db, pool } from '../index.js';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import {
    sprints,
    type Sprint,
    type NewSprint,
} from '../schema/index.js';
import type { SprintFilters } from './types/filters.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Sprints Repository Class
// ============================================================================

class SprintsRepository extends BaseRepository<Sprint, NewSprint, typeof sprints> {
    constructor() {
        super(sprints, 'Sprint');
    }

    /**
     * Find all sprints with optional filters
     * Custom implementation with phase_order sorting
     */
    async findAllSprints(filters?: SprintFilters) {
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

    /**
     * Find sprint with aggregated statistics
     * Complex query with JOINs and subqueries
     */
    async findSprintWithStats(id: number) {
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

    /**
     * Find all sprints with aggregated statistics
     * Complex query with filters and stats
     */
    async findAllSprintsWithStats(filters?: {
        projectId?: number;
        status?: string;
    }) {
        let query = `
            SELECT
                s.*,
                p.name as project_name,
                p.code as project_code,
                u.name as created_by_name,
                COALESCE((SELECT COUNT(*) FROM epics e WHERE e.sprint_id = s.id), 0) as epics_count,
                COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id), 0) as tasks_total,
                COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.sprint_id = s.id AND t.status = 'completed'), 0) as tasks_completed,
                COALESCE((SELECT AVG(t.progress) FROM tasks t WHERE t.sprint_id = s.id), 0) as progress
            FROM sprints s
            LEFT JOIN projects p ON s.project_id = p.id
            LEFT JOIN users u ON s.created_by = u.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (filters?.projectId) {
            query += ' AND s.project_id = ?';
            params.push(filters.projectId);
        }
        if (filters?.status) {
            query += ' AND s.status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY s.phase_order ASC, s.updated_at DESC';

        return pool.execute(query, params);
    }

    /**
     * Create sprint with auto-generated sprint_number
     * Domain-specific logic for sprint numbering
     */
    async createSprint(data: NewSprint): Promise<Sprint> {
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

        return this.findById(insertResult[0].insertId) as Promise<Sprint>;
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const sprintsRepo = new SprintsRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Find all sprints with optional filters
 * @deprecated Use sprintsRepo.findAllSprints() directly
 */
export async function findAllSprints(filters?: SprintFilters) {
    return sprintsRepo.findAllSprints(filters);
}

/**
 * Find sprint by ID
 * @deprecated Use sprintsRepo.findById() directly
 */
export async function findSprintById(id: number) {
    return sprintsRepo.findById(id);
}

/**
 * Find sprint with aggregated statistics
 * @deprecated Use sprintsRepo.findSprintWithStats() directly
 */
export async function findSprintWithStats(id: number) {
    return sprintsRepo.findSprintWithStats(id);
}

/**
 * Find all sprints with aggregated statistics
 * @deprecated Use sprintsRepo.findAllSprintsWithStats() directly
 */
export async function findAllSprintsWithStats(filters?: {
    projectId?: number;
    status?: string;
}) {
    return sprintsRepo.findAllSprintsWithStats(filters);
}

/**
 * Create new sprint with auto-generated sprint_number
 * @deprecated Use sprintsRepo.createSprint() directly
 */
export async function createSprint(data: NewSprint): Promise<Sprint> {
    return sprintsRepo.createSprint(data);
}

/**
 * Update sprint by ID
 * @deprecated Use sprintsRepo.update() directly
 */
export async function updateSprint(id: number, data: Partial<NewSprint>) {
    return sprintsRepo.update(id, data);
}

/**
 * Delete sprint by ID
 * @deprecated Use sprintsRepo.delete() directly
 */
export async function deleteSprint(id: number) {
    return sprintsRepo.delete(id);
}

// Export repository instance for direct usage
export { sprintsRepo };
