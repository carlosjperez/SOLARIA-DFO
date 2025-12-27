/**
 * ClientDetailDrawer Component
 * Drawer for viewing/editing client details
 */

import { useState } from 'react';
import {
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Edit,
    Trash2,
    Users,
    FolderKanban,
    DollarSign,
    AlertCircle,
    Plus,
    User,
} from 'lucide-react';
import { Drawer } from '@components/ui/Drawer';
import { ClientForm } from './ClientForm';
import {
    useClient,
    useUpdateClient,
    useDeleteClient,
    useClientsStore,
} from '@store/useClientsStore';
import { usePermissions } from '@hooks/usePermissions';
import { cn } from '@lib/utils';

// Status badge component
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
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                config.className
            )}
        >
            {config.label}
        </span>
    );
}

// Contact card component
function ContactCard({
    contact,
    isPrimary,
}: {
    contact: { name: string; role?: string; email?: string; phone?: string };
    isPrimary: boolean;
}) {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <User className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                    {isPrimary && (
                        <span className="rounded-full bg-solaria-orange/10 px-2 py-0.5 text-xs text-solaria-orange">
                            Principal
                        </span>
                    )}
                </div>
                {contact.role && (
                    <p className="text-sm text-gray-500">{contact.role}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                    {contact.email && (
                        <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-1 hover:text-solaria-orange"
                        >
                            <Mail className="h-3.5 w-3.5" />
                            {contact.email}
                        </a>
                    )}
                    {contact.phone && (
                        <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-1 hover:text-solaria-orange"
                        >
                            <Phone className="h-3.5 w-3.5" />
                            {contact.phone}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ClientDetailDrawer() {
    const { can } = usePermissions();
    const {
        isDrawerOpen,
        drawerMode,
        selectedClientId,
        closeDrawer,
        openDrawer,
    } = useClientsStore();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data: client, isLoading, error } = useClient(selectedClientId);
    const updateClient = useUpdateClient();
    const deleteClient = useDeleteClient();

    const handleUpdate = async (data: Record<string, unknown>) => {
        if (!selectedClientId) return;
        await updateClient.mutateAsync({ id: selectedClientId, data });
        openDrawer('view', selectedClientId);
    };

    const handleDelete = async () => {
        if (!selectedClientId) return;
        await deleteClient.mutateAsync(selectedClientId);
        closeDrawer();
    };

    const canEdit = can('clients.edit');
    const canDelete = can('clients.delete');

    // Render loading state
    if (isLoading) {
        return (
            <Drawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="Cargando..."
                size="lg"
            >
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 rounded bg-gray-200" />
                    <div className="h-32 rounded-lg bg-gray-200" />
                    <div className="h-48 rounded-lg bg-gray-200" />
                </div>
            </Drawer>
        );
    }

    // Render error state
    if (error) {
        return (
            <Drawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="Error"
                size="lg"
            >
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error al cargar cliente: {error.message}</span>
                </div>
            </Drawer>
        );
    }

    // Render edit form
    if (drawerMode === 'edit' && client) {
        return (
            <Drawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="Editar Cliente"
                subtitle={client.name}
                size="lg"
            >
                <ClientForm
                    client={client}
                    onSubmit={handleUpdate}
                    onCancel={() => openDrawer('view', selectedClientId!)}
                    isSubmitting={updateClient.isPending}
                />
            </Drawer>
        );
    }

    // Render create form
    if (drawerMode === 'create') {
        return (
            <Drawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="Nuevo Cliente"
                size="lg"
            >
                <ClientForm
                    onSubmit={async (data) => {
                        // Will use createClient mutation from parent
                        console.log('Create client:', data);
                        closeDrawer();
                    }}
                    onCancel={closeDrawer}
                />
            </Drawer>
        );
    }

    // Render view mode
    return (
        <Drawer
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            title={client?.name || 'Cliente'}
            subtitle={client?.fiscalName}
            size="lg"
            footer={
                client && (
                    <div className="flex items-center justify-between">
                        {/* Delete button */}
                        {canDelete && (
                            <div>
                                {showDeleteConfirm ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Confirmar:</span>
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleteClient.isPending}
                                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                                        >
                                            Eliminar
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Edit button */}
                        {canEdit && (
                            <button
                                onClick={() => openDrawer('edit', selectedClientId!)}
                                className="flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white hover:bg-solaria-orange-dark"
                            >
                                <Edit className="h-4 w-4" />
                                Editar
                            </button>
                        )}
                    </div>
                )
            }
        >
            {client && (
                <div className="space-y-6">
                    {/* Header with status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/5">
                                <Building2 className="h-7 w-7 text-solaria-orange" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {client.name}
                                </h3>
                                {client.rfc && (
                                    <p className="text-sm text-gray-500">RFC: {client.rfc}</p>
                                )}
                            </div>
                        </div>
                        <StatusBadge status={client.status} />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {client.email && (
                            <a
                                href={`mailto:${client.email}`}
                                className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:border-solaria-orange hover:text-solaria-orange"
                            >
                                <Mail className="h-5 w-5 text-gray-400" />
                                <span className="truncate">{client.email}</span>
                            </a>
                        )}
                        {client.phone && (
                            <a
                                href={`tel:${client.phone}`}
                                className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:border-solaria-orange hover:text-solaria-orange"
                            >
                                <Phone className="h-5 w-5 text-gray-400" />
                                {client.phone}
                            </a>
                        )}
                        {client.website && (
                            <a
                                href={client.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:border-solaria-orange hover:text-solaria-orange"
                            >
                                <Globe className="h-5 w-5 text-gray-400" />
                                <span className="truncate">{client.website}</span>
                            </a>
                        )}
                        {client.address && (
                            <div className="col-span-2 flex items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                                <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
                                {client.address}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-center gap-2 text-blue-600">
                                <FolderKanban className="h-5 w-5" />
                                <span className="text-xs font-medium">Proyectos</span>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-blue-700">
                                {(client as { projects?: unknown[] }).projects?.length || 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4">
                            <div className="flex items-center gap-2 text-green-600">
                                <DollarSign className="h-5 w-5" />
                                <span className="text-xs font-medium">Facturado</span>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-green-700">
                                $0
                            </p>
                        </div>
                        <div className="rounded-lg bg-purple-50 p-4">
                            <div className="flex items-center gap-2 text-purple-600">
                                <Users className="h-5 w-5" />
                                <span className="text-xs font-medium">Contactos</span>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-purple-700">
                                {(client as { contacts?: unknown[] }).contacts?.length || 0}
                            </p>
                        </div>
                    </div>

                    {/* Contacts */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">Contactos</h4>
                            {canEdit && (
                                <button className="flex items-center gap-1 text-sm text-solaria-orange hover:underline">
                                    <Plus className="h-4 w-4" />
                                    Agregar
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {(client as { contacts?: Array<{ id: number; name: string; role?: string; email?: string; phone?: string; isPrimary: boolean }> }).contacts?.map((contact) => (
                                <ContactCard
                                    key={contact.id}
                                    contact={contact}
                                    isPrimary={contact.isPrimary}
                                />
                            )) || (
                                <p className="text-sm text-gray-500">No hay contactos registrados</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {client.notes && (
                        <div>
                            <h4 className="mb-2 font-medium text-gray-900">Notas</h4>
                            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 whitespace-pre-wrap">
                                {client.notes}
                            </p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
                        <p>Creado: {new Date(client.createdAt).toLocaleString('es-MX')}</p>
                        <p>Actualizado: {new Date(client.updatedAt).toLocaleString('es-MX')}</p>
                    </div>
                </div>
            )}
        </Drawer>
    );
}

export default ClientDetailDrawer;
