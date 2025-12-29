import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SortBar } from './SortBar';
import type { SortConfig } from './SortBar';
import { useState } from 'react';

/**
 * SortBar provides a dropdown to select sort field and a toggle button for direction.
 *
 * ## Features
 * - Field selector dropdown with multiple options
 * - Direction toggle (ascending/descending)
 * - Visual feedback with ArrowUp/ArrowDown icons
 * - Keyboard accessible
 * - Disabled state support
 * - Design tokens for consistent styling
 */
const meta = {
  title: 'Components/SortBar',
  component: SortBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A sort control with field selector dropdown and direction toggle button, using Lucide icons for visual feedback.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'object',
      description: 'Current sort configuration (field + direction)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the sort controls',
    },
  },
} satisfies Meta<typeof SortBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default sort options for stories
const defaultOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'priority', label: 'Priority' },
];

/**
 * Default state - Name ascending
 */
export const Default: Story = {
  args: {
    value: { field: 'name', direction: 'asc' },
    onChange: fn(),
    options: defaultOptions,
  },
};

/**
 * Descending sort
 */
export const Descending: Story = {
  args: {
    value: { field: 'priority', direction: 'desc' },
    onChange: fn(),
    options: defaultOptions,
  },
};

/**
 * Interactive story with state management
 * Change field and toggle direction to see updates
 */
export const Interactive: Story = {
  render: (args) => {
    const [sort, setSort] = useState<SortConfig>({ field: 'name', direction: 'asc' });

    return (
      <div className="space-y-4">
        <SortBar
          {...args}
          value={sort}
          onChange={setSort}
        />
        <div className="text-sm text-muted-foreground">
          Sorting by: <span className="font-semibold text-foreground">{sort.field}</span>{' '}
          ({sort.direction === 'asc' ? 'ascending' : 'descending'})
        </div>
      </div>
    );
  },
  args: {
    options: defaultOptions,
  },
};

/**
 * Many sort options (6+)
 */
export const ManyOptions: Story = {
  args: {
    value: { field: 'updated', direction: 'desc' },
    onChange: fn(),
    options: [
      { value: 'name', label: 'Name' },
      { value: 'created', label: 'Created Date' },
      { value: 'updated', label: 'Updated Date' },
      { value: 'priority', label: 'Priority' },
      { value: 'status', label: 'Status' },
      { value: 'assignee', label: 'Assignee' },
    ],
  },
};

/**
 * Few sort options (2)
 */
export const FewOptions: Story = {
  args: {
    value: { field: 'name', direction: 'asc' },
    onChange: fn(),
    options: [
      { value: 'name', label: 'Name' },
      { value: 'date', label: 'Date' },
    ],
  },
};

/**
 * Long option labels
 */
export const LongLabels: Story = {
  args: {
    value: { field: 'last_modified', direction: 'desc' },
    onChange: fn(),
    options: [
      { value: 'alphabetical', label: 'Alphabetical Order' },
      { value: 'creation_date', label: 'Creation Date' },
      { value: 'last_modified', label: 'Last Modified Date' },
      { value: 'importance', label: 'Importance Score' },
    ],
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    value: { field: 'name', direction: 'asc' },
    onChange: fn(),
    options: defaultOptions,
    disabled: true,
  },
};

/**
 * Custom aria label
 */
export const CustomAriaLabel: Story = {
  args: {
    value: { field: 'priority', direction: 'desc' },
    onChange: fn(),
    options: defaultOptions,
    ariaLabel: 'Sort tasks by field and direction',
  },
};

/**
 * With custom className
 */
export const WithCustomStyling: Story = {
  args: {
    value: { field: 'date', direction: 'asc' },
    onChange: fn(),
    options: defaultOptions,
    className: 'shadow-md',
  },
};

/**
 * In realistic context - with heading and list
 */
export const InContext: Story = {
  render: (args) => {
    const [sort, setSort] = useState<SortConfig>({ field: 'name', direction: 'asc' });

    // Mock sorted items
    const items = ['Project Alpha', 'Project Beta', 'Project Gamma'];

    return (
      <div className="w-full max-w-2xl space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Projects</h2>
            <p className="text-sm text-muted-foreground">Sort and filter your projects</p>
          </div>
          <SortBar
            {...args}
            value={sort}
            onChange={setSort}
          />
        </div>

        {/* Mock List */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="p-2 rounded bg-muted/50 text-sm">
              {item}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Sorted by {sort.field} ({sort.direction})
        </div>
      </div>
    );
  },
  args: {
    options: defaultOptions,
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * Comparison of both directions side by side
 */
export const BothDirections: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Ascending</h3>
        <SortBar
          value={{ field: 'name', direction: 'asc' }}
          onChange={fn()}
          options={defaultOptions}
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Descending</h3>
        <SortBar
          value={{ field: 'name', direction: 'desc' }}
          onChange={fn()}
          options={defaultOptions}
        />
      </div>
    </div>
  ),
};

/**
 * Mobile viewport - select remains functional
 */
export const Mobile: Story = {
  args: {
    value: { field: 'priority', direction: 'desc' },
    onChange: fn(),
    options: defaultOptions,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet viewport
 */
export const Tablet: Story = {
  args: {
    value: { field: 'date', direction: 'asc' },
    onChange: fn(),
    options: defaultOptions,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Desktop viewport
 */
export const Desktop: Story = {
  args: {
    value: { field: 'name', direction: 'asc' },
    onChange: fn(),
    options: defaultOptions,
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
