# DFN-008: Visualización de Dependency Tree

**Status:** Implementation Ready
**Author:** ECO-Lambda
**Date:** 2025-12-27
**Sprint:** 2
**Estimated Hours:** 6
**Priority:** High
**Depends On:** DFN-007

---

## Overview

Implement ASCII tree visualization for task dependencies, with color coding and JSON export capabilities.

## Technical Specification

### Tool Definition

```typescript
{
  name: 'get_dependency_tree',
  description: 'Generate ASCII tree visualization of task dependencies',
  inputSchema: z.object({
    task_id: z.number().int().positive(),
    direction: z.enum(['upstream', 'downstream', 'both']).default('downstream'),
    max_depth: z.number().int().min(1).max(10).default(5),
    show_status: z.boolean().default(true),
    show_progress: z.boolean().default(true),
    format: z.enum(['json', 'human', 'ascii']).default('ascii'),
  }),
}
```

### Response Schema

```typescript
interface DependencyTreeResponse {
  root: TreeNode;
  total_nodes: number;
  max_depth_reached: number;
  blocked_count: number;
  completed_count: number;
}

interface TreeNode {
  task_id: number;
  task_code: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  dependency_type?: string;
  children: TreeNode[];
  depth: number;
}
```

### ASCII Output Format

```
DFN-007: Sistema de Dependencias ✓ [100%]
├── DFN-008: Dependency Tree ⏳ [0%]
│   └── DFN-011: Dashboard Visualization ⏳ [0%]
├── DFN-009: Offline Cache ⏳ [0%]
│   └── DFN-010: Offline Skills ⏳ [0%]
└── DFN-012: Performance Optimization ⏳ [0%]
```

### Status Icons

| Status | Icon | Color (ANSI) |
|--------|------|--------------|
| completed | ✓ | Green |
| in_progress | ⏳ | Yellow |
| pending | ○ | Gray |
| blocked | 🚫 | Red |

### Implementation

```typescript
function buildTreeString(node: TreeNode, prefix: string = '', isLast: boolean = true): string {
  const connector = isLast ? '└── ' : '├── ';
  const extension = isLast ? '    ' : '│   ';

  const statusIcon = getStatusIcon(node.status);
  const progress = node.show_progress ? `[${node.progress}%]` : '';

  let line = `${prefix}${connector}${node.task_code}: ${node.title} ${statusIcon} ${progress}\n`;

  node.children.forEach((child, i) => {
    const childIsLast = i === node.children.length - 1;
    line += buildTreeString(child, prefix + extension, childIsLast);
  });

  return line;
}
```

## Test Cases

1. Single node (no dependencies)
2. Linear chain (A -> B -> C)
3. Diamond pattern (A -> B, A -> C, B -> D, C -> D)
4. Max depth truncation
5. Mixed status nodes
6. Empty tree (task not found)
7. Cyclic prevention display

## Acceptance Criteria

- [ ] ASCII tree renders correctly
- [ ] Status icons and colors work
- [ ] Max depth respected
- [ ] JSON export includes full tree structure
- [ ] Human format shows summary stats
- [ ] Minimum 10 tests
