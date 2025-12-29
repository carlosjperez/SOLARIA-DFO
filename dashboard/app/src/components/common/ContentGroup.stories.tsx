import type { Meta, StoryObj } from '@storybook/react';
import { ContentGroup } from './ContentGroup';
import { ContentGrid } from './ContentGrid';
import { Plus, RefreshCw } from 'lucide-react';

/**
 * ContentGroup provides a wrapper for grouping related content with an optional
 * title, subtitle, and action buttons.
 *
 * ## Features
 * - Flexible heading levels (h1-h6)
 * - Optional subtitle and action buttons
 * - Configurable spacing (sm/md/lg)
 * - Semantic section element
 * - ARIA labeling support
 */
const meta = {
  title: 'Components/ContentGroup',
  component: ContentGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Wrapper component for grouping related content with optional title, subtitle, and actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    titleLevel: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'Heading level for the title',
    },
    spacing: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spacing between title and content',
    },
  },
} satisfies Meta<typeof ContentGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock content components for demos
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

const MockList = () => (
  <ul className="space-y-2">
    <li className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
      <div className="h-2 w-2 rounded-full bg-brand" />
      <span className="text-sm text-foreground">Item 1</span>
    </li>
    <li className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
      <div className="h-2 w-2 rounded-full bg-brand" />
      <span className="text-sm text-foreground">Item 2</span>
    </li>
    <li className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
      <div className="h-2 w-2 rounded-full bg-brand" />
      <span className="text-sm text-foreground">Item 3</span>
    </li>
  </ul>
);

/**
 * Default content group with title
 */
export const Default: Story = {
  args: {
    title: 'Active Projects',
    children: (
      <ContentGrid columns={3}>
        <MockCard title="Project Alpha" color="#3b82f6" />
        <MockCard title="Project Beta" color="#10b981" />
        <MockCard title="Project Gamma" color="#f59e0b" />
      </ContentGrid>
    ),
  },
};

/**
 * With subtitle for additional context
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Recent Tasks',
    subtitle: 'Your most recently updated tasks across all projects',
    children: <MockList />,
  },
};

/**
 * With action button in header
 */
export const WithActions: Story = {
  args: {
    title: 'Team Members',
    subtitle: '12 active members',
    actions: (
      <button className="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand/90 inline-flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Member
      </button>
    ),
    children: (
      <ContentGrid columns={2}>
        <MockCard title="John Doe" color="#3b82f6" />
        <MockCard title="Jane Smith" color="#10b981" />
        <MockCard title="Bob Johnson" color="#f59e0b" />
        <MockCard title="Alice Williams" color="#ef4444" />
      </ContentGrid>
    ),
  },
};

/**
 * Multiple action buttons
 */
export const MultipleActions: Story = {
  args: {
    title: 'Projects',
    actions: (
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-md border border-border bg-card hover:bg-muted/50 inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button className="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand/90 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>
    ),
    children: (
      <ContentGrid columns={3}>
        <MockCard title="Project 1" color="#3b82f6" />
        <MockCard title="Project 2" color="#10b981" />
        <MockCard title="Project 3" color="#f59e0b" />
      </ContentGrid>
    ),
  },
};

/**
 * Content only (no title or header)
 */
export const WithoutTitle: Story = {
  args: {
    children: (
      <ContentGrid columns={2}>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
      </ContentGrid>
    ),
  },
};

/**
 * Heading level h1 (largest)
 */
export const HeadingLevel1: Story = {
  args: {
    title: 'Dashboard Overview',
    titleLevel: 'h1',
    subtitle: 'Welcome back, Carlos',
    children: <MockList />,
  },
};

/**
 * Heading level h2 (default)
 */
export const HeadingLevel2: Story = {
  args: {
    title: 'Section Title',
    titleLevel: 'h2',
    subtitle: 'Default heading size',
    children: <MockList />,
  },
};

/**
 * Heading level h3
 */
export const HeadingLevel3: Story = {
  args: {
    title: 'Subsection Title',
    titleLevel: 'h3',
    subtitle: 'Slightly smaller heading',
    children: <MockList />,
  },
};

/**
 * Heading level h4
 */
export const HeadingLevel4: Story = {
  args: {
    title: 'Card Section',
    titleLevel: 'h4',
    subtitle: 'Medium-small heading',
    children: <MockList />,
  },
};

/**
 * Heading level h5
 */
export const HeadingLevel5: Story = {
  args: {
    title: 'Component Title',
    titleLevel: 'h5',
    subtitle: 'Small heading',
    children: <MockList />,
  },
};

/**
 * Heading level h6 (smallest)
 */
export const HeadingLevel6: Story = {
  args: {
    title: 'Detail Section',
    titleLevel: 'h6',
    subtitle: 'Smallest heading size',
    children: <MockList />,
  },
};

/**
 * Small spacing between title and content
 */
export const SmallSpacing: Story = {
  args: {
    title: 'Compact Layout',
    subtitle: 'With minimal spacing',
    spacing: 'sm',
    children: <MockList />,
  },
};

/**
 * Medium spacing (default)
 */
export const MediumSpacing: Story = {
  args: {
    title: 'Standard Layout',
    subtitle: 'With default spacing',
    spacing: 'md',
    children: <MockList />,
  },
};

/**
 * Large spacing between title and content
 */
export const LargeSpacing: Story = {
  args: {
    title: 'Spacious Layout',
    subtitle: 'With generous spacing',
    spacing: 'lg',
    children: <MockList />,
  },
};

/**
 * Nested content groups
 */
export const NestedGroups: Story = {
  args: {
    title: 'Parent Section',
    subtitle: 'Contains multiple subsections',
    children: (
      <>
        <ContentGroup title="Subsection 1" titleLevel="h3">
          <MockList />
        </ContentGroup>
        <ContentGroup title="Subsection 2" titleLevel="h3">
          <MockList />
        </ContentGroup>
      </>
    ),
  },
};

/**
 * Realistic usage with ContentGrid
 */
export const WithContentGrid: Story = {
  args: {
    title: 'Featured Projects',
    subtitle: 'Highlighted projects from this quarter',
    actions: (
      <button className="px-4 py-2 rounded-md border border-border bg-card hover:bg-muted/50">
        View All
      </button>
    ),
    children: (
      <ContentGrid columns={3}>
        <MockCard title="Project Alpha" color="#3b82f6" />
        <MockCard title="Project Beta" color="#10b981" />
        <MockCard title="Project Gamma" color="#f59e0b" />
        <MockCard title="Project Delta" color="#ef4444" />
        <MockCard title="Project Epsilon" color="#8b5cf6" />
        <MockCard title="Project Zeta" color="#ec4899" />
      </ContentGrid>
    ),
  },
};

/**
 * Complex layout with all features
 */
export const ComplexLayout: Story = {
  args: {
    title: 'Project Dashboard',
    subtitle: 'Overview of all active projects and their current status',
    titleLevel: 'h1',
    spacing: 'lg',
    actions: (
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-md border border-border bg-card hover:bg-muted/50 inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button className="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand/90 inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>
    ),
    children: (
      <ContentGrid columns={3} gap="lg">
        <MockCard title="Project Alpha" color="#3b82f6" />
        <MockCard title="Project Beta" color="#10b981" />
        <MockCard title="Project Gamma" color="#f59e0b" />
        <MockCard title="Project Delta" color="#ef4444" />
        <MockCard title="Project Epsilon" color="#8b5cf6" />
        <MockCard title="Project Zeta" color="#ec4899" />
        <MockCard title="Project Eta" color="#06b6d4" />
        <MockCard title="Project Theta" color="#84cc16" />
        <MockCard title="Project Iota" color="#f97316" />
      </ContentGrid>
    ),
  },
};

/**
 * Custom aria-label for accessibility
 */
export const CustomAriaLabel: Story = {
  args: {
    title: 'Statistics',
    ariaLabel: 'Project statistics overview',
    children: <MockList />,
  },
};

/**
 * Custom styling on wrapper
 */
export const WithCustomStyling: Story = {
  args: {
    title: 'Styled Section',
    className: 'bg-muted/30 p-6 rounded-lg border border-border',
    contentClassName: 'bg-card p-4 rounded-md',
    children: <MockList />,
  },
};

/**
 * Actions without title (just content with toolbar)
 */
export const ActionsOnly: Story = {
  args: {
    actions: (
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-md border border-border bg-card hover:bg-muted/50">
          Filter
        </button>
        <button className="px-3 py-2 rounded-md border border-border bg-card hover:bg-muted/50">
          Sort
        </button>
      </div>
    ),
    children: (
      <ContentGrid columns={2}>
        <MockCard title="Item 1" color="#3b82f6" />
        <MockCard title="Item 2" color="#10b981" />
        <MockCard title="Item 3" color="#f59e0b" />
        <MockCard title="Item 4" color="#ef4444" />
      </ContentGrid>
    ),
  },
};
