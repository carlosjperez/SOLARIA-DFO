/**
 * ClientFormModal
 * Modal form for creating and viewing client summaries
 * Note: Clients are derived from projects, so this is view-only with project creation
 */

import { Modal } from '@components/ui/Modal';
import { cn } from '@lib/utils';
import {
    Building2,
    FolderKanban,
    DollarSign,
    TrendingUp,
    ExternalLink,
} from 'lucide-react';
import type { Client } from '../../types';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: Client | null;
    onCreateProject?: () => void;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function ClientFormModal({
    isOpen,
    onClose,
    client,
    onCreateProject,
}: ClientFormModalProps) {
    if (!client) return null;

    const activeRate = client.projects > 0
        ? Math.round((client.activeProjects / client.projects) * 100)
        : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalle de Cliente"
            size="md"
        >
            <div className="space-y-6">
                {/* Client Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/5">
                        <Building2 className="h-8 w-8 text-solaria-orange" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">
                            Cliente desde hace tiempo
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FolderKanban className="h-5 w-5" />
                            <span className="text-sm font-medium">Proyectos Totales</span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{client.projects}</p>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-600">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-sm font-medium">Proyectos Activos</span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-blue-700">{client.activeProjects}</p>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center gap-2 text-green-600">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-sm font-medium">Presupuesto Total</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-green-700">
                            {formatCurrency(client.totalBudget)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                        <div className="flex items-center gap-2 text-purple-600">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-sm font-medium">Ticket Promedio</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-purple-700">
                            {client.projects > 0
                                ? formatCurrency(client.totalBudget / client.projects)
                                : '-'}
                        </p>
                    </div>
                </div>

                {/* Activity Rate */}
                <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Tasa de Actividad</span>
                        <span className={cn(
                            'text-lg font-bold',
                            activeRate >= 70 ? 'text-green-600' :
                            activeRate >= 40 ? 'text-yellow-600' :
                            'text-gray-600'
                        )}>
                            {activeRate}%
                        </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
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
                    <p className="mt-2 text-xs text-gray-500">
                        {client.activeProjects} de {client.projects} proyectos activos
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                    {onCreateProject && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onCreateProject();
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Nuevo Proyecto
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

export default ClientFormModal;
