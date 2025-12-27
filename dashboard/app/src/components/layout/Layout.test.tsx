import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { useUIStore } from '@/store/ui';

// Mock the child components
vi.mock('./Sidebar', () => ({
    Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

vi.mock('./Header', () => ({
    Header: () => <header data-testid="header">Header</header>,
}));

// Mock the UI store
vi.mock('@/store/ui', () => ({
    useUIStore: vi.fn(),
}));

describe('Layout Component - DFO-111 Full Viewport Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    describe('Full Viewport Routes Detection', () => {
        const FULL_VIEWPORT_ROUTES = ['/tasks', '/projects'];

        it('should apply reduced padding (p-3) for /tasks route', () => {
            render(
                <MemoryRouter initialEntries={['/tasks']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('p-3');
            expect(main).not.toHaveClass('p-6');
        });

        it('should apply reduced padding (p-3) for /projects route', () => {
            render(
                <MemoryRouter initialEntries={['/projects']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('p-3');
        });

        it('should apply reduced padding for nested project routes like /projects/123', () => {
            render(
                <MemoryRouter initialEntries={['/projects/123']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('p-3');
        });

        it('should apply reduced padding for /tasks/archived', () => {
            render(
                <MemoryRouter initialEntries={['/tasks/archived']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('p-3');
        });

        it('should apply standard padding (p-6) for /dashboard route', () => {
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('p-6');
            expect(main).not.toHaveClass('p-3');
        });

        it('should apply standard padding (p-6) for /memories route', () => {
            render(
                <MemoryRouter initialEntries={['/memories']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('p-6');
        });

        it('should apply standard padding (p-6) for /settings route', () => {
            render(
                <MemoryRouter initialEntries={['/settings']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('p-6');
        });
    });

    describe('Main Content Class Structure', () => {
        it('should have main-content class for overscroll-behavior CSS', () => {
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('main-content');
        });

        it('should have flex-1 for flexible height', () => {
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('flex-1');
        });

        it('should have overflow-auto for scrolling', () => {
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            const main = document.querySelector('main');
            expect(main).toHaveClass('overflow-auto');
        });
    });

    describe('Sidebar Margin Adjustment', () => {
        it('should have ml-64 when sidebar is open', () => {
            (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            const contentWrapper = document.querySelector('.flex-1.flex-col');
            expect(contentWrapper).toHaveClass('ml-64');
        });

        it('should have ml-16 when sidebar is collapsed', () => {
            (useUIStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            const contentWrapper = document.querySelector('.flex-1.flex-col');
            expect(contentWrapper).toHaveClass('ml-16');
        });
    });

    describe('Component Structure', () => {
        it('should render Sidebar component', () => {
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        });

        it('should render Header component', () => {
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            expect(screen.getByTestId('header')).toBeInTheDocument();
        });

        it('should have overflow-hidden on root container to prevent page-level scroll', () => {
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Layout />
                </MemoryRouter>
            );

            const rootContainer = document.querySelector('.flex.h-screen');
            expect(rootContainer).toHaveClass('overflow-hidden');
        });
    });
});
