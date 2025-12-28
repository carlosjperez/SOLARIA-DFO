/**
 * Operation Queue for Offline Sync
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-009
 *
 * Manages pending operations when offline
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ============================================================================
// Types
// ============================================================================

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'complete';
  entity: 'task' | 'task_item' | 'memory' | 'dependency';
  entityId: number;
  data: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  projectId: number;
}

export interface QueueStats {
  total: number;
  byType: Record<string, number>;
  byEntity: Record<string, number>;
  oldestOperation: string | null;
  failedCount: number;
}

// ============================================================================
// Operation Queue Class
// ============================================================================

export class OperationQueue {
  private queuePath: string;
  private queue: QueuedOperation[] = [];
  private maxRetries: number = 3;

  constructor(cacheDir?: string) {
    const dir = cacheDir || join(homedir(), '.dfo-cache');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    this.queuePath = join(dir, 'sync-queue.json');
    this.load();
  }

  /**
   * Load queue from disk
   */
  private load(): void {
    if (existsSync(this.queuePath)) {
      try {
        const data = readFileSync(this.queuePath, 'utf-8');
        this.queue = JSON.parse(data);
      } catch {
        this.queue = [];
      }
    }
  }

  /**
   * Save queue to disk
   */
  private save(): void {
    writeFileSync(this.queuePath, JSON.stringify(this.queue, null, 2));
  }

  /**
   * Generate unique operation ID
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add operation to queue
   */
  add(operation: Omit<QueuedOperation, 'id' | 'createdAt' | 'retryCount'>): string {
    const id = this.generateId();
    const queuedOp: QueuedOperation = {
      ...operation,
      id,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    this.queue.push(queuedOp);
    this.save();
    return id;
  }

  /**
   * Get all pending operations
   */
  getAll(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Get operations for a specific project
   */
  getByProject(projectId: number): QueuedOperation[] {
    return this.queue.filter((op) => op.projectId === projectId);
  }

  /**
   * Get next operation to process (FIFO)
   */
  peek(): QueuedOperation | undefined {
    return this.queue[0];
  }

  /**
   * Remove operation after successful processing
   */
  remove(operationId: string): boolean {
    const index = this.queue.findIndex((op) => op.id === operationId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Mark operation as failed and increment retry count
   */
  markFailed(operationId: string, error: string): boolean {
    const op = this.queue.find((o) => o.id === operationId);
    if (op) {
      op.retryCount++;
      op.lastError = error;

      // Remove if max retries exceeded
      if (op.retryCount >= this.maxRetries) {
        this.remove(operationId);
        return false; // Indicates permanently failed
      }

      this.save();
      return true; // Will retry
    }
    return false;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const byType: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    let failedCount = 0;
    let oldestOperation: string | null = null;

    for (const op of this.queue) {
      byType[op.type] = (byType[op.type] || 0) + 1;
      byEntity[op.entity] = (byEntity[op.entity] || 0) + 1;

      if (op.retryCount > 0) failedCount++;

      if (!oldestOperation || op.createdAt < oldestOperation) {
        oldestOperation = op.createdAt;
      }
    }

    return {
      total: this.queue.length,
      byType,
      byEntity,
      oldestOperation,
      failedCount,
    };
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.queue = [];
    this.save();
  }

  /**
   * Clear operations for a specific project
   */
  clearProject(projectId: number): number {
    const initialCount = this.queue.length;
    this.queue = this.queue.filter((op) => op.projectId !== projectId);
    this.save();
    return initialCount - this.queue.length;
  }

  /**
   * Get operations that need retry
   */
  getRetryable(): QueuedOperation[] {
    return this.queue.filter((op) => op.retryCount > 0 && op.retryCount < this.maxRetries);
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Get count of pending operations
   */
  count(): number {
    return this.queue.length;
  }
}
