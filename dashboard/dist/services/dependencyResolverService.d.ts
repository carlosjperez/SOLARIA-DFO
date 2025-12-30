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
import { Connection } from 'mysql2/promise';
/**
 * Result of cycle detection
 */
export interface CycleDetectionResult {
    hasCycle: boolean;
    cycles: number[][];
    cyclePaths: string[][];
}
/**
 * Parallel execution groups result
 */
export interface ParallelExecutionPlan {
    groups: number[][];
    totalGroups: number;
    estimatedSequentialTime: number;
    estimatedParallelTime: number;
}
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
    private db;
    constructor(db: Connection);
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
    resolveDependencyOrder(taskIds: number[]): Promise<number[]>;
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
    detectCycles(taskIds: number[]): Promise<CycleDetectionResult>;
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
    getParallelExecutionGroups(taskIds: number[]): Promise<ParallelExecutionPlan>;
    /**
     * Load all dependencies for the given task IDs from database.
     *
     * @param taskIds - Task IDs to load dependencies for
     * @returns Array of task dependencies
     * @private
     */
    private loadDependencies;
    /**
     * Load task information (code, title, status, priority) for given IDs.
     *
     * @param taskIds - Task IDs to load info for
     * @returns Map of task_id to TaskInfo
     * @private
     */
    private loadTaskInfo;
    /**
     * Build adjacency list representation of dependency graph.
     *
     * @param dependencies - Array of task dependencies
     * @returns Map where key is task_id, value is array of tasks it depends on
     * @private
     */
    private buildDependencyGraph;
    /**
     * Build reverse adjacency list (tasks that depend on each task).
     *
     * @param dependencies - Array of task dependencies
     * @returns Map where key is task_id, value is array of tasks that depend on it
     * @private
     */
    private buildReverseDependencyGraph;
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
    private calculateInDegrees;
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
    private dfsCycleDetection;
    /**
     * Convert task ID cycles to human-readable task code paths.
     *
     * @param cycles - Array of cycles (task ID arrays)
     * @param taskMap - Map of task_id to TaskInfo
     * @returns Array of human-readable paths
     * @private
     */
    private formatCyclePaths;
    /**
     * Close any resources (currently none, but maintains pattern consistency).
     */
    close(): Promise<void>;
}
