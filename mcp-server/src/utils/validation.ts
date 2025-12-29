/**
 * Validation Utilities for MCP Tools (SOL-4)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 *
 * Provides validation middleware and decorators for MCP tools that require
 * task identifiers, with automatic resolution and error handling.
 */

import { resolveTaskIdentifier, TaskIdentifier } from './taskIdentifier';
import { formatTaskError } from './errorHandling';
import { StandardErrorResponse } from './response-builder';

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
export async function validateAndResolveTask(
    task_id: string | number,
    project_id?: number
): Promise<TaskValidationResult> {
    try {
        const resolved = await resolveTaskIdentifier(task_id, project_id);

        return {
            success: true,
            task_id: resolved.task_id,
            task_info: resolved
        };

    } catch (error) {
        return {
            success: false,
            error: formatTaskError(error as Error)
        };
    }
}

/**
 * Validates that a task_id parameter is provided
 */
export function requireTaskId<T extends { task_id?: any }>(params: T): params is T & { task_id: string | number } {
    return params.task_id !== undefined && params.task_id !== null;
}

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
export function validateRequiredParams(
    params: Record<string, any>,
    required: string[]
): StandardErrorResponse['error'] | null {
    const missing = required.filter(key => params[key] === undefined || params[key] === null);

    if (missing.length > 0) {
        return {
            code: 'MISSING_REQUIRED_PARAMS',
            message: `Missing required parameters: ${missing.join(', ')}`,
            details: {
                missing_params: missing,
                provided_params: Object.keys(params)
            },
            suggestion: `Provide all required parameters: ${required.join(', ')}`
        };
    }

    return null;
}

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
export function requiresTaskValidation(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(this: any, ...args: any[]) {
        const params = args[0];

        // Check task_id is provided
        if (!requireTaskId(params)) {
            return {
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_PARAM',
                    message: 'Missing required parameter: task_id',
                    details: {
                        provided_params: Object.keys(params)
                    },
                    suggestion: 'Provide task_id as number, task_number, or task_code string'
                }
            };
        }

        // Validate and resolve task_id
        const validation = await validateAndResolveTask(
            params.task_id,
            params.project_id
        );

        if (!validation.success) {
            return {
                success: false,
                error: validation.error
            };
        }

        // Replace task_id with resolved numeric ID
        // Inject full task metadata for use in the method
        params.task_id = validation.task_id;
        params._resolved_task_info = validation.task_info;

        // Execute original method with validated params
        return originalMethod.apply(this, args);
    };

    return descriptor;
}

/**
 * Async version of requiresTaskValidation for async methods
 */
export function requiresTaskValidationAsync(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(this: any, ...args: any[]) {
        const params = args[0];

        if (!requireTaskId(params)) {
            return {
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_PARAM',
                    message: 'Missing required parameter: task_id',
                    suggestion: 'Provide task_id'
                }
            };
        }

        const validation = await validateAndResolveTask(
            params.task_id,
            params.project_id
        );

        if (!validation.success) {
            return {
                success: false,
                error: validation.error
            };
        }

        params.task_id = validation.task_id;
        params._resolved_task_info = validation.task_info;

        return await originalMethod.apply(this, args);
    };

    return descriptor;
}
