import type { Meta, StoryObj } from '@storybook/react';
import { ContentGrid } from './ContentGrid';
import { FolderOpen, Plus } from 'lucide-react';

/**
 * ContentGrid provides a responsive grid layout for displaying card-based content
 * with built-in loading and empty states.
 *
 * ## Features
 * - Responsive columns (1/2/3/4 configurable)
 * - Gap customization (sm/md/lg)
 * - Loading skeleton state
 * - Empty state with icon, title, description, and action
 * - Automatic breakpoint handling
 */
const meta = {
  title: 'Components/ContentGrid',
  component: ContentGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Responsive CSS Grid layout for displaying card-based content with loading and empty state support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4],
      description: 'Number of columns on desktop',
    },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Gap between grid items',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton state',
    },
    skeletonCount: {
      control: 'number',
      description: 'Number of skeleton items when loading',
    },
  },
} satisfies Meta<typeof ContentGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock card component for demos
const MockCard = ({ title, color }: { title: string; color: string }) => (
  <div
    className="rounded-lg border border-border bg-card p-4 space-y-2"
    style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
  >
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">
      This is a sample card component for demonstration purposes.
    </p>
    <div className="flex gap-2 pt-2">
      <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
        Tag 1
      </span>
      <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
        Tag 2
      </span>
    </div>
  </div>
);

/**
 * Default 3-column grid with sample cards
 */
export const Default: Story = {
  args: {
    children: (
      <>
        <MockCard title="Project Alpha" color="#3b82f6" />
        <MockCard title="Project Beta" color="#10b981" />
        <MockCard title="Project Gamma" color="#f59e0b" />
        <MockCard title="Project Delta" color="#ef4444" />
        <MockCard title="Project Epsilon" color="#8b5cf6" />
        <MockCard title="Project Zeta" color="#ec4899" />
      </>
    ),
  },
};

/**
 * 2-column layout
 */
export const TwoColumns: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
        <MockCard title="Item 4" color="#ef4444" />
      </>
    ),
  },
};

/**
 * 4-column layout
 */
export const FourColumns: Story = {
  args: {
    columns: 4,
    children: (
      <>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
        <MockCard title="Item 4" color="#ef4444" />
        <MockCard title="Item 5" color="#8b5cf6" />
        <MockCard title="Item 6" color="#ec4899" />
        <MockCard title="Item 7" color="#06b6d4" />
        <MockCard title="Item 8" color="#84cc16" />
      </>
    ),
  },
};

/**
 * Single column (list view)
 */
export const SingleColumn: Story = {
  args: {
    columns: 1,
    children: (
      <>
        <MockCard title="Task 1" color="#3b82f6" />
        <MockCard title="Task 2" color="#10b981" />
        <MockCard title="Task 3" color="#f59e0b" />
      </>
    ),
  },
};

/**
 * Small gap spacing
 */
export const SmallGap: Story = {
  args: {
    gap: 'sm',
    children: (
      <>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
        <MockCard title="Item 4" color="#ef4444" />
        <MockCard title="Item 5" color="#8b5cf6" />
        <MockCard title="Item 6" color="#ec4899" />
      </>
    ),
  },
};

/**
 * Large gap spacing
 */
export const LargeGap: Story = {
  args: {
    gap: 'lg',
    children: (
      <>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
        <MockCard title="Item 4" color="#ef4444" />
        <MockCard title="Item 5" color="#8b5cf6" />
        <MockCard title="Item 6" color="#ec4899" />
      </>
    ),
  },
};

/**
 * Loading state with default skeleton count (6)
 */
export const Loading: Story = {
  args: {
    loading: true,
  },
};

/**
 * Loading state with custom skeleton count
 */
export const LoadingCustomCount: Story = {
  args: {
    loading: true,
    skeletonCount: 9,
    columns: 3,
  },
};

/**
 * Empty state with default config
 */
export const Empty: Story = {
  args: {
    emptyState: {},
  },
};

/**
 * Empty state with custom configuration
 */
export const EmptyCustom: Story = {
  args: {
    emptyState: {
      icon: <FolderOpen className="h-12 w-12" />,
      title: 'No projects yet',
      description: 'Create your first project to get started with the platform.',
      action: (
        <button className="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand/90 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      ),
    },
  },
};

/**
 * Few items (less than full grid)
 */
export const FewItems: Story = {
  args: {
    children: (
      <>
        <MockCard title="Project 1" color="#3b82f6" />
        <MockCard title="Project 2" color="#10b981" />
      </>
    ),
  },
};

/**
 * Many items (scrollable)
 */
export const ManyItems: Story = {
  args: {
    columns: 3,
    children: (
      <>
        {Array.from({ length: 15 }).map((_, idx) => (
          <MockCard
            key={idx}
            title={`Project ${idx + 1}`}
            color={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]}
          />
        ))}
      </>
    ),
  },
};

/**
 * Mobile viewport - 1 column
 */
export const Mobile: Story = {
  args: {
    children: (
      <>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
      </>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet viewport - 2 columns
 */
export const Tablet: Story = {
  args: {
    children: (
      <>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
        <MockCard title="Item 4" color="#ef4444" />
      </>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Desktop viewport - 3 columns
 */
export const Desktop: Story = {
  args: {
    children: (
      <>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
        <MockCard title="Item 4" color="#ef4444" />
        <MockCard title="Item 5" color="#8b5cf6" />
        <MockCard title="Item 6" color="#ec4899" />
      </>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
