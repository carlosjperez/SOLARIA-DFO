import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from '@/components/common/StatsGrid';
import { StatCard } from '@/components/common/StatCard';

describe('StatsGrid', () => {
    describe('rendering', () => {
        it('renders with single child', () => {
            render(
                <StatsGrid>
                    <StatCard title="Test" value={42} />
                </StatsGrid>
            );

            expect(screen.getByText('Test')).toBeInTheDocument();
            expect(screen.getByText('42')).toBeInTheDocument();
        });

        it('renders with multiple children', () => {
            render(
                <StatsGrid>
                    <StatCard title="First" value={1} />
                    <StatCard title="Second" value={2} />
                    <StatCard title="Third" value={3} />
                </StatsGrid>
            );

            expect(screen.getByText('First')).toBeInTheDocument();
            expect(screen.getByText('Second')).toBeInTheDocument();
            expect(screen.getByText('Third')).toBeInTheDocument();
        });

        it('has list role for accessibility', () => {
            render(
                <StatsGrid>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );

            expect(screen.getByRole('list')).toBeInTheDocument();
        });

        it('has aria-label for accessibility', () => {
            render(
                <StatsGrid>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );

            expect(screen.getByLabelText('Statistics grid')).toBeInTheDocument();
        });
    });

    describe('empty state', () => {
        it('shows empty state when no children', () => {
            render(<StatsGrid>{[]}</StatsGrid>);

            expect(screen.getByText('No statistics available')).toBeInTheDocument();
        });

        it('shows custom empty message', () => {
            render(<StatsGrid emptyMessage="Custom empty message">{[]}</StatsGrid>);

            expect(screen.getByText('Custom empty message')).toBeInTheDocument();
        });

        it('applies dashed border for empty state', () => {
            const { container } = render(<StatsGrid>{[]}</StatsGrid>);
            const emptyDiv = container.firstChild as HTMLElement;

            expect(emptyDiv).toHaveClass('border-dashed');
        });

        it('filters out null and undefined children', () => {
            render(
                <StatsGrid>
                    {null}
                    {undefined}
                </StatsGrid>
            );

            expect(screen.getByText('No statistics available')).toBeInTheDocument();
        });
    });

    describe('column layout', () => {
        it('applies 1 column layout when specified', () => {
            const { container } = render(
                <StatsGrid columns={1}>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('grid-cols-1');
        });

        it('applies 2 column layout when specified', () => {
            const { container } = render(
                <StatsGrid columns={2}>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('grid-cols-1');
            expect(grid).toHaveClass('md:grid-cols-2');
        });

        it('applies 3 column layout when specified', () => {
            const { container } = render(
                <StatsGrid columns={3}>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('grid-cols-1');
            expect(grid).toHaveClass('md:grid-cols-2');
            expect(grid).toHaveClass('lg:grid-cols-3');
        });

        it('applies 4 column layout when specified', () => {
            const { container } = render(
                <StatsGrid columns={4}>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('grid-cols-1');
            expect(grid).toHaveClass('md:grid-cols-2');
            expect(grid).toHaveClass('lg:grid-cols-4');
        });
    });

    describe('auto column detection', () => {
        it('auto-detects 1 column for single child', () => {
            const { container } = render(
                <StatsGrid>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('grid-cols-1');
        });

        it('auto-detects 2 columns for 2 children', () => {
            const { container } = render(
                <StatsGrid>
                    <StatCard title="First" value={1} />
                    <StatCard title="Second" value={2} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('md:grid-cols-2');
        });

        it('auto-detects 3 columns for 3 children', () => {
            const { container } = render(
                <StatsGrid>
                    <StatCard title="First" value={1} />
                    <StatCard title="Second" value={2} />
                    <StatCard title="Third" value={3} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('lg:grid-cols-3');
        });

        it('auto-detects 4 columns for 4+ children', () => {
            const { container } = render(
                <StatsGrid>
                    <StatCard title="First" value={1} />
                    <StatCard title="Second" value={2} />
                    <StatCard title="Third" value={3} />
                    <StatCard title="Fourth" value={4} />
                    <StatCard title="Fifth" value={5} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('lg:grid-cols-4');
        });
    });

    describe('gap spacing', () => {
        it('applies small gap when specified', () => {
            const { container } = render(
                <StatsGrid gap="sm">
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('gap-[var(--spacing-sm)]');
        });

        it('applies medium gap by default', () => {
            const { container } = render(
                <StatsGrid>
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('gap-[var(--spacing-md)]');
        });

        it('applies large gap when specified', () => {
            const { container } = render(
                <StatsGrid gap="lg">
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('gap-[var(--spacing-lg)]');
        });
    });

    describe('custom className', () => {
        it('applies custom className to grid', () => {
            const { container } = render(
                <StatsGrid className="custom-class">
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('custom-class');
        });

        it('applies custom className to empty state', () => {
            const { container } = render(
                <StatsGrid className="custom-empty">{[]}</StatsGrid>
            );
            const emptyDiv = container.firstChild as HTMLElement;

            expect(emptyDiv).toHaveClass('custom-empty');
        });

        it('merges custom className with default classes', () => {
            const { container } = render(
                <StatsGrid className="custom-class">
                    <StatCard title="Test" value={1} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            expect(grid).toHaveClass('custom-class');
            expect(grid).toHaveClass('grid');
        });
    });

    describe('complex scenarios', () => {
        it('handles mixed StatCard variants', () => {
            render(
                <StatsGrid columns={4}>
                    <StatCard title="Default" value={1} />
                    <StatCard title="Primary" value={2} variant="primary" />
                    <StatCard title="Success" value={3} variant="success" />
                    <StatCard title="Warning" value={4} variant="warning" />
                </StatsGrid>
            );

            expect(screen.getByText('Default')).toBeInTheDocument();
            expect(screen.getByText('Primary')).toBeInTheDocument();
            expect(screen.getByText('Success')).toBeInTheDocument();
            expect(screen.getByText('Warning')).toBeInTheDocument();
        });

        it('handles large number of children', () => {
            const cards = Array.from({ length: 12 }, (_, i) => (
                <StatCard key={i} title={`Card ${i + 1}`} value={i + 1} />
            ));

            render(<StatsGrid>{cards}</StatsGrid>);

            expect(screen.getByText('Card 1')).toBeInTheDocument();
            expect(screen.getByText('Card 12')).toBeInTheDocument();
        });

        it('overrides auto-detection with explicit columns prop', () => {
            const { container } = render(
                <StatsGrid columns={2}>
                    <StatCard title="First" value={1} />
                    <StatCard title="Second" value={2} />
                    <StatCard title="Third" value={3} />
                    <StatCard title="Fourth" value={4} />
                </StatsGrid>
            );
            const grid = screen.getByRole('list');

            // Should use 2 columns despite having 4 children (which auto-detects to 4)
            expect(grid).toHaveClass('md:grid-cols-2');
            expect(grid).not.toHaveClass('lg:grid-cols-4');
        });
    });
});
