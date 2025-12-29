import { cn } from '@/lib/utils';

/**
 * ItemCounter Props Interface
 */
export interface ItemCounterProps {
    /** Current count */
    count: number;

    /** Singular label (e.g., "item", "result", "task") */
    singularLabel?: string;

    /** Plural label (e.g., "items", "results", "tasks") */
    pluralLabel?: string;

    /** Additional CSS classes */
    className?: string;

    /** Accessible label override */
    ariaLabel?: string;
}

/**
 * ItemCounter Component
 *
 * Displays a count with automatic singular/plural label handling.
 * Used for showing result counts, active filters, search results, etc.
 *
 * @example
 * ```tsx
 * <ItemCounter count={42} singularLabel="result" pluralLabel="results" />
 * // Renders: "42 results"
 *
 * <ItemCounter count={1} singularLabel="task" pluralLabel="tasks" />
 * // Renders: "1 task"
 *
 * <ItemCounter count={0} />
 * // Renders: "0 items"
 * ```
 */
export function ItemCounter({
    count,
    singularLabel = 'item',
    pluralLabel = 'items',
    className,
    ariaLabel,
}: ItemCounterProps) {
    // Determine correct label based on count
    const label = count === 1 ? singularLabel : pluralLabel;

    // Accessible label
    const accessibleLabel = ariaLabel || `${count} ${label}`;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1',
                'text-[var(--text-sm)] font-medium text-muted-foreground',
                className
            )}
            aria-label={accessibleLabel}
            role="status"
        >
            <span className="font-semibold text-foreground">
                {count.toLocaleString()}
            </span>
            <span>{label}</span>
        </span>
    );
}
