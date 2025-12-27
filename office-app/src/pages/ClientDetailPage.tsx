/**
 * ClientDetailPage
 * Complete client detail view with tabs for Overview, Contacts, Projects, Payments, Activity
 * Connected to DFO API
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@lib/utils';
import { useClientDetail } from '@hooks/useClients';
import type { OfficeClient, ClientContact, ClientPayment, Project } from '../types';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Calendar,
    Edit,
    MoreHorizontal,
    Plus,
    User,
    FolderKanban,
    DollarSign,
    Activity,
    FileText,
    ExternalLink,
    CheckCircle2,
    Clock,
    TrendingUp,
    CreditCard,
    Receipt,
    UserPlus,
    Star,
    Loader2,
    AlertTriangle,
} from 'lucide-react';

// Type definitions for related data
interface ClientProject {
    id: number;
    name: string;
    status: string;
    progress: number;
    budget?: number;
    deadline?: string;
}

interface ClientActivity {
    id: number;
    action: string;
    description?: string;
    date: string;
    type: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(amount: number, currency = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return formatDate(dateStr);
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Status Badge
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-green-100 text-green-700 border-green-200',
        lead: 'bg-blue-100 text-blue-700 border-blue-200',
        prospect: 'bg-purple-100 text-purple-700 border-purple-200',
        inactive: 'bg-gray-100 text-gray-700 border-gray-200',
        churned: 'bg-red-100 text-red-700 border-red-200',
    };
    const labels: Record<string, string> = {
        active: 'Activo',
        lead: 'Lead',
        prospect: 'Prospecto',
        inactive: 'Inactivo',
        churned: 'Perdido',
    };
    return (
        <span className={cn('px-2 py-1 text-xs font-medium rounded-full border', styles[status] || styles.inactive)}>
            {labels[status] || status}
        </span>
    );
}

// Project Status Badge
function ProjectStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        planning: 'bg-gray-100 text-gray-700',
        development: 'bg-blue-100 text-blue-700',
        testing: 'bg-purple-100 text-purple-700',
        completed: 'bg-green-100 text-green-700',
        on_hold: 'bg-yellow-100 text-yellow-700',
    };
    const labels: Record<string, string> = {
        planning: 'Planificación',
        development: 'En Desarrollo',
        testing: 'Testing',
        completed: 'Completado',
        on_hold: 'En Pausa',
    };
    return (
        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', styles[status] || 'bg-gray-100 text-gray-700')}>
            {labels[status] || status}
        </span>
    );
}

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        received: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-red-100 text-red-700',
        refunded: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
        received: 'Recibido',
        pending: 'Pendiente',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado',
    };
    return (
        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', styles[status] || 'bg-gray-100 text-gray-700')}>
            {labels[status] || status}
        </span>
    );
}

// Tab Button
function TabButton({
    active,
    onClick,
    icon: Icon,
    label,
    count
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    count?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                active
                    ? 'border-solaria-orange text-solaria-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {count !== undefined && (
                <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    active ? 'bg-solaria-orange/10 text-solaria-orange' : 'bg-gray-100 text-gray-500'
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

// Overview Tab
function OverviewTab({ client }: { client: OfficeClient }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <a href={`mailto:${client.primary_email}`} className="text-blue-600 hover:underline">
                                {client.primary_email}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <a href={`tel:${client.primary_phone}`} className="text-gray-900">
                                {client.primary_phone}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500">Sitio Web</p>
                            <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                {client.website}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500">Dirección</p>
                            <p className="text-gray-900">
                                {client.address_line1}<br />
                                {client.address_line2 && <>{client.address_line2}<br /></>}
                                {client.city}, {client.state} {client.postal_code}<br />
                                {client.country}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Fiscal</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Razón Social</p>
                        <p className="text-gray-900 font-medium">{client.fiscal_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">RFC</p>
                        <p className="text-gray-900 font-mono">{client.tax_id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Industria</p>
                        <p className="text-gray-900">{client.industry}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tamaño</p>
                        <p className="text-gray-900 capitalize">{client.company_size}</p>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
                    <button className="text-sm text-solaria-orange hover:underline">Editar</button>
                </div>
                <p className="text-gray-600">{client.notes || 'Sin notas'}</p>
            </div>
        </div>
    );
}

// Contacts Tab
function ContactsTab({ contacts }: { contacts: ClientContact[] }) {
    return (
        <div className="space-y-4">
            {/* Add Contact Button */}
            <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                    <UserPlus className="h-4 w-4" />
                    Agregar Contacto
                </button>
            </div>

            {/* Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                    <div key={contact.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-solaria-orange" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        {contact.name}
                                        {contact.is_primary && (
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-500">{contact.title}</p>
                                </div>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {contact.email}
                            </a>
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                {contact.phone}
                            </a>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors">
                                <Mail className="h-3.5 w-3.5" />
                                Email
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors">
                                <Phone className="h-3.5 w-3.5" />
                                Llamar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Projects Tab
function ProjectsTab({ projects }: { projects: ClientProject[] }) {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {/* Add Project Button */}
            <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                    <Plus className="h-4 w-4" />
                    Nuevo Proyecto
                </button>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <FolderKanban className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">{project.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <ProjectStatusBadge status={project.status} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 w-32">
                                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                                )}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">{project.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                    {project.budget ? formatCurrency(project.budget) : '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {project.deadline ? formatDate(project.deadline) : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Payments Tab
function PaymentsTab({ payments }: { payments: ClientPayment[] }) {
    const totalReceived = payments.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Total Recibido</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Pendiente</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Lifetime Value</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalReceived + totalPending)}</p>
                </div>
            </div>

            {/* Add Payment Button */}
            <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                    <CreditCard className="h-4 w-4" />
                    Registrar Pago
                </button>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'h-8 w-8 rounded-lg flex items-center justify-center',
                                            payment.status === 'received' ? 'bg-green-100' : 'bg-yellow-100'
                                        )}>
                                            <Receipt className={cn(
                                                'h-4 w-4',
                                                payment.status === 'received' ? 'text-green-600' : 'text-yellow-600'
                                            )} />
                                        </div>
                                        <span className="font-mono text-sm text-gray-900">{payment.reference}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{payment.project_name || '-'}</td>
                                <td className="px-6 py-4">
                                    <PaymentStatusBadge status={payment.status} />
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {payment.payment_date ? formatDate(payment.payment_date) : (
                                        payment.due_date ? (
                                            <span className="text-yellow-600">Vence: {formatDate(payment.due_date)}</span>
                                        ) : '-'
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                    {formatCurrency(payment.amount, payment.currency)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Activity Tab
function ActivityTab({ activities }: { activities: ClientActivity[] }) {
    const iconMap: Record<string, React.ElementType> = {
        payment: DollarSign,
        project: FolderKanban,
        contact: User,
    };
    const colorMap: Record<string, string> = {
        payment: 'bg-green-100 text-green-600',
        project: 'bg-blue-100 text-blue-600',
        contact: 'bg-purple-100 text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Activity items */}
                <div className="space-y-6">
                    {activities.map((activity) => {
                        const Icon = iconMap[activity.type] || Activity;
                        return (
                            <div key={activity.id} className="relative flex gap-4">
                                {/* Icon */}
                                <div className={cn(
                                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full',
                                    colorMap[activity.type] || 'bg-gray-100 text-gray-600'
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1.5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900">{activity.action}</h4>
                                        <span className="text-sm text-gray-500">{formatRelativeDate(activity.date)}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

type TabType = 'overview' | 'contacts' | 'projects' | 'payments' | 'activity';

export function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Fetch client data from API
    const clientId = parseInt(id || '0');
    const { client, contacts, projects, payments, isLoading, isError, error } = useClientDetail(clientId);

    // Mock activities until we have an activity log endpoint
    const activities: ClientActivity[] = client ? [
        { id: 1, action: 'Cliente creado', description: 'Registro inicial en el sistema', date: client.created_at, type: 'contact' },
    ] : [];

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 text-solaria-orange animate-spin" />
                <p className="text-gray-500">Cargando cliente...</p>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Error al cargar cliente</h2>
                <p className="text-gray-500">{error?.message || 'Error desconocido'}</p>
                <button
                    onClick={() => navigate('/clients')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clientes
                </button>
            </div>
        );
    }

    // Not found state
    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Building2 className="h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Cliente no encontrado</h2>
                <p className="text-gray-500">El cliente que buscas no existe o fue eliminado</p>
                <button
                    onClick={() => navigate('/clients')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clientes
                </button>
            </div>
        );
    }

    // Map projects to ClientProject interface
    const clientProjects: ClientProject[] = (projects || []).map((p: Project) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress,
        budget: p.budget,
        deadline: p.deadline,
    }));

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/clients')}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a Clientes
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Logo/Avatar */}
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/5 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-solaria-orange" />
                        </div>

                        {/* Info */}
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                                <StatusBadge status={client.status} />
                            </div>
                            <p className="text-gray-500">{client.commercial_name}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {client.city}, {client.state}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Cliente desde {formatDate(client.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            <Edit className="h-4 w-4" />
                            Editar
                        </button>
                        <button className="p-2 border border-gray-300 text-gray-400 rounded-lg hover:bg-gray-50 transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500">Proyectos</p>
                        <p className="text-2xl font-bold text-gray-900">{client.total_projects}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Contactos</p>
                        <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Lifetime Value</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(client.lifetime_value || 0)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Account Manager</p>
                        <p className="text-lg font-medium text-gray-900">{client.assigned_to?.name || 'Sin asignar'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        icon={FileText}
                        label="General"
                    />
                    <TabButton
                        active={activeTab === 'contacts'}
                        onClick={() => setActiveTab('contacts')}
                        icon={User}
                        label="Contactos"
                        count={contacts.length}
                    />
                    <TabButton
                        active={activeTab === 'projects'}
                        onClick={() => setActiveTab('projects')}
                        icon={FolderKanban}
                        label="Proyectos"
                        count={clientProjects.length}
                    />
                    <TabButton
                        active={activeTab === 'payments'}
                        onClick={() => setActiveTab('payments')}
                        icon={DollarSign}
                        label="Pagos"
                        count={payments.length}
                    />
                    <TabButton
                        active={activeTab === 'activity'}
                        onClick={() => setActiveTab('activity')}
                        icon={Activity}
                        label="Actividad"
                    />
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && <OverviewTab client={client} />}
                    {activeTab === 'contacts' && <ContactsTab contacts={contacts} />}
                    {activeTab === 'projects' && <ProjectsTab projects={clientProjects} />}
                    {activeTab === 'payments' && <PaymentsTab payments={payments} />}
                    {activeTab === 'activity' && <ActivityTab activities={activities} />}
                </div>
            </div>
        </div>
    );
}

export default ClientDetailPage;
