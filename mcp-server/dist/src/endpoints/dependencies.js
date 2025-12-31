/**
 * Task Dependencies Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-007
 *
 * Manages explicit dependency relationships between tasks with cycle detection
 */
import { z } from 'zod';
import { ResponseBuilder, CommonErrors } from '../utils/response-builder.js';
import { db } from '../database.js';
const VERSION = '2.0.0';
// ============================================================================
// Validation Schemas
// ============================================================================
const DependencyTypeSchema = z.enum(['blocks', 'requires', 'related', 'child_of']);
const AddDependencyInputSchema = z.object({
    task_id: z.number().int().positive(),
    depends_on_task_id: z.number().int().positive(),
    dependency_type: DependencyTypeSchema.default('blocks'),
    notes: z.string().max(500).optional(),
    format: z.enum(['json', 'human']).default('json'),
});
const RemoveDependencyInputSchema = z.object({
    task_id: z.number().int().positive(),
    depends_on_task_id: z.number().int().positive(),
    format: z.enum(['json', 'human']).default('json'),
});
const GetDependenciesInputSchema = z.object({
    task_id: z.number().int().positive(),
    direction: z.enum(['upstream', 'downstream', 'both']).default('both'),
    include_transitive: z.boolean().default(false),
    format: z.enum(['json', 'human']).default('json'),
});
const DetectCycleInputSchema = z.object({
    task_id: z.number().int().positive(),
    depends_on_task_id: z.number().int().positive(),
    format: z.enum(['json', 'human']).default('json'),
});
const GetBlockedTasksInputSchema = z.object({
    project_id: z.number().int().positive().optional(),
    include_blocker_details: z.boolean().default(true),
    format: z.enum(['json', 'human']).default('json'),
});
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Check if adding a dependency would create a cycle using DFS
 */
async function detectCycle(taskId, dependsOnId) {
    // Cannot depend on self
    if (taskId === dependsOnId) {
        const taskCode = await getTaskCode(taskId);
        return { hasCycle: true, path: [taskCode, taskCode] };
    }
    // Get all existing dependencies as a map
    const allDeps = await db.query(`
    SELECT
      td.task_id,
      td.depends_on_task_id,
      CONCAT(p.code, '-', t.task_number) as task_code
    FROM task_dependencies td
    JOIN tasks t ON td.task_id = t.id
    JOIN projects p ON t.project_id = p.id
    WHERE td.dependency_type IN ('blocks', 'requires')
  `);
    // Build adjacency list
    const graph = new Map();
    const taskCodeMap = new Map();
    for (const dep of allDeps) {
        taskCodeMap.set(dep.task_id, dep.task_code);
        if (!graph.has(dep.task_id)) {
            graph.set(dep.task_id, []);
        }
        graph.get(dep.task_id).push(dep.depends_on_task_id);
    }
    // Get task codes for the new dependency
    const newTaskCode = await getTaskCode(taskId);
    const dependsOnCode = await getTaskCode(dependsOnId);
    taskCodeMap.set(taskId, newTaskCode);
    taskCodeMap.set(dependsOnId, dependsOnCode);
    // Simulate adding the new dependency
    if (!graph.has(taskId)) {
        graph.set(taskId, []);
    }
    graph.get(taskId).push(dependsOnId);
    // DFS to detect cycle starting from dependsOnId back to taskId
    const visited = new Set();
    const path = [];
    function dfs(current) {
        if (current === taskId) {
            return true; // Found cycle back to original task
        }
        if (visited.has(current)) {
            return false;
        }
        visited.add(current);
        path.push(current);
        const deps = graph.get(current) || [];
        for (const dep of deps) {
            if (dfs(dep)) {
                return true;
            }
        }
        path.pop();
        return false;
    }
    const hasCycle = dfs(dependsOnId);
    if (hasCycle) {
        const cyclePath = [newTaskCode, ...path.map((id) => taskCodeMap.get(id) || `#${id}`), newTaskCode];
        return { hasCycle: true, path: cyclePath };
    }
    return { hasCycle: false, path: [] };
}
/**
 * Get task code for a given task ID
 */
async function getTaskCode(taskId) {
    const result = await db.query(`SELECT CONCAT(p.code, '-', t.task_number) as task_code
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     WHERE t.id = ?`, [taskId]);
    return result[0]?.task_code || `#${taskId}`;
}
/**
 * Check if a task exists
 */
async function taskExists(taskId) {
    const result = await db.query('SELECT id FROM tasks WHERE id = ?', [taskId]);
    return result.length > 0;
}
/**
 * Get transitive dependencies recursively
 */
async function getTransitiveDependencies(taskId, direction, visited = new Set()) {
    if (visited.has(taskId)) {
        return [];
    }
    visited.add(taskId);
    const query = direction === 'upstream'
        ? `
        SELECT
          td.id,
          td.task_id,
          CONCAT(p1.code, '-', t1.task_number) as task_code,
          t1.title as task_title,
          td.depends_on_task_id,
          CONCAT(p2.code, '-', t2.task_number) as depends_on_task_code,
          t2.title as depends_on_task_title,
          t2.status as depends_on_status,
          t2.progress as depends_on_progress,
          td.dependency_type,
          td.created_at,
          td.notes
        FROM task_dependencies td
        JOIN tasks t1 ON td.task_id = t1.id
        JOIN projects p1 ON t1.project_id = p1.id
        JOIN tasks t2 ON td.depends_on_task_id = t2.id
        JOIN projects p2 ON t2.project_id = p2.id
        WHERE td.task_id = ?
        ORDER BY t2.task_number
      `
        : `
        SELECT
          td.id,
          td.task_id,
          CONCAT(p1.code, '-', t1.task_number) as task_code,
          t1.title as task_title,
          td.depends_on_task_id,
          CONCAT(p2.code, '-', t2.task_number) as depends_on_task_code,
          t2.title as depends_on_task_title,
          t2.status as depends_on_status,
          t2.progress as depends_on_progress,
          td.dependency_type,
          td.created_at,
          td.notes
        FROM task_dependencies td
        JOIN tasks t1 ON td.task_id = t1.id
        JOIN projects p1 ON t1.project_id = p1.id
        JOIN tasks t2 ON td.depends_on_task_id = t2.id
        JOIN projects p2 ON t2.project_id = p2.id
        WHERE td.depends_on_task_id = ?
        ORDER BY t1.task_number
      `;
    const deps = await db.query(query, [taskId]);
    const result = deps.map((d) => ({
        ...d,
        is_blocking: ['blocks', 'requires'].includes(d.dependency_type) && d.depends_on_status !== 'completed',
    }));
    // Recursively get transitive dependencies
    for (const dep of deps) {
        const nextId = direction === 'upstream' ? dep.depends_on_task_id : dep.task_id;
        const transitive = await getTransitiveDependencies(nextId, direction, visited);
        result.push(...transitive);
    }
    return result;
}
/**
 * Format dependencies for human output
 */
function formatDependencies(taskCode, upstream, downstream, isBlocked) {
    const lines = [`Task ${taskCode}`, ''];
    // Upstream dependencies
    if (upstream.length > 0) {
        lines.push('Upstream Dependencies (blocks this task):');
        upstream.forEach((dep, i) => {
            const icon = dep.depends_on_status === 'completed' ? '  ' : '  ';
            lines.push(`  ${i + 1}. ${icon} ${dep.depends_on_task_code} ${dep.depends_on_task_title} (${dep.depends_on_status})`);
        });
    }
    else {
        lines.push('Upstream Dependencies: None');
    }
    lines.push('');
    // Downstream dependencies
    if (downstream.length > 0) {
        lines.push('Downstream Dependencies (blocked by this task):');
        downstream.forEach((dep, i) => {
            const icon = dep.depends_on_status === 'completed' ? '  ' : '  ';
            lines.push(`  ${i + 1}. ${icon} ${dep.task_code} ${dep.task_title}`);
        });
    }
    else {
        lines.push('Downstream Dependencies: None');
    }
    lines.push('');
    lines.push(`Status: ${isBlocked ? ' Blocked by incomplete upstream dependencies' : ' Not blocked (all upstream complete)'}`);
    return lines.join('\n');
}
/**
 * Format blocked tasks for human output
 */
function formatBlockedTasks(blockedTasks) {
    if (blockedTasks.length === 0) {
        return ' No Blocked Tasks\n\nAll tasks have their dependencies satisfied.';
    }
    const lines = [` Blocked Tasks (${blockedTasks.length}):`, ''];
    blockedTasks.forEach((task, i) => {
        lines.push(`${i + 1}.  ${task.task_code}: ${task.task_title}`);
        if (task.blockers.length === 1) {
            const blocker = task.blockers[0];
            lines.push(`   Blocked by: ${blocker.task_code} (${blocker.status}, ${blocker.progress}%)`);
        }
        else {
            lines.push('   Blocked by:');
            task.blockers.forEach((blocker) => {
                lines.push(`     - ${blocker.task_code} (${blocker.status}, ${blocker.progress}%)`);
            });
        }
        lines.push('');
    });
    return lines.join('\n');
}
// ============================================================================
// Endpoint Implementations
// ============================================================================
/**
 * Add a dependency between two tasks
 */
export const addDependency = {
    name: 'add_dependency',
    description: 'Create a dependency relationship between two tasks. Task A depends on Task B means A cannot start until B is complete.',
    inputSchema: AddDependencyInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            // Validate both tasks exist
            if (!(await taskExists(params.task_id))) {
                return builder.error(CommonErrors.notFound('task', params.task_id));
            }
            if (!(await taskExists(params.depends_on_task_id))) {
                return builder.error(CommonErrors.notFound('task', params.depends_on_task_id));
            }
            // Check for self-dependency
            if (params.task_id === params.depends_on_task_id) {
                return builder.error({
                    code: 'INVALID_DEPENDENCY',
                    message: 'A task cannot depend on itself',
                    details: { task_id: params.task_id },
                    suggestion: 'Specify a different task for the dependency',
                });
            }
            // Check for cycles
            const cycleCheck = await detectCycle(params.task_id, params.depends_on_task_id);
            if (cycleCheck.hasCycle) {
                return builder.error({
                    code: 'CYCLE_DETECTED',
                    message: 'Adding this dependency would create a circular dependency',
                    details: { cycle_path: cycleCheck.path },
                    suggestion: 'Review the dependency chain and remove or restructure dependencies',
                });
            }
            // Insert the dependency
            try {
                await db.execute(`INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, notes)
           VALUES (?, ?, ?, ?)`, [params.task_id, params.depends_on_task_id, params.dependency_type, params.notes || null]);
            }
            catch (dbError) {
                if (dbError.code === 'ER_DUP_ENTRY') {
                    return builder.error({
                        code: 'DUPLICATE_DEPENDENCY',
                        message: 'This dependency already exists',
                        details: { task_id: params.task_id, depends_on_task_id: params.depends_on_task_id },
                        suggestion: 'Use update_dependency to modify or remove_dependency to recreate',
                    });
                }
                throw dbError;
            }
            // Fetch the created dependency
            const [dependency] = await db.query(`SELECT
          td.id,
          td.task_id,
          CONCAT(p1.code, '-', t1.task_number) as task_code,
          t1.title as task_title,
          td.depends_on_task_id,
          CONCAT(p2.code, '-', t2.task_number) as depends_on_task_code,
          t2.title as depends_on_task_title,
          t2.status as depends_on_status,
          td.dependency_type,
          td.created_at,
          td.notes
        FROM task_dependencies td
        JOIN tasks t1 ON td.task_id = t1.id
        JOIN projects p1 ON t1.project_id = p1.id
        JOIN tasks t2 ON td.depends_on_task_id = t2.id
        JOIN projects p2 ON t2.project_id = p2.id
        WHERE td.task_id = ? AND td.depends_on_task_id = ?`, [params.task_id, params.depends_on_task_id]);
            const data = {
                dependency: {
                    ...dependency,
                    is_blocking: ['blocks', 'requires'].includes(params.dependency_type),
                },
                message: `Dependency created: ${dependency.task_code} -> ${dependency.depends_on_task_code}`,
            };
            const formatted = params.format === 'human'
                ? ` Dependency Created\n\n${dependency.task_code} now depends on ${dependency.depends_on_task_code}\nType: ${params.dependency_type}\n${params.notes ? `Notes: ${params.notes}` : ''}`
                : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
/**
 * Remove a dependency between two tasks
 */
export const removeDependency = {
    name: 'remove_dependency',
    description: 'Remove a dependency relationship between two tasks',
    inputSchema: RemoveDependencyInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            const result = await db.execute(`DELETE FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?`, [params.task_id, params.depends_on_task_id]);
            if (result.affectedRows === 0) {
                return builder.error({
                    code: 'DEPENDENCY_NOT_FOUND',
                    message: 'No dependency found between these tasks',
                    details: { task_id: params.task_id, depends_on_task_id: params.depends_on_task_id },
                    suggestion: 'Check the task IDs and try again',
                });
            }
            const taskCode = await getTaskCode(params.task_id);
            const dependsOnCode = await getTaskCode(params.depends_on_task_id);
            const data = {
                removed: true,
                task_id: params.task_id,
                depends_on_task_id: params.depends_on_task_id,
                message: `Dependency removed: ${taskCode} no longer depends on ${dependsOnCode}`,
            };
            const formatted = params.format === 'human'
                ? ` Dependency Removed\n\n${taskCode} no longer depends on ${dependsOnCode}`
                : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
/**
 * Get dependencies for a task
 */
export const getDependencies = {
    name: 'get_dependencies',
    description: 'Get all dependencies for a task (both upstream and downstream)',
    inputSchema: GetDependenciesInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            if (!(await taskExists(params.task_id))) {
                return builder.error(CommonErrors.notFound('task', params.task_id));
            }
            const taskCode = await getTaskCode(params.task_id);
            let upstream = [];
            let downstream = [];
            if (params.direction === 'upstream' || params.direction === 'both') {
                if (params.include_transitive) {
                    upstream = await getTransitiveDependencies(params.task_id, 'upstream');
                }
                else {
                    const upstreamQuery = `
            SELECT
              td.id,
              td.task_id,
              CONCAT(p1.code, '-', t1.task_number) as task_code,
              t1.title as task_title,
              td.depends_on_task_id,
              CONCAT(p2.code, '-', t2.task_number) as depends_on_task_code,
              t2.title as depends_on_task_title,
              t2.status as depends_on_status,
              t2.progress as depends_on_progress,
              td.dependency_type,
              td.created_at,
              td.notes
            FROM task_dependencies td
            JOIN tasks t1 ON td.task_id = t1.id
            JOIN projects p1 ON t1.project_id = p1.id
            JOIN tasks t2 ON td.depends_on_task_id = t2.id
            JOIN projects p2 ON t2.project_id = p2.id
            WHERE td.task_id = ?
            ORDER BY t2.task_number
          `;
                    const results = await db.query(upstreamQuery, [params.task_id]);
                    upstream = results.map((d) => ({
                        ...d,
                        is_blocking: ['blocks', 'requires'].includes(d.dependency_type) && d.depends_on_status !== 'completed',
                    }));
                }
            }
            if (params.direction === 'downstream' || params.direction === 'both') {
                if (params.include_transitive) {
                    downstream = await getTransitiveDependencies(params.task_id, 'downstream');
                }
                else {
                    const downstreamQuery = `
            SELECT
              td.id,
              td.task_id,
              CONCAT(p1.code, '-', t1.task_number) as task_code,
              t1.title as task_title,
              td.depends_on_task_id,
              CONCAT(p2.code, '-', t2.task_number) as depends_on_task_code,
              t2.title as depends_on_task_title,
              t2.status as depends_on_status,
              t2.progress as depends_on_progress,
              td.dependency_type,
              td.created_at,
              td.notes
            FROM task_dependencies td
            JOIN tasks t1 ON td.task_id = t1.id
            JOIN projects p1 ON t1.project_id = p1.id
            JOIN tasks t2 ON td.depends_on_task_id = t2.id
            JOIN projects p2 ON t2.project_id = p2.id
            WHERE td.depends_on_task_id = ?
            ORDER BY t1.task_number
          `;
                    const results = await db.query(downstreamQuery, [params.task_id]);
                    downstream = results.map((d) => ({
                        ...d,
                        is_blocking: ['blocks', 'requires'].includes(d.dependency_type) && d.depends_on_status !== 'completed',
                    }));
                }
            }
            // Check if task is blocked
            const isBlocked = upstream.some((d) => d.is_blocking);
            const blockingCount = upstream.filter((d) => d.is_blocking).length;
            const data = {
                task_id: params.task_id,
                task_code: taskCode,
                upstream,
                downstream,
                is_blocked: isBlocked,
                blocking_count: blockingCount,
            };
            const formatted = params.format === 'human' ? formatDependencies(taskCode, upstream, downstream, isBlocked) : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
/**
 * Detect if adding a dependency would create a cycle
 */
export const detectDependencyCycles = {
    name: 'detect_dependency_cycles',
    description: 'Check if adding a dependency would create a circular dependency cycle',
    inputSchema: DetectCycleInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            // Validate both tasks exist
            if (!(await taskExists(params.task_id))) {
                return builder.error(CommonErrors.notFound('task', params.task_id));
            }
            if (!(await taskExists(params.depends_on_task_id))) {
                return builder.error(CommonErrors.notFound('task', params.depends_on_task_id));
            }
            const cycleCheck = await detectCycle(params.task_id, params.depends_on_task_id);
            const taskCode = await getTaskCode(params.task_id);
            const dependsOnCode = await getTaskCode(params.depends_on_task_id);
            const data = {
                would_create_cycle: cycleCheck.hasCycle,
                cycle_path: cycleCheck.path.length > 0 ? cycleCheck.path : undefined,
                message: cycleCheck.hasCycle
                    ? `Adding ${taskCode} -> ${dependsOnCode} would create a cycle: ${cycleCheck.path.join(' -> ')}`
                    : `Safe to add: ${taskCode} -> ${dependsOnCode}`,
            };
            const formatted = params.format === 'human'
                ? cycleCheck.hasCycle
                    ? ` Cycle Detected!\n\nAdding ${taskCode} -> ${dependsOnCode} would create:\n${cycleCheck.path.join(' -> ')}`
                    : ` No Cycle\n\nSafe to add dependency: ${taskCode} -> ${dependsOnCode}`
                : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
/**
 * Get all tasks blocked by incomplete dependencies
 */
export const getBlockedTasks = {
    name: 'get_blocked_tasks',
    description: 'Get all tasks that are blocked by incomplete dependencies',
    inputSchema: GetBlockedTasksInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            // Get all tasks with incomplete blocking dependencies
            const query = `
        SELECT
          t.id as task_id,
          CONCAT(p.code, '-', t.task_number) as task_code,
          t.title as task_title,
          t.status,
          COUNT(DISTINCT td.depends_on_task_id) as blocker_count
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        JOIN task_dependencies td ON t.id = td.task_id
        JOIN tasks blocker ON td.depends_on_task_id = blocker.id
        WHERE t.status IN ('pending', 'in_progress')
          AND td.dependency_type IN ('blocks', 'requires')
          AND blocker.status != 'completed'
          AND (? IS NULL OR t.project_id = ?)
        GROUP BY t.id, p.code, t.task_number, t.title, t.status
        HAVING blocker_count > 0
        ORDER BY blocker_count DESC, t.task_number
      `;
            const blockedTasks = await db.query(query, [params.project_id, params.project_id]);
            // Get blocker details if requested
            const result = [];
            for (const task of blockedTasks) {
                let blockers = [];
                if (params.include_blocker_details) {
                    const blockerQuery = `
            SELECT
              blocker.id as task_id,
              CONCAT(bp.code, '-', blocker.task_number) as task_code,
              blocker.title as task_title,
              blocker.status,
              blocker.progress
            FROM task_dependencies td
            JOIN tasks blocker ON td.depends_on_task_id = blocker.id
            JOIN projects bp ON blocker.project_id = bp.id
            WHERE td.task_id = ?
              AND td.dependency_type IN ('blocks', 'requires')
              AND blocker.status != 'completed'
            ORDER BY blocker.task_number
          `;
                    blockers = await db.query(blockerQuery, [task.task_id]);
                }
                result.push({
                    task_id: task.task_id,
                    task_code: task.task_code,
                    task_title: task.task_title,
                    status: task.status,
                    blockers,
                    blocker_count: task.blocker_count,
                });
            }
            const data = {
                blocked_tasks: result,
                total_blocked: result.length,
                filters: {
                    project_id: params.project_id,
                },
            };
            const formatted = params.format === 'human' ? formatBlockedTasks(result) : undefined;
            return builder.success(data, { format: params.format, formatted });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
// ============================================================================
// Export
// ============================================================================
export const dependencyTools = [
    addDependency,
    removeDependency,
    getDependencies,
    detectDependencyCycles,
    getBlockedTasks,
];
//# sourceMappingURL=dependencies.js.map