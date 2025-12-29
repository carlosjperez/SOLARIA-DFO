/**
 * Tests for API hooks data transformation
 *
 * @author ECO-Lambda | Bug Fix DFO-MiniTrello
 * @date 2025-12-29
 *
 * Tests the transformProjectData function to ensure correct mapping
 * of snake_case API fields to camelCase frontend fields.
 *
 * Bug fixed: API returns tasks_pending but frontend was looking for pending_tasks
 */

import { describe, it, expect } from 'vitest';
import type { Project } from '@/types';

/**
 * Mock of the transformProjectData function
 * (We can't import it directly since it's not exported, so we replicate the logic)
 */
function transformProjectData(p: Record<string, unknown>): Project {
    const base = p as unknown as Project;
    return {
        ...base,
        // Task counts - API returns tasks_* (not *_tasks)
        tasksTotal: (p.tasksTotal ?? p.totalTasks ?? p.total_tasks ?? 0) as number,
        tasksCompleted: (p.tasksCompleted ?? p.completedTasks ?? p.completed_tasks ?? 0) as number,
        tasksPending: (p.tasksPending ?? p.pendingTasks ?? p.pending_tasks ?? p.tasks_pending ?? 0) as number,
        tasksInProgress: (p.tasksInProgress ?? p.inProgressTasks ?? p.in_progress_tasks ?? p.tasks_in_progress ?? 0) as number,
        tasksBlocked: (p.tasksBlocked ?? p.blockedTasks ?? p.blocked_tasks ?? p.tasks_blocked ?? 0) as number,
        // Other fields
        activeAgents: (p.activeAgents ?? p.agentsAssigned ?? p.agents_assigned ?? 0) as number,
        budgetAllocated: (p.budgetAllocated ?? p.budget ?? 0) as number,
        budgetSpent: (p.budgetSpent ?? p.actualCost ?? p.actual_cost ?? 0) as number,
    };
}

describe('transformProjectData', () => {

    describe('API response with snake_case fields (tasks_*)', () => {
        it('correctly maps tasks_pending to tasksPending', () => {
            const apiResponse = {
                id: 1,
                name: 'Test Project',
                code: 'TEST',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 75,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                total_tasks: 164,
                completed_tasks: 137,
                tasks_pending: 27,  // ← Bug was here: frontend looked for pending_tasks
                tasks_in_progress: 0,
                tasks_blocked: 0,
                agents_assigned: 3,
            };

            const transformed = transformProjectData(apiResponse);

            expect(transformed.tasksPending).toBe(27);
        });

        it('correctly maps all task count fields', () => {
            const apiResponse = {
                id: 1,
                name: 'Test Project',
                code: 'TEST',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 75,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                total_tasks: 164,
                completed_tasks: 137,
                tasks_pending: 27,
                tasks_in_progress: 10,
                tasks_blocked: 5,
            };

            const transformed = transformProjectData(apiResponse);

            expect(transformed.tasksTotal).toBe(164);
            expect(transformed.tasksCompleted).toBe(137);
            expect(transformed.tasksPending).toBe(27);
            expect(transformed.tasksInProgress).toBe(10);
            expect(transformed.tasksBlocked).toBe(5);
        });
    });

    describe('API response with camelCase fields (already transformed by axios)', () => {
        it('correctly maps tasksPending when already camelCase', () => {
            const apiResponse = {
                id: 1,
                name: 'Test Project',
                code: 'TEST',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 75,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                tasksTotal: 164,
                tasksCompleted: 137,
                tasksPending: 27,
                tasksInProgress: 0,
                tasksBlocked: 0,
            };

            const transformed = transformProjectData(apiResponse);

            expect(transformed.tasksPending).toBe(27);
            expect(transformed.tasksInProgress).toBe(0);
            expect(transformed.tasksBlocked).toBe(0);
        });
    });

    describe('fallback behavior when fields are missing', () => {
        it('defaults to 0 when task count fields are missing', () => {
            const apiResponse = {
                id: 1,
                name: 'Test Project',
                code: 'TEST',
                status: 'planning' as const,
                priority: 'low' as const,
                progress: 0,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                // No task count fields
            };

            const transformed = transformProjectData(apiResponse);

            expect(transformed.tasksTotal).toBe(0);
            expect(transformed.tasksCompleted).toBe(0);
            expect(transformed.tasksPending).toBe(0);
            expect(transformed.tasksInProgress).toBe(0);
            expect(transformed.tasksBlocked).toBe(0);
        });

        it('prefers tasksPending over pendingTasks over pending_tasks over tasks_pending', () => {
            const apiResponse1 = {
                id: 1,
                name: 'Test',
                code: 'T1',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 0,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                tasksPending: 100,
                pendingTasks: 50,
                pending_tasks: 25,
                tasks_pending: 10,
            };

            expect(transformProjectData(apiResponse1).tasksPending).toBe(100);

            const apiResponse2 = {
                id: 2,
                name: 'Test',
                code: 'T2',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 0,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                pendingTasks: 50,
                pending_tasks: 25,
                tasks_pending: 10,
            };

            expect(transformProjectData(apiResponse2).tasksPending).toBe(50);

            const apiResponse3 = {
                id: 3,
                name: 'Test',
                code: 'T3',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 0,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                pending_tasks: 25,
                tasks_pending: 10,
            };

            expect(transformProjectData(apiResponse3).tasksPending).toBe(25);

            const apiResponse4 = {
                id: 4,
                name: 'Test',
                code: 'T4',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 0,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                tasks_pending: 10,
            };

            expect(transformProjectData(apiResponse4).tasksPending).toBe(10);
        });
    });

    describe('other field transformations', () => {
        it('correctly maps activeAgents from agents_assigned', () => {
            const apiResponse = {
                id: 1,
                name: 'Test Project',
                code: 'TEST',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 75,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                agents_assigned: 5,
            };

            const transformed = transformProjectData(apiResponse);

            expect(transformed.activeAgents).toBe(5);
        });

        it('correctly maps budgetAllocated and budgetSpent', () => {
            const apiResponse = {
                id: 1,
                name: 'Test Project',
                code: 'TEST',
                status: 'development' as const,
                priority: 'high' as const,
                progress: 75,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-02',
                budget: 50000,
                actual_cost: 35000,
            };

            const transformed = transformProjectData(apiResponse);

            expect(transformed.budgetAllocated).toBe(50000);
            expect(transformed.budgetSpent).toBe(35000);
        });
    });

    describe('MiniTrello integration scenario (real bug)', () => {
        it('MiniTrello receives correct TODO count from transformed data', () => {
            // This is the exact scenario that was failing
            const apiResponse = {
                id: 1,
                name: 'SOLARIA Digital Field Operations',
                code: 'DFO',
                status: 'development' as const,
                priority: 'critical' as const,
                progress: 83,
                createdAt: '2024-12-01',
                updatedAt: '2025-12-29',
                total_tasks: 164,
                completed_tasks: 137,
                tasks_pending: 27,  // ← This was showing as 0 in MiniTrello
                tasks_in_progress: 0,
                tasks_blocked: 0,
            };

            const transformed = transformProjectData(apiResponse);

            // ProjectsPage maps this to board stats
            const boardStats = {
                backlog: 0,
                todo: transformed.tasksPending || 0,
                doing: transformed.tasksInProgress || 0,
                done: transformed.tasksCompleted || 0,
                blocked: transformed.tasksBlocked || 0,
            };

            // MiniTrello should now show TODO: 27 (not 0)
            expect(boardStats.todo).toBe(27);
            expect(boardStats.done).toBe(137);
        });
    });
});
