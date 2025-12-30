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
export async function getWorkContext(
  projectId: number | null,
  apiCall: ApiCallFunction
): Promise<WorkContextResult> {
  if (!projectId) {
    return {
      project: null,
      current_tasks: [],
      recent_context: [],
      ready_tasks: [],
      suggested_next_actions: [
        {
          action: 'start_task',
          task_code: 'N/A',
          task_id: 0,
          reason:
            'No project context set. Call set_project_context first.',
        },
      ],
      protocol_status: {
        tasks_in_progress: 0,
        pending_items_total: 0,
        recent_memories_count: 0,
        ready_tasks_count: 0,
      },
      session_continuity: {
        unfinished_work_detected: false,
      },
    };
  }

  try {
    // Parallel fetch for performance
    const [project, allTasks, allMemories] = await Promise.all([
      apiCall(`/projects/${projectId}`).catch(() => null),
      apiCall(`/tasks?project_id=${projectId}`).catch(() => []),
      apiCall(
        `/memories?tags=session,context,task_completed&limit=20`
      ).catch(() => ({ memories: [] })),
    ]);

    // Get in-progress tasks
    const inProgressTasks = (allTasks as any[]).filter(
      (t) => t.status === 'in_progress'
    );

    // Load subtasks for each in-progress task
    const tasksWithItems = await Promise.all(
      inProgressTasks.map(async (task) => {
        try {
          const itemsResult = (await apiCall(
            `/tasks/${task.id}/items`
          )) as { items: any[] };
          const items = itemsResult.items || [];
          const pending = items.filter((i) => !i.is_completed);

          return {
            id: task.id,
            task_code: task.task_code,
            title: task.title,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            items_total: items.length,
            items_completed: items.filter((i) => i.is_completed).length,
            pending_items: pending.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              estimated_minutes: item.estimated_minutes,
            })),
          };
        } catch (error) {
          console.error(
            `Failed to load items for task ${task.id}:`,
            error
          );
          return {
            id: task.id,
            task_code: task.task_code,
            title: task.title,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            items_total: 0,
            items_completed: 0,
            pending_items: [],
          };
        }
      })
    );

    // Get recent memories (context from previous sessions)
    const memories = (allMemories as any).memories || [];
    const recentContext = memories
      .slice(0, 10)
      .map((mem: any) => ({
        id: mem.id,
        content: mem.content.substring(0, 500), // Truncate for overview
        tags: mem.tags,
        importance: mem.importance,
        created_at: mem.created_at,
      }));

    // Get ready tasks (smart prioritization)
    let readyTasks: any[] = [];
    try {
      const readyResult = (await apiCall(
        `/tasks/ready?project_id=${projectId}&limit=5`
      )) as any;
      readyTasks = readyResult.tasks || [];
    } catch (error) {
      console.error('Failed to load ready tasks:', error);
    }

    // Generate suggested next actions
    const suggestions = [];

    // Priority 1: Continue in-progress tasks
    if (tasksWithItems.length > 0) {
      const task = tasksWithItems[0];
      const nextItem = task.pending_items[0];

      if (nextItem) {
        suggestions.push({
          action: 'continue_task' as const,
          task_code: task.task_code,
          task_id: task.id,
          reason: `You have ${task.pending_items.length} pending items in ${task.task_code}`,
          next_step: nextItem.title,
        });
      } else if (task.items_total > 0) {
        // All items completed, task ready to complete
        suggestions.push({
          action: 'complete_task' as const,
          task_code: task.task_code,
          task_id: task.id,
          reason: `All ${task.items_total} items completed in ${task.task_code}`,
          next_step: `Call complete_task(${task.id}) to mark as done`,
        });
      }
    }

    // Priority 2: Start ready tasks
    if (suggestions.length === 0 && readyTasks.length > 0) {
      const task = readyTasks[0];
      suggestions.push({
        action: 'start_task' as const,
        task_code: task.task_code,
        task_id: task.id,
        reason: `Highest priority ready task (${task.priority}, readiness: ${task.readiness_score}%)`,
        next_step: `Call create_task_items(${task.id}) to break down work, then update_task(status: in_progress)`,
      });
    }

    // Calculate total pending items
    const pendingItemsTotal = tasksWithItems.reduce(
      (sum, t) => sum + t.pending_items.length,
      0
    );

    // Detect session continuity
    const lastSessionMemory = memories.find((m: any) =>
      m.tags?.includes('session')
    );

    const sessionContinuity = {
      last_session_summary: lastSessionMemory?.content.substring(
        0,
        200
      ),
      last_active_task:
        tasksWithItems.length > 0
          ? tasksWithItems[0].task_code
          : undefined,
      unfinished_work_detected:
        tasksWithItems.length > 0 || pendingItemsTotal > 0,
    };

    return {
      project: project
        ? {
            id: (project as any).id,
            name: (project as any).name,
            code: (project as any).code,
            status: (project as any).status,
          }
        : null,
      current_tasks: tasksWithItems,
      recent_context: recentContext,
      ready_tasks: readyTasks.slice(0, 3).map((t: any) => ({
        id: t.id,
        task_code: t.task_code,
        title: t.title,
        priority: t.priority,
        readiness_score: t.readiness_score,
        readiness_reasons: t.readiness_reasons || [],
      })),
      suggested_next_actions: suggestions,
      protocol_status: {
        tasks_in_progress: inProgressTasks.length,
        pending_items_total: pendingItemsTotal,
        recent_memories_count: memories.length,
        ready_tasks_count: readyTasks.length,
      },
      session_continuity: sessionContinuity,
    };
  } catch (error) {
    console.error('Failed to get work context:', error);
    throw error;
  }
}
