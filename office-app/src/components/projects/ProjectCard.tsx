/**
 * ProjectCard Component
 * Visual card for project with timeline and budget progress
 */

import { useMemo } from 'react';
import {
    FolderKanban,
    Calendar,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';
import { cn } from '@lib/utils';
import { calculateProjectHealth } from '@store/useProjectsStore';
import type { Project, ProjectStatus } from '../../types';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

// Status configuration
const STATUS_CONFIG: Record<
    ProjectStatus,
    { label: string; color: string; bgColor: string }
> = {
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
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date
function formatDate(dateStr?: string): string {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
    });
}

// Calculate days until deadline
function getDaysUntilDeadline(deadline?: string): { days: number; status: 'ok' | 'warning' | 'critical' } | null {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const days = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 0) return { days, status: 'critical' };
    if (days <= 7) return { days, status: 'warning' };
    return { days, status: 'ok' };
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
    const health = useMemo(() => calculateProjectHealth(project), [project]);
    const deadlineInfo = useMemo(() => getDaysUntilDeadline(project.deadline), [project.deadline]);

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-solaria-orange/30 hover:shadow-md"
        >
            {/* Health indicator bar */}
            <div
                className={cn(
                    'absolute left-0 top-0 h-1 w-full transition-all',
                    health.status === 'healthy' && 'bg-green-500',
                    health.status === 'at-risk' && 'bg-amber-500',
                    health.status === 'critical' && 'bg-red-500'
                )}
            />

            <div className="p-5">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-solaria-orange/10 to-solaria-orange/5">
                            <FolderKanban className="h-5 w-5 text-solaria-orange" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {project.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {project.client || 'Sin cliente'}
                            </p>
                        </div>
                    </div>
                    <span
                        className={cn(
                            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            statusConfig.bgColor,
                            statusConfig.color
                        )}
                    >
                        {statusConfig.label}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-500">Progreso</span>
                        <span className="font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Budget */}
                    <div className="rounded-lg bg-gray-50 p-2.5">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span className="text-xs">Presupuesto</span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                            {formatCurrency(project.budget)}
                        </p>
                    </div>

                    {/* Deadline */}
                    <div
                        className={cn(
                            'rounded-lg p-2.5',
                            deadlineInfo?.status === 'critical' && 'bg-red-50',
                            deadlineInfo?.status === 'warning' && 'bg-amber-50',
                            (!deadlineInfo || deadlineInfo.status === 'ok') && 'bg-gray-50'
                        )}
                    >
                        <div
                            className={cn(
                                'flex items-center gap-1.5 mb-0.5',
                                deadlineInfo?.status === 'critical' && 'text-red-600',
                                deadlineInfo?.status === 'warning' && 'text-amber-600',
                                (!deadlineInfo || deadlineInfo.status === 'ok') && 'text-gray-500'
                            )}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">Deadline</span>
                        </div>
                        <p
                            className={cn(
                                'font-semibold text-sm',
                                deadlineInfo?.status === 'critical' && 'text-red-700',
                                deadlineInfo?.status === 'warning' && 'text-amber-700',
                                (!deadlineInfo || deadlineInfo.status === 'ok') && 'text-gray-900'
                            )}
                        >
                            {formatDate(project.deadline)}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    {/* Health indicator */}
                    <div className="flex items-center gap-1.5">
                        {health.status === 'healthy' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {health.status === 'at-risk' && (
                            <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        {health.status === 'critical' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span
                            className={cn(
                                'text-xs font-medium',
                                health.status === 'healthy' && 'text-green-600',
                                health.status === 'at-risk' && 'text-amber-600',
                                health.status === 'critical' && 'text-red-600'
                            )}
                        >
                            {health.score}%
                        </span>
                    </div>

                    {/* Days left or overdue */}
                    {deadlineInfo && (
                        <span
                            className={cn(
                                'text-xs',
                                deadlineInfo.status === 'critical' && 'text-red-600 font-medium',
                                deadlineInfo.status === 'warning' && 'text-amber-600',
                                deadlineInfo.status === 'ok' && 'text-gray-500'
                            )}
                        >
                            {deadlineInfo.days < 0
                                ? `${Math.abs(deadlineInfo.days)}d vencido`
                                : deadlineInfo.days === 0
                                ? 'Hoy'
                                : `${deadlineInfo.days}d restantes`}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-solaria-orange/5 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
    );
}

export default ProjectCard;
