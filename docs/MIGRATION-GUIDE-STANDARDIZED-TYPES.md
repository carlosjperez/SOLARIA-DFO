# Migration Guide: Standardized Filter Types

**Date:** 2026-01-11
**Phase:** Architecture Optimization Phase 1
**Status:** Implementation Guide
**Related:** ARCHITECTURE-REVIEW-POST-DRIZZLE.md

---

## Overview

This guide documents the new standardized filter type system introduced in Phase 1 of the architecture optimization. All repositories should gradually adopt these types for consistency and type safety.

---

## What Changed

### Before (Ad-hoc filter types)

Each repository defined its own filter interfaces:

```typescript
// tasks.ts
export async function findTasksWithDetails(filters: {
    projectId?: number;
    agentId?: number;
    status?: string;
    sortColumn: string;
    sortDirection: 'ASC' | 'DESC';
    limit: number;
}) {
    // ...
}

// memories.ts
export async function searchMemories(filters: {
    query: string;
    projectId?: number;
    tags?: string[];
    minImportance: number;
    limit: number;
}) {
    // ...
}
```

**Problems:**
- ❌ Inconsistent naming (`projectId` vs `project_id`)
- ❌ No type constraints on status values
- ❌ Repeated interface definitions
- ❌ No utility functions for common patterns

### After (Standardized types)

Import from centralized type definitions:

```typescript
import type { TaskFilters, TaskStatus } from './types/filters.js';

export async function findTasksWithDetails(filters: TaskFilters) {
    // TypeScript now knows:
    // - filters.projectId is number | undefined
    // - filters.status is TaskStatus | undefined ('pending' | 'in_progress' | ...)
    // - filters.limit is number | undefined
    // - filters.sortBy is string | undefined
    // - filters.sortOrder is 'ASC' | 'DESC' | undefined
}
```

**Benefits:**
- ✅ Type-safe status enums
- ✅ Consistent naming across repositories
- ✅ Reusable filter components
- ✅ Utility functions included
- ✅ Better IDE autocomplete

---

## Available Filter Types

### Base Filters (Composable)

```typescript
import type {
    PaginationFilter,      // { limit?, offset? }
    SortingFilter,         // { sortBy?, sortOrder? }
    DateRangeFilter,       // { fromDate?, toDate? }
    ProjectScopedFilter,   // { projectId? }
    AgentScopedFilter,     // { agentId? }
    UserScopedFilter,      // { userId? }
    StatusFilter,          // { status? } - generic
    PriorityFilter,        // { priority? } - generic
    ArchivedFilter,        // { archived? }
    SearchFilter,          // { query?, searchQuery? }
    TagsFilter             // { tags?: string[] }
} from './types/filters.js';
```

### Domain-Specific Composite Types

```typescript
import type {
    TaskFilters,          // Full task filter interface
    TaskStatus,           // 'pending' | 'in_progress' | ...
    TaskPriority,         // 'low' | 'medium' | 'high' | 'critical'

    ProjectFilters,       // Full project filter interface
    ProjectStatus,        // 'planning' | 'active' | ...

    SprintFilters,        // Full sprint filter interface
    SprintStatus,         // 'planning' | 'active' | ...

    EpicFilters,          // Full epic filter interface

    MemoryFilters,        // Full memory filter interface

    AlertFilters,         // Full alert filter interface
    AlertSeverity,        // 'low' | 'medium' | 'high' | 'critical'

    ActivityLogFilters,   // Full activity log filter interface
    ActivityCategory,     // 'system' | 'security' | 'user' | ...

    AgentFilters,         // Full agent filter interface
    AgentStatus,          // 'active' | 'inactive' | 'busy' | 'error'

    DocumentFilters       // Full document filter interface
} from './types/filters.js';
```

### Utility Functions

```typescript
import {
    getPaginationConfig,     // Extract pagination with safe defaults
    getSortingConfig,        // Extract sorting with column whitelist
    hasDateRangeFilter,      // Check if date range is provided
    sanitizeSearchQuery,     // Clean search query for SQL
    hasPagination,           // Type guard
    hasSorting,              // Type guard
    isProjectScoped          // Type guard
} from './types/filters.js';
```

---

## Migration Examples

### Example 1: Simple Repository (sprints.ts)

**Before:**
```typescript
export async function findAllSprints(filters?: {
    projectId?: number;
    status?: string;
}) {
    const conditions = [];
    if (filters?.projectId) {
        conditions.push(eq(sprints.projectId, filters.projectId));
    }
    if (filters?.status) {
        conditions.push(sql`${sprints.status} = ${filters.status}`);
    }
    // ...
}
```

**After:**
```typescript
import type { SprintFilters, SprintStatus } from './types/filters.js';

export async function findAllSprints(filters?: SprintFilters) {
    const conditions = [];
    if (filters?.projectId) {
        conditions.push(eq(sprints.projectId, filters.projectId));
    }
    if (filters?.status) {
        // TypeScript now validates status is a valid SprintStatus value
        conditions.push(eq(sprints.status, filters.status));
    }
    // ...
}
```

### Example 2: Complex Repository with Utilities

**Before:**
```typescript
export async function findMemories(filters: {
    query?: string;
    projectId?: number;
    tags?: string[];
    limit?: number;
    offset?: number;
}) {
    const safeLimit = Math.min(Math.max(filters.limit || 100, 1), 500);
    const safeOffset = Math.max(filters.offset || 0, 0);

    // Sanitize query
    const cleanQuery = filters.query?.trim().replace(/[;'"\\]/g, '');

    // ... query building
}
```

**After:**
```typescript
import type { MemoryFilters } from './types/filters.js';
import { getPaginationConfig, sanitizeSearchQuery } from './types/filters.js';

export async function findMemories(filters: MemoryFilters) {
    const { limit, offset } = getPaginationConfig(filters);
    const cleanQuery = sanitizeSearchQuery(filters.query);

    // ... query building
}
```

### Example 3: Sorting with Column Whitelist

**Before:**
```typescript
const allowedSortColumns: Record<string, string> = {
    'created_at': 't.created_at',
    'updated_at': 't.updated_at',
    'title': 't.title',
    'priority': 't.priority'
};

const sortColumn = allowedSortColumns[sort_by as string] || 't.created_at';
const sortDirection = (sort_order as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
```

**After:**
```typescript
import { getSortingConfig } from './types/filters.js';

const allowedSortColumns: Record<string, string> = {
    'created_at': 't.created_at',
    'updated_at': 't.updated_at',
    'title': 't.title',
    'priority': 't.priority'
};

const { column: sortColumn, direction: sortDirection } = getSortingConfig(
    filters,
    allowedSortColumns,
    'created_at'
);
```

---

## Type Safety Examples

### Before: No Type Safety

```typescript
// No compile-time error, but will cause runtime issues:
findTasks({ status: 'invalid-status' });
```

### After: Compile-Time Safety

```typescript
import type { TaskFilters } from './types/filters.js';

// ✅ TypeScript error: Type '"invalid-status"' is not assignable to type 'TaskStatus'
findTasks({ status: 'invalid-status' });

// ✅ Valid:
findTasks({ status: 'pending' });
findTasks({ status: 'in_progress' });
```

---

## Custom Domain Types

For repositories with unique filtering needs, compose base types:

```typescript
import type {
    PaginationFilter,
    ProjectScopedFilter,
    SearchFilter
} from './types/filters.js';

// Custom composite type
export type CustomReportFilters = PaginationFilter &
    ProjectScopedFilter &
    SearchFilter & {
        reportType: 'daily' | 'weekly' | 'monthly';
        includeArchived?: boolean;
    };
```

---

## Migration Checklist

For each repository file:

- [ ] Import relevant filter types from `./types/filters.js`
- [ ] Replace ad-hoc filter interfaces with standard types
- [ ] Use utility functions for common patterns (pagination, sorting)
- [ ] Update function signatures to use typed filters
- [ ] Remove duplicate pagination/sorting logic
- [ ] Add `Updated:` comment in file header

---

## Testing

Existing tests should continue to work without changes since the types are compatible:

```typescript
// Still works:
await findTasks({
    projectId: 1,
    status: 'pending',
    limit: 10
});
```

For new tests, leverage TypeScript for better assertions:

```typescript
import type { TaskFilters, TaskStatus } from '../types/filters.js';

// Type-safe test data
const filters: TaskFilters = {
    projectId: 1,
    status: 'pending' as TaskStatus,  // Explicit cast for clarity
    limit: 10
};

const tasks = await findTasks(filters);
expect(tasks).toHaveLength(10);
```

---

## Performance Index Migration

Along with type standardization, apply the performance indexes:

```bash
# Connect to database
mysql -u root -p solaria_construction

# Apply migration
source infrastructure/database/migrations/007_performance_indexes.sql

# Verify indexes
SHOW INDEX FROM tasks;
SHOW INDEX FROM memories;
```

**Expected improvements:**
- Task queries: ~30-40% faster
- Memory search: ~25-35% faster
- Activity logs: ~20-30% faster
- Overall API latency: -15% average

---

## Rollout Strategy

**Phase 1 (Week 1):** High-traffic repositories
- ✅ sprints.ts (completed)
- [ ] tasks.ts
- [ ] projects.ts
- [ ] memories.ts

**Phase 2 (Week 2):** Medium-traffic repositories
- [ ] alerts.ts
- [ ] activity-logs.ts
- [ ] agents.ts
- [ ] epics.ts

**Phase 3 (Week 3):** Remaining repositories
- [ ] businesses.ts
- [ ] users.ts
- [ ] permissions.ts
- [ ] inlineDocuments.ts
- [ ] dashboard.ts
- [ ] csuite.ts

---

## Support

For questions or issues with the new type system:

1. Review `dashboard/db/repositories/types/filters.ts` for full type definitions
2. Check `sprints.ts` for a working example
3. Refer to `ARCHITECTURE-REVIEW-POST-DRIZZLE.md` for context

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Author:** ECO-Lambda (Agent 11)
**Phase:** Architecture Optimization Phase 1
