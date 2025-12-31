/**
 * Error Handling Utilities for Task Operations (SOL-4)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 *
 * Provides user-friendly error formatting for task-related operations,
 * with clear distinction between task_id, task_number, and task_code errors.
 */
import { ErrorObject } from './response-builder.js';
/**
 * Formats task-related errors into user-friendly ErrorObjects
 *
 * @param error - The error to format
 * @returns Structured error object with code, message, details, and suggestion
 *
 * @example
 * try {
 *   await resolveTaskIdentifier(999999);
 * } catch (error) {
 *   const formatted = formatTaskError(error as Error);
 *   return { success: false, error: formatted };
 * }
 */
export declare function formatTaskError(error: Error): ErrorObject;
/**
 * Checks if an error is a task-related error that should be formatted
 */
export declare function isTaskError(error: Error): boolean;
/**
 * Formats any error into an ErrorObject with intelligent suggestions
 */
export declare function formatError(error: Error): ErrorObject;
