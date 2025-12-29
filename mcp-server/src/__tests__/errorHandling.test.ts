/**
 * Error Handling Tests (SOL-4)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 */

import { describe, it, expect } from '@jest/globals';
import {
    formatTaskError,
    formatError,
    isTaskError
} from '../utils/errorHandling';
import {
    TaskNotFoundError,
    InvalidIdentifierError,
    AmbiguousIdentifierError
} from '../utils/taskIdentifier';

describe('errorHandling', () => {

    describe('formatTaskError', () => {
        it('formats TaskNotFoundError with task_id', () => {
            const error = new TaskNotFoundError(
                491,
                'task_id',
                'Task 491 not found'
            );

            const formatted = formatTaskError(error);

            expect(formatted).toEqual({
                code: 'TASK_NOT_FOUND',
                message: 'Task not found: 491',
                details: {
                    identifier: 491,
                    attempted_as: 'task_id',
                    type: 'number'
                },
                suggestion: 'Task ID 491 not found in database. Use list_tasks to see available task IDs.'
            });
        });

        it('formats TaskNotFoundError with task_number', () => {
            const error = new TaskNotFoundError(
                158,
                'task_number',
                'Task number 158 not found'
            );

            const formatted = formatTaskError(error);

            expect(formatted.code).toBe('TASK_NOT_FOUND');
            expect(formatted.suggestion).toContain('task_number is project-specific');
            expect(formatted.suggestion).toContain('project_id');
        });

        it('formats TaskNotFoundError with task_code', () => {
            const error = new TaskNotFoundError(
                'DFO-158-EPIC15',
                'task_code',
                'Task code not found'
            );

            const formatted = formatTaskError(error);

            expect(formatted.code).toBe('TASK_NOT_FOUND');
            expect(formatted.details.type).toBe('string');
            expect(formatted.suggestion).toContain('Verify project code and task number');
        });

        it('formats InvalidIdentifierError', () => {
            const error = new InvalidIdentifierError(
                'DFO_158_EPIC15',
                'Invalid format'
            );

            const formatted = formatTaskError(error);

            expect(formatted).toEqual({
                code: 'INVALID_TASK_IDENTIFIER',
                message: 'Invalid format',
                details: {
                    identifier: 'DFO_158_EPIC15',
                    received_type: 'string'
                },
                suggestion: 'Valid formats: task_id (491), task_number (158), or task_code ("DFO-158-EPIC15")'
            });
        });

        it('formats AmbiguousIdentifierError', () => {
            const error = new AmbiguousIdentifierError(
                158,
                3,
                'Multiple matches'
            );

            const formatted = formatTaskError(error);

            expect(formatted).toEqual({
                code: 'AMBIGUOUS_TASK_IDENTIFIER',
                message: 'Found 3 tasks with task_number 158',
                details: {
                    identifier: 158,
                    match_count: 3
                },
                suggestion: 'Provide project_id to disambiguate, or use task_code format (DFO-158-EPIC15)'
            });
        });

        it('formats database constraint error', () => {
            const error = new Error('Cannot complete task: pending subtasks exist');

            const formatted = formatTaskError(error);

            expect(formatted).toEqual({
                code: 'TASK_COMPLETION_BLOCKED',
                message: 'Cannot complete task: pending subtasks exist',
                details: {
                    reason: 'pending_subtasks'
                },
                suggestion: 'Complete all subtasks before marking the task as completed. Use list_task_items to see pending subtasks.'
            });
        });

        it('formats generic error as fallback', () => {
            const error = new Error('Unknown database error');

            const formatted = formatTaskError(error);

            expect(formatted.code).toBe('INTERNAL_ERROR');
            expect(formatted.message).toBe('Unknown database error');
            expect(formatted.details.error_type).toBe('Error');
        });
    });

    describe('isTaskError', () => {
        it('returns true for TaskNotFoundError', () => {
            const error = new TaskNotFoundError(491, 'task_id', 'Not found');
            expect(isTaskError(error)).toBe(true);
        });

        it('returns true for InvalidIdentifierError', () => {
            const error = new InvalidIdentifierError('invalid', 'Bad format');
            expect(isTaskError(error)).toBe(true);
        });

        it('returns true for AmbiguousIdentifierError', () => {
            const error = new AmbiguousIdentifierError(158, 2, 'Ambiguous');
            expect(isTaskError(error)).toBe(true);
        });

        it('returns true for constraint violation', () => {
            const error = new Error('Cannot complete task: pending subtasks');
            expect(isTaskError(error)).toBe(true);
        });

        it('returns false for generic error', () => {
            const error = new Error('Generic error');
            expect(isTaskError(error)).toBe(false);
        });
    });

    describe('formatError', () => {
        it('uses formatTaskError for task errors', () => {
            const error = new TaskNotFoundError(491, 'task_id', 'Not found');
            const formatted = formatError(error);

            expect(formatted.code).toBe('TASK_NOT_FOUND');
        });

        it('formats generic errors', () => {
            const error = new Error('Generic error message');
            const formatted = formatError(error);

            expect(formatted).toEqual({
                code: 'ERROR',
                message: 'Generic error message',
                details: {
                    type: 'Error'
                }
            });
        });
    });

    describe('suggestion generation', () => {
        it('provides helpful suggestion for task_id not found', () => {
            const error = new TaskNotFoundError(999, 'task_id', 'Not found');
            const formatted = formatTaskError(error);

            expect(formatted.suggestion).toContain('list_tasks');
            expect(formatted.suggestion).toContain('task IDs');
        });

        it('provides helpful suggestion for ambiguous task_number', () => {
            const error = new TaskNotFoundError(158, 'task_id or task_number', 'Not found');
            const formatted = formatTaskError(error);

            expect(formatted.suggestion).toContain('project_id to disambiguate');
        });

        it('provides helpful suggestion for constraint violation', () => {
            const error = new Error('Cannot complete task: pending subtasks exist');
            const formatted = formatTaskError(error);

            expect(formatted.suggestion).toContain('Complete all subtasks');
            expect(formatted.suggestion).toContain('list_task_items');
        });
    });
});
