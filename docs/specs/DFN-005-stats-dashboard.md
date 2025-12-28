# DFN-005: Stats Dashboard DFO

**Status:** Implementation Ready
**Author:** ECO-Lambda
**Date:** 2025-12-27
**Sprint:** 1
**Estimated Hours:** 6
**Priority:** Media

---

## Overview

Implement a comprehensive stats dashboard endpoint that provides aggregated metrics about tasks, velocity, completion rates, and agent workload. This endpoint supports both project-specific and system-wide statistics.

## Motivation

- Enable data-driven decision making for project management
- Track velocity and completion trends
- Monitor agent workload distribution
- Support Grafana/Prometheus integration for visualization

## Technical Specification

### Tool Definition

```typescript
{
  name: 'get_stats',
  description: 'Get aggregated system statistics for tasks, velocity, and agent workload',
  inputSchema: z.object({
    project_id: z.number().int().positive().optional(),
    sprint_id: z.number().int().positive().optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    format: z.enum(['json', 'human']).default('json'),
  }),
}
```

### Response Schema

```typescript
interface StatsResponse {
  success: true;
  data: {
    project_id?: number;
    project_name?: string;
    period: {
      from: string;
      to: string;
    };
    tasks: {
      total: number;
      by_status: {
        pending: number;
        in_progress: number;
        completed: number;
        blocked: number;
      };
      by_priority: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      completion_rate: number; // 0-100
    };
    velocity: {
      current_sprint: number;
      average: number;
      trend: 'up' | 'down' | 'stable';
      history: Array<{ sprint_id: number; points: number }>;
    };
    agents: {
      total: number;
      active: number;
      workload: Array<{
        agent_id: number;
        agent_name: string;
        tasks_assigned: number;
        tasks_completed: number;
        efficiency: number; // 0-100
      }>;
    };
    health_score: number; // 0-100, composite metric
  };
  metadata: ResponseMetadata;
}
```

### Metrics Calculation

#### Completion Rate
```sql
completion_rate = (completed_tasks / total_tasks) * 100
```

#### Velocity
```sql
-- Points completed in current sprint
SELECT SUM(story_points) FROM tasks
WHERE sprint_id = :current_sprint AND status = 'completed'

-- Average velocity over last 5 sprints
SELECT AVG(velocity) FROM sprints
WHERE project_id = :project_id
ORDER BY end_date DESC LIMIT 5
```

#### Health Score
Composite of:
- Completion rate (30%)
- Blocked tasks ratio (20% - inverse)
- Velocity trend (20%)
- Agent utilization (15%)
- Overdue tasks ratio (15% - inverse)

```
health_score =
  (completion_rate * 0.30) +
  ((1 - blocked_ratio) * 0.20) +
  (velocity_score * 0.20) +
  (utilization * 0.15) +
  ((1 - overdue_ratio) * 0.15)
```

### Human-Readable Format

```
Project Statistics Dashboard
============================
Project: DFO Enhancement Plan (#98)

Task Distribution:
  ⏳ Pending:     [████░░░░░░░░░░░] 25% (15)
  🔄 In Progress: [██░░░░░░░░░░░░░] 12% (7)
  ✅ Completed:   [█████████░░░░░░] 58% (35)
  🚫 Blocked:     [█░░░░░░░░░░░░░░] 5% (3)

Priority Distribution:
  🔴 Critical: 3
  🟠 High:     12
  🟡 Medium:   28
  🔵 Low:      17

Velocity:
  Current Sprint: 42 pts
  Average:        38 pts ↑

Key Metrics:
  Completion Rate: [█████████░░░░░░] 58%
  Health Score:    [████████████░░░] 82%
  Active Agents:   8/10
```

## Implementation Details

### File Location
`mcp-server/src/endpoints/stats.ts`

### SQL Queries

#### Task Distribution
```sql
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
FROM tasks
WHERE (? IS NULL OR project_id = ?)
  AND (? IS NULL OR created_at >= ?)
  AND (? IS NULL OR created_at <= ?)
```

#### Priority Distribution
```sql
SELECT
  SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
  SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
  SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
  SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low
FROM tasks
WHERE (? IS NULL OR project_id = ?)
```

#### Agent Workload
```sql
SELECT
  a.id as agent_id,
  a.name as agent_name,
  COUNT(t.id) as tasks_assigned,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as tasks_completed
FROM agents a
LEFT JOIN tasks t ON t.assigned_agent_id = a.id
WHERE a.status = 'active'
GROUP BY a.id, a.name
```

### Fallback Behavior
- If project_id not provided, return system-wide stats
- If no tasks found, return zeroes (not error)
- If velocity history insufficient, calculate from available data

## Test Cases

### Input Validation
1. Accept empty input (system-wide)
2. Accept valid project_id
3. Accept valid sprint_id
4. Accept valid date_from and date_to
5. Reject invalid date format
6. Reject negative project_id

### Calculations
7. Correct task count by status
8. Correct task count by priority
9. Correct completion rate calculation
10. Correct velocity calculation
11. Correct health score calculation
12. Handle zero tasks gracefully

### Filtering
13. Filter by project_id
14. Filter by sprint_id
15. Filter by date range
16. Combined filters work correctly

### Agent Workload
17. Count tasks per agent
18. Calculate efficiency correctly
19. Handle agents with no tasks

### Human Format
20. Progress bars display correctly
21. Priority icons correct
22. Velocity trend arrows correct
23. All sections present
24. Numbers formatted correctly

### Edge Cases
25. Empty project returns zeros
26. Single task project
27. All tasks completed
28. All tasks blocked
29. No active agents

## Acceptance Criteria

- [ ] Endpoint registered in MCP server
- [ ] All SQL queries optimized with indexes
- [ ] JSON and human format supported
- [ ] ResponseBuilder pattern used
- [ ] Tests written (minimum 25)
- [ ] Coverage > 75%
- [ ] Formatter added to registry
- [ ] Documentation updated

## Related

- DFN-002: JSON-First API Standardization
- DFN-003: Health Check Endpoint
- DFN-004: Ready Tasks Endpoint
