/**
 * Auto-Memory Creation Utilities
 * Automatically creates memories when important events occur
 *
 * @module auto-memory
 */
const defaultConfig = {
    enabled: true,
    min_importance: 0.6,
};
/**
 * Auto-create memory when task is completed
 */
export async function createTaskCompletionMemory(taskData, apiCall, config = defaultConfig) {
    if (!config.enabled) {
        return { success: false, error: 'Auto-memory disabled' };
    }
    try {
        // Build memory content
        const content = buildTaskCompletionContent(taskData);
        // Determine importance based on priority
        const importance = calculateImportance(taskData.priority);
        if (importance < config.min_importance) {
            return {
                success: false,
                error: `Importance ${importance} below threshold ${config.min_importance}`,
            };
        }
        // Create memory
        const result = await apiCall('/memories', {
            method: 'POST',
            body: JSON.stringify({
                content,
                summary: `Completed ${taskData.task_code}: ${taskData.title}`,
                tags: JSON.stringify([
                    'task_completed',
                    'context',
                    'auto_generated',
                    taskData.task_code,
                ]),
                metadata: JSON.stringify({
                    task_id: taskData.id,
                    task_code: taskData.task_code,
                    project_id: taskData.project_id,
                    completed_at: new Date().toISOString(),
                    priority: taskData.priority,
                    items_completed: taskData.items_completed,
                    items_total: taskData.items_total,
                    auto_generated: true,
                }),
                importance,
                project_id: taskData.project_id,
            }),
        });
        return {
            success: true,
            memory_id: result.id,
        };
    }
    catch (error) {
        console.error('Failed to create auto-memory:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * Build rich content for task completion memory
 */
function buildTaskCompletionContent(taskData) {
    let content = `✅ Completed ${taskData.task_code}: ${taskData.title}\n\n`;
    // Add priority badge
    const priorityBadge = {
        critical: '🔴 CRITICAL',
        high: '🟠 HIGH',
        medium: '🟡 MEDIUM',
        low: '🟢 LOW',
    }[taskData.priority.toLowerCase()] || taskData.priority.toUpperCase();
    content += `**Priority:** ${priorityBadge}\n\n`;
    // Add subtask summary if available
    if (taskData.items_total !== undefined &&
        taskData.items_completed !== undefined) {
        content += `**Subtasks:** ${taskData.items_completed}/${taskData.items_total} completed\n\n`;
    }
    // Add completion notes if provided
    if (taskData.completion_notes) {
        content += `**Completion Notes:**\n${taskData.completion_notes}\n\n`;
    }
    // Add auto-generated footer
    content += `---\n`;
    content += `🤖 Auto-generated memory on task completion\n`;
    content += `📅 ${new Date().toISOString()}\n`;
    return content;
}
/**
 * Calculate importance based on task priority
 */
function calculateImportance(priority) {
    const importanceMap = {
        critical: 1.0,
        high: 0.8,
        medium: 0.6,
        low: 0.4,
    };
    return importanceMap[priority.toLowerCase()] || 0.5;
}
/**
 * Auto-create memory when session ends
 */
export async function createSessionEndMemory(sessionData, apiCall) {
    try {
        let content = `📝 Session Summary\n\n`;
        if (sessionData.tasks_completed.length > 0) {
            content += `**Completed Tasks:**\n`;
            sessionData.tasks_completed.forEach((task) => {
                content += `- ✅ ${task}\n`;
            });
            content += `\n`;
        }
        if (sessionData.tasks_in_progress.length > 0) {
            content += `**Still In Progress:**\n`;
            sessionData.tasks_in_progress.forEach((task) => {
                content += `- 🔄 ${task}\n`;
            });
            content += `\n`;
        }
        if (sessionData.key_decisions && sessionData.key_decisions.length > 0) {
            content += `**Key Decisions:**\n`;
            sessionData.key_decisions.forEach((decision) => {
                content += `- 📌 ${decision}\n`;
            });
            content += `\n`;
        }
        content += `**Time Spent:** ${sessionData.time_spent_minutes} minutes\n`;
        content += `**Session End:** ${new Date().toISOString()}\n`;
        const result = await apiCall('/memories', {
            method: 'POST',
            body: JSON.stringify({
                content,
                summary: `Session ended: ${sessionData.tasks_completed.length} tasks completed`,
                tags: JSON.stringify([
                    'session',
                    'context',
                    'auto_generated',
                    'session_end',
                ]),
                metadata: JSON.stringify({
                    tasks_completed_count: sessionData.tasks_completed.length,
                    tasks_in_progress_count: sessionData.tasks_in_progress.length,
                    time_spent_minutes: sessionData.time_spent_minutes,
                    session_end: new Date().toISOString(),
                    auto_generated: true,
                }),
                importance: 0.7,
                project_id: sessionData.project_id,
            }),
        });
        return {
            success: true,
            memory_id: result.id,
        };
    }
    catch (error) {
        console.error('Failed to create session end memory:', error);
        return { success: false };
    }
}
//# sourceMappingURL=auto-memory.js.map