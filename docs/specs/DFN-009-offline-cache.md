# DFN-009: Offline Cache Local (SQLite)

**Status:** Implementation Ready
**Author:** ECO-Lambda
**Date:** 2025-12-27
**Sprint:** 2
**Estimated Hours:** 20
**Priority:** High

---

## Overview

Implement local SQLite cache for DFO operations with automatic fallback between online/offline modes, operation queue for pending syncs, and connectivity detection.

## Architecture

```
~/.dfo-cache/
├── projects/
│   ├── project-98.db      # SQLite per project
│   └── project-99.db
├── sync-queue.json        # Pending operations
└── config.json            # Cache settings
```

## Technical Specification

### SQLite Schema

```sql
-- Project cache tables (mirrors DFO schema)
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  task_code TEXT,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  progress INTEGER,
  assigned_agent_id INTEGER,
  project_id INTEGER,
  sprint_id INTEGER,
  epic_id INTEGER,
  synced_at TIMESTAMP,
  local_modified BOOLEAN DEFAULT 0
);

CREATE TABLE task_items (
  id INTEGER PRIMARY KEY,
  task_id INTEGER,
  title TEXT,
  is_completed BOOLEAN,
  notes TEXT,
  synced_at TIMESTAMP,
  local_modified BOOLEAN DEFAULT 0
);

CREATE TABLE memories (
  id INTEGER PRIMARY KEY,
  content TEXT,
  summary TEXT,
  importance REAL,
  tags TEXT,  -- JSON array
  synced_at TIMESTAMP,
  local_modified BOOLEAN DEFAULT 0
);

CREATE TABLE sync_meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP
);
```

### DFOClient API

```typescript
class DFOClient {
  private online: boolean;
  private cache: SQLiteCache;
  private queue: OperationQueue;

  constructor(options: DFOClientOptions) {
    this.cache = new SQLiteCache(options.projectId);
    this.queue = new OperationQueue();
  }

  // Connectivity management
  async checkConnectivity(): Promise<boolean>;
  async ping(): Promise<{ online: boolean; latency: number }>;

  // Operations with fallback
  async listTasks(filters: TaskFilters): Promise<Task[]>;
  async getTask(taskId: number): Promise<Task>;
  async updateTask(taskId: number, updates: TaskUpdates): Promise<void>;
  async completeTaskItem(taskId: number, itemId: number): Promise<void>;

  // Sync management
  async syncAll(): Promise<SyncResult>;
  async processQueue(): Promise<QueueResult>;
  getQueuedOperations(): Operation[];

  // Cache management
  async invalidateCache(): Promise<void>;
  async getCacheStats(): Promise<CacheStats>;
}
```

### Operation Queue

```typescript
interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'task_item' | 'memory';
  entityId: number;
  data: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}
```

### Sync Strategy

1. **Read Operations:**
   - Try remote first
   - On failure, fallback to cache
   - Update cache on success

2. **Write Operations:**
   - If online: execute immediately, update cache
   - If offline: queue operation, update local cache

3. **Reconnection:**
   - Process queue in FIFO order
   - Handle conflicts (last-write-wins)
   - Mark synced records

### Connectivity Detection

```typescript
async function detectConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('https://dfo.solaria.agency/mcp/health', {
      method: 'GET',
      timeout: 3000,
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

## File Locations

- Cache implementation: `mcp-server/src/cache/offline-cache.ts`
- DFO Client: `mcp-server/src/client/dfo-client.ts`
- SQLite wrapper: `mcp-server/src/cache/sqlite-wrapper.ts`
- Queue manager: `mcp-server/src/cache/operation-queue.ts`

## Test Cases

1. Cache initialization and schema creation
2. Read with online fallback
3. Read with offline fallback
4. Write queuing when offline
5. Queue processing on reconnect
6. Conflict resolution
7. Cache invalidation
8. Connectivity detection
9. Multiple project isolation
10. Queue persistence across restarts

## Acceptance Criteria

- [ ] SQLite cache per project
- [ ] Transparent online/offline fallback
- [ ] Operation queue with persistence
- [ ] Auto-sync on reconnection
- [ ] Health check integration
- [ ] Minimum 15 tests
- [ ] Coverage > 75%
