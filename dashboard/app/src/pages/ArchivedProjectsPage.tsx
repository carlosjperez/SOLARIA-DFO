import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Archive,
    FolderKanban,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Loader2,
    ArrowLeft,
    Eye,
} from 'lucide-react';
import { useProjects, useTasks } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import type { Project, Task } from '@/types';

// Project archive statuses (completed or cancelled)
const ARCHIVE_STATUSES = ['completed', 'cancelled'];

const STATUS_INFO = {
    completed: { label: 'Completado', color: '#16a34a', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: '#ef4444', icon: XCircle },
};

export function ArchivedProjectsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data: allProjects, isLoading } = useProjects();
    const { data: allTasks } = useTasks({});

    // Solo proyectos archivados (completed o cancelled)
    const archivedProjects = (allProjects || []).filter((p: Project) =>
        ARCHIVE_STATUSES.includes(p.status)
    );

    const filteredProjects = archivedProjects.filter((p: Project) => {
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code?.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Ordenar por fecha de actualizacion (mas reciente primero)
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
    });

    // Get task stats for a project
    const getProjectStats = (projectId: number) => {
        const projectTasks = (allTasks || []).filter((t: Task) => t.projectId === projectId);
        return {
            total: projectTasks.length,
            completed: projectTasks.filter((t: Task) => t.status === 'completed').length,
        };
    };

    // Stats
    const totalArchived = archivedProjects.length;
    const completedCount = archivedProjects.filter((p: Project) => p.status === 'completed').length;
    const cancelledCount = archivedProjects.filter((p: Project) => p.status === 'cancelled').length;

    // Calculate total budget of archived projects
    const totalBudget = archivedProjects.reduce((sum: number, p: Project) =>
        sum + (p.budgetAllocated || 0), 0
    );

    const handleProjectClick = (projectId: number) => {
        navigate(`/projects/${projectId}`);
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
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="section-title flex items-center gap-2">
                            <Archive className="h-6 w-6 text-primary" />
                            Proyectos Archivados
                        </h1>
                        <p className="section-subtitle">
                            {totalArchived} proyectos en archivo
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Archive className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Archivados</div>
                        <div className="stat-value">{totalArchived}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Completados</div>
                        <div className="stat-value">{completedCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">
                        <XCircle className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Cancelados</div>
                        <div className="stat-value">{cancelledCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Budget Total</div>
                        <div className="stat-value">
                            ${totalBudget >= 1000 ? `${(totalBudget / 1000).toFixed(0)}K` : totalBudget}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="filter-search">
                    <Search className="filter-search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar proyectos archivados..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="filter-search-input"
                    />
                </div>

                <div className="filter-selects">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los estados</option>
                        <option value="completed">Completados</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {sortedProjects.map((project: Project) => {
                    const stats = getProjectStats(project.id);
                    const statusInfo = STATUS_INFO[project.status as keyof typeof STATUS_INFO];
                    const StatusIcon = statusInfo?.icon || Archive;

                    return (
                        <div
                            key={project.id}
                            className="glass-card p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <FolderKanban className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                                {project.code}
                                            </span>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
                                                style={{
                                                    backgroundColor: `${statusInfo?.color}20`,
                                                    color: statusInfo?.color,
                                                }}
                                            >
                                                <StatusIcon className="h-3 w-3" />
                                                {statusInfo?.label}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-lg">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                {project.description}
                                            </p>
                                        )}

                                        {/* Project Stats Row */}
                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <span>{stats.completed}/{stats.total} tareas</span>
                                            </div>
                                            {project.budgetAllocated && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4 text-orange-500" />
                                                    <span>
                                                        ${project.budgetAllocated >= 1000
                                                            ? `${(project.budgetAllocated / 1000).toFixed(0)}K`
                                                            : project.budgetAllocated}
                                                    </span>
                                                </div>
                                            )}
                                            {project.endDate && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                    <span>{formatDate(project.endDate)}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>Archivado: {formatDate(project.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* View Button */}
                                <button
                                    className="p-2 hover:bg-accent rounded-lg transition-colors shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleProjectClick(project.id);
                                    }}
                                    title="Ver proyecto"
                                >
                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {sortedProjects.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <Archive className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                            No hay proyectos archivados
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Los proyectos completados o cancelados apareceran aqui
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
