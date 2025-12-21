import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { GanttRow } from './GanttRow';
import type { Task } from '@/types';

interface GanttViewProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    weeksToShow?: number;
}

function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatWeekLabel(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('es', { month: 'short' });
    return `${day} ${month}`;
}

export function GanttView({ tasks, onTaskClick, weeksToShow = 8 }: GanttViewProps) {
    const [offset, setOffset] = useState(0); // weeks offset from current

    const { startDate, endDate, weeks } = useMemo(() => {
        // Start from beginning of current week + offset
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday

        const start = new Date(now);
        start.setDate(now.getDate() + diff + offset * 7);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + weeksToShow * 7);

        // Generate week headers
        const weekHeaders: { start: Date; label: string; weekNum: number }[] = [];
        for (let i = 0; i < weeksToShow; i++) {
            const weekStart = new Date(start);
            weekStart.setDate(start.getDate() + i * 7);
            weekHeaders.push({
                start: weekStart,
                label: formatWeekLabel(weekStart),
                weekNum: getWeekNumber(weekStart),
            });
        }

        return {
            startDate: start,
            endDate: end,
            weeks: weekHeaders,
        };
    }, [offset, weeksToShow]);

    // Calculate today marker position
    const todayPosition = useMemo(() => {
        const now = new Date();
        const viewStartMs = startDate.getTime();
        const viewEndMs = endDate.getTime();
        const nowMs = now.getTime();

        if (nowMs < viewStartMs || nowMs > viewEndMs) return null;

        return ((nowMs - viewStartMs) / (viewEndMs - viewStartMs)) * 100;
    }, [startDate, endDate]);

    // Sort tasks by start date
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            const aStart = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bStart = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aStart - bStart;
        });
    }, [tasks]);

    const handlePrevious = () => setOffset(offset - weeksToShow);
    const handleNext = () => setOffset(offset + weeksToShow);
    const handleToday = () => setOffset(0);

    return (
        <div className="gantt-container">
            {/* Navigation header */}
            <div className="gantt-nav">
                <div className="gantt-nav-buttons">
                    <button onClick={handlePrevious} className="gantt-nav-btn">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={handleToday} className="gantt-nav-btn today">
                        <Calendar className="h-4 w-4" />
                        Hoy
                    </button>
                    <button onClick={handleNext} className="gantt-nav-btn">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <div className="gantt-date-range">
                    {formatWeekLabel(startDate)} - {formatWeekLabel(endDate)}
                </div>
            </div>

            {/* Timeline header */}
            <div className="gantt-header">
                <div className="gantt-header-info">Tarea</div>
                <div className="gantt-header-timeline">
                    {weeks.map((week, i) => (
                        <div
                            key={i}
                            className="gantt-week-column"
                            style={{ width: `${100 / weeksToShow}%` }}
                        >
                            <div className="gantt-week-label">{week.label}</div>
                            <div className="gantt-week-number">S{week.weekNum}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gantt body */}
            <div className="gantt-body">
                {/* Today marker */}
                {todayPosition !== null && (
                    <div
                        className="gantt-today-marker"
                        style={{ left: `calc(200px + ${todayPosition}% * (100% - 200px) / 100)` }}
                    >
                        <div className="gantt-today-label">Hoy</div>
                    </div>
                )}

                {/* Grid lines */}
                <div className="gantt-grid">
                    {weeks.map((_, i) => (
                        <div
                            key={i}
                            className="gantt-grid-line"
                            style={{ left: `calc(200px + ${(i / weeksToShow) * 100}% * (100% - 200px) / 100)` }}
                        />
                    ))}
                </div>

                {/* Task rows */}
                {sortedTasks.length > 0 ? (
                    sortedTasks.map((task) => (
                        <GanttRow
                            key={task.id}
                            task={task}
                            startDate={startDate}
                            endDate={endDate}
                            onClick={() => onTaskClick?.(task)}
                        />
                    ))
                ) : (
                    <div className="gantt-empty">
                        <Calendar className="h-12 w-12 text-muted-foreground/50" />
                        <p>No hay tareas para mostrar en el Gantt</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="gantt-legend">
                <div className="gantt-legend-item">
                    <div className="gantt-legend-color pending" />
                    <span>Pendiente</span>
                </div>
                <div className="gantt-legend-item">
                    <div className="gantt-legend-color in_progress" />
                    <span>En Progreso</span>
                </div>
                <div className="gantt-legend-item">
                    <div className="gantt-legend-color review" />
                    <span>En Revision</span>
                </div>
                <div className="gantt-legend-item">
                    <div className="gantt-legend-color completed" />
                    <span>Completada</span>
                </div>
                <div className="gantt-legend-item">
                    <div className="gantt-legend-color blocked" />
                    <span>Bloqueada</span>
                </div>
            </div>
        </div>
    );
}

export default GanttView;
