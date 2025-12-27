import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Archive,
    CheckCircle2,
    Calendar,
    Clock,
    User,
    Loader2,
    ArrowLeft,
    ChevronRight,
    Bot,
} from 'lucide-react';
import { useTasks, useProjects, useTask } from '@/hooks/useApi';
import { Modal } from '@/components/common/Modal';
import { TaskItemsList } from '@/components/tasks/TaskItemsList';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import type { Task, Project } from '@/types';

// Priority config
const PRIORITY_CONFIG = {
    critical: { color: '#ef4444', label: 'P0', bg: 'rgba(239, 68, 68, 0.2)' },
    high: { color: '#f59e0b', label: 'P1', bg: 'rgba(249, 115, 22, 0.2)' },
    medium: { color: '#3b82f6', label: 'P2', bg: 'rgba(59, 130, 246, 0.2)' },
    low: { color: '#64748b', label: 'P3', bg: 'rgba(100, 116, 139, 0.2)' },
};

// ============================================
// TaskDetailModal for archived tasks
// ============================================
function ArchivedTaskDetailModal({
    taskId,
    isOpen,
    onClose,
}: {
    taskId: number | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const shouldFetch = isOpen && taskId !== null && taskId > 0;
    const { data: task, isLoading } = useTask(shouldFetch ? taskId : 0);

    if (!isOpen) return null;

    const priority = task ? PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium : PRIORITY_CONFIG.medium;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-2xl">
            {!shouldFetch || isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : task ? (
                <>
                    {/* Header */}
                    <div
                        className="px-6 py-4 border-b border-border"
                        style={{ borderLeft: `4px solid ${priority.color}` }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="px-2 py-1 rounded text-[11px] font-bold"
                                style={{ background: priority.bg, color: priority.color }}
                            >
                                {priority.label}
                            </span>
                            <span className="px-2 py-1 rounded text-[11px] bg-green-500/10 text-green-500">
                                Completada
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                                {task.taskCode || `#${task.id}`}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        {task.projectName && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {task.projectCode} - {task.projectName}
                            </p>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Description */}
                        {task.description && (
                            <div>
                                <h4 className="text-sm font-medium mb-2">Descripción</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {/* Progress */}
                        <div>
                            <h4 className="text-sm font-medium mb-2">Progreso</h4>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-green-500"
                                        style={{ width: `${task.progress || 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-green-500">
                                    {task.progress || 100}%
                                </span>
                            </div>
                        </div>

                        {/* Subtasks */}
                        <div className="border border-border rounded-lg p-4 bg-secondary/30">
                            <TaskItemsList
                                taskId={task.id}
                                editable={false}
                                showAddForm={false}
                            />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-secondary/50 rounded-lg">
                                <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Completado por
                                </h4>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    {task.agentName ? (
                                        <>
                                            <Bot className="h-3 w-3 text-solaria" />
                                            {task.agentName}
                                        </>
                                    ) : (
                                        'Sin asignar'
                                    )}
                                </p>
                            </div>

                            <div className="p-4 bg-secondary/50 rounded-lg">
                                <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Horas Estimadas
                                </h4>
                                <p className="text-sm font-medium">
                                    {task.estimatedHours || 0} horas
                                </p>
                            </div>

                            <div className="p-4 bg-secondary/50 rounded-lg">
                                <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-green-400" />
                                    Fecha Creación
                                </h4>
                                <p className="text-sm font-medium">
                                    {task.createdAt
                                        ? formatDate(task.createdAt)
                                        : 'N/A'}
                                </p>
                            </div>

                            <div className="p-4 bg-secondary/50 rounded-lg">
                                <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    Completada
                                </h4>
                                <p className="text-sm font-medium text-green-500">
                                    {task.completedAt
                                        ? formatRelativeTime(task.completedAt)
                                        : formatRelativeTime(task.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-border flex items-center justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </>
            ) : (
                <div className="py-12 text-center text-muted-foreground">
                    Tarea no encontrada
                </div>
            )}
        </Modal>
    );
}

// ============================================
// Main ArchivedTasksPage
// ============================================
export function ArchivedTasksPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [projectFilter, setProjectFilter] = useState<string>('');
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const { data: allTasks, isLoading } = useTasks();
    const { data: projects } = useProjects();

    // Solo tareas completadas
    const archivedTasks = allTasks?.filter((t: Task) => t.status === 'completed') || [];

    const filteredTasks = archivedTasks.filter((t: Task) => {
        const matchesSearch =
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.taskCode?.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase());
        const matchesProject = !projectFilter || t.projectId.toString() === projectFilter;
        return matchesSearch && matchesProject;
    });

    // Ordenar por fecha de completado (mas reciente primero)
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.updatedAt).getTime();
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.updatedAt).getTime();
        return dateB - dateA;
    });

    const handleTaskClick = useCallback((taskId: number) => {
        setSelectedTaskId(taskId);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedTaskId(null);
    }, []);

    // Agrupar por proyecto
    const tasksByProject = sortedTasks.reduce((acc, task) => {
        const projectKey = task.projectCode || task.projectName || 'Sin Proyecto';
        if (!acc[projectKey]) {
            acc[projectKey] = [];
        }
        acc[projectKey].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    // Stats
    const totalCompleted = archivedTasks.length;
    const thisWeek = archivedTasks.filter((t: Task) => {
        const completedDate = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return completedDate >= weekAgo;
    }).length;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Archive className="h-6 w-6 text-solaria" />
                        Tareas Archivadas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {totalCompleted} tareas completadas • {thisWeek} esta semana
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Total Completadas</div>
                        <div className="text-2xl font-bold">{totalCompleted}</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Esta Semana</div>
                        <div className="text-2xl font-bold">{thisWeek}</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-solaria/10 flex items-center justify-center">
                        <Archive className="h-6 w-6 text-solaria" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Proyectos</div>
                        <div className="text-2xl font-bold">{Object.keys(tasksByProject).length}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar tareas completadas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-solaria transition-colors"
                    />
                </div>

                <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-solaria transition-colors min-w-[200px]"
                >
                    <option value="">Todos los proyectos</option>
                    {projects?.map((p: Project) => (
                        <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tasks List */}
            <div className="space-y-6">
                {Object.entries(tasksByProject).map(([projectName, tasks]) => (
                    <div key={projectName} className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border bg-secondary/30">
                            <h3 className="font-semibold text-lg">{projectName}</h3>
                            <p className="text-sm text-muted-foreground">
                                {tasks.length} tareas completadas
                            </p>
                        </div>
                        <div className="divide-y divide-border">
                            {tasks.map((task) => {
                                const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task.id)}
                                        className="flex items-center gap-4 p-4 hover:bg-secondary/50 cursor-pointer transition-colors"
                                    >
                                        {/* Priority bar */}
                                        <div
                                            className="w-1 h-12 rounded-full flex-shrink-0"
                                            style={{ background: priority.color }}
                                        />

                                        {/* Check icon */}
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />

                                        {/* Task info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-solaria font-semibold">
                                                    {task.taskCode || `#${task.taskNumber}`}
                                                </span>
                                                <span
                                                    className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                                                    style={{ background: priority.bg, color: priority.color }}
                                                >
                                                    {priority.label}
                                                </span>
                                            </div>
                                            <h4 className="font-medium truncate">{task.title}</h4>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Right side info */}
                                        <div className="text-right flex-shrink-0">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatRelativeTime(task.completedAt || task.updatedAt)}
                                            </div>
                                            {task.agentName && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-end">
                                                    <Bot className="h-3 w-3 text-solaria" />
                                                    {task.agentName.replace('SOLARIA-', '')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Chevron */}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {sortedTasks.length === 0 && (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <Archive className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                            No hay tareas completadas
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Las tareas completadas aparecerán aquí
                        </p>
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
            <ArchivedTaskDetailModal
                taskId={selectedTaskId}
                isOpen={selectedTaskId !== null}
                onClose={handleCloseModal}
            />
        </div>
    );
}
