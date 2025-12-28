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
                                "flex items-center gap-3 p-4 cursor-pointer transition-colors",
                                isActive ? "bg-green-500/10" : "hover:bg-muted/50"
                            )}
                            onClick={() => toggleSprint(sprint.id)}
                        >
                            <button className="p-0.5">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>

                            <Zap className={cn("h-5 w-5", isActive && "text-green-500 animate-pulse")} />

                            <div className="flex-1">
                                <h3 className="font-semibold">{sprint.name}</h3>
                                {sprint.goal && <p className="text-sm text-muted-foreground truncate">{sprint.goal}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                    {sprint.epicsTotal || 0} epics · {sprint.tasksCompleted || 0}/{sprint.tasksTotal || 0} tasks
                                </span>
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all", progress === 100 ? "bg-green-500" : "bg-blue-500")}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{progress}%</span>
                            </div>

                            <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                isActive ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                            )}>
                                {sprint.status}
                            </span>
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
