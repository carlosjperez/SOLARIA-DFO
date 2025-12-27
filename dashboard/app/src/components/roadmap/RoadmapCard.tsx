import { useNavigate } from 'react-router-dom';
import {
    Target,
    Zap,
    Calendar,
    ChevronRight,
    Clock,
    TrendingUp,
} from 'lucide-react';
import type { Epic, Sprint } from '@/types';

interface RoadmapCardProps {
    epics: Epic[];
    sprints: Sprint[];
    projectId: number;
    onEpicClick?: (epicId: number) => void;
    onSprintClick?: (sprintId: number) => void;
}

export function RoadmapCard({
    epics,
    sprints,
    projectId,
    onEpicClick,
    onSprintClick,
}: RoadmapCardProps) {
    const navigate = useNavigate();

    // Get active items
    const activeEpic = epics.find((e) => e.status === 'in_progress');
    const activeSprint = sprints.find((s) => s.status === 'active');

    // Get upcoming items (planned, ordered by date)
    const upcomingEpics = epics
        .filter((e) => e.status === 'open')
        .sort((a, b) => {
            if (!a.startDate && !b.startDate) return 0;
            if (!a.startDate) return 1;
            if (!b.startDate) return -1;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        })
        .slice(0, 2);

    const upcomingSprints = sprints
        .filter((s) => s.status === 'planned')
        .sort((a, b) => {
            if (!a.startDate && !b.startDate) return 0;
            if (!a.startDate) return 1;
            if (!b.startDate) return -1;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        })
        .slice(0, 2);

    // Calculate days remaining
    const getDaysRemaining = (endDate: string | null | undefined) => {
        if (!endDate) return null;
        const end = new Date(endDate).getTime();
        const now = Date.now();
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    };

    const hasContent = activeEpic || activeSprint || upcomingEpics.length > 0 || upcomingSprints.length > 0;

    return (
        <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-solaria" />
                    Roadmap
                </h4>
                <button
                    onClick={() => navigate(`/projects/${projectId}/roadmap`)}
                    className="text-xs text-muted-foreground hover:text-solaria transition-colors flex items-center gap-1"
                >
                    Ver timeline
                    <ChevronRight className="h-3 w-3" />
                </button>
            </div>

            {!hasContent ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Sin epics o sprints activos
                </p>
            ) : (
                <div className="space-y-3">
                    {/* Active Sprint */}
                    {activeSprint && (
                        <div
                            onClick={() => onSprintClick?.(activeSprint.id)}
                            className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 cursor-pointer hover:bg-green-500/20 transition-colors"
                        >
                            <div className="flex items-center gap-2 text-sm">
                                <Zap className="h-3.5 w-3.5 text-green-400 animate-pulse" />
                                <span className="text-green-400 font-medium text-xs">SPRINT ACTIVO</span>
                            </div>
                            <p className="text-sm font-medium text-foreground mt-1 truncate">
                                {activeSprint.name}
                            </p>
                            {activeSprint.endDate && (
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {(() => {
                                        const days = getDaysRemaining(activeSprint.endDate);
                                        if (days === null) return 'Sin fecha fin';
                                        if (days < 0) return <span className="text-red-400">{Math.abs(days)}d vencido</span>;
                                        if (days <= 3) return <span className="text-orange-400">{days}d restantes</span>;
                                        return `${days}d restantes`;
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active Epic */}
                    {activeEpic && (
                        <div
                            onClick={() => onEpicClick?.(activeEpic.id)}
                            className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 cursor-pointer hover:bg-purple-500/20 transition-colors"
                        >
                            <div className="flex items-center gap-2 text-sm">
                                <Target className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                                <span className="text-purple-400 font-medium text-xs">EPIC ACTIVO</span>
                            </div>
                            <p className="text-sm font-medium text-foreground mt-1 truncate">
                                {activeEpic.name}
                            </p>
                            {activeEpic.targetDate && (
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Meta: {new Date(activeEpic.targetDate).toLocaleDateString('es-ES')}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upcoming Section */}
                    {(upcomingSprints.length > 0 || upcomingEpics.length > 0) && (
                        <div className="pt-2 border-t border-border">
                            <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                                Próximos
                            </p>
                            <div className="space-y-1.5">
                                {upcomingSprints.map((sprint) => (
                                    <div
                                        key={sprint.id}
                                        onClick={() => onSprintClick?.(sprint.id)}
                                        className="flex items-center gap-2 p-1.5 rounded bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                                    >
                                        <Zap className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-foreground truncate flex-1">
                                            {sprint.name}
                                        </span>
                                        {sprint.startDate && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(sprint.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {upcomingEpics.map((epic) => (
                                    <div
                                        key={epic.id}
                                        onClick={() => onEpicClick?.(epic.id)}
                                        className="flex items-center gap-2 p-1.5 rounded bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: epic.color || '#6366f1' }}
                                        />
                                        <span className="text-xs text-foreground truncate flex-1">
                                            {epic.name}
                                        </span>
                                        {epic.startDate && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(epic.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
