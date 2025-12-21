/**
 * SOLARIA DFO - Memories Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
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

export async function findMemoryById(id: number) {
    const result = await db
        .select()
        .from(memories)
        .where(eq(memories.id, id))
        .limit(1);
    return result[0] || null;
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

export async function getMemoryStats() {
    return db.execute(sql`
        SELECT
            COUNT(*) as total_memories,
            AVG(importance) as avg_importance,
            SUM(access_count) as total_accesses,
            COUNT(DISTINCT project_id) as projects_with_memories,
            COUNT(DISTINCT agent_id) as agents_with_memories
        FROM memories
    `);
}

// ============================================================================
// Memory Cross-references
// ============================================================================

export async function findRelatedMemories(memoryId: number) {
    return db.execute(sql`
        SELECT m.*, mc.relationship_type, mc.strength
        FROM memories m
        INNER JOIN memory_crossrefs mc ON m.id = mc.target_memory_id
        WHERE mc.source_memory_id = ${memoryId}
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
