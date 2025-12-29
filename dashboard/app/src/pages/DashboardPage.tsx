import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FolderKanban,
    CheckCircle2,
    Clock,
    Bot,
    Loader2,
    AlertCircle,
    LayoutGrid,
    List,
    Calendar,
    DollarSign,
    Users,
    Plus,
} from 'lucide-react';
import { useDashboardOverview, useProjects } from '@/hooks/useApi';
import { formatDate, cn } from '@/lib/utils';
import { MiniTrello as MiniTrelloComponent } from '@/components/common/MiniTrello';
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

// Board stats calculated from real task data
interface BoardStats {
    backlog: number;  // 0 - no separate backlog status
    todo: number;     // pending tasks
    doing: number;    // in_progress tasks
    done: number;     // completed tasks
    blocked: number;  // blocked tasks
}

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

function StatCard({
    title,
    value,
    icon: Icon,
    iconClass,
    onClick,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconClass: string;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`stat-card ${onClick ? 'cursor-pointer' : ''}`}
            title={onClick ? `Ver ${title.toLowerCase()}` : undefined}
        >
            <div className={`stat-icon ${iconClass}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="stat-content">
                <div className="stat-label">{title}</div>
                <div className="stat-value">{value}</div>
            </div>
        </div>
    );
}

export function DashboardPage() {
    const navigate = useNavigate();
    const { data: stats, isLoading: statsLoading } = useDashboardOverview();
    const { data: projects, isLoading: projectsLoading } = useProjects();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Calculate board stats per project using fields from backend
    // MiniTrello mapping: pending -> todo, in_progress -> doing, completed -> done
    const projectBoardStats = (projects || []).reduce((acc: Record<number, BoardStats>, project: Project) => {
        acc[project.id] = {
            backlog: 0, // No separate backlog status in current schema
            todo: project.tasksPending || 0,
            doing: project.tasksInProgress || 0,
            done: project.tasksCompleted || 0,
            blocked: project.tasksBlocked || 0,
        };
        return acc;
    }, {} as Record<number, BoardStats>);

    const handleNavigateProjects = () => navigate('/projects');
    const handleNavigateProject = (projectId: number) => navigate(`/projects/${projectId}`);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title">Dashboard</h1>
                    <p className="section-subtitle">Vista ejecutiva del estado de operaciones</p>
                </div>
                <div className="section-actions">
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
                <StatCard
                    title="Proyectos Activos"
                    value={statsLoading ? '-' : (stats?.activeProjects || projects?.length || 0)}
                    icon={FolderKanban}
                    iconClass="projects"
                    onClick={handleNavigateProjects}
                />
                <StatCard
                    title="Tareas Completadas"
                    value={statsLoading ? '-' : (stats?.completedTasks || 0)}
                    icon={CheckCircle2}
                    iconClass="tasks"
                />
                <StatCard
                    title="En Progreso"
                    value={statsLoading ? '-' : (stats?.inProgressTasks || 0)}
                    icon={Clock}
                    iconClass="active"
                />
                <StatCard
                    title="Agentes Activos"
                    value={statsLoading ? '-' : (stats?.activeAgents || 0)}
                    icon={Bot}
                    iconClass="agents"
                />
            </div>

            {/* Projects Grid/List */}
            {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Cargando proyectos...</span>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="projects-grid">
                    {(projects || []).map((project: Project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            board={projectBoardStats[project.id] || { backlog: 0, todo: 0, doing: 0, done: 0, blocked: 0 }}
                            onClick={() => handleNavigateProject(project.id)}
                        />
                    ))}
                    {(!projects || projects.length === 0) && (
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
                            {(projects || []).map((project: Project) => (
                                <ProjectRow
                                    key={project.id}
                                    project={project}
                                    onClick={() => handleNavigateProject(project.id)}
                                />
                            ))}
                        </tbody>
                    </table>
                    {(!projects || projects.length === 0) && (
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
