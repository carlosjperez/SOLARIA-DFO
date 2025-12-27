/**
 * DFO Client with Offline Support
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-009
 *
 * Provides transparent online/offline fallback for DFO operations
 */

import { SQLiteCache, CacheConfig } from '../cache/sqlite-wrapper.js';
import { OperationQueue, QueuedOperation } from '../cache/operation-queue.js';

// ============================================================================
// Types
// ============================================================================

export interface DFOClientConfig {
  projectId: number;
  baseUrl?: string;
  timeout?: number;
  cacheDir?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

export interface ConnectivityStatus {
  online: boolean;
  latency: number | null;
  lastCheck: Date;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
  duration: number;
}

export interface TaskFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  epic_id?: number;
  sprint_id?: number;
}

export interface Task {
  id: number;
  task_code?: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  progress: number;
  assigned_agent_id?: number;
  project_id: number;
  sprint_id?: number;
  epic_id?: number;
}

export interface TaskUpdates {
  status?: string;
  progress?: number;
  priority?: string;
  title?: string;
  description?: string;
}

// ============================================================================
// DFO Client Class
// ============================================================================

export class DFOClient {
  private cache: SQLiteCache;
  private queue: OperationQueue;
  private projectId: number;
  private baseUrl: string;
  private timeout: number;
  private online: boolean = false;
  private lastConnectivityCheck: Date | null = null;
  private syncIntervalId: NodeJS.Timeout | null = null;

  constructor(config: DFOClientConfig) {
    this.projectId = config.projectId;
    this.baseUrl = config.baseUrl || 'https://dfo.solaria.agency';
    this.timeout = config.timeout || 5000;

    this.cache = new SQLiteCache({
      projectId: config.projectId,
      cacheDir: config.cacheDir,
    });

    this.queue = new OperationQueue(config.cacheDir);

    // Auto-sync if enabled
    if (config.autoSync) {
      const interval = config.syncInterval || 60000; // Default 1 minute
      this.startAutoSync(interval);
    }
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  async initialize(): Promise<void> {
    await this.cache.initialize();
    await this.checkConnectivity();
  }

  async close(): Promise<void> {
    this.stopAutoSync();
    await this.cache.close();
  }

  // ============================================================================
  // Connectivity Management
  // ============================================================================

  async checkConnectivity(): Promise<ConnectivityStatus> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/mcp/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      this.online = response.ok;
      this.lastConnectivityCheck = new Date();

      return {
        online: this.online,
        latency,
        lastCheck: this.lastConnectivityCheck,
      };
    } catch (error) {
      this.online = false;
      this.lastConnectivityCheck = new Date();

      return {
        online: false,
        latency: null,
        lastCheck: this.lastConnectivityCheck,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async ping(): Promise<{ online: boolean; latency: number }> {
    const status = await this.checkConnectivity();
    return {
      online: status.online,
      latency: status.latency || -1,
    };
  }

  isOnline(): boolean {
    return this.online;
  }

  // ============================================================================
  // Task Operations (with fallback)
  // ============================================================================

  async listTasks(filters?: TaskFilters): Promise<Task[]> {
    // Try online first
    if (this.online) {
      try {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.priority) params.set('priority', filters.priority);
        if (filters?.epic_id) params.set('epic_id', String(filters.epic_id));
        if (filters?.sprint_id) params.set('sprint_id', String(filters.sprint_id));
        params.set('project_id', String(this.projectId));

        const response = await this.fetchWithTimeout(
          `${this.baseUrl}/api/tasks?${params.toString()}`
        );

        if (response.ok) {
          const data = await response.json();
          const tasks = data.tasks || data.data || [];

          // Update cache with fresh data
          await this.cache.cacheTasks(tasks);

          return tasks;
        }
      } catch (error) {
        console.warn('Online fetch failed, falling back to cache:', error);
      }
    }

    // Fallback to cache
    return this.cache.getCachedTasks(filters);
  }

  async getTask(taskId: number): Promise<Task | null> {
    // Try online first
    if (this.online) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseUrl}/api/tasks/${taskId}`
        );

        if (response.ok) {
          const data = await response.json();
          const task = data.task || data.data;

          // Update cache
          if (task) {
            await this.cache.cacheTasks([task]);
          }

          return task;
        }
      } catch (error) {
        console.warn('Online fetch failed, falling back to cache:', error);
      }
    }

    // Fallback to cache
    return this.cache.getCachedTask(taskId) || null;
  }

  async updateTask(taskId: number, updates: TaskUpdates): Promise<void> {
    if (this.online) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseUrl}/api/tasks/${taskId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }
        );

        if (response.ok) {
          // Update local cache
          await this.cache.updateCachedTask(taskId, updates);
          await this.cache.clearModifiedFlag(taskId);
          return;
        }
      } catch (error) {
        console.warn('Online update failed, queuing for later:', error);
      }
    }

    // Queue operation for later sync
    this.queue.add({
      type: 'update',
      entity: 'task',
      entityId: taskId,
      data: updates,
      projectId: this.projectId,
    });

    // Update local cache
    await this.cache.updateCachedTask(taskId, updates);
  }

  async completeTaskItem(taskId: number, itemId: number): Promise<void> {
    if (this.online) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseUrl}/api/tasks/${taskId}/items/${itemId}/complete`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (response.ok) {
          return;
        }
      } catch (error) {
        console.warn('Online complete failed, queuing for later:', error);
      }
    }

    // Queue operation for later sync
    this.queue.add({
      type: 'complete',
      entity: 'task_item',
      entityId: itemId,
      data: { task_id: taskId },
      projectId: this.projectId,
    });
  }

  // ============================================================================
  // Sync Management
  // ============================================================================

  async syncAll(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let synced = 0;
    let failed = 0;

    // Check connectivity first
    await this.checkConnectivity();

    if (!this.online) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Offline - cannot sync'],
        duration: Date.now() - startTime,
      };
    }

    // Process queued operations
    const queueResult = await this.processQueue();
    synced += queueResult.synced;
    failed += queueResult.failed;
    errors.push(...queueResult.errors);

    // Sync modified local tasks
    const modifiedTasks = await this.cache.getModifiedTasks();
    for (const task of modifiedTasks) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseUrl}/api/tasks/${task.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
          }
        );

        if (response.ok) {
          await this.cache.clearModifiedFlag(task.id);
          synced++;
        } else {
          failed++;
          errors.push(`Failed to sync task ${task.id}: ${response.status}`);
        }
      } catch (error) {
        failed++;
        errors.push(
          `Error syncing task ${task.id}: ${error instanceof Error ? error.message : 'Unknown'}`
        );
      }
    }

    // Refresh cache from server
    try {
      await this.listTasks(); // This will update cache
    } catch (error) {
      console.warn('Failed to refresh cache:', error);
    }

    await this.cache.setLastSyncTime();

    return {
      success: failed === 0,
      synced,
      failed,
      errors,
      duration: Date.now() - startTime,
    };
  }

  async processQueue(): Promise<{ synced: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let synced = 0;
    let failed = 0;

    if (!this.online) {
      return { synced: 0, failed: 0, errors: ['Offline'] };
    }

    const operations = this.queue.getByProject(this.projectId);

    for (const op of operations) {
      try {
        const success = await this.executeOperation(op);
        if (success) {
          this.queue.remove(op.id);
          synced++;
        } else {
          const willRetry = this.queue.markFailed(op.id, 'Execution failed');
          if (!willRetry) {
            failed++;
            errors.push(`Operation ${op.id} permanently failed`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const willRetry = this.queue.markFailed(op.id, errorMessage);
        if (!willRetry) {
          failed++;
          errors.push(`Operation ${op.id}: ${errorMessage}`);
        }
      }
    }

    return { synced, failed, errors };
  }

  private async executeOperation(op: QueuedOperation): Promise<boolean> {
    let url: string;
    let method: string;
    let body: string | undefined;

    switch (op.entity) {
      case 'task':
        url = `${this.baseUrl}/api/tasks/${op.entityId}`;
        method = op.type === 'delete' ? 'DELETE' : 'PUT';
        body = op.type !== 'delete' ? JSON.stringify(op.data) : undefined;
        break;

      case 'task_item':
        if (op.type === 'complete') {
          url = `${this.baseUrl}/api/tasks/${op.data.task_id}/items/${op.entityId}/complete`;
          method = 'POST';
        } else {
          url = `${this.baseUrl}/api/task-items/${op.entityId}`;
          method = op.type === 'delete' ? 'DELETE' : 'PUT';
          body = op.type !== 'delete' ? JSON.stringify(op.data) : undefined;
        }
        break;

      case 'memory':
        url = `${this.baseUrl}/api/memories/${op.entityId}`;
        method = op.type === 'delete' ? 'DELETE' : 'PUT';
        body = op.type !== 'delete' ? JSON.stringify(op.data) : undefined;
        break;

      case 'dependency':
        url = `${this.baseUrl}/api/dependencies/${op.entityId}`;
        method = op.type === 'delete' ? 'DELETE' : 'POST';
        body = JSON.stringify(op.data);
        break;

      default:
        return false;
    }

    const response = await this.fetchWithTimeout(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
    });

    return response.ok;
  }

  getQueuedOperations(): QueuedOperation[] {
    return this.queue.getByProject(this.projectId);
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  async invalidateCache(): Promise<void> {
    await this.cache.clear();
    await this.cache.initialize();
  }

  async getCacheStats(): Promise<{
    totalTasks: number;
    modifiedTasks: number;
    lastSync: Date | null;
    cacheSize: number;
    queuedOperations: number;
  }> {
    const cacheStats = await this.cache.getStats();
    return {
      ...cacheStats,
      queuedOperations: this.queue.getByProject(this.projectId).length,
    };
  }

  // ============================================================================
  // Auto-Sync
  // ============================================================================

  startAutoSync(interval: number): void {
    this.stopAutoSync();
    this.syncIntervalId = setInterval(async () => {
      await this.checkConnectivity();
      if (this.online && this.queue.count() > 0) {
        await this.syncAll();
      }
    }, interval);
  }

  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private async fetchWithTimeout(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ============================================================================
  // Status Line (for DFN-010 skill integration)
  // ============================================================================

  async getStatusLine(): Promise<StatusLine> {
    const cacheStats = await this.getCacheStats();
    const lastSync = cacheStats.lastSync
      ? formatTimeSince(cacheStats.lastSync)
      : null;

    const online = this.isOnline();
    const projectId = this.projectId;
    const taskCount = cacheStats.totalTasks;
    const queuedCount = cacheStats.queuedOperations;

    let formatted: string;

    if (online) {
      formatted = `DFO: ⚡ Online | Proj: ${projectId} | 📝 ${taskCount} tasks${
        lastSync ? ` | 🔄 ${lastSync}` : ''
      }`;
    } else {
      formatted = `DFO: 📴 Offline | Proj: ${projectId} | 📝 ${taskCount} cached${
        queuedCount > 0 ? ` | ⏳ ${queuedCount} queued` : ''
      }`;
    }

    return {
      online,
      projectId,
      taskCount,
      queuedCount,
      lastSync,
      formatted,
    };
  }
}

// ============================================================================
// Status Line Types (for DFN-010 skill integration)
// ============================================================================

export interface StatusLine {
  online: boolean;
  projectId: number;
  taskCount: number;
  queuedCount: number;
  lastSync: string | null;
  formatted: string;
}

/**
 * Format time since last sync
 */
function formatTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'just now';
}

// ============================================================================
// Offline Mode Warnings (for DFN-010)
// ============================================================================

export const OFFLINE_WARNINGS = {
  offline: `
⚠️ Operating in OFFLINE mode
Changes will be queued and synced when connection restored.
Use /dfo sync --force to retry connection.
`,

  queue: (count: number) => `
📤 ${count} operation(s) pending sync
Use /dfo sync to upload when online.
`,

  staleCache: (hours: number) => `
⏰ Cache is ${hours}h old - consider syncing when online.
`,
};

// ============================================================================
// Factory Function
// ============================================================================

export async function createDFOClient(
  config: DFOClientConfig
): Promise<DFOClient> {
  const client = new DFOClient(config);
  await client.initialize();
  return client;
}
