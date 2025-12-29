import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterGroup } from '../FilterGroup';

describe('FilterGroup', () => {
    it('renders children', () => {
        render(
            <FilterGroup title="Status">
                <button>Filter 1</button>
                <button>Filter 2</button>
            </FilterGroup>
        );

        expect(screen.getByText('Filter 1')).toBeInTheDocument();
        expect(screen.getByText('Filter 2')).toBeInTheDocument();
    });

    it('renders title as heading', () => {
        render(
            <FilterGroup title="Status Filter">
                <div>Content</div>
            </FilterGroup>
        );

        expect(screen.getByText('Status Filter')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: 'Status Filter' })).toBeInTheDocument();
    });

    it('has proper group role and aria-label', () => {
        render(
            <FilterGroup title="Priority">
                <div>Content</div>
            </FilterGroup>
        );

        const group = screen.getByRole('group', { name: 'Priority' });
        expect(group).toBeInTheDocument();
    });

    it('renders without title', () => {
        render(
            <FilterGroup>
                <button>Filter</button>
            </FilterGroup>
        );

        expect(screen.getByText('Filter')).toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('hides title visually when hideTitle is true', () => {
        render(
            <FilterGroup title="Hidden Title" hideTitle={true}>
                <div>Content</div>
            </FilterGroup>
        );

        const heading = screen.getByRole('heading', { name: 'Hidden Title' });
        expect(heading).toHaveClass('sr-only');
    });

    it('applies custom className', () => {
        render(
            <FilterGroup title="Test" className="custom-filter-group">
                <div>Content</div>
            </FilterGroup>
        );

        const group = screen.getByRole('group');
        expect(group).toHaveClass('custom-filter-group');
    });

    it('wraps children in flex container', () => {
        const { container } = render(
            <FilterGroup title="Test">
                <button>Button 1</button>
                <button>Button 2</button>
            </FilterGroup>
        );

        const filterContainer = container.querySelector('.flex.flex-wrap');
        expect(filterContainer).toBeInTheDocument();
    });
});
