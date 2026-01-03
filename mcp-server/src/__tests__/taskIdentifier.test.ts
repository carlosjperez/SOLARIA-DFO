/**
 * Task Identifier Resolution Tests (SOL-2)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 *
 * Using dependency injection pattern for testing
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import type { Database } from '../database.js';
import {
    resolveTaskIdentifier,
    TaskNotFoundError,
    InvalidIdentifierError,
    AmbiguousIdentifierError
} from '../utils/taskIdentifier.js';

describe('resolveTaskIdentifier', () => {
    let mockDb: Database;

    beforeEach(() => {
        // Create fresh mock database for each test
        mockDb = {
            query: async () => [],
            execute: async () => ({ affectedRows: 0 })
        };
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

            mockDb.query = async () => [mockTask];

            const result = await resolveTaskIdentifier(491, undefined, mockDb);

            expect(result).toEqual(mockTask);
        });

        it('throws TaskNotFoundError for non-existent task_id', async () => {
            mockDb.query = async () => [];

            await expect(resolveTaskIdentifier(999999, undefined, mockDb))
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

            let callCount = 0;
            mockDb.query = async () => {
                callCount++;
                // First call (by ID) returns empty, second call (by number) succeeds
                return callCount === 1 ? [] : [mockTask];
            };

            const result = await resolveTaskIdentifier(158, 1, mockDb);

            expect(result).toEqual(mockTask);
        });

        it('throws AmbiguousIdentifierError when multiple projects have same task_number', async () => {
            const mockTasks = [
                { task_id: 491, task_number: 158, project_id: 1 },
                { task_id: 520, task_number: 158, project_id: 2 }
            ];

            let callCount = 0;
            mockDb.query = async () => {
                callCount++;
                // First call (by ID) returns empty, second call returns multiple
                return callCount === 1 ? [] : mockTasks;
            };

            await expect(resolveTaskIdentifier(158, undefined, mockDb))
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

            mockDb.query = async () => [mockTask];

            const result = await resolveTaskIdentifier('DFO-158-EPIC15', undefined, mockDb);

            expect(result).toEqual(mockTask);
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

            mockDb.query = async () => [mockTask];

            const result = await resolveTaskIdentifier('DFO-100', undefined, mockDb);

            expect(result).toEqual(mockTask);
        });

        it('throws TaskNotFoundError for non-existent task_code', async () => {
            mockDb.query = async () => [];

            await expect(resolveTaskIdentifier('DFO-999-EPIC99', undefined, mockDb))
                .rejects.toThrow(TaskNotFoundError);
        });

        it('throws InvalidIdentifierError for malformed task_code', async () => {
            await expect(resolveTaskIdentifier('DFO_158_EPIC15', undefined, mockDb))
                .rejects.toThrow(InvalidIdentifierError);

            await expect(resolveTaskIdentifier('DFO-EPIC15', undefined, mockDb))
                .rejects.toThrow(InvalidIdentifierError);

            await expect(resolveTaskIdentifier('158-EPIC15', undefined, mockDb))
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

            let callCount = 0;
            mockDb.query = async () => {
                callCount++;
                // First call (by ID) returns empty, second call (by number) succeeds
                return callCount === 1 ? [] : [mockTask];
            };

            const result = await resolveTaskIdentifier('158', 1, mockDb);

            expect(result).toEqual(mockTask);
        });
    });

    describe('error messages', () => {
        it('TaskNotFoundError includes identifier and attemptedAs', async () => {
            mockDb.query = async () => [];

            try {
                await resolveTaskIdentifier(158, 1, mockDb);
                expect.fail('Should have thrown TaskNotFoundError');
            } catch (error) {
                expect(error).toBeInstanceOf(TaskNotFoundError);
                const notFoundError = error as TaskNotFoundError;
                expect(notFoundError.identifier).toBe(158);
                expect(notFoundError.attemptedAs).toBe('task_id or task_number');
            }
        });

        it('InvalidIdentifierError includes identifier', async () => {
            const invalidIdentifier = { invalid: 'object' };

            try {
                await resolveTaskIdentifier(invalidIdentifier as any, undefined, mockDb);
                expect.fail('Should have thrown InvalidIdentifierError');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidIdentifierError);
                const invalidError = error as InvalidIdentifierError;
                expect(invalidError.identifier).toEqual({ invalid: 'object' });
            }
        });

        it('AmbiguousIdentifierError includes match count', async () => {
            let callCount = 0;
            mockDb.query = async () => {
                callCount++;
                return callCount === 1 ? [] : [
                    { task_id: 1 },
                    { task_id: 2 },
                    { task_id: 3 }
                ];
            };

            try {
                await resolveTaskIdentifier(158, undefined, mockDb);
                expect.fail('Should have thrown AmbiguousIdentifierError');
            } catch (error) {
                expect(error).toBeInstanceOf(AmbiguousIdentifierError);
                const ambiguousError = error as AmbiguousIdentifierError;
                expect(ambiguousError.matchCount).toBe(3);
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

            mockDb.query = async () => [mockTask];

            const result = await resolveTaskIdentifier(500, undefined, mockDb);

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

            mockDb.query = async () => [mockTask];

            const result = await resolveTaskIdentifier('SOLR-50-EPIC3', undefined, mockDb);

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

            mockDb.query = async () => [mockTask];

            const result = await resolveTaskIdentifier('AI-75', undefined, mockDb);

            expect(result.project_code).toBe('AI');
        });
    });
});
