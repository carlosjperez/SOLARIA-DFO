import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    LayoutGrid,
    List,
    GanttChartSquare,
    Clock,
    Loader2,
    Bot,
    User,
    Calendar,
    Hourglass,
    ListChecks,
    AlignLeft,
    Tags,
    X,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Archive,
} from 'lucide-react';
import { useProject, useProjectTasks, useAgents, useCreateTask, useTaskTags, useAllTags, useAddTaskTag, useRemoveTaskTag } from '@/hooks/useApi';
import { Modal } from '@/components/common/Modal';
import { TaskItemsList } from '@/components/tasks/TaskItemsList';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Task, Agent, TaskTag } from '@/types';

type ViewMode = 'kanban' | 'list' | 'gantt';
type SortColumn = 'code' | 'title' | 'priority' | 'status' | 'progress' | 'agent' | 'date';
type SortDirection = 'asc' | 'desc';

// Sort order mappings
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER: Record<string, number> = { pending: 0, in_progress: 1, blocked: 2, completed: 3 };

// Mapeo de status de API a columnas Kanban
const STATUS_TO_COLUMN: Record<string, string> = {
    pending: 'todo',
    blocked: 'backlog',
    in_progress: 'doing',
    review: 'doing',
    completed: 'done',
    cancelled: 'done',
};

// Columnas del Kanban - Exacto como el original
const KANBAN_COLUMNS = [
    { key: 'backlog', label: 'Backlog', color: '#64748b' },
    { key: 'todo', label: 'Por Hacer', color: '#f59e0b' },
    { key: 'doing', label: 'En Progreso', color: '#3b82f6' },
    { key: 'done', label: 'Completadas', color: '#22c55e' },
] as const;

// Priority colors y labels
const PRIORITY_CONFIG = {
    critical: { color: '#ef4444', label: 'P0', bg: 'rgba(239, 68, 68, 0.2)' },
    high: { color: '#f59e0b', label: 'P1', bg: 'rgba(249, 115, 22, 0.2)' },
    medium: { color: '#3b82f6', label: 'P2', bg: 'rgba(59, 130, 246, 0.2)' },
    low: { color: '#64748b', label: 'P3', bg: 'rgba(100, 116, 139, 0.2)' },
};

// Status labels
const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    review: 'En Revision',
    completed: 'Completada',
    blocked: 'Bloqueada',
    cancelled: 'Cancelada',
};

// ============================================
// TaskCard Component - Exacto como el original
// ============================================
function TaskCard({
    task,
    agent,
    onClick,
}: {
    task: Task;
    agent?: Agent;
    onClick: () => void;
}) {
    const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
    const isInProgress = task.status === 'in_progress';
    const taskCode = task.taskCode || `#${task.id}`;

    return (
        <div
            onClick={onClick}
            className="task-card bg-secondary border border-border rounded-lg p-3 cursor-pointer transition-all hover:border-solaria hover:-translate-y-0.5"
        >
            {/* Header: Title + Priority Badge */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[13px] font-medium text-foreground leading-tight">
                    <span className="text-solaria font-semibold mr-1.5">{taskCode}</span>
                    {task.title}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                        style={{ background: priority.bg, color: priority.color }}
                    >
                        {priority.label}
                    </span>
                    {task.estimatedHours && task.estimatedHours > 0 && (
                        <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Hourglass className="h-2.5 w-2.5" />
                            {task.estimatedHours}h
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar - Solo en columna "En Progreso" */}
            {isInProgress && task.progress > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex-1 h-1 bg-background/50 rounded overflow-hidden">
                        <div
                            className="h-full rounded transition-all"
                            style={{
                                width: `${task.progress}%`,
                                background: `linear-gradient(90deg, ${priority.color}, ${priority.color}dd)`,
                            }}
                        />
                    </div>
                    <span
                        className="text-[10px] font-bold min-w-[32px] text-right"
                        style={{ color: task.progress >= 100 ? '#22c55e' : priority.color }}
                    >
                        {task.progress}%
                    </span>
                </div>
            )}

            {/* Footer: Agent + Time */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {agent ? (
                        <span className="flex items-center gap-1 text-[10px] text-solaria bg-solaria/10 px-1.5 py-0.5 rounded">
                            <Bot className="h-3 w-3" />
                            {agent.name.replace('SOLARIA-', '')}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <User className="h-3 w-3" />
                            Sin asignar
                        </span>
                    )}
                    {task.status && task.status !== 'in_progress' && (
                        <span className="text-[8px] px-1 py-0.5 bg-secondary rounded text-muted-foreground">
                            {STATUS_LABELS[task.status] || task.status}
                        </span>
                    )}
                </div>
                {task.createdAt && (
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(task.createdAt)}
                    </span>
                )}
            </div>
        </div>
    );
}

// ============================================
// KanbanColumn Component
// ============================================
function KanbanColumn({
    column,
    tasks,
    agents,
    onTaskClick,
    onAddTask,
}: {
    column: typeof KANBAN_COLUMNS[number];
    tasks: Task[];
    agents: Agent[];
    onTaskClick: (taskId: number) => void;
    onAddTask?: () => void;
}) {
    const getAgent = (agentId?: number) => agents.find(a => a.id === agentId);

    return (
        <div className={cn(
            'flex-1 min-w-0 bg-secondary/30 rounded-xl flex flex-col h-full overflow-hidden',
            `kanban-column-${column.key}`
        )}>
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: column.color }}
                    />
                    {column.label}
                </span>
                <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {tasks.length}
                </span>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        agent={getAgent(task.assignedAgentId)}
                        onClick={() => onTaskClick(task.id)}
                    />
                ))}

                {/* Add button - Solo en Backlog */}
                {column.key === 'backlog' && onAddTask && (
                    <button
                        onClick={onAddTask}
                        className="w-full p-2.5 border-2 border-dashed border-border rounded-lg text-muted-foreground text-xs hover:border-solaria hover:text-solaria transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar tarea
                    </button>
                )}

                {tasks.length === 0 && column.key !== 'backlog' && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                        Sin tareas
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// KanbanView Component - Layout exacto del original
// ============================================
function KanbanView({
    tasks,
    agents,
    onTaskClick,
    onCreateTask,
}: {
    tasks: Task[];
    agents: Agent[];
    onTaskClick: (taskId: number) => void;
    onCreateTask: () => void;
}) {
    // Agrupar tareas por columna Kanban
    const tasksByColumn = useMemo(() => {
        const result: Record<string, Task[]> = {
            backlog: [],
            todo: [],
            doing: [],
            done: [],
        };

        tasks.forEach(task => {
            const columnKey = STATUS_TO_COLUMN[task.status] || 'todo';
            result[columnKey].push(task);
        });

        return result;
    }, [tasks]);

    return (
        <div className="kanban-board flex gap-3 h-[calc(100vh-320px)] min-h-[400px]">
            {KANBAN_COLUMNS.map(col => (
                <KanbanColumn
                    key={col.key}
                    column={col}
                    tasks={tasksByColumn[col.key] || []}
                    agents={agents}
                    onTaskClick={onTaskClick}
                    onAddTask={col.key === 'backlog' ? onCreateTask : undefined}
                />
            ))}
        </div>
    );
}

// ============================================
// SortableHeader Component - Clickable column headers
// ============================================
function SortableHeader({
    label,
    column,
    currentColumn,
    currentDirection,
    onSort,
    className = '',
}: {
    label: string;
    column: SortColumn;
    currentColumn: SortColumn;
    currentDirection: SortDirection;
    onSort: (column: SortColumn) => void;
    className?: string;
}) {
    const isActive = currentColumn === column;

    return (
        <button
            onClick={() => onSort(column)}
            className={cn(
                'flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors group',
                isActive ? 'text-solaria' : 'text-muted-foreground hover:text-foreground',
                className
            )}
        >
            {label}
            <span className="text-muted-foreground group-hover:text-foreground">
                {isActive ? (
                    currentDirection === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                    ) : (
                        <ArrowDown className="h-3 w-3" />
                    )
                ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                )}
            </span>
        </button>
    );
}

// ============================================
// ListView Component - Proper sortable table
// ============================================
function ListView({
    tasks,
    agents,
    onTaskClick,
}: {
    tasks: Task[];
    agents: Agent[];
    onTaskClick: (taskId: number) => void;
}) {
    const [sortColumn, setSortColumn] = useState<SortColumn>('priority');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const getAgent = (agentId?: number) => agents.find(a => a.id === agentId);

    const handleSort = useCallback((column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    // Sort tasks based on current column and direction
    const sortedTasks = useMemo(() => {
        const sorted = [...tasks].sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case 'code':
                    const codeA = a.taskCode || `#${a.id}`;
                    const codeB = b.taskCode || `#${b.id}`;
                    comparison = codeA.localeCompare(codeB);
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'priority':
                    comparison = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
                    break;
                case 'status':
                    comparison = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
                    break;
                case 'progress':
                    comparison = (a.progress || 0) - (b.progress || 0);
                    break;
                case 'agent':
                    const agentA = agents.find(ag => ag.id === a.assignedAgentId)?.name || 'ZZZ';
                    const agentB = agents.find(ag => ag.id === b.assignedAgentId)?.name || 'ZZZ';
                    comparison = agentA.localeCompare(agentB);
                    break;
                case 'date':
                    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    comparison = dateA - dateB;
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [tasks, sortColumn, sortDirection, agents]);

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col">
            {/* Sortable Table Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border sticky top-0 z-10">
                <div className="w-1 flex-shrink-0" /> {/* Priority bar spacer */}
                <SortableHeader
                    label="Código"
                    column="code"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-20"
                />
                <SortableHeader
                    label="Tarea"
                    column="title"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="flex-1 min-w-0"
                />
                <SortableHeader
                    label="Estado"
                    column="status"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-24"
                />
                <SortableHeader
                    label="Prioridad"
                    column="priority"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-20"
                />
                <SortableHeader
                    label="Progreso"
                    column="progress"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-28"
                />
                <SortableHeader
                    label="Agente"
                    column="agent"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-28"
                />
                <SortableHeader
                    label="Fecha"
                    column="date"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-24"
                />
                <div className="w-6 flex-shrink-0" /> {/* Chevron spacer */}
            </div>

            {/* Table Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {sortedTasks.map(task => {
                    const agent = getAgent(task.assignedAgentId);
                    const isCompleted = task.status === 'completed';
                    const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;

                    return (
                        <div
                            key={task.id}
                            onClick={() => onTaskClick(task.id)}
                            className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border last:border-b-0 hover:bg-secondary/30 cursor-pointer transition-colors"
                        >
                            {/* Priority bar */}
                            <div
                                className="w-1 h-10 rounded-full flex-shrink-0"
                                style={{ background: priority.color }}
                            />

                            {/* Código */}
                            <div className="w-20 flex-shrink-0">
                                <span className="text-xs text-solaria font-mono font-semibold">
                                    {task.taskCode || `#${task.id}`}
                                </span>
                            </div>

                            {/* Tarea (título) */}
                            <div className="flex-1 min-w-0">
                                <span className={cn(
                                    'text-sm font-medium truncate block',
                                    isCompleted && 'line-through opacity-70'
                                )}>
                                    {task.title}
                                </span>
                            </div>

                            {/* Estado */}
                            <div className="w-24 flex-shrink-0">
                                <span
                                    className="inline-block px-2 py-1 rounded text-[10px] font-medium"
                                    style={{ background: priority.bg, color: priority.color }}
                                >
                                    {STATUS_LABELS[task.status] || task.status}
                                </span>
                            </div>

                            {/* Prioridad */}
                            <div className="w-20 flex-shrink-0">
                                <span
                                    className="inline-block px-2 py-1 rounded text-[10px] font-bold"
                                    style={{ background: priority.bg, color: priority.color }}
                                >
                                    {priority.label}
                                </span>
                            </div>

                            {/* Progreso */}
                            <div className="w-28 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                isCompleted ? 'bg-green-500' : 'bg-solaria'
                                            )}
                                            style={{ width: `${task.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-8 text-right">
                                        {task.progress}%
                                    </span>
                                </div>
                            </div>

                            {/* Agente */}
                            <div className="w-28 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                    {agent ? (
                                        <>
                                            <Bot className="h-3 w-3 text-solaria" />
                                            <span className="text-xs truncate">
                                                {agent.name.replace('SOLARIA-', '')}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                                    )}
                                </div>
                            </div>

                            {/* Fecha */}
                            <div className="w-24 flex-shrink-0 text-xs text-muted-foreground">
                                {task.updatedAt
                                    ? formatRelativeTime(task.updatedAt)
                                    : task.createdAt
                                    ? formatRelativeTime(task.createdAt)
                                    : '-'}
                            </div>

                            {/* Chevron */}
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                    );
                })}

                {sortedTasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No hay tareas
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// GanttViewOriginal Component - Barras horizontales con progreso y sortable headers
// ============================================
function GanttViewOriginal({
    tasks,
    agents,
    onTaskClick,
}: {
    tasks: Task[];
    agents: Agent[];
    onTaskClick: (taskId: number) => void;
}) {
    const [sortColumn, setSortColumn] = useState<SortColumn>('priority');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const getAgent = (agentId?: number) => agents.find(a => a.id === agentId);

    const handleSort = useCallback((column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    // Sort tasks based on current column and direction
    const sortedTasks = useMemo(() => {
        const sorted = [...tasks].sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case 'code':
                    const codeA = a.taskCode || `#${a.id}`;
                    const codeB = b.taskCode || `#${b.id}`;
                    comparison = codeA.localeCompare(codeB);
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'priority':
                    comparison = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
                    break;
                case 'status':
                    comparison = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
                    break;
                case 'progress':
                    comparison = (a.progress || 0) - (b.progress || 0);
                    break;
                case 'agent':
                    const agentA = agents.find(ag => ag.id === a.assignedAgentId)?.name || 'ZZZ';
                    const agentB = agents.find(ag => ag.id === b.assignedAgentId)?.name || 'ZZZ';
                    comparison = agentA.localeCompare(agentB);
                    break;
                case 'date':
                    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    comparison = dateA - dateB;
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [tasks, sortColumn, sortDirection, agents]);

    // Calcular maxHours para escalar las barras
    const maxHours = useMemo(() => {
        return Math.max(...tasks.map(t => t.estimatedHours || 0), 8);
    }, [tasks]);

    // Gradientes por prioridad
    const getPriorityGradient = (priority: string) => {
        switch (priority) {
            case 'critical': return 'linear-gradient(to right, #ef4444, #dc2626)';
            case 'high': return 'linear-gradient(to right, #f97316, #ea580c)';
            case 'medium': return 'linear-gradient(to right, #f6921d, #d97b0d)';
            case 'low': return 'linear-gradient(to right, #6b7280, #4b5563)';
            default: return 'linear-gradient(to right, #f6921d, #d97b0d)';
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col">
            {/* Header con leyenda */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                    <GanttChartSquare className="h-5 w-5 text-solaria" />
                    Vista Gantt
                </h3>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded" style={{ background: '#ef4444' }} />
                        P0
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded" style={{ background: '#f97316' }} />
                        P1
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded" style={{ background: '#f6921d' }} />
                        P2
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded" style={{ background: '#6b7280' }} />
                        P3
                    </span>
                </div>
            </div>

            {/* Sortable Column Headers */}
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border flex-shrink-0 sticky top-0 z-10">
                <SortableHeader
                    label="Código"
                    column="code"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-20"
                />
                <SortableHeader
                    label="Tarea"
                    column="title"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-48"
                />
                <SortableHeader
                    label="Agente"
                    column="agent"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-24"
                />
                <SortableHeader
                    label="Estado"
                    column="status"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-24"
                />
                <SortableHeader
                    label="Prioridad"
                    column="priority"
                    currentColumn={sortColumn}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="w-20"
                />
                <div className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Timeline / Progreso
                </div>
            </div>

            {/* Rows - Scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
                {sortedTasks.map(task => {
                    const agent = getAgent(task.assignedAgentId);
                    const isCompleted = task.status === 'completed';
                    const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
                    const barWidth = ((task.estimatedHours || 0) / maxHours) * 100;
                    const progress = task.progress || 0;

                    return (
                        <div
                            key={task.id}
                            onClick={() => onTaskClick(task.id)}
                            className="flex items-center gap-2 py-3 px-4 hover:bg-secondary/30 cursor-pointer transition-colors"
                        >
                            {/* Código */}
                            <div className="w-20 flex-shrink-0">
                                <span className="text-xs text-solaria font-mono font-semibold">
                                    {task.taskCode || `#${task.id}`}
                                </span>
                            </div>

                            {/* Tarea */}
                            <div className="w-48 flex-shrink-0 min-w-0">
                                <span className={cn(
                                    'text-sm truncate font-medium block',
                                    isCompleted && 'line-through opacity-70'
                                )}>
                                    {task.title}
                                </span>
                            </div>

                            {/* Agente */}
                            <div className="w-24 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                    {agent ? (
                                        <>
                                            <Bot className="h-3 w-3 text-solaria" />
                                            <span className="text-xs truncate">
                                                {agent.name.replace('SOLARIA-', '')}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                                    )}
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="w-24 flex-shrink-0">
                                <span
                                    className="inline-block px-2 py-1 rounded text-[10px] font-medium"
                                    style={{ background: priority.bg, color: priority.color }}
                                >
                                    {STATUS_LABELS[task.status] || task.status}
                                </span>
                            </div>

                            {/* Prioridad */}
                            <div className="w-20 flex-shrink-0">
                                <span
                                    className="inline-block px-2 py-1 rounded text-[10px] font-bold"
                                    style={{ background: priority.bg, color: priority.color }}
                                >
                                    {priority.label}
                                </span>
                            </div>

                            {/* Gantt bar (flex-1) */}
                            <div className="flex-1 h-7 bg-secondary/50 rounded relative overflow-hidden">
                                {barWidth > 0 && (
                                    <div
                                        className="absolute inset-y-0 left-0 rounded flex items-center transition-all"
                                        style={{
                                            width: `${Math.max(barWidth, 10)}%`,
                                            background: getPriorityGradient(task.priority),
                                        }}
                                    >
                                        {/* Progress overlay */}
                                        <div
                                            className="absolute inset-y-0 left-0 bg-white/30 rounded"
                                            style={{ width: `${progress}%` }}
                                        />
                                        <span className="text-[10px] text-white px-2 font-medium relative z-10 drop-shadow whitespace-nowrap">
                                            {task.estimatedHours || 0}h - {progress}%
                                        </span>
                                    </div>
                                )}
                                {barWidth === 0 && (
                                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                        Sin estimación
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {sortedTasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No hay tareas
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// TaskDetailModal Component
// ============================================
function TaskDetailModal({
    task,
    agent,
    isOpen,
    onClose,
}: {
    task: Task | null;
    agent?: Agent;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [showTagSelector, setShowTagSelector] = useState(false);

    // Tags hooks
    const { data: taskTags = [], isLoading: loadingTaskTags } = useTaskTags(task?.id || 0);
    const { data: allTags = [] } = useAllTags();
    const addTagMutation = useAddTaskTag();
    const removeTagMutation = useRemoveTaskTag();

    // Available tags (not already assigned to this task)
    const availableTags = useMemo(() => {
        const assignedIds = new Set(taskTags.map((t: TaskTag) => t.id));
        return allTags.filter((t: TaskTag) => !assignedIds.has(t.id));
    }, [taskTags, allTags]);

    const handleAddTag = useCallback((tagId: number) => {
        if (task) {
            addTagMutation.mutate({ taskId: task.id, tagId });
            setShowTagSelector(false);
        }
    }, [task, addTagMutation]);

    const handleRemoveTag = useCallback((tagId: number) => {
        if (task) {
            removeTagMutation.mutate({ taskId: task.id, tagId });
        }
    }, [task, removeTagMutation]);

    if (!task) return null;

    const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
    const statusLabel = STATUS_LABELS[task.status] || task.status;
    const taskCode = task.taskCode || `#${task.id}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-2xl">
            {/* Custom Header */}
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
                    <span className="px-2 py-1 rounded text-[11px] bg-secondary">
                        {statusLabel}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{taskCode}</span>
                </div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlignLeft className="h-4 w-4 text-solaria" />
                        Descripcion
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {task.description || 'Sin descripcion disponible'}
                    </p>
                </div>

                {/* Progress */}
                {task.progress > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-solaria" />
                            Progreso
                        </h4>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${task.progress}%`,
                                        background: priority.color,
                                    }}
                                />
                            </div>
                            <span
                                className="text-sm font-semibold"
                                style={{ color: priority.color }}
                            >
                                {task.progress}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Subtasks */}
                <div className="border border-border rounded-lg p-4 bg-secondary/30">
                    <TaskItemsList
                        taskId={task.id}
                        editable={task.status !== 'completed'}
                        showAddForm={task.status !== 'completed'}
                    />
                </div>

                {/* Tags */}
                <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Tags className="h-4 w-4 text-solaria" />
                        Etiquetas
                    </h4>
                    <div className="flex flex-wrap gap-2 items-center">
                        {loadingTaskTags ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : taskTags.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Sin etiquetas</span>
                        ) : (
                            taskTags.map((tag: TaskTag) => (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium group"
                                    style={{
                                        backgroundColor: `${tag.color}20`,
                                        color: tag.color,
                                    }}
                                >
                                    {tag.name}
                                    <button
                                        onClick={() => handleRemoveTag(tag.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5"
                                        title="Eliminar etiqueta"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))
                        )}

                        {/* Add Tag Button/Selector */}
                        {showTagSelector ? (
                            <div className="relative">
                                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] max-h-[200px] overflow-y-auto">
                                    {availableTags.length === 0 ? (
                                        <p className="text-xs text-muted-foreground p-2">
                                            No hay etiquetas disponibles
                                        </p>
                                    ) : (
                                        availableTags.map((tag: TaskTag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => handleAddTag(tag.id)}
                                                className="w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors flex items-center gap-2"
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                <span className="text-sm">{tag.name}</span>
                                            </button>
                                        ))
                                    )}
                                    <button
                                        onClick={() => setShowTagSelector(false)}
                                        className="w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors text-xs text-muted-foreground mt-1 border-t border-border"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowTagSelector(true)}
                                className="px-2 py-1 rounded text-xs border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-solaria hover:text-solaria transition-colors"
                            >
                                + Agregar
                            </button>
                        )}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <User className="h-3 w-3 text-blue-400" />
                            Asignado a
                        </h4>
                        <p className="text-sm font-medium">
                            {agent?.name || 'Sin asignar'}
                        </p>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Hourglass className="h-3 w-3 text-yellow-400" />
                            Horas Estimadas
                        </h4>
                        <p className="text-sm font-medium">
                            {task.estimatedHours || 0} horas
                        </p>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-green-400" />
                            Fecha Creacion
                        </h4>
                        <p className="text-sm font-medium">
                            {task.createdAt
                                ? new Date(task.createdAt).toLocaleDateString('es-MX', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : 'N/A'}
                        </p>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-red-400" />
                            Ultima Actualizacion
                        </h4>
                        <p className="text-sm font-medium">
                            {task.updatedAt
                                ? formatRelativeTime(task.updatedAt)
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                >
                    Cerrar
                </button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg">
                    <Bot className="h-3.5 w-3.5" />
                    Solo el agente puede completar
                </div>
            </div>
        </Modal>
    );
}

// ============================================
// CreateTaskModal Component
// ============================================
function CreateTaskModal({
    isOpen,
    onClose,
    projectId,
    onTaskCreated,
}: {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
    onTaskCreated: () => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [estimatedHours, setEstimatedHours] = useState(1);

    const createTask = useCreateTask();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            await createTask.mutateAsync({
                projectId,
                title: title.trim(),
                description: description.trim(),
                priority,
                status: 'pending',
                estimatedHours,
            });
            setTitle('');
            setDescription('');
            setPriority('medium');
            setEstimatedHours(1);
            onTaskCreated();
            onClose();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nueva Tarea" maxWidth="max-w-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Titulo *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nombre de la tarea..."
                        className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none"
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Descripcion</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe la tarea..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Prioridad</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as typeof priority)}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none"
                        >
                            <option value="low">P3 - Baja</option>
                            <option value="medium">P2 - Media</option>
                            <option value="high">P1 - Alta</option>
                            <option value="critical">P0 - Critica</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Horas Estimadas</label>
                        <input
                            type="number"
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(Number(e.target.value))}
                            min={0.5}
                            step={0.5}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-solaria focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim() || createTask.isPending}
                        className="px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {createTask.isPending ? 'Creando...' : 'Crear Tarea'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ============================================
// ProjectTasksPage - Componente principal
// ============================================
export function ProjectTasksPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const projectId = parseInt(id || '0');

    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const { data: project, isLoading: loadingProject } = useProject(projectId);
    const { data: tasks, isLoading: loadingTasks, refetch: refetchTasks } = useProjectTasks(projectId);
    const { data: agents } = useAgents();

    // Stats por columna Kanban
    const stats = useMemo(() => {
        if (!tasks) return { backlog: 0, todo: 0, doing: 0, done: 0 };
        return {
            backlog: tasks.filter((t: Task) => STATUS_TO_COLUMN[t.status] === 'backlog').length,
            todo: tasks.filter((t: Task) => STATUS_TO_COLUMN[t.status] === 'todo').length,
            doing: tasks.filter((t: Task) => STATUS_TO_COLUMN[t.status] === 'doing').length,
            done: tasks.filter((t: Task) => STATUS_TO_COLUMN[t.status] === 'done').length,
        };
    }, [tasks]);

    // Selected task para el modal
    const selectedTask = useMemo(() => {
        if (!selectedTaskId || !tasks) return null;
        return tasks.find((t: Task) => t.id === selectedTaskId) || null;
    }, [selectedTaskId, tasks]);

    const selectedAgent = useMemo(() => {
        if (!selectedTask || !agents) return undefined;
        return agents.find(a => a.id === selectedTask.assignedAgentId);
    }, [selectedTask, agents]);

    const handleTaskClick = useCallback((taskId: number) => {
        setSelectedTaskId(taskId);
    }, []);

    const handleTaskCreated = useCallback(() => {
        refetchTasks();
    }, [refetchTasks]);

    const handleBack = () => {
        navigate(`/projects/${projectId}`);
    };

    if (loadingProject || loadingTasks) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Proyecto no encontrado</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        title="Volver al proyecto"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Tareas - {project.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {tasks?.length || 0} tareas en total
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle - Estilo exacto del original */}
                    <div className="flex bg-secondary rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                                viewMode === 'kanban'
                                    ? 'bg-solaria text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                                viewMode === 'list'
                                    ? 'bg-solaria text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <List className="h-4 w-4" />
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                                viewMode === 'gantt'
                                    ? 'bg-solaria text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <GanttChartSquare className="h-4 w-4" />
                            Gantt
                        </button>
                    </div>

                    {/* Nueva Tarea */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-solaria hover:bg-solaria/90 text-white font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Tarea
                    </button>
                </div>
            </div>

            {/* Status Counters - Estilo compacto como el original */}
            <div className="flex items-center gap-1 mb-3 flex-shrink-0 bg-secondary/50 rounded-lg p-2">
                <div className="flex-1 text-center px-3 py-1">
                    <div className="text-base font-bold" style={{ color: '#64748b' }}>
                        {stats.backlog}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase">Backlog</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1 text-center px-3 py-1">
                    <div className="text-base font-bold" style={{ color: '#f59e0b' }}>
                        {stats.todo}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase">Por Hacer</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1 text-center px-3 py-1">
                    <div className="text-base font-bold" style={{ color: '#3b82f6' }}>
                        {stats.doing}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase">En Progreso</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1 text-center px-3 py-1">
                    <div className="text-base font-bold" style={{ color: '#22c55e' }}>
                        {stats.done}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase">Completadas</div>
                </div>
            </div>

            {/* Content - Fills remaining space */}
            <div className="flex-1 min-h-0">
                {viewMode === 'kanban' && (
                    <KanbanView
                        tasks={tasks || []}
                        agents={agents || []}
                        onTaskClick={handleTaskClick}
                        onCreateTask={() => setIsCreateModalOpen(true)}
                    />
                )}

                {viewMode === 'list' && (
                    <div className="h-full">
                        <ListView
                            tasks={tasks || []}
                            agents={agents || []}
                            onTaskClick={handleTaskClick}
                        />
                    </div>
                )}

                {viewMode === 'gantt' && (
                    <div className="h-full">
                        <GanttViewOriginal
                            tasks={tasks || []}
                            agents={agents || []}
                            onTaskClick={handleTaskClick}
                        />
                    </div>
                )}
            </div>

            {/* Footer - Archivo */}
            {stats.done > 0 && (
                <div className="flex items-center justify-center py-3 border-t border-border flex-shrink-0">
                    <button
                        onClick={() => navigate('/tasks/archived')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                    >
                        <Archive className="h-4 w-4" />
                        Ver {stats.done} tareas archivadas
                    </button>
                </div>
            )}

            {/* Modals */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={projectId}
                onTaskCreated={handleTaskCreated}
            />

            <TaskDetailModal
                task={selectedTask}
                agent={selectedAgent}
                isOpen={!!selectedTaskId}
                onClose={() => setSelectedTaskId(null)}
            />
        </div>
    );
}

export default ProjectTasksPage;
