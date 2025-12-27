import {
    FolderKanban,
    Users,
    DollarSign,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@lib/utils';

// Temporary mock data until API integration
const mockStats = {
    totalProjects: 12,
    activeProjects: 8,
    totalClients: 15,
    totalBudget: 485000,
    completedTasks: 156,
    pendingTasks: 23,
    blockedTasks: 2,
};

const mockRecentProjects = [
    { id: 1, name: 'PRILABSA Website', client: 'PRILABSA', status: 'development', progress: 65, budget: 45000 },
    { id: 2, name: 'Akademate CRM', client: 'Akademate', status: 'testing', progress: 85, budget: 120000 },
    { id: 3, name: 'CepComunicacion Portal', client: 'CEP', status: 'planning', progress: 15, budget: 35000 },
];

export function OfficeDashboardPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Resumen ejecutivo de proyectos y operaciones</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Proyectos Activos"
                    value={mockStats.activeProjects}
                    total={mockStats.totalProjects}
                    icon={FolderKanban}
                    color="blue"
                />
                <KPICard
                    title="Clientes"
                    value={mockStats.totalClients}
                    icon={Users}
                    color="green"
                />
                <KPICard
                    title="Presupuesto Total"
                    value={formatCurrency(mockStats.totalBudget)}
                    icon={DollarSign}
                    color="orange"
                />
                <KPICard
                    title="Tareas Completadas"
                    value={mockStats.completedTasks}
                    trend={12}
                    icon={TrendingUp}
                    color="purple"
                />
            </div>

            {/* Task Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TaskStatusCard
                    title="Completadas"
                    count={mockStats.completedTasks}
                    icon={CheckCircle2}
                    color="green"
                />
                <TaskStatusCard
                    title="En Progreso"
                    count={mockStats.pendingTasks}
                    icon={Clock}
                    color="blue"
                />
                <TaskStatusCard
                    title="Bloqueadas"
                    count={mockStats.blockedTasks}
                    icon={AlertCircle}
                    color="red"
                />
            </div>

            {/* Recent Projects */}
            <div className="office-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Proyectos Recientes</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                                <th className="pb-3 font-medium">Proyecto</th>
                                <th className="pb-3 font-medium">Cliente</th>
                                <th className="pb-3 font-medium">Estado</th>
                                <th className="pb-3 font-medium">Progreso</th>
                                <th className="pb-3 font-medium text-right">Presupuesto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockRecentProjects.map((project) => (
                                <tr key={project.id} className="border-b border-gray-100 last:border-0">
                                    <td className="py-4">
                                        <span className="font-medium text-gray-900">{project.name}</span>
                                    </td>
                                    <td className="py-4 text-gray-600">{project.client}</td>
                                    <td className="py-4">
                                        <StatusBadge status={project.status} />
                                    </td>
                                    <td className="py-4">
                                        <ProgressBar value={project.progress} />
                                    </td>
                                    <td className="py-4 text-right font-medium text-gray-900">
                                        {formatCurrency(project.budget)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Sub-components

interface KPICardProps {
    title: string;
    value: string | number;
    total?: number;
    trend?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'orange' | 'purple';
}

function KPICard({ title, value, total, trend, icon: Icon, color }: KPICardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-solaria-orange/10 text-solaria-orange',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <div className="office-card p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {value}
                        {total && <span className="text-sm text-gray-400 font-normal"> / {total}</span>}
                    </p>
                    {trend !== undefined && (
                        <p className="text-sm text-green-600 mt-1">+{trend}% vs mes anterior</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

interface TaskStatusCardProps {
    title: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    color: 'green' | 'blue' | 'red';
}

function TaskStatusCard({ title, count, icon: Icon, color }: TaskStatusCardProps) {
    const colorClasses = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        red: 'text-red-600',
    };

    return (
        <div className="office-card p-4 flex items-center gap-4">
            <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
            <div>
                <p className="text-2xl font-semibold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500">{title}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusLabels: Record<string, string> = {
        development: 'En Desarrollo',
        testing: 'Testing',
        completed: 'Completado',
        blocked: 'Bloqueado',
        planning: 'Planificacion',
    };

    const statusColors: Record<string, string> = {
        development: 'bg-blue-100 text-blue-800',
        testing: 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        blocked: 'bg-red-100 text-red-800',
        planning: 'bg-amber-100 text-amber-800',
    };

    return (
        <span className={`status-badge ${statusColors[status] || statusColors.planning}`}>
            {statusLabels[status] || status}
        </span>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-solaria-orange rounded-full transition-all"
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="text-sm text-gray-600 w-10">{value}%</span>
        </div>
    );
}
