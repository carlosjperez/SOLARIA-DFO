/**
 * SOLARIA DFO - Memories Schema (Drizzle ORM)
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    decimal,
    timestamp,
    boolean,
    mysqlEnum,
    json,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects.js';
import { aiAgents } from './agents.js';

// Memories table
export const memories = mysqlTable('memories', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    agentId: int('agent_id').references(() => aiAgents.id, { onDelete: 'set null' }),
    content: text('content').notNull(),
    summary: varchar('summary', { length: 500 }),
    metadata: json('metadata'),
    tags: json('tags'),
    importance: decimal('importance', { precision: 3, scale: 2 }).default('0.50'),
    accessCount: int('access_count').default(0),
    lastAccessed: timestamp('last_accessed'),
    // Embedding columns (Migration 002)
    embedding: json('embedding'), // Vector embedding (384 dimensions)
    embeddingModel: varchar('embedding_model', { length: 100 }),
    embeddingVersion: int('embedding_version').default(1),
    embeddingGeneratedAt: timestamp('embedding_generated_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Memory tags table
export const memoryTags = mysqlTable('memory_tags', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    parentTagId: int('parent_tag_id'),
    usageCount: int('usage_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// Memory relationship types enum
export const relationshipTypeEnum = mysqlEnum('relationship_type', [
    'related',
    'depends_on',
    'contradicts',
    'supersedes',
    'child_of',
]);

// Memory cross-references table
export const memoryCrossrefs = mysqlTable('memory_crossrefs', {
    id: int('id').primaryKey().autoincrement(),
    sourceMemoryId: int('source_memory_id')
        .notNull()
        .references(() => memories.id, { onDelete: 'cascade' }),
    targetMemoryId: int('target_memory_id')
        .notNull()
        .references(() => memories.id, { onDelete: 'cascade' }),
    relationshipType: relationshipTypeEnum.default('related'),
    strength: decimal('strength', { precision: 3, scale: 2 }).default('0.50'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Memory event types enum
export const memoryEventTypeEnum = mysqlEnum('event_type', [
    'created',
    'updated',
    'deleted',
    'accessed',
    'shared',
]);

// Memory events table
export const memoryEvents = mysqlTable('memory_events', {
    id: int('id').primaryKey().autoincrement(),
    memoryId: int('memory_id')
        .notNull()
        .references(() => memories.id, { onDelete: 'cascade' }),
    eventType: memoryEventTypeEnum.notNull(),
    agentId: int('agent_id').references(() => aiAgents.id, { onDelete: 'set null' }),
    projectId: int('project_id').references(() => projects.id, { onDelete: 'set null' }),
    details: json('details'),
    consumed: boolean('consumed').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const memoriesRelations = relations(memories, ({ one, many }) => ({
    project: one(projects, {
        fields: [memories.projectId],
        references: [projects.id],
    }),
    agent: one(aiAgents, {
        fields: [memories.agentId],
        references: [aiAgents.id],
    }),
    crossrefsAsSource: many(memoryCrossrefs),
    events: many(memoryEvents),
}));

export const memoryCrossrefsRelations = relations(memoryCrossrefs, ({ one }) => ({
    sourceMemory: one(memories, {
        fields: [memoryCrossrefs.sourceMemoryId],
        references: [memories.id],
    }),
    targetMemory: one(memories, {
        fields: [memoryCrossrefs.targetMemoryId],
        references: [memories.id],
    }),
}));

export const memoryEventsRelations = relations(memoryEvents, ({ one }) => ({
    memory: one(memories, {
        fields: [memoryEvents.memoryId],
        references: [memories.id],
    }),
    agent: one(aiAgents, {
        fields: [memoryEvents.agentId],
        references: [aiAgents.id],
    }),
    project: one(projects, {
        fields: [memoryEvents.projectId],
        references: [projects.id],
    }),
}));

// Embedding job status enum
export const embeddingJobStatusEnum = mysqlEnum('embedding_job_status', [
    'pending',
    'processing',
    'completed',
    'failed',
]);

// Embedding jobs table (Migration 002)
export const embeddingJobs = mysqlTable('embedding_jobs', {
    id: int('id').primaryKey().autoincrement(),
    memoryId: int('memory_id')
        .notNull()
        .references(() => memories.id, { onDelete: 'cascade' }),
    status: embeddingJobStatusEnum.default('pending'),
    attempts: int('attempts').default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
});

// Embedding cache table (Migration 002)
export const embeddingCache = mysqlTable('embedding_cache', {
    id: int('id').primaryKey().autoincrement(),
    queryHash: varchar('query_hash', { length: 64 }).notNull().unique(),
    queryText: varchar('query_text', { length: 512 }).notNull(),
    embedding: json('embedding').notNull(),
    hitCount: int('hit_count').default(1),
    createdAt: timestamp('created_at').defaultNow(),
    lastAccessed: timestamp('last_accessed').defaultNow().onUpdateNow(),
});

// Embedding stats table (Migration 002)
export const embeddingStats = mysqlTable('embedding_stats', {
    id: int('id').primaryKey().autoincrement(),
    date: timestamp('date').notNull(),
    embeddingsGenerated: int('embeddings_generated').default(0),
    searchesPerformed: int('searches_performed').default(0),
    cacheHits: int('cache_hits').default(0),
    avgSimilarity: decimal('avg_similarity', { precision: 5, scale: 4 }).default('0'),
    avgGenerationMs: int('avg_generation_ms').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Embedding jobs relations
export const embeddingJobsRelations = relations(embeddingJobs, ({ one }) => ({
    memory: one(memories, {
        fields: [embeddingJobs.memoryId],
        references: [memories.id],
    }),
}));

// Type exports
export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;
export type MemoryTag = typeof memoryTags.$inferSelect;
export type MemoryCrossref = typeof memoryCrossrefs.$inferSelect;
export type MemoryEvent = typeof memoryEvents.$inferSelect;
export type EmbeddingJob = typeof embeddingJobs.$inferSelect;
export type NewEmbeddingJob = typeof embeddingJobs.$inferInsert;
export type EmbeddingCache = typeof embeddingCache.$inferSelect;
export type EmbeddingStats = typeof embeddingStats.$inferSelect;
