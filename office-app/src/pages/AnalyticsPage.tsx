/**
 * AnalyticsPage
 * Comprehensive analytics dashboard with charts, metrics, and insights
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import { cn, formatCurrency } from '@lib/utils';
import {
    TrendingUp,
    DollarSign,
    FolderKanban,
    CheckCircle,
    Clock,
    AlertCircle,
    Target,
    Activity,
    Calendar,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import type { Project, Task } from '../types';

// Query keys
const analyticsKeys = {
    projects: ['analytics', 'projects'] as const,
    tasks: ['analytics', 'tasks'] as const,
    agents: ['analytics', 'agents'] as const,
};

// Metric Card Component
function MetricCard({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color,
    subtitle,
}: {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
    subtitle?: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-solaria-orange/10 text-solaria-orange',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                    {change !== undefined && (
                        <div className={cn(
                            'flex items-center gap-1 mt-2 text-sm',
                            changeType === 'positive' ? 'text-green-600' :
                            changeType === 'negative' ? 'text-red-600' :
                            'text-gray-500'
                        )}>
                            {changeType === 'positive' ? (
                                <ArrowUpRight className="h-4 w-4" />
                            ) : changeType === 'negative' ? (
                                <ArrowDownRight className="h-4 w-4" />
                            ) : null}
                            <span>{change > 0 ? '+' : ''}{change}% vs mes anterior</span>
                        </div>
                    )}
                </div>
                <div className={cn('p-3 rounded-lg', colorClasses[color])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

// Progress Bar Component
function ProgressBar({
    value,
    max = 100,
    color = 'orange',
    showLabel = true,
}: {
    value: number;
    max?: number;
    color?: 'orange' | 'blue' | 'green' | 'red';
    showLabel?: boolean;
}) {
    const percentage = Math.min((value / max) * 100, 100);
    const colorClasses = {
        orange: 'bg-solaria-orange',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all', colorClasses[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-sm text-gray-600 w-12 text-right">{Math.round(percentage)}%</span>
            )}
        </div>
    );
}

// Pie Chart Segment (simplified)
function PieChartSection({
    data,
}: {
    data: { label: string; value: number; color: string }[];
}) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="flex items-center gap-6">
            {/* Simplified pie representation as stacked bars */}
            <div className="w-32 h-32 rounded-full border-8 border-gray-200 relative overflow-hidden flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
            </div>

            <div className="space-y-2 flex-1">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={cn('w-3 h-3 rounded-full', item.color)} />
                        <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                        <span className="text-xs text-gray-400 w-12 text-right">
                            {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AnalyticsPage() {
    // Fetch data
    const { data: projects, isLoading: projectsLoading } = useQuery({
        queryKey: analyticsKeys.projects,
        queryFn: async () => {
            const response = await endpoints.projects.list();
            const data = response.data;
            return (Array.isArray(data) ? data : data.projects || []) as Project[];
        },
    });

    const { data: tasks, isLoading: tasksLoading } = useQuery({
        queryKey: analyticsKeys.tasks,
        queryFn: async () => {
            const response = await endpoints.tasks.list();
            const data = response.data;
            return (Array.isArray(data) ? data : data.tasks || []) as Task[];
        },
    });

    const { data: _agents, isLoading: agentsLoading } = useQuery({
        queryKey: analyticsKeys.agents,
        queryFn: async () => {
            const response = await endpoints.agents.list();
            return response.data;
        },
    });

    // Calculate metrics
    const metrics = useMemo(() => {
        if (!projects || !tasks) {
            return {
                totalProjects: 0,
                activeProjects: 0,
                completedProjects: 0,
                totalBudget: 0,
                usedBudget: 0,
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                pendingTasks: 0,
                blockedTasks: 0,
                avgProgress: 0,
                projectsByStatus: [],
                tasksByPriority: [],
                weeklyTasks: [],
            };
        }

        const activeProjects = projects.filter((p) => p.status === 'development' || p.status === 'testing');
        const completedProjects = projects.filter((p) => p.status === 'completed');
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const usedBudget = projects.reduce((sum, p) => sum + (p.budget || 0) * (p.progress || 0) / 100, 0);

        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
        const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
        const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;

        const avgProgress = projects.length > 0
            ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
            : 0;

        const projectsByStatus = [
            { label: 'En Desarrollo', value: projects.filter((p) => p.status === 'development').length, color: 'bg-blue-500' },
            { label: 'Testing', value: projects.filter((p) => p.status === 'testing').length, color: 'bg-purple-500' },
            { label: 'Completados', value: completedProjects.length, color: 'bg-green-500' },
            { label: 'Planificacion', value: projects.filter((p) => p.status === 'planning').length, color: 'bg-yellow-500' },
            { label: 'Bloqueados', value: projects.filter((p) => p.status === 'blocked' || p.status === 'on_hold').length, color: 'bg-red-500' },
        ];

        const tasksByPriority = [
            { label: 'Critico', value: tasks.filter((t) => t.priority === 'critical').length, color: 'bg-red-500' },
            { label: 'Alto', value: tasks.filter((t) => t.priority === 'high').length, color: 'bg-orange-500' },
            { label: 'Medio', value: tasks.filter((t) => t.priority === 'medium').length, color: 'bg-yellow-500' },
            { label: 'Bajo', value: tasks.filter((t) => t.priority === 'low').length, color: 'bg-gray-400' },
        ];

        // Simulated weekly tasks data
        const weeklyTasks = [
            { day: 'Lun', completed: Math.floor(Math.random() * 10) + 2, created: Math.floor(Math.random() * 8) + 1 },
            { day: 'Mar', completed: Math.floor(Math.random() * 10) + 2, created: Math.floor(Math.random() * 8) + 1 },
            { day: 'Mie', completed: Math.floor(Math.random() * 10) + 2, created: Math.floor(Math.random() * 8) + 1 },
            { day: 'Jue', completed: Math.floor(Math.random() * 10) + 2, created: Math.floor(Math.random() * 8) + 1 },
            { day: 'Vie', completed: Math.floor(Math.random() * 10) + 2, created: Math.floor(Math.random() * 8) + 1 },
        ];

        return {
            totalProjects: projects.length,
            activeProjects: activeProjects.length,
            completedProjects: completedProjects.length,
            totalBudget,
            usedBudget,
            totalTasks: tasks.length,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            blockedTasks,
            avgProgress,
            projectsByStatus,
            tasksByPriority,
            weeklyTasks,
        };
    }, [projects, tasks]);

    const isLoading = projectsLoading || tasksLoading || agentsLoading;

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 rounded-xl bg-gray-200" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 rounded-xl bg-gray-200" />
                    <div className="h-64 rounded-xl bg-gray-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-500">
                        Metricas y rendimiento de proyectos
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Ultimos 30 dias</span>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Proyectos Activos"
                    value={metrics.activeProjects}
                    change={12}
                    changeType="positive"
                    icon={FolderKanban}
                    color="blue"
                    subtitle={`${metrics.totalProjects} totales`}
                />
                <MetricCard
                    title="Presupuesto Total"
                    value={formatCurrency(metrics.totalBudget)}
                    icon={DollarSign}
                    color="green"
                    subtitle={`${formatCurrency(metrics.usedBudget)} ejecutado`}
                />
                <MetricCard
                    title="Tareas Completadas"
                    value={metrics.completedTasks}
                    change={8}
                    changeType="positive"
                    icon={CheckCircle}
                    color="orange"
                    subtitle={`${metrics.totalTasks} totales`}
                />
                <MetricCard
                    title="Eficiencia"
                    value={`${metrics.avgProgress}%`}
                    change={-3}
                    changeType="negative"
                    icon={Target}
                    color="purple"
                    subtitle="Promedio de progreso"
                />
            </div>

            {/* Task Status Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.completedTasks}</p>
                        <p className="text-sm text-gray-600">Completadas</p>
                    </div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.inProgressTasks}</p>
                        <p className="text-sm text-gray-600">En Progreso</p>
                    </div>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-center gap-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.pendingTasks}</p>
                        <p className="text-sm text-gray-600">Pendientes</p>
                    </div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{metrics.blockedTasks}</p>
                        <p className="text-sm text-gray-600">Bloqueadas</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projects by Status */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="h-5 w-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Proyectos por Estado</h2>
                    </div>
                    <PieChartSection data={metrics.projectsByStatus} />
                </div>

                {/* Tasks by Priority */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Tareas por Prioridad</h2>
                    </div>
                    <PieChartSection data={metrics.tasksByPriority} />
                </div>
            </div>

            {/* Weekly Activity */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Actividad Semanal</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500" />
                            <span className="text-gray-600">Completadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span className="text-gray-600">Creadas</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-between gap-4 h-48 px-4">
                    {metrics.weeklyTasks.map((day, i) => {
                        const maxValue = Math.max(...metrics.weeklyTasks.map((d) => Math.max(d.completed, d.created)));
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex gap-1 justify-center h-32">
                                    <div
                                        className="w-4 bg-green-500 rounded-t transition-all"
                                        style={{ height: `${(day.completed / maxValue) * 100}%` }}
                                        title={`Completadas: ${day.completed}`}
                                    />
                                    <div
                                        className="w-4 bg-blue-500 rounded-t transition-all"
                                        style={{ height: `${(day.created / maxValue) * 100}%` }}
                                        title={`Creadas: ${day.created}`}
                                    />
                                </div>
                                <span className="text-xs text-gray-500">{day.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Budget Progress */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Ejecucion Presupuestaria</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Presupuestado</span>
                        <span className="font-medium text-gray-900">{formatCurrency(metrics.totalBudget)}</span>
                    </div>
                    <ProgressBar value={metrics.usedBudget} max={metrics.totalBudget} color="green" />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Ejecutado: {formatCurrency(metrics.usedBudget)}</span>
                        <span className="text-gray-500">Disponible: {formatCurrency(metrics.totalBudget - metrics.usedBudget)}</span>
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-green-600 mb-3">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-medium">Rendimiento Alto</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        La tasa de completitud de tareas aumento un 12% respecto al mes anterior.
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-yellow-600 mb-3">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Atencion Requerida</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {metrics.blockedTasks} tareas bloqueadas requieren revision inmediata.
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                        <Target className="h-5 w-5" />
                        <span className="font-medium">Objetivo Semanal</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {metrics.completedTasks} tareas completadas de {metrics.totalTasks} totales ({Math.round((metrics.completedTasks / metrics.totalTasks) * 100) || 0}%).
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;
