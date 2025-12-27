import {
    ArrowLeft,
    Calendar,
    Clock,
    Flag,
    MoreHorizontal,
    Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatDate } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectHeaderProps {
    project: Project;
    onSettingsClick?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    planning: { label: 'Planificacion', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    active: { label: 'Activo', color: 'text-solaria', bg: 'bg-solaria/10' },
    development: { label: 'En Desarrollo', color: 'text-solaria', bg: 'bg-solaria/10' },
    testing: { label: 'Testing', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    deployment: { label: 'Despliegue', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    paused: { label: 'Pausado', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    on_hold: { label: 'En Espera', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    completed: { label: 'Completado', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    cancelled: { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-500/10' },
};

const priorityConfig = {
    critical: { label: 'Critica', color: 'text-red-500', bg: 'bg-red-500/10' },
    high: { label: 'Alta', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    medium: { label: 'Media', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    low: { label: 'Baja', color: 'text-green-500', bg: 'bg-green-500/10' },
};

export function ProjectHeader({ project, onSettingsClick }: ProjectHeaderProps) {
    const navigate = useNavigate();
    const status = statusConfig[project.status] || statusConfig.planning;
    const priority = priorityConfig[project.priority] || priorityConfig.medium;

    return (
        <div className="project-detail-header">
            {/* Back button and breadcrumb */}
            <div className="project-header-top">
                <button onClick={() => navigate('/projects')} className="project-back-btn">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Proyectos</span>
                </button>
                <div className="project-header-actions">
                    <button onClick={onSettingsClick} className="project-action-btn">
                        <Settings className="h-4 w-4" />
                    </button>
                    <button className="project-action-btn">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Title and code */}
            <div className="project-header-main">
                <div className="project-header-title-group">
                    <span className="project-code">{project.code}</span>
                    <h1 className="project-title">{project.name}</h1>
                </div>
                <div className="project-header-badges">
                    <span className={cn('status-badge', status.bg, status.color)}>
                        {status.label}
                    </span>
                    <span className={cn('priority-badge', priority.bg, priority.color)}>
                        <Flag className="h-3 w-3" />
                        {priority.label}
                    </span>
                </div>
            </div>

            {/* Description */}
            {project.description && (
                <p className="project-description">{project.description}</p>
            )}

            {/* Meta info */}
            <div className="project-meta-row">
                {project.startDate && (
                    <div className="project-meta-item">
                        <Calendar className="h-4 w-4" />
                        <span>Inicio: {formatDate(project.startDate)}</span>
                    </div>
                )}
                {project.endDate && (
                    <div className="project-meta-item">
                        <Calendar className="h-4 w-4" />
                        <span>Fin: {formatDate(project.endDate)}</span>
                    </div>
                )}
                {project.estimatedHours && (
                    <div className="project-meta-item">
                        <Clock className="h-4 w-4" />
                        <span>{project.actualHours || 0}h / {project.estimatedHours}h</span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="project-progress-section">
                <div className="project-progress-header">
                    <span className="project-progress-label">Progreso General</span>
                    <span className="project-progress-value">{project.progress}%</span>
                </div>
                <div className="project-progress-bar">
                    <div
                        className={cn(
                            'project-progress-fill',
                            project.progress === 100 && 'complete'
                        )}
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default ProjectHeader;
