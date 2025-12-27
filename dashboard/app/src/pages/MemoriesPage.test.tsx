import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoriesPage } from './MemoriesPage';

// Mock the API hooks
vi.mock('@/hooks/useApi', () => ({
    useMemories: vi.fn(),
    useMemoryStats: vi.fn(),
    useMemoryTags: vi.fn(),
    useSearchMemories: vi.fn(),
}));

// Mock the MemoryDetailModal component to avoid dialog issues in tests
vi.mock('@/components/memories/MemoryDetailModal', () => ({
    MemoryDetailModal: () => null,
}));

import { useMemories, useMemoryStats, useMemoryTags, useSearchMemories } from '@/hooks/useApi';

// Helper to create a mock memory
const createMockMemory = (overrides: Partial<{
    id: number;
    content: string;
    summary: string;
    importance: number;
    tags: string[];
    accessCount: number;
    lastAccessed: string;
    createdAt: string;
}> = {}) => ({
    id: 1,
    content: 'Test memory content for testing purposes',
    summary: 'Test Summary',
    importance: 0.5,
    tags: ['decision', 'context'],
    accessCount: 10,
    lastAccessed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
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

describe('MemoriesPage Component - DFO-107 Enhanced UI Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock returns
        (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
            data: [],
            isLoading: false,
        });
        (useMemoryStats as ReturnType<typeof vi.fn>).mockReturnValue({
            data: {
                total_memories: 100,
                avg_importance: 0.65,
                total_accesses: 500,
                projects_with_memories: 5,
            },
        });
        (useMemoryTags as ReturnType<typeof vi.fn>).mockReturnValue({
            data: [
                { name: 'decision', usageCount: 25 },
                { name: 'context', usageCount: 20 },
                { name: 'bug', usageCount: 15 },
            ],
        });
        (useSearchMemories as ReturnType<typeof vi.fn>).mockReturnValue({
            data: [],
        });
    });

    describe('Importance Level Classes (memory-importance)', () => {
        it('should apply "high" class for importance >= 70%', () => {
            const highImportanceMemory = createMockMemory({ importance: 0.85 });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [highImportanceMemory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const importanceBadge = document.querySelector('.memory-importance');
            expect(importanceBadge).toHaveClass('high');
            expect(importanceBadge).toHaveTextContent('85%');
        });

        it('should apply "high" class for importance exactly 70%', () => {
            const memory = createMockMemory({ importance: 0.70 });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const importanceBadge = document.querySelector('.memory-importance');
            expect(importanceBadge).toHaveClass('high');
        });

        it('should apply "medium" class for importance 40-69%', () => {
            const mediumImportanceMemory = createMockMemory({ importance: 0.55 });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [mediumImportanceMemory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const importanceBadge = document.querySelector('.memory-importance');
            expect(importanceBadge).toHaveClass('medium');
            expect(importanceBadge).toHaveTextContent('55%');
        });

        it('should apply "medium" class for importance exactly 40%', () => {
            const memory = createMockMemory({ importance: 0.40 });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const importanceBadge = document.querySelector('.memory-importance');
            expect(importanceBadge).toHaveClass('medium');
        });

        it('should apply "low" class for importance < 40%', () => {
            const lowImportanceMemory = createMockMemory({ importance: 0.25 });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [lowImportanceMemory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const importanceBadge = document.querySelector('.memory-importance');
            expect(importanceBadge).toHaveClass('low');
            expect(importanceBadge).toHaveTextContent('25%');
        });

        it('should apply "low" class for importance 0%', () => {
            const memory = createMockMemory({ importance: 0 });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const importanceBadge = document.querySelector('.memory-importance');
            expect(importanceBadge).toHaveClass('low');
            expect(importanceBadge).toHaveTextContent('0%');
        });
    });

    describe('Memory Card Structure', () => {
        it('should render memory-card class with proper structure', () => {
            const memory = createMockMemory();
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const memoryCard = document.querySelector('.memory-card');
            expect(memoryCard).toBeInTheDocument();
        });

        it('should render memory-icon element', () => {
            const memory = createMockMemory();
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const memoryIcon = document.querySelector('.memory-icon');
            expect(memoryIcon).toBeInTheDocument();
        });

        it('should render memory summary or truncated content', () => {
            const memory = createMockMemory({ summary: 'Custom Summary Text' });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            expect(screen.getByText('Custom Summary Text')).toBeInTheDocument();
        });

        it('should fallback to content substring when no summary', () => {
            const memory = createMockMemory({
                summary: '',
                content: 'This is a very long content that should be truncated to 60 characters for the title display'
            });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const title = document.querySelector('.memory-title');
            expect(title?.textContent?.length).toBeLessThanOrEqual(60);
        });

        it('should render memory ID badge', () => {
            const memory = createMockMemory({ id: 42 });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            expect(screen.getByText('#42')).toBeInTheDocument();
        });
    });

    describe('Tag Rendering', () => {
        it('should render all tags from memory', () => {
            const memory = createMockMemory({ tags: ['decision', 'architecture', 'bug'] });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            // Check tags in memory card
            const memoryTags = document.querySelectorAll('.memory-tag');
            expect(memoryTags.length).toBe(3);
        });

        it('should apply correct color styling to tags', () => {
            const memory = createMockMemory({ tags: ['decision'] });
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [memory],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const tag = document.querySelector('.memory-tag');
            expect(tag).toHaveStyle({ color: '#a855f7' }); // decision color
        });
    });

    describe('Stats Display', () => {
        it('should display total memories count', () => {
            renderWithProviders(<MemoriesPage />);

            // Stats card should show 100 total memories
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('should display average importance as percentage', () => {
            renderWithProviders(<MemoriesPage />);

            // 0.65 * 100 = 65%
            expect(screen.getByText('65%')).toBeInTheDocument();
        });

        it('should display total accesses', () => {
            renderWithProviders(<MemoriesPage />);

            expect(screen.getByText('500')).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading spinner when data is loading', () => {
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: undefined,
                isLoading: true,
            });

            renderWithProviders(<MemoriesPage />);

            // Should show loading spinner (Loader2 icon with animate-spin)
            const loader = document.querySelector('.animate-spin');
            expect(loader).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no memories', () => {
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [],
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            expect(screen.getByText('No hay memorias registradas')).toBeInTheDocument();
        });
    });

    describe('Grid Layout', () => {
        it('should render memories in grid container', () => {
            const memories = [
                createMockMemory({ id: 1 }),
                createMockMemory({ id: 2 }),
                createMockMemory({ id: 3 }),
            ];
            (useMemories as ReturnType<typeof vi.fn>).mockReturnValue({
                data: memories,
                isLoading: false,
            });

            renderWithProviders(<MemoriesPage />);

            const grid = document.querySelector('.memories-grid');
            expect(grid).toBeInTheDocument();
            expect(grid?.children.length).toBe(3);
        });
    });
});
