/**
 * Work Context Endpoint
 * Auto-resume protocol: Returns everything an agent needs to resume work
 *
 * @module work-context
 */
import type { ApiCallFunction } from '../../types.js';
export interface WorkContextResult {
    project: {
        id: number;
        name: string;
        code: string;
        status: string;
    } | null;
    current_tasks: Array<{
        id: number;
        task_code: string;
        title: string;
        status: string;
        priority: string;
        progress: number;
        items_total: number;
        items_completed: number;
        pending_items: Array<{
            id: number;
            title: string;
            description?: string;
            estimated_minutes?: number;
        }>;
    }>;
    recent_context: Array<{
        id: number;
        content: string;
        tags: string[];
        importance: number;
        created_at: string;
    }>;
    ready_tasks: Array<{
        id: number;
        task_code: string;
        title: string;
        priority: string;
        readiness_score: number;
        readiness_reasons: string[];
    }>;
    suggested_next_actions: Array<{
        action: 'continue_task' | 'start_task' | 'complete_task';
        task_code: string;
        task_id: number;
        reason: string;
        next_step?: string;
    }>;
    protocol_status: {
        tasks_in_progress: number;
        pending_items_total: number;
        recent_memories_count: number;
        ready_tasks_count: number;
    };
    session_continuity: {
        last_session_summary?: string;
        last_active_task?: string;
        unfinished_work_detected: boolean;
    };
}
/**
 * Get comprehensive work context for resuming work
 * This is the auto-resume protocol implementation
 */
export declare function getWorkContext(projectId: number | null, apiCall: ApiCallFunction): Promise<WorkContextResult>;
