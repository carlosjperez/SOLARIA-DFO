"use strict";
/**
 * SOLARIA DFO - Memories Schema (Drizzle ORM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingJobsRelations = exports.embeddingStats = exports.embeddingCache = exports.embeddingJobs = exports.embeddingJobStatusEnum = exports.memoryEventsRelations = exports.memoryCrossrefsRelations = exports.memoriesRelations = exports.memoryEvents = exports.memoryEventTypeEnum = exports.memoryCrossrefs = exports.relationshipTypeEnum = exports.memoryTags = exports.memories = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_js_1 = require("./projects.js");
const agents_js_1 = require("./agents.js");
// Memories table
exports.memories = (0, mysql_core_1.mysqlTable)('memories', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id').references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    agentId: (0, mysql_core_1.int)('agent_id').references(() => agents_js_1.aiAgents.id, { onDelete: 'set null' }),
    content: (0, mysql_core_1.text)('content').notNull(),
    summary: (0, mysql_core_1.varchar)('summary', { length: 500 }),
    metadata: (0, mysql_core_1.json)('metadata'),
    tags: (0, mysql_core_1.json)('tags'),
    importance: (0, mysql_core_1.decimal)('importance', { precision: 3, scale: 2 }).default('0.50'),
    accessCount: (0, mysql_core_1.int)('access_count').default(0),
    lastAccessed: (0, mysql_core_1.timestamp)('last_accessed'),
    // Embedding columns (Migration 002)
    embedding: (0, mysql_core_1.json)('embedding'), // Vector embedding (384 dimensions)
    embeddingModel: (0, mysql_core_1.varchar)('embedding_model', { length: 100 }),
    embeddingVersion: (0, mysql_core_1.int)('embedding_version').default(1),
    embeddingGeneratedAt: (0, mysql_core_1.timestamp)('embedding_generated_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Memory tags table
exports.memoryTags = (0, mysql_core_1.mysqlTable)('memory_tags', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull().unique(),
    description: (0, mysql_core_1.varchar)('description', { length: 255 }),
    parentTagId: (0, mysql_core_1.int)('parent_tag_id'),
    usageCount: (0, mysql_core_1.int)('usage_count').default(0),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Memory relationship types enum
exports.relationshipTypeEnum = (0, mysql_core_1.mysqlEnum)('relationship_type', [
    'related',
    'depends_on',
    'contradicts',
    'supersedes',
    'child_of',
]);
// Memory cross-references table
exports.memoryCrossrefs = (0, mysql_core_1.mysqlTable)('memory_crossrefs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    sourceMemoryId: (0, mysql_core_1.int)('source_memory_id')
        .notNull()
        .references(() => exports.memories.id, { onDelete: 'cascade' }),
    targetMemoryId: (0, mysql_core_1.int)('target_memory_id')
        .notNull()
        .references(() => exports.memories.id, { onDelete: 'cascade' }),
    relationshipType: exports.relationshipTypeEnum.default('related'),
    strength: (0, mysql_core_1.decimal)('strength', { precision: 3, scale: 2 }).default('0.50'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Memory event types enum
exports.memoryEventTypeEnum = (0, mysql_core_1.mysqlEnum)('event_type', [
    'created',
    'updated',
    'deleted',
    'accessed',
    'shared',
]);
// Memory events table
exports.memoryEvents = (0, mysql_core_1.mysqlTable)('memory_events', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    memoryId: (0, mysql_core_1.int)('memory_id')
        .notNull()
        .references(() => exports.memories.id, { onDelete: 'cascade' }),
    eventType: exports.memoryEventTypeEnum.notNull(),
    agentId: (0, mysql_core_1.int)('agent_id').references(() => agents_js_1.aiAgents.id, { onDelete: 'set null' }),
    projectId: (0, mysql_core_1.int)('project_id').references(() => projects_js_1.projects.id, { onDelete: 'set null' }),
    details: (0, mysql_core_1.json)('details'),
    consumed: (0, mysql_core_1.boolean)('consumed').default(false),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Relations
exports.memoriesRelations = (0, drizzle_orm_1.relations)(exports.memories, ({ one, many }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.memories.projectId],
        references: [projects_js_1.projects.id],
    }),
    agent: one(agents_js_1.aiAgents, {
        fields: [exports.memories.agentId],
        references: [agents_js_1.aiAgents.id],
    }),
    crossrefsAsSource: many(exports.memoryCrossrefs),
    events: many(exports.memoryEvents),
}));
exports.memoryCrossrefsRelations = (0, drizzle_orm_1.relations)(exports.memoryCrossrefs, ({ one }) => ({
    sourceMemory: one(exports.memories, {
        fields: [exports.memoryCrossrefs.sourceMemoryId],
        references: [exports.memories.id],
    }),
    targetMemory: one(exports.memories, {
        fields: [exports.memoryCrossrefs.targetMemoryId],
        references: [exports.memories.id],
    }),
}));
exports.memoryEventsRelations = (0, drizzle_orm_1.relations)(exports.memoryEvents, ({ one }) => ({
    memory: one(exports.memories, {
        fields: [exports.memoryEvents.memoryId],
        references: [exports.memories.id],
    }),
    agent: one(agents_js_1.aiAgents, {
        fields: [exports.memoryEvents.agentId],
        references: [agents_js_1.aiAgents.id],
    }),
    project: one(projects_js_1.projects, {
        fields: [exports.memoryEvents.projectId],
        references: [projects_js_1.projects.id],
    }),
}));
// Embedding job status enum
exports.embeddingJobStatusEnum = (0, mysql_core_1.mysqlEnum)('embedding_job_status', [
    'pending',
    'processing',
    'completed',
    'failed',
]);
// Embedding jobs table (Migration 002)
exports.embeddingJobs = (0, mysql_core_1.mysqlTable)('embedding_jobs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    memoryId: (0, mysql_core_1.int)('memory_id')
        .notNull()
        .references(() => exports.memories.id, { onDelete: 'cascade' }),
    status: exports.embeddingJobStatusEnum.default('pending'),
    attempts: (0, mysql_core_1.int)('attempts').default(0),
    lastError: (0, mysql_core_1.text)('last_error'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    startedAt: (0, mysql_core_1.timestamp)('started_at'),
    completedAt: (0, mysql_core_1.timestamp)('completed_at'),
});
// Embedding cache table (Migration 002)
exports.embeddingCache = (0, mysql_core_1.mysqlTable)('embedding_cache', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    queryHash: (0, mysql_core_1.varchar)('query_hash', { length: 64 }).notNull().unique(),
    queryText: (0, mysql_core_1.varchar)('query_text', { length: 512 }).notNull(),
    embedding: (0, mysql_core_1.json)('embedding').notNull(),
    hitCount: (0, mysql_core_1.int)('hit_count').default(1),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    lastAccessed: (0, mysql_core_1.timestamp)('last_accessed').defaultNow().onUpdateNow(),
});
// Embedding stats table (Migration 002)
exports.embeddingStats = (0, mysql_core_1.mysqlTable)('embedding_stats', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    date: (0, mysql_core_1.timestamp)('date').notNull(),
    embeddingsGenerated: (0, mysql_core_1.int)('embeddings_generated').default(0),
    searchesPerformed: (0, mysql_core_1.int)('searches_performed').default(0),
    cacheHits: (0, mysql_core_1.int)('cache_hits').default(0),
    avgSimilarity: (0, mysql_core_1.decimal)('avg_similarity', { precision: 5, scale: 4 }).default('0'),
    avgGenerationMs: (0, mysql_core_1.int)('avg_generation_ms').default(0),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Embedding jobs relations
exports.embeddingJobsRelations = (0, drizzle_orm_1.relations)(exports.embeddingJobs, ({ one }) => ({
    memory: one(exports.memories, {
        fields: [exports.embeddingJobs.memoryId],
        references: [exports.memories.id],
    }),
}));
//# sourceMappingURL=memories.js.map