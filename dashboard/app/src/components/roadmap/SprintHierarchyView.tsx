import { useState } from 'react';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Sprint } from '@/types';

interface SprintHierarchyViewProps {
    sprints: Sprint[];
    onSprintClick?: (sprintId: number) => void;
}

export function SprintHierarchyView({ sprints, onSprintClick }: SprintHierarchyViewProps) {
    const [expandedSprints, setExpandedSprints] = useState<Set<number>>(new Set());

    const toggleSprint = (sprintId: number) => {
        const newExpanded = new Set(expandedSprints);
        if (newExpanded.has(sprintId)) {
            newExpanded.delete(sprintId);
        } else {
            newExpanded.add(sprintId);
        }
        setExpandedSprints(newExpanded);
    };

    return (
        <div className="space-y-2">
            {sprints.map((sprint) => {
                const isExpanded = expandedSprints.has(sprint.id);
                const isActive = sprint.status === 'active';
                const progress = sprint.progress || 0;

                return (
                    <div key={sprint.id} className="border border-border rounded-lg overflow-hidden bg-card">
                        <div
                            className={cn(
                                "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 cursor-pointer transition-colors",
                                isActive ? "bg-green-500/10" : "hover:bg-muted/50"
                            )}
                            onClick={() => toggleSprint(sprint.id)}
                        >
                            {/* Top row: Icon, title, expand button */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <button className="p-0.5 flex-shrink-0">
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>

                                <Zap className={cn("h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0", isActive && "text-green-500 animate-pulse")} />

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm sm:text-base truncate">{sprint.name}</h3>
                                    {sprint.goal && <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{sprint.goal}</p>}
                                </div>

                                <span className={cn(
                                    "text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
                                    isActive ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                                )}>
                                    {sprint.status}
                                </span>
                            </div>

                            {/* Bottom row (mobile) / Right side (desktop): Stats */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    <span className="hidden sm:inline">{sprint.epicsTotal || 0} epics · </span>
                                    {sprint.tasksCompleted || 0}/{sprint.tasksTotal || 0}
                                    <span className="hidden sm:inline"> tasks</span>
                                </span>
                                <div className="w-16 sm:w-24 h-2 bg-muted rounded-full overflow-hidden flex-shrink-0">
                                    <div
                                        className={cn("h-full transition-all", progress === 100 ? "bg-green-500" : "bg-blue-500")}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-xs sm:text-sm font-medium w-8 sm:w-12 text-right flex-shrink-0">{progress}%</span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="border-t border-border bg-muted/30 p-4">
                                <button
                                    onClick={() => onSprintClick?.(sprint.id)}
                                    className="text-sm text-solaria hover:underline"
                                >
                                    Ver detalles completos →
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
