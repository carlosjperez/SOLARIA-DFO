import { cn } from '@/lib/utils';

interface MiniTrelloProps {
    board: {
        backlog?: number;
        pending?: number;
        todo?: number;
        in_progress?: number;
        doing?: number;
        review?: number;
        completed?: number;
        done?: number;
        blocked?: number;
    };
    showLabels?: boolean;
    showCounts?: boolean;
    compact?: boolean;
    className?: string;
}

const COLUMNS = [
    { key: 'backlog', alt: 'pending', label: 'BL', fullLabel: 'BACKLOG', color: '#6b7280' },
    { key: 'todo', alt: 'pending', label: 'TD', fullLabel: 'TODO', color: '#f59e0b' },
    { key: 'doing', alt: 'in_progress', label: 'DO', fullLabel: 'DOING', color: '#3b82f6' },
    { key: 'done', alt: 'completed', label: 'DN', fullLabel: 'DONE', color: '#22c55e' },
];

const TOTAL_SLOTS = 8;

function TrelloColumn({
    label,
    fullLabel,
    count,
    color,
    showLabel = true,
    showCount = true,
    compact = false,
}: {
    label: string;
    fullLabel: string;
    count: number;
    color: string;
    showLabel?: boolean;
    showCount?: boolean;
    compact?: boolean;
}) {
    const filledCount = Math.min(count, TOTAL_SLOTS);
    const slots = [];

    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const isFilled = i < filledCount;
        slots.push(
            <div
                key={i}
                className={cn('trello-slot', isFilled && 'filled')}
                style={isFilled ? { background: color, borderColor: 'transparent' } : undefined}
            />
        );
    }

    return (
        <div className="trello-column">
            {showLabel && (
                <span className="trello-label">{compact ? label : fullLabel}</span>
            )}
            <div className="trello-slots">{slots}</div>
            {showCount && <span className="trello-count">{count}</span>}
        </div>
    );
}

export function MiniTrello({
    board,
    showLabels = true,
    showCounts = true,
    compact = false,
    className,
}: MiniTrelloProps) {
    // Map board values - API may use different keys
    const getCount = (col: typeof COLUMNS[0]) => {
        const primary = board[col.key as keyof typeof board] ?? 0;
        const alt = board[col.alt as keyof typeof board] ?? 0;
        return primary || alt;
    };

    return (
        <div className={cn('mini-trello', compact && 'compact', className)}>
            {COLUMNS.map((col) => (
                <TrelloColumn
                    key={col.key}
                    label={col.label}
                    fullLabel={col.fullLabel}
                    count={getCount(col)}
                    color={col.color}
                    showLabel={showLabels}
                    showCount={showCounts}
                    compact={compact}
                />
            ))}
        </div>
    );
}

export default MiniTrello;
