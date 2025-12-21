import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    List,
    GanttChartSquare,
    Loader2,
    AlertCircle,
    Search,
} from 'lucide-react';
import { useProject, useProjectTasks, useAgents } from '@/hooks/useApi';
import {
    ProjectHeader,
    ProjectStatsRow,
    ProjectTeamSection,
    ProjectActivityFeed,
} from '@/components/projects';
import { TaskCard, GanttView, TaskDetailDrawer } from '@/components/tasks';
import { cn, formatRelativeTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import type { Task } from '@/types';

type ViewMode = 'kanban' | 'list' | 'gantt';

const KANBAN_COLUMNS = [
    { id: 'pending', label: 'Pendiente', color: 'border-t-yellow-500' },
    { id: 'in_progress', label: 'En Progreso', color: 'border-t-blue-500' },
    { id: 'review', label: 'Revision', color: 'border-t-purple-500' },
    { id: 'completed', label: 'Completado', color: 'border-t-green-500' },
    { id: 'blocked', label: 'Bloqueado', color: 'border-t-red-500' },
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
    return (
        <div className="kanban-column">
            <div className={cn('kanban-column-header', column.color)}>
                <h3 className="font-medium">{column.label}</h3>
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
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Progreso</th>
                        <th>Subtareas</th>
                        <th>Agente</th>
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
                            <td>
                                <span className={cn('status-badge', getStatusColor(task.status))}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                <span
                                    className={cn('priority-badge', getPriorityColor(task.priority))}
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
                                {task.agentName?.split('-').pop() || '-'}
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

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const projectId = parseInt(id || '0', 10);

    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
    const { data: tasks, isLoading: tasksLoading } = useProjectTasks(projectId);
    const { data: agents } = useAgents();

    const filteredTasks = tasks?.filter((t: Task) => {
        const matchesSearch =
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.taskCode?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || t.status === statusFilter;
        return matchesSearch && matchesStatus;
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

    // Loading state
    if (projectLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Error state
    if (projectError || !project) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold">Proyecto no encontrado</h2>
                <p className="text-muted-foreground">
                    El proyecto con ID {projectId} no existe o no tienes acceso.
                </p>
                <button
                    onClick={() => navigate('/projects')}
                    className="btn-primary"
                >
                    Volver a Proyectos
                </button>
            </div>
        );
    }

    return (
        <div className="project-detail-layout">
            {/* Main content area */}
            <div className="project-detail-main">
                {/* Header */}
                <ProjectHeader project={project} />

                {/* Stats row */}
                <ProjectStatsRow
                    project={project}
                    tasks={tasks || []}
                    agents={agents || []}
                />

                {/* View tabs and filters */}
                <div className="project-views-header">
                    <div className="view-tabs">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={cn('view-tab', viewMode === 'kanban' && 'active')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn('view-tab', viewMode === 'list' && 'active')}
                        >
                            <List className="h-4 w-4" />
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={cn('view-tab', viewMode === 'gantt' && 'active')}
                        >
                            <GanttChartSquare className="h-4 w-4" />
                            Gantt
                        </button>
                    </div>

                    <div className="view-filters">
                        <div className="filter-search-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="filter-search-input-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select-sm"
                        >
                            <option value="">Todos</option>
                            {KANBAN_COLUMNS.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tasks content */}
                <div className="project-tasks-content">
                    {tasksLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : viewMode === 'kanban' ? (
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
                    ) : viewMode === 'list' ? (
                        <ListView tasks={filteredTasks || []} onTaskClick={handleTaskClick} />
                    ) : (
                        <GanttView
                            tasks={filteredTasks || []}
                            onTaskClick={handleTaskClick}
                        />
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="project-detail-sidebar">
                <ProjectTeamSection agents={agents || []} />
                <ProjectActivityFeed projectId={projectId} />
            </div>

            {/* Task Detail Drawer */}
            <TaskDetailDrawer
                taskId={selectedTaskId}
                isOpen={selectedTaskId !== null}
                onClose={handleCloseDrawer}
            />
        </div>
    );
}

export default ProjectDetailPage;
