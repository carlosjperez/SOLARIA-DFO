/**
 * SOLARIA DFO - Memories Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db, pool } from '../index.js';
import { eq, desc, sql, and, like, gte, lte } from 'drizzle-orm';
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

// ============================================================================
// Memories CRUD
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

export async function findMemoryById(id: number) {
    const result = await db
        .select()
        .from(memories)
        .where(eq(memories.id, id))
        .limit(1);
    return result[0] || null;
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

export async function createMemory(data: NewMemory): Promise<Memory> {
    const result = await db.insert(memories).values(data);
    const insertId = result[0].insertId;

    // Log event
    await db.insert(memoryEvents).values({
        memoryId: insertId,
        eventType: 'created',
        agentId: data.agentId || undefined,
        projectId: data.projectId || undefined,
    });

    return findMemoryById(insertId) as Promise<Memory>;
}

export async function updateMemory(id: number, data: Partial<NewMemory>) {
    await db.update(memories).set(data).where(eq(memories.id, id));

    // Log event
    const memory = await findMemoryById(id);
    if (memory) {
        await db.insert(memoryEvents).values({
            memoryId: id,
            eventType: 'updated',
            agentId: memory.agentId || undefined,
            projectId: memory.projectId || undefined,
        });
    }

    return findMemoryById(id);
}

export async function deleteMemory(id: number) {
    return db.delete(memories).where(eq(memories.id, id));
}

export async function boostImportance(id: number, amount = 0.1) {
    await db.update(memories).set({
        importance: sql`LEAST(importance + ${amount}, 1.0)`,
        accessCount: sql`access_count + 1`,
        lastAccessed: sql`NOW()`,
    }).where(eq(memories.id, id));
    return findMemoryById(id);
}

export async function accessMemory(id: number) {
    await db.update(memories).set({
        accessCount: sql`access_count + 1`,
        lastAccessed: sql`NOW()`,
    }).where(eq(memories.id, id));

    // Log event
    await db.insert(memoryEvents).values({
        memoryId: id,
        eventType: 'accessed',
    });

    return findMemoryById(id);
}

// ============================================================================
// Memory Tags
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
