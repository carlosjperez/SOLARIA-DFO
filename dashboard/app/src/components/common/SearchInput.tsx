import { Search, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * SearchInput Props Interface
 */
export interface SearchInputProps {
    /** Current search value (controlled) */
    value?: string;

    /** Callback when search value changes (debounced) */
    onChange: (value: string) => void;

    /** Placeholder text */
    placeholder?: string;

    /** Debounce delay in milliseconds */
    debounceMs?: number;

    /** Additional CSS classes */
    className?: string;

    /** Accessible label */
    ariaLabel?: string;

    /** Disable the input */
    disabled?: boolean;

    /** Auto-focus on mount */
    autoFocus?: boolean;
}

/**
 * SearchInput Component
 *
 * Search input with debouncing, clear button, and search icon.
 * Optimized for filtering lists and searching content.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 *
 * <SearchInput
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Search tasks..."
 *   debounceMs={300}
 * />
 * ```
 */
export function SearchInput({
    value = '',
    onChange,
    placeholder = 'Search...',
    debounceMs = 300,
    className,
    ariaLabel = 'Search',
    disabled = false,
    autoFocus = false,
}: SearchInputProps) {
    // Local state for immediate input updates (before debounce)
    const [localValue, setLocalValue] = useState(value);

    // Sync local value with controlled value
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounced onChange callback
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs, onChange, value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    }, []);

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChange('');
    }, [onChange]);

    return (
        <div
            className={cn(
                'relative flex items-center',
                'w-full max-w-md',
                className
            )}
        >
            {/* Search Icon */}
            <Search
                className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
            />

            {/* Input Field */}
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus}
                aria-label={ariaLabel}
                className={cn(
                    'w-full',
                    'pl-10 pr-10 py-2',
                    'rounded-md border border-border bg-card',
                    'text-[var(--text-sm)] text-foreground',
                    'placeholder:text-muted-foreground',
                    'transition-all duration-[var(--transition-normal)]',
                    'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'hover:border-muted-foreground/30',
                )}
            />

            {/* Clear Button */}
            {localValue && !disabled && (
                <button
                    onClick={handleClear}
                    type="button"
                    aria-label="Clear search"
                    className={cn(
                        'absolute right-3',
                        'p-1 rounded-md',
                        'text-muted-foreground hover:text-foreground',
                        'hover:bg-muted/50',
                        'transition-all duration-[var(--transition-fast)]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    )}
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
