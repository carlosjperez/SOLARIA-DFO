/**
 * Task Identifier Resolution Tests (SOL-2)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
    resolveTaskIdentifier,
    TaskNotFoundError,
    InvalidIdentifierError,
    AmbiguousIdentifierError
} from '../utils/taskIdentifier';

// Mock database module
const mockQuery = jest.fn();
jest.mock('../database', () => ({
    db: {
        query: mockQuery
    }
}));

import { db } from '../database';

describe('resolveTaskIdentifier', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('task_id resolution', () => {
        it('resolves valid task_id correctly', async () => {
            const mockTask = {
                task_id: 491,
                task_number: 158,
                task_code: 'DFO-158-EPIC15',
                project_id: 1,
                project_code: 'DFO',
                epic_id: 15
            };

            mockQuery.mockResolvedValueOnce([mockTask]);

            const result = await resolveTaskIdentifier(491);

            expect(result).toEqual(mockTask);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE t.id = ?'),
                [491]
            );
        });

        it('throws TaskNotFoundError for non-existent task_id', async () => {
            mockQuery
                .mockResolvedValueOnce([]) // First query (by ID) returns empty
                .mockResolvedValueOnce([]); // Second query (by number) returns empty

            await expect(resolveTaskIdentifier(999999))
                .rejects.toThrow(TaskNotFoundError);
        });
    });

    describe('task_number resolution', () => {
        it('resolves task_number with project_id', async () => {
            const mockTask = {
                task_id: 491,
                task_number: 158,
                task_code: 'DFO-158-EPIC15',
                project_id: 1,
                project_code: 'DFO',
                epic_id: 15
            };

            mockQuery
                .mockResolvedValueOnce([]) // First query (by ID) returns empty
                .mockResolvedValueOnce([mockTask]); // Second query (by number) succeeds

            const result = await resolveTaskIdentifier(158, 1);

            expect(result).toEqual(mockTask);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE t.task_number = ? AND t.project_id = ?'),
                [158, 1]
            );
        });

        it('throws AmbiguousIdentifierError when multiple projects have same task_number', async () => {
            const mockTasks = [
                { task_id: 491, task_number: 158, project_id: 1 },
                { task_id: 520, task_number: 158, project_id: 2 }
            ];

            mockQuery
                .mockResolvedValueOnce([]) // First query (by ID) returns empty
                .mockResolvedValueOnce(mockTasks); // Second query returns multiple

            await expect(resolveTaskIdentifier(158))
                .rejects.toThrow(AmbiguousIdentifierError);
        });
    });

    describe('task_code resolution', () => {
        it('resolves task_code with epic', async () => {
            const mockTask = {
                task_id: 491,
                task_number: 158,
                task_code: 'DFO-158-EPIC15',
                project_id: 1,
                project_code: 'DFO',
                epic_id: 15
            };

            mockQuery.mockResolvedValueOnce([mockTask]);

            const result = await resolveTaskIdentifier('DFO-158-EPIC15');

            expect(result).toEqual(mockTask);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE p.code = ? AND t.task_number = ? AND e.epic_number = ?'),
                ['DFO-158-EPIC15', 'DFO', 158, 15]
            );
        });

        it('resolves task_code without epic', async () => {
            const mockTask = {
                task_id: 450,
                task_number: 100,
                task_code: 'DFO-100',
                project_id: 1,
                project_code: 'DFO',
                epic_id: null
            };

            mockQuery.mockResolvedValueOnce([mockTask]);

            const result = await resolveTaskIdentifier('DFO-100');

            expect(result).toEqual(mockTask);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE p.code = ? AND t.task_number = ?'),
                ['DFO-100', 'DFO', 100]
            );
        });

        it('throws TaskNotFoundError for non-existent task_code', async () => {
            mockQuery.mockResolvedValueOnce([]);

            await expect(resolveTaskIdentifier('DFO-999-EPIC99'))
                .rejects.toThrow(TaskNotFoundError);
        });

        it('throws InvalidIdentifierError for malformed task_code', async () => {
            await expect(resolveTaskIdentifier('DFO_158_EPIC15'))
                .rejects.toThrow(InvalidIdentifierError);

            await expect(resolveTaskIdentifier('DFO-EPIC15'))
                .rejects.toThrow(InvalidIdentifierError);

            await expect(resolveTaskIdentifier('158-EPIC15'))
                .rejects.toThrow(InvalidIdentifierError);
        });
    });

    describe('string number resolution', () => {
        it('resolves task_number as string', async () => {
            const mockTask = {
                task_id: 491,
                task_number: 158,
                task_code: 'DFO-158-EPIC15',
                project_id: 1,
                project_code: 'DFO',
                epic_id: 15
            };

            mockQuery
                .mockResolvedValueOnce([]) // First query (by ID) returns empty
                .mockResolvedValueOnce([mockTask]); // Second query (by number) succeeds

            const result = await resolveTaskIdentifier('158', 1);

            expect(result).toEqual(mockTask);
        });
    });

    describe('error messages', () => {
        it('TaskNotFoundError includes identifier and attemptedAs', async () => {
            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            try {
                await resolveTaskIdentifier(158, 1);
                expect.fail('Should have thrown TaskNotFoundError');
            } catch (error) {
                expect(error).toBeInstanceOf(TaskNotFoundError);
                const taskError = error as TaskNotFoundError;
                expect(taskError.identifier).toBe(158);
                expect(taskError.attemptedAs).toBe('task_id or task_number');
            }
        });

        it('InvalidIdentifierError includes identifier', async () => {
            try {
                await resolveTaskIdentifier({ invalid: 'object' } as any);
                expect.fail('Should have thrown InvalidIdentifierError');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidIdentifierError);
                const invalidError = error as InvalidIdentifierError;
                expect(invalidError.identifier).toEqual({ invalid: 'object' });
            }
        });

        it('AmbiguousIdentifierError includes match count', async () => {
            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                    { task_id: 1 },
                    { task_id: 2 },
                    { task_id: 3 }
                ]);

            try {
                await resolveTaskIdentifier(158);
                expect.fail('Should have thrown AmbiguousIdentifierError');
            } catch (error) {
                expect(error).toBeInstanceOf(AmbiguousIdentifierError);
                const ambError = error as AmbiguousIdentifierError;
                expect(ambError.matchCount).toBe(3);
            }
        });
    });

    describe('edge cases', () => {
        it('handles task without epic (epic_id = null)', async () => {
            const mockTask = {
                task_id: 500,
                task_number: 200,
                task_code: 'DFO-200',
                project_id: 1,
                project_code: 'DFO',
                epic_id: null
            };

            mockQuery.mockResolvedValueOnce([mockTask]);

            const result = await resolveTaskIdentifier(500);

            expect(result.epic_id).toBeNull();
            expect(result.task_code).toBe('DFO-200');
        });

        it('handles 4-letter project codes', async () => {
            const mockTask = {
                task_id: 600,
                task_number: 50,
                task_code: 'SOLR-50-EPIC3',
                project_id: 5,
                project_code: 'SOLR',
                epic_id: 3
            };

            mockQuery.mockResolvedValueOnce([mockTask]);

            const result = await resolveTaskIdentifier('SOLR-50-EPIC3');

            expect(result.project_code).toBe('SOLR');
        });

        it('handles 2-letter project codes', async () => {
            const mockTask = {
                task_id: 700,
                task_number: 75,
                task_code: 'AI-75',
                project_id: 7,
                project_code: 'AI',
                epic_id: null
            };

            mockQuery.mockResolvedValueOnce([mockTask]);

            const result = await resolveTaskIdentifier('AI-75');

            expect(result.project_code).toBe('AI');
        });
    });
});
