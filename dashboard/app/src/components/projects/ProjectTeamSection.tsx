import { User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types';

interface ProjectTeamSectionProps {
    agents: Agent[];
    onAgentClick?: (agent: Agent) => void;
}

const statusConfig = {
    active: { label: 'Activo', color: 'text-green-500', bg: 'bg-green-500' },
    busy: { label: 'Ocupado', color: 'text-blue-500', bg: 'bg-blue-500' },
    inactive: { label: 'Inactivo', color: 'text-gray-500', bg: 'bg-gray-500' },
    error: { label: 'Error', color: 'text-red-500', bg: 'bg-red-500' },
    maintenance: { label: 'Mantenimiento', color: 'text-yellow-500', bg: 'bg-yellow-500' },
};

export function ProjectTeamSection({ agents, onAgentClick }: ProjectTeamSectionProps) {
    if (!agents || agents.length === 0) {
        return (
            <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                    <User className="h-4 w-4" />
                    Equipo
                </h3>
                <div className="sidebar-card-empty">
                    <User className="h-8 w-8 text-muted-foreground/50" />
                    <p>Sin agentes asignados</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar-card">
            <h3 className="sidebar-card-title">
                <User className="h-4 w-4" />
                Equipo ({agents.length})
            </h3>
            <div className="team-list">
                {agents.map((agent) => {
                    const status = statusConfig[agent.status] || statusConfig.inactive;
                    return (
                        <div
                            key={agent.id}
                            className={cn('team-member-row', onAgentClick && 'clickable')}
                            onClick={() => onAgentClick?.(agent)}
                        >
                            <div className="team-member-avatar">
                                <User className="h-4 w-4" />
                                <span className={cn('team-member-status-dot', status.bg)} />
                            </div>
                            <div className="team-member-info">
                                <div className="team-member-name">{agent.name}</div>
                                <div className="team-member-role">{agent.role}</div>
                            </div>
                            <div className="team-member-meta">
                                {agent.currentTask ? (
                                    <span className="team-member-task" title={agent.currentTask}>
                                        <Clock className="h-3 w-3" />
                                        {agent.currentTask.length > 20
                                            ? agent.currentTask.substring(0, 20) + '...'
                                            : agent.currentTask}
                                    </span>
                                ) : (
                                    <span className={cn('team-member-status', status.color)}>
                                        {status.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProjectTeamSection;
