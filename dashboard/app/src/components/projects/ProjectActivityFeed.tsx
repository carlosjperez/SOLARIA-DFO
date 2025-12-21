import {
    Activity,
    CheckCircle2,
    AlertCircle,
    User,
    FileText,
    Code,
    MessageSquare,
    Loader2,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useProjectActivity } from '@/hooks/useApi';
import type { ActivityLog } from '@/types';

interface ProjectActivityFeedProps {
    projectId: number;
    limit?: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
    task: <CheckCircle2 className="h-4 w-4" />,
    agent: <User className="h-4 w-4" />,
    project: <FileText className="h-4 w-4" />,
    code: <Code className="h-4 w-4" />,
    system: <Activity className="h-4 w-4" />,
    alert: <AlertCircle className="h-4 w-4" />,
    comment: <MessageSquare className="h-4 w-4" />,
};

const levelColors: Record<string, string> = {
    debug: 'text-gray-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    critical: 'text-red-600',
};

export function ProjectActivityFeed({ projectId, limit = 20 }: ProjectActivityFeedProps) {
    const { data: activities, isLoading } = useProjectActivity(projectId, limit);

    if (isLoading) {
        return (
            <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                    <Activity className="h-4 w-4" />
                    Actividad Reciente
                </h3>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="sidebar-card">
                <h3 className="sidebar-card-title">
                    <Activity className="h-4 w-4" />
                    Actividad Reciente
                </h3>
                <div className="sidebar-card-empty">
                    <Activity className="h-8 w-8 text-muted-foreground/50" />
                    <p>Sin actividad reciente</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar-card">
            <h3 className="sidebar-card-title">
                <Activity className="h-4 w-4" />
                Actividad Reciente
            </h3>
            <div className="activity-feed">
                {activities.map((activity: ActivityLog) => {
                    const icon = categoryIcons[activity.category] || categoryIcons.system;
                    const levelColor = levelColors[activity.level] || levelColors.info;

                    return (
                        <div key={activity.id} className="activity-item">
                            <div className={cn('activity-icon', levelColor)}>
                                {icon}
                            </div>
                            <div className="activity-content">
                                <div className="activity-message">{activity.message}</div>
                                <div className="activity-meta">
                                    <span className="activity-action">{activity.action}</span>
                                    <span className="activity-time">
                                        {formatRelativeTime(activity.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProjectActivityFeed;
