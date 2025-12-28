# DFN-010: Integración Offline en Skills

**Status:** Implementation Ready
**Author:** ECO-Lambda
**Date:** 2025-12-27
**Sprint:** 2
**Estimated Hours:** 8
**Priority:** Medium
**Depends On:** DFN-009

---

## Overview

Modify the dfo-sync skill and related skills to use the offline cache, show connectivity warnings, and provide force sync capabilities.

## Changes Required

### 1. Skill: dfo-sync.md Updates

Add offline mode detection and handling:

```markdown
## Offline Mode Support

When DFO server is unreachable:

1. **Auto-detect offline mode**
   - Ping /health endpoint on session start
   - If unreachable, switch to offline mode

2. **Visual indicators**
   - Show ⚡ when online
   - Show 📴 when offline

3. **Commands**
   - `/dfo sync` - Normal sync (uses cache if offline)
   - `/dfo sync --force` - Force refresh from server
   - `/dfo status --offline` - Show cached data only
```

### 2. Status Indicator Format

```
DFO Status: ⚡ Online | Project: PRILABSA | Tasks: 5 pending
DFO Status: 📴 Offline (3 queued) | Project: PRILABSA | Tasks: 5 cached
```

### 3. Modified Skill Commands

#### /dfo sync (updated)

```typescript
async function syncWithDFO() {
  const client = new DFOClient({ projectId: currentProject.id });

  // Check connectivity
  const { online } = await client.ping();

  if (online) {
    // Full sync
    await client.syncAll();
    console.log('⚡ Synced with DFO server');
  } else {
    // Process queue if possible
    const queuedOps = client.getQueuedOperations();
    console.log(`📴 Offline mode - ${queuedOps.length} operations queued`);
  }
}
```

#### /dfo sync --force

```typescript
async function forceSyncWithDFO() {
  const client = new DFOClient({ projectId: currentProject.id });

  // Clear cache and redownload
  await client.invalidateCache();
  await client.syncAll();

  console.log('🔄 Force synced - cache refreshed');
}
```

#### /dfo status (updated)

```typescript
async function getStatus(options: { offline?: boolean }) {
  const client = new DFOClient({ projectId: currentProject.id });

  if (options.offline) {
    // Show cached data only
    const cached = await client.getCachedTasks();
    return formatCachedStatus(cached);
  }

  const { online } = await client.ping();

  if (online) {
    const tasks = await client.listTasks();
    return formatOnlineStatus(tasks);
  } else {
    const cached = await client.getCachedTasks();
    return formatOfflineStatus(cached);
  }
}
```

### 4. Warning Messages

```typescript
const OFFLINE_WARNING = `
⚠️ Operating in OFFLINE mode
Changes will be queued and synced when connection restored.
Use /dfo sync --force to retry connection.
`;

const QUEUE_WARNING = (count: number) => `
📤 ${count} operation(s) pending sync
Use /dfo sync to upload when online.
`;

const STALE_CACHE_WARNING = (hours: number) => `
⏰ Cache is ${hours}h old - consider syncing when online.
`;
```

### 5. Prompt Status Line

Add to ECO startup banner:

```
DFO: ⚡ Online | Proj: 98 | 📝 3 tasks | 🔄 Last sync: 5m ago
DFO: 📴 Offline | Proj: 98 | 📝 3 cached | ⏳ 2 queued
```

## File Changes

| File | Changes |
|------|---------|
| `~/.claude/skills/dfo-sync.md` | Add offline detection, force sync |
| `~/.claude/CLAUDE.md` | Add DFO status to ECO banner |
| `mcp-server/src/client/dfo-client.ts` | Add getStatusLine() method |

## Test Cases

1. Detect offline mode on startup
2. Show correct status indicator
3. Force sync clears cache
4. Queued operations visible in status
5. Warning messages display correctly
6. Stale cache warning triggers
7. Status line formats correctly

## Acceptance Criteria

- [ ] Offline detection on startup
- [ ] Status indicators (⚡/📴) work
- [ ] /dfo sync --force implemented
- [ ] Queue count in status
- [ ] Warning messages show appropriately
- [ ] Integration with ECO banner
- [ ] Minimum 10 tests
