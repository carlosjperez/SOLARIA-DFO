/**
 * MyDashboardPage
 * Personal dashboard for logged-in agents/team members
 * Shows their assigned tasks, performance metrics, and activity
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '@lib/api';
import { useAuth } from '@hooks/useAuth';
import { cn } from '@lib/utils';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    Calendar,
    Target,
    Activity,
    Play,
    Pause,
    ArrowRight,
    ListTodo,
    CheckSquare,
    Square,
    User,
} from 'lucide-react';
import type { Task } from '../types';

// Query keys
const myDashboardKeys = {
    tasks: ['my-tasks'] as const,
    activity: ['my-activity'] as const,
    stats: ['my-stats'] as const,
};

// Hook to fetch current user's tasks
function useMyTasks() {
    const { user } = useAuth();

    return useQuery({
        queryKey: myDashboardKeys.tasks,
        queryFn: async () => {
            const response = await endpoints.tasks.list();
            const data = response.data;
            const tasks = Array.isArray(data) ? data : data.tasks || [];

            // Filter tasks assigned to current user (agent_id matches user's agent)
            // For now, show all tasks since we don't have user-agent mapping
            return tasks as Task[];
        },
        staleTime: 30000,
        enabled: !!user,
    });
}

// Task priority configuration
const PRIORITY_CONFIG = {
    critical: { label: 'Critico', color: 'text-red-600', bgColor: 'bg-red-100' },
    high: { label: 'Alto', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    medium: { label: 'Medio', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    low: { label: 'Bajo', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

// Task status configuration
const STATUS_CONFIG = {
    pending: { label: 'Pendiente', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Square },
    in_progress: { label: 'En Progreso', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Play },
    completed: { label: 'Completada', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckSquare },
    blocked: { label: 'Bloqueada', color: 'text-red-600', bgColor: 'bg-red-100', icon: Pause },
};

// Stat Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
}: {
    title: string;
    value: number | string;
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
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={cn('p-3 rounded-lg', colorClasses[color])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

// Task Item Component
function TaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
    const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
    const StatusIcon = statusConfig.icon;

    const daysUntilDue = task.deadline
        ? Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div
            onClick={onClick}
            className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer transition-all hover:border-solaria-orange/30 hover:shadow-sm"
        >
            <div className={cn('mt-0.5 rounded-full p-1.5', statusConfig.bgColor)}>
                <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityConfig.bgColor, priorityConfig.color)}>
                        {priorityConfig.label}
                    </span>
                </div>

                {task.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {task.progress !== undefined && (
                        <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {task.progress}%
                        </span>
                    )}
                    {daysUntilDue !== null && (
                        <span className={cn('flex items-center gap-1', daysUntilDue < 0 ? 'text-red-500' : daysUntilDue <= 3 ? 'text-orange-500' : '')}>
                            <Calendar className="h-3 w-3" />
                            {daysUntilDue < 0
                                ? `${Math.abs(daysUntilDue)} dias vencido`
                                : daysUntilDue === 0
                                ? 'Hoy'
                                : `${daysUntilDue} dias`}
                        </span>
                    )}
                    {task.estimated_hours && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_hours}h
                        </span>
                    )}
                </div>
            </div>

            <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}

// Progress Ring Component
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#f6921d"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{progress}%</span>
            </div>
        </div>
    );
}

export function MyDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: tasks, isLoading } = useMyTasks();

    // Calculate stats
    const stats = useMemo(() => {
        if (!tasks) return { total: 0, pending: 0, inProgress: 0, completed: 0, blocked: 0, overdue: 0, efficiency: 0 };

        const now = Date.now();
        const total = tasks.length;
        const pending = tasks.filter((t) => t.status === 'pending').length;
        const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const blocked = tasks.filter((t) => t.status === 'blocked').length;
        const overdue = tasks.filter((t) => t.deadline && new Date(t.deadline).getTime() < now && t.status !== 'completed').length;
        const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, pending, inProgress, completed, blocked, overdue, efficiency };
    }, [tasks]);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        if (!tasks) return { inProgress: [], pending: [], completed: [], blocked: [] };

        return {
            inProgress: tasks.filter((t) => t.status === 'in_progress').slice(0, 5),
            pending: tasks.filter((t) => t.status === 'pending').slice(0, 5),
            completed: tasks.filter((t) => t.status === 'completed').slice(0, 3),
            blocked: tasks.filter((t) => t.status === 'blocked'),
        };
    }, [tasks]);

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-64 rounded bg-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 rounded-xl bg-gray-200" />
                    ))}
                </div>
                <div className="h-64 rounded-xl bg-gray-200" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-solaria-orange/10">
                        <User className="h-7 w-7 text-solaria-orange" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Hola, {user?.name || 'Agente'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Aqui tienes tu resumen de actividad
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ProgressRing progress={stats.efficiency} />
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Eficiencia</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {stats.completed}/{stats.total} tareas
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="En Progreso"
                    value={stats.inProgress}
                    icon={Play}
                    color="blue"
                />
                <StatCard
                    title="Pendientes"
                    value={stats.pending}
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="Completadas"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Bloqueadas"
                    value={stats.blocked}
                    icon={AlertCircle}
                    color="red"
                    subtitle={stats.overdue > 0 ? `${stats.overdue} vencidas` : undefined}
                />
            </div>

            {/* Blocked Tasks Alert */}
            {tasksByStatus.blocked.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Tareas Bloqueadas</span>
                    </div>
                    <div className="space-y-2">
                        {tasksByStatus.blocked.map((task) => (
                            <div key={task.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{task.title}</span>
                                <button
                                    onClick={() => navigate(`/projects`)}
                                    className="text-red-600 hover:underline"
                                >
                                    Ver detalles
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* In Progress Tasks */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Play className="h-5 w-5 text-blue-600" />
                            En Progreso
                        </h2>
                        <span className="text-sm text-gray-500">{stats.inProgress} tareas</span>
                    </div>
                    <div className="space-y-3">
                        {tasksByStatus.inProgress.length > 0 ? (
                            tasksByStatus.inProgress.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onClick={() => navigate('/projects')}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ListTodo className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                <p>No hay tareas en progreso</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Tasks */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            Pendientes
                        </h2>
                        <span className="text-sm text-gray-500">{stats.pending} tareas</span>
                    </div>
                    <div className="space-y-3">
                        {tasksByStatus.pending.length > 0 ? (
                            tasksByStatus.pending.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onClick={() => navigate('/projects')}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                <p>No hay tareas pendientes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Completions */}
            {tasksByStatus.completed.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Completadas Recientemente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {tasksByStatus.completed.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 rounded-lg bg-green-50 p-3"
                            >
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700 truncate">{task.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Activity Chart Placeholder */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Actividad Semanal
                </h2>
                <div className="flex items-center justify-between h-32">
                    {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => {
                        const height = Math.random() * 80 + 20;
                        return (
                            <div key={day} className="flex flex-col items-center gap-2">
                                <div
                                    className="w-8 rounded-t bg-solaria-orange/80 transition-all hover:bg-solaria-orange"
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-xs text-gray-500">{day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    onClick={() => navigate('/projects')}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-solaria-orange/30 hover:shadow-sm transition-all"
                >
                    <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">Ver Proyectos</p>
                    <p className="text-sm text-gray-500">Estado general</p>
                </button>
                <button
                    onClick={() => navigate('/agents')}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-solaria-orange/30 hover:shadow-sm transition-all"
                >
                    <Activity className="h-6 w-6 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-900">Equipo</p>
                    <p className="text-sm text-gray-500">Ver agentes</p>
                </button>
                <button
                    onClick={() => navigate('/clients')}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-solaria-orange/30 hover:shadow-sm transition-all"
                >
                    <Target className="h-6 w-6 text-green-600 mb-2" />
                    <p className="font-medium text-gray-900">Clientes</p>
                    <p className="text-sm text-gray-500">Gestion CRM</p>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-solaria-orange/30 hover:shadow-sm transition-all"
                >
                    <Calendar className="h-6 w-6 text-orange-600 mb-2" />
                    <p className="font-medium text-gray-900">Dashboard</p>
                    <p className="text-sm text-gray-500">Vista ejecutiva</p>
                </button>
            </div>
        </div>
    );
}

export default MyDashboardPage;
