import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
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
} from 'lucide-react';
import { useProjects } from '@/hooks/useApi';
import { MiniTrello as MiniTrelloComponent } from '@/components/common/MiniTrello';
import { PageHeader } from '@/components/common/PageHeader';
import { ViewSelector } from '@/components/common/ViewSelector';
import { StatsGrid } from '@/components/common/StatsGrid';
import { StatCard } from '@/components/common/StatCard';
import { SearchInput } from '@/components/common/SearchInput';
import { ItemCounter } from '@/components/common/ItemCounter';
import { FilterGroup } from '@/components/common/FilterGroup';
import { SortBar, type SortConfig } from '@/components/common/SortBar';
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

type ViewMode = 'grid' | 'list';

// Sort options for dropdown
const SORT_OPTIONS = [
    { value: 'name', label: 'Nombre' },
    { value: 'deadline', label: 'Fecha límite' },
    { value: 'budget', label: 'Presupuesto' },
    { value: 'completion', label: 'Progreso' },
    { value: 'status', label: 'Estado/Fase' },
];

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
    const navigate = useNavigate();
    const { data: projects, isLoading } = useProjects();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'name',
        direction: 'asc',
    });
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
        let comparison = 0;

        switch (sortConfig.field) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'deadline':
                comparison = (new Date(a.endDate || 0)).getTime() - (new Date(b.endDate || 0)).getTime();
                break;
            case 'budget':
                comparison = (a.budgetAllocated || 0) - (b.budgetAllocated || 0);
                break;
            case 'completion':
                comparison = (a.progress || 0) - (b.progress || 0);
                break;
            case 'status':
                comparison = a.status.localeCompare(b.status);
                break;
            default:
                comparison = 0;
        }

        // Apply direction (asc = 1, desc = -1)
        return sortConfig.direction === 'asc' ? comparison : -comparison;
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Proyectos"
                subtitle={`${totalProjects} proyectos en el pipeline`}
                actions={
                    <>
                        {/* Sort Control */}
                        <SortBar
                            value={sortConfig}
                            onChange={setSortConfig}
                            options={SORT_OPTIONS}
                            ariaLabel="Sort projects"
                        />

                        {/* View Toggle */}
                        <ViewSelector
                            value={viewMode}
                            onChange={setViewMode}
                            ariaLabel="Toggle project view mode"
                        />
                    </>
                }
            />

            {/* Stats Row */}
            <StatsGrid columns={4} gap="md">
                <StatCard
                    title="Total Proyectos"
                    value={totalProjects}
                    icon={FolderKanban}
                    variant="default"
                />
                <StatCard
                    title="Activos"
                    value={activeProjects}
                    icon={Target}
                    variant="primary"
                />
                <StatCard
                    title="Completados"
                    value={completedProjects}
                    icon={CheckCircle2}
                    variant="success"
                />
                <StatCard
                    title="En Pausa"
                    value={pausedProjects}
                    icon={Pause}
                    variant="warning"
                />
            </StatsGrid>

            {/* Search and Filter Section */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                {/* Search Bar with Count */}
                <div className="flex items-center gap-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar proyectos (mínimo 3 caracteres)..."
                        className="flex-1"
                        ariaLabel="Search projects"
                    />
                    <ItemCounter
                        count={sortedProjects.length}
                        singularLabel="proyecto"
                        pluralLabel="proyectos"
                    />
                </div>

                {/* Status Filters */}
                <FilterGroup title="Fase">
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
                                aria-pressed={isSelected}
                                aria-label={`Filter by ${info.label}`}
                            >
                                {info.label} ({count})
                            </button>
                        );
                    })}
                </FilterGroup>
            </div>

            {/* Projects Grid */}
            {viewMode === 'grid' ? (
                <div
                    className={cn(
                        'grid',
                        'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
                        'gap-[var(--spacing-md)]',
                    )}
                    role="list"
                    aria-label="Projects grid"
                >
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
                <div
                    className={cn(
                        'rounded-xl border border-border bg-card overflow-hidden'
                    )}
                    role="list"
                    aria-label="Projects list"
                >
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
