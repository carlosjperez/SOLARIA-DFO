import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAgentFullDetail } from '@hooks/useAgentDetail';
import type { Task } from '../types';
import {
    ArrowLeft,
    Bot,
    User,
    Edit,
    MoreVertical,
    Activity,
    CheckCircle2,
    Circle,
    Clock,
    FolderKanban,
    TrendingUp,
    Award,
    Zap,
    Target,
    BarChart3,
    Play,
    AlertCircle,
    Pause,
    Mail,
    Phone,
    Building2,
    Star,
    MessageSquare,
    FileText,
    Settings,
    Power,
    RefreshCw,
    Loader2,
    AlertTriangle
} from 'lucide-react';

// ============================================
// Connected to DFO API
// ============================================

// Display interfaces for components
interface HumanAgent {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    role: string;
    department?: string;
    type: 'human';
    status: string;
    avatar_url?: string;
    hire_date?: string;
    timezone?: string;
    bio?: string;
    skills?: string[];
    metrics?: {
        tasks_completed: number;
        tasks_in_progress: number;
        tasks_total: number;
        avg_completion_time: number;
        on_time_rate?: number;
        quality_score?: number;
        projects_count?: number;
    };
}

interface AIAgent {
    id: number;
    name: string;
    role: string;
    type: 'ai';
    status: string;
    model?: string;
    version?: string;
    description?: string;
    capabilities?: string[];
    metrics?: {
        tasks_completed: number;
        tasks_in_progress: number;
        tasks_total: number;
        avg_completion_time: number;
        success_rate?: number;
        uptime?: number;
        projects_count?: number;
        tokens_used?: number;
        cost_mtd?: number;
    };
    config?: {
        max_tokens?: number;
        temperature?: number;
        auto_retry?: boolean;
        parallel_tasks?: number;
    };
}

interface AgentTask {
    id: number;
    title: string;
    project_id: number;
    project_name?: string;
    status: string;
    priority: string;
    progress: number;
    deadline?: string;
    estimated_hours?: number;
}

interface AgentProject {
    id: number;
    name: string;
    code?: string;
    status: string;
    role?: string;
    tasks_count: number;
    tasks_completed: number;
}

interface AgentActivity {
    id: number;
    action: string;
    timestamp: string;
    type: string;
}

interface PerformanceHistory {
    month: string;
    tasks: number;
    onTime: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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

function formatNumber(num: number): string {
    return new Intl.NumberFormat('es-MX').format(num);
}

// ============================================
// SUB-COMPONENTS
// ============================================

function AgentStatusBadge({ status, type }: { status: string; type: 'human' | 'ai' }) {
    const config: Record<string, { label: string; className: string }> = {
        active: { label: type === 'ai' ? 'Activo' : 'Disponible', className: 'bg-green-100 text-green-700' },
        busy: { label: 'Ocupado', className: 'bg-yellow-100 text-yellow-700' },
        idle: { label: 'Inactivo', className: 'bg-gray-100 text-gray-600' },
        offline: { label: 'Offline', className: 'bg-red-100 text-red-700' },
        vacation: { label: 'Vacaciones', className: 'bg-blue-100 text-blue-700' },
        maintenance: { label: 'Mantenimiento', className: 'bg-purple-100 text-purple-700' },
    };

    const { label, className } = config[status] || config.idle;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
            <span className={`h-2 w-2 rounded-full ${
                status === 'active' ? 'bg-green-500' :
                status === 'busy' ? 'bg-yellow-500' :
                status === 'offline' ? 'bg-red-500' :
                'bg-gray-400'
            }`} />
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

function ProjectStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        planning: { label: 'Planificación', className: 'bg-blue-100 text-blue-700' },
        development: { label: 'Desarrollo', className: 'bg-yellow-100 text-yellow-700' },
        testing: { label: 'Testing', className: 'bg-purple-100 text-purple-700' },
        completed: { label: 'Completado', className: 'bg-green-100 text-green-700' },
    };

    const { label, className } = config[status] || config.planning;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const config: Record<string, { label: string; className: string }> = {
        critical: { label: 'Crítica', className: 'text-red-600' },
        high: { label: 'Alta', className: 'text-orange-600' },
        medium: { label: 'Media', className: 'text-yellow-600' },
        low: { label: 'Baja', className: 'text-gray-500' },
    };

    const { label, className } = config[priority] || config.medium;

    return <span className={`text-xs font-medium ${className}`}>{label}</span>;
}

type TabType = 'overview' | 'tasks' | 'projects' | 'performance' | 'activity' | 'config';

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

function HumanOverviewTab({ agent }: { agent: HumanAgent }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Biografía</h3>
                    <p className="text-gray-700">{agent.bio || 'Sin información disponible'}</p>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                {agent.email ? (
                                    <a href={`mailto:${agent.email}`} className="text-sm text-gray-900 hover:text-solaria-orange">
                                        {agent.email}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Teléfono</p>
                                {agent.phone ? (
                                    <a href={`tel:${agent.phone}`} className="text-sm text-gray-900 hover:text-solaria-orange">
                                        {agent.phone}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Building2 className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Departamento</p>
                                <p className="text-sm text-gray-900">{agent.department || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Zona Horaria</p>
                                <p className="text-sm text-gray-900">{agent.timezone || 'America/Mexico_City'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Habilidades</h3>
                    <div className="flex flex-wrap gap-2">
                        {(agent.skills || []).length > 0 ? (
                            (agent.skills || []).map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                                >
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">Sin habilidades registradas</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar - Quick Stats */}
            <div className="space-y-6">
                {/* Performance Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Rendimiento</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Tareas Completadas</span>
                                <span className="font-medium text-gray-900">{agent.metrics?.tasks_completed || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-green-500"
                                    style={{ width: `${agent.metrics?.tasks_total ? ((agent.metrics.tasks_completed || 0) / agent.metrics.tasks_total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tasa Puntualidad</span>
                            <span className="text-sm font-medium text-green-600">{agent.metrics?.on_time_rate || 0}%</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tiempo Promedio</span>
                            <span className="text-sm font-medium text-gray-900">{agent.metrics?.avg_completion_time || 0} días</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Calidad</span>
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium text-gray-900">{agent.metrics?.quality_score || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Información</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de Ingreso</span>
                            <span className="text-gray-900">{agent.hire_date ? formatDate(agent.hire_date) : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Proyectos Activos</span>
                            <span className="text-gray-900">{agent.metrics?.projects_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AIOverviewTab({ agent }: { agent: AIAgent }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
                    <p className="text-gray-700">{agent.description || 'Sin descripción disponible'}</p>
                </div>

                {/* Model Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                            <Bot className="h-4 w-4" />
                            <span className="text-sm font-medium">Modelo</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{agent.model || 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-medium">Versión</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{agent.version || 'N/A'}</p>
                    </div>
                </div>

                {/* Capabilities */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Capacidades</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(agent.capabilities || []).length > 0 ? (
                            (agent.capabilities || []).map((capability, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-700">{capability}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">Sin capacidades registradas</span>
                        )}
                    </div>
                </div>

                {/* Usage Stats */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Uso del Mes</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(agent.metrics?.tokens_used || 0)}</p>
                            <p className="text-xs text-gray-500 mt-1">Tokens</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">${agent.metrics?.cost_mtd || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Costo USD</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{agent.metrics?.uptime || 0}%</p>
                            <p className="text-xs text-gray-500 mt-1">Uptime</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Performance */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Rendimiento</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Tareas Completadas</span>
                                <span className="font-medium text-gray-900">{agent.metrics?.tasks_completed || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-green-500"
                                    style={{ width: `${agent.metrics?.tasks_total ? ((agent.metrics.tasks_completed || 0) / agent.metrics.tasks_total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tasa de Éxito</span>
                            <span className="text-sm font-medium text-green-600">{agent.metrics?.success_rate || 0}%</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tiempo Promedio</span>
                            <span className="text-sm font-medium text-gray-900">{agent.metrics?.avg_completion_time || 0} días</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Proyectos Activos</span>
                            <span className="text-sm font-medium text-gray-900">{agent.metrics?.projects_count || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Acciones Rápidas</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                            <RefreshCw className="h-4 w-4" />
                            Reiniciar Agente
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                            <Pause className="h-4 w-4" />
                            Pausar Agente
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                            <Settings className="h-4 w-4" />
                            Configurar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TasksTab({ tasks }: { tasks: AgentTask[] }) {
    const tasksByStatus = {
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        pending: tasks.filter(t => t.status === 'pending'),
        completed: tasks.filter(t => t.status === 'completed'),
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{tasksByStatus.in_progress.length}</p>
                    <p className="text-xs text-blue-600 mt-1">En Progreso</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-400">{tasksByStatus.pending.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Pendientes</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{tasksByStatus.completed.length}</p>
                    <p className="text-xs text-green-600 mt-1">Completadas</p>
                </div>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarea</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
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
                                    <Link to={`/projects/${task.project_id}`} className="text-sm text-solaria-orange hover:underline">
                                        {task.project_name || `Proyecto #${task.project_id}`}
                                    </Link>
                                </td>
                                <td className="px-4 py-4">
                                    <TaskStatusBadge status={task.status} />
                                </td>
                                <td className="px-4 py-4">
                                    <PriorityBadge priority={task.priority} />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-solaria-orange"
                                                style={{ width: `${task.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{task.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-gray-600">{task.deadline ? formatDate(task.deadline) : '-'}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ProjectsTab({ projects }: { projects: AgentProject[] }) {
    return (
        <div className="space-y-4">
            {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/10 flex items-center justify-center">
                                <FolderKanban className="h-6 w-6 text-solaria-orange" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Link to={`/projects/${project.id}`} className="font-semibold text-gray-900 hover:text-solaria-orange">
                                        {project.name}
                                    </Link>
                                    <ProjectStatusBadge status={project.status} />
                                </div>
                                <p className="text-sm text-gray-500 font-mono">{project.code}</p>
                                <p className="text-sm text-gray-600 mt-1">Rol: {project.role}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-green-600">{project.tasks_completed}</span>
                                <span className="text-gray-400"> / </span>
                                <span className="font-medium text-gray-700">{project.tasks_count}</span>
                                {' '}tareas
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PerformanceTab({ metrics, history }: { metrics: HumanAgent['metrics']; history: PerformanceHistory[] }) {
    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Completadas</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{metrics?.tasks_completed || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">de {metrics?.tasks_total || 0} tareas</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Target className="h-5 w-5" />
                        <span className="text-sm font-medium">Puntualidad</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{metrics?.on_time_rate || 0}%</p>
                    <p className="text-xs text-gray-500 mt-1">entregas a tiempo</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <Clock className="h-5 w-5" />
                        <span className="text-sm font-medium">Tiempo Promedio</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{metrics?.avg_completion_time || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">días por tarea</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <Star className="h-5 w-5" />
                        <span className="text-sm font-medium">Calidad</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{metrics?.quality_score || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">de 5.0 estrellas</p>
                </div>
            </div>

            {/* Performance Chart (Placeholder) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Rendimiento</h3>
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                    {history.map((month) => (
                        <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col gap-1">
                                <div
                                    className="w-full bg-solaria-orange/20 rounded-t"
                                    style={{ height: `${(month.tasks / 12) * 180}px` }}
                                />
                                <div
                                    className="w-full bg-green-500 rounded-b"
                                    style={{ height: `${(month.onTime / 12) * 180}px`, marginTop: '-4px' }}
                                />
                            </div>
                            <span className="text-xs text-gray-500">{month.month}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded bg-solaria-orange/20" />
                        <span className="text-gray-500">Tareas Totales</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded bg-green-500" />
                        <span className="text-gray-500">A Tiempo</span>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Logros
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Zap, label: 'Rayo Veloz', desc: '10 tareas en 1 semana', color: 'yellow' },
                        { icon: Target, label: 'Puntualidad 100%', desc: 'Mes sin retrasos', color: 'green' },
                        { icon: Star, label: 'Calidad Premium', desc: 'Calificación 5.0', color: 'purple' },
                        { icon: TrendingUp, label: 'En Racha', desc: '5 tareas consecutivas', color: 'blue' },
                    ].map((achievement) => (
                        <div key={achievement.label} className={`p-4 rounded-lg bg-${achievement.color}-50 border border-${achievement.color}-100`}>
                            <achievement.icon className={`h-8 w-8 text-${achievement.color}-500 mb-2`} />
                            <p className="font-medium text-gray-900">{achievement.label}</p>
                            <p className="text-xs text-gray-500">{achievement.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ActivityTab({ activities }: { activities: AgentActivity[] }) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'progress': return TrendingUp;
            case 'commit': return FileText;
            case 'comment': return MessageSquare;
            case 'completed': return CheckCircle2;
            case 'assignment': return FolderKanban;
            default: return Activity;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'progress': return 'bg-blue-100 text-blue-600';
            case 'commit': return 'bg-purple-100 text-purple-600';
            case 'comment': return 'bg-yellow-100 text-yellow-600';
            case 'completed': return 'bg-green-100 text-green-600';
            case 'assignment': return 'bg-orange-100 text-orange-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-4">
            {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);

                return (
                    <div key={activity.id} className="flex gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700">{activity.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatRelativeDate(activity.timestamp)}</p>
                        </div>
                    </div>
                );
            })}

            {/* Load More */}
            <div className="text-center">
                <button className="text-sm text-solaria-orange hover:text-solaria-orange-dark font-medium">
                    Cargar más actividad
                </button>
            </div>
        </div>
    );
}

function ConfigTab({ config }: { config: AIAgent['config'] }) {
    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Los cambios de configuración afectan el comportamiento del agente. Modifica con precaución.
                </p>
            </div>

            {/* Configuration Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                    <input
                        type="number"
                        defaultValue={config?.max_tokens || 8192}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                    />
                    <p className="text-xs text-gray-500 mt-1">Máximo de tokens por respuesta</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue={config?.temperature || 0.7}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Preciso (0)</span>
                        <span>{config?.temperature || 0.7}</span>
                        <span>Creativo (1)</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tareas Paralelas</label>
                    <select
                        defaultValue={config?.parallel_tasks || 3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                    >
                        <option value="1">1 tarea</option>
                        <option value="2">2 tareas</option>
                        <option value="3">3 tareas</option>
                        <option value="5">5 tareas</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Auto-Retry</p>
                        <p className="text-sm text-gray-500">Reintentar automáticamente en caso de error</p>
                    </div>
                    <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config?.auto_retry ? 'bg-solaria-orange' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                config?.auto_retry ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button className="px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Zona de Peligro
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Desactivar Agente</p>
                            <p className="text-sm text-gray-500">El agente dejará de procesar tareas</p>
                        </div>
                        <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                            <Power className="h-4 w-4 inline mr-2" />
                            Desactivar
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Resetear Configuración</p>
                            <p className="text-sm text-gray-500">Volver a valores por defecto</p>
                        </div>
                        <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                            <RefreshCw className="h-4 w-4 inline mr-2" />
                            Resetear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AgentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Fetch agent data from API
    const agentId = parseInt(id || '0');
    const {
        agent: agentData,
        tasks: tasksData,
        projects: projectsData,
        performance: performanceData,
        isLoading,
        isError,
        error
    } = useAgentFullDetail(agentId);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 text-solaria-orange animate-spin" />
                <p className="text-gray-500">Cargando agente...</p>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Error al cargar agente</h2>
                <p className="text-gray-500">{error?.message || 'Error desconocido'}</p>
                <button
                    onClick={() => navigate('/agents')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg hover:bg-solaria-orange-dark transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Equipo
                </button>
            </div>
        );
    }

    // Not found state
    if (!agentData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Bot className="h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Agente no encontrado</h2>
                <p className="text-gray-500">El agente que buscas no existe o fue eliminado</p>
                <button
                    onClick={() => navigate('/agents')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg hover:bg-solaria-orange-dark transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Equipo
                </button>
            </div>
        );
    }

    // Determine agent type
    const isAI = agentData.type === 'ai';

    // Build human agent object
    const humanAgent: HumanAgent = {
        id: agentData.id,
        name: agentData.name,
        email: agentData.email,
        phone: agentData.phone,
        role: agentData.role || 'Sin rol',
        department: 'Engineering',
        type: 'human',
        status: agentData.status,
        avatar_url: agentData.avatar_url,
        bio: agentData.bio,
        skills: agentData.skills || [],
        metrics: {
            tasks_completed: agentData.metrics?.tasks_completed || agentData.tasks_completed || 0,
            tasks_in_progress: agentData.metrics?.tasks_in_progress || 0,
            tasks_total: agentData.metrics?.tasks_total || 0,
            avg_completion_time: agentData.metrics?.avg_completion_time || 0,
            on_time_rate: agentData.metrics?.on_time_rate || 0,
            quality_score: agentData.metrics?.quality_score || 0,
            projects_count: agentData.metrics?.projects_count || agentData.projects?.length || 0,
        },
    };

    // Build AI agent object
    const aiAgent: AIAgent = {
        id: agentData.id,
        name: agentData.name,
        role: agentData.role || 'Sin rol',
        type: 'ai',
        status: agentData.status,
        model: agentData.model || 'Claude 3.5 Sonnet',
        version: '2024.12',
        description: agentData.bio || agentData.description,
        capabilities: agentData.capabilities || [],
        metrics: {
            tasks_completed: agentData.metrics?.tasks_completed || agentData.tasks_completed || 0,
            tasks_in_progress: agentData.metrics?.tasks_in_progress || 0,
            tasks_total: agentData.metrics?.tasks_total || 0,
            avg_completion_time: agentData.metrics?.avg_completion_time || 0,
            success_rate: agentData.metrics?.success_rate || 98,
            uptime: agentData.metrics?.uptime || 99.9,
            projects_count: agentData.metrics?.projects_count || agentData.projects?.length || 0,
            tokens_used: agentData.metrics?.tokens_used || 0,
            cost_mtd: agentData.metrics?.cost_mtd || 0,
        },
        config: agentData.config as AIAgent['config'] || {
            max_tokens: 8192,
            temperature: 0.7,
            auto_retry: true,
            parallel_tasks: 3,
        },
    };

    // Select appropriate agent based on type
    const agent = isAI ? aiAgent : humanAgent;

    // Map tasks to AgentTask format
    const tasks: AgentTask[] = (tasksData || []).map((t: Task) => ({
        id: t.id,
        title: t.title,
        project_id: t.project_id,
        project_name: t.project_name,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        deadline: t.deadline,
        estimated_hours: t.estimated_hours,
    }));

    // Map projects to AgentProject format
    const projects: AgentProject[] = (projectsData || []).map((p: { id: number; name: string; code?: string; status?: string; role?: string; tasks_count?: number; tasks_completed?: number }) => ({
        id: p.id,
        name: p.name,
        code: p.code || `PROJ-${p.id}`,
        status: p.status || 'development',
        role: p.role || 'Developer',
        tasks_count: p.tasks_count || 0,
        tasks_completed: p.tasks_completed || 0,
    }));

    // Build activity from performance data or create placeholder
    const activities: AgentActivity[] = tasks.slice(0, 5).map((t, idx) => ({
        id: idx + 1,
        action: t.status === 'completed'
            ? `Tarea completada: "${t.title}"`
            : t.status === 'in_progress'
                ? `Trabajando en: "${t.title}"`
                : `Tarea pendiente: "${t.title}"`,
        timestamp: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
        type: t.status === 'completed' ? 'completed' : t.status === 'in_progress' ? 'progress' : 'assignment',
    }));

    // Build performance history - map from API format or use placeholder
    const performanceHistory: PerformanceHistory[] = performanceData?.history
        ? performanceData.history.map((h: { date?: string; tasks_completed?: number; hours_worked?: number }) => ({
            month: h.date ? new Date(h.date).toLocaleDateString('es-MX', { month: 'short' }) : 'N/A',
            tasks: h.tasks_completed || 0,
            onTime: Math.round((h.tasks_completed || 0) * 0.9), // Estimate 90% on-time rate
        }))
        : [
            { month: 'Jul', tasks: 8, onTime: 7 },
            { month: 'Ago', tasks: 10, onTime: 10 },
            { month: 'Sep', tasks: 7, onTime: 6 },
            { month: 'Oct', tasks: 9, onTime: 9 },
            { month: 'Nov', tasks: 8, onTime: 8 },
            { month: 'Dic', tasks: 5, onTime: 4 },
        ];

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/agents')}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a Equipo
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className={`h-20 w-20 rounded-2xl flex items-center justify-center ${
                                isAI
                                    ? 'bg-gradient-to-br from-purple-100 to-purple-50'
                                    : 'bg-gradient-to-br from-blue-100 to-blue-50'
                            }`}>
                                {isAI ? (
                                    <Bot className="h-10 w-10 text-purple-600" />
                                ) : (
                                    <User className="h-10 w-10 text-blue-600" />
                                )}
                            </div>
                            <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${
                                agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                        </div>

                        {/* Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                                <AgentStatusBadge status={agent.status} type={agent.type} />
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    isAI ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {isAI ? 'Agente IA' : 'Humano'}
                                </span>
                            </div>
                            <p className="text-gray-500">{agent.role}</p>
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
                        <p className="text-2xl font-bold text-green-600">{agent.metrics?.tasks_completed || 0}</p>
                        <p className="text-sm text-gray-500">Completadas</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{agent.metrics?.tasks_in_progress || 0}</p>
                        <p className="text-sm text-gray-500">En Progreso</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{agent.metrics?.projects_count || 0}</p>
                        <p className="text-sm text-gray-500">Proyectos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            {isAI
                                ? `${(agent as AIAgent).metrics?.success_rate || 0}%`
                                : `${(agent as HumanAgent).metrics?.on_time_rate || 0}%`
                            }
                        </p>
                        <p className="text-sm text-gray-500">{isAI ? 'Éxito' : 'Puntualidad'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={FileText} label="General" />
                    <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={CheckCircle2} label="Tareas" count={tasks.length} />
                    <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={FolderKanban} label="Proyectos" count={projects.length} />
                    <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={BarChart3} label="Rendimiento" />
                    <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={Activity} label="Actividad" />
                    {isAI && (
                        <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={Settings} label="Configuración" />
                    )}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        isAI
                            ? <AIOverviewTab agent={agent as AIAgent} />
                            : <HumanOverviewTab agent={agent as HumanAgent} />
                    )}
                    {activeTab === 'tasks' && <TasksTab tasks={tasks} />}
                    {activeTab === 'projects' && <ProjectsTab projects={projects} />}
                    {activeTab === 'performance' && <PerformanceTab metrics={agent.metrics} history={performanceHistory} />}
                    {activeTab === 'activity' && <ActivityTab activities={activities} />}
                    {activeTab === 'config' && isAI && <ConfigTab config={(agent as AIAgent).config} />}
                </div>
            </div>
        </div>
    );
}

export default AgentDetailPage;
