import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SearchAndFilterBar } from './SearchAndFilterBar';
import type { ViewType } from './ViewSelector';
import type { SortConfig } from './SortBar';
import { useState } from 'react';

/**
 * SearchAndFilterBar combines search, filtering, sorting, and view controls
 * into a responsive layout suitable for list/grid pages.
 *
 * ## Features
 * - Debounced search input
 * - Item counter with pluralization
 * - View toggle (grid/list)
 * - Sort control with direction toggle
 * - Filter bar with clear all functionality
 * - Responsive breakpoints (mobile, tablet, desktop)
 * - Compact variant for dense layouts
 */
const meta = {
  title: 'Components/SearchAndFilterBar',
  component: SearchAndFilterBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A composition component that integrates SearchInput, ItemCounter, ViewSelector, SortBar, and FilterBar into a responsive layout.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Visual variant - default has more spacing',
    },
    showViewSelector: {
      control: 'boolean',
      description: 'Show/hide view selector',
    },
    showSortBar: {
      control: 'boolean',
      description: 'Show/hide sort bar',
    },
    showFilterBar: {
      control: 'boolean',
      description: 'Show/hide filter bar',
    },
    itemCount: {
      control: 'number',
      description: 'Total number of items',
    },
  },
} satisfies Meta<typeof SearchAndFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with all controls visible
export const Default: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Search tasks...',
    itemCount: 42,
    itemSingularLabel: 'task',
    itemPluralLabel: 'tasks',
    viewValue: 'grid',
    onViewChange: fn(),
    sortValue: { field: 'name', direction: 'asc' },
    onSortChange: fn(),
    sortOptions: [
      { value: 'name', label: 'Name' },
      { value: 'priority', label: 'Priority' },
      { value: 'updated', label: 'Updated' },
    ],
    filterChildren: (
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-md bg-brand/10 text-brand text-sm font-medium">
          Active
        </button>
        <button className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm hover:bg-muted/80">
          Completed
        </button>
        <button className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm hover:bg-muted/80">
          Blocked
        </button>
      </div>
    ),
    onClearAllFilters: fn(),
    showClearAllFilters: true,
  },
};

// Interactive story with state management
export const Interactive: Story = {
  render: (args) => {
    const [search, setSearch] = useState('');
    const [view, setView] = useState<ViewType>('grid');
    const [sort, setSort] = useState<SortConfig>({ field: 'name', direction: 'asc' });

    return (
      <SearchAndFilterBar
        {...args}
        searchValue={search}
        onSearchChange={setSearch}
        viewValue={view}
        onViewChange={setView}
        sortValue={sort}
        onSortChange={setSort}
      />
    );
  },
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Search projects...',
    itemCount: 24,
    itemSingularLabel: 'project',
    itemPluralLabel: 'projects',
    viewValue: 'grid',
    onViewChange: fn(),
    sortValue: { field: 'name', direction: 'asc' },
    onSortChange: fn(),
    sortOptions: [
      { value: 'name', label: 'Name' },
      { value: 'status', label: 'Status' },
      { value: 'deadline', label: 'Deadline' },
    ],
    filterChildren: (
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-md bg-brand/10 text-brand text-sm font-medium">
          Planning
        </button>
        <button className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm hover:bg-muted/80">
          Development
        </button>
      </div>
    ),
    onClearAllFilters: fn(),
  },
};

// Minimal configuration - only search and counter
export const Minimal: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Search...',
    itemCount: 0,
    itemSingularLabel: 'item',
    itemPluralLabel: 'items',
    showViewSelector: false,
    showSortBar: false,
    showFilterBar: false,
  },
};

// Without filters
export const WithoutFilters: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Search tasks...',
    itemCount: 15,
    itemSingularLabel: 'task',
    itemPluralLabel: 'tasks',
    viewValue: 'list',
    onViewChange: fn(),
    sortValue: { field: 'priority', direction: 'desc' },
    onSortChange: fn(),
    sortOptions: [
      { value: 'priority', label: 'Priority' },
      { value: 'name', label: 'Name' },
    ],
    showFilterBar: false,
  },
};

// Compact variant
export const Compact: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Quick search...',
    itemCount: 8,
    itemSingularLabel: 'item',
    itemPluralLabel: 'items',
    viewValue: 'grid',
    onViewChange: fn(),
    sortValue: { field: 'name', direction: 'asc' },
    onSortChange: fn(),
    sortOptions: [
      { value: 'name', label: 'Name' },
      { value: 'date', label: 'Date' },
    ],
    variant: 'compact',
    showFilterBar: false,
  },
};

// With active search
export const WithActiveSearch: Story = {
  args: {
    searchValue: 'authentication',
    onSearchChange: fn(),
    searchPlaceholder: 'Search tasks...',
    itemCount: 3,
    itemSingularLabel: 'task',
    itemPluralLabel: 'tasks',
    viewValue: 'list',
    onViewChange: fn(),
    sortValue: { field: 'name', direction: 'asc' },
    onSortChange: fn(),
    sortOptions: [
      { value: 'name', label: 'Name' },
      { value: 'priority', label: 'Priority' },
    ],
    filterChildren: (
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-md bg-brand/10 text-brand text-sm font-medium">
          Active
        </button>
      </div>
    ),
    onClearAllFilters: fn(),
  },
};

// Empty state
export const EmptyState: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Search projects...',
    itemCount: 0,
    itemSingularLabel: 'project',
    itemPluralLabel: 'projects',
    viewValue: 'grid',
    onViewChange: fn(),
    sortValue: { field: 'name', direction: 'asc' },
    onSortChange: fn(),
    sortOptions: [
      { value: 'name', label: 'Name' },
      { value: 'status', label: 'Status' },
    ],
    showFilterBar: false,
  },
};

// Large item count
export const LargeItemCount: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Search...',
    itemCount: 1247,
    itemSingularLabel: 'memory',
    itemPluralLabel: 'memories',
    viewValue: 'grid',
    onViewChange: fn(),
    sortValue: { field: 'importance', direction: 'desc' },
    onSortChange: fn(),
    sortOptions: [
      { value: 'importance', label: 'Importance' },
      { value: 'created', label: 'Created' },
      { value: 'accessed', label: 'Last Accessed' },
    ],
    filterChildren: (
      <div className="flex gap-2 flex-wrap">
        <button className="px-3 py-1.5 rounded-md bg-brand/10 text-brand text-sm font-medium">
          decision
        </button>
        <button className="px-3 py-1.5 rounded-md bg-brand/10 text-brand text-sm font-medium">
          context
        </button>
        <button className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm hover:bg-muted/80">
          learning
        </button>
        <button className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm hover:bg-muted/80">
          bug
        </button>
      </div>
    ),
    onClearAllFilters: fn(),
    showClearAllFilters: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    searchValue: '',
    onSearchChange: fn(),
    searchPlaceholder: 'Search...',
    searchDisabled: true,
    itemCount: 10,
    itemSingularLabel: 'item',
    itemPluralLabel: 'items',
    viewValue: 'grid',
    onViewChange: fn(),
    sortValue: { field: 'name', direction: 'asc' },
    onSortChange: fn(),
    sortOptions: [{ value: 'name', label: 'Name' }],
    sortDisabled: true,
    showFilterBar: false,
  },
};

// Mobile viewport simulation
export const Mobile: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Tablet viewport simulation
export const Tablet: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
