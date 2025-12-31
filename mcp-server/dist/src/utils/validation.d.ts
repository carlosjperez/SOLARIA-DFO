/**
 * Validation Utilities for MCP Tools (SOL-4)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 *
 * Provides validation middleware and decorators for MCP tools that require
 * task identifiers, with automatic resolution and error handling.
 */
import { TaskIdentifier } from './taskIdentifier.js';
import { StandardErrorResponse } from './response-builder.js';
/**
 * Result of task validation
 */
export interface TaskValidationResult {
    success: boolean;
    task_id?: number;
    task_info?: TaskIdentifier;
    error?: StandardErrorResponse['error'];
}
/**
 * Validates and resolves a task identifier
 *
 * @param task_id - Task identifier to validate (task_id, task_number, or task_code)
 * @param project_id - Optional project context for disambiguation
 * @returns Validation result with resolved task_id or error
 *
 * @example
 * const validation = await validateAndResolveTask(params.task_id, params.project_id);
 * if (!validation.success) {
 *   return { success: false, error: validation.error };
 * }
 * const taskId = validation.task_id!;
 */
export declare function validateAndResolveTask(task_id: string | number, project_id?: number): Promise<TaskValidationResult>;
/**
 * Validates that a task_id parameter is provided
 */
export declare function requireTaskId<T extends {
    task_id?: any;
}>(params: T): params is T & {
    task_id: string | number;
};
/**
 * Validates required parameters exist
 *
 * @param params - Parameters object
 * @param required - Array of required parameter names
 * @returns Error object if validation fails, null if success
 *
 * @example
 * const error = validateRequiredParams(params, ['task_id', 'status']);
 * if (error) {
 *   return { success: false, error };
 * }
 */
export declare function validateRequiredParams(params: Record<string, any>, required: string[]): StandardErrorResponse['error'] | null;
/**
 * Decorator factory for MCP tools that require task validation
 *
 * Automatically validates and resolves task_id before executing the method.
 * Injects resolved task info into params._resolved_task_info
 *
 * @example
 * class TaskTools {
 *   @requiresTaskValidation
 *   async update_task(params: { task_id: string | number; status?: string }) {
 *     // params.task_id is now guaranteed to be valid
 *     // params._resolved_task_info contains full task metadata
 *     const { task_id, _resolved_task_info } = params;
 *     // ... implementation
 *   }
 * }
 */
export declare function requiresTaskValidation(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
/**
 * Async version of requiresTaskValidation for async methods
 */
export declare function requiresTaskValidationAsync(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
