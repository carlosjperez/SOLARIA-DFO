/**
 * OfficeAgentsPage
 * Agents table separated by type: Humans and AI
 * Enhanced with store integration and detail drawer
 */

import { useMemo } from 'react';
import { cn } from '@lib/utils';
import {
    Plus,
    Search,
    Users,
    Bot,
    UserCircle,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Wrench,
    Filter,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';
import {
    useAgentsStore,
    useAgentsFiltered,
    calculateAgentPerformance,
    isAIAgent,
    ROLE_LABELS,
    STATUS_CONFIG,
} from '@store/useAgentsStore';
import { AgentDetailDrawer } from '@components/agents/AgentDetailDrawer';
import { PermissionGate } from '@components/auth/PermissionGate';
import type { Agent, AgentStatus, AgentRole } from '../types';

// Status icons for badges
const STATUS_ICONS: Record<AgentStatus, React.ReactNode> = {
    active: <CheckCircle className="h-4 w-4" />,
    busy: <Clock className="h-4 w-4" />,
    inactive: <XCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    maintenance: <Wrench className="h-4 w-4" />,
};

// Status Badge
function StatusBadge({ status }: { status: AgentStatus }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', config.bgColor, config.color)}>
            {STATUS_ICONS[status]}
            {config.label}
        </span>
    );
}

// Performance Badge
function PerformanceBadge({ rating }: { rating: 'excellent' | 'good' | 'average' | 'poor' }) {
    const config = {
        excellent: { color: 'text-green-600', bg: 'bg-green-50' },
        good: { color: 'text-blue-600', bg: 'bg-blue-50' },
        average: { color: 'text-yellow-600', bg: 'bg-yellow-50' },
        poor: { color: 'text-red-600', bg: 'bg-red-50' },
    };

    return (
        <span className={cn('text-xs font-medium', config[rating].color)}>
            <TrendingUp className="inline h-3 w-3 mr-0.5" />
            {rating === 'excellent' ? 'Excelente' : rating === 'good' ? 'Bueno' : rating === 'average' ? 'Promedio' : 'Bajo'}
        </span>
    );
}

// Agent Card Component
function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
    const isAI = isAIAgent(agent);
    const roleLabel = ROLE_LABELS[agent.role as AgentRole] || agent.role;
    const performance = calculateAgentPerformance(agent);

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-solaria-orange/30 hover:shadow-md"
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    isAI ? 'bg-purple-100' : 'bg-blue-100'
                )}>
                    {isAI ? (
                        <Bot className="h-6 w-6 text-purple-600" />
                    ) : (
                        <UserCircle className="h-6 w-6 text-blue-600" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
                        <StatusBadge status={agent.status} />
                    </div>
                    <p className="text-sm text-gray-500">{roleLabel}</p>
                    {isAI && (
                        <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">
                            <Bot className="h-3 w-3" />
                            Agente IA
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{agent.tasks_assigned}</p>
                    <p className="text-xs text-gray-500">Asignadas</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{agent.tasks_completed}</p>
                    <p className="text-xs text-gray-500">Completadas</p>
                </div>
                <div className="text-center flex-1">
                    <p className={cn(
                        'text-lg font-bold',
                        performance.efficiency >= 90 ? 'text-green-600' :
                        performance.efficiency >= 75 ? 'text-blue-600' :
                        performance.efficiency >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                    )}>
                        {performance.efficiency}%
                    </p>
                    <p className="text-xs text-gray-500">Eficiencia</p>
                </div>
            </div>

            {/* Performance indicator */}
            <div className="mt-3 flex items-center justify-between">
                <PerformanceBadge rating={performance.rating} />
                <span className="text-xs text-gray-400 group-hover:text-solaria-orange transition-colors">
                    Ver detalles →
                </span>
            </div>
        </div>
    );
}

// Section Header
function SectionHeader({
    title,
    icon,
    count,
    activeCount,
}: {
    title: string;
    icon: React.ReactNode;
    count: number;
    activeCount: number;
}) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">
                        {count} {count === 1 ? 'agente' : 'agentes'} | {activeCount} activos
                    </p>
                </div>
            </div>
        </div>
    );
}

export function OfficeAgentsPage() {
    const { filters, setFilter, openDrawer, resetFilters } = useAgentsStore();
    const { data: agents, isLoading, error, refetch } = useAgentsFiltered(filters);

    // Separate agents by type (using name prefix convention: SOLARIA- for AI)
    const { humanAgents, aiAgents, totals } = useMemo(() => {
        if (!agents) return { humanAgents: [], aiAgents: [], totals: { humans: 0, humansActive: 0, ai: 0, aiActive: 0 } };

        // Apply type filter from store
        let filteredAgents = agents;
        if (filters.type === 'human') {
            filteredAgents = agents.filter((a) => !isAIAgent(a));
        } else if (filters.type === 'ai') {
            filteredAgents = agents.filter((a) => isAIAgent(a));
        }

        const humans = filteredAgents.filter((a) => !isAIAgent(a));
        const ai = filteredAgents.filter((a) => isAIAgent(a));

        return {
            humanAgents: humans,
            aiAgents: ai,
            totals: {
                humans: humans.length,
                humansActive: humans.filter((a) => a.status === 'active').length,
                ai: ai.length,
                aiActive: ai.filter((a) => a.status === 'active').length,
            },
        };
    }, [agents, filters.type]);

    // Handle opening agent detail
    const handleAgentClick = (agentId: number) => {
        openDrawer('view', agentId);
    };

    // Check if filters are active
    const hasActiveFilters = filters.type !== 'all' || filters.status !== 'all' || filters.role !== 'all' || filters.search !== '';

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-gray-200" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>Error al cargar agentes: {error.message}</span>
            </div>
        );
    }

    return (
        <>
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agentes</h1>
                    <p className="text-sm text-gray-500">
                        {totals.humans} humanos | {totals.ai} IA | {totals.humansActive + totals.aiActive} activos
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                        title="Actualizar"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <PermissionGate permission="agents:create">
                        <button
                            className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Agente
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar agentes..."
                        value={filters.search}
                        onChange={(e) => setFilter('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                    />
                </div>

                {/* Type Filter */}
                <select
                    value={filters.type}
                    onChange={(e) => setFilter('type', e.target.value as 'all' | 'human' | 'ai')}
                    className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                >
                    <option value="all">Todos los tipos</option>
                    <option value="human">Humanos</option>
                    <option value="ai">IA</option>
                </select>

                {/* Status Filter */}
                <select
                    value={filters.status}
                    onChange={(e) => setFilter('status', e.target.value as AgentStatus | 'all')}
                    className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="busy">Ocupado</option>
                    <option value="inactive">Inactivo</option>
                    <option value="error">Error</option>
                    <option value="maintenance">Mantenimiento</option>
                </select>

                {/* Role Filter */}
                <select
                    value={filters.role}
                    onChange={(e) => setFilter('role', e.target.value as AgentRole | 'all')}
                    className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                >
                    <option value="all">Todos los roles</option>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        <Filter className="h-4 w-4" />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Human Agents Section */}
            {(filters.type === 'all' || filters.type === 'human') && (
                <section className="space-y-4">
                    <SectionHeader
                        title="Equipo Humano"
                        icon={<Users className="h-5 w-5 text-blue-600" />}
                        count={totals.humans}
                        activeCount={totals.humansActive}
                    />
                    {humanAgents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {humanAgents.map((agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onClick={() => handleAgentClick(agent.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                            {hasActiveFilters ? 'No hay agentes que coincidan con los filtros' : 'No hay agentes humanos registrados'}
                        </div>
                    )}
                </section>
            )}

            {/* AI Agents Section */}
            {(filters.type === 'all' || filters.type === 'ai') && (
                <section className="space-y-4">
                    <SectionHeader
                        title="Agentes IA (SOLARIA)"
                        icon={<Bot className="h-5 w-5 text-purple-600" />}
                        count={totals.ai}
                        activeCount={totals.aiActive}
                    />
                    {aiAgents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {aiAgents.map((agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onClick={() => handleAgentClick(agent.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                            {hasActiveFilters ? 'No hay agentes que coincidan con los filtros' : 'No hay agentes IA registrados'}
                        </div>
                    )}
                </section>
            )}
        </div>

        {/* Agent Detail Drawer */}
        <AgentDetailDrawer />
        </>
    );
}

export default OfficeAgentsPage;
