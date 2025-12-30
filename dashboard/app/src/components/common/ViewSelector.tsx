import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * View type definition
 */
export type ViewType = 'grid' | 'list';

/**
 * ViewSelector Props Interface
 */
export interface ViewSelectorProps {
    /** Current active view */
    value: ViewType;

    /** Callback when view changes */
    onChange: (view: ViewType) => void;

    /** Additional CSS classes */
    className?: string;

    /** Accessible label for the toggle group */
    ariaLabel?: string;
}

/**
 * ViewSelector Component
 *
 * Toggle button group for switching between grid and list views.
 * Uses Lucide icons (LayoutGrid, List) with visual feedback for active state.
 *
 * @example
 * ```tsx
 * const [view, setView] = useState<ViewType>('grid');
 *
 * <ViewSelector
 *   value={view}
 *   onChange={setView}
 *   ariaLabel="Change content view"
 * />
 * ```
 */
export function ViewSelector({
    value,
    onChange,
    className,
    ariaLabel = 'Toggle view mode',
}: ViewSelectorProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-lg border border-border bg-card',
                'p-1 gap-1',
                className
            )}
            role="group"
            aria-label={ariaLabel}
        >
            {/* Grid View Button */}
            <button
                onClick={() => onChange('grid')}
                className={cn(
                    'inline-flex items-center justify-center',
                    'rounded-md px-3 py-2',
                    'text-[var(--text-sm)] font-medium',
                    'transition-all duration-[var(--transition-normal)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',

                    // Active state
                    value === 'grid' && [
                        'bg-brand text-white shadow-sm',
                    ],

                    // Inactive state
                    value !== 'grid' && [
                        'text-muted-foreground hover:text-foreground',
                        'hover:bg-muted/50',
                    ]
                )}
                aria-label="Grid view"
                aria-pressed={value === 'grid'}
                type="button"
            >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                <span className="ml-2 hidden sm:inline">Grid</span>
            </button>

            {/* List View Button */}
            <button
                onClick={() => onChange('list')}
                className={cn(
                    'inline-flex items-center justify-center',
                    'rounded-md px-3 py-2',
                    'text-[var(--text-sm)] font-medium',
                    'transition-all duration-[var(--transition-normal)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',

                    // Active state
                    value === 'list' && [
                        'bg-brand text-white shadow-sm',
                    ],

                    // Inactive state
                    value !== 'list' && [
                        'text-muted-foreground hover:text-foreground',
                        'hover:bg-muted/50',
                    ]
                )}
                aria-label="List view"
                aria-pressed={value === 'list'}
                type="button"
            >
                <List className="h-4 w-4" aria-hidden="true" />
                <span className="ml-2 hidden sm:inline">List</span>
            </button>
        </div>
    );
}
