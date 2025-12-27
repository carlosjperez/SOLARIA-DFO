import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjectFullDetail } from '@hooks/useProjectDetail';
import type { ProjectDetail, Task, ProjectDocument, ProjectSprint } from '../types';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Edit,
    FileText,
    FolderKanban,
    Activity,
    Users,
    CheckCircle2,
    Circle,
    AlertCircle,
    Pause,
    MoreVertical,
    Plus,
    ExternalLink,
    Target,
    TrendingUp,
    LayoutList,
    Layers,
    Paperclip,
    Bot,
    User,
    ChevronRight,
    Play,
    Flag,
    Loader2,
    AlertTriangle,
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface TeamMember {
    id: number;
    name: string;
    role?: string;
    type?: 'human' | 'ai';
    status?: string;
    tasks_count: number;
    tasks_completed: number;
}

interface ProjectActivity {
    id: number;
    action: string;
    actor: string;
    actor_type: 'human' | 'ai' | 'system';
    timestamp: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(amount: number, currency: string = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return formatDate(dateStr);
}

function getDaysRemaining(deadline: string): number {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ProjectStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: typeof Circle }> = {
        planning: { label: 'Planificación', className: 'bg-blue-100 text-blue-700', icon: Circle },
        development: { label: 'Desarrollo', className: 'bg-yellow-100 text-yellow-700', icon: Play },
        testing: { label: 'Testing', className: 'bg-purple-100 text-purple-700', icon: Target },
        deployment: { label: 'Despliegue', className: 'bg-indigo-100 text-indigo-700', icon: TrendingUp },
        completed: { label: 'Completado', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        on_hold: { label: 'En Pausa', className: 'bg-gray-100 text-gray-700', icon: Pause },
        cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700', icon: AlertCircle },
    };

    const { label, className, icon: Icon } = config[status] || config.planning;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const config: Record<string, { label: string; className: string }> = {
        critical: { label: 'Crítica', className: 'bg-red-100 text-red-700' },
        high: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
        medium: { label: 'Media', className: 'bg-yellow-100 text-yellow-700' },
        low: { label: 'Baja', className: 'bg-gray-100 text-gray-600' },
    };

    const { label, className } = config[priority] || config.medium;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${className}`}>
            <Flag className="h-3 w-3" />
            {label}
        </span>
    );
}

function TaskStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: typeof Circle }> = {
        pending: { label: 'Pendiente', className: 'bg-gray-100 text-gray-600', icon: Circle },
        in_progress: { label: 'En Progreso', className: 'bg-blue-100 text-blue-700', icon: Play },
        completed: { label: 'Completada', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        blocked: { label: 'Bloqueada', className: 'bg-red-100 text-red-700', icon: AlertCircle },
    };

    const { label, className, icon: Icon } = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${className}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

function PhaseStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        planned: { label: 'Planificado', className: 'bg-gray-100 text-gray-600' },
        active: { label: 'Activo', className: 'bg-blue-100 text-blue-700' },
        completed: { label: 'Completado', className: 'bg-green-100 text-green-700' },
    };

    const { label, className } = config[status] || config.planned;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}

function DocumentTypeBadge({ type }: { type: string }) {
    const config: Record<string, { label: string; className: string }> = {
        spec: { label: 'Spec', className: 'bg-purple-100 text-purple-700' },
        design: { label: 'Diseño', className: 'bg-pink-100 text-pink-700' },
        contract: { label: 'Contrato', className: 'bg-blue-100 text-blue-700' },
        report: { label: 'Reporte', className: 'bg-green-100 text-green-700' },
        manual: { label: 'Manual', className: 'bg-yellow-100 text-yellow-700' },
        other: { label: 'Otro', className: 'bg-gray-100 text-gray-600' },
    };

    const { label, className } = config[type] || config.other;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}

type TabType = 'overview' | 'tasks' | 'team' | 'phases' | 'documents' | 'activity';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: typeof FileText;
    label: string;
    count?: number;
}

function TabButton({ active, onClick, icon: Icon, label, count }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                    ? 'border-solaria-orange text-solaria-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                    active ? 'bg-solaria-orange/10 text-solaria-orange' : 'bg-gray-100 text-gray-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
}

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

interface OverviewProject extends Omit<ProjectDetail, 'manager'> {
    spent?: number;
    currency?: string;
    start_date?: string;
    client: { id: number; name: string };
    manager: { id?: number; name: string; role: string };
}

function OverviewTab({ project, tasks, team, phases }: {
    project: OverviewProject;
    tasks: Task[];
    team: TeamMember[];
    phases: ProjectSprint[]
}) {
    const daysRemaining = project.deadline ? getDaysRemaining(project.deadline) : 0;
    const spent = project.spent || 0;
    const budget = project.budget || 0;
    const budgetUsedPercent = budget > 0 ? Math.round((spent / budget) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
                    <p className="text-gray-700">{project.description}</p>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Fecha de Inicio</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                            {project.start_date ? formatDate(project.start_date) : 'No definida'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Target className="h-4 w-4" />
                            <span className="text-sm">Fecha Límite</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                            {project.deadline ? formatDate(project.deadline) : 'No definida'}
                        </p>
                        {project.deadline && (
                            <p className={`text-xs mt-1 ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 14 ? 'text-orange-600' : 'text-green-600'}`}>
                                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} días de retraso` : `${daysRemaining} días restantes`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Budget */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Presupuesto</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <p className="text-sm text-gray-500">Gastado</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(spent, project.currency)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-lg font-semibold text-gray-600">{formatCurrency(budget, project.currency)}</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${
                                    budgetUsedPercent > 90 ? 'bg-red-500' : budgetUsedPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>{budgetUsedPercent}% utilizado</span>
                            <span>{formatCurrency(budget - spent, project.currency)} disponible</span>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Progreso General</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-3xl font-bold text-gray-900">{project.progress}%</span>
                            <span className="text-sm text-gray-500">completado</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="h-4 rounded-full bg-solaria-orange transition-all"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Client Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Cliente</h3>
                    <Link
                        to={`/clients/${project.client.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-solaria-orange hover:shadow-sm transition-all"
                    >
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-solaria-orange" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{project.client.name}</p>
                            <p className="text-xs text-gray-500">Ver detalles</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                </div>

                {/* Project Manager */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Project Manager</h3>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{project.manager.name}</p>
                            <p className="text-xs text-gray-500 uppercase">{project.manager.role}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Estadísticas</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tareas Totales</span>
                            <span className="font-medium text-gray-900">{tasks.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Completadas</span>
                            <span className="font-medium text-green-600">{tasks.filter(t => t.status === 'completed').length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">En Progreso</span>
                            <span className="font-medium text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Bloqueadas</span>
                            <span className="font-medium text-red-600">{tasks.filter(t => t.status === 'blocked').length}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2" />
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Equipo</span>
                            <span className="font-medium text-gray-900">{team.length} miembros</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Fases</span>
                            <span className="font-medium text-gray-900">{phases.length} fases</span>
                        </div>
                    </div>
                </div>

                {/* Project Code */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Código de Proyecto</h3>
                    <p className="font-mono text-lg font-semibold text-gray-900">{project.code}</p>
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 space-y-1">
                    <p>Creado: {formatDate(project.created_at)}</p>
                    <p>Actualizado: {formatRelativeDate(project.updated_at)}</p>
                </div>
            </div>
        </div>
    );
}

interface DisplayTask extends Task {
    assigned_agent?: {
        name: string;
        type: 'human' | 'ai';
    };
    due_date?: string;
}

function TasksTab({ tasks }: { tasks: DisplayTask[] }) {
    // Group tasks by status
    const tasksByStatus = {
        pending: tasks.filter(t => t.status === 'pending'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        completed: tasks.filter(t => t.status === 'completed'),
        blocked: tasks.filter(t => t.status === 'blocked'),
    };

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <LayoutList className="h-4 w-4" />
                        Lista
                    </button>
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Layers className="h-4 w-4" />
                        Kanban
                    </button>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                    <Plus className="h-4 w-4" />
                    Nueva Tarea
                </button>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                    <p className="font-medium text-gray-900">{task.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{task.estimated_hours}h estimadas</p>
                                </td>
                                <td className="px-4 py-4">
                                    <TaskStatusBadge status={task.status} />
                                </td>
                                <td className="px-4 py-4">
                                    <PriorityBadge priority={task.priority} />
                                </td>
                                <td className="px-4 py-4">
                                    {task.assigned_agent ? (
                                        <div className="flex items-center gap-2">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                                task.assigned_agent.type === 'ai' ? 'bg-purple-100' : 'bg-blue-100'
                                            }`}>
                                                {task.assigned_agent.type === 'ai' ? (
                                                    <Bot className="h-3.5 w-3.5 text-purple-600" />
                                                ) : (
                                                    <User className="h-3.5 w-3.5 text-blue-600" />
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-700">{task.assigned_agent.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Sin asignar</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    task.status === 'completed' ? 'bg-green-500' :
                                                    task.status === 'blocked' ? 'bg-red-500' :
                                                    'bg-solaria-orange'
                                                }`}
                                                style={{ width: `${task.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 w-8">{task.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-gray-600">
                                        {task.due_date ? formatDate(task.due_date) : (task.deadline ? formatDate(task.deadline) : '-')}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-400">{tasksByStatus.pending.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Pendientes</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{tasksByStatus.in_progress.length}</p>
                    <p className="text-xs text-blue-600 mt-1">En Progreso</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{tasksByStatus.completed.length}</p>
                    <p className="text-xs text-green-600 mt-1">Completadas</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{tasksByStatus.blocked.length}</p>
                    <p className="text-xs text-red-600 mt-1">Bloqueadas</p>
                </div>
            </div>
        </div>
    );
}

function TeamTab({ team }: { team: TeamMember[] }) {
    const humanTeam = team.filter(m => m.type === 'human');
    const aiAgents = team.filter(m => m.type === 'ai');

    return (
        <div className="space-y-8">
            {/* Human Team */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Equipo Humano ({humanTeam.length})
                    </h3>
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Plus className="h-4 w-4" />
                        Agregar Miembro
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {humanTeam.map((member) => (
                        <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                    <p className="text-sm text-gray-500">{member.role}</p>
                                    <div className="flex gap-4 mt-3 text-xs">
                                        <span className="text-gray-500">
                                            <span className="font-medium text-gray-700">{member.tasks_count}</span> asignadas
                                        </span>
                                        <span className="text-gray-500">
                                            <span className="font-medium text-green-600">{member.tasks_completed}</span> completadas
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Agents */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-600" />
                        Agentes IA ({aiAgents.length})
                    </h3>
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Plus className="h-4 w-4" />
                        Asignar Agente
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiAgents.map((agent) => (
                        <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                                        <Bot className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                        agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                    }`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                                    <p className="text-sm text-gray-500">{agent.role}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-3 text-xs">
                                        <span className="text-gray-500">
                                            <span className="font-medium text-gray-700">{agent.tasks_count}</span> asignadas
                                        </span>
                                        <span className="text-gray-500">
                                            <span className="font-medium text-green-600">{agent.tasks_completed}</span> completadas
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PhasesTab({ phases }: { phases: ProjectSprint[] }) {
    return (
        <div className="space-y-6">
            {/* Timeline View */}
            <div className="relative">
                {phases.map((phase, index) => (
                    <div key={phase.id} className="relative pb-8 last:pb-0">
                        {/* Connector Line */}
                        {index < phases.length - 1 && (
                            <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200" />
                        )}

                        <div className="flex gap-4">
                            {/* Icon */}
                            <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${
                                phase.status === 'completed' ? 'bg-green-100' :
                                phase.status === 'active' ? 'bg-blue-100' :
                                'bg-gray-100'
                            }`}>
                                {phase.status === 'completed' ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : phase.status === 'active' ? (
                                    <Play className="h-5 w-5 text-blue-600" />
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-400" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {phase.start_date ? formatDate(phase.start_date) : 'Sin fecha'} - {phase.end_date ? formatDate(phase.end_date) : 'Sin fecha'}
                                        </p>
                                    </div>
                                    <PhaseStatusBadge status={phase.status} />
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progreso</span>
                                        <span>{phase.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                phase.status === 'completed' ? 'bg-green-500' :
                                                phase.status === 'active' ? 'bg-blue-500' :
                                                'bg-gray-300'
                                            }`}
                                            style={{ width: `${phase.progress || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Tasks Count */}
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-500">
                                        <span className="font-medium text-gray-700">{phase.tasks_count || 0}</span>
                                        {' '}tareas en esta fase
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Phase Button */}
            <div className="flex justify-center">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <Plus className="h-4 w-4" />
                    Agregar Fase
                </button>
            </div>
        </div>
    );
}

function DocumentsTab({ documents }: { documents: ProjectDocument[] }) {
    return (
        <div className="space-y-4">
            {/* Actions */}
            <div className="flex justify-end">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                    <Plus className="h-4 w-4" />
                    Agregar Documento
                </button>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                                    <DocumentTypeBadge type={doc.type} />
                                </div>
                                <p className="text-sm text-gray-500">
                                    {doc.uploaded_by ? `Por ${doc.uploaded_by} · ` : ''}{formatDate(doc.created_at)}
                                </p>
                            </div>
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-solaria-orange hover:bg-solaria-orange/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State (if no documents) */}
            {documents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No hay documentos</h3>
                    <p className="text-gray-500 mb-4">Agrega documentos, especificaciones o contratos al proyecto.</p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                        <Plus className="h-4 w-4" />
                        Agregar Documento
                    </button>
                </div>
            )}
        </div>
    );
}

function ActivityTab({ activities }: { activities: ProjectActivity[] }) {
    return (
        <div className="space-y-4">
            {/* Activity Timeline */}
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            activity.actor_type === 'ai' ? 'bg-purple-100' :
                            activity.actor_type === 'human' ? 'bg-blue-100' :
                            'bg-gray-100'
                        }`}>
                            {activity.actor_type === 'ai' ? (
                                <Bot className="h-4 w-4 text-purple-600" />
                            ) : activity.actor_type === 'human' ? (
                                <User className="h-4 w-4 text-blue-600" />
                            ) : (
                                <Activity className="h-4 w-4 text-gray-500" />
                            )}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700">{activity.action}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span className="font-medium">{activity.actor}</span>
                                <span>·</span>
                                <span>{formatRelativeDate(activity.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More */}
            <div className="text-center">
                <button className="text-sm text-solaria-orange hover:text-solaria-orange-dark font-medium">
                    Cargar más actividad
                </button>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Fetch project data from API
    const projectId = parseInt(id || '0');
    const {
        project: projectData,
        tasks: tasksData,
        team: teamData,
        documents: documentsData,
        sprints: sprintsData,
        isLoading,
        isError,
        error
    } = useProjectFullDetail(projectId);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 text-solaria-orange animate-spin" />
                <p className="text-gray-500">Cargando proyecto...</p>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Error al cargar proyecto</h2>
                <p className="text-gray-500">{error?.message || 'Error desconocido'}</p>
                <button
                    onClick={() => navigate('/projects')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg hover:bg-solaria-orange-dark transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Proyectos
                </button>
            </div>
        );
    }

    // Not found state
    if (!projectData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <FolderKanban className="h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Proyecto no encontrado</h2>
                <p className="text-gray-500">El proyecto que buscas no existe o fue eliminado</p>
                <button
                    onClick={() => navigate('/projects')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg hover:bg-solaria-orange-dark transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Proyectos
                </button>
            </div>
        );
    }

    // Build project object with required fields for OverviewTab
    const project: OverviewProject = {
        ...projectData,
        spent: projectData.spent || 0,
        currency: projectData.currency || 'MXN',
        start_date: projectData.start_date,
        client: projectData.client_info || { id: 0, name: projectData.client_name || 'Sin cliente' },
        manager: projectData.manager || { name: 'Sin asignar', role: 'N/A' },
    };

    // Map tasks to DisplayTask format
    const tasks: DisplayTask[] = (tasksData || []).map(t => ({
        ...t,
        assigned_agent: t.agent_name ? { name: t.agent_name, type: 'ai' as const } : undefined,
        due_date: t.deadline,
    }));

    // Map team data
    const team: TeamMember[] = (teamData || []).map((m: { id: number; name: string; role?: string; type?: string; status?: string; tasks_assigned?: number; tasks_completed?: number }) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        type: (m.type === 'ai' ? 'ai' : 'human') as 'human' | 'ai',
        status: m.status,
        tasks_count: m.tasks_assigned || 0,
        tasks_completed: m.tasks_completed || 0,
    }));

    const phases = sprintsData || [];
    const documents = documentsData || [];

    // Mock activities until we have activity API
    const activities: ProjectActivity[] = projectData ? [
        { id: 1, action: 'Proyecto creado', actor: 'Sistema', actor_type: 'system', timestamp: projectData.created_at },
    ] : [];

    const daysRemaining = project.deadline ? getDaysRemaining(project.deadline) : 0;
    const spent = project.spent || 0;
    const budget = project.budget || 0;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/projects')}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a Proyectos
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-5">
                        {/* Project Icon */}
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/10 flex items-center justify-center">
                            <FolderKanban className="h-8 w-8 text-solaria-orange" />
                        </div>

                        {/* Project Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                                <ProjectStatusBadge status={project.status} />
                                <PriorityBadge priority={project.priority} />
                            </div>
                            <p className="text-gray-500 flex items-center gap-3">
                                <span className="font-mono text-sm">{project.code}</span>
                                <span className="text-gray-300">·</span>
                                <Link to={`/clients/${project.client.id}`} className="hover:text-solaria-orange transition-colors">
                                    {project.client.name}
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Edit className="h-4 w-4" />
                            Editar
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{project.progress}%</p>
                        <p className="text-sm text-gray-500">Progreso</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                        <p className="text-sm text-gray-500">Tareas</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-2xl font-bold ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 14 ? 'text-orange-600' : 'text-gray-900'}`}>
                            {project.deadline ? (daysRemaining < 0 ? Math.abs(daysRemaining) : daysRemaining) : '-'}
                        </p>
                        <p className="text-sm text-gray-500">{project.deadline ? (daysRemaining < 0 ? 'Días de retraso' : 'Días restantes') : 'Sin fecha'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget - spent, project.currency)}</p>
                        <p className="text-sm text-gray-500">Presupuesto disponible</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={FileText} label="General" />
                    <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={CheckCircle2} label="Tareas" count={tasks.length} />
                    <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={Users} label="Equipo" count={team.length} />
                    <TabButton active={activeTab === 'phases'} onClick={() => setActiveTab('phases')} icon={Layers} label="Fases" count={phases.length} />
                    <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={Paperclip} label="Documentos" count={documents.length} />
                    <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={Activity} label="Actividad" />
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && <OverviewTab project={project} tasks={tasks} team={team} phases={phases} />}
                    {activeTab === 'tasks' && <TasksTab tasks={tasks} />}
                    {activeTab === 'team' && <TeamTab team={team} />}
                    {activeTab === 'phases' && <PhasesTab phases={phases} />}
                    {activeTab === 'documents' && <DocumentsTab documents={documents} />}
                    {activeTab === 'activity' && <ActivityTab activities={activities} />}
                </div>
            </div>
        </div>
    );
}

export default ProjectDetailPage;
