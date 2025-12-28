import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    LayoutGrid,
    List,
    FolderKanban,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Users,
    Loader2,
    Target,
    Pause,
    Search,
} from 'lucide-react';
import { useProjects } from '@/hooks/useApi';
import { MiniTrello as MiniTrelloComponent } from '@/components/common/MiniTrello';
import { cn, formatDate } from '@/lib/utils';
import type { Project } from '@/types';

// Project phases with colors
const PROJECT_PHASES = {
    planning: { label: 'Planificacion', color: '#7c3aed' },
    development: { label: 'Desarrollo', color: '#0891b2' },
    active: { label: 'Desarrollo', color: '#0891b2' },
    paused: { label: 'Pausado', color: '#f59e0b' },
    completed: { label: 'Produccion', color: '#16a34a' },
    cancelled: { label: 'Cancelado', color: '#ef4444' },
};

type SortOption = 'name' | 'deadline' | 'budget' | 'completion' | 'status';
type ViewMode = 'grid' | 'list';

// Progress Segments Component (Phase indicator)
function ProgressSegments({ status }: { status: string }) {
    const phases = ['planning', 'development', 'paused', 'completed'];
    const phaseIndex = status === 'completed' ? 3 : status === 'paused' ? 2 : (status === 'development' || status === 'active') ? 1 : 0;

    return (
        <div className="progress-segments">
            {phases.map((phase, index) => (
                <div
                    key={phase}
                    className={cn(
                        'progress-segment',
                        index <= phaseIndex ? phase : 'inactive'
                    )}
                />
            ))}
        </div>
    );
}

// Board stats calculated from real task data
interface BoardStats {
    backlog: number;  // 0 - no separate backlog status
    todo: number;     // pending tasks
    doing: number;    // in_progress tasks
    done: number;     // completed tasks
    blocked: number;  // blocked tasks
}

// Project Card Component (Grid View)
function ProjectCard({ project, board, onClick }: { project: Project; board: BoardStats; onClick: () => void }) {
    const phaseInfo = PROJECT_PHASES[project.status as keyof typeof PROJECT_PHASES] || PROJECT_PHASES.planning;

    const totalTasks = project.tasksTotal || 0;
    const completedTasks = project.tasksCompleted || 0;
    const pendingTasks = totalTasks - completedTasks;

    const budgetStr = project.budgetAllocated
        ? project.budgetAllocated >= 1000
            ? `$${(project.budgetAllocated / 1000).toFixed(0)}K`
            : `$${project.budgetAllocated}`
        : '-';

    return (
        <div className="project-card" onClick={onClick}>
            {/* Header */}
            <div className="project-header">
                <div className="project-icon-wrapper">
                    <FolderKanban className="project-icon" />
                </div>
                <div className="project-title-group">
                    <h3 className="project-name">{project.name}</h3>
                    <span className="project-code">{project.code}</span>
                </div>
                <button
                    className="project-edit-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Edit action
                    }}
                    title="Editar proyecto"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {/* Tags */}
            <div className="project-tags">
                <span
                    className="project-tag"
                    style={{ backgroundColor: `${phaseInfo.color}20`, color: phaseInfo.color }}
                >
                    {phaseInfo.label}
                </span>
                {project.priority && (
                    <span className={cn(
                        'project-tag',
                        project.priority === 'critical' && 'red',
                        project.priority === 'high' && 'orange',
                        project.priority === 'medium' && 'yellow',
                        project.priority === 'low' && 'green',
                    )}>
                        {project.priority}
                    </span>
                )}
            </div>

            {/* Mini Trello Equalizer */}
            <MiniTrelloComponent board={board} showLabels={true} showCounts={true} compact={false} />

            {/* Progress Segments */}
            <ProgressSegments status={project.status} />

            {/* Stats Grid */}
            <div className="project-stats">
                <div className="stat-item">
                    <div className="stat-icon blue">
                        <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <div className="stat-value">{totalTasks}</div>
                    <div className="stat-label">Tareas</div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon yellow">
                        <Clock className="h-3 w-3" />
                    </div>
                    <div className="stat-value">{pendingTasks}</div>
                    <div className="stat-label">Pend.</div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon green">
                        <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <div className="stat-value">{completedTasks}</div>
                    <div className="stat-label">Compl.</div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon orange">
                        <DollarSign className="h-3 w-3" />
                    </div>
                    <div className="stat-value">{budgetStr}</div>
                    <div className="stat-label">Budget</div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon purple">
                        <Users className="h-3 w-3" />
                    </div>
                    <div className="stat-value">{project.activeAgents || 0}</div>
                    <div className="stat-label">Agentes</div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon indigo">
                        <Calendar className="h-3 w-3" />
                    </div>
                    <div className="stat-value">
                        {project.endDate ? formatDate(project.endDate) : '-'}
                    </div>
                    <div className="stat-label">Entrega</div>
                </div>
            </div>
        </div>
    );
}

// Project Row Component (List View)
function ProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
    const phaseInfo = PROJECT_PHASES[project.status as keyof typeof PROJECT_PHASES] || PROJECT_PHASES.planning;
    const totalTasks = project.tasksTotal || 0;
    const completedTasks = project.tasksCompleted || 0;
    const pendingTasks = totalTasks - completedTasks;
    const progress = project.progress || 0;

    const budgetStr = project.budgetAllocated
        ? project.budgetAllocated >= 1000
            ? `$${(project.budgetAllocated / 1000).toFixed(0)}K`
            : `$${project.budgetAllocated}`
        : '-';

    return (
        <tr onClick={onClick} className="project-row">
            <td>
                <div className="flex items-center gap-3">
                    <div className="project-icon-sm">
                        <FolderKanban className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="project-name-sm">{project.name}</div>
                        <div className="project-code-sm">{project.code}</div>
                    </div>
                </div>
            </td>
            <td>
                <span
                    className="phase-badge"
                    style={{ backgroundColor: `${phaseInfo.color}20`, color: phaseInfo.color }}
                >
                    {phaseInfo.label}
                </span>
            </td>
            <td className="text-center hide-sm">
                <span className="stat-blue">{totalTasks}</span>
            </td>
            <td className="text-center hide-md">
                <span className="stat-yellow">{pendingTasks}</span>
            </td>
            <td className="text-center hide-md">
                <span className="stat-green">{completedTasks}</span>
            </td>
            <td className="text-center hide-lg">
                <span className="stat-orange">{budgetStr}</span>
            </td>
            <td className="text-center hide-lg">
                <span className="stat-purple">{project.activeAgents || 0}</span>
            </td>
            <td className="text-center hide-sm">
                <span className="stat-indigo">
                    {project.endDate ? formatDate(project.endDate) : '-'}
                </span>
            </td>
            <td className="text-center">
                <div className="progress-bar-sm">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-text">{progress}%</span>
            </td>
        </tr>
    );
}

export function ProjectsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { data: projects, isLoading } = useProjects();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [search, setSearch] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // Calculate metrics
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter((p: Project) =>
        ['planning', 'development', 'testing', 'deployment'].includes(p.status)
    ).length || 0;
    const completedProjects = projects?.filter((p: Project) => p.status === 'completed').length || 0;
    const pausedProjects = projects?.filter((p: Project) =>
        ['on_hold', 'cancelled'].includes(p.status)
    ).length || 0;

    // Calculate board stats per project using fields from backend
    // MiniTrello mapping: pending -> todo, in_progress -> doing, completed -> done
    // Data comes directly from DB queries, no client-side filtering needed
    const projectBoardStats = (projects || []).reduce((acc: Record<number, { backlog: number; todo: number; doing: number; done: number; blocked: number }>, project: Project) => {
        acc[project.id] = {
            backlog: 0, // No separate backlog status in current schema
            todo: project.tasksPending || 0,
            doing: project.tasksInProgress || 0,
            done: project.tasksCompleted || 0,
            blocked: project.tasksBlocked || 0,
        };
        return acc;
    }, {} as Record<number, BoardStats>);

    // Filter projects by search and status
    const filteredProjects = (projects || []).filter((project: Project) => {
        // Search filter
        if (search && search.length >= 3) {
            const searchLower = search.toLowerCase();
            const matchesSearch = (
                project.name.toLowerCase().includes(searchLower) ||
                project.code.toLowerCase().includes(searchLower) ||
                (project.description?.toLowerCase().includes(searchLower) || false)
            );
            if (!matchesSearch) return false;
        }

        // Status filter
        if (selectedStatuses.length > 0) {
            if (!selectedStatuses.includes(project.status)) return false;
        }

        return true;
    });

    // Sort projects
    const sortedProjects = [...filteredProjects].sort((a: Project, b: Project) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'deadline':
                return (new Date(a.endDate || 0)).getTime() - (new Date(b.endDate || 0)).getTime();
            case 'budget':
                return (b.budgetAllocated || 0) - (a.budgetAllocated || 0);
            case 'completion':
                return (b.progress || 0) - (a.progress || 0);
            case 'status':
                return a.status.localeCompare(b.status);
            default:
                return 0;
        }
    });

    const handleProjectClick = (id: number) => {
        navigate(`/projects/${id}`);
    };

    const toggleStatus = (status: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // If we have a projectId, show project detail (TODO: implement)
    if (projectId) {
        const project = projects?.find((p: Project) => p.id === parseInt(projectId));
        if (project) {
            return (
                <div className="space-y-6">
                    <div className="section-header">
                        <div>
                            <h1 className="section-title">{project.name}</h1>
                            <p className="section-subtitle">{project.code} - {project.description}</p>
                        </div>
                        <button
                            onClick={() => navigate('/projects')}
                            className="btn-secondary"
                        >
                            Volver
                        </button>
                    </div>
                    {/* TODO: Project detail view */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <p className="text-muted-foreground">Vista detallada del proyecto (en desarrollo)</p>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title">Proyectos</h1>
                    <p className="section-subtitle">
                        {totalProjects} proyectos en el pipeline
                    </p>
                </div>
                <div className="section-actions">
                    {/* Sort Buttons */}
                    <div className="sort-buttons">
                        <button
                            className={cn('sort-btn', sortBy === 'name' && 'active')}
                            onClick={() => setSortBy('name')}
                        >
                            NOMBRE
                        </button>
                        <button
                            className={cn('sort-btn', sortBy === 'deadline' && 'active')}
                            onClick={() => setSortBy('deadline')}
                        >
                            FECHA
                        </button>
                        <button
                            className={cn('sort-btn', sortBy === 'budget' && 'active')}
                            onClick={() => setSortBy('budget')}
                        >
                            $$$
                        </button>
                        <button
                            className={cn('sort-btn', sortBy === 'completion' && 'active')}
                            onClick={() => setSortBy('completion')}
                        >
                            %
                        </button>
                        <button
                            className={cn('sort-btn', sortBy === 'status' && 'active')}
                            onClick={() => setSortBy('status')}
                        >
                            FASE
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="view-toggle">
                        <button
                            className={cn('view-toggle-btn', viewMode === 'grid' && 'active')}
                            onClick={() => setViewMode('grid')}
                            title="Vista Grid"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            className={cn('view-toggle-btn', viewMode === 'list' && 'active')}
                            onClick={() => setViewMode('list')}
                            title="Vista Lista"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="dashboard-stats-row">
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Proyectos</div>
                        <div className="stat-value">{totalProjects}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <Target className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Activos</div>
                        <div className="stat-value">{activeProjects}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Completados</div>
                        <div className="stat-value">{completedProjects}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellow">
                        <Pause className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">En Pausa</div>
                        <div className="stat-value">{pausedProjects}</div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos (mínimo 3 caracteres)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {sortedProjects.length} {sortedProjects.length === 1 ? 'proyecto' : 'proyectos'}
                    </span>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fase:</span>
                    {Object.entries(PROJECT_PHASES).map(([status, info]) => {
                        const isSelected = selectedStatuses.includes(status);
                        const count = projects?.filter((p: Project) => p.status === status).length || 0;
                        if (count === 0) return null;
                        return (
                            <button
                                key={status}
                                onClick={() => toggleStatus(status)}
                                className={cn(
                                    'memory-tag-filter',
                                    isSelected && 'selected'
                                )}
                                style={
                                    isSelected
                                        ? { backgroundColor: info.color, color: '#fff' }
                                        : { backgroundColor: `${info.color}20`, color: info.color }
                                }
                            >
                                {info.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Projects Grid */}
            {viewMode === 'grid' ? (
                <div className="projects-grid">
                    {sortedProjects.map((project: Project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            board={projectBoardStats[project.id] || { backlog: 0, todo: 0, doing: 0, done: 0, blocked: 0 }}
                            onClick={() => handleProjectClick(project.id)}
                        />
                    ))}
                    {sortedProjects.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay proyectos todavia</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="project-card" style={{ padding: 0 }}>
                    <table className="list-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Proyecto</th>
                                <th style={{ width: '12%' }}>Fase</th>
                                <th className="hide-sm" style={{ width: '9%', textAlign: 'center' }}>Tareas</th>
                                <th className="hide-md" style={{ width: '8%', textAlign: 'center' }}>Pend.</th>
                                <th className="hide-md" style={{ width: '8%', textAlign: 'center' }}>Compl.</th>
                                <th className="hide-lg" style={{ width: '10%', textAlign: 'center' }}>Budget</th>
                                <th className="hide-lg" style={{ width: '9%', textAlign: 'center' }}>Agentes</th>
                                <th className="hide-sm" style={{ width: '11%', textAlign: 'center' }}>Entrega</th>
                                <th style={{ width: '8%', textAlign: 'center' }}>Progreso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProjects.map((project: Project) => (
                                <ProjectRow
                                    key={project.id}
                                    project={project}
                                    onClick={() => handleProjectClick(project.id)}
                                />
                            ))}
                        </tbody>
                    </table>
                    {sortedProjects.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay proyectos todavia</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
