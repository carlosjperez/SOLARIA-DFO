# DFN-007: Sistema de Dependencias Explícitas

**Status:** Implementation Ready
**Author:** ECO-Lambda
**Date:** 2025-12-27
**Sprint:** 2
**Estimated Hours:** 16
**Priority:** Critica

---

## Overview

Implement a robust task dependency system that tracks relationships between tasks, prevents circular dependencies, and identifies blocked tasks. This is essential for the `/dfo ready` command to work correctly.

## Problem Statement

Current issues:
1. No explicit dependency tracking between tasks
2. Cannot determine if a task is blocked by incomplete dependencies
3. No cycle detection (could create infinite loops)
4. `/dfo ready` endpoint needs accurate dependency data

## Technical Specification

### Database Schema

```sql
-- Migration: create_task_dependencies_table.sql
CREATE TABLE task_dependencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  depends_on_task_id INT NOT NULL,
  dependency_type ENUM('blocks', 'requires', 'related', 'child_of') DEFAULT 'blocks',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_agent_id INT,
  notes VARCHAR(500),

  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_agent_id) REFERENCES agents(id) ON DELETE SET NULL,

  UNIQUE KEY unique_dependency (task_id, depends_on_task_id),
  INDEX idx_task_id (task_id),
  INDEX idx_depends_on (depends_on_task_id),
  INDEX idx_type (dependency_type)
);
```

### Dependency Types

| Type | Description | Blocking |
|------|-------------|----------|
| `blocks` | Task A blocks Task B (B cannot start until A is complete) | Yes |
| `requires` | Task B requires Task A (softer relationship) | Yes |
| `related` | Tasks are related but independent | No |
| `child_of` | Task B is a subtask of Task A | No |

### Tool Definitions

```typescript
// Add Dependency
{
  name: 'add_dependency',
  description: 'Create a dependency relationship between two tasks',
  inputSchema: z.object({
    task_id: z.number().int().positive(),
    depends_on_task_id: z.number().int().positive(),
    dependency_type: z.enum(['blocks', 'requires', 'related', 'child_of']).default('blocks'),
    notes: z.string().max(500).optional(),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Remove Dependency
{
  name: 'remove_dependency',
  description: 'Remove a dependency relationship between tasks',
  inputSchema: z.object({
    task_id: z.number().int().positive(),
    depends_on_task_id: z.number().int().positive(),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Get Dependencies
{
  name: 'get_dependencies',
  description: 'Get all dependencies for a task (both upstream and downstream)',
  inputSchema: z.object({
    task_id: z.number().int().positive(),
    direction: z.enum(['upstream', 'downstream', 'both']).default('both'),
    include_transitive: z.boolean().default(false),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Detect Dependency Cycles
{
  name: 'detect_dependency_cycles',
  description: 'Check if adding a dependency would create a cycle',
  inputSchema: z.object({
    task_id: z.number().int().positive(),
    depends_on_task_id: z.number().int().positive(),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Get Blocked Tasks
{
  name: 'get_blocked_tasks',
  description: 'Get all tasks that are blocked by incomplete dependencies',
  inputSchema: z.object({
    project_id: z.number().int().positive().optional(),
    include_blocker_details: z.boolean().default(true),
    format: z.enum(['json', 'human']).default('json'),
  }),
}
```

### Response Schemas

```typescript
// Dependency Response
interface TaskDependency {
  id: number;
  task_id: number;
  task_code: string;
  task_title: string;
  depends_on_task_id: number;
  depends_on_task_code: string;
  depends_on_task_title: string;
  depends_on_status: string;
  dependency_type: string;
  is_blocking: boolean;
  created_at: string;
  notes?: string;
}

// Get Dependencies Response
interface GetDependenciesResponse {
  task_id: number;
  task_code: string;
  upstream: TaskDependency[];    // Tasks this task depends on
  downstream: TaskDependency[];  // Tasks that depend on this task
  is_blocked: boolean;
  blocking_count: number;
}

// Cycle Detection Response
interface CycleDetectionResponse {
  would_create_cycle: boolean;
  cycle_path?: string[];  // e.g., ["DFN-001", "DFN-003", "DFN-001"]
  message: string;
}

// Blocked Tasks Response
interface BlockedTasksResponse {
  blocked_tasks: Array<{
    task_id: number;
    task_code: string;
    task_title: string;
    blockers: Array<{
      task_id: number;
      task_code: string;
      task_title: string;
      status: string;
      progress: number;
    }>;
    blocker_count: number;
  }>;
  total_blocked: number;
}
```

### Human-Readable Formats

#### Dependencies List
```
Task DFN-007: Sistema de Dependencias

Upstream Dependencies (blocks this task):
  1. DFN-002 ✅ JSON-First API (completed)
  2. DFN-001 ✅ Agent Capabilities (completed)

Downstream Dependencies (blocked by this task):
  1. DFN-008 ⏳ Dependency Tree (pending)
  2. DFN-010 ⏳ Offline Skills (pending)

Status: ✅ Not blocked (all upstream complete)
```

#### Blocked Tasks
```
Blocked Tasks (3):

1. 🚫 DFN-008: Dependency Tree
   Blocked by: DFN-007 (in_progress, 45%)

2. 🚫 DFN-010: Offline Skills
   Blocked by:
     - DFN-007 (in_progress, 45%)
     - DFN-009 (pending, 0%)

3. 🚫 DFN-015: Advanced Analytics
   Blocked by: DFN-014 (pending, 0%)
```

### Cycle Detection Algorithm (DFS)

```typescript
function detectCycle(
  taskId: number,
  dependsOnId: number,
  allDependencies: Map<number, number[]>
): { hasCycle: boolean; path: number[] } {
  // Would adding taskId -> dependsOnId create a cycle?
  // Check if there's a path from dependsOnId back to taskId

  const visited = new Set<number>();
  const path: number[] = [];

  function dfs(current: number): boolean {
    if (current === taskId) {
      return true; // Found cycle back to original task
    }

    if (visited.has(current)) {
      return false;
    }

    visited.add(current);
    path.push(current);

    const deps = allDependencies.get(current) || [];
    for (const dep of deps) {
      if (dfs(dep)) {
        return true;
      }
    }

    path.pop();
    return false;
  }

  const hasCycle = dfs(dependsOnId);

  return {
    hasCycle,
    path: hasCycle ? [...path, taskId] : [],
  };
}
```

## Implementation Details

### File Locations
- Endpoint: `mcp-server/src/endpoints/dependencies.ts`
- Tests: `mcp-server/src/__tests__/dependencies.test.ts`
- Migration: `mcp-server/migrations/007_create_task_dependencies.sql`

### SQL Queries

#### Add Dependency
```sql
-- First check for cycles (application layer)
-- Then insert
INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, notes, created_by_agent_id)
VALUES (?, ?, ?, ?, ?);
```

#### Get Upstream Dependencies
```sql
SELECT
  td.id,
  td.task_id,
  t1.task_code,
  t1.title as task_title,
  td.depends_on_task_id,
  t2.task_code as depends_on_task_code,
  t2.title as depends_on_task_title,
  t2.status as depends_on_status,
  t2.progress as depends_on_progress,
  td.dependency_type,
  td.created_at,
  td.notes
FROM task_dependencies td
JOIN tasks t1 ON td.task_id = t1.id
JOIN tasks t2 ON td.depends_on_task_id = t2.id
WHERE td.task_id = ?
ORDER BY t2.task_code;
```

#### Get Blocked Tasks
```sql
SELECT
  t.id as task_id,
  t.task_code,
  t.title,
  t.status,
  COUNT(CASE WHEN t2.status != 'completed' AND td.dependency_type IN ('blocks', 'requires') THEN 1 END) as blocker_count
FROM tasks t
JOIN task_dependencies td ON t.id = td.task_id
JOIN tasks t2 ON td.depends_on_task_id = t2.id
WHERE t.status IN ('pending', 'in_progress')
  AND (? IS NULL OR t.project_id = ?)
GROUP BY t.id, t.task_code, t.title, t.status
HAVING blocker_count > 0
ORDER BY blocker_count DESC, t.task_code;
```

### Error Handling

| Error | Code | HTTP Status |
|-------|------|-------------|
| Task not found | TASK_NOT_FOUND | 404 |
| Self-dependency | INVALID_DEPENDENCY | 400 |
| Cycle detected | CYCLE_DETECTED | 400 |
| Duplicate dependency | DUPLICATE_DEPENDENCY | 409 |
| Database error | DATABASE_ERROR | 500 |

## Test Cases

### Add Dependency Tests
1. Add valid dependency
2. Reject self-dependency (task depends on itself)
3. Reject duplicate dependency
4. Reject cycle (A->B->C->A)
5. Add with notes
6. Add different dependency types

### Get Dependencies Tests
7. Get upstream dependencies
8. Get downstream dependencies
9. Get both directions
10. Include transitive dependencies
11. Empty dependencies
12. Human format output

### Cycle Detection Tests
13. No cycle (linear chain)
14. Direct cycle (A->B->A)
15. Indirect cycle (A->B->C->A)
16. Complex graph without cycle
17. Deep chain (10+ levels)

### Get Blocked Tasks Tests
18. Tasks with single blocker
19. Tasks with multiple blockers
20. No blocked tasks
21. Filter by project
22. Include blocker details
23. Human format with icons

### Edge Cases
24. Deleted task dependencies cascade
25. Completed task unblocks dependents
26. Concurrent dependency additions

## Acceptance Criteria

- [ ] Migration SQL creates table with proper indexes
- [ ] All 5 endpoints implemented with ResponseBuilder
- [ ] Zod validation on all inputs
- [ ] Cycle detection prevents circular dependencies
- [ ] JSON and human format supported
- [ ] Tests written (minimum 25)
- [ ] Coverage > 75%
- [ ] Integration with get_ready_tasks updated

## Related

- DFN-004: Comando /dfo ready (uses dependency data)
- DFN-008: Visualización de Dependency Tree (depends on this)
