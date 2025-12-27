/**
 * OfficeProjectsPage
 * Projects table with CRUD operations for Office Dashboard
 */

import { useState, useMemo } from 'react';
import { useProjects } from '@hooks/useProjects';
import { useProjectMutations } from '@hooks/useProjectMutations';
import { filterOfficeProjects, getStatusDisplay } from '@lib/office-utils';
import { cn } from '@lib/utils';
import { BudgetBreakdown } from '@components/budget/BudgetBreakdown';
import { ProjectFormModal } from '@components/projects/ProjectFormModal';
import { DeleteConfirmModal } from '@components/projects/DeleteConfirmModal';
import {
    Plus,
    Search,
    Filter,
    ChevronDown,
    Edit,
    Eye,
    Trash2,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import type { Project, ProjectStatus } from '../types';
import type { ProjectFormData } from '@hooks/useProjectMutations';

// Status badge component
function StatusBadge({ status }: { status: ProjectStatus }) {
    const { label, color } = getStatusDisplay(status);

    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        amber: 'bg-amber-100 text-amber-700 border-amber-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                colorClasses[color] || colorClasses.gray
            )}
        >
            {label}
        </span>
    );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
    const getColor = (p: number) => {
        if (p >= 80) return 'bg-green-500';
        if (p >= 50) return 'bg-blue-500';
        if (p >= 25) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                <div
                    className={cn('h-full transition-all duration-300', getColor(progress))}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <span className="text-xs font-medium text-gray-600">{progress}%</span>
        </div>
    );
}

// Format date for display
function formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// Format currency
function formatCurrency(amount?: number): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function OfficeProjectsPage() {
    const { data: projects, isLoading, error } = useProjects();
    const { create, update, delete: deleteProject } = useProjectMutations();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        if (!projects) return [];

        let filtered = filterOfficeProjects(projects);

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.client?.toLowerCase().includes(query) ||
                    p.code?.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((p) => p.status === statusFilter);
        }

        return filtered;
    }, [projects, searchQuery, statusFilter]);

    // Calculate totals
    const totals = useMemo(() => {
        return filteredProjects.reduce(
            (acc, p) => ({
                budget: acc.budget + (p.budget || 0),
                projects: acc.projects + 1,
                completed: acc.completed + (p.status === 'completed' ? 1 : 0),
                inProgress: acc.inProgress + (['development', 'testing'].includes(p.status) ? 1 : 0),
            }),
            { budget: 0, projects: 0, completed: 0, inProgress: 0 }
        );
    }, [filteredProjects]);

    // Handlers
    const handleCreateProject = async (data: ProjectFormData) => {
        await create.mutateAsync(data);
    };

    const handleUpdateProject = async (data: ProjectFormData) => {
        if (!editingProject) return;
        await update.mutateAsync({ id: editingProject.id, data });
    };

    const handleDeleteProject = async () => {
        if (!deletingProject) return;
        await deleteProject.mutateAsync(deletingProject.id);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
    };

    const openDeleteModal = (project: Project) => {
        setDeletingProject(project);
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="h-64 rounded-lg bg-gray-200" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>Error al cargar proyectos: {error.message}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
                    <p className="text-sm text-gray-500">
                        {totals.projects} proyectos | {totals.inProgress} en progreso | {formatCurrency(totals.budget)} total
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Proyecto
                </button>
            </div>

            {/* Budget Overview */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Distribucion de Presupuesto</h2>
                <BudgetBreakdown totalBudget={totals.budget} variant="horizontal" />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                            showFilters
                                ? 'border-solaria-orange bg-solaria-orange/10 text-solaria-orange'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        )}
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                        <ChevronDown className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-180')} />
                    </button>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="planning">Planificacion</option>
                        <option value="development">En Desarrollo</option>
                        <option value="testing">Testing</option>
                        <option value="deployment">Despliegue</option>
                        <option value="completed">Completado</option>
                        <option value="on_hold">En Pausa</option>
                        <option value="blocked">Bloqueado</option>
                    </select>
                </div>
            </div>

            {/* Projects Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Proyecto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Progreso
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Presupuesto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Deadline
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Clock className="h-8 w-8 text-gray-300" />
                                            <p>No se encontraron proyectos</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setStatusFilter('all');
                                                }}
                                                className="text-sm text-solaria-orange hover:underline"
                                            >
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">
                                                    {project.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {project.code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {project.client || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <StatusBadge status={project.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <ProgressBar progress={project.progress} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    {formatCurrency(project.budget)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {formatDate(project.deadline)}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(project)}
                                                    className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(project)}
                                                    className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(project)}
                                                    className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                {filteredProjects.length > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
                        <p className="text-sm text-gray-500">
                            Mostrando {filteredProjects.length} de {projects?.length || 0} proyectos
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                {totals.completed} completados
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            <ProjectFormModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateProject}
                isLoading={create.isPending}
            />

            {/* Edit Project Modal */}
            <ProjectFormModal
                isOpen={!!editingProject}
                onClose={() => setEditingProject(null)}
                onSubmit={handleUpdateProject}
                project={editingProject}
                isLoading={update.isPending}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!deletingProject}
                onClose={() => setDeletingProject(null)}
                onConfirm={handleDeleteProject}
                title="Cancelar Proyecto"
                itemName={deletingProject?.name || ''}
                isLoading={deleteProject.isPending}
            />
        </div>
    );
}

export default OfficeProjectsPage;
