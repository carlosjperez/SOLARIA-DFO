import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from '../StatsGrid';

describe('StatsGrid', () => {
    it('renders children', () => {
        render(
            <StatsGrid>
                <div>Stat 1</div>
                <div>Stat 2</div>
                <div>Stat 3</div>
            </StatsGrid>
        );

        expect(screen.getByText('Stat 1')).toBeInTheDocument();
        expect(screen.getByText('Stat 2')).toBeInTheDocument();
        expect(screen.getByText('Stat 3')).toBeInTheDocument();
    });

    it('has proper ARIA role and label', () => {
        render(
            <StatsGrid>
                <div>Content</div>
            </StatsGrid>
        );

        const grid = screen.getByRole('list', { name: 'Statistics grid' });
        expect(grid).toBeInTheDocument();
    });

    it('renders empty state when no children', () => {
        render(<StatsGrid />);

        expect(screen.getByText(/no statistics available/i)).toBeInTheDocument();
    });

    it('applies custom empty message', () => {
        render(<StatsGrid emptyMessage="No data to display" />);

        expect(screen.getByText('No data to display')).toBeInTheDocument();
    });

    it('applies column count class', () => {
        render(
            <StatsGrid columns={4}>
                <div>Stat</div>
            </StatsGrid>
        );

        const grid = screen.getByRole('list');
        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('applies gap class', () => {
        render(
            <StatsGrid gap="lg">
                <div>Stat</div>
            </StatsGrid>
        );

        const grid = screen.getByRole('list');
        expect(grid.className).toContain('gap-[var(--spacing-lg)]');
    });

    it('applies custom className', () => {
        render(
            <StatsGrid className="custom-grid">
                <div>Stat</div>
            </StatsGrid>
        );

        const grid = screen.getByRole('list');
        expect(grid).toHaveClass('custom-grid');
    });

    it('auto-detects column count based on children', () => {
        const { rerender } = render(
            <StatsGrid>
                <div>1</div>
            </StatsGrid>
        );
        let grid = screen.getByRole('list');
        expect(grid).toHaveClass('grid-cols-1');

        rerender(
            <StatsGrid>
                <div>1</div>
                <div>2</div>
            </StatsGrid>
        );
        grid = screen.getByRole('list');
        expect(grid).toHaveClass('md:grid-cols-2');

        rerender(
            <StatsGrid>
                <div>1</div>
                <div>2</div>
                <div>3</div>
            </StatsGrid>
        );
        grid = screen.getByRole('list');
        expect(grid).toHaveClass('lg:grid-cols-3');
    });
});
