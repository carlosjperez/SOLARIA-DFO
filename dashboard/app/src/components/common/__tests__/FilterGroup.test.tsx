import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterGroup } from '@/components/common/FilterGroup';
import { FilterTag } from '@/components/common/FilterTag';

describe('FilterGroup', () => {

    describe('basic rendering', () => {
        it('renders children', () => {
            render(
                <FilterGroup>
                    <FilterTag label="Test 1" onRemove={() => {}} />
                    <FilterTag label="Test 2" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByText('Test 1')).toBeInTheDocument();
            expect(screen.getByText('Test 2')).toBeInTheDocument();
        });

        it('renders with title', () => {
            render(
                <FilterGroup title="Status">
                    <FilterTag label="Active" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
        });

        it('renders without title', () => {
            render(
                <FilterGroup>
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        });

        it('has role group', () => {
            render(
                <FilterGroup title="Priority">
                    <FilterTag label="High" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByRole('group', { name: 'Priority' })).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <FilterGroup className="custom-class">
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            const group = container.querySelector('.custom-class');
            expect(group).toBeInTheDocument();
        });
    });

    describe('title rendering', () => {
        it('shows title by default', () => {
            render(
                <FilterGroup title="Category">
                    <FilterTag label="Books" onRemove={() => {}} />
                </FilterGroup>
            );

            const heading = screen.getByRole('heading', { name: 'Category' });
            expect(heading).toBeVisible();
        });

        it('hides title visually when hideTitle is true', () => {
            render(
                <FilterGroup title="Hidden Title" hideTitle>
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            const heading = screen.getByRole('heading', { name: 'Hidden Title' });
            expect(heading).toHaveClass('sr-only');
        });

        it('title has uppercase styling', () => {
            render(
                <FilterGroup title="Status">
                    <FilterTag label="Active" onRemove={() => {}} />
                </FilterGroup>
            );

            const heading = screen.getByRole('heading', { name: 'Status' });
            expect(heading).toHaveClass('uppercase', 'tracking-wider');
        });

        it('title has small text size', () => {
            render(
                <FilterGroup title="Priority">
                    <FilterTag label="High" onRemove={() => {}} />
                </FilterGroup>
            );

            const heading = screen.getByRole('heading', { name: 'Priority' });
            expect(heading).toHaveClass('text-xs');
        });

        it('title is a heading level 3', () => {
            render(
                <FilterGroup title="Test Title">
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toBeInTheDocument();
        });
    });

    describe('layout', () => {
        it('uses flex column layout', () => {
            const { container } = render(
                <FilterGroup title="Test">
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            const group = container.querySelector('[role="group"]');
            expect(group).toHaveClass('flex', 'flex-col');
        });

        it('has gap between title and tags', () => {
            const { container } = render(
                <FilterGroup title="Test">
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            const group = container.querySelector('[role="group"]');
            expect(group).toHaveClass('gap-2');
        });

        it('tags container uses flex wrap', () => {
            const { container } = render(
                <FilterGroup>
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            const tagsContainer = container.querySelector('.flex-wrap');
            expect(tagsContainer).toBeInTheDocument();
        });

        it('tags container has gap between items', () => {
            const { container } = render(
                <FilterGroup>
                    <FilterTag label="Test 1" onRemove={() => {}} />
                    <FilterTag label="Test 2" onRemove={() => {}} />
                </FilterGroup>
            );

            const tagsContainer = container.querySelector('.gap-2');
            expect(tagsContainer).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('group has aria-label from title', () => {
            render(
                <FilterGroup title="Status Filters">
                    <FilterTag label="Active" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByRole('group', { name: 'Status Filters' })).toBeInTheDocument();
        });

        it('group without title has no aria-label', () => {
            const { container } = render(
                <FilterGroup>
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            const group = container.querySelector('[role="group"]');
            expect(group).not.toHaveAttribute('aria-label');
        });

        it('hidden title is still accessible to screen readers', () => {
            render(
                <FilterGroup title="Hidden Filters" hideTitle>
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            // Should still be in document and accessible to screen readers
            expect(screen.getByRole('heading', { name: 'Hidden Filters' })).toBeInTheDocument();
            // But visually hidden
            expect(screen.getByRole('heading', { name: 'Hidden Filters' })).toHaveClass('sr-only');
        });
    });

    describe('multiple tags', () => {
        it('renders multiple FilterTag children', () => {
            render(
                <FilterGroup title="Status">
                    <FilterTag label="Active" onRemove={() => {}} />
                    <FilterTag label="Pending" onRemove={() => {}} />
                    <FilterTag label="Completed" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByText('Pending')).toBeInTheDocument();
            expect(screen.getByText('Completed')).toBeInTheDocument();
        });

        it('wraps tags when they exceed container width', () => {
            const { container } = render(
                <FilterGroup title="Many Tags">
                    <FilterTag label="Tag 1" onRemove={() => {}} />
                    <FilterTag label="Tag 2" onRemove={() => {}} />
                    <FilterTag label="Tag 3" onRemove={() => {}} />
                    <FilterTag label="Tag 4" onRemove={() => {}} />
                    <FilterTag label="Tag 5" onRemove={() => {}} />
                </FilterGroup>
            );

            const tagsContainer = container.querySelector('.flex-wrap');
            expect(tagsContainer).toBeInTheDocument();
        });
    });

    describe('real-world use cases', () => {
        it('handles status filter group', () => {
            render(
                <FilterGroup title="Status">
                    <FilterTag label="Active" onRemove={() => {}} color="success" />
                    <FilterTag label="Pending" onRemove={() => {}} color="warning" />
                    <FilterTag label="Failed" onRemove={() => {}} color="danger" />
                </FilterGroup>
            );

            expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByText('Pending')).toBeInTheDocument();
            expect(screen.getByText('Failed')).toBeInTheDocument();
        });

        it('handles priority filter group', () => {
            render(
                <FilterGroup title="Priority">
                    <FilterTag label="Critical" onRemove={() => {}} color="danger" />
                    <FilterTag label="High" onRemove={() => {}} color="warning" />
                </FilterGroup>
            );

            expect(screen.getByRole('heading', { name: 'Priority' })).toBeInTheDocument();
            expect(screen.getByText('Critical')).toBeInTheDocument();
            expect(screen.getByText('High')).toBeInTheDocument();
        });

        it('handles category filter group with many tags', () => {
            render(
                <FilterGroup title="Categories">
                    <FilterTag label="Development" onRemove={() => {}} />
                    <FilterTag label="Design" onRemove={() => {}} />
                    <FilterTag label="Marketing" onRemove={() => {}} />
                    <FilterTag label="Sales" onRemove={() => {}} />
                    <FilterTag label="Support" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument();
            expect(screen.getByText('Development')).toBeInTheDocument();
            expect(screen.getByText('Design')).toBeInTheDocument();
            expect(screen.getByText('Marketing')).toBeInTheDocument();
            expect(screen.getByText('Sales')).toBeInTheDocument();
            expect(screen.getByText('Support')).toBeInTheDocument();
        });

        it('handles group with custom className for spacing', () => {
            const { container } = render(
                <FilterGroup title="Custom" className="mb-6">
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(container.querySelector('.mb-6')).toBeInTheDocument();
        });
    });

    describe('edge cases', () => {
        it('renders empty group with title', () => {
            render(<FilterGroup title="Empty Group" />);

            expect(screen.getByRole('heading', { name: 'Empty Group' })).toBeInTheDocument();
        });

        it('renders with single tag', () => {
            render(
                <FilterGroup title="Single">
                    <FilterTag label="Only One" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByText('Only One')).toBeInTheDocument();
        });

        it('handles very long group title', () => {
            const longTitle = 'This is a Very Long Filter Group Title That Should Be Displayed';
            render(
                <FilterGroup title={longTitle}>
                    <FilterTag label="Test" onRemove={() => {}} />
                </FilterGroup>
            );

            expect(screen.getByRole('heading', { name: longTitle })).toBeInTheDocument();
        });
    });
});
