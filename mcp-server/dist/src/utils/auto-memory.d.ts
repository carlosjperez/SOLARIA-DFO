/**
 * Auto-Memory Creation Utilities
 * Automatically creates memories when important events occur
 *
 * @module auto-memory
 */
import type { ApiCallFunction } from '../../types.js';
export interface AutoMemoryConfig {
    enabled: boolean;
    min_importance: number;
}
/**
 * Auto-create memory when task is completed
 */
export declare function createTaskCompletionMemory(taskData: {
    id: number;
    task_code: string;
    title: string;
    completion_notes?: string;
    items_total?: number;
    items_completed?: number;
    project_id: number;
    priority: string;
}, apiCall: ApiCallFunction, config?: AutoMemoryConfig): Promise<{
    success: boolean;
    memory_id?: number;
    error?: string;
}>;
/**
 * Auto-create memory when session ends
 */
export declare function createSessionEndMemory(sessionData: {
    tasks_completed: string[];
    tasks_in_progress: string[];
    time_spent_minutes: number;
    key_decisions?: string[];
    project_id: number;
}, apiCall: ApiCallFunction): Promise<{
    success: boolean;
    memory_id?: number;
}>;
