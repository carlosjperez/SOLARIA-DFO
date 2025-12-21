import { useState } from 'react';
import { Check, Clock, GripVertical, Loader2 } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { TaskItem } from '@/types';

interface TaskItemRowProps {
    item: TaskItem;
    onComplete: (itemId: number, notes?: string, actualMinutes?: number) => Promise<void>;
    disabled?: boolean;
    showDragHandle?: boolean;
}

export function TaskItemRow({
    item,
    onComplete,
    disabled = false,
    showDragHandle = false,
}: TaskItemRowProps) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [actualMinutes, setActualMinutes] = useState(item.estimatedMinutes || 0);

    const handleComplete = async () => {
        if (item.isCompleted || disabled || isCompleting) return;

        // If we want to show notes input first
        if (!showNotes && item.estimatedMinutes) {
            setShowNotes(true);
            return;
        }

        setIsCompleting(true);
        try {
            await onComplete(item.id, notes || undefined, actualMinutes || undefined);
        } finally {
            setIsCompleting(false);
            setShowNotes(false);
        }
    };

    const handleQuickComplete = async () => {
        if (item.isCompleted || disabled || isCompleting) return;
        setIsCompleting(true);
        try {
            await onComplete(item.id);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className={cn('task-item-row', item.isCompleted && 'completed')}>
            {/* Drag handle */}
            {showDragHandle && (
                <div className="task-item-handle">
                    <GripVertical className="h-4 w-4" />
                </div>
            )}

            {/* Checkbox */}
            <button
                onClick={handleQuickComplete}
                disabled={item.isCompleted || disabled || isCompleting}
                className={cn(
                    'task-item-checkbox',
                    item.isCompleted && 'checked',
                    isCompleting && 'loading'
                )}
            >
                {isCompleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : item.isCompleted ? (
                    <Check className="h-3 w-3" />
                ) : null}
            </button>

            {/* Content */}
            <div className="task-item-content">
                <span className={cn('task-item-title', item.isCompleted && 'completed')}>
                    {item.title}
                </span>

                {item.description && (
                    <span className="task-item-description">{item.description}</span>
                )}

                {/* Notes input when completing */}
                {showNotes && !item.isCompleted && (
                    <div className="task-item-complete-form">
                        <input
                            type="number"
                            value={actualMinutes}
                            onChange={(e) => setActualMinutes(Number(e.target.value))}
                            placeholder="Minutos reales"
                            className="task-item-minutes-input"
                            min={0}
                        />
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas (opcional)"
                            className="task-item-notes-input"
                        />
                        <button
                            onClick={handleComplete}
                            disabled={isCompleting}
                            className="task-item-complete-btn"
                        >
                            {isCompleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Completar'}
                        </button>
                        <button
                            onClick={() => setShowNotes(false)}
                            className="task-item-cancel-btn"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            {/* Time info */}
            <div className="task-item-time">
                {item.isCompleted && item.completedAt ? (
                    <span className="task-item-completed-at">
                        <Check className="h-3 w-3" />
                        {formatRelativeTime(item.completedAt)}
                    </span>
                ) : item.estimatedMinutes ? (
                    <span className="task-item-estimate">
                        <Clock className="h-3 w-3" />
                        {item.estimatedMinutes}m
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export default TaskItemRow;
