# DFN-004: Comando /dfo ready - Get Ready Tasks Endpoint

**Author:** ECO-Lambda | DFO Enhancement Plan
**Date:** 2025-12-27
**Task:** DFN-004
**Status:** Implementation

---

## Executive Summary

Implement `get_ready_tasks()` endpoint to intelligently identify tasks that are ready to work on (no blockers, actionable state, proper priority). Integrates with `/dfo ready` skill command for seamless workflow.

**Goals:**
- ✅ Automatic detection of actionable tasks
- ✅ Dependency-aware filtering
- ✅ Priority-based ordering
- ✅ Agent-specific task queues
- ✅ CLI-friendly output

---

## 1. Endpoint Specification

### Endpoint Name
```
get_ready_tasks
```

### Input Schema

```typescript
interface GetReadyTasksParams {
  project_id?: number;           // Filter by project (optional)
  agent_id?: number;             // Filter by assigned agent (optional)
  sprint_id?: number;            // Filter by sprint (optional)
  epic_id?: number;              // Filter by epic (optional)
  priority?: 'low' | 'medium' | 'high' | 'critical'; // Minimum priority
  limit?: number;                // Max results (default: 10)
  format?: 'json' | 'human';     // Response format (default: 'json')
}
```

### "Ready" Task Criteria

A task is considered "ready" when ALL of the following are true:

| Criterion | Logic |
|-----------|-------|
| **Status** | `status = 'pending'` (not in_progress, completed, or blocked) |
| **No Blockers** | No dependencies with `relationship_type = 'blocks'` where blocker is incomplete |
| **Assignable** | Either unassigned OR assigned to requesting agent |
| **Sprint Active** | If part of sprint, sprint must be `status = 'active'` or `'planned'` |
| **Epic Not Blocked** | If part of epic, epic must not be `status = 'cancelled'` |
| **Has Estimate** | `estimated_hours > 0` (optional filter) |

### Response Schema

```typescript
interface GetReadyTasksResponse {
  success: true;
  data: {
    tasks: Array<{
      id: number;
      task_code: string;
      title: string;
      description: string;
      project_id: number;
      project_name: string;
      epic_id?: number;
      epic_name?: string;
      sprint_id?: number;
      sprint_name?: string;
      assigned_agent_id?: number;
      agent_name?: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      estimated_hours?: number;
      deadline?: string;
      readiness_score: number;  // 0-100, higher = more ready
      readiness_reasons: string[];  // Why this task is ready
    }>;
    total: number;
    filters: {
      project_id?: number;
      agent_id?: number;
      sprint_id?: number;
      priority?: string;
    };
  };
  metadata?: ResponseMetadata;
  formatted?: string;  // When format='human'
}
```

### Readiness Score Algorithm

```typescript
function calculateReadinessScore(task: Task): number {
  let score = 50; // Base score

  // Priority boost
  const priorityBoost = {
    critical: +30,
    high: +20,
    medium: +10,
    low: +0,
  };
  score += priorityBoost[task.priority] || 0;

  // Sprint alignment
  if (task.sprint_id && task.sprint_status === 'active') {
    score += 15;
  }

  // Assignment clarity
  if (task.assigned_agent_id) {
    score += 5;
  }

  // Has clear estimate
  if (task.estimated_hours && task.estimated_hours > 0) {
    score += 5;
  }

  // Deadline urgency (within 7 days)
  if (task.deadline) {
    const daysUntil = daysBetween(now(), task.deadline);
    if (daysUntil <= 7 && daysUntil > 0) {
      score += 10;
    }
  }

  // Unblocked by dependencies (all dependencies resolved)
  if (task.dependency_count === 0) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}
```

---

## 2. SQL Query Logic

### Core Query

```sql
-- Find ready tasks with all criteria
WITH ready_tasks AS (
  SELECT
    t.id,
    t.title,
    t.description,
    t.project_id,
    t.epic_id,
    t.sprint_id,
    t.assigned_agent_id,
    t.priority,
    t.estimated_hours,
    t.deadline,
    p.name AS project_name,
    p.code AS project_code,
    e.name AS epic_name,
    s.name AS sprint_name,
    s.status AS sprint_status,
    a.name AS agent_name,
    -- Count blocking dependencies
    (
      SELECT COUNT(*)
      FROM task_dependencies td
      JOIN tasks blocker ON td.depends_on_task_id = blocker.id
      WHERE td.task_id = t.id
        AND td.relationship_type = 'blocks'
        AND blocker.status != 'completed'
    ) AS blocker_count
  FROM tasks t
  LEFT JOIN projects p ON t.project_id = p.id
  LEFT JOIN epics e ON t.epic_id = e.id
  LEFT JOIN sprints s ON t.sprint_id = s.id
  LEFT JOIN agents a ON t.assigned_agent_id = a.id
  WHERE t.status = 'pending'
    -- Optional filters
    AND (? IS NULL OR t.project_id = ?)
    AND (? IS NULL OR t.assigned_agent_id = ? OR t.assigned_agent_id IS NULL)
    AND (? IS NULL OR t.sprint_id = ?)
    AND (? IS NULL OR t.epic_id = ?)
    -- Sprint not cancelled
    AND (t.sprint_id IS NULL OR s.status IN ('planned', 'active'))
    -- Epic not cancelled
    AND (t.epic_id IS NULL OR e.status != 'cancelled')
)
SELECT *
FROM ready_tasks
WHERE blocker_count = 0  -- No active blockers
ORDER BY
  -- Priority ordering
  CASE priority
    WHEN 'critical' THEN 4
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 1
  END DESC,
  -- Deadline urgency (closest first)
  CASE
    WHEN deadline IS NOT NULL THEN deadline
    ELSE '9999-12-31'
  END ASC,
  -- Sprint alignment (active sprints first)
  CASE sprint_status
    WHEN 'active' THEN 1
    WHEN 'planned' THEN 2
    ELSE 3
  END ASC,
  -- Created date (oldest first)
  t.created_at ASC
LIMIT ?;
```

### Alternative: Readiness Score Ordering

```sql
-- Same as above, but calculate score in SQL
SELECT
  *,
  (
    50 -- Base
    + CASE priority WHEN 'critical' THEN 30 WHEN 'high' THEN 20 WHEN 'medium' THEN 10 ELSE 0 END
    + CASE WHEN sprint_status = 'active' THEN 15 ELSE 0 END
    + CASE WHEN assigned_agent_id IS NOT NULL THEN 5 ELSE 0 END
    + CASE WHEN estimated_hours > 0 THEN 5 ELSE 0 END
    + CASE WHEN deadline IS NOT NULL AND DATEDIFF(deadline, NOW()) <= 7 THEN 10 ELSE 0 END
    + CASE WHEN blocker_count = 0 THEN 5 ELSE 0 END
  ) AS readiness_score
FROM ready_tasks
WHERE blocker_count = 0
ORDER BY readiness_score DESC
LIMIT ?;
```

---

## 3. Implementation

### TypeScript Implementation

```typescript
import { z } from 'zod';
import { ResponseBuilder, CommonErrors } from '../utils/response-builder';
import { Formatters } from '../utils/formatters';
import { db } from '../database';

const GetReadyTasksInputSchema = z.object({
  project_id: z.number().int().positive().optional(),
  agent_id: z.number().int().positive().optional(),
  sprint_id: z.number().int().positive().optional(),
  epic_id: z.number().int().positive().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  limit: z.number().int().min(1).max(100).default(10),
  format: z.enum(['json', 'human']).default('json'),
});

export const getReadyTasks = {
  name: 'get_ready_tasks',
  description: 'Get tasks that are ready to work on (no blockers, actionable state)',
  inputSchema: GetReadyTasksInputSchema,

  async execute(params: z.infer<typeof GetReadyTasksInputSchema>) {
    const builder = new ResponseBuilder({ version: '2.0.0' });

    try {
      const query = `
        WITH ready_tasks AS (
          SELECT
            t.id,
            t.title,
            t.description,
            t.project_id,
            t.epic_id,
            t.sprint_id,
            t.assigned_agent_id,
            t.priority,
            t.estimated_hours,
            t.deadline,
            CONCAT(p.code, '-', t.task_number) AS task_code,
            p.name AS project_name,
            e.name AS epic_name,
            s.name AS sprint_name,
            s.status AS sprint_status,
            a.name AS agent_name,
            (
              SELECT COUNT(*)
              FROM task_dependencies td
              JOIN tasks blocker ON td.depends_on_task_id = blocker.id
              WHERE td.task_id = t.id
                AND td.relationship_type = 'blocks'
                AND blocker.status != 'completed'
            ) AS blocker_count
          FROM tasks t
          LEFT JOIN projects p ON t.project_id = p.id
          LEFT JOIN epics e ON t.epic_id = e.id
          LEFT JOIN sprints s ON t.sprint_id = s.id
          LEFT JOIN agents a ON t.assigned_agent_id = a.id
          WHERE t.status = 'pending'
            AND (? IS NULL OR t.project_id = ?)
            AND (? IS NULL OR t.assigned_agent_id = ? OR t.assigned_agent_id IS NULL)
            AND (? IS NULL OR t.sprint_id = ?)
            AND (? IS NULL OR t.epic_id = ?)
            AND (t.sprint_id IS NULL OR s.status IN ('planned', 'active'))
            AND (t.epic_id IS NULL OR e.status != 'cancelled')
        )
        SELECT
          *,
          (
            50
            + CASE priority WHEN 'critical' THEN 30 WHEN 'high' THEN 20 WHEN 'medium' THEN 10 ELSE 0 END
            + CASE WHEN sprint_status = 'active' THEN 15 ELSE 0 END
            + CASE WHEN assigned_agent_id IS NOT NULL THEN 5 ELSE 0 END
            + CASE WHEN estimated_hours > 0 THEN 5 ELSE 0 END
            + CASE WHEN deadline IS NOT NULL AND DATEDIFF(deadline, NOW()) <= 7 THEN 10 ELSE 0 END
            + CASE WHEN blocker_count = 0 THEN 5 ELSE 0 END
          ) AS readiness_score
        FROM ready_tasks
        WHERE blocker_count = 0
        ORDER BY readiness_score DESC, deadline ASC
        LIMIT ?
      `;

      const queryParams = [
        params.project_id, params.project_id,
        params.agent_id, params.agent_id,
        params.sprint_id, params.sprint_id,
        params.epic_id, params.epic_id,
        params.limit,
      ];

      const tasks = await db.query(query, queryParams);

      // Add readiness reasons
      const tasksWithReasons = tasks.map((task: any) => ({
        ...task,
        readiness_reasons: generateReadinessReasons(task),
      }));

      const data = {
        tasks: tasksWithReasons,
        total: tasksWithReasons.length,
        filters: {
          project_id: params.project_id,
          agent_id: params.agent_id,
          sprint_id: params.sprint_id,
          priority: params.priority,
        },
      };

      // Human-readable format
      const formatted = params.format === 'human'
        ? formatReadyTasks(tasksWithReasons)
        : undefined;

      return builder.success(data, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

function generateReadinessReasons(task: any): string[] {
  const reasons: string[] = [];

  reasons.push('✓ No blocking dependencies');

  if (task.priority === 'critical' || task.priority === 'high') {
    reasons.push(`✓ ${task.priority.toUpperCase()} priority`);
  }

  if (task.sprint_status === 'active') {
    reasons.push('✓ Part of active sprint');
  }

  if (task.assigned_agent_id) {
    reasons.push(`✓ Assigned to ${task.agent_name}`);
  } else {
    reasons.push('✓ Available for assignment');
  }

  if (task.estimated_hours) {
    reasons.push(`✓ Estimated: ${task.estimated_hours}h`);
  }

  if (task.deadline) {
    const daysUntil = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7 && daysUntil > 0) {
      reasons.push(`⚠ Deadline in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`);
    }
  }

  return reasons;
}

function formatReadyTasks(tasks: any[]): string {
  if (tasks.length === 0) {
    return 'No ready tasks found. All tasks are either blocked, in progress, or completed.';
  }

  const lines = [
    `📋 Ready Tasks (${tasks.length}):`,
    '',
  ];

  tasks.forEach((task, index) => {
    const priorityIcon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
    }[task.priority] || '⚪';

    lines.push(
      `${index + 1}. ${priorityIcon} ${task.task_code}: ${task.title}`,
      `   Score: ${task.readiness_score}/100 | Priority: ${task.priority}`,
    );

    if (task.agent_name) {
      lines.push(`   Assigned: ${task.agent_name}`);
    }

    if (task.sprint_name) {
      lines.push(`   Sprint: ${task.sprint_name}`);
    }

    lines.push(`   ${task.readiness_reasons.join(' | ')}`);
    lines.push('');
  });

  return lines.join('\n');
}
```

---

## 4. Skill Integration

### /dfo ready Command

```markdown
# Skill: dfo-sync Enhancement

Add `/dfo ready` command to list ready tasks.

## Usage

```bash
/dfo ready                  # All ready tasks for current project
/dfo ready --agent 11       # Ready tasks for Agent 11
/dfo ready --sprint 26      # Ready tasks in Sprint 26
/dfo ready --limit 5        # Top 5 ready tasks
```

## Implementation

```typescript
async function handleReadyCommand(args: string[]) {
  const params = parseArgs(args);

  const response = await dfo.get_ready_tasks({
    agent_id: params.agent || getCurrentAgentId(),
    project_id: await getCurrentProjectId(),
    sprint_id: params.sprint,
    limit: params.limit || 10,
    format: 'human',
  });

  if (response.success) {
    console.log(response.formatted);
  } else {
    console.error(`Error: ${response.error.message}`);
  }
}
```

---

## 5. Testing Requirements

### Test Cases

```typescript
describe('get_ready_tasks', () => {
  it('should return tasks with no blockers', async () => {
    const response = await getReadyTasks.execute({ project_id: 98 });

    expect(response.success).toBe(true);
    expect(response.data.tasks.every(t => t.blocker_count === 0)).toBe(true);
  });

  it('should order by readiness score descending', async () => {
    const response = await getReadyTasks.execute({ project_id: 98 });

    const scores = response.data.tasks.map(t => t.readiness_score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('should filter by agent', async () => {
    const response = await getReadyTasks.execute({
      project_id: 98,
      agent_id: 11,
    });

    expect(response.data.tasks.every(
      t => t.assigned_agent_id === 11 || t.assigned_agent_id === null
    )).toBe(true);
  });

  it('should exclude blocked tasks', async () => {
    // Create task with blocker
    const blocker = await createTask({ status: 'pending' });
    const blocked = await createTask({ status: 'pending' });
    await createDependency(blocked.id, blocker.id, 'blocks');

    const response = await getReadyTasks.execute({ project_id: 98 });

    expect(response.data.tasks.find(t => t.id === blocked.id)).toBeUndefined();
  });

  it('should include tasks when blocker is completed', async () => {
    const blocker = await createTask({ status: 'completed' });
    const task = await createTask({ status: 'pending' });
    await createDependency(task.id, blocker.id, 'blocks');

    const response = await getReadyTasks.execute({ project_id: 98 });

    expect(response.data.tasks.find(t => t.id === task.id)).toBeDefined();
  });

  it('should return human-readable format', async () => {
    const response = await getReadyTasks.execute({
      project_id: 98,
      format: 'human',
    });

    expect(response.formatted).toBeDefined();
    expect(response.formatted).toContain('Ready Tasks');
    expect(response.formatted).toMatch(/🔴|🟠|🟡|🔵/); // Priority icons
  });
});
```

---

## 6. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query performance | <200ms | Execution time |
| Accuracy | 100% | No false positives (blocked tasks) |
| Relevance | >80% | Tasks marked as started within 24h |
| User satisfaction | High | Reduces "what should I work on?" questions |

---

## 7. Next Steps

1. ✅ Create specification (this document)
2. ⏳ Implement endpoint with tests
3. ⏳ Integrate into dfo-sync skill
4. ⏳ Add dependency tracking table (if not exists)
5. ⏳ Deploy to DFO server
6. ⏳ Test with real project data

---

**Status:** Ready for implementation
**Estimated Effort:** 8 hours
**Dependencies:** Database must have task_dependencies table
**Blocking:** None
