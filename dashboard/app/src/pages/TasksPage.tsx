import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    LayoutGrid,
    List,
    GanttChartSquare,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { useTasks, useProjects } from '@/hooks/useApi';
import { TaskCard, GanttView, TaskDetailDrawer } from '@/components/tasks';
import { cn, formatRelativeTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import type { Task, Project } from '@/types';

type ViewMode = 'kanban' | 'list' | 'gantt';

const KANBAN_COLUMNS = [
    { id: 'pending', label: 'Pendiente', color: 'border-t-yellow-500', icon: Clock },
    { id: 'in_progress', label: 'En Progreso', color: 'border-t-blue-500', icon: Loader2 },
    { id: 'review', label: 'Revision', color: 'border-t-purple-500', icon: Search },
    { id: 'completed', label: 'Completado', color: 'border-t-green-500', icon: CheckCircle2 },
    { id: 'blocked', label: 'Bloqueado', color: 'border-t-red-500', icon: AlertCircle },
];

function KanbanColumn({
    column,
    tasks,
    onTaskClick,
}: {
    column: (typeof KANBAN_COLUMNS)[0];
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}) {
    const Icon = column.icon;

    return (
        <div className="kanban-column">
            <div className={cn('kanban-column-header', column.color)}>
                <div className="flex items-center gap-2">
                    <Icon className={cn(
                        'h-4 w-4',
                        column.id === 'in_progress' && 'animate-spin'
                    )} />
                    <h3 className="font-medium">{column.label}</h3>
                </div>
                <span className="kanban-column-count">{tasks.length}</span>
            </div>
            <div className="kanban-column-body">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick(task)}
                        compact
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="kanban-empty">
                        <span>Sin tareas</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ListView({
    tasks,
    onTaskClick,
}: {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}) {
    return (
        <div className="list-table-container">
            <table className="list-table">
                <thead>
                    <tr>
                        <th>Tarea</th>
                        <th>Proyecto</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Progreso</th>
                        <th>Subtareas</th>
                        <th>Actualizado</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className="cursor-pointer"
                        >
                            <td>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {task.taskCode || `#${task.taskNumber}`}
                                    </span>
                                    <span className="font-medium">{task.title}</span>
                                </div>
                            </td>
                            <td className="text-muted-foreground">
                                {task.projectCode || task.projectName}
                            </td>
                            <td>
                                <span className={cn('status-badge', getStatusColor(task.status))}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                <span
                                    className={cn(
                                        'priority-badge',
                                        getPriorityColor(task.priority)
                                    )}
                                >
                                    {task.priority}
                                </span>
                            </td>
                            <td>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${task.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs">{task.progress}%</span>
                                </div>
                            </td>
                            <td className="text-center">
                                <span className="text-sm">
                                    {task.itemsCompleted || 0}/{task.itemsTotal || 0}
                                </span>
                            </td>
                            <td className="text-muted-foreground">
                                {formatRelativeTime(task.updatedAt)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function TasksPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [search, setSearch] = useState('');
    const [projectFilter, setProjectFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const { data: tasks, isLoading } = useTasks();
    const { data: projects } = useProjects();

    const filteredTasks = tasks?.filter((t: Task) => {
        const matchesSearch =
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.taskCode?.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase());
        const matchesProject = !projectFilter || t.projectId.toString() === projectFilter;
        const matchesStatus = !statusFilter || t.status === statusFilter;
        return matchesSearch && matchesProject && matchesStatus;
    });

    const tasksByStatus = KANBAN_COLUMNS.reduce(
        (acc, col) => {
            acc[col.id] = filteredTasks?.filter((t: Task) => t.status === col.id) || [];
            return acc;
        },
        {} as Record<string, Task[]>
    );

    const handleTaskClick = useCallback((task: Task) => {
        setSelectedTaskId(task.id);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setSelectedTaskId(null);
    }, []);

    const handleNavigateToProject = useCallback(
        (projectId: number) => {
            navigate(`/projects/${projectId}`);
        },
        [navigate]
    );

    // Stats
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t: Task) => t.status === 'completed').length || 0;
    const inProgressTasks = tasks?.filter((t: Task) => t.status === 'in_progress').length || 0;
    const blockedTasks = tasks?.filter((t: Task) => t.status === 'blocked').length || 0;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="section-header shrink-0">
                <div>
                    <h1 className="section-title">Tareas</h1>
                    <p className="section-subtitle">
                        {totalTasks} tareas • {completedTasks} completadas • {inProgressTasks} en progreso
                        {blockedTasks > 0 && (
                            <span className="text-red-500"> • {blockedTasks} bloqueadas</span>
                        )}
                    </p>
                </div>
                <div className="section-actions">
                    <button className="btn-primary">
                        <Plus className="h-4 w-4" />
                        Nueva Tarea
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
                <div className="stat-card">
                    <div className="stat-icon tasks">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Tareas</div>
                        <div className="stat-value">{totalTasks}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Completadas</div>
                        <div className="stat-value">{completedTasks}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <Loader2 className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">En Progreso</div>
                        <div className="stat-value">{inProgressTasks}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Bloqueadas</div>
                        <div className="stat-value">{blockedTasks}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row shrink-0">
                <div className="filter-search">
                    <Search className="filter-search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar tareas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="filter-search-input"
                    />
                </div>

                <div className="filter-selects">
                    <div className="filter-select-wrapper">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todos los proyectos</option>
                            {projects?.map((p: Project) => (
                                <option key={p.id} value={p.id}>
                                    {p.code} - {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los estados</option>
                        {KANBAN_COLUMNS.map((col) => (
                            <option key={col.id} value={col.id}>
                                {col.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* View toggle */}
                <div className="view-toggle">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={cn('view-toggle-btn', viewMode === 'kanban' && 'active')}
                        title="Vista Kanban"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn('view-toggle-btn', viewMode === 'list' && 'active')}
                        title="Vista Lista"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('gantt')}
                        className={cn('view-toggle-btn', viewMode === 'gantt' && 'active')}
                        title="Vista Gantt"
                    >
                        <GanttChartSquare className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content - fills remaining viewport */}
            <div className="flex-1 min-h-0 flex flex-col">
                {viewMode === 'kanban' && (
                    <div className="kanban-container">
                        {KANBAN_COLUMNS.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={tasksByStatus[column.id]}
                                onTaskClick={handleTaskClick}
                            />
                        ))}
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="flex-1 min-h-0 overflow-auto">
                        <ListView tasks={filteredTasks || []} onTaskClick={handleTaskClick} />
                    </div>
                )}

                {viewMode === 'gantt' && (
                    <div className="flex-1 min-h-0 overflow-auto">
                        <GanttView
                            tasks={filteredTasks || []}
                            onTaskClick={handleTaskClick}
                        />
                    </div>
                )}
            </div>

            {/* Task Detail Drawer */}
            <TaskDetailDrawer
                taskId={selectedTaskId}
                isOpen={selectedTaskId !== null}
                onClose={handleCloseDrawer}
                onNavigateToProject={handleNavigateToProject}
            />
        </div>
    );
}
