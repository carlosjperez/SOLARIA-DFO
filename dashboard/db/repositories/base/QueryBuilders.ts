/**
 * SOLARIA DFO - Query Builder Helpers
 * Reusable Drizzle ORM query building utilities
 *
 * Created: 2026-01-11
 * Phase: Architecture Optimization Phase 2.4
 *
 * Purpose: Extract common query patterns into reusable helpers
 */

import { and, eq, gte, lte, sql, type SQL } from 'drizzle-orm';
import type { MySqlTable } from 'drizzle-orm/mysql-core';

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Safe pagination configuration
 * Clamps limit and offset to safe ranges
 *
 * @example
 * ```typescript
 * const { limit, offset } = getPaginationConfig({ limit: 9999, offset: -10 });
 * // Returns: { limit: 500, offset: 0 }
 * ```
 */
export interface PaginationConfig {
    limit?: number;
    offset?: number;
}

export function getPaginationConfig(config?: PaginationConfig) {
    const limit = Math.min(Math.max(config?.limit || 100, 1), 500);
    const offset = Math.max(config?.offset || 0, 0);
    return { limit, offset };
}

/**
 * Calculate pagination metadata for API responses
 *
 * @example
 * ```typescript
 * const meta = getPaginationMetadata(150, 10, 20);
 * // Returns: { total: 150, page: 1, pageSize: 20, totalPages: 8, hasNext: true }
 * ```
 */
export function getPaginationMetadata(
    totalCount: number,
    offset: number,
    limit: number
) {
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = offset + limit < totalCount;
    const hasPrev = offset > 0;

    return {
        total: totalCount,
        page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrev,
    };
}

// ============================================================================
// Dynamic WHERE Clause Builders
// ============================================================================

/**
 * Build project-scoped WHERE clause
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addProjectScope(conditions, tasks, 123);
 * // Adds: eq(tasks.projectId, 123)
 * ```
 */
export function addProjectScope(
    conditions: SQL[],
    table: MySqlTable<any>,
    projectId?: number
): void {
    if (projectId) {
        conditions.push(eq((table as any).projectId, projectId));
    }
}

/**
 * Build agent-scoped WHERE clause
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addAgentScope(conditions, tasks, 11);
 * // Adds: eq(tasks.assignedAgentId, 11) or eq(tasks.agentId, 11)
 * ```
 */
export function addAgentScope(
    conditions: SQL[],
    table: MySqlTable<any>,
    agentId?: number,
    columnName: 'agentId' | 'assignedAgentId' = 'agentId'
): void {
    if (agentId) {
        conditions.push(eq((table as any)[columnName], agentId));
    }
}

/**
 * Build status filter WHERE clause (using sql template for enums)
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addStatusFilter(conditions, tasks, 'in_progress');
 * // Adds: sql`${tasks.status} = 'in_progress'`
 * ```
 */
export function addStatusFilter(
    conditions: SQL[],
    table: MySqlTable<any>,
    status?: string
): void {
    if (status) {
        conditions.push(sql`${(table as any).status} = ${status}`);
    }
}

/**
 * Build priority filter WHERE clause
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addPriorityFilter(conditions, tasks, 'high');
 * ```
 */
export function addPriorityFilter(
    conditions: SQL[],
    table: MySqlTable<any>,
    priority?: string
): void {
    if (priority) {
        conditions.push(sql`${(table as any).priority} = ${priority}`);
    }
}

/**
 * Build date range WHERE clause
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addDateRangeFilter(conditions, tasks, 'createdAt', '2024-01-01', '2024-12-31');
 * // Adds: gte(tasks.createdAt, '2024-01-01'), lte(tasks.createdAt, '2024-12-31')
 * ```
 */
export function addDateRangeFilter(
    conditions: SQL[],
    table: MySqlTable<any>,
    columnName: string,
    fromDate?: string,
    toDate?: string
): void {
    if (fromDate) {
        conditions.push(gte((table as any)[columnName], fromDate));
    }
    if (toDate) {
        conditions.push(lte((table as any)[columnName], toDate));
    }
}

/**
 * Build search filter for text fields
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addSearchFilter(conditions, tasks, 'title', 'bug fix');
 * // Adds: sql`${tasks.title} LIKE '%bug fix%'`
 * ```
 */
export function addSearchFilter(
    conditions: SQL[],
    table: MySqlTable<any>,
    columnName: string,
    query?: string
): void {
    if (query && query.trim().length > 0) {
        const sanitized = query.trim().replace(/[;'"\\]/g, '');
        conditions.push(sql`${(table as any)[columnName]} LIKE ${`%${sanitized}%`}`);
    }
}

/**
 * Build archived/deleted filter
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addArchivedFilter(conditions, projects, false);
 * // Adds: eq(projects.archived, 0)
 * ```
 */
export function addArchivedFilter(
    conditions: SQL[],
    table: MySqlTable<any>,
    includeArchived: boolean = false,
    columnName: string = 'archived'
): void {
    if (!includeArchived) {
        conditions.push(eq((table as any)[columnName], 0));
    }
}

// ============================================================================
// Common Query Patterns
// ============================================================================

/**
 * Build standard WHERE clause from array of conditions
 * Returns undefined if no conditions (for optional WHERE)
 *
 * @example
 * ```typescript
 * const conditions = [];
 * addProjectScope(conditions, tasks, 123);
 * addStatusFilter(conditions, tasks, 'pending');
 *
 * const whereClause = buildWhereClause(conditions);
 * // Returns: and(eq(tasks.projectId, 123), sql`...`)
 *
 * const query = db.select().from(tasks).where(whereClause);
 * ```
 */
export function buildWhereClause(conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return and(...conditions);
}

/**
 * Sanitize search query for SQL LIKE
 * Removes dangerous characters
 *
 * @example
 * ```typescript
 * const safe = sanitizeSearchQuery("O'Reilly; DROP TABLE");
 * // Returns: "OReilly DROP TABLE"
 * ```
 */
export function sanitizeSearchQuery(query?: string): string | undefined {
    if (!query || typeof query !== 'string') return undefined;
    const trimmed = query.trim();
    if (trimmed.length === 0) return undefined;
    return trimmed.replace(/[;'"\\]/g, '');
}

/**
 * Build sorting configuration with column whitelist
 *
 * @example
 * ```typescript
 * const allowedColumns = {
 *     'created_at': 'tasks.created_at',
 *     'priority': 'tasks.priority',
 *     'title': 'tasks.title'
 * };
 *
 * const { column, direction } = getSortingConfig(
 *     { sortBy: 'priority', sortOrder: 'DESC' },
 *     allowedColumns,
 *     'created_at'
 * );
 * // Returns: { column: 'tasks.priority', direction: 'DESC' }
 * ```
 */
export interface SortingConfig {
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export function getSortingConfig(
    config: SortingConfig | undefined,
    allowedColumns: Record<string, string>,
    defaultColumn = 'created_at'
): { column: string; direction: 'ASC' | 'DESC' } {
    const sortBy = config?.sortBy || defaultColumn;
    const column = allowedColumns[sortBy] || allowedColumns[defaultColumn];
    const direction = (config?.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';

    return { column, direction };
}

// ============================================================================
// Complex Filter Builders
// ============================================================================

/**
 * Build filters for task queries
 * Common pattern used in tasks.ts
 *
 * @example
 * ```typescript
 * const conditions = buildTaskFilters(tasks, {
 *     projectId: 1,
 *     status: 'in_progress',
 *     priority: 'high',
 *     agentId: 11
 * });
 * ```
 */
export interface TaskFiltersConfig {
    projectId?: number;
    sprintId?: number;
    epicId?: number;
    status?: string;
    priority?: string;
    agentId?: number;
    parentTaskId?: number;
}

export function buildTaskFilters(
    table: MySqlTable<any>,
    filters: TaskFiltersConfig
): SQL[] {
    const conditions: SQL[] = [];

    addProjectScope(conditions, table, filters.projectId);
    addStatusFilter(conditions, table, filters.status);
    addPriorityFilter(conditions, table, filters.priority);
    addAgentScope(conditions, table, filters.agentId, 'assignedAgentId');

    if (filters.sprintId) {
        conditions.push(eq((table as any).sprintId, filters.sprintId));
    }
    if (filters.epicId) {
        conditions.push(eq((table as any).epicId, filters.epicId));
    }
    if (filters.parentTaskId) {
        conditions.push(eq((table as any).parentTaskId, filters.parentTaskId));
    }

    return conditions;
}

/**
 * Build filters for memory/log queries
 * Common pattern used in memories.ts, activity-logs.ts
 *
 * @example
 * ```typescript
 * const conditions = buildLogFilters(activityLogs, {
 *     projectId: 1,
 *     agentId: 11,
 *     level: 'error',
 *     fromDate: '2024-01-01',
 *     toDate: '2024-12-31'
 * });
 * ```
 */
export interface LogFiltersConfig {
    projectId?: number;
    agentId?: number;
    category?: string;
    level?: string;
    fromDate?: string;
    toDate?: string;
}

export function buildLogFilters(
    table: MySqlTable<any>,
    filters: LogFiltersConfig
): SQL[] {
    const conditions: SQL[] = [];

    addProjectScope(conditions, table, filters.projectId);
    addAgentScope(conditions, table, filters.agentId);

    if (filters.category) {
        conditions.push(sql`${(table as any).category} = ${filters.category}`);
    }
    if (filters.level) {
        conditions.push(sql`${(table as any).level} = ${filters.level}`);
    }

    addDateRangeFilter(conditions, table, 'createdAt', filters.fromDate, filters.toDate);

    return conditions;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if config has pagination
 */
export function hasPagination(config: any): config is PaginationConfig {
    return config && ('limit' in config || 'offset' in config);
}

/**
 * Check if config has sorting
 */
export function hasSorting(config: any): config is SortingConfig {
    return config && ('sortBy' in config || 'sortOrder' in config);
}

/**
 * Check if config has date range
 */
export function hasDateRange(config: any): config is { fromDate?: string; toDate?: string } {
    return config && ('fromDate' in config || 'toDate' in config);
}
