import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * StatsGrid Props Interface
 * Grid container responsivo para StatCard components
 */
export interface StatsGridProps {
    /** Children components (typically StatCard instances) */
    children: ReactNode;

    /** Number of columns at desktop breakpoint (default: auto based on children count) */
    columns?: 1 | 2 | 3 | 4;

    /** Gap size between cards */
    gap?: 'sm' | 'md' | 'lg';

    /** Additional CSS classes */
    className?: string;

    /** Empty state message when no children */
    emptyMessage?: string;
}

/**
 * StatsGrid Component
 *
 * Responsive grid container for StatCard components with automatic column calculation
 * and design token integration.
 *
 * @example
 * ```tsx
 * <StatsGrid columns={3} gap="lg">
 *   <StatCard title="Projects" value={24} />
 *   <StatCard title="Tasks" value={156} />
 *   <StatCard title="Agents" value={8} />
 * </StatsGrid>
 * ```
 */
export function StatsGrid({
    children,
    columns,
    gap = 'md',
    className,
    emptyMessage = 'No statistics available',
}: StatsGridProps) {
    // Count children for automatic column detection
    const childrenArray = Array.isArray(children) ? children : [children];
    const childCount = childrenArray.filter(Boolean).length;

    // Auto-detect columns based on children count if not specified
    const effectiveColumns = columns || getAutoColumns(childCount);

    // Gap mapping to design tokens
    const gapStyles = {
        sm: 'gap-[var(--spacing-sm)]',
        md: 'gap-[var(--spacing-md)]',
        lg: 'gap-[var(--spacing-lg)]',
    };

    // Responsive grid columns
    const columnStyles = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    // Handle empty state
    if (childCount === 0) {
        return (
            <div
                className={cn(
                    'rounded-xl border border-dashed border-border',
                    'p-[var(--spacing-xl)] text-center',
                    'bg-muted/30',
                    className
                )}
            >
                <p className="text-[var(--text-sm)] text-muted-foreground">
                    {emptyMessage}
                </p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'grid',
                columnStyles[effectiveColumns],
                gapStyles[gap],
                className
            )}
            role="list"
            aria-label="Statistics grid"
        >
            {children}
        </div>
    );
}

/**
 * Auto-detect optimal column count based on number of children
 * - 1-2 items: 2 columns
 * - 3 items: 3 columns
 * - 4+ items: 4 columns
 */
function getAutoColumns(count: number): 1 | 2 | 3 | 4 {
    if (count === 0) return 1;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
}
