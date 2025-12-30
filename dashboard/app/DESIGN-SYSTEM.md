# SOLARIA DFO Design System

**Version:** 1.0.0
**Date:** 2025-12-29

Design system documentation for the SOLARIA Digital Field Operations dashboard.

---

## Overview

The SOLARIA DFO Design System is a collection of reusable, accessible React components built with TypeScript, Tailwind CSS, and design tokens. All components follow WCAG 2.1 Level AA accessibility standards.

### Design Principles

1. **Accessibility First** - WCAG 2.1 AA compliance as baseline
2. **Consistent Visual Language** - Design tokens ensure consistency
3. **Responsive by Default** - Mobile-first responsive design
4. **Type Safety** - Full TypeScript support with exported types
5. **Performance** - Optimized for bundle size and runtime performance

---

## Design Tokens

Design tokens are CSS custom properties defined in `globals.css`:

### Colors

```css
--brand: #f6921d;          /* SOLARIA orange */
--primary: #3b82f6;        /* Blue */
--success: #16a34a;        /* Green */
--warning: #f59e0b;        /* Yellow */
--danger: #ef4444;         /* Red */
--muted-foreground: #64748b; /* Gray text */
```

### Spacing

```css
--spacing-xs: 0.25rem;     /* 4px */
--spacing-sm: 0.5rem;      /* 8px */
--spacing-md: 1rem;        /* 16px */
--spacing-lg: 1.5rem;      /* 24px */
--spacing-xl: 2rem;        /* 32px */
```

### Typography

```css
--text-xs: 0.75rem;        /* 12px */
--text-sm: 0.875rem;       /* 14px */
--text-base: 1rem;         /* 16px */
--text-lg: 1.125rem;       /* 18px */
--text-xl: 1.25rem;        /* 20px */
```

### Radius

```css
--radius-sm: 0.375rem;     /* 6px */
--radius-md: 0.5rem;       /* 8px */
--radius-lg: 0.75rem;      /* 12px */
--radius-xl: 1rem;         /* 16px */
```

---

## Components

### PageHeader

Standardized page header component with title, subtitle, breadcrumbs, back button, and action buttons.

#### Props

```typescript
interface PageHeaderProps {
  title: string;                          // Page title (h1)
  subtitle?: string;                      // Optional subtitle
  breadcrumbs?: Array<{                   // Breadcrumb navigation
    label: string;
    to: string;
  }>;
  backButton?: {                          // Back button
    to: string;
    label?: string;
  };
  actions?: ReactNode;                    // Action buttons/controls
}
```

#### Usage

```tsx
import { PageHeader } from '@/components/common/PageHeader';
import { Plus } from 'lucide-react';

// Basic usage
<PageHeader 
  title="Projects" 
  subtitle="Manage all active projects"
/>

// With breadcrumbs
<PageHeader 
  title="Project Details"
  breadcrumbs={[
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: 'SOLARIA-001', to: '/projects/1' }
  ]}
/>

// With back button
<PageHeader 
  title="Archived Projects"
  backButton={{ to: '/projects', label: 'Back to Projects' }}
/>

// With actions
<PageHeader 
  title="Dashboard"
  subtitle="Executive overview"
  actions={
    <button className="btn-primary">
      <Plus className="h-4 w-4" />
      New Project
    </button>
  }
/>
```

#### Accessibility

- ✅ `<h1>` for page title (proper heading hierarchy)
- ✅ `<nav aria-label="Breadcrumb">` for breadcrumbs
- ✅ `<Link aria-label="...">` for back button
- ✅ Mobile menu with `aria-expanded` state

---

### StatCard

Display key statistics with icon, title, and value. Supports 5 visual variants and optional onClick for interactivity.

#### Props

```typescript
interface StatCardProps {
  title: string;                          // Stat label
  value: string | number;                 // Stat value
  icon: LucideIcon;                       // Icon component
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;                   // Optional click handler
  className?: string;                     // Additional classes
}
```

#### Usage

```tsx
import { StatCard } from '@/components/common/StatCard';
import { FolderKanban, CheckCircle2, Clock, Bot } from 'lucide-react';

// Basic usage
<StatCard 
  title="Active Projects" 
  value={24} 
  icon={FolderKanban}
  variant="primary"
/>

// Clickable card
<StatCard 
  title="Completed Tasks" 
  value={156} 
  icon={CheckCircle2}
  variant="success"
  onClick={() => navigate('/tasks?status=completed')}
  className="cursor-pointer"
/>

// With formatted value
<StatCard 
  title="Budget" 
  value="$125K" 
  icon={DollarSign}
  variant="warning"
/>
```

#### Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `default` | Gray | Neutral metrics |
| `primary` | Blue | Key metrics |
| `success` | Green | Positive metrics |
| `warning` | Yellow | Caution metrics |
| `danger` | Red | Critical metrics |

#### Accessibility

- ✅ `role="button"` and `tabIndex="0"` when clickable
- ✅ Keyboard support (Enter and Space keys)
- ✅ `aria-hidden="true"` on decorative icons

---

### StatsGrid

Responsive grid container for StatCard components with automatic column detection.

#### Props

```typescript
interface StatsGridProps {
  children: ReactNode;                    // StatCard components
  columns?: 1 | 2 | 3 | 4;                // Desktop columns (auto-detected if omitted)
  gap?: 'sm' | 'md' | 'lg';               // Gap size (default: 'md')
  className?: string;                     // Additional classes
  emptyMessage?: string;                  // Empty state message
}
```

#### Usage

```tsx
import { StatsGrid } from '@/components/common/StatsGrid';
import { StatCard } from '@/components/common/StatCard';

// Auto-detect columns (3 cards = 3 columns)
<StatsGrid>
  <StatCard title="Projects" value={24} icon={FolderKanban} variant="primary" />
  <StatCard title="Tasks" value={156} icon={CheckCircle2} variant="success" />
  <StatCard title="Agents" value={8} icon={Bot} variant="default" />
</StatsGrid>

// Force 4 columns
<StatsGrid columns={4} gap="lg">
  <StatCard title="Stat 1" value={10} icon={Icon1} />
  <StatCard title="Stat 2" value={20} icon={Icon2} />
  <StatCard title="Stat 3" value={30} icon={Icon3} />
  <StatCard title="Stat 4" value={40} icon={Icon4} />
</StatsGrid>

// Empty state
<StatsGrid emptyMessage="No statistics to display" />
```

#### Responsive Behavior

| Columns | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| 1 | 1 col | 1 col | 1 col |
| 2 | 1 col | 2 cols | 2 cols |
| 3 | 1 col | 2 cols | 3 cols |
| 4 | 1 col | 2 cols | 4 cols |

#### Accessibility

- ✅ `role="list"` and `aria-label="Statistics grid"`
- ✅ Each StatCard is implicitly a list item

---

### SearchInput

Debounced search input with clear button and accessibility features.

#### Props

```typescript
interface SearchInputProps {
  value: string;                          // Current search value
  onChange: (value: string) => void;      // Value change handler
  placeholder?: string;                   // Placeholder text
  debounceMs?: number;                    // Debounce delay (default: 300)
  ariaLabel?: string;                     // Accessible label
  className?: string;                     // Additional classes
}
```

#### Usage

```tsx
import { SearchInput } from '@/components/common/SearchInput';

function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState([]);

  // onChange is debounced - receives value after delay
  useEffect(() => {
    if (search) {
      // API call with debounced search value
      fetchProjects({ search }).then(setProjects);
    }
  }, [search]);

  return (
    <SearchInput 
      value={search}
      onChange={setSearch}
      placeholder="Search projects..."
      debounceMs={500}
      ariaLabel="Search for projects"
    />
  );
}
```

#### Features

- ✅ Automatic debouncing (prevents excessive API calls)
- ✅ Clear button appears when value is not empty
- ✅ Search icon indicator
- ✅ Keyboard accessible clear button

#### Accessibility

- ✅ `role="searchbox"`
- ✅ `aria-label` for screen readers
- ✅ Clear button has `aria-label="Clear search"`

---

### ViewSelector

Toggle between grid and list view modes with visual and ARIA feedback.

#### Props

```typescript
type ViewType = 'grid' | 'list';

interface ViewSelectorProps {
  value: ViewType;                        // Current view mode
  onChange: (value: ViewType) => void;    // View change handler
  ariaLabel?: string;                     // Group label
  className?: string;                     // Additional classes
}
```

#### Usage

```tsx
import { ViewSelector, type ViewType } from '@/components/common/ViewSelector';

function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewType>('grid');

  return (
    <>
      <ViewSelector 
        value={viewMode}
        onChange={setViewMode}
        ariaLabel="Toggle dashboard view"
      />

      {viewMode === 'grid' ? (
        <ProjectsGrid projects={projects} />
      ) : (
        <ProjectsList projects={projects} />
      )}
    </>
  );
}
```

#### Accessibility

- ✅ `role="group"` with `aria-label`
- ✅ Each button has `aria-pressed` (true/false)
- ✅ `aria-label` describes each button ("Grid view", "List view")
- ✅ Keyboard accessible (Enter/Space to toggle)

---

### ItemCounter

Display item count with automatic singular/plural label handling.

#### Props

```typescript
interface ItemCounterProps {
  count: number;                          // Item count
  singularLabel?: string;                 // Singular form (default: 'item')
  pluralLabel?: string;                   // Plural form (default: 'items')
  className?: string;                     // Additional classes
  ariaLabel?: string;                     // Custom aria-label
}
```

#### Usage

```tsx
import { ItemCounter } from '@/components/common/ItemCounter';

// Auto singular/plural
<ItemCounter count={1} singularLabel="proyecto" pluralLabel="proyectos" />
// Renders: "1 proyecto"

<ItemCounter count={5} singularLabel="proyecto" pluralLabel="proyectos" />
// Renders: "5 proyectos"

// With defaults
<ItemCounter count={42} />
// Renders: "42 items"

// Formatted numbers
<ItemCounter count={1000} singularLabel="result" pluralLabel="results" />
// Renders: "1,000 results"
```

#### Accessibility

- ✅ `role="status"` for screen reader announcements
- ✅ `aria-label` with full description
- ✅ Count changes are announced to screen readers

---

### FilterGroup

Container for grouping related filter buttons under a common label.

#### Props

```typescript
interface FilterGroupProps {
  title?: string;                         // Group title
  children: ReactNode;                    // Filter buttons/tags
  className?: string;                     // Additional classes
  hideTitle?: boolean;                    // Hide title visually (keep for SR)
}
```

#### Usage

```tsx
import { FilterGroup } from '@/components/common/FilterGroup';

<FilterGroup title="Status">
  <button 
    className={cn('filter-btn', status === 'active' && 'active')}
    onClick={() => setStatus('active')}
  >
    Active
  </button>
  <button 
    className={cn('filter-btn', status === 'completed' && 'active')}
    onClick={() => setStatus('completed')}
  >
    Completed
  </button>
</FilterGroup>

// Multiple filter groups
<div className="flex gap-4">
  <FilterGroup title="Status">
    {/* status filters */}
  </FilterGroup>
  
  <FilterGroup title="Priority">
    {/* priority filters */}
  </FilterGroup>
  
  <FilterGroup title="Agent">
    {/* agent filters */}
  </FilterGroup>
</div>
```

#### Accessibility

- ✅ `role="group"` with `aria-label`
- ✅ Title is `<h3>` for semantic structure
- ✅ `hideTitle` uses `sr-only` class for visual hiding

---

## Page Layouts

### Standard Page Structure

All pages should follow this structure for consistency:

```tsx
import { PageHeader } from '@/components/common/PageHeader';
import { StatsGrid } from '@/components/common/StatsGrid';
import { StatCard } from '@/components/common/StatCard';
import { SearchInput } from '@/components/common/SearchInput';
import { ViewSelector, type ViewType } from '@/components/common/ViewSelector';

export function StandardPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewType>('grid');

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader 
        title="Page Title"
        subtitle="Page description"
        actions={
          <ViewSelector value={viewMode} onChange={setViewMode} />
        }
      />

      {/* 2. Stats Row */}
      <StatsGrid columns={4}>
        <StatCard title="Stat 1" value={24} icon={Icon1} variant="primary" />
        <StatCard title="Stat 2" value={156} icon={Icon2} variant="success" />
        <StatCard title="Stat 3" value={8} icon={Icon3} variant="warning" />
        <StatCard title="Stat 4" value={12} icon={Icon4} variant="default" />
      </StatsGrid>

      {/* 3. Filters/Search */}
      <SearchInput 
        value={search}
        onChange={setSearch}
        placeholder="Search..."
      />

      {/* 4. Content */}
      {viewMode === 'grid' ? <GridView /> : <ListView />}
    </div>
  );
}
```

---

## Styling Patterns

### CSS Class Naming

Follow these conventions:

```css
/* Component base */
.component-name { }

/* Component variants */
.component-name.variant-name { }

/* Component states */
.component-name.active { }
.component-name.disabled { }

/* Component parts */
.component-name-header { }
.component-name-body { }
.component-name-footer { }
```

### Utility Classes

Use Tailwind utilities for:
- Spacing: `p-4`, `m-2`, `gap-4`
- Layout: `flex`, `grid`, `hidden`
- Responsive: `md:flex`, `lg:grid-cols-4`
- Design tokens: Use custom properties for consistency

---

## Best Practices

### Component Composition

✅ **DO**: Compose small, focused components
```tsx
<StatsGrid>
  <StatCard title="Projects" value={24} icon={FolderKanban} />
  <StatCard title="Tasks" value={156} icon={CheckCircle2} />
</StatsGrid>
```

❌ **DON'T**: Create monolithic components
```tsx
<DashboardStatsWithGridAndCards data={stats} />
```

### Accessibility

✅ **DO**: Use semantic HTML and ARIA attributes
```tsx
<button 
  aria-label="Delete project"
  aria-pressed={isSelected}
  onClick={handleDelete}
>
  <Trash2 aria-hidden="true" />
</button>
```

❌ **DON'T**: Use divs for interactive elements
```tsx
<div onClick={handleDelete}>
  <Trash2 />
</div>
```

### TypeScript

✅ **DO**: Export and use component prop types
```tsx
import type { StatCardProps } from '@/components/common/StatCard';

const cardProps: StatCardProps = {
  title: "Projects",
  value: 24,
  icon: FolderKanban,
  variant: "primary"
};
```

❌ **DON'T**: Use `any` types
```tsx
const cardProps: any = { /* ... */ };
```

### Performance

✅ **DO**: Memoize expensive computations
```tsx
const filteredProjects = useMemo(() => 
  projects.filter(p => p.name.includes(search)),
  [projects, search]
);
```

❌ **DON'T**: Filter in render
```tsx
return (
  <div>
    {projects.filter(p => p.name.includes(search)).map(...)}
  </div>
);
```

---

## Migration Guide

### From Custom Components to Design System

#### Before (Custom StatCard)

```tsx
<div className="stat-card projects">
  <div className="stat-icon">
    <FolderKanban className="h-5 w-5" />
  </div>
  <div className="stat-content">
    <div className="stat-label">Projects</div>
    <div className="stat-value">{stats.projects}</div>
  </div>
</div>
```

#### After (Design System StatCard)

```tsx
<StatCard 
  title="Projects"
  value={stats.projects}
  icon={FolderKanban}
  variant="primary"
/>
```

**Benefits:**
- 70% less code (-25 lines)
- Consistent styling
- Built-in accessibility
- Type safety
- Easier to maintain

---

## Testing

All design system components include comprehensive integration tests. See test files in `src/components/common/__tests__/` for examples.

### Running Tests

```bash
# Run all component tests
pnpm test -- src/components/common/__tests__/

# Run specific component tests
pnpm test -- StatCard.test.tsx

# Watch mode
pnpm test:watch
```

### Example Test

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatCard } from '../StatCard';
import { FolderKanban } from 'lucide-react';

it('handles onClick callback', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  render(
    <StatCard
      title="Projects"
      value={42}
      icon={FolderKanban}
      onClick={handleClick}
    />
  );

  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

---

## Changelog

### v1.0.0 (2025-12-29)

**Added:**
- PageHeader component with breadcrumbs and back button
- StatCard component with 5 variants
- StatsGrid responsive container
- SearchInput with debouncing
- ViewSelector for grid/list toggle
- ItemCounter with auto singular/plural
- FilterGroup container
- Comprehensive accessibility features
- Integration test suite
- WCAG 2.1 AA compliance (95/100 score)

---

## Support

For questions or issues with the design system:

1. Check this documentation
2. Review component tests for usage examples
3. See ACCESSIBILITY-AUDIT.md for accessibility guidance
4. Contact: charlie@solaria.agency

---

**SOLARIA Design System v1.0.0**
© 2024-2025 SOLARIA AGENCY
