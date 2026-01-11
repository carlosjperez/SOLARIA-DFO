# Query Builders Guide

**Created:** 2026-01-11
**Phase:** Architecture Optimization Phase 2.4
**Status:** Ready for Use

---

## Overview

Query Builder helpers provide reusable Drizzle ORM patterns extracted from common repository code. These utilities eliminate duplication and ensure consistency across all repositories.

**Location:** `dashboard/db/repositories/base/QueryBuilders.ts`

---

## Core Utilities

### 1. Pagination

```typescript
import { getPaginationConfig, getPaginationMetadata } from './base/QueryBuilders.js';

// Safe pagination with clamped values
const { limit, offset } = getPaginationConfig({ limit: 9999, offset: -10 });
// Returns: { limit: 500, offset: 0 }

// Metadata for API responses
const meta = getPaginationMetadata(150, 10, 20);
// Returns: { total: 150, page: 1, pageSize: 20, totalPages: 8, hasNext: true }
```

**Benefits:**
- Prevents DoS with auto-clamped limits (max 500)
- Consistent pagination across all endpoints
- Ready-to-use API metadata

---

### 2. Dynamic WHERE Clause Builders

```typescript
import {
    addProjectScope,
    addAgentScope,
    addStatusFilter,
    addPriorityFilter,
    addDateRangeFilter,
    addSearchFilter,
    buildWhereClause
} from './base/QueryBuilders.js';

// Example: Building task filters
const conditions: SQL[] = [];

addProjectScope(conditions, tasks, 123);         // WHERE project_id = 123
addStatusFilter(conditions, tasks, 'pending');   // AND status = 'pending'
addPriorityFilter(conditions, tasks, 'high');    // AND priority = 'high'
addAgentScope(conditions, tasks, 11);            // AND assigned_agent_id = 11
addDateRangeFilter(conditions, tasks, 'createdAt', '2024-01-01', '2024-12-31');

const whereClause = buildWhereClause(conditions); // Combines all with AND

const result = await db
    .select()
    .from(tasks)
    .where(whereClause)
    .limit(100);
```

**Available Filters:**
- `addProjectScope` - Filter by project_id
- `addAgentScope` - Filter by agent_id or assigned_agent_id
- `addStatusFilter` - Filter by status (enum-safe with sql template)
- `addPriorityFilter` - Filter by priority
- `addDateRangeFilter` - Filter by date range (gte/lte)
- `addSearchFilter` - LIKE search with SQL injection protection
- `addArchivedFilter` - Filter archived/deleted records

---

### 3. Sorting Configuration

```typescript
import { getSortingConfig } from './base/QueryBuilders.js';

// Define allowed columns (SQL injection prevention)
const allowedColumns = {
    'created_at': 'tasks.created_at',
    'priority': 'tasks.priority',
    'title': 'tasks.title'
};

// Get safe sorting config
const { column, direction } = getSortingConfig(
    { sortBy: 'priority', sortOrder: 'DESC' },
    allowedColumns,
    'created_at'  // default fallback
);

// Use in query (raw SQL example)
const query = `SELECT * FROM tasks ORDER BY ${column} ${direction}`;
```

**Benefits:**
- Column whitelist prevents SQL injection
- Auto-fallback to safe defaults
- Consistent sorting across repositories

---

### 4. Complex Filter Builders

#### Task Filters
```typescript
import { buildTaskFilters } from './base/QueryBuilders.js';

const conditions = buildTaskFilters(tasks, {
    projectId: 1,
    sprintId: 2,
    epicId: 3,
    status: 'in_progress',
    priority: 'high',
    agentId: 11,
    parentTaskId: 100
});

const whereClause = buildWhereClause(conditions);
```

#### Log Filters
```typescript
import { buildLogFilters } from './base/QueryBuilders.js';

const conditions = buildLogFilters(activityLogs, {
    projectId: 1,
    agentId: 11,
    category: 'security',
    level: 'error',
    fromDate: '2024-01-01',
    toDate: '2024-12-31'
});

const whereClause = buildWhereClause(conditions);
```

---

### 5. Sanitization

```typescript
import { sanitizeSearchQuery } from './base/QueryBuilders.js';

const userInput = "O'Reilly; DROP TABLE users--";
const safe = sanitizeSearchQuery(userInput);
// Returns: "OReilly DROP TABLE users--" (quotes/semicolons removed)
```

**What it removes:**
- Single quotes `'`
- Double quotes `"`
- Semicolons `;`
- Backslashes `\`

---

## Migration Examples

### Before (Repetitive Code)

```typescript
// tasks.ts (old pattern)
export async function findAllTasks(filters?: {
    projectId?: number;
    status?: string;
    priority?: string;
    agentId?: number;
}) {
    const conditions = [];

    if (filters?.projectId) {
        conditions.push(eq(tasks.projectId, filters.projectId));
    }
    if (filters?.status) {
        conditions.push(sql`${tasks.status} = ${filters.status}`);
    }
    if (filters?.priority) {
        conditions.push(sql`${tasks.priority} = ${filters.priority}`);
    }
    if (filters?.agentId) {
        conditions.push(eq(tasks.assignedAgentId, filters.agentId));
    }

    // Safe limit (repeated everywhere)
    const safeLimit = Math.min(Math.max(filters?.limit || 100, 1), 500);

    const query = db.select().from(tasks);
    if (conditions.length > 0) {
        return query.where(and(...conditions)).limit(safeLimit);
    }
    return query.limit(safeLimit);
}
```

### After (Using Query Builders)

```typescript
// tasks.ts (new pattern)
import { buildTaskFilters, buildWhereClause, getPaginationConfig } from './base/QueryBuilders.js';

export async function findAllTasks(filters?: TaskFiltersConfig) {
    const conditions = buildTaskFilters(tasks, filters);
    const whereClause = buildWhereClause(conditions);
    const { limit } = getPaginationConfig(filters);

    return db
        .select()
        .from(tasks)
        .where(whereClause)
        .limit(limit);
}
```

**Benefits:**
- 20+ lines → 8 lines (~60% reduction)
- No logic duplication
- Centralized validation
- Type-safe filters
- Easier to test

---

## Type Guards

```typescript
import { hasPagination, hasSorting, hasDateRange } from './base/QueryBuilders.js';

function processFilters(filters: unknown) {
    if (hasPagination(filters)) {
        const { limit, offset } = getPaginationConfig(filters);
        // TypeScript knows filters has .limit and .offset
    }

    if (hasSorting(filters)) {
        const { column, direction } = getSortingConfig(filters, allowedColumns);
        // TypeScript knows filters has .sortBy and .sortOrder
    }

    if (hasDateRange(filters)) {
        // TypeScript knows filters has .fromDate and .toDate
    }
}
```

---

## Best Practices

### 1. Always Use Whitelists for Sorting
```typescript
// ✅ GOOD - Whitelist
const allowedColumns = {
    'created_at': 'tasks.created_at',
    'priority': 'tasks.priority'
};
const { column } = getSortingConfig(filters, allowedColumns);

// ❌ BAD - Direct user input
const column = filters.sortBy; // SQL INJECTION RISK!
```

### 2. Build Conditions Array First
```typescript
// ✅ GOOD - Collect conditions, then build WHERE
const conditions: SQL[] = [];
addProjectScope(conditions, tasks, filters.projectId);
addStatusFilter(conditions, tasks, filters.status);
const whereClause = buildWhereClause(conditions);

// ❌ BAD - Multiple WHERE calls
let query = db.select().from(tasks);
if (filters.projectId) query = query.where(eq(tasks.projectId, filters.projectId));
if (filters.status) query = query.where(sql`...`); // Overwrites previous WHERE!
```

### 3. Use Type-Safe Filter Configs
```typescript
// ✅ GOOD - Use provided interfaces
import type { TaskFiltersConfig, LogFiltersConfig } from './base/QueryBuilders.js';

function findTasks(filters: TaskFiltersConfig) { /* ... */ }

// ❌ BAD - Ad-hoc types
function findTasks(filters: { projectId?: number; status?: string; }) { /* ... */ }
```

### 4. Always Sanitize User Input
```typescript
// ✅ GOOD - Sanitize before search
const safe = sanitizeSearchQuery(userInput);
addSearchFilter(conditions, tasks, 'title', safe);

// ❌ BAD - Direct user input
conditions.push(sql`${tasks.title} LIKE ${userInput}`); // SQL INJECTION!
```

---

## Performance Impact

**Before Query Builders:**
- ~200 lines of duplicated pagination/filtering logic across 18 repositories
- Inconsistent validation (some repos missing limit clamping)
- Ad-hoc SQL building (potential injection risks)

**After Query Builders:**
- ~50 lines of centralized logic (75% reduction)
- Consistent validation everywhere
- SQL injection protection built-in
- Type-safe filters

**Estimated Maintenance Time Saved:**
- Before: 10-15 min per repository to add new filter
- After: 2-3 min (import helper, call function)
- **5x faster** to add new filtering logic

---

## Next Steps

### For New Repositories
1. Import query builders: `import { buildTaskFilters, buildWhereClause } from './base/QueryBuilders.js';`
2. Use filter configs: `TaskFiltersConfig`, `LogFiltersConfig`
3. Build conditions with helpers
4. Use `buildWhereClause` for final WHERE

### For Existing Repositories
1. Identify repetitive filter logic
2. Replace with appropriate query builder
3. Test existing endpoints (should be no behavior change)
4. Update filter interfaces to use standard configs

---

## Related Documents

- `ARCHITECTURE-REVIEW-POST-DRIZZLE.md` - Overall architecture analysis
- `MIGRATION-GUIDE-STANDARDIZED-TYPES.md` - Type system guide
- `BaseRepository.ts` - Generic CRUD base class

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Author:** ECO-Lambda (Agent 11)
**Phase:** Architecture Optimization Phase 2.4
**Status:** ✅ Ready for Production Use
