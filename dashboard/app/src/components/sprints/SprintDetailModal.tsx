import {
    Zap,
    Calendar,
    Clock,
    Hash,
    ListChecks,
    CheckCircle2,
    Loader2,
    CircleDot,
    Circle,
    Target,
    TrendingUp,
    Timer,
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
import { useSprint } from '@/hooks/useApi';
import { cn, formatDate } from '@/lib/utils';
import type { Task } from '@/types';

const STATUS_CONFIG = {
    planned: { label: 'Planificado', bg: 'bg-blue-500/10', color: 'text-blue-600', icon: Circle },
    active: { label: 'Activo', bg: 'bg-green-500/10', color: 'text-green-600', icon: CircleDot },
    completed: { label: 'Completado', bg: 'bg-gray-500/10', color: 'text-gray-600', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', bg: 'bg-red-500/10', color: 'text-red-600', icon: Circle },
} as const;

const PRIORITY_CONFIG = {
    critical: { label: 'Crítico', color: 'text-red-500' },
    high: { label: 'Alto', color: 'text-orange-500' },
    medium: { label: 'Medio', color: 'text-yellow-500' },
    low: { label: 'Bajo', color: 'text-blue-500' },
} as const;

interface SprintDetailModalProps {
    sprintId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onTaskClick?: (taskId: number) => void;
}

export function SprintDetailModal({
    sprintId,
    isOpen,
    onClose,
    onTaskClick,
}: SprintDetailModalProps) {
    const shouldFetch = isOpen && sprintId !== null && sprintId > 0;
    const { data, isLoading } = useSprint(shouldFetch ? sprintId : null);

    const sprint = data?.sprint;
    const tasks = data?.tasks || [];
    const statusConfig = sprint ? STATUS_CONFIG[sprint.status as keyof typeof STATUS_CONFIG] : null;

    // Calculate progress (snake_case from API, but may be camelCase after transform)
    const tasksCount = (sprint as any)?.tasksCount || (sprint as any)?.tasks_count || 0;
    const tasksCompleted = (sprint as any)?.tasksCompleted || (sprint as any)?.tasks_completed || 0;
    const progressPercent = tasksCount > 0 ? Math.round((tasksCompleted / tasksCount) * 100) : 0;

    // Calculate days remaining
    const getDaysRemaining = () => {
        if (!sprint?.endDate) return null;
        const end = new Date(sprint.endDate).getTime();
        const now = Date.now();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const daysRemaining = getDaysRemaining();

    // Calculate timeline progress
    const getTimelineProgress = () => {
        if (!sprint?.startDate || !sprint?.endDate) return null;
        const start = new Date(sprint.startDate).getTime();
        const end = new Date(sprint.endDate).getTime();
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
                ) : sprint ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-start gap-3 pr-8">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                    <Zap className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base">
                                        {sprint.name}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Hash className="h-3 w-3" />
                                        <span className="font-mono">SPRINT-{String(sprint.id).padStart(3, '0')}</span>
                                        <span className="text-border">|</span>
                                        <span>{(sprint as any).projectName || (sprint as any).project_name || (sprint as any).projectCode || (sprint as any).project_code}</span>
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
                                {sprint.status === 'active' && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white animate-pulse">
                                        ACTIVO
                                    </div>
                                )}

                                {/* Tasks count */}
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <ListChecks className="h-3 w-3" />
                                    <span>{tasksCompleted}/{tasksCount} tareas</span>
                                </div>

                                {/* Days remaining */}
                                {daysRemaining !== null && sprint.status === 'active' && (
                                    <div className={cn(
                                        "flex items-center gap-1.5",
                                        daysRemaining < 0 ? "text-red-500" :
                                        daysRemaining <= 3 ? "text-orange-500" : "text-muted-foreground"
                                    )}>
                                        <Timer className="h-3 w-3" />
                                        <span>
                                            {daysRemaining < 0
                                                ? `${Math.abs(daysRemaining)}d vencido`
                                                : `${daysRemaining}d restantes`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Metrics Row */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* Velocity */}
                                {sprint.velocity !== null && sprint.velocity !== undefined && (
                                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                            <TrendingUp className="h-3 w-3" />
                                            Velocidad
                                        </div>
                                        <div className="text-lg font-semibold">{sprint.velocity}</div>
                                        <div className="text-xs text-muted-foreground">puntos</div>
                                    </div>
                                )}

                                {/* Capacity */}
                                {sprint.capacity !== null && sprint.capacity !== undefined && (
                                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                            <Clock className="h-3 w-3" />
                                            Capacidad
                                        </div>
                                        <div className="text-lg font-semibold">{sprint.capacity}</div>
                                        <div className="text-xs text-muted-foreground">horas</div>
                                    </div>
                                )}

                                {/* Estimated Hours */}
                                {(((sprint as any).totalEstimatedHours ?? (sprint as any).total_estimated_hours) !== null) && (
                                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                            <Target className="h-3 w-3" />
                                            Estimado
                                        </div>
                                        <div className="text-lg font-semibold">{(sprint as any).totalEstimatedHours || (sprint as any).total_estimated_hours}</div>
                                        <div className="text-xs text-muted-foreground">horas</div>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Section */}
                            {(sprint.startDate || sprint.endDate) && (
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
                                            <span>Inicio: {sprint.startDate ? formatDate(sprint.startDate) : '-'}</span>
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <div className="flex items-center gap-1.5">
                                            <Target className="h-3 w-3 text-muted-foreground" />
                                            <span>Fin: {sprint.endDate ? formatDate(sprint.endDate) : '-'}</span>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="space-y-1">
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-green-500 transition-all"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progreso: {progressPercent}%</span>
                                            <span>{tasksCompleted} completadas</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Goal Section */}
                            {sprint.goal && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Meta del Sprint
                                    </h4>
                                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                                        <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                                            {sprint.goal}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Sprint Backlog */}
                            {tasks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <ListChecks className="h-4 w-4" />
                                        Backlog del Sprint ({tasks.length})
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
                        Sprint no encontrado
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
