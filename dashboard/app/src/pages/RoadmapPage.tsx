import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Target,
    Zap,
    Calendar,
} from 'lucide-react';
import {
    useProject,
    useProjectEpics,
    useProjectSprints,
} from '@/hooks/useApi';
import { EpicDetailModal } from '@/components/epics/EpicDetailModal';
import { SprintDetailModal } from '@/components/sprints/SprintDetailModal';
import { SprintHierarchyView } from '@/components/roadmap/SprintHierarchyView';
import { cn } from '@/lib/utils';
import type { Epic, Sprint } from '@/types';

type FilterType = 'all' | 'epics' | 'sprints';
type ViewMode = 'timeline' | 'hierarchy';

// Timeline header with months - Responsive label column
function TimelineHeader({ months }: { months: { label: string; width: number }[] }) {
    return (
        <div className="flex border-b border-border bg-muted/30 sticky top-0 z-10">
            <div className="w-32 sm:w-48 md:w-64 flex-shrink-0 p-2 sm:p-3 border-r border-border font-medium text-xs sm:text-sm">
                Elementos
            </div>
            <div className="flex-1 flex">
                {months.map((month, idx) => (
                    <div
                        key={idx}
                        className="border-r border-border p-1 sm:p-2 text-xs font-medium text-muted-foreground text-center"
                        style={{ width: `${month.width}px`, minWidth: `${month.width}px` }}
                    >
                        {month.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Timeline row for an epic or sprint
function TimelineRow({
    item,
    type,
    startDate,
    endDate,
    timelineStart,
    dayWidth,
    onClick,
}: {
    item: Epic | Sprint;
    type: 'epic' | 'sprint';
    startDate: Date | null;
    endDate: Date | null;
    timelineStart: Date;
    dayWidth: number;
    onClick: () => void;
}) {
    if (!startDate || !endDate) {
        // No dates, show placeholder
        return (
            <div className="flex border-b border-border hover:bg-muted/30 transition-colors">
                <div
                    onClick={onClick}
                    className="w-32 sm:w-48 md:w-64 flex-shrink-0 p-2 sm:p-3 border-r border-border flex items-center gap-2 cursor-pointer"
                >
                    {type === 'epic' ? (
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: (item as Epic).color || '#6366f1' }}
                        />
                    ) : (
                        <Zap className="h-3 w-3 text-green-400" />
                    )}
                    <span className="text-xs sm:text-sm truncate">{item.name}</span>
                    <span className={cn(
                        'text-[10px] px-1 py-0.5 rounded ml-auto',
                        item.status === 'completed' || item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                    )}>
                        {item.status}
                    </span>
                </div>
                <div className="flex-1 p-2 sm:p-3 flex items-center">
                    <span className="text-xs text-muted-foreground italic">Sin fechas definidas</span>
                </div>
            </div>
        );
    }

    // Calculate position
    const startOffset = Math.max(0, (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const left = startOffset * dayWidth;
    const width = duration * dayWidth;

    // Status-based styling
    const isActive = item.status === 'active' || item.status === 'in_progress';
    const isCompleted = item.status === 'completed';

    return (
        <div className="flex border-b border-border hover:bg-muted/30 transition-colors">
            <div
                onClick={onClick}
                className="w-32 sm:w-48 md:w-64 flex-shrink-0 p-2 sm:p-3 border-r border-border flex items-center gap-2 cursor-pointer"
            >
                {type === 'epic' ? (
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: (item as Epic).color || '#6366f1' }}
                    />
                ) : (
                    <Zap className={cn("h-3 w-3", isActive ? "text-green-400 animate-pulse" : "text-muted-foreground")} />
                )}
                <span className="text-xs sm:text-sm truncate flex-1">{item.name}</span>
                {isActive && (
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded text-white font-medium",
                        type === 'epic' ? 'bg-purple-500' : 'bg-green-500'
                    )}>
                        ACTIVO
                    </span>
                )}
            </div>
            <div className="flex-1 relative h-12 overflow-hidden">
                {/* Today marker */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{
                        left: `${((Date.now() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth}px`
                    }}
                />
                {/* Timeline bar */}
                <div
                    onClick={onClick}
                    className={cn(
                        "absolute top-2 h-8 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-offset-2",
                        type === 'epic'
                            ? isCompleted ? 'bg-purple-300 dark:bg-purple-800' : isActive ? 'bg-purple-500' : 'bg-purple-500/50'
                            : isCompleted ? 'bg-green-300 dark:bg-green-800' : isActive ? 'bg-green-500' : 'bg-green-500/50',
                        isActive && 'ring-2 ring-offset-1',
                        type === 'epic' ? 'hover:ring-purple-400' : 'hover:ring-green-400'
                    )}
                    style={{
                        left: `${left}px`,
                        width: `${Math.max(width, 4)}px`,
                    }}
                >
                    <div className="px-2 py-1 text-[10px] text-white font-medium truncate">
                        {width > 60 ? item.name : ''}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function RoadmapPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const projectId = Number(id);

    const [filter, setFilter] = useState<FilterType>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');
    const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
    const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

    // Queries
    const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
    const { data: epics = [] } = useProjectEpics(projectId);
    const { data: sprints = [] } = useProjectSprints(projectId);

    // Calculate timeline range
    const { timelineStart, months, dayWidth } = useMemo(() => {
        const allDates: Date[] = [];

        epics.forEach((e) => {
            if (e.startDate) allDates.push(new Date(e.startDate));
            if (e.targetDate) allDates.push(new Date(e.targetDate));
        });

        sprints.forEach((s) => {
            if (s.startDate) allDates.push(new Date(s.startDate));
            if (s.endDate) allDates.push(new Date(s.endDate));
        });

        // Default to current month if no dates
        let start = new Date();
        let end = new Date();

        if (allDates.length > 0) {
            start = new Date(Math.min(...allDates.map(d => d.getTime())));
            end = new Date(Math.max(...allDates.map(d => d.getTime())));
        }

        // Add padding (1 month before, 2 months after)
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setMonth(end.getMonth() + 2);
        end.setDate(0);

        // Generate months for header
        const monthsList: { label: string; width: number }[] = [];
        const current = new Date(start);
        const dayWidthPx = 8; // pixels per day

        while (current <= end) {
            const year = current.getFullYear();
            const month = current.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            monthsList.push({
                label: current.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                width: daysInMonth * dayWidthPx,
            });
            current.setMonth(current.getMonth() + 1);
        }

        return {
            timelineStart: start,
            timelineEnd: end,
            months: monthsList,
            dayWidth: dayWidthPx,
        };
    }, [epics, sprints]);

    // Filter items
    const filteredEpics = filter === 'sprints' ? [] : epics;
    const filteredSprints = filter === 'epics' ? [] : sprints;

    // Sort items by start date
    const sortedEpics = [...filteredEpics].sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const sortedSprints = [...filteredSprints].sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Loading state
    if (projectLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-solaria" />
            </div>
        );
    }

    // Error state
    if (projectError || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold text-foreground">Proyecto no encontrado</h2>
                <button
                    onClick={() => navigate('/projects')}
                    className="px-4 py-2 rounded-lg bg-solaria text-white flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Proyectos
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-4">
            {/* Header */}
            <div className="section-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/projects/${projectId}`)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        title="Volver al proyecto"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="section-title flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-solaria" />
                            Roadmap
                        </h1>
                        <p className="section-subtitle">{project.name}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                            filter === 'all'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('epics')}
                        className={cn(
                            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                            filter === 'epics'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Target className="h-3 w-3" />
                        Epics
                    </button>
                    <button
                        onClick={() => setFilter('sprints')}
                        className={cn(
                            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                            filter === 'sprints'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Zap className="h-3 w-3" />
                        Sprints
                    </button>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle">
                <button
                    onClick={() => setViewMode('timeline')}
                    className={cn('view-toggle-btn', viewMode === 'timeline' && 'active')}
                >
                    Timeline
                </button>
                <button
                    onClick={() => setViewMode('hierarchy')}
                    className={cn('view-toggle-btn', viewMode === 'hierarchy' && 'active')}
                >
                    Jerarquía
                </button>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <div style={{ minWidth: '800px' }}>
                        {/* Header */}
                        <TimelineHeader months={months} />

                        {/* Epics Section */}
                        {sortedEpics.length > 0 && (
                            <>
                                <div className="flex bg-muted/50 border-b border-border">
                                    <div className="w-32 sm:w-48 md:w-64 flex-shrink-0 p-2 px-3 border-r border-border flex items-center gap-2">
                                        <Target className="h-4 w-4 text-purple-400" />
                                        <span className="text-xs font-semibold uppercase text-muted-foreground">Epics</span>
                                        <span className="text-xs text-muted-foreground ml-auto">{sortedEpics.length}</span>
                                    </div>
                                    <div className="flex-1" />
                                </div>
                                {sortedEpics.map((epic) => (
                                    <TimelineRow
                                        key={`epic-${epic.id}`}
                                        item={epic}
                                        type="epic"
                                        startDate={epic.startDate ? new Date(epic.startDate) : null}
                                        endDate={epic.targetDate ? new Date(epic.targetDate) : null}
                                        timelineStart={timelineStart}
                                        dayWidth={dayWidth}
                                        onClick={() => setSelectedEpicId(epic.id)}
                                    />
                                ))}
                            </>
                        )}

                        {/* Sprints Section */}
                        {sortedSprints.length > 0 && (
                            <>
                                <div className="flex bg-muted/50 border-b border-border">
                                    <div className="w-32 sm:w-48 md:w-64 flex-shrink-0 p-2 px-3 border-r border-border flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-green-400" />
                                        <span className="text-xs font-semibold uppercase text-muted-foreground">Sprints</span>
                                        <span className="text-xs text-muted-foreground ml-auto">{sortedSprints.length}</span>
                                    </div>
                                    <div className="flex-1" />
                                </div>
                                {sortedSprints.map((sprint) => (
                                    <TimelineRow
                                        key={`sprint-${sprint.id}`}
                                        item={sprint}
                                        type="sprint"
                                        startDate={sprint.startDate ? new Date(sprint.startDate) : null}
                                        endDate={sprint.endDate ? new Date(sprint.endDate) : null}
                                        timelineStart={timelineStart}
                                        dayWidth={dayWidth}
                                        onClick={() => setSelectedSprintId(sprint.id)}
                                    />
                                ))}
                            </>
                        )}

                        {/* Empty state */}
                        {sortedEpics.length === 0 && sortedSprints.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No hay elementos para mostrar en el timeline</p>
                                <p className="text-sm mt-1">Crea epics y sprints con fechas para visualizarlos aquí</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            ) : (
            <div className="bg-card rounded-xl border border-border p-4">
                <SprintHierarchyView
                    sprints={sortedSprints}
                    onSprintClick={(id) => setSelectedSprintId(id)}
                />
            </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 bg-red-500" />
                    <span>Hoy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded-sm bg-purple-500" />
                    <span>Epic Activo</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded-sm bg-green-500" />
                    <span>Sprint Activo</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded-sm bg-gray-400/50" />
                    <span>Planificado/Completado</span>
                </div>
            </div>

            {/* Epic Detail Modal */}
            <EpicDetailModal
                epicId={selectedEpicId}
                isOpen={selectedEpicId !== null}
                onClose={() => setSelectedEpicId(null)}
            />

            {/* Sprint Detail Modal */}
            <SprintDetailModal
                sprintId={selectedSprintId}
                isOpen={selectedSprintId !== null}
                onClose={() => setSelectedSprintId(null)}
            />
        </div>
    );
}
