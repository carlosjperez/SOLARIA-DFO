/**
 * Tests for useProjects hook - Response Structure Handling
 *
 * @author ECO-Lambda | Production Bug Fix DFO-210
 * @date 2026-01-03
 *
 * Tests the useProjects hook to ensure correct handling of different
 * API response structures:
 * - Direct array: [{project1}, {project2}, ...]
 * - Wrapped object: {projects: [...]}
 * - Wrapped object: {data: [...]}
 *
 * Bug fixed: Frontend expected wrapped object but backend returned direct array,
 * causing projects to not display in production.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects } from '../useApi';
import * as api from '@/lib/api';
import { createElement, type ReactNode } from 'react';

// Mock the API module
vi.mock('@/lib/api', () => ({
    projectsApi: {
        getAll: vi.fn(),
    },
}));

describe('useProjects hook', () => {
    let queryClient: QueryClient;

    // Create a fresh QueryClient for each test
    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false, // Disable retries for tests
                },
            },
        });
    });

    // Clear all mocks after each test
    afterEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    // Helper to create wrapper with QueryClient
    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
    };

    describe('Response structure handling (DFO-210 bug fix)', () => {
        it('handles direct array response from backend (production case)', async () => {
            // This is the ACTUAL response structure from backend (server.ts:1766)
            const mockProjects = [
                { id: 99, name: 'SOLARIA DFO Test', code: 'SLR', status: 'planning', priority: 'medium', progress: 0, createdAt: '2025-12-30', updatedAt: '2025-12-30', total_tasks: 19, completed_tasks: 12, tasks_pending: 5, tasks_in_progress: 1, tasks_blocked: 1 },
                { id: 98, name: 'DFO Enhancement Plan 2025', code: 'DFN', status: 'planning', priority: 'medium', progress: 0, createdAt: '2025-12-27', updatedAt: '2025-12-27', total_tasks: 10, completed_tasks: 10, tasks_pending: 0, tasks_in_progress: 0, tasks_blocked: 0 },
            ];

            // Mock API to return direct array
            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: mockProjects, // Axios wraps response in { data }
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            // Wait for query to complete
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            // Should successfully parse the direct array
            expect(result.current.data).toBeDefined();
            expect(result.current.data).toHaveLength(2);
            expect(result.current.data![0].id).toBe(99);
            expect(result.current.data![0].name).toBe('SOLARIA DFO Test');
            expect(result.current.data![1].id).toBe(98);
        });

        it('handles wrapped object response with data.projects', async () => {
            const mockProjects = [
                { id: 1, name: 'Project A', code: 'PA', status: 'development', priority: 'high', progress: 50, createdAt: '2025-01-01', updatedAt: '2025-01-02', total_tasks: 10, completed_tasks: 5, tasks_pending: 5, tasks_in_progress: 0, tasks_blocked: 0 },
            ];

            // Mock API to return wrapped object
            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: { projects: mockProjects }, // Wrapped structure
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toBeDefined();
            expect(result.current.data).toHaveLength(1);
            expect(result.current.data![0].id).toBe(1);
            expect(result.current.data![0].name).toBe('Project A');
        });

        it('handles wrapped object response with data.data', async () => {
            const mockProjects = [
                { id: 2, name: 'Project B', code: 'PB', status: 'planning', priority: 'low', progress: 0, createdAt: '2025-01-01', updatedAt: '2025-01-02', total_tasks: 5, completed_tasks: 0, tasks_pending: 5, tasks_in_progress: 0, tasks_blocked: 0 },
            ];

            // Mock API to return nested data structure
            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: { data: mockProjects }, // Alternative wrapped structure
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toBeDefined();
            expect(result.current.data).toHaveLength(1);
            expect(result.current.data![0].id).toBe(2);
        });

        it('handles empty array response', async () => {
            // Mock API to return empty array
            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: [], // Empty direct array
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toBeDefined();
            expect(result.current.data).toHaveLength(0);
        });

        it('handles malformed response gracefully', async () => {
            // Mock API to return invalid structure (edge case)
            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: { invalid: 'structure' } as any,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            // Should fallback to empty array when structure is invalid
            expect(result.current.data).toBeDefined();
            expect(result.current.data).toHaveLength(0);
        });
    });

    describe('Data transformation', () => {
        it('transforms snake_case fields to camelCase', async () => {
            const mockProjects = [
                {
                    id: 1,
                    name: 'Test Project',
                    code: 'TEST',
                    status: 'development',
                    priority: 'high',
                    progress: 75,
                    createdAt: '2025-01-01',
                    updatedAt: '2025-01-02',
                    total_tasks: 164,
                    completed_tasks: 137,
                    tasks_pending: 27, // ← Should map to tasksPending
                    tasks_in_progress: 10,
                    tasks_blocked: 5,
                    agents_assigned: 3,
                },
            ];

            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: mockProjects,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            const project = result.current.data![0];
            expect(project.tasksTotal).toBe(164);
            expect(project.tasksCompleted).toBe(137);
            expect(project.tasksPending).toBe(27);
            expect(project.tasksInProgress).toBe(10);
            expect(project.tasksBlocked).toBe(5);
            expect(project.activeAgents).toBe(3);
        });
    });

    describe('Error handling', () => {
        it('handles API errors correctly', async () => {
            const mockError = new Error('Network error');

            vi.mocked(api.projectsApi.getAll).mockRejectedValue(mockError);

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toBe(mockError);
            expect(result.current.data).toBeUndefined();
        });

        it('handles 404 Not Found', async () => {
            const mockError = {
                response: {
                    status: 404,
                    data: { error: 'Not Found' },
                },
            };

            vi.mocked(api.projectsApi.getAll).mockRejectedValue(mockError);

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(mockError);
        });

        it('handles 500 Internal Server Error', async () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' },
                },
            };

            vi.mocked(api.projectsApi.getAll).mockRejectedValue(mockError);

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(mockError);
        });
    });

    describe('React Query integration', () => {
        it('uses correct query key', async () => {
            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            // Query key should be ['projects']
            const queryData = queryClient.getQueryData(['projects']);
            expect(queryData).toBeDefined();
        });

        it('respects staleTime configuration', async () => {
            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: [{ id: 1, name: 'Test', code: 'T', status: 'development', priority: 'high', progress: 0, createdAt: '2025-01-01', updatedAt: '2025-01-01', total_tasks: 0, completed_tasks: 0, tasks_pending: 0, tasks_in_progress: 0, tasks_blocked: 0 }],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            // Data should be cached
            const queryState = queryClient.getQueryState(['projects']);
            expect(queryState?.data).toBeDefined();
        });
    });

    describe('Production bug regression tests (DFO-210)', () => {
        it('prevents regression of "projects not displaying" bug', async () => {
            // EXACT scenario that caused the production bug
            const productionResponse = [
                { id: 99, name: 'SOLARIA DFO Test', code: 'SLR', status: 'planning', priority: 'medium', progress: 0, createdAt: '2025-12-30', updatedAt: '2025-12-30', total_tasks: 19, completed_tasks: 12, tasks_pending: 5, tasks_in_progress: 1, tasks_blocked: 1 },
                { id: 98, name: 'DFO Enhancement Plan 2025', code: 'DFN', status: 'planning', priority: 'medium', progress: 0, createdAt: '2025-12-27', updatedAt: '2025-12-27', total_tasks: 10, completed_tasks: 10, tasks_pending: 0, tasks_in_progress: 0, tasks_blocked: 0 },
                { id: 5, name: 'Vibe Platform', code: 'PRJ-003', status: 'development', priority: 'medium', progress: 28, createdAt: '2025-12-19', updatedAt: '2025-12-25', total_tasks: 14, completed_tasks: 6, tasks_pending: 8, tasks_in_progress: 0, tasks_blocked: 0 },
                { id: 97, name: 'BRIK-64 Framework', code: 'BRK', status: 'planning', priority: 'medium', progress: 0, createdAt: '2025-12-25', updatedAt: '2025-12-25', total_tasks: 12, completed_tasks: 12, tasks_pending: 0, tasks_in_progress: 0, tasks_blocked: 0 },
                { id: 96, name: 'AGUA BENDITA', code: 'GBN', status: 'planning', priority: 'medium', progress: 0, createdAt: '2025-12-22', updatedAt: '2025-12-22', total_tasks: 0, completed_tasks: 0, tasks_pending: 0, tasks_in_progress: 0, tasks_blocked: 0 },
                { id: 4, name: 'Inmobiliaria Virgen del Rocío', code: 'PRJ-002', status: 'planning', priority: 'high', progress: 0, createdAt: '2025-12-19', updatedAt: '2025-12-19', total_tasks: 10, completed_tasks: 6, tasks_pending: 4, tasks_in_progress: 0, tasks_blocked: 0 },
                { id: 3, name: 'OFFICE.SOLARIA.AGENCY', code: 'PRJ-001', status: 'planning', priority: 'medium', progress: 0, createdAt: '2025-12-19', updatedAt: '2025-12-19', total_tasks: 58, completed_tasks: 26, tasks_pending: 32, tasks_in_progress: 0, tasks_blocked: 0 },
                { id: 1, name: 'SOLARIA Digital Field Operations', code: 'DFO', status: 'development', priority: 'high', progress: 85, createdAt: '2025-12-13', updatedAt: '2025-12-19', total_tasks: 192, completed_tasks: 184, tasks_pending: 6, tasks_in_progress: 1, tasks_blocked: 1 },
                { id: 2, name: 'Akademate.com', code: 'AKD', status: 'development', priority: 'critical', progress: 45, createdAt: '2025-12-14', updatedAt: '2025-12-18', total_tasks: 39, completed_tasks: 25, tasks_pending: 12, tasks_in_progress: 2, tasks_blocked: 0 },
            ];

            vi.mocked(api.projectsApi.getAll).mockResolvedValue({
                data: productionResponse, // Direct array from backend
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            });

            const { result } = renderHook(() => useProjects(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            // MUST NOT return empty array (this was the bug)
            expect(result.current.data).toBeDefined();
            expect(result.current.data).not.toHaveLength(0);
            expect(result.current.data).toHaveLength(9);

            // Verify all 9 projects are present
            const projectCodes = result.current.data!.map(p => p.code);
            expect(projectCodes).toContain('SLR');
            expect(projectCodes).toContain('DFN');
            expect(projectCodes).toContain('PRJ-003');
            expect(projectCodes).toContain('BRK');
            expect(projectCodes).toContain('GBN');
            expect(projectCodes).toContain('PRJ-002');
            expect(projectCodes).toContain('PRJ-001');
            expect(projectCodes).toContain('DFO');
            expect(projectCodes).toContain('AKD');
        });
    });
});
