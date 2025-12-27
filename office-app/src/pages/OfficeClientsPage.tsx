/**
 * OfficeClientsPage
 * Client cards view with project summaries
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@hooks/useProjects';
import { summarizeProjectsByClient } from '@lib/office-utils';
import { cn } from '@lib/utils';
import { ClientFormModal } from '@components/clients/ClientFormModal';
import {
    Search,
    Building2,
    FolderKanban,
    DollarSign,
    TrendingUp,
    ChevronRight,
    AlertCircle,
    Users,
} from 'lucide-react';
import type { Client } from '../types';

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(amount);
}

// Client Card Component
function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
    const activeRate = client.projects > 0
        ? Math.round((client.activeProjects / client.projects) * 100)
        : 0;

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-solaria-orange/30 hover:shadow-md"
        >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-solaria-orange/10 to-solaria-orange/5">
                        <Building2 className="h-6 w-6 text-solaria-orange" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">
                            {client.projects} {client.projects === 1 ? 'proyecto' : 'proyectos'}
                        </p>
                    </div>
                </div>
                <button className="rounded-lg p-2 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Active Projects */}
                <div className="rounded-lg bg-blue-50 p-3">
                    <div className="flex items-center gap-2 text-blue-600">
                        <FolderKanban className="h-4 w-4" />
                        <span className="text-xs font-medium">Activos</span>
                    </div>
                    <p className="mt-1 text-xl font-bold text-blue-700">
                        {client.activeProjects}
                    </p>
                </div>

                {/* Budget */}
                <div className="rounded-lg bg-green-50 p-3">
                    <div className="flex items-center gap-2 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-medium">Presupuesto</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-green-700 truncate" title={formatCurrency(client.totalBudget)}>
                        {formatCurrency(client.totalBudget)}
                    </p>
                </div>
            </div>

            {/* Activity Rate */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tasa de actividad</span>
                    <span className={cn(
                        'font-semibold',
                        activeRate >= 70 ? 'text-green-600' :
                        activeRate >= 40 ? 'text-yellow-600' :
                        'text-gray-600'
                    )}>
                        {activeRate}%
                    </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className={cn(
                            'h-full transition-all duration-500',
                            activeRate >= 70 ? 'bg-green-500' :
                            activeRate >= 40 ? 'bg-yellow-500' :
                            'bg-gray-400'
                        )}
                        style={{ width: `${activeRate}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ onNavigateToProjects }: { onNavigateToProjects: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-500">
                Los clientes se crean automaticamente cuando agregas proyectos.
            </p>
            <button
                onClick={onNavigateToProjects}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
            >
                <FolderKanban className="h-4 w-4" />
                Ir a Proyectos
            </button>
        </div>
    );
}

export function OfficeClientsPage() {
    const navigate = useNavigate();
    const { data: projects, isLoading, error } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Summarize projects by client
    const clients = useMemo(() => {
        if (!projects) return [];
        return summarizeProjectsByClient(projects);
    }, [projects]);

    // Filter clients by search
    const filteredClients = useMemo(() => {
        if (!searchQuery) return clients;
        const query = searchQuery.toLowerCase();
        return clients.filter((c) => c.name.toLowerCase().includes(query));
    }, [clients, searchQuery]);

    // Calculate totals
    const totals = useMemo(() => {
        return filteredClients.reduce(
            (acc, c) => ({
                clients: acc.clients + 1,
                projects: acc.projects + c.projects,
                budget: acc.budget + c.totalBudget,
                active: acc.active + c.activeProjects,
            }),
            { clients: 0, projects: 0, budget: 0, active: 0 }
        );
    }, [filteredClients]);

    const handleNavigateToProjects = () => {
        navigate('/projects');
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-gray-200" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>Error al cargar clientes: {error.message}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-sm text-gray-500">
                        {totals.clients} clientes | {totals.projects} proyectos | {formatCurrency(totals.budget)} total
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Building2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Total Clientes</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{totals.clients}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <FolderKanban className="h-4 w-4" />
                        <span className="text-xs font-medium">Proyectos Activos</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{totals.active}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-medium">Presupuesto Total</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(totals.budget)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Ticket Promedio</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-purple-600">
                        {totals.projects > 0 ? formatCurrency(totals.budget / totals.projects) : '-'}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                />
            </div>

            {/* Clients Grid */}
            {filteredClients.length === 0 ? (
                <EmptyState onNavigateToProjects={handleNavigateToProjects} />
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.name}
                            client={client}
                            onClick={() => setSelectedClient(client)}
                        />
                    ))}
                </div>
            )}

            {/* Client Detail Modal */}
            <ClientFormModal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                client={selectedClient}
                onCreateProject={handleNavigateToProjects}
            />
        </div>
    );
}

export default OfficeClientsPage;
