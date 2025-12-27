/**
 * ProjectDetailDrawer Component
 * Drawer for viewing/editing project details
 */

import { useMemo } from 'react';
import {
    FolderKanban,
    Calendar,
    DollarSign,
    Edit,
    Clock,
    CheckCircle,
    AlertTriangle,
    ListTodo,
    Building2,
    ExternalLink,
} from 'lucide-react';
import { Drawer } from '@components/ui/Drawer';
import {
    useProjectDetail,
    useProjectTasks,
    useProjectsStore,
    calculateProjectHealth,
} from '@store/useProjectsStore';
import { usePermissions } from '@hooks/usePermissions';
import { cn } from '@lib/utils';
import type { ProjectStatus } from '../../types';

// Status configuration
const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
    planning: { label: 'Planificacion', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    development: { label: 'Desarrollo', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
    testing: { label: 'Testing', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    deployment: { label: 'Despliegue', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    completed: { label: 'Completado', color: 'text-green-700', bgColor: 'bg-green-100' },
    on_hold: { label: 'En Pausa', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    blocked: { label: 'Bloqueado', color: 'text-red-700', bgColor: 'bg-red-100' },
    cancelled: { label: 'Cancelado', color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

// Format currency
function formatCurrency(amount?: number): string {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(amount);
}

// Format date
function formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

// Task item component
function TaskItem({ task }: { task: { id: number; title: string; status: string; progress: number } }) {
    const statusColors: Record<string, string> = {
        pending: 'bg-gray-100 text-gray-600',
        in_progress: 'bg-blue-100 text-blue-600',
        completed: 'bg-green-100 text-green-600',
        blocked: 'bg-red-100 text-red-600',
    };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <ListTodo className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs', statusColors[task.status] || statusColors.pending)}>
                        {task.status}
                    </span>
                    <span className="text-xs text-gray-400">{task.progress}%</span>
                </div>
            </div>
        </div>
    );
}

export function ProjectDetailDrawer() {
    const { can } = usePermissions();
    const { isDrawerOpen, selectedProjectId, closeDrawer, openDrawer } = useProjectsStore();

    const { data: project, isLoading: projectLoading } = useProjectDetail(selectedProjectId);
    const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(selectedProjectId);

    const health = useMemo(
        () => (project ? calculateProjectHealth(project) : null),
        [project]
    );

    const canEdit = can('projects.edit');

    // Loading state
    if (projectLoading) {
        return (
            <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title="Cargando..." size="lg">
                <div className="animate-pulse space-y-6">
                    <div className="h-32 rounded-lg bg-gray-200" />
                    <div className="h-48 rounded-lg bg-gray-200" />
                </div>
            </Drawer>
        );
    }

    if (!project) {
        return null;
    }

    const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;

    return (
        <Drawer
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            title={project.name}
            subtitle={project.code || undefined}
            size="lg"
            footer={
                canEdit && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => openDrawer('edit', selectedProjectId!)}
                            className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white hover:bg-solaria-orange-dark"
                        >
                            <Edit className="h-4 w-4" />
                            Editar Proyecto
                        </button>
                    </div>
                )
            }
        >
            <div className="space-y-6">
                {/* Header with health */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/5">
                            <FolderKanban className="h-7 w-7 text-solaria-orange" />
                        </div>
                        <div>
                            <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
                                {statusConfig.label}
                            </span>
                            {project.client && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                    <Building2 className="h-4 w-4" />
                                    {project.client}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Health score */}
                    {health && (
                        <div
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2',
                                health.status === 'healthy' && 'bg-green-50',
                                health.status === 'at-risk' && 'bg-amber-50',
                                health.status === 'critical' && 'bg-red-50'
                            )}
                        >
                            {health.status === 'healthy' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {health.status === 'at-risk' && <Clock className="h-5 w-5 text-amber-500" />}
                            {health.status === 'critical' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            <span
                                className={cn(
                                    'font-semibold',
                                    health.status === 'healthy' && 'text-green-700',
                                    health.status === 'at-risk' && 'text-amber-700',
                                    health.status === 'critical' && 'text-red-700'
                                )}
                            >
                                {health.score}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Progreso General</span>
                        <span className="text-2xl font-bold text-solaria-orange">{project.progress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className={cn(
                                'h-full transition-all duration-500',
                                project.progress >= 80 ? 'bg-green-500' :
                                project.progress >= 50 ? 'bg-blue-500' :
                                project.progress >= 25 ? 'bg-amber-500' :
                                'bg-gray-400'
                            )}
                            style={{ width: `${Math.min(project.progress, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-green-50 p-4">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-sm font-medium">Presupuesto</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(project.budget)}
                        </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <Calendar className="h-5 w-5" />
                            <span className="text-sm font-medium">Deadline</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">
                            {formatDate(project.deadline)}
                        </p>
                    </div>
                </div>

                {/* Health factors */}
                {health && health.factors.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <h4 className="font-medium text-amber-800 mb-2">Factores de Riesgo</h4>
                        <ul className="space-y-1">
                            {health.factors.map((factor, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-amber-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    {factor}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Description */}
                {project.description && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Descripcion</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap rounded-lg bg-gray-50 p-4">
                            {project.description}
                        </p>
                    </div>
                )}

                {/* Tasks */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                            Tareas ({tasks.length})
                        </h4>
                        <button className="text-sm text-solaria-orange hover:underline flex items-center gap-1">
                            Ver todas
                            <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {tasksLoading ? (
                        <div className="animate-pulse space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 rounded-lg bg-gray-100" />
                            ))}
                        </div>
                    ) : tasks.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No hay tareas asignadas
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {tasks.slice(0, 5).map((task: { id: number; title: string; status: string; progress: number }) => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                            {tasks.length > 5 && (
                                <p className="text-center text-sm text-gray-500 py-2">
                                    +{tasks.length - 5} tareas mas
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Timestamps */}
                <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
                    <p>Creado: {formatDate(project.created_at)}</p>
                    <p>Actualizado: {formatDate(project.updated_at)}</p>
                </div>
            </div>
        </Drawer>
    );
}

export default ProjectDetailDrawer;
