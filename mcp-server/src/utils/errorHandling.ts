/**
 * Error Handling Utilities for Task Operations (SOL-4)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 *
 * Provides user-friendly error formatting for task-related operations,
 * with clear distinction between task_id, task_number, and task_code errors.
 */

import {
    TaskNotFoundError,
    InvalidIdentifierError,
    AmbiguousIdentifierError
} from './taskIdentifier';
import { ErrorObject } from './response-builder';

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
export function formatTaskError(error: Error): ErrorObject {
    // Task Not Found
    if (error instanceof TaskNotFoundError) {
        return {
            code: 'TASK_NOT_FOUND',
            message: `Task not found: ${error.identifier}`,
            details: {
                identifier: error.identifier,
                attempted_as: error.attemptedAs,
                type: typeof error.identifier
            },
            suggestion: getTaskNotFoundSuggestion(error)
        };
    }

    // Invalid Identifier Format
    if (error instanceof InvalidIdentifierError) {
        return {
            code: 'INVALID_TASK_IDENTIFIER',
            message: error.message,
            details: {
                identifier: error.identifier,
                received_type: typeof error.identifier
            },
            suggestion: 'Valid formats: task_id (491), task_number (158), or task_code ("DFO-158-EPIC15")'
        };
    }

    // Ambiguous Identifier (Multiple Matches)
    if (error instanceof AmbiguousIdentifierError) {
        return {
            code: 'AMBIGUOUS_TASK_IDENTIFIER',
            message: `Found ${error.matchCount} tasks with task_number ${error.identifier}`,
            details: {
                identifier: error.identifier,
                match_count: error.matchCount
            },
            suggestion: 'Provide project_id to disambiguate, or use task_code format (DFO-158-EPIC15)'
        };
    }

    // Database Constraint Violation (from triggers)
    if (error.message?.includes('Cannot complete task')) {
        return {
            code: 'TASK_COMPLETION_BLOCKED',
            message: error.message,
            details: {
                reason: 'pending_subtasks'
            },
            suggestion: 'Complete all subtasks before marking the task as completed. Use list_task_items to see pending subtasks.'
        };
    }

    // Generic Error
    return {
        code: 'INTERNAL_ERROR',
        message: error.message,
        details: {
            error_type: error.constructor.name
        },
        suggestion: 'Check server logs for more details'
    };
}

/**
 * Generates contextual suggestions for TaskNotFoundError
 * @internal
 */
function getTaskNotFoundSuggestion(error: TaskNotFoundError): string {
    const { identifier, attemptedAs } = error;

    if (attemptedAs === 'task_id') {
        return `Task ID ${identifier} not found in database. Use list_tasks to see available task IDs.`;
    }

    if (attemptedAs === 'task_number') {
        return `Task number ${identifier} not found. Remember task_number is project-specific. Try providing project_id or use task_code format.`;
    }

    if (attemptedAs === 'task_code') {
        return `Task code "${identifier}" not found. Verify project code and task number using list_tasks.`;
    }

    if (attemptedAs === 'task_id or task_number') {
        return `No task found with ID or task_number ${identifier}. If using task_number, provide project_id to disambiguate.`;
    }

    return 'Use list_tasks to see available tasks.';
}

/**
 * Checks if an error is a task-related error that should be formatted
 */
export function isTaskError(error: Error): boolean {
    return (
        error instanceof TaskNotFoundError ||
        error instanceof InvalidIdentifierError ||
        error instanceof AmbiguousIdentifierError ||
        error.message?.includes('Cannot complete task')
    );
}

/**
 * Formats any error into an ErrorObject with intelligent suggestions
 */
export function formatError(error: Error): ErrorObject {
    // Try task-specific formatting first
    if (isTaskError(error)) {
        return formatTaskError(error);
    }

    // Generic error formatting
    return {
        code: 'ERROR',
        message: error.message,
        details: {
            type: error.constructor.name
        }
    };
}
