import {
    CheckCircle2,
    Clock,
    Users,
    DollarSign,
    Target,
    AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Project, Task, Agent } from '@/types';

interface ProjectStatsRowProps {
    project: Project;
    tasks?: Task[];
    agents?: Agent[];
}

export function ProjectStatsRow({ project, tasks = [], agents = [] }: ProjectStatsRowProps) {
    const totalTasks = project.tasksTotal || tasks.length;
    const completedTasks = project.tasksCompleted || tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
    const activeAgents = project.activeAgents || agents.filter((a) => a.status === 'active' || a.status === 'busy').length;

    const budgetUsed = project.budgetSpent && project.budgetAllocated
        ? Math.round((project.budgetSpent / project.budgetAllocated) * 100)
        : 0;

    return (
        <div className="project-stats-row">
            {/* Tasks */}
            <div className="project-stat-card">
                <div className="project-stat-icon tasks">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="project-stat-content">
                    <div className="project-stat-value">{completedTasks}/{totalTasks}</div>
                    <div className="project-stat-label">Tareas Completadas</div>
                </div>
            </div>

            {/* In Progress */}
            <div className="project-stat-card">
                <div className="project-stat-icon active">
                    <Clock className="h-5 w-5" />
                </div>
                <div className="project-stat-content">
                    <div className="project-stat-value">{inProgressTasks}</div>
                    <div className="project-stat-label">En Progreso</div>
                </div>
            </div>

            {/* Blocked */}
            {blockedTasks > 0 && (
                <div className="project-stat-card warning">
                    <div className="project-stat-icon blocked">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="project-stat-content">
                        <div className="project-stat-value">{blockedTasks}</div>
                        <div className="project-stat-label">Bloqueadas</div>
                    </div>
                </div>
            )}

            {/* Agents */}
            <div className="project-stat-card">
                <div className="project-stat-icon agents">
                    <Users className="h-5 w-5" />
                </div>
                <div className="project-stat-content">
                    <div className="project-stat-value">{activeAgents}</div>
                    <div className="project-stat-label">Agentes Activos</div>
                </div>
            </div>

            {/* Hours */}
            {project.estimatedHours && (
                <div className="project-stat-card">
                    <div className="project-stat-icon">
                        <Target className="h-5 w-5" />
                    </div>
                    <div className="project-stat-content">
                        <div className="project-stat-value">
                            {project.actualHours || 0}h / {project.estimatedHours}h
                        </div>
                        <div className="project-stat-label">Horas</div>
                    </div>
                </div>
            )}

            {/* Budget */}
            {project.budgetAllocated && (
                <div className="project-stat-card">
                    <div className="project-stat-icon green">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="project-stat-content">
                        <div className="project-stat-value">
                            {formatCurrency(project.budgetSpent || 0)}
                        </div>
                        <div className="project-stat-label">
                            de {formatCurrency(project.budgetAllocated)} ({budgetUsed}%)
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectStatsRow;
