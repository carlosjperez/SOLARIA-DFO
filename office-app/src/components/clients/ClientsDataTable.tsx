/**
 * ClientsDataTable Component
 * Table view for clients with sorting and actions
 */

import { useMemo, useState } from 'react';
import { Edit, Trash2, Eye, Building2, Mail, Phone } from 'lucide-react';
import { DataTable, Column, RowAction } from '@components/ui/DataTable';
import { useClientsStore, useDeleteClient } from '@store/useClientsStore';
import { usePermissions } from '@hooks/usePermissions';
import { cn } from '@lib/utils';
import type { OfficeClient } from '@lib/api';

interface ClientsDataTableProps {
    clients: OfficeClient[];
    isLoading?: boolean;
}

// Status badge renderer
function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        prospect: { label: 'Prospecto', className: 'bg-blue-100 text-blue-700' },
        active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
        inactive: { label: 'Inactivo', className: 'bg-gray-100 text-gray-700' },
        churned: { label: 'Perdido', className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                config.className
            )}
        >
            {config.label}
        </span>
    );
}

export function ClientsDataTable({ clients, isLoading }: ClientsDataTableProps) {
    const { can } = usePermissions();
    const { sortField, sortDirection, setSorting, openDrawer } = useClientsStore();
    const deleteClient = useDeleteClient();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Sort clients
    const sortedClients = useMemo(() => {
        return [...clients].sort((a, b) => {
            const aValue = a[sortField as keyof OfficeClient];
            const bValue = b[sortField as keyof OfficeClient];

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = String(aValue).localeCompare(String(bValue));
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [clients, sortField, sortDirection]);

    // Define columns
    const columns: Column<OfficeClient>[] = [
        {
            key: 'name',
            header: 'Cliente',
            sortable: true,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-solaria-orange/10 to-solaria-orange/5">
                        <Building2 className="h-5 w-5 text-solaria-orange" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.name}</p>
                        {row.fiscalName && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {row.fiscalName}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Contacto',
            render: (_, row) => (
                <div className="space-y-1">
                    {row.email && (
                        <a
                            href={`mailto:${row.email}`}
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-solaria-orange"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[180px]">{row.email}</span>
                        </a>
                    )}
                    {row.phone && (
                        <a
                            href={`tel:${row.phone}`}
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-solaria-orange"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Phone className="h-3.5 w-3.5" />
                            {row.phone}
                        </a>
                    )}
                    {!row.email && !row.phone && (
                        <span className="text-sm text-gray-400">Sin contacto</span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            width: '120px',
            render: (value) => <StatusBadge status={value as string} />,
        },
        {
            key: 'createdAt',
            header: 'Creado',
            sortable: true,
            width: '140px',
            render: (value) => (
                <span className="text-sm text-gray-500">
                    {new Date(value as string).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
            ),
        },
    ];

    // Define row actions
    const rowActions: RowAction<OfficeClient>[] = [
        {
            label: 'Ver detalles',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row) => openDrawer('view', row.id),
        },
        {
            label: 'Editar',
            icon: <Edit className="h-4 w-4" />,
            onClick: (row) => openDrawer('edit', row.id),
            hidden: () => !can('clients.edit'),
        },
        {
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger',
            onClick: (row) => {
                if (confirm(`¿Eliminar cliente "${row.name}"?`)) {
                    deleteClient.mutate(row.id);
                }
            },
            hidden: () => !can('clients.delete'),
        },
    ];

    return (
        <DataTable<OfficeClient>
            columns={columns}
            data={sortedClients}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="No hay clientes registrados"
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => setSorting(field as 'name' | 'status' | 'createdAt' | 'updatedAt')}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            rowActions={rowActions}
            onRowClick={(row) => openDrawer('view', row.id)}
        />
    );
}

export default ClientsDataTable;
