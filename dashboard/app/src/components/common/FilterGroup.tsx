import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * FilterGroup Props Interface
 */
export interface FilterGroupProps {
    /** Group title/label */
    title?: string;

    /** Filter tags (children) */
    children: ReactNode;

    /** Additional CSS classes */
    className?: string;

    /** Hide title visually but keep for screen readers */
    hideTitle?: boolean;
}

/**
 * FilterGroup Component
 *
 * Groups related filter tags under a common label.
 * Part of the FilterBar system for organizing filters by category.
 *
 * @example
 * ```tsx
 * <FilterGroup title="Status">
 *   <FilterTag label="Active" onRemove={() => {}} />
 *   <FilterTag label="Pending" onRemove={() => {}} />
 * </FilterGroup>
 * ```
 */
export function FilterGroup({
    title,
    children,
    className,
    hideTitle = false,
}: FilterGroupProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2',
                className
            )}
            role="group"
            aria-label={title}
        >
            {/* Group Title */}
            {title && (
                <h3
                    className={cn(
                        'text-xs font-semibold uppercase tracking-wider',
                        'text-muted-foreground',
                        hideTitle && 'sr-only'
                    )}
                >
                    {title}
                </h3>
            )}

            {/* Filter Tags */}
            <div className="flex flex-wrap items-center gap-2">
                {children}
            </div>
        </div>
    );
}
