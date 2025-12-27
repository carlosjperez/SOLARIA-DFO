import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    GraduationCap,
    Edit,
    Info,
    Link2,
    CheckCircle2,
    Clock,
    Plus,
    Settings,
    ExternalLink,
    FileText,
    Send,
    Target,
    Zap,
    Trash2,
    X,
    CalendarDays,
} from 'lucide-react';
import {
    useProject,
    useProjectTasks,
    useProjectActivity,
    useCheckProjectCode,
    useUpdateProject,
    useProjectEpics,
    useProjectSprints,
    useCreateEpic,
    useDeleteEpic,
    useCreateSprint,
    useDeleteSprint,
} from '@/hooks/useApi';
import { Modal } from '@/components/common/Modal';
import { MiniTrello } from '@/components/common/MiniTrello';
import { EpicDetailModal } from '@/components/epics/EpicDetailModal';
import { SprintDetailModal } from '@/components/sprints/SprintDetailModal';
import { RoadmapCard } from '@/components/roadmap/RoadmapCard';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Task, Project, Epic, Sprint } from '@/types';

// ============================================================
// PROJECT INFO CARD (Clickable - shows full info modal)
// ============================================================

function ProjectInfoCard({
    project,
    metrics,
    onClick,
}: {
    project: Project;
    metrics: {
        total: number;
        completed: number;
        progress: number;
        daysRemaining: number;
    };
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="bg-card rounded-xl border border-border p-4 sm:p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
            title="Click para ver informacion completa del proyecto"
        >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Avatar with gradient */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center shrink-0">
                    <GraduationCap className="text-white h-8 w-8 sm:h-10 sm:w-10" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 uppercase">
                            SAAS
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 uppercase">
                            REACT
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 uppercase">
                            B2B
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description || 'Sin descripcion'}
                    </p>

                    {/* Client */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span className="text-solaria">&#9679;</span>
                        <span>{project.client?.name || 'Sin cliente'}</span>
                    </div>
                </div>

                {/* External link icon */}
                <div className="hidden sm:flex items-start">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            {/* Phase indicator */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Fase</span>
                    <span className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide',
                        project.status === 'development' ? 'bg-solaria/20 text-solaria border border-solaria/30' :
                        project.status === 'planning' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                        (project.status === 'completed' || project.status === 'deployment') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        project.status === 'on_hold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        project.status === 'testing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    )}>
                        {project.status === 'development' ? 'Desarrollo' :
                         project.status === 'planning' ? 'Planificacion' :
                         (project.status === 'completed' || project.status === 'deployment') ? 'Produccion' :
                         project.status === 'on_hold' ? 'Pausado' :
                         project.status === 'testing' ? 'Testing' :
                         project.status}
                    </span>
                </div>

                {/* Phase progress bars */}
                <div className="flex gap-1 mt-2">
                    <div className={cn('flex-1 h-2 rounded-full transition-colors', project.status === 'planning' ? 'bg-violet-500' : 'bg-solaria')} />
                    <div className={cn('flex-1 h-2 rounded-full transition-colors', ['active', 'development', 'testing', 'deployment', 'completed'].includes(project.status) ? 'bg-solaria' : 'bg-secondary')} />
                    <div className={cn('flex-1 h-2 rounded-full transition-colors', ['testing', 'deployment', 'completed'].includes(project.status) ? 'bg-blue-500' : 'bg-secondary')} />
                    <div className={cn('flex-1 h-2 rounded-full transition-colors', ['deployment', 'completed'].includes(project.status) ? 'bg-emerald-500' : 'bg-secondary')} />
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                    <span className={cn('font-medium', project.status === 'planning' ? 'text-violet-400' : 'text-muted-foreground')}>PLAN</span>
                    <span className={cn('font-medium', ['active', 'development'].includes(project.status) ? 'text-solaria' : 'text-muted-foreground')}>DEV</span>
                    <span className={cn('font-medium', project.status === 'testing' ? 'text-blue-400' : 'text-muted-foreground')}>TEST</span>
                    <span className={cn('font-medium', ['completed', 'production'].includes(project.status) ? 'text-emerald-400' : 'text-muted-foreground')}>PROD</span>
                </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                    <p className="text-lg font-bold text-foreground">
                        ${Math.round((project.budgetAllocated || 0) / 1000)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Presupuesto</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                    <p className="text-lg font-bold text-foreground">{metrics.total}</p>
                    <p className="text-xs text-muted-foreground">Tareas</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                    <p className="text-lg font-bold text-green-400">{metrics.progress}%</p>
                    <p className="text-xs text-muted-foreground">Completado</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                    <p className={cn(
                        'text-lg font-bold',
                        metrics.daysRemaining < 0 ? 'text-red-400' : 'text-foreground'
                    )}>
                        {metrics.daysRemaining}d
                    </p>
                    <p className="text-xs text-muted-foreground">Restantes</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// TAREAS CARD (Clickable - navigates to /projects/:id/tasks)
// ============================================================

function TareasCard({
    metrics,
    tasksByStatus,
    onClick,
}: {
    metrics: {
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
    };
    tasksByStatus: {
        backlog: number;
        todo: number;
        doing: number;
        done: number;
    };
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
            title="Click para gestionar tareas"
        >
            {/* Header */}
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-solaria" />
                TAREAS
                <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </h4>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{metrics.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-yellow-400">{metrics.pending}</p>
                    <p className="text-xs text-muted-foreground">Pend</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-blue-400">{metrics.inProgress}</p>
                    <p className="text-xs text-muted-foreground">Doing</p>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-green-400">{metrics.completed}</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                </div>
            </div>

            {/* MiniTrello visualization */}
            <MiniTrello
                board={tasksByStatus}
                showLabels={true}
                showCounts={true}
                compact={false}
            />
        </div>
    );
}

// ============================================================
// DIRECCIONES CARD (Clickable)
// ============================================================

function DireccionesCard({
    project,
    onClick,
}: {
    project: Project;
    onClick: () => void;
}) {
    // Get URLs from project
    const urls = [
        project.productionUrl && { label: 'Produccion', url: project.productionUrl },
        project.stagingUrl && { label: 'Staging', url: project.stagingUrl },
        project.localUrl && { label: 'Local', url: project.localUrl },
        project.repoUrl && { label: 'Repo', url: project.repoUrl },
    ].filter(Boolean) as Array<{ label: string; url: string }>;

    return (
        <div
            onClick={onClick}
            className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
            title="Click para gestionar URLs"
        >
            {/* Header */}
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Link2 className="h-4 w-4 text-solaria" />
                DIRECCIONES
                <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </h4>

            {/* URLs list or empty state */}
            {urls.length > 0 ? (
                <div className="space-y-2">
                    {urls.slice(0, 3).map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-muted-foreground truncate"
                        >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="text-xs text-solaria">{item.label}:</span>
                            <span className="truncate">{item.url}</span>
                        </div>
                    ))}
                    {urls.length > 3 && (
                        <p className="text-xs text-solaria">+{urls.length - 3} mas...</p>
                    )}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No hay URLs configuradas</p>
            )}
        </div>
    );
}

// ============================================================
// ACTIVIDAD CARD
// ============================================================

function ActividadCard({
    activities,
}: {
    activities: Array<{
        id: number;
        action: string;
        description: string;
        createdAt: string;
    }>;
}) {
    const recentActivities = activities.slice(0, 5);

    const getActivityIcon = (action: string) => {
        if (action.includes('complete') || action.includes('done')) return <CheckCircle2 className="h-4 w-4 text-green-400" />;
        if (action.includes('create') || action.includes('new')) return <Plus className="h-4 w-4 text-blue-400" />;
        if (action.includes('update') || action.includes('edit')) return <Edit className="h-4 w-4 text-yellow-400" />;
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <div className="bg-card rounded-xl border border-border p-4">
            {/* Header */}
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-solaria" />
                Actividad
            </h4>

            {/* Activity list */}
            {recentActivities.length > 0 ? (
                <div className="space-y-3">
                    {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                            {getActivityIcon(activity.action)}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">
                                    {activity.description || activity.action}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatRelativeTime(activity.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
            )}
        </div>
    );
}

// ============================================================
// NOTAS CARD
// ============================================================

function NotasCard({
    notes,
    onAddNote,
}: {
    notes: string[];
    onAddNote: (note: string) => void;
}) {
    const [newNote, setNewNote] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNote.trim()) {
            onAddNote(newNote.trim());
            setNewNote('');
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border p-4">
            {/* Header */}
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-solaria" />
                Notas
                <span className="text-xs text-muted-foreground font-normal">(Agentes leen)</span>
            </h4>

            {/* Add note form */}
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribe una nota..."
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-solaria"
                />
                <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className={cn(
                        'p-2 rounded-lg transition-colors',
                        newNote.trim()
                            ? 'bg-solaria text-white hover:bg-solaria-dark'
                            : 'bg-secondary text-muted-foreground cursor-not-allowed'
                    )}
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>

            {/* Notes list */}
            {notes.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {notes.map((note, idx) => (
                        <div key={idx} className="p-2 rounded bg-secondary/50 text-sm text-foreground">
                            {note}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Sin notas</p>
            )}
        </div>
    );
}

// ============================================================
// EPICS CARD
// ============================================================

function EpicsCard({
    epics,
    onCreateEpic,
    onDeleteEpic,
    onEpicClick,
}: {
    epics: Epic[];
    onCreateEpic: (name: string) => void;
    onDeleteEpic: (id: number) => void;
    onEpicClick?: (epicId: number) => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [newEpicName, setNewEpicName] = useState('');

    // Calculate next epic number for auto-naming
    const nextEpicNumber = useMemo(() => {
        if (epics.length === 0) return 1;
        const maxNumber = Math.max(...epics.map(e => e.epicNumber || 0));
        return maxNumber + 1;
    }, [epics]);

    const suggestedEpicName = `EPIC${String(nextEpicNumber).padStart(3, '0')}`;

    const handleShowForm = () => {
        setNewEpicName(suggestedEpicName);
        setShowForm(true);
    };

    const handleCreate = () => {
        if (newEpicName.trim()) {
            onCreateEpic(newEpicName.trim());
            setNewEpicName('');
            setShowForm(false);
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-purple-400" />
                Epics
                <span className="text-xs text-muted-foreground font-normal ml-auto">
                    {epics.length} total
                </span>
            </h4>

            {/* Epics list */}
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {epics.map((epic) => {
                    const isActive = epic.status === 'in_progress';
                    return (
                        <div
                            key={epic.id}
                            onClick={() => onEpicClick?.(epic.id)}
                            className={cn(
                                'flex items-center gap-2 p-2 rounded-lg group transition-colors',
                                isActive
                                    ? 'bg-purple-500/10 border-l-3 border-purple-500 cursor-pointer hover:bg-purple-500/20'
                                    : 'bg-secondary/50 cursor-pointer hover:bg-secondary/80'
                            )}
                        >
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: epic.color || '#6366f1' }}
                            />
                            <span className="flex-1 text-sm text-foreground truncate">
                                EPIC{String(epic.epicNumber).padStart(2, '0')}: {epic.name}
                            </span>
                            {isActive && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500 text-white font-medium animate-pulse">
                                    ACTIVO
                                </span>
                            )}
                            <span className={cn(
                                'text-xs px-1.5 py-0.5 rounded',
                                epic.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                epic.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-gray-500/20 text-gray-400'
                            )}>
                                {epic.status}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteEpic(epic.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
                {epics.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">Sin epics</p>
                )}
            </div>

            {/* Add form */}
            {showForm ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newEpicName}
                        onChange={(e) => setNewEpicName(e.target.value)}
                        placeholder={suggestedEpicName}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 font-mono"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newEpicName.trim()}
                        className="p-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => { setShowForm(false); setNewEpicName(''); }}
                        className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleShowForm}
                    className="w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Crear Epic ({suggestedEpicName})
                </button>
            )}
        </div>
    );
}

// ============================================================
// SPRINTS CARD
// ============================================================

function SprintsCard({
    sprints,
    onCreateSprint,
    onDeleteSprint,
    onSprintClick,
}: {
    sprints: Sprint[];
    onCreateSprint: (name: string) => void;
    onDeleteSprint: (id: number) => void;
    onSprintClick?: (sprintId: number) => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [newSprintName, setNewSprintName] = useState('');

    // Calculate next sprint number for auto-naming
    const nextSprintNumber = useMemo(() => {
        if (sprints.length === 0) return 1;
        const maxNumber = Math.max(...sprints.map(s => s.sprintNumber || 0));
        return maxNumber + 1;
    }, [sprints]);

    const suggestedSprintName = `SPRINT${String(nextSprintNumber).padStart(3, '0')}`;

    const handleShowForm = () => {
        setNewSprintName(suggestedSprintName);
        setShowForm(true);
    };

    const handleCreate = () => {
        if (newSprintName.trim()) {
            onCreateSprint(newSprintName.trim());
            setNewSprintName('');
            setShowForm(false);
        }
    };

    // Get active sprint
    const activeSprint = sprints.find((s) => s.status === 'active');

    return (
        <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-400" />
                Sprints
                <span className="text-xs text-muted-foreground font-normal ml-auto">
                    {sprints.length} total
                </span>
            </h4>

            {/* Active sprint highlight */}
            {activeSprint && (
                <div
                    onClick={() => onSprintClick?.(activeSprint.id)}
                    className="mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 cursor-pointer hover:bg-yellow-500/20 transition-colors"
                >
                    <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />
                        <span className="text-yellow-400 font-medium">Activo:</span>
                        <span className="text-foreground">{activeSprint.name}</span>
                    </div>
                    {activeSprint.endDate && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Termina: {new Date(activeSprint.endDate).toLocaleDateString('es-ES')}
                        </p>
                    )}
                </div>
            )}

            {/* Sprints list */}
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {sprints.filter(s => s.id !== activeSprint?.id).map((sprint) => (
                    <div
                        key={sprint.id}
                        onClick={() => onSprintClick?.(sprint.id)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                        <span className="text-xs font-mono text-muted-foreground">
                            SP{String(sprint.sprintNumber).padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-sm text-foreground truncate">
                            {sprint.name}
                        </span>
                        <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded',
                            sprint.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            sprint.status === 'active' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                        )}>
                            {sprint.status}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteSprint(sprint.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                {sprints.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">Sin sprints</p>
                )}
            </div>

            {/* Add form */}
            {showForm ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSprintName}
                        onChange={(e) => setNewSprintName(e.target.value)}
                        placeholder={suggestedSprintName}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-yellow-500 font-mono"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newSprintName.trim()}
                        className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => { setShowForm(false); setNewSprintName(''); }}
                        className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleShowForm}
                    className="w-full py-1.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-yellow-500 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Crear Sprint ({suggestedSprintName})
                </button>
            )}
        </div>
    );
}

// ============================================================
// PROJECT INFO MODAL (Full details)
// ============================================================

function ProjectInfoModal({
    project,
    isOpen,
    onClose,
    onEdit,
}: {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Informacion del Proyecto" maxWidth="max-w-2xl">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-solaria to-solaria-dark flex items-center justify-center">
                        <GraduationCap className="text-white h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground">{project.name}</h2>
                        <p className="text-muted-foreground text-sm mt-1">{project.code}</p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Descripcion</h4>
                    <p className="text-foreground">{project.description || 'Sin descripcion'}</p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                        <p className="text-foreground font-medium">{project.client?.name || 'Sin cliente'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Presupuesto</p>
                        <p className="text-foreground font-medium">
                            ${(project.budgetAllocated || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Fecha Inicio</p>
                        <p className="text-foreground font-medium">
                            {project.startDate
                                ? new Date(project.startDate).toLocaleDateString('es-ES')
                                : 'No definida'}
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                        <p className="text-foreground font-medium">
                            {project.endDate
                                ? new Date(project.endDate).toLocaleDateString('es-ES')
                                : 'No definida'}
                        </p>
                    </div>
                </div>

                {/* Tech Stack */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Stack Tecnico</h4>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">React 19</span>
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Node.js</span>
                        <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">PostgreSQL</span>
                        <span className="px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">TailwindCSS</span>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cerrar
                </button>
                <button
                    onClick={() => {
                        onClose();
                        onEdit();
                    }}
                    className="px-4 py-2 rounded-lg bg-solaria text-white hover:bg-solaria-dark transition-colors flex items-center gap-2"
                >
                    <Edit className="h-4 w-4" />
                    Editar
                </button>
            </div>
        </Modal>
    );
}

// ============================================================
// PROJECT EDIT MODAL
// ============================================================

function ProjectEditModal({
    project,
    isOpen,
    onClose,
    onSave,
}: {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Project>) => void;
}) {
    const [formData, setFormData] = useState({
        name: project.name,
        code: project.code || '',
        description: project.description || '',
        budgetAllocated: project.budgetAllocated || 0,
        startDate: project.startDate?.split('T')[0] || '',
        endDate: project.endDate?.split('T')[0] || '',
    });

    // Validate code - only check if it differs from current
    const shouldCheckCode = formData.code.length === 3 &&
                           formData.code.toUpperCase() !== project.code?.toUpperCase();
    const { data: codeCheck, isLoading: checkingCode } = useCheckProjectCode(
        shouldCheckCode ? formData.code : ''
    );

    const isCodeValid = formData.code.length === 3 && /^[A-Za-z]{3}$/.test(formData.code);
    const isCodeSame = formData.code.toUpperCase() === project.code?.toUpperCase();
    const isCodeAvailable = isCodeSame || (codeCheck?.available ?? true);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
        setFormData({ ...formData, code: value });
    };

    const handleSubmit = () => {
        if (!isCodeValid || (!isCodeSame && !isCodeAvailable)) return;
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Proyecto">
            <div className="p-6 space-y-4">
                {/* Name and Code row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Codigo (3 letras)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.code}
                                onChange={handleCodeChange}
                                maxLength={3}
                                placeholder="ABC"
                                className={cn(
                                    'w-full px-3 py-2 rounded-lg bg-secondary border text-foreground font-mono text-center uppercase tracking-wider',
                                    !isCodeValid && formData.code.length > 0
                                        ? 'border-red-500'
                                        : isCodeValid && !checkingCode && !isCodeSame && isCodeAvailable
                                        ? 'border-green-500'
                                        : isCodeValid && !checkingCode && !isCodeAvailable
                                        ? 'border-red-500'
                                        : 'border-border'
                                )}
                            />
                            {checkingCode && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    ...
                                </span>
                            )}
                        </div>
                        {!isCodeValid && formData.code.length > 0 && (
                            <p className="text-xs text-red-400 mt-1">Solo 3 letras A-Z</p>
                        )}
                        {isCodeValid && !isCodeSame && !checkingCode && !isCodeAvailable && (
                            <p className="text-xs text-red-400 mt-1">Codigo en uso</p>
                        )}
                        {isCodeValid && !isCodeSame && !checkingCode && isCodeAvailable && (
                            <p className="text-xs text-green-400 mt-1">Disponible ✓</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Presupuesto
                    </label>
                    <input
                        type="number"
                        value={formData.budgetAllocated}
                        onChange={(e) =>
                            setFormData({ ...formData, budgetAllocated: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Deadline
                        </label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Descripcion
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground resize-none"
                    />
                </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isCodeValid || (!isCodeSame && !isCodeAvailable) || checkingCode}
                    className={cn(
                        'px-4 py-2 rounded-lg transition-colors',
                        (!isCodeValid || (!isCodeSame && !isCodeAvailable) || checkingCode)
                            ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                            : 'bg-solaria text-white hover:bg-solaria-dark'
                    )}
                >
                    Guardar
                </button>
            </div>
        </Modal>
    );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const projectId = Number(id);

    // State
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [projectNotes, setProjectNotes] = useState<string[]>([]);
    const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
    const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

    // Queries
    const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
    const { data: tasks = [] } = useProjectTasks(projectId);
    const { data: epics = [] } = useProjectEpics(projectId);
    const { data: sprints = [] } = useProjectSprints(projectId);
    const { data: activities = [] } = useProjectActivity(projectId, 10);

    // Mutations
    const updateProject = useUpdateProject();
    const createEpic = useCreateEpic();
    const deleteEpic = useDeleteEpic();
    const createSprint = useCreateSprint();
    const deleteSprint = useDeleteSprint();

    // Derived data
    const metrics = useMemo(() => {
        const total = tasks.length;
        const pending = tasks.filter((t: Task) => t.status === 'pending').length;
        const inProgress = tasks.filter((t: Task) => t.status === 'in_progress').length;
        const completed = tasks.filter((t: Task) => t.status === 'completed').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Calculate days remaining
        let daysRemaining = 0;
        if (project?.endDate) {
            const end = new Date(project.endDate);
            const now = new Date();
            daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        return { total, pending, inProgress, completed, progress, daysRemaining };
    }, [tasks, project]);

    const tasksByStatus = useMemo(() => {
        // MiniTrello uses: backlog, todo, doing, done
        // Map: pending -> todo, in_progress -> doing, completed -> done
        const backlog = 0; // No separate backlog status in current schema
        const todo = tasks.filter((t: Task) => t.status === 'pending').length;
        const doing = tasks.filter((t: Task) => t.status === 'in_progress').length;
        const done = tasks.filter((t: Task) => t.status === 'completed').length;
        return { backlog, todo, doing, done };
    }, [tasks]);

    // Handlers
    const handleProjectInfoClick = useCallback(() => {
        setIsInfoModalOpen(true);
    }, []);

    const handleTareasClick = useCallback(() => {
        navigate(`/projects/${projectId}/tasks`);
    }, [navigate, projectId]);

    const handleDireccionesClick = useCallback(() => {
        navigate(`/projects/${projectId}/links`);
    }, [navigate, projectId]);

    const handleAddNote = useCallback((note: string) => {
        setProjectNotes((prev) => [note, ...prev]);
        // TODO: Save note to backend
    }, []);

    const handleProjectSave = useCallback((data: Partial<Project>) => {
        updateProject.mutate({ id: projectId, data });
    }, [projectId, updateProject]);

    const handleCreateEpic = useCallback((name: string) => {
        createEpic.mutate({ projectId, data: { name } });
    }, [projectId, createEpic]);

    const handleDeleteEpic = useCallback((id: number) => {
        deleteEpic.mutate({ id, projectId });
    }, [projectId, deleteEpic]);

    const handleCreateSprint = useCallback((name: string) => {
        createSprint.mutate({ projectId, data: { name } });
    }, [projectId, createSprint]);

    const handleDeleteSprint = useCallback((id: number) => {
        deleteSprint.mutate({ id, projectId });
    }, [projectId, deleteSprint]);

    // Loading state
    if (projectLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-solaria" />
            </div>
        );
    }

    // Error state
    if (projectError || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold text-foreground">Proyecto no encontrado</h2>
                <p className="text-muted-foreground">
                    El proyecto con ID {projectId} no existe o no tienes acceso.
                </p>
                <button
                    onClick={() => navigate('/projects')}
                    className="px-4 py-2 rounded-lg bg-solaria text-white flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Proyectos
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/projects')}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        title="Volver al listado"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{project.name}</h1>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors"
                    >
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">Info</span>
                    </button>
                    <button
                        onClick={() => navigate(`/projects/${projectId}/settings`)}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                        title="Configuracion"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Main content grid - Original layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left column (2/3) - Project Info + Tareas */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Project Info Card (clickable) */}
                    <ProjectInfoCard
                        project={project}
                        metrics={metrics}
                        onClick={handleProjectInfoClick}
                    />

                    {/* Two cards row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* TAREAS Card with MiniTrello (clickable) */}
                        <TareasCard
                            metrics={metrics}
                            tasksByStatus={tasksByStatus}
                            onClick={handleTareasClick}
                        />

                        {/* DIRECCIONES Card (clickable) */}
                        <DireccionesCard
                            project={project}
                            onClick={handleDireccionesClick}
                        />
                    </div>

                    {/* Epics and Sprints row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <EpicsCard
                            epics={epics}
                            onCreateEpic={handleCreateEpic}
                            onDeleteEpic={handleDeleteEpic}
                            onEpicClick={setSelectedEpicId}
                        />
                        <SprintsCard
                            sprints={sprints}
                            onCreateSprint={handleCreateSprint}
                            onDeleteSprint={handleDeleteSprint}
                            onSprintClick={setSelectedSprintId}
                        />
                    </div>
                </div>

                {/* Right column (1/3) - Activity + Notes */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Actividad */}
                    <ActividadCard
                        activities={activities.map(a => ({
                            id: a.id,
                            action: a.action,
                            description: a.message || a.action,
                            createdAt: a.createdAt,
                        }))}
                    />

                    {/* Notas */}
                    <NotasCard
                        notes={projectNotes}
                        onAddNote={handleAddNote}
                    />

                    {/* Roadmap Card */}
                    <RoadmapCard
                        epics={epics}
                        sprints={sprints}
                        projectId={projectId}
                        onEpicClick={setSelectedEpicId}
                        onSprintClick={setSelectedSprintId}
                    />
                </div>
            </div>

            {/* Project Info Modal */}
            <ProjectInfoModal
                project={project}
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                onEdit={() => setIsEditModalOpen(true)}
            />

            {/* Project Edit Modal */}
            <ProjectEditModal
                project={project}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleProjectSave}
            />

            {/* Epic Detail Modal */}
            <EpicDetailModal
                epicId={selectedEpicId}
                isOpen={selectedEpicId !== null}
                onClose={() => setSelectedEpicId(null)}
            />

            {/* Sprint Detail Modal */}
            <SprintDetailModal
                sprintId={selectedSprintId}
                isOpen={selectedSprintId !== null}
                onClose={() => setSelectedSprintId(null)}
            />
        </div>
    );
}
