import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TasksPage } from './TasksPage';

// Mock the API hooks
vi.mock('@/hooks/useApi', () => ({
    useTasks: vi.fn(),
    useProjects: vi.fn(),
}));

// Mock the task components
vi.mock('@/components/tasks', () => ({
    TaskCard: ({ task, onClick }: { task: { id: number; title: string }; onClick: () => void }) => (
        <div data-testid={`task-card-${task.id}`} onClick={onClick} className="task-card">
            {task.title}
        </div>
    ),
    GanttView: ({ tasks }: { tasks: { id: number }[] }) => (
        <div data-testid="gantt-view">Gantt: {tasks.length} tasks</div>
    ),
    TaskDetailDrawer: ({ taskId, isOpen, onClose }: { taskId: number | null; isOpen: boolean; onClose: () => void }) => (
        isOpen ? <div data-testid="task-drawer">Drawer for task {taskId}</div> : null
    ),
}));

import { useTasks, useProjects } from '@/hooks/useApi';

// Helper to create mock tasks
const createMockTask = (overrides: Partial<{
    id: number;
    title: string;
    taskCode: string;
    taskNumber: number;
    description: string;
    status: string;
    priority: string;
    progress: number;
    projectId: number;
    projectCode: string;
    projectName: string;
    itemsCompleted: number;
    itemsTotal: number;
    updatedAt: string;
}> = {}) => ({
    id: 1,
    title: 'Test Task',
    taskCode: 'TSK-001',
    taskNumber: 1,
    description: 'Test description',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    projectId: 1,
    projectCode: 'PRJ-001',
    projectName: 'Test Project',
    itemsCompleted: 0,
    itemsTotal: 5,
    updatedAt: new Date().toISOString(),
    ...overrides,
});

const createMockProject = (overrides: Partial<{
    id: number;
    name: string;
    code: string;
}> = {}) => ({
    id: 1,
    name: 'Test Project',
    code: 'PRJ-001',
    ...overrides,
});

const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('TasksPage Component - DFO-111 Full Viewport Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
            data: [],
            isLoading: false,
        });
        (useProjects as ReturnType<typeof vi.fn>).mockReturnValue({
            data: [],
        });
    });

    describe('Full Viewport Layout Structure', () => {
        it('should have flex-col h-full container for full height', () => {
            renderWithProviders(<TasksPage />);

            const container = document.querySelector('.flex.flex-col.h-full');
            expect(container).toBeInTheDocument();
        });

        it('should have shrink-0 on header section', () => {
            renderWithProviders(<TasksPage />);

            const header = document.querySelector('.section-header.shrink-0');
            expect(header).toBeInTheDocument();
        });

        it('should have shrink-0 on stats row', () => {
            renderWithProviders(<TasksPage />);

            const statsRow = document.querySelector('.grid.grid-cols-4.shrink-0');
            expect(statsRow).toBeInTheDocument();
        });

        it('should have shrink-0 on filters row', () => {
            renderWithProviders(<TasksPage />);

            const filtersRow = document.querySelector('.filters-row.shrink-0');
            expect(filtersRow).toBeInTheDocument();
        });

        it('should have flex-1 min-h-0 content wrapper for flexible height', () => {
            renderWithProviders(<TasksPage />);

            const contentWrapper = document.querySelector('.flex-1.min-h-0.flex.flex-col');
            expect(contentWrapper).toBeInTheDocument();
        });
    });

    describe('Kanban Container Structure', () => {
        it('should render kanban-container with proper classes', () => {
            const tasks = [
                createMockTask({ id: 1, status: 'pending' }),
                createMockTask({ id: 2, status: 'in_progress' }),
            ];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const kanbanContainer = document.querySelector('.kanban-container');
            expect(kanbanContainer).toBeInTheDocument();
        });

        it('should render all 5 kanban columns', () => {
            renderWithProviders(<TasksPage />);

            const columns = document.querySelectorAll('.kanban-column');
            expect(columns.length).toBe(5);
        });

        it('should render Pending column header', () => {
            renderWithProviders(<TasksPage />);
            const pendingHeaders = screen.getAllByText('Pendiente');
            // One in the select filter, one in the column header
            expect(pendingHeaders.length).toBeGreaterThanOrEqual(1);
        });

        it('should render In Progress column header', () => {
            renderWithProviders(<TasksPage />);
            const headers = screen.getAllByText('En Progreso');
            expect(headers.length).toBeGreaterThanOrEqual(1);
        });

        it('should render Review column header', () => {
            renderWithProviders(<TasksPage />);
            const headers = screen.getAllByText('Revision');
            expect(headers.length).toBeGreaterThanOrEqual(1);
        });

        it('should render Completed column header', () => {
            renderWithProviders(<TasksPage />);
            const headers = screen.getAllByText('Completado');
            expect(headers.length).toBeGreaterThanOrEqual(1);
        });

        it('should render Blocked column header', () => {
            renderWithProviders(<TasksPage />);
            const headers = screen.getAllByText('Bloqueado');
            expect(headers.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Task Distribution Across Columns', () => {
        it('should place tasks in correct columns by status', () => {
            const tasks = [
                createMockTask({ id: 1, status: 'pending', title: 'Pending Task' }),
                createMockTask({ id: 2, status: 'in_progress', title: 'In Progress Task' }),
                createMockTask({ id: 3, status: 'completed', title: 'Completed Task' }),
                createMockTask({ id: 4, status: 'blocked', title: 'Blocked Task' }),
            ];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            // Check that task cards are rendered
            expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
            expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
            expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
            expect(screen.getByTestId('task-card-4')).toBeInTheDocument();
        });

        it('should show empty state when column has no tasks', () => {
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [],
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const emptyStates = screen.getAllByText('Sin tareas');
            expect(emptyStates.length).toBe(5); // One per column
        });
    });

    describe('View Mode Switching', () => {
        it('should show Kanban view by default', () => {
            renderWithProviders(<TasksPage />);

            const kanbanContainer = document.querySelector('.kanban-container');
            expect(kanbanContainer).toBeInTheDocument();
        });

        it('should switch to List view when list button is clicked', () => {
            const tasks = [createMockTask({ id: 1 })];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const listButton = screen.getByTitle('Vista Lista');
            fireEvent.click(listButton);

            expect(document.querySelector('.list-table')).toBeInTheDocument();
        });

        it('should switch to Gantt view when gantt button is clicked', () => {
            const tasks = [createMockTask({ id: 1 })];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const ganttButton = screen.getByTitle('Vista Gantt');
            fireEvent.click(ganttButton);

            expect(screen.getByTestId('gantt-view')).toBeInTheDocument();
        });
    });

    describe('List View Container', () => {
        it('should have flex-1 min-h-0 overflow-auto wrapper in List view', () => {
            const tasks = [createMockTask({ id: 1 })];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const listButton = screen.getByTitle('Vista Lista');
            fireEvent.click(listButton);

            const listWrapper = document.querySelector('.flex-1.min-h-0.overflow-auto');
            expect(listWrapper).toBeInTheDocument();
        });
    });

    describe('Gantt View Container', () => {
        it('should have flex-1 min-h-0 overflow-auto wrapper in Gantt view', () => {
            const tasks = [createMockTask({ id: 1 })];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const ganttButton = screen.getByTitle('Vista Gantt');
            fireEvent.click(ganttButton);

            const ganttWrapper = document.querySelector('.flex-1.min-h-0.overflow-auto');
            expect(ganttWrapper).toBeInTheDocument();
        });
    });

    describe('Stats Display', () => {
        it('should display correct total task count', () => {
            const tasks = [
                createMockTask({ id: 1 }),
                createMockTask({ id: 2 }),
                createMockTask({ id: 3 }),
            ];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            // Check the subtitle contains the task count
            const subtitle = document.querySelector('.section-subtitle');
            expect(subtitle?.textContent).toContain('3 tareas');
        });

        it('should display blocked count with red styling when blockers exist', () => {
            const tasks = [
                createMockTask({ id: 1, status: 'blocked' }),
                createMockTask({ id: 2, status: 'blocked' }),
            ];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            // Check the red text for blocked tasks
            const blockedText = document.querySelector('.text-red-500');
            expect(blockedText).toBeInTheDocument();
            expect(blockedText?.textContent).toContain('2 bloqueadas');
        });
    });

    describe('Task Drawer', () => {
        it('should open drawer when task card is clicked', () => {
            const tasks = [createMockTask({ id: 42, title: 'Clickable Task' })];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const taskCard = screen.getByTestId('task-card-42');
            fireEvent.click(taskCard);

            expect(screen.getByTestId('task-drawer')).toBeInTheDocument();
            expect(screen.getByText('Drawer for task 42')).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading spinner when data is loading', () => {
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: undefined,
                isLoading: true,
            });

            renderWithProviders(<TasksPage />);

            const loader = document.querySelector('.animate-spin');
            expect(loader).toBeInTheDocument();
        });
    });

    describe('Filtering', () => {
        it('should filter tasks by search query', () => {
            const tasks = [
                createMockTask({ id: 1, title: 'Alpha Task' }),
                createMockTask({ id: 2, title: 'Beta Task' }),
            ];
            (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
                data: tasks,
                isLoading: false,
            });

            renderWithProviders(<TasksPage />);

            const searchInput = screen.getByPlaceholderText('Buscar tareas...');
            fireEvent.change(searchInput, { target: { value: 'Alpha' } });

            expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
            expect(screen.queryByTestId('task-card-2')).not.toBeInTheDocument();
        });
    });
});
