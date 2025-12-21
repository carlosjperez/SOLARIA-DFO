import { User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface GanttRowProps {
    task: Task;
    startDate: Date;
    endDate: Date;
    onClick?: () => void;
}

const statusColors = {
    pending: 'gantt-bar-pending',
    in_progress: 'gantt-bar-in_progress',
    review: 'gantt-bar-review',
    completed: 'gantt-bar-completed',
    blocked: 'gantt-bar-blocked',
};

export function GanttRow({
    task,
    startDate,
    endDate,
    onClick,
}: GanttRowProps) {
    // Calculate position and width
    const taskStart = task.createdAt ? new Date(task.createdAt) : startDate;
    const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(taskStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const viewStartMs = startDate.getTime();
    const viewEndMs = endDate.getTime();
    const viewRangeMs = viewEndMs - viewStartMs;

    // Clamp task dates to view range
    const clampedStart = Math.max(taskStart.getTime(), viewStartMs);
    const clampedEnd = Math.min(taskEnd.getTime(), viewEndMs);

    // Calculate percentages
    const leftPercent = ((clampedStart - viewStartMs) / viewRangeMs) * 100;
    const widthPercent = ((clampedEnd - clampedStart) / viewRangeMs) * 100;

    // Only render if visible
    if (widthPercent <= 0 || leftPercent >= 100) {
        return (
            <div className="gantt-row" onClick={onClick}>
                <div className="gantt-row-info">
                    <span className="gantt-task-code">{task.taskCode || `#${task.taskNumber}`}</span>
                    <span className="gantt-task-title">{task.title}</span>
                </div>
                <div className="gantt-row-timeline">
                    <div className="gantt-bar-empty">
                        Fuera del rango visible
                    </div>
                </div>
            </div>
        );
    }

    const progress = task.progress || 0;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

    return (
        <div className={cn('gantt-row', onClick && 'clickable')} onClick={onClick}>
            {/* Task info column */}
            <div className="gantt-row-info">
                <span className="gantt-task-code">{task.taskCode || `#${task.taskNumber}`}</span>
                <span className="gantt-task-title">{task.title}</span>
                {task.agentName && (
                    <span className="gantt-task-agent">
                        <User className="h-3 w-3" />
                        {task.agentName.split('-').pop()}
                    </span>
                )}
            </div>

            {/* Timeline column */}
            <div className="gantt-row-timeline">
                <div
                    className={cn(
                        'gantt-bar',
                        statusColors[task.status],
                        isOverdue && 'overdue'
                    )}
                    style={{
                        left: `${Math.max(0, leftPercent)}%`,
                        width: `${Math.min(widthPercent, 100 - leftPercent)}%`,
                    }}
                >
                    {/* Progress fill */}
                    <div
                        className="gantt-bar-progress"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Bar content */}
                    <div className="gantt-bar-content">
                        {widthPercent > 10 && (
                            <span className="gantt-bar-label">
                                {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
                            </span>
                        )}
                        {isOverdue && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GanttRow;
