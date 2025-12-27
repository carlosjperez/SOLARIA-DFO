/**
 * OfficeClientsPage
 * CRM Clients management with cards/table views
 */

import { useMemo } from 'react';
import {
    Search,
    Building2,
    FolderKanban,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Plus,
    Filter,
    X,
} from 'lucide-react';
import { ViewToggle, ViewMode } from '@components/ui/ViewToggle';
import { ClientsDataTable } from '@components/clients/ClientsDataTable';
import { ClientDetailDrawer } from '@components/clients/ClientDetailDrawer';
import { ClientForm } from '@components/clients/ClientForm';
import { Drawer } from '@components/ui/Drawer';
import { PermissionGate } from '@components/auth/PermissionGate';
import {
    useClientsStore,
    useClients,
    useCreateClient,
    ClientStatus,
} from '@store/useClientsStore';
import { cn } from '@lib/utils';
import type { OfficeClient } from '@lib/api';

// Status filter options
const STATUS_OPTIONS: { value: ClientStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'prospect', label: 'Prospectos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'churned', label: 'Perdidos' },
];

// Client Card Component (enhanced)
function ClientCard({
    client,
    onClick,
}: {
    client: OfficeClient;
    onClick: () => void;
}) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        prospect: { label: 'Prospecto', className: 'bg-blue-100 text-blue-700' },
        active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
        inactive: { label: 'Inactivo', className: 'bg-gray-100 text-gray-700' },
        churned: { label: 'Perdido', className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[client.status] || statusConfig.active;

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-solaria-orange/30 hover:shadow-md"
        >
            {/* Status Badge */}
            <div className="absolute right-4 top-4">
                <span
                    className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        config.className
                    )}
                >
                    {config.label}
                </span>
            </div>

            {/* Header */}
            <div className="mb-4 flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-solaria-orange/10 to-solaria-orange/5">
                    <Building2 className="h-6 w-6 text-solaria-orange" />
                </div>
                <div className="flex-1 min-w-0 pr-16">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {client.name}
                    </h3>
                    {client.fiscalName && (
                        <p className="text-sm text-gray-500 truncate">
                            {client.fiscalName}
                        </p>
                    )}
                </div>
            </div>

            {/* Contact Info */}
            <div className="mb-4 space-y-1 text-sm text-gray-600">
                {client.email && (
                    <p className="truncate">{client.email}</p>
                )}
                {client.phone && <p>{client.phone}</p>}
                {!client.email && !client.phone && (
                    <p className="text-gray-400 italic">Sin contacto registrado</p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">
                    {new Date(client.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
                <span className="text-xs font-medium text-solaria-orange opacity-0 transition-opacity group-hover:opacity-100">
                    Ver detalles →
                </span>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ onCreateClient }: { onCreateClient: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-500">
                Comienza agregando tu primer cliente al CRM.
            </p>
            <PermissionGate permission="clients.create">
                <button
                    onClick={onCreateClient}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
                >
                    <Plus className="h-4 w-4" />
                    Agregar Cliente
                </button>
            </PermissionGate>
        </div>
    );
}

// Loading State
function LoadingState() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-gray-200" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 rounded-xl bg-gray-200" />
                ))}
            </div>
        </div>
    );
}

export function OfficeClientsPage() {
    const {
        viewMode,
        setViewMode,
        filters,
        setFilter,
        resetFilters,
        openDrawer,
        isDrawerOpen,
        drawerMode,
        closeDrawer,
    } = useClientsStore();

    // Fetch clients with filters
    const { data: clients = [], isLoading, error } = useClients({
        status: filters.status === 'all' ? undefined : filters.status,
        search: filters.search || undefined,
    });

    const createClient = useCreateClient();

    // Calculate totals
    const totals = useMemo(() => {
        return clients.reduce(
            (acc, client) => ({
                total: acc.total + 1,
                active: acc.active + (client.status === 'active' ? 1 : 0),
                prospects: acc.prospects + (client.status === 'prospect' ? 1 : 0),
            }),
            { total: 0, active: 0, prospects: 0 }
        );
    }, [clients]);

    // Handle create client
    const handleCreateClient = async (data: Record<string, unknown>) => {
        await createClient.mutateAsync(data as Partial<OfficeClient>);
        closeDrawer();
    };

    // Has active filters
    const hasActiveFilters = filters.status !== 'all' || filters.search !== '';

    if (isLoading) {
        return <LoadingState />;
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
                        Gestiona tus clientes y prospectos
                    </p>
                </div>
                <PermissionGate permission="clients.create">
                    <button
                        onClick={() => openDrawer('create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Cliente
                    </button>
                </PermissionGate>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Building2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Total Clientes</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{totals.total}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Activos</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-green-600">{totals.active}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <FolderKanban className="h-4 w-4" />
                        <span className="text-xs font-medium">Prospectos</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{totals.prospects}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-medium">Conversion</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-purple-600">
                        {totals.total > 0
                            ? Math.round((totals.active / totals.total) * 100)
                            : 0}
                        %
                    </p>
                </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            value={filters.search}
                            onChange={(e) => setFilter('search', e.target.value)}
                            className="w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                setFilter('status', e.target.value as ClientStatus | 'all')
                            }
                            className="appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            <X className="h-4 w-4" />
                            Limpiar
                        </button>
                    )}
                </div>

                {/* View Toggle */}
                <ViewToggle
                    view={viewMode === 'table' ? 'list' : 'cards'}
                    onChange={(v: ViewMode) => setViewMode(v === 'list' ? 'table' : 'cards')}
                    options={['cards', 'list']}
                />
            </div>

            {/* Content */}
            {clients.length === 0 ? (
                <EmptyState onCreateClient={() => openDrawer('create')} />
            ) : viewMode === 'table' ? (
                <ClientsDataTable clients={clients} isLoading={isLoading} />
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onClick={() => openDrawer('view', client.id)}
                        />
                    ))}
                </div>
            )}

            {/* Detail Drawer */}
            <ClientDetailDrawer />

            {/* Create Drawer */}
            <Drawer
                isOpen={isDrawerOpen && drawerMode === 'create'}
                onClose={closeDrawer}
                title="Nuevo Cliente"
                size="lg"
            >
                <ClientForm
                    onSubmit={handleCreateClient}
                    onCancel={closeDrawer}
                    isSubmitting={createClient.isPending}
                />
            </Drawer>
        </div>
    );
}

export default OfficeClientsPage;
