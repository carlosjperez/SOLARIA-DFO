import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Sort configuration object
 */
export interface SortConfig {
    /** Field to sort by */
    field: string;
    /** Sort direction */
    direction: 'asc' | 'desc';
}

/**
 * Sort option for dropdown
 */
export interface SortOption {
    /** Option value (field name) */
    value: string;
    /** Display label */
    label: string;
}

/**
 * SortBar Props Interface
 */
export interface SortBarProps {
    /** Current sort configuration (controlled) */
    value: SortConfig;

    /** Callback when sort changes */
    onChange: (sort: SortConfig) => void;

    /** Available sort options */
    options: SortOption[];

    /** Additional CSS classes */
    className?: string;

    /** Disable the sort bar */
    disabled?: boolean;

    /** Accessible label for the sort control */
    ariaLabel?: string;
}

/**
 * SortBar Component
 *
 * Sort control with field selector dropdown and direction toggle.
 * Provides visual feedback for current sort state.
 *
 * @example
 * ```tsx
 * const [sort, setSort] = useState<SortConfig>({
 *   field: 'name',
 *   direction: 'asc'
 * });
 *
 * <SortBar
 *   value={sort}
 *   onChange={setSort}
 *   options={[
 *     { value: 'name', label: 'Name' },
 *     { value: 'date', label: 'Date' },
 *     { value: 'priority', label: 'Priority' }
 *   ]}
 * />
 * ```
 */
export function SortBar({
    value,
    onChange,
    options,
    className,
    disabled = false,
    ariaLabel = 'Sort by',
}: SortBarProps) {
    const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({
            field: e.target.value,
            direction: value.direction,
        });
    };

    const handleDirectionToggle = () => {
        onChange({
            field: value.field,
            direction: value.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    const DirectionIcon = value.direction === 'asc' ? ArrowUp : ArrowDown;

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2',
                className
            )}
            role="group"
            aria-label={ariaLabel}
        >
            {/* Sort Field Selector */}
            <label className="sr-only" htmlFor="sort-field">
                Sort field
            </label>
            <select
                id="sort-field"
                value={value.field}
                onChange={handleFieldChange}
                disabled={disabled}
                className={cn(
                    'px-3 py-2',
                    'rounded-md border border-border bg-card',
                    'text-[var(--text-sm)] text-foreground',
                    'transition-all duration-[var(--transition-normal)]',
                    'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'hover:border-muted-foreground/30',
                    'cursor-pointer',
                )}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {/* Direction Toggle Button */}
            <button
                type="button"
                onClick={handleDirectionToggle}
                disabled={disabled}
                aria-label={`Sort direction: ${value.direction === 'asc' ? 'ascending' : 'descending'}`}
                className={cn(
                    'inline-flex items-center justify-center',
                    'p-2 rounded-md',
                    'border border-border bg-card',
                    'text-foreground',
                    'transition-all duration-[var(--transition-normal)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'hover:bg-muted/50 hover:border-muted-foreground/20',
                    'active:scale-[0.98]',
                )}
            >
                <DirectionIcon className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
