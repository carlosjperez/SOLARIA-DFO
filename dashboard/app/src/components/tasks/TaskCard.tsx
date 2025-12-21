import {
    Calendar,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Flag,
    MessageSquare,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
    showProject?: boolean;
    compact?: boolean;
}

const priorityConfig = {
    critical: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Critica' },
    high: { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Alta' },
    medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Media' },
    low: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Baja' },
};

const typeConfig = {
    feature: { color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Feature' },
    bug: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Bug' },
    enhancement: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Mejora' },
    documentation: { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Docs' },
    research: { color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Research' },
    maintenance: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Maint.' },
};

export function TaskCard({ task, onClick, showProject = false, compact = false }: TaskCardProps) {
    const priority = priorityConfig[task.priority] || priorityConfig.medium;
    const type = typeConfig[task.type] || typeConfig.feature;
    const itemsTotal = task.itemsTotal || 0;
    const itemsCompleted = task.itemsCompleted || 0;
    const itemsProgress = itemsTotal > 0 ? Math.round((itemsCompleted / itemsTotal) * 100) : 0;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

    if (compact) {
        return (
            <div
                onClick={onClick}
                className="task-card-compact"
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn('task-badge', type.bg, type.color)}>{type.label}</span>
                    <span className="task-code">{task.taskCode || `#${task.taskNumber}`}</span>
                </div>
                <div className="task-title-compact">{task.title}</div>
                {itemsTotal > 0 && (
                    <div className="task-progress-mini">
                        <div className="task-progress-bar-mini">
                            <div
                                className="task-progress-fill-mini"
                                style={{ width: `${itemsProgress}%` }}
                            />
                        </div>
                        <span className="task-progress-text-mini">{itemsCompleted}/{itemsTotal}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'task-card',
                task.status === 'blocked' && 'blocked',
                isOverdue && 'overdue'
            )}
        >
            {/* Header with badges */}
            <div className="task-card-header">
                <div className="task-badges">
                    <span className={cn('task-badge', type.bg, type.color)}>{type.label}</span>
                    <span className={cn('task-badge', priority.bg, priority.color)}>
                        <Flag className="h-3 w-3" />
                        {priority.label}
                    </span>
                </div>
                <span className="task-code">{task.taskCode || `#${task.taskNumber}`}</span>
            </div>

            {/* Project name if shown */}
            {showProject && task.projectName && (
                <div className="task-project-label">
                    {task.projectCode || task.projectName}
                </div>
            )}

            {/* Title */}
            <h4 className="task-card-title">{task.title}</h4>

            {/* Description preview */}
            {task.description && (
                <p className="task-card-description">{task.description}</p>
            )}

            {/* Progress bar for items */}
            {itemsTotal > 0 && (
                <div className="task-items-progress">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Subtareas
                        </span>
                        <span className="text-xs font-medium">
                            {itemsCompleted}/{itemsTotal}
                        </span>
                    </div>
                    <div className="task-progress-bar">
                        <div
                            className={cn(
                                'task-progress-fill',
                                itemsProgress === 100 && 'complete'
                            )}
                            style={{ width: `${itemsProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer with metadata */}
            <div className="task-card-footer">
                {/* Due date */}
                {task.dueDate && (
                    <div className={cn('task-meta', isOverdue && 'text-red-500')}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatRelativeTime(task.dueDate)}</span>
                    </div>
                )}

                {/* Estimated hours */}
                {task.estimatedHours && (
                    <div className="task-meta">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedHours}h</span>
                    </div>
                )}

                {/* Notes indicator */}
                {task.notes && (
                    <div className="task-meta">
                        <MessageSquare className="h-3 w-3" />
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Assigned agent */}
                {task.agentName && (
                    <div className="task-assignee">
                        <div className="task-assignee-avatar">
                            <User className="h-3 w-3" />
                        </div>
                        <span className="task-assignee-name">{task.agentName.split('-').pop()}</span>
                    </div>
                )}

                {/* Blocked indicator */}
                {task.status === 'blocked' && (
                    <div className="task-blocked-badge">
                        <AlertCircle className="h-3 w-3" />
                        Bloqueado
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
