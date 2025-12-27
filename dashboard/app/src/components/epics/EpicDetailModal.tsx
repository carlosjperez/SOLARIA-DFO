import {
    Target,
    Calendar,
    Clock,
    Hash,
    ListChecks,
    CheckCircle2,
    Loader2,
    CircleDot,
    Circle,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogBody,
    DialogFooter,
} from '@/components/ui/dialog';
import { useEpic } from '@/hooks/useApi';
import { cn, formatDate } from '@/lib/utils';
import type { Task } from '@/types';

const STATUS_CONFIG = {
    open: { label: 'Abierto', bg: 'bg-blue-500/10', color: 'text-blue-600', icon: Circle },
    in_progress: { label: 'En Progreso', bg: 'bg-purple-500/10', color: 'text-purple-600', icon: CircleDot },
    completed: { label: 'Completado', bg: 'bg-green-500/10', color: 'text-green-600', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', bg: 'bg-red-500/10', color: 'text-red-600', icon: Circle },
} as const;

const PRIORITY_CONFIG = {
    critical: { label: 'Crítico', color: 'text-red-500' },
    high: { label: 'Alto', color: 'text-orange-500' },
    medium: { label: 'Medio', color: 'text-yellow-500' },
    low: { label: 'Bajo', color: 'text-blue-500' },
} as const;

interface EpicDetailModalProps {
    epicId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onTaskClick?: (taskId: number) => void;
}

export function EpicDetailModal({
    epicId,
    isOpen,
    onClose,
    onTaskClick,
}: EpicDetailModalProps) {
    const shouldFetch = isOpen && epicId !== null && epicId > 0;
    const { data, isLoading } = useEpic(shouldFetch ? epicId : null);

    const epic = data?.epic;
    const tasks = data?.tasks || [];
    const statusConfig = epic ? STATUS_CONFIG[epic.status as keyof typeof STATUS_CONFIG] : null;

    // Calculate progress (snake_case from API, but may be camelCase after transform)
    const tasksCount = (epic as any)?.tasksCount || (epic as any)?.tasks_count || 0;
    const tasksCompleted = (epic as any)?.tasksCompleted || (epic as any)?.tasks_completed || 0;
    const progressPercent = tasksCount > 0 ? Math.round((tasksCompleted / tasksCount) * 100) : 0;

    // Calculate timeline progress
    const getTimelineProgress = () => {
        if (!epic?.startDate || !epic?.targetDate) return null;
        const start = new Date(epic.startDate).getTime();
        const end = new Date(epic.targetDate).getTime();
        const now = Date.now();

        if (now < start) return 0;
        if (now > end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    };

    const timelineProgress = getTimelineProgress();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogClose onClose={onClose} />

                {!shouldFetch ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : epic ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-start gap-3 pr-8">
                                {/* Color indicator */}
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: epic.color ? `${epic.color}20` : 'hsl(var(--muted))' }}
                                >
                                    <Target
                                        className="h-5 w-5"
                                        style={{ color: epic.color || 'hsl(var(--muted-foreground))' }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base">
                                        {epic.name}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Hash className="h-3 w-3" />
                                        <span className="font-mono">EPIC-{String(epic.id).padStart(3, '0')}</span>
                                        <span className="text-border">|</span>
                                        <span>{(epic as any).projectName || (epic as any).project_name || (epic as any).projectCode || (epic as any).project_code}</span>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <DialogBody className="flex-1 overflow-y-auto space-y-4">
                            {/* Status and Stats Row */}
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                                {/* Status Badge */}
                                {statusConfig && (
                                    <div
                                        className={cn(
                                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                            statusConfig.bg,
                                            statusConfig.color
                                        )}
                                    >
                                        <statusConfig.icon className="h-3 w-3" />
                                        <span>{statusConfig.label}</span>
                                    </div>
                                )}

                                {/* Active indicator */}
                                {epic.status === 'in_progress' && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500 text-white animate-pulse">
                                        ACTIVO
                                    </div>
                                )}

                                {/* Tasks count */}
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <ListChecks className="h-3 w-3" />
                                    <span>{tasksCompleted}/{tasksCount} tareas</span>
                                </div>
                            </div>

                            {/* Timeline Section */}
                            {(epic.startDate || epic.targetDate) && (
                                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Timeline</span>
                                        </div>
                                        {timelineProgress !== null && (
                                            <span className="text-xs text-muted-foreground">
                                                {timelineProgress}% del tiempo transcurrido
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span>Inicio: {epic.startDate ? formatDate(epic.startDate) : '-'}</span>
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <div className="flex items-center gap-1.5">
                                            <Target className="h-3 w-3 text-muted-foreground" />
                                            <span>Meta: {epic.targetDate ? formatDate(epic.targetDate) : '-'}</span>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="space-y-1">
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${progressPercent}%`,
                                                    backgroundColor: epic.color || 'hsl(var(--primary))'
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progreso: {progressPercent}%</span>
                                            <span>{tasksCompleted} completadas</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {epic.description && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Descripción</h4>
                                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                                        <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                                            {epic.description}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Tasks List */}
                            {tasks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <ListChecks className="h-4 w-4" />
                                        Tareas del Epic ({tasks.length})
                                    </h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {tasks.map((task: Task) => {
                                            const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
                                            const isCompleted = task.status === 'completed';
                                            return (
                                                <div
                                                    key={task.id}
                                                    onClick={() => onTaskClick?.(task.id)}
                                                    className={cn(
                                                        'flex items-center justify-between p-3 rounded-lg border border-border bg-card transition-colors',
                                                        onTaskClick && 'cursor-pointer hover:bg-muted/50',
                                                        isCompleted && 'opacity-60'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className={cn(
                                                                "text-sm font-medium truncate",
                                                                isCompleted && "line-through"
                                                            )}>
                                                                {task.title}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                {priorityConfig && (
                                                                    <span className={priorityConfig.color}>
                                                                        {priorityConfig.label}
                                                                    </span>
                                                                )}
                                                                {task.estimatedHours && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{task.estimatedHours}h est.</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {task.progress}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </DialogBody>

                        <DialogFooter>
                            <button
                                onClick={onClose}
                                className={cn(
                                    'px-4 py-2 rounded-md text-sm font-medium',
                                    'border border-border bg-background',
                                    'hover:bg-muted transition-colors'
                                )}
                            >
                                Cerrar
                            </button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="py-12 text-center text-muted-foreground">
                        Epic no encontrado
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
