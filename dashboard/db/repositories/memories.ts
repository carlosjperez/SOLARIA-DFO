/**
 * SOLARIA DFO - Memories Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 *
 * Updated: 2026-01-11 - Phase 2.3: BaseRepository pattern
 */

import { db, pool } from '../index.js';
import { eq, desc, sql, and, like, gte, lte, type SQL } from 'drizzle-orm';
import {
    memories,
    memoryTags,
    memoryCrossrefs,
    memoryEvents,
    type Memory,
    type NewMemory,
    type MemoryTag,
    type MemoryCrossref,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Memories Repository Class
// ============================================================================

class MemoriesRepository extends BaseRepository<Memory, NewMemory, typeof memories> {
    constructor() {
        super(memories, 'Memory');
    }

    /**
     * Boost memory importance by specified amount
     */
    async boostImportance(id: number, amount = 0.1) {
        await db.execute(sql`
            UPDATE memories
            SET importance = LEAST(importance + ${amount}, 1.0)
            WHERE id = ${id}
        `);
        return this.findById(id);
    }

    /**
     * Record memory access (increment access_count, update last_accessed_at)
     */
    async accessMemory(id: number) {
        await db.execute(sql`
            UPDATE memories
            SET access_count = access_count + 1,
                last_accessed_at = NOW()
            WHERE id = ${id}
        `);

        // Log event
        await db.execute(sql`
            INSERT INTO memory_events (memory_id, event_type, event_data, created_at)
            VALUES (${id}, 'accessed', JSON_OBJECT('timestamp', NOW()), NOW())
        `);

        return this.findById(id);
    }

    /**
     * Create memory with event logging
     * Overrides BaseRepository.create to add event logging
     */
    async createMemory(data: NewMemory): Promise<Memory> {
        const result = await db.insert(memories).values(data);
        const insertId = result[0].insertId;

        // Log event
        await db.insert(memoryEvents).values({
            memoryId: insertId,
            eventType: 'created',
            agentId: data.agentId || undefined,
            projectId: data.projectId || undefined,
        });

        return this.findById(insertId) as Promise<Memory>;
    }

    /**
     * Update memory with version tracking
     * Overrides BaseRepository.update to add event logging
     */
    async updateMemory(id: number, data: Partial<NewMemory>) {
        // Increment version
        const updated = await db.execute(sql`
            UPDATE memories
            SET version = version + 1
            WHERE id = ${id}
        `);

        // Update the memory
        await db.update(memories).set(data).where(eq(memories.id, id));

        return this.findById(id);
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const memoriesRepo = new MemoriesRepository();

// ============================================================================
// Memory Search and Filters - Standalone Functions
// ============================================================================

export async function findAllMemories(filters?: {
    projectId?: number;
    agentId?: number;
    tags?: string[];
    query?: string;
    minImportance?: number;
    limit?: number;
    offset?: number;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(memories.projectId, filters.projectId));
    }
    if (filters?.agentId) {
        conditions.push(eq(memories.agentId, filters.agentId));
    }
    if (filters?.minImportance) {
        conditions.push(gte(memories.importance, filters.minImportance.toString()));
    }

    let query = db.select().from(memories);

    if (conditions.length > 0) {
        return query
            .where(and(...conditions))
            .orderBy(desc(memories.importance), desc(memories.createdAt))
            .limit(filters?.limit || 50)
            .offset(filters?.offset || 0);
    }

    return query
        .orderBy(desc(memories.importance), desc(memories.createdAt))
        .limit(filters?.limit || 50);
}

export async function findMemoriesWithFilters(filters: {
    projectId?: number;
    agentId?: number;
    tags?: string[];
    searchQuery?: string;
    minImportance?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
}) {
    let sqlQuery = `
        SELECT m.*, p.name as project_name, aa.name as agent_name
        FROM memories m
        LEFT JOIN projects p ON m.project_id = p.id
        LEFT JOIN ai_agents aa ON m.agent_id = aa.id
        WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (filters.projectId) {
        sqlQuery += ' AND m.project_id = ?';
        params.push(filters.projectId);
    }

    if (filters.agentId) {
        sqlQuery += ' AND m.agent_id = ?';
        params.push(filters.agentId);
    }

    if (filters.searchQuery) {
        sqlQuery += ' AND (m.content LIKE ? OR m.summary LIKE ?)';
        params.push(`%${filters.searchQuery}%`, `%${filters.searchQuery}%`);
    }

    if (filters.minImportance !== undefined) {
        sqlQuery += ' AND m.importance >= ?';
        params.push(filters.minImportance);
    }

    if (filters.tags && filters.tags.length > 0) {
        const tagConditions = filters.tags.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
        sqlQuery += ` AND (${tagConditions})`;
        filters.tags.forEach(tag => params.push(JSON.stringify(tag)));
    }

    // Sort order
    const sortMap: Record<string, string> = {
        'importance': 'm.importance DESC, m.created_at DESC',
        'created_at': 'm.created_at DESC',
        'updated_at': 'm.updated_at DESC',
        'access_count': 'm.access_count DESC'
    };
    sqlQuery += ` ORDER BY ${sortMap[filters.sortBy || 'importance'] || sortMap['importance']}`;

    sqlQuery += ` LIMIT ? OFFSET ?`;
    params.push(filters.limit || 50);
    params.push(filters.offset || 0);

    return pool.execute(sqlQuery, params);
}

export async function searchMemoriesFulltext(filters: {
    query: string;
    projectId?: number;
    tags?: string[];
    minImportance: number;
    limit: number;
}) {
    let sqlQuery = `
        SELECT m.*,
            MATCH(m.content, m.summary) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance,
            p.name as project_name
        FROM memories m
        LEFT JOIN projects p ON m.project_id = p.id
        WHERE MATCH(m.content, m.summary) AGAINST(? IN NATURAL LANGUAGE MODE)
        AND m.importance >= ?
    `;
    const params: (string | number)[] = [filters.query, filters.query, filters.minImportance];

    if (filters.projectId) {
        sqlQuery += ' AND m.project_id = ?';
        params.push(filters.projectId);
    }

    if (filters.tags && filters.tags.length > 0) {
        const tagConditions = filters.tags.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
        sqlQuery += ` AND (${tagConditions})`;
        filters.tags.forEach(tag => params.push(JSON.stringify(tag)));
    }

    sqlQuery += ` ORDER BY relevance DESC, m.importance DESC LIMIT ${filters.limit}`;

    return pool.execute(sqlQuery, params);
}

export async function findMemoriesWithEmbeddings(filters: {
    query: string;
    projectId?: number;
    limit: number;
}) {
    let sqlQuery = `
        SELECT m.*, p.name as project_name, aa.name as agent_name,
               MATCH(m.content) AGAINST(? IN NATURAL LANGUAGE MODE) as fulltext_score
        FROM memories m
        LEFT JOIN projects p ON m.project_id = p.id
        LEFT JOIN ai_agents aa ON m.agent_id = aa.id
        WHERE m.embedding IS NOT NULL
    `;
    const params: (string | number)[] = [filters.query];

    if (filters.projectId) {
        sqlQuery += ' AND m.project_id = ?';
        params.push(filters.projectId);
    }

    sqlQuery += ` ORDER BY m.importance DESC, m.created_at DESC LIMIT ${filters.limit}`;

    return pool.execute(sqlQuery, params);
}

export async function findMemoryByIdWithDetails(id: number) {
    return db.execute(sql`
        SELECT
            m.*,
            p.name as project_name,
            aa.name as agent_name
        FROM memories m
        LEFT JOIN projects p ON m.project_id = p.id
        LEFT JOIN ai_agents aa ON m.agent_id = aa.id
        WHERE m.id = ${id}
        LIMIT 1
    `);
}

export async function searchMemories(searchQuery: string, limit = 20) {
    return db.execute(sql`
        SELECT *,
               MATCH(content, summary) AGAINST(${searchQuery} IN NATURAL LANGUAGE MODE) as relevance
        FROM memories
        WHERE MATCH(content, summary) AGAINST(${searchQuery} IN NATURAL LANGUAGE MODE)
        ORDER BY relevance DESC, importance DESC
        LIMIT ${limit}
    `);
}

// ============================================================================
// Memory Tags - Standalone Functions
// ============================================================================

export async function findAllMemoryTags() {
    return db.select().from(memoryTags).orderBy(desc(memoryTags.usageCount));
}

export async function getMemoryStats(projectId?: number) {
    const projectFilter = projectId ? sql`WHERE project_id = ${projectId}` : sql``;

    return db.execute(sql`
        SELECT
            COUNT(*) as total_memories,
            AVG(importance) as avg_importance,
            SUM(access_count) as total_accesses,
            COUNT(DISTINCT project_id) as projects_with_memories,
            COUNT(DISTINCT agent_id) as agents_with_memories
        FROM memories
        ${projectFilter}
    `);
}

// ============================================================================
// Memory Cross-references
// ============================================================================

export async function findRelatedMemories(memoryId: number, relationshipType?: string) {
    const typeFilter = relationshipType ? sql`AND mc.relationship_type = ${relationshipType}` : sql``;

    return db.execute(sql`
        SELECT m.*, mc.relationship_type, mc.strength
        FROM memories m
        INNER JOIN memory_crossrefs mc ON m.id = mc.target_memory_id
        WHERE mc.source_memory_id = ${memoryId} ${typeFilter}
        ORDER BY mc.strength DESC, m.importance DESC
    `);
}

export async function createCrossref(
    sourceId: number,
    targetId: number,
    relationshipType: 'related' | 'depends_on' | 'contradicts' | 'supersedes' | 'child_of' = 'related',
    strength = 0.5
): Promise<MemoryCrossref> {
    const result = await db.insert(memoryCrossrefs).values({
        sourceMemoryId: sourceId,
        targetMemoryId: targetId,
        relationshipType,
        strength: strength.toString(),
    });

    const crossrefs = await db
        .select()
        .from(memoryCrossrefs)
        .where(eq(memoryCrossrefs.id, result[0].insertId))
        .limit(1);

    return crossrefs[0];
}

// ============================================================================
// Exported Functions (Backward Compatibility) - Memories CRUD Only
// ============================================================================

/**
 * Find memory by ID
 * @deprecated Use memoriesRepo.findById() directly
 */
export async function findMemoryById(id: number) {
    return memoriesRepo.findById(id);
}

/**
 * Create memory with event logging
 * @deprecated Use memoriesRepo.createMemory() directly
 */
export async function createMemory(data: NewMemory): Promise<Memory> {
    return memoriesRepo.createMemory(data);
}

/**
 * Update memory with version tracking
 * @deprecated Use memoriesRepo.updateMemory() directly
 */
export async function updateMemory(id: number, data: Partial<NewMemory>) {
    return memoriesRepo.updateMemory(id, data);
}

/**
 * Delete memory
 * @deprecated Use memoriesRepo.delete() directly
 */
export async function deleteMemory(id: number) {
    return memoriesRepo.delete(id);
}

/**
 * Boost memory importance
 * @deprecated Use memoriesRepo.boostImportance() directly
 */
export async function boostImportance(id: number, amount = 0.1) {
    return memoriesRepo.boostImportance(id, amount);
}

/**
 * Record memory access
 * @deprecated Use memoriesRepo.accessMemory() directly
 */
export async function accessMemory(id: number) {
    return memoriesRepo.accessMemory(id);
}

// Export repository instance for direct usage
export { memoriesRepo };
