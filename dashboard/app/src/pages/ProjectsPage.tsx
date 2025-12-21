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
} from 'lucide-react';
import { useProjects } from '@/hooks/useApi';
import { cn, formatDate } from '@/lib/utils';
import type { Project } from '@/types';

// Project phases with colors
const PROJECT_PHASES = {
    planning: { label: 'Planificacion', color: '#7c3aed' },
    active: { label: 'Desarrollo', color: '#0891b2' },
    paused: { label: 'Pausado', color: '#f59e0b' },
    completed: { label: 'Produccion', color: '#16a34a' },
    cancelled: { label: 'Cancelado', color: '#ef4444' },
};

type SortOption = 'name' | 'deadline' | 'budget' | 'completion' | 'status';
type ViewMode = 'grid' | 'list';

// Mini Trello "Equalizer" Component
function MiniTrello({ board }: { board: { backlog: number; todo: number; doing: number; done: number } }) {
    const totalSlots = 8;

    const generateSlots = (count: number, colorClass: string) => {
        const filledCount = Math.min(count, totalSlots);
        return Array.from({ length: totalSlots }, (_, i) => (
            <div
                key={i}
                className={cn(
                    'trello-slot',
                    i < filledCount && `filled ${colorClass}`
                )}
            />
        ));
    };

    return (
        <div className="mini-trello">
            <div className="trello-column backlog">
                <div className="trello-column-header">BACKLOG</div>
                <div className="trello-slots">{generateSlots(board.backlog, 'backlog')}</div>
            </div>
            <div className="trello-column todo">
                <div className="trello-column-header">TODO</div>
                <div className="trello-slots">{generateSlots(board.todo, 'todo')}</div>
            </div>
            <div className="trello-column doing">
                <div className="trello-column-header">DOING</div>
                <div className="trello-slots">{generateSlots(board.doing, 'doing')}</div>
            </div>
            <div className="trello-column done">
                <div className="trello-column-header">DONE</div>
                <div className="trello-slots">{generateSlots(board.done, 'done')}</div>
            </div>
        </div>
    );
}

// Progress Segments Component (Phase indicator)
function ProgressSegments({ status }: { status: string }) {
    const phases = ['planning', 'active', 'paused', 'completed'];
    const phaseIndex = status === 'completed' ? 3 : status === 'paused' ? 2 : status === 'active' ? 1 : 0;

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
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
    const phaseInfo = PROJECT_PHASES[project.status as keyof typeof PROJECT_PHASES] || PROJECT_PHASES.planning;

    // Calculate board stats from project data
    const totalTasks = project.tasksTotal || 0;
    const completedTasks = project.tasksCompleted || 0;
    const pendingTasks = totalTasks - completedTasks;
    const inProgressTasks = Math.min(Math.floor(pendingTasks * 0.3), 3); // Estimate

    const board = {
        backlog: Math.floor(pendingTasks * 0.4),
        todo: Math.floor(pendingTasks * 0.3),
        doing: inProgressTasks,
        done: completedTasks,
    };

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
            <MiniTrello board={board} />

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
            <td className="text-center">
                <span className="stat-blue">{totalTasks}</span>
            </td>
            <td className="text-center">
                <span className="stat-yellow">{pendingTasks}</span>
            </td>
            <td className="text-center">
                <span className="stat-green">{completedTasks}</span>
            </td>
            <td className="text-center">
                <span className="stat-orange">{budgetStr}</span>
            </td>
            <td className="text-center">
                <span className="stat-purple">{project.activeAgents || 0}</span>
            </td>
            <td className="text-center">
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

    // Sort projects
    const sortedProjects = [...(projects || [])].sort((a: Project, b: Project) => {
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
                        {projects?.length || 0} proyectos en el pipeline
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

            {/* Projects Grid */}
            {viewMode === 'grid' ? (
                <div className="projects-grid">
                    {sortedProjects.map((project: Project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
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
                <div className="project-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="list-table">
                        <thead>
                            <tr>
                                <th style={{ width: '22%' }}>Proyecto</th>
                                <th style={{ width: '12%' }}>Fase</th>
                                <th style={{ width: '8%', textAlign: 'center' }}>Tareas</th>
                                <th style={{ width: '8%', textAlign: 'center' }}>Pend.</th>
                                <th style={{ width: '8%', textAlign: 'center' }}>Compl.</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Budget</th>
                                <th style={{ width: '8%', textAlign: 'center' }}>Agentes</th>
                                <th style={{ width: '12%', textAlign: 'center' }}>Entrega</th>
                                <th style={{ width: '12%', textAlign: 'center' }}>Progreso</th>
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
