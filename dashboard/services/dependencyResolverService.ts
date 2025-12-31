/**
 * SOLARIA DFO - DependencyResolverService
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Resolves task dependencies for parallel execution planning.
 * Uses topological sorting and cycle detection to determine execution order.
 *
 * @author ECO-Omega | DFO 4.0 Implementation
 * @date 2025-12-30
 * @task DFO-185
 */

import { Connection, RowDataPacket } from 'mysql2/promise';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Task dependency information from database
 */
interface TaskDependency {
    task_id: number;
    depends_on_task_id: number;
    dependency_type: string;
}

/**
 * Task information for dependency resolution
 */
interface TaskInfo {
    id: number;
    task_code: string;
    title: string;
    status: string;
    priority: string;
}

/**
 * Result of cycle detection
 */
export interface CycleDetectionResult {
    hasCycle: boolean;
    cycles: number[][]; // Array of task ID arrays forming cycles
    cyclePaths: string[][]; // Human-readable paths (task codes)
}

/**
 * Parallel execution groups result
 */
export interface ParallelExecutionPlan {
    groups: number[][]; // Each group can execute in parallel
    totalGroups: number;
    estimatedSequentialTime: number; // If executed one by one
    estimatedParallelTime: number; // If executed in parallel
}

// ============================================================================
// DependencyResolverService Class
// ============================================================================

/**
 * Service for resolving task dependencies and determining execution order.
 *
 * Provides topological sorting, cycle detection, and parallel execution
 * group identification for task scheduling.
 *
 * @example
 * ```typescript
 * const resolver = new DependencyResolverService(db);
 *
 * // Get execution order
 * const order = await resolver.resolveDependencyOrder([1, 2, 3, 4]);
 * // => [4, 3, 1, 2] (tasks ordered by dependencies)
 *
 * // Detect cycles
 * const cycles = await resolver.detectCycles([1, 2, 3, 4]);
 * if (cycles.hasCycle) {
 *   console.log('Cycles found:', cycles.cyclePaths);
 * }
 *
 * // Get parallel execution groups
 * const plan = await resolver.getParallelExecutionGroups([1, 2, 3, 4]);
 * // => { groups: [[4, 3], [1], [2]], totalGroups: 3, ... }
 * ```
 */
export default class DependencyResolverService {
    private db: Connection;

    constructor(db: Connection) {
        this.db = db;
    }

    // ========================================================================
    // Public API Methods
    // ========================================================================

    /**
     * Resolve task dependencies and return execution order.
     *
     * Uses topological sort (Kahn's algorithm) to determine the order in which
     * tasks should be executed respecting their dependencies.
     *
     * @param taskIds - Array of task IDs to order
     * @returns Array of task IDs in execution order (dependencies first)
     * @throws Error if cycles are detected
     *
     * @example
     * ```typescript
     * // Tasks: A depends on B, B depends on C
     * const order = await resolver.resolveDependencyOrder([1, 2, 3]);
     * // => [3, 2, 1] (C, B, A)
     * ```
     */
    async resolveDependencyOrder(taskIds: number[]): Promise<number[]> {
        if (taskIds.length === 0) return [];

        try {
            // Load dependencies from database
            const dependencies = await this.loadDependencies(taskIds);

            // Build dependency graph (task_id -> [depends_on_task_ids])
            const graph = this.buildDependencyGraph(dependencies);

            // Calculate in-degree for each task
            const inDegree = new Map<number, number>();
            for (const taskId of taskIds) {
                inDegree.set(taskId, 0);
            }

            // Count incoming edges (tasks that depend on this task)
            for (const [taskId, deps] of graph.entries()) {
                for (const depId of deps) {
                    if (taskIds.includes(depId)) {
                        inDegree.set(taskId, (inDegree.get(taskId) || 0) + 1);
                    }
                }
            }

            // Kahn's Algorithm: Start with nodes that have no dependencies (in-degree 0)
            const queue: number[] = [];
            const result: number[] = [];

            for (const [taskId, degree] of inDegree.entries()) {
                if (degree === 0) {
                    queue.push(taskId);
                }
            }

            // Process queue
            while (queue.length > 0) {
                // Remove node with no incoming edges
                const current = queue.shift()!;
                result.push(current);

                // Build reverse graph to find dependent tasks
                const reverseDeps = this.buildReverseDependencyGraph(dependencies);
                const dependentTasks = reverseDeps.get(current) || [];

                // Reduce in-degree of dependent tasks
                for (const dependent of dependentTasks) {
                    if (taskIds.includes(dependent)) {
                        const newDegree = (inDegree.get(dependent) || 1) - 1;
                        inDegree.set(dependent, newDegree);

                        // If in-degree becomes 0, add to queue
                        if (newDegree === 0) {
                            queue.push(dependent);
                        }
                    }
                }
            }

            // Check if all tasks were processed
            if (result.length !== taskIds.length) {
                // Some tasks were not processed -> cycle exists
                const unprocessed = taskIds.filter((id) => !result.includes(id));
                throw new Error(
                    `Cycle detected in task dependencies. Unprocessed tasks: ${unprocessed.join(', ')}`
                );
            }

            return result;
        } catch (error: any) {
            console.error('[DependencyResolverService] Error resolving dependency order:', error);
            throw error;
        }
    }

    /**
     * Detect circular dependencies in a set of tasks.
     *
     * Uses depth-first search to identify cycles. Returns all cycles found,
     * not just the first one.
     *
     * @param taskIds - Array of task IDs to check
     * @returns Cycle detection result with paths
     *
     * @example
     * ```typescript
     * const result = await resolver.detectCycles([1, 2, 3]);
     * if (result.hasCycle) {
     *   console.log(`Found ${result.cycles.length} cycles`);
     *   result.cyclePaths.forEach(path => {
     *     console.log(path.join(' -> '));
     *   });
     * }
     * ```
     */
    async detectCycles(taskIds: number[]): Promise<CycleDetectionResult> {
        if (taskIds.length === 0) {
            return { hasCycle: false, cycles: [], cyclePaths: [] };
        }

        try {
            // Load dependencies and task info
            const dependencies = await this.loadDependencies(taskIds);
            const taskMap = await this.loadTaskInfo(taskIds);

            // Build dependency graph
            const graph = this.buildDependencyGraph(dependencies);

            // DFS state
            const visited = new Set<number>();
            const recursionStack = new Set<number>();
            const path: number[] = [];
            const cycles: number[][] = [];

            // Run DFS from each unvisited node
            for (const taskId of taskIds) {
                if (!visited.has(taskId)) {
                    this.dfsCycleDetection(taskId, graph, visited, recursionStack, path, cycles);
                }
            }

            // Format cycles with task codes
            const cyclePaths = this.formatCyclePaths(cycles, taskMap);

            return {
                hasCycle: cycles.length > 0,
                cycles,
                cyclePaths,
            };
        } catch (error: any) {
            console.error('[DependencyResolverService] Error detecting cycles:', error);
            throw error;
        }
    }

    /**
     * Group tasks into parallel execution batches.
     *
     * Analyzes dependencies to identify which tasks can run simultaneously
     * without violating dependency constraints.
     *
     * @param taskIds - Array of task IDs to group
     * @returns Parallel execution plan with groups and time estimates
     *
     * @example
     * ```typescript
     * const plan = await resolver.getParallelExecutionGroups([1, 2, 3, 4]);
     * // Group 1: Tasks with no dependencies
     * // Group 2: Tasks depending only on Group 1
     * // Group 3: Tasks depending on Group 2, etc.
     * ```
     */
    async getParallelExecutionGroups(taskIds: number[]): Promise<ParallelExecutionPlan> {
        if (taskIds.length === 0) {
            return {
                groups: [],
                totalGroups: 0,
                estimatedSequentialTime: 0,
                estimatedParallelTime: 0,
            };
        }

        try {
            // Load dependencies and task info
            const dependencies = await this.loadDependencies(taskIds);
            const taskMap = await this.loadTaskInfo(taskIds);

            // Build dependency graph
            const graph = this.buildDependencyGraph(dependencies);

            // Calculate in-degree for each task
            const inDegree = new Map<number, number>();
            for (const taskId of taskIds) {
                inDegree.set(taskId, 0);
            }

            for (const [taskId, deps] of graph.entries()) {
                for (const depId of deps) {
                    if (taskIds.includes(depId)) {
                        inDegree.set(taskId, (inDegree.get(taskId) || 0) + 1);
                    }
                }
            }

            // Group tasks by dependency level
            const groups: number[][] = [];
            const processed = new Set<number>();
            const reverseDeps = this.buildReverseDependencyGraph(dependencies);

            // Get task estimates from database
            const [estimateRows] = await this.db.execute<RowDataPacket[]>(
                `SELECT id, estimated_hours FROM tasks WHERE id IN (${taskIds.map(() => '?').join(',')})`,
                taskIds
            );
            const estimates = new Map<number, number>();
            for (const row of estimateRows as any[]) {
                estimates.set(row.id, row.estimated_hours || 1);
            }

            let totalSequentialTime = 0;
            let totalParallelTime = 0;

            // Process tasks level by level
            while (processed.size < taskIds.length) {
                const currentGroup: number[] = [];

                // Find all tasks with in-degree 0 (no pending dependencies)
                for (const taskId of taskIds) {
                    if (!processed.has(taskId) && (inDegree.get(taskId) || 0) === 0) {
                        currentGroup.push(taskId);
                        processed.add(taskId);
                    }
                }

                if (currentGroup.length === 0) {
                    // No tasks can be processed -> cycle detected
                    const remaining = taskIds.filter((id) => !processed.has(id));
                    throw new Error(
                        `Cannot create execution groups: cycle detected. Remaining tasks: ${remaining.join(', ')}`
                    );
                }

                // Calculate time for this group
                const groupTimes = currentGroup.map((id) => estimates.get(id) || 1);
                const groupSequentialTime = groupTimes.reduce((sum, t) => sum + t, 0);
                const groupParallelTime = Math.max(...groupTimes);

                totalSequentialTime += groupSequentialTime;
                totalParallelTime += groupParallelTime;

                groups.push(currentGroup);

                // Reduce in-degree of dependent tasks
                for (const taskId of currentGroup) {
                    const dependents = reverseDeps.get(taskId) || [];
                    for (const dependent of dependents) {
                        if (taskIds.includes(dependent) && !processed.has(dependent)) {
                            const newDegree = (inDegree.get(dependent) || 1) - 1;
                            inDegree.set(dependent, newDegree);
                        }
                    }
                }
            }

            return {
                groups,
                totalGroups: groups.length,
                estimatedSequentialTime: totalSequentialTime,
                estimatedParallelTime: totalParallelTime,
            };
        } catch (error: any) {
            console.error('[DependencyResolverService] Error creating execution groups:', error);
            throw error;
        }
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    /**
     * Load all dependencies for the given task IDs from database.
     *
     * @param taskIds - Task IDs to load dependencies for
     * @returns Array of task dependencies
     * @private
     */
    private async loadDependencies(taskIds: number[]): Promise<TaskDependency[]> {
        if (taskIds.length === 0) return [];

        const placeholders = taskIds.map(() => '?').join(',');

        const [rows] = await this.db.execute<RowDataPacket[]>(
            `SELECT
                td.task_id,
                td.depends_on_task_id,
                td.dependency_type
             FROM task_dependencies td
             WHERE td.task_id IN (${placeholders})
               AND td.dependency_type IN ('blocks', 'depends_on')`,
            taskIds
        );

        return rows as TaskDependency[];
    }

    /**
     * Load task information (code, title, status, priority) for given IDs.
     *
     * @param taskIds - Task IDs to load info for
     * @returns Map of task_id to TaskInfo
     * @private
     */
    private async loadTaskInfo(taskIds: number[]): Promise<Map<number, TaskInfo>> {
        if (taskIds.length === 0) return new Map();

        const placeholders = taskIds.map(() => '?').join(',');

        const [rows] = await this.db.execute<RowDataPacket[]>(
            `SELECT
                t.id,
                CONCAT(p.code, '-', t.task_number) as task_code,
                t.title,
                t.status,
                t.priority
             FROM tasks t
             JOIN projects p ON t.project_id = p.id
             WHERE t.id IN (${placeholders})`,
            taskIds
        );

        const taskMap = new Map<number, TaskInfo>();
        for (const row of rows as TaskInfo[]) {
            taskMap.set(row.id, row);
        }

        return taskMap;
    }

    /**
     * Build adjacency list representation of dependency graph.
     *
     * @param dependencies - Array of task dependencies
     * @returns Map where key is task_id, value is array of tasks it depends on
     * @private
     */
    private buildDependencyGraph(dependencies: TaskDependency[]): Map<number, number[]> {
        const graph = new Map<number, number[]>();

        for (const dep of dependencies) {
            if (!graph.has(dep.task_id)) {
                graph.set(dep.task_id, []);
            }
            graph.get(dep.task_id)!.push(dep.depends_on_task_id);
        }

        return graph;
    }

    /**
     * Build reverse adjacency list (tasks that depend on each task).
     *
     * @param dependencies - Array of task dependencies
     * @returns Map where key is task_id, value is array of tasks that depend on it
     * @private
     */
    private buildReverseDependencyGraph(dependencies: TaskDependency[]): Map<number, number[]> {
        const graph = new Map<number, number[]>();

        for (const dep of dependencies) {
            if (!graph.has(dep.depends_on_task_id)) {
                graph.set(dep.depends_on_task_id, []);
            }
            graph.get(dep.depends_on_task_id)!.push(dep.task_id);
        }

        return graph;
    }

    /**
     * Calculate in-degree for each task (number of dependencies).
     *
     * Used by Kahn's algorithm for topological sorting.
     *
     * @param taskIds - All task IDs in the graph
     * @param graph - Adjacency list of dependencies
     * @returns Map of task_id to in-degree count
     * @private
     */
    private calculateInDegrees(taskIds: number[], graph: Map<number, number[]>): Map<number, number> {
        const inDegree = new Map<number, number>();

        // Initialize all tasks with 0 in-degree
        for (const taskId of taskIds) {
            inDegree.set(taskId, 0);
        }

        // Count incoming edges
        for (const [taskId, dependencies] of graph.entries()) {
            for (const depId of dependencies) {
                if (taskIds.includes(depId)) {
                    inDegree.set(taskId, (inDegree.get(taskId) || 0) + 1);
                }
            }
        }

        return inDegree;
    }

    /**
     * Depth-first search to detect cycles starting from a node.
     *
     * @param node - Starting node for DFS
     * @param graph - Adjacency list
     * @param visited - Set of visited nodes
     * @param recursionStack - Current DFS path
     * @param cycles - Array to collect found cycles
     * @private
     */
    private dfsCycleDetection(
        node: number,
        graph: Map<number, number[]>,
        visited: Set<number>,
        recursionStack: Set<number>,
        path: number[],
        cycles: number[][]
    ): void {
        visited.add(node);
        recursionStack.add(node);
        path.push(node);

        const neighbors = graph.get(node) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                this.dfsCycleDetection(neighbor, graph, visited, recursionStack, path, cycles);
            } else if (recursionStack.has(neighbor)) {
                // Found cycle - extract it from path
                const cycleStart = path.indexOf(neighbor);
                const cycle = [...path.slice(cycleStart), neighbor];
                cycles.push(cycle);
            }
        }

        recursionStack.delete(node);
        path.pop();
    }

    /**
     * Convert task ID cycles to human-readable task code paths.
     *
     * @param cycles - Array of cycles (task ID arrays)
     * @param taskMap - Map of task_id to TaskInfo
     * @returns Array of human-readable paths
     * @private
     */
    private formatCyclePaths(cycles: number[][], taskMap: Map<number, TaskInfo>): string[][] {
        return cycles.map((cycle) =>
            cycle.map((taskId) => taskMap.get(taskId)?.task_code || `#${taskId}`)
        );
    }

    /**
     * Close any resources (currently none, but maintains pattern consistency).
     */
    async close(): Promise<void> {
        // No resources to close for this service
        // Database connection is managed externally
    }
}
