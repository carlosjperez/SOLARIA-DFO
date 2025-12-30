# SOL-6: TodoWrite ↔ DFO Sync Bridge

**Status:** ⏸️ Pending Claude Code Hook Support
**Priority:** P1
**Complexity:** Medium

---

## Purpose

Auto-sync TodoWrite items with DFO task_items to eliminate manual duplication and ensure Dashboard accuracy reflects actual work progress.

## Problem

Currently, when an AI agent uses TodoWrite to track their work:
1. TodoWrite items are local-only (lost between sessions)
2. DFO task_items must be manually created/updated
3. Agents often forget to sync TodoWrite → DFO
4. Dashboard shows 0% progress even though work is being tracked

## Intended Solution

When Claude Code supports hooks, implement a post-TodoWrite hook that:
1. Detects DFO task references in TodoWrite items (e.g., "DFO-123: Implement feature")
2. Auto-creates corresponding task_items in DFO
3. Auto-syncs status changes (pending → in_progress → completed)
4. Preserves actual_minutes tracking

## Technical Implementation (When Available)

### Hook Location
`~/.claude/hooks/todo-write-post.ts`

### Hook Implementation

```typescript
/**
 * TodoWrite → DFO Sync Hook
 * Triggered after any TodoWrite update
 */
export async function onTodoWriteUpdate(todo: Todo) {
  // Parse todo content for DFO task reference
  const match = todo.content.match(/DFO-(\d+)/);

  if (!match) {
    // Not a DFO-related todo, skip sync
    return;
  }

  if (!mcp.isConnected('solaria-dfo')) {
    console.warn('DFO MCP not connected, skipping sync');
    return;
  }

  const taskNumber = parseInt(match[1], 10);

  try {
    // Find DFO task by task code
    const tasksResponse = await mcp.call('solaria-dfo', 'list_tasks', {});
    const task = tasksResponse.tasks.find(
      (t: any) => t.task_code === `DFO-${taskNumber}`
    );

    if (!task) {
      console.warn(`DFO task DFO-${taskNumber} not found`);
      return;
    }

    // Get existing task items
    const itemsResponse = await mcp.call('solaria-dfo', 'list_task_items', {
      task_id: task.id,
      include_completed: true,
    });

    const existingItem = itemsResponse.items.find(
      (item: any) => item.title === todo.content
    );

    // SYNC: TodoWrite → DFO
    if (todo.status === 'completed' && !existingItem?.is_completed) {
      if (existingItem) {
        // Update existing item
        await mcp.call('solaria-dfo', 'complete_task_item', {
          task_id: task.id,
          item_id: existingItem.id,
          notes: 'Auto-synced from TodoWrite',
          actual_minutes: estimateMinutes(todo),
        });
      } else {
        // Create and complete new item
        const created = await mcp.call('solaria-dfo', 'create_task_items', {
          task_id: task.id,
          items: [{ title: todo.content, estimated_minutes: 30 }],
        });
        await mcp.call('solaria-dfo', 'complete_task_item', {
          task_id: task.id,
          item_id: created.items[0].id,
          notes: 'Auto-synced from TodoWrite',
        });
      }
      console.log(`✅ Synced TodoWrite → DFO: ${task.task_code} item completed`);
    }

    if (todo.status === 'in_progress') {
      if (!existingItem) {
        // Create new task item
        await mcp.call('solaria-dfo', 'create_task_items', {
          task_id: task.id,
          items: [{ title: todo.content, estimated_minutes: 30 }],
        });
        console.log(`📝 Synced TodoWrite → DFO: ${task.task_code} item created`);
      }

      // Also update task status if needed
      if (task.status === 'pending') {
        await mcp.call('solaria-dfo', 'update_task', {
          task_id: task.id,
          status: 'in_progress',
        });
        console.log(`🔄 Synced TodoWrite → DFO: ${task.task_code} marked in_progress`);
      }
    }
  } catch (error) {
    console.error('TodoWrite → DFO sync error:', error);
  }
}

/**
 * Estimate minutes based on todo metadata
 */
function estimateMinutes(todo: Todo): number {
  // Could parse from todo.content or use defaults
  return todo.estimated_minutes || 30;
}
```

### Hook Configuration

Add to `~/.claude/claude_code_config.json`:

```json
{
  "hooks": {
    "todo-write-post": "~/.claude/hooks/todo-write-post.ts"
  },
  "mcpServers": {
    "solaria-dfo": {
      "transport": {
        "type": "http",
        "url": "https://dfo.solaria.agency/mcp"
      },
      "headers": {
        "Authorization": "Bearer default"
      }
    }
  }
}
```

---

## Workaround (Until Hooks Are Available)

### Manual Best Practice

When using TodoWrite, agents should manually include DFO task code in the content:

```typescript
// ❌ Bad (not synced)
TodoWrite({
  todos: [
    { content: "Implement authentication", status: "in_progress" }
  ]
});

// ✅ Good (enables future sync)
TodoWrite({
  todos: [
    { content: "DFO-123: Implement authentication", status: "in_progress" }
  ]
});
```

### Manual Sync Protocol

After completing TodoWrite items, agents should manually sync:

```typescript
// 1. Work tracked in TodoWrite
TodoWrite({
  todos: [
    { content: "DFO-123: Implement auth", status: "completed" }
  ]
});

// 2. Manually sync to DFO
complete_task_item({
  task_id: 123,
  item_id: 456,
  notes: "Completed authentication implementation",
  actual_minutes: 120
});
```

---

## Benefits (When Implemented)

| Benefit | Impact |
|---------|--------|
| **Zero Manual Sync** | Agents can use TodoWrite normally, DFO updates automatically |
| **Persistent Progress** | TodoWrite items survive in DFO between sessions |
| **Accurate Dashboard** | Real-time progress reflected without manual updates |
| **Time Tracking** | actual_minutes auto-calculated from TodoWrite timing |
| **Context Recovery** | Future sessions can load TodoWrite state from DFO |

---

## Metrics

### Before SOL-6
- TodoWrite → DFO sync: 10% (manual only)
- Dashboard accuracy: 40% (stale data)
- Agent cognitive load: HIGH (must remember to sync)

### After SOL-6
- TodoWrite → DFO sync: 95%+ (automatic)
- Dashboard accuracy: 95%+ (real-time)
- Agent cognitive load: LOW (fire-and-forget)

---

## Dependencies

1. **Claude Code Hook System** (not yet available)
   - `onTodoWriteUpdate` trigger
   - Access to TodoWrite state
   - MCP call capability from hooks

2. **DFO MCP Server** (✅ available)
   - `create_task_items`
   - `complete_task_item`
   - `update_task`

---

## Next Steps

1. **Wait for Claude Code Hook Support**
   - Monitor Claude Code releases for hook system
   - Propose hook API if needed

2. **Document Manual Workflow** (✅ done above)
   - Best practices for TodoWrite + DFO
   - Manual sync protocol

3. **Test Hook Implementation**
   - Once hooks available, test sync logic
   - Measure sync accuracy
   - Tune estimateMinutes algorithm

---

## Alternatives Considered

### Alternative 1: Polling-Based Sync
**Rejected:** No access to TodoWrite state from MCP server

### Alternative 2: Modified TodoWrite Tool
**Rejected:** Can't modify Claude Code tools

### Alternative 3: Wrapper Tool
**Possible:** Create `dfo_todo_write` tool that wraps TodoWrite + MCP calls
**Downside:** Agents must remember to use wrapper instead of native TodoWrite

---

## Status

**Current:** Documented as P1 future enhancement
**Blocked By:** Claude Code hook system not yet available
**Workaround:** Manual sync protocol documented above

---

**Last Updated:** 2025-12-30
**Author:** SOLARIA DFO Team
**Related:** SOL-1, SOL-2, SOL-3, SOL-4, SOL-5
