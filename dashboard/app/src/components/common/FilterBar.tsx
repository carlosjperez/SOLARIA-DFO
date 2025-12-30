import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * FilterBar Props Interface
 */
export interface FilterBarProps {
    /** Filter groups (children) */
    children?: ReactNode;

    /** Callback when "Clear all" is clicked */
    onClearAll?: () => void;

    /** Whether to show the clear all button */
    showClearAll?: boolean;

    /** Additional CSS classes */
    className?: string;

    /** Accessible label for the filter bar */
    ariaLabel?: string;

    /** Accessible label for clear all button */
    clearAllLabel?: string;

    /** Empty state message when no filters */
    emptyMessage?: string;
}

/**
 * FilterBar Component
 *
 * Container for filter groups and tags with clear all functionality.
 * Provides horizontal scrollable layout on mobile.
 *
 * @example
 * ```tsx
 * <FilterBar
 *   showClearAll
 *   onClearAll={handleClearAll}
 * >
 *   <FilterGroup title="Status">
 *     <FilterTag label="Active" onRemove={() => {}} />
 *     <FilterTag label="Pending" onRemove={() => {}} />
 *   </FilterGroup>
 *   <FilterGroup title="Priority">
 *     <FilterTag label="High" onRemove={() => {}} color="danger" />
 *   </FilterGroup>
 * </FilterBar>
 * ```
 */
export function FilterBar({
    children,
    onClearAll,
    showClearAll = true,
    className,
    ariaLabel = 'Active filters',
    clearAllLabel = 'Clear all filters',
    emptyMessage,
}: FilterBarProps) {
    // Check if there are any children (filters)
    const hasFilters = Boolean(children);

    // Don't render anything if no filters and no empty message
    if (!hasFilters && !emptyMessage) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex items-start gap-4',
                'w-full',
                className
            )}
            role="region"
            aria-label={ariaLabel}
        >
            {/* Filter Groups Container */}
            <div
                className={cn(
                    'flex-1',
                    'flex flex-col gap-4',
                    'overflow-x-auto',
                    // Scrollbar styling
                    'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent',
                )}
            >
                {hasFilters ? (
                    children
                ) : (
                    <p className="text-[var(--text-sm)] text-muted-foreground italic">
                        {emptyMessage}
                    </p>
                )}
            </div>

            {/* Clear All Button */}
            {hasFilters && showClearAll && onClearAll && (
                <button
                    type="button"
                    onClick={onClearAll}
                    aria-label={clearAllLabel}
                    className={cn(
                        'inline-flex items-center gap-2',
                        'px-3 py-1.5',
                        'rounded-md border border-border bg-card',
                        'text-[var(--text-sm)] font-medium text-muted-foreground',
                        'transition-all duration-[var(--transition-normal)]',
                        'hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground/30',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                        'active:scale-[0.98]',
                        'whitespace-nowrap',
                    )}
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Clear all
                </button>
            )}
        </div>
    );
}
