import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

/**
 * ContentGrid Props Interface
 */
export interface ContentGridProps {
    /** Grid items to display */
    children?: ReactNode;

    /** Number of columns on desktop (default: 3) */
    columns?: 1 | 2 | 3 | 4;

    /** Gap between grid items (default: 'md') */
    gap?: 'sm' | 'md' | 'lg';

    /** Show loading skeleton state */
    loading?: boolean;

    /** Number of skeleton items to show when loading (default: 6) */
    skeletonCount?: number;

    /** Empty state configuration */
    emptyState?: {
        /** Icon to display (default: Inbox) */
        icon?: ReactNode;
        /** Title text */
        title?: string;
        /** Description text */
        description?: string;
        /** Optional action button */
        action?: ReactNode;
    };

    /** Additional CSS classes */
    className?: string;

    /** Accessible label for the grid */
    ariaLabel?: string;
}

/**
 * LoadingSkeleton Component
 * Renders a skeleton card for loading state
 */
function LoadingSkeleton() {
    return (
        <div
            className={cn(
                'rounded-lg border border-border bg-card',
                'p-4 space-y-3',
                'animate-pulse'
            )}
            role="status"
            aria-label="Loading..."
        >
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
            </div>

            {/* Footer skeleton */}
            <div className="flex gap-2 pt-2">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
            </div>
        </div>
    );
}

/**
 * EmptyState Component
 * Renders when grid has no items
 */
function EmptyState({
    icon = <Inbox className="h-12 w-12" aria-hidden="true" />,
    title = 'No items found',
    description = 'There are no items to display.',
    action,
}: NonNullable<ContentGridProps['emptyState']>) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'py-12 px-4',
                'text-center'
            )}
            role="status"
        >
            {/* Icon */}
            <div className="text-muted-foreground mb-4">
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {description}
            </p>

            {/* Optional action */}
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}

/**
 * ContentGrid Component
 *
 * Responsive CSS Grid layout for displaying card-based content.
 * Handles loading states, empty states, and responsive column configurations.
 *
 * **Default Responsive Behavior:**
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 1024px): 2 columns
 * - Desktop (>= 1024px): 3 columns (or custom via `columns` prop)
 *
 * @example Basic usage
 * ```tsx
 * <ContentGrid>
 *   <ProjectCard project={project1} />
 *   <ProjectCard project={project2} />
 *   <ProjectCard project={project3} />
 * </ContentGrid>
 * ```
 *
 * @example With loading state
 * ```tsx
 * <ContentGrid loading={isLoading} skeletonCount={6}>
 *   {projects.map(p => <ProjectCard key={p.id} project={p} />)}
 * </ContentGrid>
 * ```
 *
 * @example With empty state
 * ```tsx
 * <ContentGrid
 *   emptyState={{
 *     icon: <FolderOpen className="h-12 w-12" />,
 *     title: 'No projects yet',
 *     description: 'Create your first project to get started',
 *     action: <Button>Create Project</Button>
 *   }}
 * >
 *   {projects.map(p => <ProjectCard key={p.id} project={p} />)}
 * </ContentGrid>
 * ```
 *
 * @example Custom columns and gap
 * ```tsx
 * <ContentGrid columns={4} gap="lg">
 *   {items.map(item => <ItemCard key={item.id} item={item} />)}
 * </ContentGrid>
 * ```
 */
export function ContentGrid({
    children,
    columns = 3,
    gap = 'md',
    loading = false,
    skeletonCount = 6,
    emptyState,
    className,
    ariaLabel = 'Content grid',
}: ContentGridProps) {
    // Gap size mapping
    const gapStyles = {
        'sm': 'gap-3',
        'md': 'gap-4',
        'lg': 'gap-6',
    };

    // Column configuration (responsive)
    const columnStyles = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    // Loading state
    if (loading) {
        return (
            <div
                className={cn(
                    'grid w-full',
                    columnStyles[columns],
                    gapStyles[gap],
                    className
                )}
                role="region"
                aria-label={ariaLabel}
                aria-busy="true"
            >
                {Array.from({ length: skeletonCount }).map((_, idx) => (
                    <LoadingSkeleton key={idx} />
                ))}
            </div>
        );
    }

    // Count children
    const childrenArray = Array.isArray(children) ? children : children ? [children] : [];
    const hasChildren = childrenArray.length > 0;

    // Empty state
    if (!hasChildren && emptyState) {
        return <EmptyState {...emptyState} />;
    }

    // Normal grid rendering
    return (
        <div
            className={cn(
                'grid w-full',
                columnStyles[columns],
                gapStyles[gap],
                className
            )}
            role="region"
            aria-label={ariaLabel}
        >
            {children}
        </div>
    );
}
