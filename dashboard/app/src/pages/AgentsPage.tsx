import { Bot, Activity, Clock, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { useAgents } from '@/hooks/useApi';
import { cn, formatRelativeTime, getStatusColor } from '@/lib/utils';
import type { Agent } from '@/types';

const statusLabels: Record<string, { label: string; icon: React.ElementType }> = {
    active: { label: 'Activo', icon: Activity },
    busy: { label: 'Ocupado', icon: Clock },
    inactive: { label: 'Inactivo', icon: AlertCircle },
    error: { label: 'Error', icon: AlertCircle },
    maintenance: { label: 'Mantenimiento', icon: Settings },
};

function AgentCard({ agent }: { agent: Agent }) {
    const statusInfo = statusLabels[agent.status] || statusLabels.inactive;
    const StatusIcon = statusInfo.icon;

    return (
        <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        {agent.avatar ? (
                            <img
                                src={agent.avatar}
                                alt={agent.name}
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <Bot className="h-8 w-8 text-primary" />
                        )}
                    </div>
                    <span
                        className={cn(
                            'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card',
                            getStatusColor(agent.status)
                        )}
                    />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.role}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="text-sm capitalize">{statusInfo.label}</span>
                    </div>
                </div>
            </div>

            {/* Current Task */}
            {agent.currentTask && (
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Tarea actual</p>
                    <p className="text-sm font-medium">{agent.currentTask}</p>
                </div>
            )}

            {/* Description */}
            {agent.description && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                </p>
            )}

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                        {agent.tasksCompleted || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Completadas</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">
                        {agent.tasksInProgress || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">En progreso</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">
                        {agent.avgTaskTime ? `${agent.avgTaskTime.toFixed(1)}h` : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Tiempo prom.</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>
                    Última actividad: {agent.lastActivity ? formatRelativeTime(agent.lastActivity) : 'Nunca'}
                </span>
                {agent.lastHeartbeat && (
                    <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {formatRelativeTime(agent.lastHeartbeat)}
                    </span>
                )}
            </div>
        </div>
    );
}

function AgentStats({ agents }: { agents: Agent[] }) {
    const active = agents.filter((a) => a.status === 'active').length;
    const busy = agents.filter((a) => a.status === 'busy').length;
    const inactive = agents.filter((a) => a.status === 'inactive').length;
    const error = agents.filter((a) => a.status === 'error').length;

    return (
        <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2">
                        <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{active}</p>
                        <p className="text-xs text-muted-foreground">Activos</p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{busy}</p>
                        <p className="text-xs text-muted-foreground">Ocupados</p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-500/10 p-2">
                        <CheckCircle2 className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{inactive}</p>
                        <p className="text-xs text-muted-foreground">Inactivos</p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-500/10 p-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{error}</p>
                        <p className="text-xs text-muted-foreground">Con errores</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AgentsPage() {
    const { data: agents, isLoading } = useAgents();

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground">Cargando agentes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title">Agentes IA</h1>
                    <p className="section-subtitle">
                        {agents?.length || 0} agentes configurados
                    </p>
                </div>
            </div>

            {/* Stats */}
            <AgentStats agents={agents || []} />

            {/* Agents Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {agents && agents.length > 0 ? (
                    agents.map((agent: Agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No hay agentes configurados
                    </div>
                )}
            </div>
        </div>
    );
}
