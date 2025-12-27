"use strict";
/**
 * SOLARIA DFO - Memories Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllMemories = findAllMemories;
exports.findMemoryById = findMemoryById;
exports.searchMemories = searchMemories;
exports.createMemory = createMemory;
exports.updateMemory = updateMemory;
exports.deleteMemory = deleteMemory;
exports.boostImportance = boostImportance;
exports.accessMemory = accessMemory;
exports.findAllMemoryTags = findAllMemoryTags;
exports.getMemoryStats = getMemoryStats;
exports.findRelatedMemories = findRelatedMemories;
exports.createCrossref = createCrossref;
const index_js_1 = require("../index.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_2 = require("../schema/index.js");
// ============================================================================
// Memories CRUD
// ============================================================================
async function findAllMemories(filters) {
    const conditions = [];
    if (filters?.projectId) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.memories.projectId, filters.projectId));
    }
    if (filters?.agentId) {
        conditions.push((0, drizzle_orm_1.eq)(index_js_2.memories.agentId, filters.agentId));
    }
    if (filters?.minImportance) {
        conditions.push((0, drizzle_orm_1.gte)(index_js_2.memories.importance, filters.minImportance.toString()));
    }
    let query = index_js_1.db.select().from(index_js_2.memories);
    if (conditions.length > 0) {
        return query
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.memories.importance), (0, drizzle_orm_1.desc)(index_js_2.memories.createdAt))
            .limit(filters?.limit || 50)
            .offset(filters?.offset || 0);
    }
    return query
        .orderBy((0, drizzle_orm_1.desc)(index_js_2.memories.importance), (0, drizzle_orm_1.desc)(index_js_2.memories.createdAt))
        .limit(filters?.limit || 50);
}
async function findMemoryById(id) {
    const result = await index_js_1.db
        .select()
        .from(index_js_2.memories)
        .where((0, drizzle_orm_1.eq)(index_js_2.memories.id, id))
        .limit(1);
    return result[0] || null;
}
async function searchMemories(searchQuery, limit = 20) {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT *,
               MATCH(content, summary) AGAINST(${searchQuery} IN NATURAL LANGUAGE MODE) as relevance
        FROM memories
        WHERE MATCH(content, summary) AGAINST(${searchQuery} IN NATURAL LANGUAGE MODE)
        ORDER BY relevance DESC, importance DESC
        LIMIT ${limit}
    `);
}
async function createMemory(data) {
    const result = await index_js_1.db.insert(index_js_2.memories).values(data);
    const insertId = result[0].insertId;
    // Log event
    await index_js_1.db.insert(index_js_2.memoryEvents).values({
        memoryId: insertId,
        eventType: 'created',
        agentId: data.agentId || undefined,
        projectId: data.projectId || undefined,
    });
    return findMemoryById(insertId);
}
async function updateMemory(id, data) {
    await index_js_1.db.update(index_js_2.memories).set(data).where((0, drizzle_orm_1.eq)(index_js_2.memories.id, id));
    // Log event
    const memory = await findMemoryById(id);
    if (memory) {
        await index_js_1.db.insert(index_js_2.memoryEvents).values({
            memoryId: id,
            eventType: 'updated',
            agentId: memory.agentId || undefined,
            projectId: memory.projectId || undefined,
        });
    }
    return findMemoryById(id);
}
async function deleteMemory(id) {
    return index_js_1.db.delete(index_js_2.memories).where((0, drizzle_orm_1.eq)(index_js_2.memories.id, id));
}
async function boostImportance(id, amount = 0.1) {
    await index_js_1.db.update(index_js_2.memories).set({
        importance: (0, drizzle_orm_1.sql) `LEAST(importance + ${amount}, 1.0)`,
        accessCount: (0, drizzle_orm_1.sql) `access_count + 1`,
        lastAccessed: (0, drizzle_orm_1.sql) `NOW()`,
    }).where((0, drizzle_orm_1.eq)(index_js_2.memories.id, id));
    return findMemoryById(id);
}
async function accessMemory(id) {
    await index_js_1.db.update(index_js_2.memories).set({
        accessCount: (0, drizzle_orm_1.sql) `access_count + 1`,
        lastAccessed: (0, drizzle_orm_1.sql) `NOW()`,
    }).where((0, drizzle_orm_1.eq)(index_js_2.memories.id, id));
    // Log event
    await index_js_1.db.insert(index_js_2.memoryEvents).values({
        memoryId: id,
        eventType: 'accessed',
    });
    return findMemoryById(id);
}
// ============================================================================
// Memory Tags
// ============================================================================
async function findAllMemoryTags() {
    return index_js_1.db.select().from(index_js_2.memoryTags).orderBy((0, drizzle_orm_1.desc)(index_js_2.memoryTags.usageCount));
}
async function getMemoryStats() {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
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
async function findRelatedMemories(memoryId) {
    return index_js_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT m.*, mc.relationship_type, mc.strength
        FROM memories m
        INNER JOIN memory_crossrefs mc ON m.id = mc.target_memory_id
        WHERE mc.source_memory_id = ${memoryId}
        ORDER BY mc.strength DESC, m.importance DESC
    `);
}
async function createCrossref(sourceId, targetId, relationshipType = 'related', strength = 0.5) {
    const result = await index_js_1.db.insert(index_js_2.memoryCrossrefs).values({
        sourceMemoryId: sourceId,
        targetMemoryId: targetId,
        relationshipType,
        strength: strength.toString(),
    });
    const crossrefs = await index_js_1.db
        .select()
        .from(index_js_2.memoryCrossrefs)
        .where((0, drizzle_orm_1.eq)(index_js_2.memoryCrossrefs.id, result[0].insertId))
        .limit(1);
    return crossrefs[0];
}
//# sourceMappingURL=memories.js.map