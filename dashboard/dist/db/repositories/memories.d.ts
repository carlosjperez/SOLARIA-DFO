/**
 * SOLARIA DFO - Memories Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
import { type Memory, type NewMemory, type MemoryCrossref } from '../schema/index.js';
export declare function findAllMemories(filters?: {
    projectId?: number;
    agentId?: number;
    tags?: string[];
    query?: string;
    minImportance?: number;
    limit?: number;
    offset?: number;
}): Promise<{
    id: number;
    projectId: number | null;
    agentId: number | null;
    content: string;
    summary: string | null;
    metadata: unknown;
    tags: unknown;
    importance: string | null;
    accessCount: number | null;
    lastAccessed: Date | null;
    embedding: unknown;
    embeddingModel: string | null;
    embeddingVersion: number | null;
    embeddingGeneratedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}[]>;
export declare function findMemoryById(id: number): Promise<{
    id: number;
    projectId: number | null;
    agentId: number | null;
    content: string;
    summary: string | null;
    metadata: unknown;
    tags: unknown;
    importance: string | null;
    accessCount: number | null;
    lastAccessed: Date | null;
    embedding: unknown;
    embeddingModel: string | null;
    embeddingVersion: number | null;
    embeddingGeneratedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function searchMemories(searchQuery: string, limit?: number): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;
export declare function createMemory(data: NewMemory): Promise<Memory>;
export declare function updateMemory(id: number, data: Partial<NewMemory>): Promise<{
    id: number;
    projectId: number | null;
    agentId: number | null;
    content: string;
    summary: string | null;
    metadata: unknown;
    tags: unknown;
    importance: string | null;
    accessCount: number | null;
    lastAccessed: Date | null;
    embedding: unknown;
    embeddingModel: string | null;
    embeddingVersion: number | null;
    embeddingGeneratedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function deleteMemory(id: number): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;
export declare function boostImportance(id: number, amount?: number): Promise<{
    id: number;
    projectId: number | null;
    agentId: number | null;
    content: string;
    summary: string | null;
    metadata: unknown;
    tags: unknown;
    importance: string | null;
    accessCount: number | null;
    lastAccessed: Date | null;
    embedding: unknown;
    embeddingModel: string | null;
    embeddingVersion: number | null;
    embeddingGeneratedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function accessMemory(id: number): Promise<{
    id: number;
    projectId: number | null;
    agentId: number | null;
    content: string;
    summary: string | null;
    metadata: unknown;
    tags: unknown;
    importance: string | null;
    accessCount: number | null;
    lastAccessed: Date | null;
    embedding: unknown;
    embeddingModel: string | null;
    embeddingVersion: number | null;
    embeddingGeneratedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function findAllMemoryTags(): Promise<{
    id: number;
    name: string;
    description: string | null;
    parentTagId: number | null;
    usageCount: number | null;
    createdAt: Date | null;
}[]>;
export declare function getMemoryStats(): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;
export declare function findRelatedMemories(memoryId: number): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;
export declare function createCrossref(sourceId: number, targetId: number, relationshipType?: 'related' | 'depends_on' | 'contradicts' | 'supersedes' | 'child_of', strength?: number): Promise<MemoryCrossref>;
