/**
 * SOLARIA DFO - Standardized Repository Filter Types
 * Provides type-safe, reusable filter interfaces across all repositories
 *
 * Created: 2026-01-11
 * Phase: Architecture Optimization Phase 1
 */

// ============================================================================
// Base Filters (Reusable across all repositories)
// ============================================================================

/**
 * Pagination filter for limiting and offsetting query results
 */
export interface PaginationFilter {
    limit?: number;
    offset?: number;
}

/**
 * Sorting filter with column and direction
 */
export interface SortingFilter {
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

/**
 * Date range filter for time-based queries
 */
export interface DateRangeFilter {
    fromDate?: string;
    toDate?: string;
}

/**
 * Project scope filter for multi-tenancy
 */
export interface ProjectScopedFilter {
    projectId?: number;
}

/**
 * Agent scope filter for agent-specific queries
 */
export interface AgentScopedFilter {
    agentId?: number;
}

/**
 * User scope filter for user-specific queries
 */
export interface UserScopedFilter {
    userId?: number;
}

/**
 * Generic status filter with type parameter for specific status values
 * @template T - Status type (e.g., 'pending' | 'in_progress' | 'completed')
 */
export interface StatusFilter<T extends string = string> {
    status?: T;
}

/**
 * Priority filter for prioritized entities
 */
export interface PriorityFilter<T extends string = string> {
    priority?: T;
}

/**
 * Archived filter for soft-deleted entities
 */
export interface ArchivedFilter {
    archived?: boolean;
}

/**
 * Search query filter for full-text search
 */
export interface SearchFilter {
    query?: string;
    searchQuery?: string;
}

/**
 * Tags filter for tag-based filtering
 */
export interface TagsFilter {
    tags?: string[];
}

// ============================================================================
// Domain-Specific Filter Types
// ============================================================================

/**
 * Task-specific status values
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

/**
 * Task priority values
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Composite filter for task queries
 */
export type TaskFilters = PaginationFilter &
    SortingFilter &
    ProjectScopedFilter &
    AgentScopedFilter &
    StatusFilter<TaskStatus> &
    PriorityFilter<TaskPriority> & {
        sprintId?: number;
        epicId?: number;
        parentTaskId?: number;
        includeSubtasks?: boolean;
    };

/**
 * Project-specific status values
 */
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

/**
 * Project priority values
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Composite filter for project queries
 */
export type ProjectFilters = PaginationFilter &
    SortingFilter &
    StatusFilter<ProjectStatus> &
    PriorityFilter<ProjectPriority> &
    ArchivedFilter & {
        businessId?: number;
        ownerId?: number;
    };

/**
 * Sprint-specific status values
 */
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

/**
 * Composite filter for sprint queries
 */
export type SprintFilters = PaginationFilter &
    SortingFilter &
    ProjectScopedFilter &
    StatusFilter<SprintStatus> & {
        includeCompleted?: boolean;
    };

/**
 * Epic-specific status values
 */
export type EpicStatus = 'planning' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Composite filter for epic queries
 */
export type EpicFilters = PaginationFilter &
    SortingFilter &
    ProjectScopedFilter &
    StatusFilter<EpicStatus> & {
        sprintId?: number;
    };

/**
 * Memory importance range filter
 */
export interface MemoryImportanceFilter {
    minImportance?: number;
    maxImportance?: number;
}

/**
 * Composite filter for memory queries
 */
export type MemoryFilters = PaginationFilter &
    SortingFilter &
    ProjectScopedFilter &
    AgentScopedFilter &
    SearchFilter &
    TagsFilter &
    MemoryImportanceFilter;

/**
 * Alert severity values
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert status values
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

/**
 * Composite filter for alert queries
 */
export type AlertFilters = PaginationFilter &
    SortingFilter &
    ProjectScopedFilter &
    AgentScopedFilter &
    StatusFilter<AlertStatus> & {
        severity?: AlertSeverity;
        taskId?: number;
    };

/**
 * Activity log category values
 */
export type ActivityCategory = 'system' | 'security' | 'user' | 'agent' | 'api';

/**
 * Activity log level values
 */
export type ActivityLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

/**
 * Composite filter for activity log queries
 */
export type ActivityLogFilters = PaginationFilter &
    ProjectScopedFilter &
    AgentScopedFilter &
    UserScopedFilter &
    DateRangeFilter & {
        category?: ActivityCategory;
        level?: ActivityLevel;
        action?: string;
    };

/**
 * Agent status values
 */
export type AgentStatus = 'active' | 'inactive' | 'busy' | 'error';

/**
 * Composite filter for agent queries
 */
export type AgentFilters = PaginationFilter &
    SortingFilter &
    StatusFilter<AgentStatus> & {
        includeStats?: boolean;
    };

/**
 * Business/Client filters
 */
export type BusinessFilters = PaginationFilter &
    SortingFilter &
    SearchFilter &
    ArchivedFilter & {
        type?: 'client' | 'partner' | 'vendor';
    };

/**
 * Document type filter
 */
export type DocumentType = 'spec' | 'note' | 'report' | 'meeting' | 'decision' | 'other';

/**
 * Composite filter for document queries
 */
export type DocumentFilters = PaginationFilter &
    SortingFilter &
    ProjectScopedFilter &
    SearchFilter & {
        type?: DocumentType;
        authorId?: number;
    };

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract pagination config with safe defaults
 */
export function getPaginationConfig(filters?: PaginationFilter) {
    return {
        limit: Math.min(Math.max(filters?.limit || 100, 1), 500),
        offset: Math.max(filters?.offset || 0, 0)
    };
}

/**
 * Extract sorting config with allowed columns mapping
 */
export function getSortingConfig(
    filters: SortingFilter | undefined,
    allowedColumns: Record<string, string>,
    defaultColumn = 'created_at'
) {
    const column = allowedColumns[filters?.sortBy || defaultColumn] || allowedColumns[defaultColumn];
    const direction = (filters?.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';
    return { column, direction };
}

/**
 * Check if date range filter is provided
 */
export function hasDateRangeFilter(filters?: DateRangeFilter): boolean {
    return !!(filters?.fromDate || filters?.toDate);
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query?: string): string | undefined {
    if (!query || typeof query !== 'string') return undefined;
    const trimmed = query.trim();
    if (trimmed.length === 0) return undefined;
    // Remove SQL injection patterns
    return trimmed.replace(/[;'"\\]/g, '');
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if filters include pagination
 */
export function hasPagination(filters: unknown): filters is PaginationFilter {
    return typeof filters === 'object' && filters !== null &&
        ('limit' in filters || 'offset' in filters);
}

/**
 * Type guard to check if filters include sorting
 */
export function hasSorting(filters: unknown): filters is SortingFilter {
    return typeof filters === 'object' && filters !== null &&
        ('sortBy' in filters || 'sortOrder' in filters);
}

/**
 * Type guard to check if filters are project-scoped
 */
export function isProjectScoped(filters: unknown): filters is ProjectScopedFilter {
    return typeof filters === 'object' && filters !== null &&
        'projectId' in filters && typeof (filters as any).projectId === 'number';
}
