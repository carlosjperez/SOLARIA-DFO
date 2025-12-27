/**
 * AgentDetailDrawer Component
 * Drawer for viewing agent details and task history
 */

import {
    Bot,
    UserCircle,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Wrench,
    Briefcase,
    Target,
    TrendingUp,
    Activity,
    ListTodo,
} from 'lucide-react';
import { Drawer } from '@components/ui/Drawer';
import {
    useAgentsStore,
    useAgentDetail,
    calculateAgentPerformance,
    isAIAgent,
    ROLE_LABELS,
    STATUS_CONFIG,
} from '@store/useAgentsStore';
import { cn } from '@lib/utils';
import type { AgentStatus, AgentRole } from '../../types';

// Status icon map
const STATUS_ICONS: Record<AgentStatus, React.ReactNode> = {
    active: <CheckCircle className="h-5 w-5" />,
    busy: <Clock className="h-5 w-5" />,
    inactive: <XCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    maintenance: <Wrench className="h-5 w-5" />,
};

// Performance badge
function PerformanceBadge({ rating }: { rating: 'excellent' | 'good' | 'average' | 'poor' }) {
    const config = {
        excellent: { label: 'Excelente', color: 'bg-green-100 text-green-700' },
        good: { label: 'Bueno', color: 'bg-blue-100 text-blue-700' },
        average: { label: 'Promedio', color: 'bg-yellow-100 text-yellow-700' },
        poor: { label: 'Bajo', color: 'bg-red-100 text-red-700' },
    };

    return (
        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', config[rating].color)}>
            {config[rating].label}
        </span>
    );
}

// Activity item
function ActivityItem({ action, timestamp }: { action: string; timestamp: string }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <Activity className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{action}</p>
                <p className="text-xs text-gray-500">
                    {new Date(timestamp).toLocaleString('es-MX')}
                </p>
            </div>
        </div>
    );
}

export function AgentDetailDrawer() {
    const { isDrawerOpen, selectedAgentId, closeDrawer } = useAgentsStore();
    const { data: agent, isLoading } = useAgentDetail(selectedAgentId);

    // Loading state
    if (isLoading) {
        return (
            <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title="Cargando..." size="lg">
                <div className="animate-pulse space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-200" />
                        <div className="space-y-2">
                            <div className="h-5 w-32 rounded bg-gray-200" />
                            <div className="h-4 w-24 rounded bg-gray-200" />
                        </div>
                    </div>
                    <div className="h-32 rounded-lg bg-gray-200" />
                </div>
            </Drawer>
        );
    }

    if (!agent) {
        return null;
    }

    const isAI = isAIAgent(agent);
    const performance = calculateAgentPerformance(agent);
    const statusConfig = STATUS_CONFIG[agent.status];
    const roleLabel = ROLE_LABELS[agent.role as AgentRole] || agent.role;

    return (
        <Drawer
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            title={agent.name}
            subtitle={roleLabel}
            size="lg"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div
                        className={cn(
                            'flex h-16 w-16 items-center justify-center rounded-full',
                            isAI ? 'bg-purple-100' : 'bg-blue-100'
                        )}
                    >
                        {isAI ? (
                            <Bot className="h-8 w-8 text-purple-600" />
                        ) : (
                            <UserCircle className="h-8 w-8 text-blue-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-900">{agent.name}</h3>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                                    statusConfig.bgColor,
                                    statusConfig.color
                                )}
                            >
                                {STATUS_ICONS[agent.status]}
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{roleLabel}</p>
                        {isAI && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">
                                <Bot className="h-3 w-3" />
                                Agente IA
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                {agent.description && (
                    <p className="text-sm text-gray-600 rounded-lg bg-gray-50 p-4">
                        {agent.description}
                    </p>
                )}

                {/* Performance Stats */}
                <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Rendimiento</h4>
                        <PerformanceBadge rating={performance.rating} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                <Briefcase className="h-4 w-4" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{agent.tasks_assigned}</p>
                            <p className="text-xs text-gray-500">Asignadas</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">{agent.tasks_completed}</p>
                            <p className="text-xs text-gray-500">Completadas</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{performance.efficiency}%</p>
                            <p className="text-xs text-gray-500">Eficiencia</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={cn(
                                    'h-full transition-all duration-500',
                                    performance.efficiency >= 90 ? 'bg-green-500' :
                                    performance.efficiency >= 75 ? 'bg-blue-500' :
                                    performance.efficiency >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                )}
                                style={{ width: `${performance.efficiency}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Current Task */}
                {(agent as { current_task?: { id: number; title: string; status: string } }).current_task && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Target className="h-5 w-5" />
                            <span className="text-sm font-medium">Tarea Actual</span>
                        </div>
                        <p className="font-medium text-gray-900">
                            {(agent as { current_task?: { id: number; title: string; status: string } }).current_task?.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Estado: {(agent as { current_task?: { id: number; title: string; status: string } }).current_task?.status}
                        </p>
                    </div>
                )}

                {/* Recent Activity */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <ListTodo className="h-5 w-5 text-gray-400" />
                        Actividad Reciente
                    </h4>
                    <div className="divide-y divide-gray-100">
                        {(agent as { recent_activity?: { action: string; timestamp: string }[] }).recent_activity?.length ? (
                            (agent as { recent_activity: { action: string; timestamp: string }[] }).recent_activity.slice(0, 5).map((activity, i) => (
                                <ActivityItem
                                    key={i}
                                    action={activity.action}
                                    timestamp={activity.timestamp}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 py-4 text-center">
                                Sin actividad reciente
                            </p>
                        )}
                    </div>
                </div>

                {/* Timestamps */}
                <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
                    <p>Creado: {new Date(agent.created_at).toLocaleString('es-MX')}</p>
                    <p>Actualizado: {new Date(agent.updated_at).toLocaleString('es-MX')}</p>
                </div>
            </div>
        </Drawer>
    );
}

export default AgentDetailDrawer;
