/**
 * Task Dependencies Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-007
 *
 * Manages explicit dependency relationships between tasks with cycle detection
 */
import { Tool } from '../types/mcp.js';
/**
 * Add a dependency between two tasks
 */
export declare const addDependency: Tool;
/**
 * Remove a dependency between two tasks
 */
export declare const removeDependency: Tool;
/**
 * Get dependencies for a task
 */
export declare const getDependencies: Tool;
/**
 * Detect if adding a dependency would create a cycle
 */
export declare const detectDependencyCycles: Tool;
/**
 * Get all tasks blocked by incomplete dependencies
 */
export declare const getBlockedTasks: Tool;
export declare const dependencyTools: Tool[];
