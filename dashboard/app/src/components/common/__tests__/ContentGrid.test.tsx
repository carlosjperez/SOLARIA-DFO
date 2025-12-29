import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentGrid } from '../ContentGrid';
import { FolderOpen } from 'lucide-react';

describe('ContentGrid', () => {
    describe('Rendering', () => {
        it('renders children in a grid layout', () => {
            render(
                <ContentGrid>
                    <div data-testid="item-1">Item 1</div>
                    <div data-testid="item-2">Item 2</div>
                    <div data-testid="item-3">Item 3</div>
                </ContentGrid>
            );

            expect(screen.getByTestId('item-1')).toBeInTheDocument();
            expect(screen.getByTestId('item-2')).toBeInTheDocument();
            expect(screen.getByTestId('item-3')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <ContentGrid className="custom-class">
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.custom-class');
            expect(grid).toBeInTheDocument();
        });

        it('applies custom aria-label', () => {
            render(
                <ContentGrid ariaLabel="Custom grid label">
                    <div>Item</div>
                </ContentGrid>
            );

            expect(screen.getByLabelText('Custom grid label')).toBeInTheDocument();
        });
    });

    describe('Column Configurations', () => {
        it('applies 1 column layout', () => {
            const { container } = render(
                <ContentGrid columns={1}>
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.grid-cols-1');
            expect(grid).toBeInTheDocument();
        });

        it('applies 2 column responsive layout', () => {
            const { container } = render(
                <ContentGrid columns={2}>
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.sm\\:grid-cols-2');
            expect(grid).toBeInTheDocument();
        });

        it('applies 3 column responsive layout by default', () => {
            const { container } = render(
                <ContentGrid>
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.lg\\:grid-cols-3');
            expect(grid).toBeInTheDocument();
        });

        it('applies 4 column responsive layout', () => {
            const { container } = render(
                <ContentGrid columns={4}>
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.lg\\:grid-cols-4');
            expect(grid).toBeInTheDocument();
        });
    });

    describe('Gap Configurations', () => {
        it('applies medium gap by default', () => {
            const { container } = render(
                <ContentGrid>
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.gap-4');
            expect(grid).toBeInTheDocument();
        });

        it('applies small gap', () => {
            const { container } = render(
                <ContentGrid gap="sm">
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.gap-3');
            expect(grid).toBeInTheDocument();
        });

        it('applies large gap', () => {
            const { container } = render(
                <ContentGrid gap="lg">
                    <div>Item</div>
                </ContentGrid>
            );

            const grid = container.querySelector('.gap-6');
            expect(grid).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('renders loading skeletons when loading is true', () => {
            render(
                <ContentGrid loading={true} skeletonCount={3}>
                    <div>Item</div>
                </ContentGrid>
            );

            const skeletons = screen.getAllByRole('status', { name: 'Loading...' });
            expect(skeletons).toHaveLength(3);
        });

        it('renders 6 skeletons by default when loading', () => {
            render(
                <ContentGrid loading={true}>
                    <div>Item</div>
                </ContentGrid>
            );

            const skeletons = screen.getAllByRole('status', { name: 'Loading...' });
            expect(skeletons).toHaveLength(6);
        });

        it('sets aria-busy to true when loading', () => {
            render(
                <ContentGrid loading={true}>
                    <div>Item</div>
                </ContentGrid>
            );

            expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true');
        });

        it('does not render children when loading', () => {
            render(
                <ContentGrid loading={true}>
                    <div data-testid="child-item">Item</div>
                </ContentGrid>
            );

            expect(screen.queryByTestId('child-item')).not.toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('renders empty state when no children and emptyState is provided', () => {
            render(
                <ContentGrid
                    emptyState={{
                        title: 'No items',
                        description: 'Add some items to get started',
                    }}
                />
            );

            expect(screen.getByText('No items')).toBeInTheDocument();
            expect(screen.getByText('Add some items to get started')).toBeInTheDocument();
        });

        it('renders default empty state values', () => {
            render(
                <ContentGrid emptyState={{}} />
            );

            expect(screen.getByText('No items found')).toBeInTheDocument();
            expect(screen.getByText('There are no items to display.')).toBeInTheDocument();
        });

        it('renders custom empty state icon', () => {
            render(
                <ContentGrid
                    emptyState={{
                        icon: <FolderOpen data-testid="custom-icon" />,
                    }}
                />
            );

            expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
        });

        it('renders empty state action button', () => {
            render(
                <ContentGrid
                    emptyState={{
                        action: <button>Create Item</button>,
                    }}
                />
            );

            expect(screen.getByRole('button', { name: 'Create Item' })).toBeInTheDocument();
        });

        it('does not render empty state when children exist', () => {
            render(
                <ContentGrid
                    emptyState={{
                        title: 'No items',
                    }}
                >
                    <div>Item 1</div>
                </ContentGrid>
            );

            expect(screen.queryByText('No items')).not.toBeInTheDocument();
            expect(screen.getByText('Item 1')).toBeInTheDocument();
        });

        it('does not render empty state when emptyState is not provided', () => {
            render(<ContentGrid />);

            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles single child', () => {
            render(
                <ContentGrid>
                    <div data-testid="single-item">Single Item</div>
                </ContentGrid>
            );

            expect(screen.getByTestId('single-item')).toBeInTheDocument();
        });

        it('handles empty children without emptyState', () => {
            const { container } = render(<ContentGrid />);

            const grid = container.querySelector('.grid');
            expect(grid).toBeInTheDocument();
            expect(grid?.children).toHaveLength(0);
        });
    });
});
