import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FilterTag Props Interface
 */
export interface FilterTagProps {
    /** Filter label to display */
    label: string;

    /** Callback when tag is removed */
    onRemove: () => void;

    /** Optional color variant */
    color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';

    /** Additional CSS classes */
    className?: string;

    /** Disable the tag */
    disabled?: boolean;

    /** Accessible label for remove button */
    removeLabel?: string;
}

/**
 * FilterTag Component
 *
 * Individual filter tag with remove button.
 * Part of the FilterBar system for visual filter management.
 *
 * @example
 * ```tsx
 * <FilterTag
 *   label="Status: Active"
 *   onRemove={() => removeFilter('status', 'active')}
 *   color="primary"
 * />
 * ```
 */
export function FilterTag({
    label,
    onRemove,
    color = 'default',
    className,
    disabled = false,
    removeLabel = 'Remove filter',
}: FilterTagProps) {
    const colorClasses = {
        default: 'bg-muted text-muted-foreground border-border',
        primary: 'bg-brand/10 text-brand border-brand/20',
        success: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400',
        warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5',
                'px-3 py-1.5',
                'rounded-full border',
                'text-[var(--text-sm)] font-medium',
                'transition-all duration-[var(--transition-normal)]',
                colorClasses[color],
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            role="group"
            aria-label={`Filter: ${label}`}
        >
            {/* Label */}
            <span className="whitespace-nowrap">{label}</span>

            {/* Remove Button */}
            <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                aria-label={`${removeLabel}: ${label}`}
                className={cn(
                    'inline-flex items-center justify-center',
                    'rounded-full',
                    'p-0.5',
                    'transition-all duration-[var(--transition-fast)]',
                    'hover:bg-foreground/10',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    'disabled:cursor-not-allowed',
                    'active:scale-90',
                )}
            >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
        </div>
    );
}
