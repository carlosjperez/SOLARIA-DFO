import { SearchInput, type SearchInputProps } from './SearchInput';
import { ItemCounter, type ItemCounterProps } from './ItemCounter';
import { ViewSelector, type ViewSelectorProps } from './ViewSelector';
import { SortBar, type SortBarProps } from './SortBar';
import { FilterBar, type FilterBarProps } from './FilterBar';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * SearchAndFilterBar Props Interface
 *
 * Combines all props from child components with optional overrides.
 */
export interface SearchAndFilterBarProps {
    // SearchInput props
    searchValue?: SearchInputProps['value'];
    onSearchChange: SearchInputProps['onChange'];
    searchPlaceholder?: SearchInputProps['placeholder'];
    searchDebounceMs?: SearchInputProps['debounceMs'];
    searchDisabled?: SearchInputProps['disabled'];
    searchAutoFocus?: SearchInputProps['autoFocus'];

    // ItemCounter props
    itemCount: ItemCounterProps['count'];
    itemSingularLabel?: ItemCounterProps['singularLabel'];
    itemPluralLabel?: ItemCounterProps['pluralLabel'];

    // ViewSelector props (optional - may not always be needed)
    viewValue?: ViewSelectorProps['value'];
    onViewChange?: ViewSelectorProps['onChange'];
    showViewSelector?: boolean;

    // SortBar props (optional - may not always be needed)
    sortValue?: SortBarProps['value'];
    onSortChange?: SortBarProps['onChange'];
    sortOptions?: SortBarProps['options'];
    sortDisabled?: SortBarProps['disabled'];
    showSortBar?: boolean;

    // FilterBar props (optional - rendered only when filters exist)
    filterChildren?: FilterBarProps['children'];
    onClearAllFilters?: FilterBarProps['onClearAll'];
    showClearAllFilters?: FilterBarProps['showClearAll'];
    filterEmptyMessage?: FilterBarProps['emptyMessage'];
    showFilterBar?: boolean;

    // Layout and styling
    className?: string;
    variant?: 'default' | 'compact';

    // Accessibility
    ariaLabel?: string;
}

/**
 * SearchAndFilterBar Component
 *
 * Composition component that integrates SearchInput, ItemCounter, ViewSelector,
 * SortBar, and FilterBar into a responsive layout.
 *
 * **Layout Breakpoints:**
 * - **Desktop (lg+)**: Horizontal layout with all controls in one row
 * - **Tablet (md-lg)**: Two rows - top controls / filters below
 * - **Mobile (sm)**: Stacked vertical layout with collapsible sections
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const [view, setView] = useState<ViewType>('grid');
 * const [sort, setSort] = useState<SortConfig>({ field: 'name', direction: 'asc' });
 *
 * <SearchAndFilterBar
 *   // Search
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   searchPlaceholder="Search tasks..."
 *
 *   // Counter
 *   itemCount={42}
 *   itemSingularLabel="task"
 *   itemPluralLabel="tasks"
 *
 *   // View
 *   viewValue={view}
 *   onViewChange={setView}
 *
 *   // Sort
 *   sortValue={sort}
 *   onSortChange={setSort}
 *   sortOptions={[
 *     { value: 'name', label: 'Name' },
 *     { value: 'priority', label: 'Priority' }
 *   ]}
 *
 *   // Filters
 *   filterChildren={<FilterGroup title="Status">...</FilterGroup>}
 *   onClearAllFilters={handleClearFilters}
 * />
 * ```
 */
export function SearchAndFilterBar({
    // Search props
    searchValue = '',
    onSearchChange,
    searchPlaceholder,
    searchDebounceMs,
    searchDisabled,
    searchAutoFocus,

    // Counter props
    itemCount,
    itemSingularLabel,
    itemPluralLabel,

    // View props
    viewValue,
    onViewChange,
    showViewSelector = true,

    // Sort props
    sortValue,
    onSortChange,
    sortOptions,
    sortDisabled,
    showSortBar = true,

    // Filter props
    filterChildren,
    onClearAllFilters,
    showClearAllFilters,
    filterEmptyMessage,
    showFilterBar = true,

    // Layout
    className,
    variant = 'default',

    // Accessibility
    ariaLabel = 'Search and filter controls',
}: SearchAndFilterBarProps) {
    // Determine if we should show each component
    const hasView = showViewSelector && viewValue && onViewChange;
    const hasSort = showSortBar && sortValue && onSortChange && sortOptions && sortOptions.length > 0;
    const hasFilters = showFilterBar && Boolean(filterChildren);

    return (
        <div
            className={cn(
                'flex flex-col gap-4 w-full',
                className
            )}
            role="search"
            aria-label={ariaLabel}
        >
            {/* Main Controls Row */}
            <div
                className={cn(
                    'flex items-center gap-4 w-full',
                    // Responsive layout
                    'flex-col sm:flex-row',
                    // Compact variant
                    variant === 'compact' && 'gap-2'
                )}
            >
                {/* Search Input - takes available space */}
                <div className="w-full sm:flex-1">
                    <SearchInput
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                        debounceMs={searchDebounceMs}
                        disabled={searchDisabled}
                        autoFocus={searchAutoFocus}
                    />
                </div>

                {/* Right side controls - wrapped for responsive layout */}
                <div
                    className={cn(
                        'flex items-center gap-3 w-full sm:w-auto',
                        'flex-wrap sm:flex-nowrap justify-between sm:justify-end'
                    )}
                >
                    {/* Item Counter */}
                    <div className="shrink-0">
                        <ItemCounter
                            count={itemCount}
                            singularLabel={itemSingularLabel}
                            pluralLabel={itemPluralLabel}
                        />
                    </div>

                    {/* View Selector */}
                    {hasView && (
                        <div className="shrink-0">
                            <ViewSelector
                                value={viewValue}
                                onChange={onViewChange}
                            />
                        </div>
                    )}

                    {/* Sort Bar */}
                    {hasSort && (
                        <div className="shrink-0">
                            <SortBar
                                value={sortValue}
                                onChange={onSortChange}
                                options={sortOptions}
                                disabled={sortDisabled}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Bar - Second Row (conditional) */}
            {hasFilters && (
                <FilterBar
                    onClearAll={onClearAllFilters}
                    showClearAll={showClearAllFilters}
                    emptyMessage={filterEmptyMessage}
                >
                    {filterChildren}
                </FilterBar>
            )}
        </div>
    );
}
