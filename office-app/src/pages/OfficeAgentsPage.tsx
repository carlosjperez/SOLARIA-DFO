/**
 * OfficeAgentsPage
 * Agents table separated by type: Humans and AI
 */

import { useState, useMemo } from 'react';
import { useAgents } from '@hooks/useAgents';
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
} from 'lucide-react';
import type { Agent, AgentStatus, AgentRole } from '../types';

// Agent status configuration
const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: 'Activo', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4" /> },
    busy: { label: 'Ocupado', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-4 w-4" /> },
    inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-4 w-4" /> },
    error: { label: 'Error', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
    maintenance: { label: 'Mantenimiento', color: 'bg-purple-100 text-purple-700', icon: <Wrench className="h-4 w-4" /> },
};

// Agent role labels
const ROLE_LABELS: Record<AgentRole, string> = {
    project_manager: 'Project Manager',
    architect: 'Arquitecto',
    developer: 'Desarrollador',
    tester: 'QA Tester',
    analyst: 'Analista',
    designer: 'Diseñador',
    devops: 'DevOps',
    technical_writer: 'Tech Writer',
    security_auditor: 'Auditor Seguridad',
    deployment_specialist: 'Deploy Specialist',
};

// Status Badge
function StatusBadge({ status }: { status: AgentStatus }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', config.color)}>
            {config.icon}
            {config.label}
        </span>
    );
}

// Agent Card Component
function AgentCard({ agent, isAI }: { agent: Agent; isAI: boolean }) {
    const roleLabel = ROLE_LABELS[agent.role] || agent.role;

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-solaria-orange/30 hover:shadow-md">
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
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
                        <StatusBadge status={agent.status} />
                    </div>
                    <p className="text-sm text-gray-500">{roleLabel}</p>
                    {agent.description && (
                        <p className="mt-1 text-xs text-gray-400 line-clamp-2">{agent.description}</p>
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
                    <p className="text-lg font-bold text-blue-600">
                        {agent.tasks_assigned > 0
                            ? Math.round((agent.tasks_completed / agent.tasks_assigned) * 100)
                            : 0}%
                    </p>
                    <p className="text-xs text-gray-500">Eficiencia</p>
                </div>
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
    const { data: agents, isLoading, error } = useAgents();
    const [searchQuery, setSearchQuery] = useState('');
    const [_showCreateModal, setShowCreateModal] = useState(false);

    // Separate agents by type (using name prefix convention: SOLARIA- for AI)
    const { humanAgents, aiAgents } = useMemo(() => {
        if (!agents) return { humanAgents: [], aiAgents: [] };

        const filtered = searchQuery
            ? agents.filter((a) =>
                a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.role.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : agents;

        return {
            humanAgents: filtered.filter((a) => !a.name.startsWith('SOLARIA-')),
            aiAgents: filtered.filter((a) => a.name.startsWith('SOLARIA-')),
        };
    }, [agents, searchQuery]);

    // Totals
    const totals = useMemo(() => ({
        humans: humanAgents.length,
        humansActive: humanAgents.filter((a) => a.status === 'active').length,
        ai: aiAgents.length,
        aiActive: aiAgents.filter((a) => a.status === 'active').length,
    }), [humanAgents, aiAgents]);

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agentes</h1>
                    <p className="text-sm text-gray-500">
                        {totals.humans} humanos | {totals.ai} IA | {totals.humansActive + totals.aiActive} activos
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Agente
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar agentes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                />
            </div>

            {/* Human Agents Section */}
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
                            <AgentCard key={agent.id} agent={agent} isAI={false} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                        No hay agentes humanos registrados
                    </div>
                )}
            </section>

            {/* AI Agents Section */}
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
                            <AgentCard key={agent.id} agent={agent} isAI={true} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                        No hay agentes IA registrados
                    </div>
                )}
            </section>
        </div>
    );
}

export default OfficeAgentsPage;
