import { LayoutGrid, List, Columns3 } from 'lucide-react';
import { cn } from '@lib/utils';

export type ViewMode = 'cards' | 'list' | 'kanban';

interface ViewToggleProps {
    /** Current view mode */
    view: ViewMode;
    /** Callback when view changes */
    onChange: (view: ViewMode) => void;
    /** Available view options (defaults to cards and list) */
    options?: ViewMode[];
    /** Additional classes */
    className?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

const VIEW_ICONS: Record<ViewMode, typeof LayoutGrid> = {
    cards: LayoutGrid,
    list: List,
    kanban: Columns3,
};

const VIEW_LABELS: Record<ViewMode, string> = {
    cards: 'Tarjetas',
    list: 'Lista',
    kanban: 'Kanban',
};

const SIZE_CLASSES = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
};

const ICON_SIZES = {
    sm: 14,
    md: 18,
    lg: 22,
};

/**
 * Toggle button group for switching between view modes
 *
 * @example
 * // Basic usage with cards and list
 * <ViewToggle view={view} onChange={setView} />
 *
 * @example
 * // With kanban option
 * <ViewToggle
 *   view={view}
 *   onChange={setView}
 *   options={['cards', 'list', 'kanban']}
 * />
 */
export function ViewToggle({
    view,
    onChange,
    options = ['cards', 'list'],
    className,
    size = 'md',
}: ViewToggleProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center bg-gray-100 rounded-lg p-1',
                className
            )}
            role="tablist"
            aria-label="Cambiar vista"
        >
            {options.map((mode) => {
                const Icon = VIEW_ICONS[mode];
                const isActive = view === mode;

                return (
                    <button
                        key={mode}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={VIEW_LABELS[mode]}
                        title={VIEW_LABELS[mode]}
                        onClick={() => onChange(mode)}
                        className={cn(
                            'rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-solaria-orange focus:ring-offset-1',
                            SIZE_CLASSES[size],
                            isActive
                                ? 'bg-white text-solaria-orange shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        )}
                    >
                        <Icon size={ICON_SIZES[size]} />
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Hook for managing view toggle state with localStorage persistence
 */
export function useViewToggle(key: string, defaultView: ViewMode = 'cards') {
    const storedView = localStorage.getItem(`view-${key}`) as ViewMode | null;
    const initialView = storedView || defaultView;

    const setView = (view: ViewMode) => {
        localStorage.setItem(`view-${key}`, view);
    };

    return { view: initialView, setView };
}

export default ViewToggle;
