import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/common/FilterBar';
import { FilterGroup } from '@/components/common/FilterGroup';
import { FilterTag } from '@/components/common/FilterTag';

describe('FilterBar', () => {

    describe('basic rendering', () => {
        it('renders children', () => {
            render(
                <FilterBar>
                    <FilterGroup title="Status">
                        <FilterTag label="Active" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
        });

        it('has role region', () => {
            render(
                <FilterBar>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByRole('region', { name: 'Active filters' })).toBeInTheDocument();
        });

        it('applies custom ariaLabel', () => {
            render(
                <FilterBar ariaLabel="Current filters">
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByRole('region', { name: 'Current filters' })).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <FilterBar className="custom-class">
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(container.querySelector('.custom-class')).toBeInTheDocument();
        });
    });

    describe('clear all button', () => {
        it('shows clear all button by default when there are filters', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByLabelText('Clear all filters')).toBeInTheDocument();
        });

        it('hides clear all button when showClearAll is false', () => {
            render(
                <FilterBar onClearAll={() => {}} showClearAll={false}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
        });

        it('hides clear all button when no onClearAll provided', () => {
            render(
                <FilterBar>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
        });

        it('hides clear all button when no filters', () => {
            render(<FilterBar onClearAll={() => {}} />);

            expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
        });

        it('calls onClearAll when clicked', async () => {
            const user = userEvent.setup();
            const handleClearAll = vi.fn();

            render(
                <FilterBar onClearAll={handleClearAll}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            await user.click(clearButton);

            expect(handleClearAll).toHaveBeenCalledTimes(1);
        });

        it('uses custom clearAllLabel', () => {
            render(
                <FilterBar onClearAll={() => {}} clearAllLabel="Remove all">
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByLabelText('Remove all')).toBeInTheDocument();
        });

        it('clear button shows X icon', () => {
            const { container } = render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            const icon = clearButton.querySelector('.lucide-x');
            expect(icon).toBeInTheDocument();
        });

        it('clear button shows "Clear all" text', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByText('Clear all')).toBeInTheDocument();
        });
    });

    describe('empty state', () => {
        it('returns null when no children and no emptyMessage', () => {
            const { container } = render(<FilterBar />);

            expect(container.firstChild).toBeNull();
        });

        it('shows emptyMessage when no filters', () => {
            render(<FilterBar emptyMessage="No active filters" />);

            expect(screen.getByText('No active filters')).toBeInTheDocument();
        });

        it('does not show emptyMessage when filters exist', () => {
            render(
                <FilterBar emptyMessage="No active filters">
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.queryByText('No active filters')).not.toBeInTheDocument();
        });

        it('empty message has italic styling', () => {
            render(<FilterBar emptyMessage="No filters" />);

            const message = screen.getByText('No filters');
            expect(message).toHaveClass('italic', 'text-muted-foreground');
        });
    });

    describe('layout', () => {
        it('uses flex layout', () => {
            const { container } = render(
                <FilterBar>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const region = container.querySelector('[role="region"]');
            expect(region).toHaveClass('flex', 'items-start');
        });

        it('has gap between filter groups and clear button', () => {
            const { container } = render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const region = container.querySelector('[role="region"]');
            expect(region).toHaveClass('gap-4');
        });

        it('filter groups container is scrollable', () => {
            const { container } = render(
                <FilterBar>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const scrollContainer = container.querySelector('.overflow-x-auto');
            expect(scrollContainer).toBeInTheDocument();
        });

        it('has scrollbar styling', () => {
            const { container } = render(
                <FilterBar>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const scrollContainer = container.querySelector('.scrollbar-thin');
            expect(scrollContainer).toBeInTheDocument();
        });

        it('clear button has whitespace-nowrap', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            expect(clearButton).toHaveClass('whitespace-nowrap');
        });
    });

    describe('keyboard navigation', () => {
        it('clear button is focusable with tab', async () => {
            const user = userEvent.setup();
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            // Tab to first filter tag remove button
            await user.tab();

            // Tab to clear all button
            await user.tab();

            const clearButton = screen.getByLabelText('Clear all filters');
            expect(clearButton).toHaveFocus();
        });

        it('activates clear all with Enter key', async () => {
            const user = userEvent.setup();
            const handleClearAll = vi.fn();

            render(
                <FilterBar onClearAll={handleClearAll}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            clearButton.focus();
            await user.keyboard('{Enter}');

            expect(handleClearAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('accessibility', () => {
        it('has proper focus-visible styles on clear button', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            expect(clearButton).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-brand');
        });

        it('icon is hidden from screen readers', () => {
            const { container } = render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const icon = container.querySelector('.lucide-x');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('visual feedback', () => {
        it('has hover state on clear button', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            expect(clearButton.className).toContain('hover:bg-muted/50');
            expect(clearButton.className).toContain('hover:text-foreground');
        });

        it('has transition on clear button', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            expect(clearButton).toHaveClass('transition-all');
        });

        it('has active scale animation on clear button', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const clearButton = screen.getByLabelText('Clear all filters');
            expect(clearButton.className).toContain('active:scale-[0.98]');
        });
    });

    describe('multiple filter groups', () => {
        it('renders multiple FilterGroup children', () => {
            render(
                <FilterBar>
                    <FilterGroup title="Status">
                        <FilterTag label="Active" onRemove={() => {}} />
                    </FilterGroup>
                    <FilterGroup title="Priority">
                        <FilterTag label="High" onRemove={() => {}} />
                    </FilterGroup>
                    <FilterGroup title="Category">
                        <FilterTag label="Development" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Priority')).toBeInTheDocument();
            expect(screen.getByText('Category')).toBeInTheDocument();
        });

        it('groups container has flex-col layout for stacking', () => {
            const { container } = render(
                <FilterBar>
                    <FilterGroup title="Group 1">
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                    <FilterGroup title="Group 2">
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            const groupsContainer = container.querySelector('.flex-col');
            expect(groupsContainer).toBeInTheDocument();
        });
    });

    describe('real-world use cases', () => {
        it('handles complete filter bar with multiple groups and clear all', async () => {
            const user = userEvent.setup();
            const handleClearAll = vi.fn();
            const handleRemoveStatus = vi.fn();
            const handleRemovePriority = vi.fn();

            render(
                <FilterBar onClearAll={handleClearAll}>
                    <FilterGroup title="Status">
                        <FilterTag label="Active" onRemove={handleRemoveStatus} color="success" />
                    </FilterGroup>
                    <FilterGroup title="Priority">
                        <FilterTag label="High" onRemove={handleRemovePriority} color="danger" />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Priority')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByText('High')).toBeInTheDocument();

            const clearButton = screen.getByLabelText('Clear all filters');
            await user.click(clearButton);

            expect(handleClearAll).toHaveBeenCalled();
        });

        it('handles filter bar with many tags in one group', () => {
            render(
                <FilterBar onClearAll={() => {}}>
                    <FilterGroup title="Categories">
                        <FilterTag label="Development" onRemove={() => {}} />
                        <FilterTag label="Design" onRemove={() => {}} />
                        <FilterTag label="Marketing" onRemove={() => {}} />
                        <FilterTag label="Sales" onRemove={() => {}} />
                        <FilterTag label="Support" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(screen.getByText('Categories')).toBeInTheDocument();
            expect(screen.getByText('Development')).toBeInTheDocument();
            expect(screen.getByText('Design')).toBeInTheDocument();
            expect(screen.getByText('Marketing')).toBeInTheDocument();
            expect(screen.getByText('Sales')).toBeInTheDocument();
            expect(screen.getByText('Support')).toBeInTheDocument();
        });

        it('handles empty state with message', () => {
            render(<FilterBar emptyMessage="No filters applied. Select filters to narrow results." />);

            expect(screen.getByText('No filters applied. Select filters to narrow results.')).toBeInTheDocument();
        });

        it('handles custom className for additional spacing', () => {
            const { container } = render(
                <FilterBar className="mt-4" onClearAll={() => {}}>
                    <FilterGroup>
                        <FilterTag label="Test" onRemove={() => {}} />
                    </FilterGroup>
                </FilterBar>
            );

            expect(container.querySelector('.mt-4')).toBeInTheDocument();
        });
    });
});
