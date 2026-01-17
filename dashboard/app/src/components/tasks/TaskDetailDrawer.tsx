import { useState } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Flag,
    Tag,
    FileText,
    CheckCircle2,
    AlertCircle,
    Edit3,
    Save,
    Loader2,
    ExternalLink,
    MessageSquare,
    Plus,
    X as XIcon,
} from 'lucide-react';
import { useTask, useUpdateTask } from '@/hooks/useApi';
import { TaskItemsList } from './TaskItemsList';
import { cn, formatRelativeTime, formatDate } from '@/lib/utils';
import type { Task } from '@/types';
import { api } from '@/lib/api';

interface TaskDetailDrawerProps {
    taskId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onNavigateToProject?: (projectId: number) => void;
}

const statusConfig = {
    pending: { label: 'Pendiente', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    in_progress: { label: 'En Progreso', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    review: { label: 'En Revision', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    completed: { label: 'Completada', color: 'text-green-500', bg: 'bg-green-500/10' },
    blocked: { label: 'Bloqueada', color: 'text-red-500', bg: 'bg-red-500/10' },
};

const priorityConfig = {
    critical: { label: 'Critica', color: 'text-red-500', bg: 'bg-red-500/10' },
    high: { label: 'Alta', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    medium: { label: 'Media', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    low: { label: 'Baja', color: 'text-green-500', bg: 'bg-green-500/10' },
};

const typeConfig = {
    feature: { label: 'Feature', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    bug: { label: 'Bug', color: 'text-red-500', bg: 'bg-red-500/10' },
    enhancement: { label: 'Mejora', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    documentation: { label: 'Documentacion', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    research: { label: 'Investigacion', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    maintenance: { label: 'Mantenimiento', color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

function isColorDark(hexColor: string): boolean {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

export function TaskDetailDrawer({
    taskId,
    isOpen,
    onClose,
    onNavigateToProject,
}: TaskDetailDrawerProps) {
    const { data: task, isLoading } = useTask(taskId || 0);
    const updateTask = useUpdateTask();

    const [isEditing, setIsEditing] = useState(false);
    const [editedNotes, setEditedNotes] = useState('');
    const [editedStatus, setEditedStatus] = useState<Task['status'] | ''>('');
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [isAddingTag, setIsAddingTag] = useState(false);

    useState(() => {
        const fetchTags = async () => {
            if (isOpen && task) {
                setIsLoadingTags(true);
                try {
                    const response = await api.get('/tags');
                    setAvailableTags(response.data?.data?.tags || []);
                } catch (error) {
                    console.error('Error fetching tags:', error);
                } finally {
                    setIsLoadingTags(false);
                }
            }
        };
        fetchTags();
    }, [isOpen, task?.id]);

    if (!isOpen) return null;

    const handleStartEdit = () => {
        if (task) {
            setEditedNotes(task.notes || '');
            setEditedStatus(task.status);
            setIsEditing(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!task) return;

        await updateTask.mutateAsync({
            id: task.id,
            data: {
                notes: editedNotes,
                status: editedStatus || undefined,
            },
        });
        setIsEditing(false);
    };

    const handleStatusChange = async (newStatus: Task['status']) => {
        if (!task) return;
        await updateTask.mutateAsync({
            id: task.id,
            data: { status: newStatus },
        });
    };

    const handleAddTag = async (tagId: number) => {
        if (!task) return;
        setIsAddingTag(true);
        try {
            await api.post(`/tasks/${task.id}/tags`, { tag_id: tagId });
            window.location.reload();
        } catch (error) {
            console.error('Error adding tag:', error);
        } finally {
            setIsAddingTag(false);
        }
    };

    const handleRemoveTag = async (tagId: number) => {
        if (!task) return;
        try {
            await api.delete(`/tasks/${task.id}/tags/${tagId}`);
            window.location.reload();
        } catch (error) {
            console.error('Error removing tag:', error);
        }
    };

    const status = task ? statusConfig[task.status] : statusConfig.pending;
    const priority = task ? priorityConfig[task.priority] : priorityConfig.medium;
    const type = task ? typeConfig[task.type] : typeConfig.feature;
    const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    const itemsTotal = task?.itemsTotal || 0;
    const itemsCompleted = task?.itemsCompleted || 0;
    const progress = itemsTotal > 0 ? Math.round((itemsCompleted / itemsTotal) * 100) : task?.progress || 0;

    return (
        <div className="drawer-container">
            {/* Overlay */}
            <div
                className={cn('drawer-overlay', isOpen && 'active')}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={cn('drawer-panel max-w-xl', isOpen && 'active')}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : task ? (
                    <>
                        {/* Header */}
                        <div className="drawer-header">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn('task-badge', type.bg, type.color)}>
                                        {type.label}
                                    </span>
                                    <span className="task-code">
                                        {task.taskCode || `#${task.taskNumber}`}
                                    </span>
                                </div>
                                <h2 className="drawer-title">{task.title}</h2>
                                {task.projectName && (
                                    <button
                                        onClick={() => onNavigateToProject?.(task.projectId)}
                                        className="drawer-subtitle flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                        {task.projectCode || task.projectName}
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <button onClick={onClose} className="drawer-close">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="drawer-content">
                            {/* Status and Priority row */}
                            <div className="task-detail-section">
                                <div className="task-detail-row">
                                    <div className="task-detail-label">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Estado
                                    </div>
                                    <div className="task-detail-value">
                                        {isEditing ? (
                                            <select
                                                value={editedStatus}
                                                onChange={(e) => setEditedStatus(e.target.value as Task['status'])}
                                                className="task-detail-select"
                                            >
                                                {Object.entries(statusConfig).map(([key, cfg]) => (
                                                    <option key={key} value={key}>
                                                        {cfg.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={cn('status-badge', status.bg, status.color)}>
                                                    {status.label}
                                                </span>
                                                {/* Quick status buttons */}
                                                <div className="task-status-actions">
                                                    {task.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusChange('in_progress')}
                                                            className="status-action-btn in_progress"
                                                        >
                                                            Iniciar
                                                        </button>
                                                    )}
                                                    {task.status === 'in_progress' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange('review')}
                                                                className="status-action-btn review"
                                                            >
                                                                A Revision
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange('completed')}
                                                                className="status-action-btn completed"
                                                            >
                                                                Completar
                                                            </button>
                                                        </>
                                                    )}
                                                    {task.status === 'review' && (
                                                        <button
                                                            onClick={() => handleStatusChange('completed')}
                                                            className="status-action-btn completed"
                                                        >
                                                            Aprobar
                                                        </button>
                                )}

                                {task?.tags && task.tags.length > 0 && (
                                    <div className="task-detail-section">
                                        <div className="task-detail-section-title">
                                            <Tag className="h-4 w-4" />
                                            Etiquetas
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {task.tags.map((tag: any) => {
                                                const isDark = tag.color && isColorDark(tag.color);
                                                return (
                                                    <div
                                                        key={tag.id}
                                                        className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full"
                                                        style={{
                                                            backgroundColor: tag.color || '#3b82f6',
                                                            color: isDark ? '#ffffff' : '#1f2937'
                                                        }}
                                                    >
                                                        <span>{tag.display_name || tag.tag_name}</span>
                                                        <button
                                                            onClick={() => handleRemoveTag(tag.id)}
                                                            className="hover:opacity-70 transition-opacity"
                                                        >
                                                            <XIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {!isLoadingTags && availableTags.length > 0 && (
                                            <div>
                                                <label className="text-xs text-muted-foreground mb-2 block">
                                                    Agregar etiqueta:
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableTags
                                                        .filter((tag: any) => !task?.tags?.some((t: any) => t.id === tag.id))
                                                        .map((tag: any) => {
                                                            const isDark = tag.color && isColorDark(tag.color);
                                                            return (
                                                                <button
                                                                    key={tag.id}
                                                                    onClick={() => handleAddTag(tag.id)}
                                                                    disabled={isAddingTag}
                                                                    className="text-xs font-medium px-3 py-1 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    style={{
                                                                        backgroundColor: tag.color || '#3b82f6',
                                                                        color: isDark ? '#ffffff' : '#1f2937'
                                                                    }}
                                                                >
                                                                    <Plus className="h-3 w-3 inline mr-1" />
                                                                    {tag.display_name || tag.tag_name}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="task-detail-row">
                                    <div className="task-detail-label">
                                        <Flag className="h-4 w-4" />
                                        Prioridad
                                    </div>
                                    <div className="task-detail-value">
                                        <span className={cn('priority-badge', priority.bg, priority.color)}>
                                            {priority.label}
                                        </span>
                                    </div>
                                </div>

                                {task.agentName && (
                                    <div className="task-detail-row">
                                        <div className="task-detail-label">
                                            <User className="h-4 w-4" />
                                            Asignado
                                        </div>
                                        <div className="task-detail-value">
                                            <div className="task-assignee-full">
                                                <div className="task-assignee-avatar-lg">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span>{task.agentName}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {task.dueDate && (
                                    <div className="task-detail-row">
                                        <div className="task-detail-label">
                                            <Calendar className="h-4 w-4" />
                                            Fecha limite
                                        </div>
                                        <div className={cn('task-detail-value', isOverdue && 'text-red-500')}>
                                            {formatDate(task.dueDate)}
                                            {isOverdue && (
                                                <span className="ml-2 text-xs">
                                                    <AlertCircle className="h-3 w-3 inline" /> Vencida
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(task.estimatedHours || task.actualHours) && (
                                    <div className="task-detail-row">
                                        <div className="task-detail-label">
                                            <Clock className="h-4 w-4" />
                                            Tiempo
                                        </div>
                                        <div className="task-detail-value">
                                            {task.actualHours ? (
                                                <span>
                                                    {task.actualHours}h / {task.estimatedHours}h est.
                                                </span>
                                            ) : (
                                                <span>{task.estimatedHours}h estimadas</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Progress section */}
                            <div className="task-detail-section">
                                <div className="task-detail-section-title">
                                    <Tag className="h-4 w-4" />
                                    Progreso
                                </div>
                                <div className="task-progress-display">
                                    <div className="task-progress-bar-lg">
                                        <div
                                            className={cn(
                                                'task-progress-fill-lg',
                                                progress === 100 && 'complete'
                                            )}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="task-progress-label">{progress}%</span>
                                </div>
                            </div>

                            {/* Description */}
                            {task.description && (
                                <div className="task-detail-section">
                                    <div className="task-detail-section-title">
                                        <FileText className="h-4 w-4" />
                                        Descripcion
                                    </div>
                                    <p className="task-description-full">{task.description}</p>
                                </div>
                            )}

                            {/* Subtasks */}
                            <div className="task-detail-section">
                                <TaskItemsList
                                    taskId={task.id}
                                    editable={task.status !== 'completed'}
                                    showAddForm={task.status !== 'completed'}
                                />
                            </div>

                            {/* Notes */}
                            <div className="task-detail-section">
                                <div className="task-detail-section-header">
                                    <div className="task-detail-section-title">
                                        <MessageSquare className="h-4 w-4" />
                                        Notas
                                    </div>
                                    {!isEditing && (
                                        <button onClick={handleStartEdit} className="edit-btn">
                                            <Edit3 className="h-3 w-3" />
                                            Editar
                                        </button>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className="task-notes-edit">
                                        <textarea
                                            value={editedNotes}
                                            onChange={(e) => setEditedNotes(e.target.value)}
                                            placeholder="Agregar notas..."
                                            className="task-notes-textarea"
                                            rows={4}
                                        />
                                        <div className="task-notes-actions">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="cancel-btn"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={updateTask.isPending}
                                                className="save-btn"
                                            >
                                                {updateTask.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Save className="h-3 w-3" />
                                                        Guardar
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : task.notes ? (
                                    <p className="task-notes-content">{task.notes}</p>
                                ) : (
                                    <p className="task-notes-empty">Sin notas</p>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="task-detail-meta">
                                <span>Creada {formatRelativeTime(task.createdAt)}</span>
                                <span className="meta-separator">•</span>
                                <span>Actualizada {formatRelativeTime(task.updatedAt)}</span>
                                {task.completedAt && (
                                    <>
                                        <span className="meta-separator">•</span>
                                        <span className="text-green-500">
                                            Completada {formatRelativeTime(task.completedAt)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Tarea no encontrada
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskDetailDrawer;
