import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import * as useApiHooks from '@/hooks/useApi';

// Mock the hooks
vi.mock('@/hooks/useApi', () => ({
    useDashboardOverview: vi.fn(),
    useProjects: vi.fn(),
    useTasks: vi.fn(),
}));

// Mock MiniTrello component
vi.mock('@/components/common/MiniTrello', () => ({
    MiniTrello: ({ board }: { board: { todo: number; doing: number; done: number } }) => (
        <div data-testid="mini-trello">
            TODO: {board.todo} | DOING: {board.doing} | DONE: {board.done}
        </div>
    ),
}));

describe('DashboardPage Layout Standardization', () => {
    const mockStats = {
        activeProjects: 5,
        completedTasks: 137,
        inProgressTasks: 12,
        activeAgents: 3,
    };

    const mockProjects = [
        {
            id: 1,
            name: 'Project Alpha',
            code: 'ALPHA',
            status: 'development',
            priority: 'high',
            progress: 75,
            tasksTotal: 50,
            tasksCompleted: 37,
            tasksPending: 10,
            tasksInProgress: 3,
            tasksBlocked: 0,
            budgetAllocated: 50000,
            activeAgents: 2,
            endDate: '2025-03-15',
            createdAt: '2025-01-01',
            updatedAt: '2025-01-15',
        },
        {
            id: 2,
            name: 'Project Beta',
            code: 'BETA',
            status: 'completed',
            priority: 'medium',
            progress: 100,
            tasksTotal: 30,
            tasksCompleted: 30,
            tasksPending: 0,
            tasksInProgress: 0,
            tasksBlocked: 0,
            budgetAllocated: 25000,
            activeAgents: 1,
            endDate: '2025-02-01',
            createdAt: '2024-12-01',
            updatedAt: '2025-01-20',
        },
    ];

    const mockTasks = [
        {
            id: 1,
            title: 'Task 1',
            status: 'completed',
            priority: 'high',
            taskCode: 'T-001',
            taskNumber: 1,
            createdAt: '2025-01-10',
            updatedAt: '2025-01-15',
            completedAt: '2025-01-15',
            projectId: 1,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useApiHooks.useDashboardOverview as any).mockReturnValue({
            data: mockStats,
            isLoading: false,
        });
        (useApiHooks.useProjects as any).mockReturnValue({
            data: mockProjects,
            isLoading: false,
        });
        (useApiHooks.useTasks as any).mockReturnValue({
            data: mockTasks,
            isLoading: false,
        });
    });

    it('renders the page header with view toggle', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Vista ejecutiva del estado de operaciones')).toBeInTheDocument();

        // Check view toggle buttons exist
        const viewToggles = screen.getAllByRole('button');
        const gridButton = viewToggles.find(btn => btn.getAttribute('title') === 'Vista Grid');
        const listButton = viewToggles.find(btn => btn.getAttribute('title') === 'Vista Lista');

        expect(gridButton).toBeDefined();
        expect(listButton).toBeDefined();
    });

    it('renders stats cards correctly', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Proyectos Activos')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Tareas Completadas')).toBeInTheDocument();
        expect(screen.getByText('137')).toBeInTheDocument();
        expect(screen.getByText('En Progreso')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Agentes Activos')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders projects in grid view by default', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        // Check for projects-grid class
        const gridContainer = document.querySelector('.projects-grid');
        expect(gridContainer).toBeInTheDocument();

        // Check that projects are rendered
        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.getByText('ALPHA')).toBeInTheDocument();
        expect(screen.getByText('Project Beta')).toBeInTheDocument();
        expect(screen.getByText('BETA')).toBeInTheDocument();
    });

    it('switches to list view when list button is clicked', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        // Find and click list view button
        const viewToggles = screen.getAllByRole('button');
        const listButton = viewToggles.find(btn => btn.getAttribute('title') === 'Vista Lista');

        if (listButton) {
            fireEvent.click(listButton);
        }

        // Check for list-table class
        const listContainer = document.querySelector('.list-table');
        expect(listContainer).toBeInTheDocument();

        // Grid should not be visible
        const gridContainer = document.querySelector('.projects-grid');
        expect(gridContainer).not.toBeInTheDocument();
    });

    it('calculates board stats correctly for MiniTrello', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        // Check that MiniTrello is rendered with correct stats
        const miniTrellos = screen.getAllByTestId('mini-trello');
        expect(miniTrellos.length).toBeGreaterThan(0);

        // Project Alpha: 10 pending, 3 in_progress, 37 completed
        expect(screen.getByText(/TODO: 10.*DOING: 3.*DONE: 37/)).toBeInTheDocument();

        // Project Beta: 0 pending, 0 in_progress, 30 completed
        expect(screen.getByText(/TODO: 0.*DOING: 0.*DONE: 30/)).toBeInTheDocument();
    });

    it('shows loading state while fetching projects', () => {
        (useApiHooks.useProjects as any).mockReturnValue({
            data: null,
            isLoading: true,
        });

        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Cargando proyectos...')).toBeInTheDocument();
    });

    it('shows empty state when no projects exist', () => {
        (useApiHooks.useProjects as any).mockReturnValue({
            data: [],
            isLoading: false,
        });

        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        expect(screen.getByText('No hay proyectos todavia')).toBeInTheDocument();
    });

    it('uses consistent CSS classes with ProjectsPage', () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        // Check for shared classes
        expect(document.querySelector('.section-header')).toBeInTheDocument();
        expect(document.querySelector('.dashboard-stats-row')).toBeInTheDocument();
        expect(document.querySelector('.projects-grid')).toBeInTheDocument();
        expect(document.querySelector('.project-card')).toBeInTheDocument();
    });
});
