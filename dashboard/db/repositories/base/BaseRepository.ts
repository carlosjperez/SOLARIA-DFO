/**
 * SOLARIA DFO - Base Repository Pattern
 * Generic CRUD operations for all entity repositories
 *
 * Created: 2026-01-11
 * Phase: Architecture Optimization Phase 2
 *
 * Purpose: Eliminate code duplication across 18 repositories
 * Pattern: Active Record-style base class with Drizzle ORM
 */

import { db } from '../../index.js';
import { eq, desc, and, sql, type SQL } from 'drizzle-orm';
import type { MySqlTable } from 'drizzle-orm/mysql-core';

/**
 * Base Repository providing common CRUD operations
 *
 * @template TEntity - The entity type (e.g., Task, Project, Sprint)
 * @template TInsert - The insert type (e.g., NewTask, NewProject)
 * @template TTable - The Drizzle table schema type
 *
 * @example
 * ```typescript
 * class SprintsRepository extends BaseRepository<Sprint, NewSprint, typeof sprints> {
 *     constructor() {
 *         super(sprints, 'Sprint');
 *     }
 *
 *     // Add domain-specific methods here
 *     async findByProjectAndStatus(projectId: number, status: string) {
 *         return this.findMany([
 *             eq(this.table.projectId, projectId),
 *             eq(this.table.status, status)
 *         ]);
 *     }
 * }
 * ```
 */
export abstract class BaseRepository<
    TEntity = any,
    TInsert = any,
    TTable extends MySqlTable<any> = any
> {
    /**
     * @param table - Drizzle table schema (e.g., sprints, epics, alerts)
     * @param entityName - Human-readable entity name for error messages
     */
    constructor(
        protected readonly table: TTable,
        protected readonly entityName: string = 'Entity'
    ) {}

    // ========================================================================
    // Core CRUD Operations
    // ========================================================================

    /**
     * Find entity by ID
     *
     * @param id - Entity primary key
     * @returns Entity or null if not found
     *
     * @example
     * ```typescript
     * const sprint = await sprintsRepo.findById(123);
     * if (!sprint) throw new Error('Sprint not found');
     * ```
     */
    async findById(id: number): Promise<TEntity | null> {
        const result = await db
            .select()
            .from(this.table)
            .where(eq((this.table as any).id, id))
            .limit(1);

        return (result[0] as TEntity) || null;
    }

    /**
     * Find all entities with optional limit
     *
     * @param limit - Maximum number of results (default: 100, max: 500)
     * @returns Array of entities
     *
     * @example
     * ```typescript
     * const allSprints = await sprintsRepo.findAll();
     * const top10 = await sprintsRepo.findAll(10);
     * ```
     */
    async findAll(limit = 100): Promise<TEntity[]> {
        const safeLimit = Math.min(Math.max(limit, 1), 500);

        const result = await db
            .select()
            .from(this.table)
            .orderBy(desc((this.table as any).updatedAt || (this.table as any).createdAt))
            .limit(safeLimit);

        return result as TEntity[];
    }

    /**
     * Find entities matching multiple conditions
     *
     * @param conditions - Array of Drizzle SQL conditions
     * @param limit - Maximum number of results
     * @returns Array of matching entities
     *
     * @example
     * ```typescript
     * const activeSprints = await sprintsRepo.findMany([
     *     eq(sprints.projectId, 1),
     *     eq(sprints.status, 'active')
     * ]);
     * ```
     */
    async findMany(
        conditions: SQL[],
        limit = 100
    ): Promise<TEntity[]> {
        const safeLimit = Math.min(Math.max(limit, 1), 500);

        let query = db
            .select()
            .from(this.table);

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        const result = await query
            .orderBy(desc((this.table as any).updatedAt || (this.table as any).createdAt))
            .limit(safeLimit);

        return result as TEntity[];
    }

    /**
     * Find first entity matching condition
     *
     * @param condition - Drizzle SQL condition
     * @returns First matching entity or null
     *
     * @example
     * ```typescript
     * const sprint = await sprintsRepo.findOne(
     *     eq(sprints.name, 'Sprint 1')
     * );
     * ```
     */
    async findOne(condition: SQL): Promise<TEntity | null> {
        const result = await db
            .select()
            .from(this.table)
            .where(condition)
            .limit(1);

        return (result[0] as TEntity) || null;
    }

    /**
     * Create new entity
     *
     * @param data - Entity data to insert
     * @returns Created entity with generated ID
     *
     * @example
     * ```typescript
     * const newSprint = await sprintsRepo.create({
     *     projectId: 1,
     *     name: 'Sprint 10',
     *     status: 'planning'
     * });
     * console.log(newSprint.id); // Auto-generated ID
     * ```
     */
    async create(data: TInsert): Promise<TEntity> {
        const result = await db
            .insert(this.table)
            .values(data as any);

        const insertId = result[0].insertId;

        // Fetch the created entity to return it with all fields
        const created = await this.findById(insertId);

        if (!created) {
            throw new Error(`Failed to create ${this.entityName}: Insert succeeded but entity not found`);
        }

        return created;
    }

    /**
     * Update entity by ID
     *
     * @param id - Entity primary key
     * @param data - Partial entity data to update
     * @returns Updated entity or null if not found
     *
     * @example
     * ```typescript
     * const updated = await sprintsRepo.update(123, {
     *     status: 'active',
     *     startDate: new Date()
     * });
     * ```
     */
    async update(id: number, data: Partial<TInsert>): Promise<TEntity | null> {
        await db
            .update(this.table)
            .set(data as any)
            .where(eq((this.table as any).id, id));

        return this.findById(id);
    }

    /**
     * Delete entity by ID
     *
     * @param id - Entity primary key
     * @returns True if deleted, false if not found
     *
     * @example
     * ```typescript
     * const deleted = await sprintsRepo.delete(123);
     * if (deleted) {
     *     console.log('Sprint deleted successfully');
     * }
     * ```
     */
    async delete(id: number): Promise<boolean> {
        const entity = await this.findById(id);
        if (!entity) return false;

        await db
            .delete(this.table)
            .where(eq((this.table as any).id, id));

        return true;
    }

    /**
     * Check if entity exists by ID
     *
     * @param id - Entity primary key
     * @returns True if exists, false otherwise
     *
     * @example
     * ```typescript
     * if (!await sprintsRepo.exists(123)) {
     *     throw new Error('Sprint not found');
     * }
     * ```
     */
    async exists(id: number): Promise<boolean> {
        const entity = await this.findById(id);
        return entity !== null;
    }

    /**
     * Count total entities
     *
     * @param conditions - Optional array of conditions to filter count
     * @returns Total count
     *
     * @example
     * ```typescript
     * const totalSprints = await sprintsRepo.count();
     * const activeSprints = await sprintsRepo.count([
     *     eq(sprints.status, 'active')
     * ]);
     * ```
     */
    async count(conditions?: SQL[]): Promise<number> {
        let query = db
            .select({ count: sql`COUNT(*)` })
            .from(this.table);

        if (conditions && conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        const result = await query;
        return Number(result[0]?.count || 0);
    }

    // ========================================================================
    // Utility Methods
    // ========================================================================

    /**
     * Get table name (for debugging/logging)
     */
    getTableName(): string {
        return (this.table as any)[Symbol.for('drizzle:Name')] || this.entityName;
    }

    /**
     * Log repository action (for debugging)
     */
    protected log(action: string, details?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${this.entityName}Repository] ${action}`, details || '');
        }
    }
}

/**
 * Type helper for repository instances
 */
export type RepositoryInstance<TEntity, TInsert, TTable extends MySqlTable<any>> =
    BaseRepository<TEntity, TInsert, TTable>;
