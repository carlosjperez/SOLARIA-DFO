import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ViewSelector } from './ViewSelector';
import type { ViewType } from './ViewSelector';
import { useState } from 'react';

/**
 * ViewSelector provides a toggle button group for switching between grid and list views.
 *
 * ## Features
 * - Two view modes: grid and list
 * - Visual feedback for active state
 * - Lucide icons (LayoutGrid, List)
 * - Keyboard accessible
 * - Responsive labels (hidden on mobile)
 * - Consistent design across all pages
 */
const meta = {
  title: 'Components/ViewSelector',
  component: ViewSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle button group for switching between grid and list views, using Lucide icons with visual feedback.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'select',
      options: ['grid', 'list'],
      description: 'Currently active view mode',
    },
  },
} satisfies Meta<typeof ViewSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Grid view selected (default)
 */
export const GridSelected: Story = {
  args: {
    value: 'grid',
    onChange: fn(),
  },
};

/**
 * List view selected
 */
export const ListSelected: Story = {
  args: {
    value: 'list',
    onChange: fn(),
  },
};

/**
 * Interactive story with state management
 * Click the buttons to switch between views
 */
export const Interactive: Story = {
  render: (args) => {
    const [view, setView] = useState<ViewType>('grid');

    return (
      <div className="space-y-4">
        <ViewSelector
          {...args}
          value={view}
          onChange={setView}
        />
        <div className="text-sm text-muted-foreground">
          Current view: <span className="font-semibold text-foreground">{view}</span>
        </div>
      </div>
    );
  },
};

/**
 * Custom aria label for accessibility
 */
export const CustomAriaLabel: Story = {
  args: {
    value: 'grid',
    onChange: fn(),
    ariaLabel: 'Switch content layout',
  },
};

/**
 * With custom className
 */
export const WithCustomStyling: Story = {
  args: {
    value: 'list',
    onChange: fn(),
    className: 'shadow-lg',
  },
};

/**
 * In a realistic context - with heading and content
 */
export const InContext: Story = {
  render: (args) => {
    const [view, setView] = useState<ViewType>('grid');

    return (
      <div className="w-full max-w-2xl space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Projects</h2>
            <p className="text-sm text-muted-foreground">24 active projects</p>
          </div>
          <ViewSelector
            {...args}
            value={view}
            onChange={setView}
          />
        </div>

        {/* Mock Content */}
        <div className="rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">
            Content would be displayed in <span className="font-semibold text-foreground">{view}</span> view here
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * Mobile viewport - labels hidden
 */
export const Mobile: Story = {
  args: {
    value: 'grid',
    onChange: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet viewport - labels visible
 */
export const Tablet: Story = {
  args: {
    value: 'list',
    onChange: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Desktop viewport - full width labels
 */
export const Desktop: Story = {
  args: {
    value: 'grid',
    onChange: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

/**
 * Comparison of both states side by side
 */
export const BothStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Grid Selected</h3>
        <ViewSelector value="grid" onChange={fn()} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">List Selected</h3>
        <ViewSelector value="list" onChange={fn()} />
      </div>
    </div>
  ),
};
