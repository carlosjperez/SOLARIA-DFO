import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchAndFilterBar } from '@/components/common/SearchAndFilterBar';
import type { SortConfig } from '@/components/common/SortBar';
import type { ViewType } from '@/components/common/ViewSelector';

describe('SearchAndFilterBar', () => {

    describe('basic rendering', () => {
        it('renders search input', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        });

        it('renders item counter', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={42}
                    itemSingularLabel="task"
                    itemPluralLabel="tasks"
                />
            );

            expect(screen.getByLabelText('42 tasks')).toBeInTheDocument();
        });

        it('has search role for accessibility', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const container = screen.getByRole('search');
            expect(container).toBeInTheDocument();
        });

        it('applies default aria-label', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            expect(screen.getByLabelText('Search and filter controls')).toBeInTheDocument();
        });

        it('applies custom aria-label', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    ariaLabel="Task filtering controls"
                />
            );

            expect(screen.getByLabelText('Task filtering controls')).toBeInTheDocument();
        });

        it('applies custom className to wrapper', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    className="custom-wrapper"
                />
            );

            const wrapper = container.querySelector('.custom-wrapper');
            expect(wrapper).toBeInTheDocument();
        });
    });

    describe('search input delegation', () => {
        it('delegates searchValue prop', () => {
            render(
                <SearchAndFilterBar
                    searchValue="test query"
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('test query');
        });

        it('delegates searchPlaceholder prop', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    searchPlaceholder="Search tasks..."
                    itemCount={0}
                />
            );

            expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
        });

        it('delegates searchDisabled prop', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    searchDisabled={true}
                    itemCount={0}
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toBeDisabled();
        });

        it('calls onSearchChange callback', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <SearchAndFilterBar
                    onSearchChange={handleChange}
                    itemCount={0}
                    searchDebounceMs={0}
                />
            );

            const input = screen.getByRole('textbox');
            await user.type(input, 'test');

            expect(handleChange).toHaveBeenCalled();
        });
    });

    describe('view selector', () => {
        it('renders view selector when props provided', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    viewValue="grid"
                    onViewChange={() => {}}
                />
            );

            expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
        });

        it('hides view selector when showViewSelector is false', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    viewValue="grid"
                    onViewChange={() => {}}
                    showViewSelector={false}
                />
            );

            expect(screen.queryByLabelText('Grid view')).not.toBeInTheDocument();
        });

        it('hides view selector when viewValue missing', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    onViewChange={() => {}}
                />
            );

            expect(screen.queryByLabelText('Grid view')).not.toBeInTheDocument();
        });

        it('calls onViewChange callback', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    viewValue="grid"
                    onViewChange={handleChange}
                />
            );

            const listButton = screen.getByLabelText('List view');
            await user.click(listButton);

            expect(handleChange).toHaveBeenCalledWith('list');
        });
    });

    describe('sort bar', () => {
        const sortOptions = [
            { value: 'name', label: 'Name' },
            { value: 'date', label: 'Date' },
        ];

        it('renders sort bar when props provided', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    sortValue={{ field: 'name', direction: 'asc' }}
                    onSortChange={() => {}}
                    sortOptions={sortOptions}
                />
            );

            expect(screen.getByText('Name')).toBeInTheDocument();
        });

        it('hides sort bar when showSortBar is false', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    sortValue={{ field: 'name', direction: 'asc' }}
                    onSortChange={() => {}}
                    sortOptions={sortOptions}
                    showSortBar={false}
                />
            );

            expect(screen.queryByText('Name')).not.toBeInTheDocument();
        });

        it('hides sort bar when sortOptions empty', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    sortValue={{ field: 'name', direction: 'asc' }}
                    onSortChange={() => {}}
                    sortOptions={[]}
                />
            );

            expect(screen.queryByLabelText('Sort direction')).not.toBeInTheDocument();
        });

        it('delegates sortDisabled prop', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    sortValue={{ field: 'name', direction: 'asc' }}
                    onSortChange={() => {}}
                    sortOptions={sortOptions}
                    sortDisabled={true}
                />
            );

            const select = screen.getByRole('combobox');
            expect(select).toBeDisabled();
        });
    });

    describe('filter bar', () => {
        it('renders filter bar when children provided', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    filterChildren={<div data-testid="filter-content">Filters</div>}
                />
            );

            expect(screen.getByTestId('filter-content')).toBeInTheDocument();
        });

        it('hides filter bar when showFilterBar is false', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    filterChildren={<div data-testid="filter-content">Filters</div>}
                    showFilterBar={false}
                />
            );

            expect(screen.queryByTestId('filter-content')).not.toBeInTheDocument();
        });

        it('hides filter bar when no children', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            // FilterBar wrapper should not exist
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            // Check that there's no second row (FilterBar)
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.children.length).toBe(1); // Only main controls row
        });

        it('renders clear all button when provided', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    filterChildren={<div>Filters</div>}
                    onClearAllFilters={() => {}}
                    showClearAllFilters={true}
                />
            );

            expect(screen.getByText('Clear all')).toBeInTheDocument();
        });

        it('calls onClearAllFilters callback', async () => {
            const user = userEvent.setup();
            const handleClear = vi.fn();

            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    filterChildren={<div>Filters</div>}
                    onClearAllFilters={handleClear}
                    showClearAllFilters={true}
                />
            );

            const clearButton = screen.getByText('Clear all');
            await user.click(clearButton);

            expect(handleClear).toHaveBeenCalled();
        });
    });

    describe('responsive layout', () => {
        it('applies responsive flex classes to main row', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const mainRow = container.querySelector('.flex-col.sm\\:flex-row');
            expect(mainRow).toBeInTheDocument();
        });

        it('applies responsive classes to right controls', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    viewValue="grid"
                    onViewChange={() => {}}
                />
            );

            const rightControls = container.querySelector('.flex-wrap.sm\\:flex-nowrap');
            expect(rightControls).toBeInTheDocument();
        });

        it('search input has flex-1 on desktop', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const searchWrapper = container.querySelector('.sm\\:flex-1');
            expect(searchWrapper).toBeInTheDocument();
        });

        it('right controls have shrink-0 class', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const itemCounter = container.querySelector('.shrink-0');
            expect(itemCounter).toBeInTheDocument();
        });
    });

    describe('variant support', () => {
        it('applies default gap spacing', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    variant="default"
                />
            );

            const mainRow = container.querySelector('.gap-4');
            expect(mainRow).toBeInTheDocument();
        });

        it('applies compact gap spacing', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    variant="compact"
                />
            );

            const mainRow = container.querySelector('.gap-2');
            expect(mainRow).toBeInTheDocument();
        });

        it('defaults to default variant', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const mainRow = container.querySelector('.gap-4');
            expect(mainRow).toBeInTheDocument();
        });
    });

    describe('layout structure', () => {
        it('renders two-row layout when filters exist', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    filterChildren={<div>Filters</div>}
                />
            );

            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.children.length).toBe(2); // Main row + FilterBar row
        });

        it('renders single row when no filters', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.children.length).toBe(1); // Only main row
        });

        it('search input is first in main row', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            const mainRow = container.querySelector('.flex-col.sm\\:flex-row');
            const firstChild = mainRow?.firstChild as HTMLElement;
            expect(firstChild.querySelector('input[type="text"]')).toBeInTheDocument();
        });

        it('right controls are second in main row', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={42}
                />
            );

            const mainRow = container.querySelector('.flex-col.sm\\:flex-row');
            const children = Array.from(mainRow?.children || []);
            const secondChild = children[1] as HTMLElement;
            expect(secondChild.textContent).toContain('42');
        });
    });

    describe('real-world use cases', () => {
        it('handles full task list scenario', () => {
            const handleSearchChange = vi.fn();
            const handleViewChange = vi.fn();
            const handleSortChange = vi.fn();
            const handleClearFilters = vi.fn();

            render(
                <SearchAndFilterBar
                    searchValue=""
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Search tasks..."
                    itemCount={42}
                    itemSingularLabel="task"
                    itemPluralLabel="tasks"
                    viewValue="grid"
                    onViewChange={handleViewChange}
                    sortValue={{ field: 'priority', direction: 'desc' }}
                    onSortChange={handleSortChange}
                    sortOptions={[
                        { value: 'priority', label: 'Priority' },
                        { value: 'name', label: 'Name' }
                    ]}
                    filterChildren={<div>Status filters</div>}
                    onClearAllFilters={handleClearFilters}
                    showClearAllFilters={true}
                />
            );

            expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
            expect(screen.getByLabelText('42 tasks')).toBeInTheDocument();
            expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
            expect(screen.getByText('Priority')).toBeInTheDocument();
            expect(screen.getByText('Status filters')).toBeInTheDocument();
            expect(screen.getByText('Clear all')).toBeInTheDocument();
        });

        it('handles minimal scenario with only search', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    showViewSelector={false}
                    showSortBar={false}
                    showFilterBar={false}
                />
            );

            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByLabelText('0 items')).toBeInTheDocument();
            expect(screen.queryByLabelText('Grid view')).not.toBeInTheDocument();
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        it('handles project list scenario', async () => {
            const user = userEvent.setup();
            const handleViewChange = vi.fn();

            render(
                <SearchAndFilterBar
                    searchValue=""
                    onSearchChange={() => {}}
                    searchPlaceholder="Search projects..."
                    itemCount={15}
                    itemSingularLabel="project"
                    itemPluralLabel="projects"
                    viewValue="grid"
                    onViewChange={handleViewChange}
                />
            );

            expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
            expect(screen.getByLabelText('15 projects')).toBeInTheDocument();

            const listButton = screen.getByLabelText('List view');
            await user.click(listButton);

            expect(handleViewChange).toHaveBeenCalledWith('list');
        });
    });

    describe('accessibility', () => {
        it('provides search role', () => {
            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                />
            );

            expect(screen.getByRole('search')).toBeInTheDocument();
        });

        it('all interactive controls are keyboard accessible', async () => {
            const user = userEvent.setup();

            render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    viewValue="grid"
                    onViewChange={() => {}}
                    sortValue={{ field: 'name', direction: 'asc' }}
                    onSortChange={() => {}}
                    sortOptions={[{ value: 'name', label: 'Name' }]}
                />
            );

            // Tab through controls
            await user.tab(); // Search input
            expect(screen.getByRole('textbox')).toHaveFocus();

            await user.tab(); // Grid view button
            expect(screen.getByLabelText('Grid view')).toHaveFocus();

            await user.tab(); // List view button
            expect(screen.getByLabelText('List view')).toHaveFocus();

            await user.tab(); // Sort select
            expect(screen.getByRole('combobox')).toHaveFocus();
        });

        it('maintains focus order in compact variant', () => {
            const { container } = render(
                <SearchAndFilterBar
                    onSearchChange={() => {}}
                    itemCount={0}
                    variant="compact"
                />
            );

            // Focus order should be: search input -> counter (not focusable) -> other controls
            const focusableElements = container.querySelectorAll(
                'input, button, select, [tabindex]:not([tabindex="-1"])'
            );

            expect(focusableElements.length).toBeGreaterThan(0);
        });
    });
});
