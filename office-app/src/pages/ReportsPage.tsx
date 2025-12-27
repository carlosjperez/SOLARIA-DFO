/**
 * ReportsPage
 * Generate and download various reports
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import { cn, formatCurrency } from '@lib/utils';
import {
    FileText,
    Download,
    Calendar,
    Filter,
    FolderKanban,
    Users,
    DollarSign,
    CheckCircle,
    BarChart3,
    FileSpreadsheet,
    FileJson,
    Printer,
    Eye,
} from 'lucide-react';
import type { Project } from '../types';

// Report types
const REPORT_TYPES = [
    {
        id: 'projects-summary',
        name: 'Resumen de Proyectos',
        description: 'Estado general de todos los proyectos activos',
        icon: FolderKanban,
        color: 'blue',
    },
    {
        id: 'financial',
        name: 'Reporte Financiero',
        description: 'Presupuestos, gastos y proyecciones',
        icon: DollarSign,
        color: 'green',
    },
    {
        id: 'tasks',
        name: 'Reporte de Tareas',
        description: 'Tareas completadas, pendientes y bloqueadas',
        icon: CheckCircle,
        color: 'orange',
    },
    {
        id: 'team',
        name: 'Reporte de Equipo',
        description: 'Rendimiento y carga de trabajo por agente',
        icon: Users,
        color: 'purple',
    },
    {
        id: 'timeline',
        name: 'Timeline de Proyectos',
        description: 'Cronograma y deadlines de proyectos',
        icon: Calendar,
        color: 'red',
    },
    {
        id: 'kpis',
        name: 'KPIs Ejecutivos',
        description: 'Indicadores clave de rendimiento',
        icon: BarChart3,
        color: 'indigo',
    },
];

// Export formats
const EXPORT_FORMATS = [
    { id: 'pdf', name: 'PDF', icon: FileText },
    { id: 'excel', name: 'Excel', icon: FileSpreadsheet },
    { id: 'json', name: 'JSON', icon: FileJson },
];

// Recent reports (mock data)
const RECENT_REPORTS = [
    { id: 1, name: 'Resumen Q4 2024', type: 'projects-summary', date: '2024-12-20', size: '1.2 MB' },
    { id: 2, name: 'Reporte Financiero Diciembre', type: 'financial', date: '2024-12-15', size: '856 KB' },
    { id: 3, name: 'Rendimiento Equipo Nov', type: 'team', date: '2024-12-01', size: '432 KB' },
];

// Report Card Component
function ReportCard({
    report,
    isSelected,
    onClick,
}: {
    report: typeof REPORT_TYPES[0];
    isSelected: boolean;
    onClick: () => void;
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-solaria-orange/10 text-solaria-orange',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
        indigo: 'bg-indigo-100 text-indigo-600',
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'rounded-xl border p-5 cursor-pointer transition-all',
                isSelected
                    ? 'border-solaria-orange bg-solaria-orange/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            )}
        >
            <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-lg', colorClasses[report.color])}>
                    <report.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                </div>
                {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-solaria-orange text-white">
                        <CheckCircle className="h-4 w-4" />
                    </div>
                )}
            </div>
        </div>
    );
}

// Preview Table Component
function PreviewTable({ projects }: { projects: Project[] }) {
    return (
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
                    {projects.slice(0, 5).map((project) => (
                        <tr key={project.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3">
                                <span className="font-medium text-gray-900">{project.name}</span>
                            </td>
                            <td className="py-3 text-gray-600">{project.client || '-'}</td>
                            <td className="py-3">
                                <span className={cn(
                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                    project.status === 'development' ? 'bg-blue-100 text-blue-700' :
                                    project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    project.status === 'testing' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'
                                )}>
                                    {project.status}
                                </span>
                            </td>
                            <td className="py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px]">
                                        <div
                                            className="h-full bg-solaria-orange rounded-full"
                                            style={{ width: `${project.progress || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600">{project.progress || 0}%</span>
                                </div>
                            </td>
                            <td className="py-3 text-right font-medium text-gray-900">
                                {formatCurrency(project.budget || 0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string>('projects-summary');
    const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Fetch projects for preview
    const { data: projects, isLoading } = useQuery({
        queryKey: ['reports', 'projects'],
        queryFn: async () => {
            const response = await endpoints.projects.list();
            const data = response.data;
            return (Array.isArray(data) ? data : data.projects || []) as Project[];
        },
    });

    const handleGenerate = () => {
        // Simulate report generation
        alert(`Generando reporte: ${selectedReport} en formato ${selectedFormat.toUpperCase()}`);
    };

    const handleDownload = (reportId: number) => {
        alert(`Descargando reporte #${reportId}`);
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-gray-200" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                    <p className="text-sm text-gray-500">
                        Genera y descarga reportes ejecutivos
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Types */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-semibold text-gray-900">Seleccionar Tipo de Reporte</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {REPORT_TYPES.map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                isSelected={selectedReport === report.id}
                                onClick={() => setSelectedReport(report.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="space-y-6">
                    {/* Date Range */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Rango de Fechas
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Export Format */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            Formato de Exportacion
                        </h3>
                        <div className="flex gap-2">
                            {EXPORT_FORMATS.map((format) => (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={cn(
                                        'flex-1 flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
                                        selectedFormat === format.id
                                            ? 'border-solaria-orange bg-solaria-orange/5 text-solaria-orange'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    )}
                                >
                                    <format.icon className="h-5 w-5" />
                                    <span className="text-xs font-medium">{format.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-solaria-orange px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark"
                    >
                        <Download className="h-4 w-4" />
                        Generar Reporte
                    </button>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Eye className="h-4 w-4" />
                            Vista Previa
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Vista Previa</h2>
                    <span className="text-sm text-gray-500">
                        {projects?.length || 0} proyectos encontrados
                    </span>
                </div>
                {projects && <PreviewTable projects={projects} />}
            </div>

            {/* Recent Reports */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Reportes Recientes</h2>
                <div className="space-y-3">
                    {RECENT_REPORTS.map((report) => {
                        const reportType = REPORT_TYPES.find((t) => t.id === report.type);
                        const ReportIcon = reportType?.icon || FileText;

                        return (
                            <div
                                key={report.id}
                                className="flex items-center gap-4 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                    <ReportIcon className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{report.name}</h4>
                                    <p className="text-xs text-gray-500">
                                        {report.date} • {report.size}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDownload(report.id)}
                                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-solaria-orange hover:bg-solaria-orange/10"
                                >
                                    <Download className="h-4 w-4" />
                                    Descargar
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ReportsPage;
