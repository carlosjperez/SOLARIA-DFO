/**
 * SOLARIA Office Business Logic
 * Ported from vanilla office-utils.js
 */

import type { Project, Task, BudgetBreakdown, Client } from '../types';

/**
 * Filter projects for Office view
 * Shows only projects relevant to managers and account executives
 */
export function filterOfficeProjects(projects: Project[]): Project[] {
    // Filter out internal/infrastructure projects
    const excludedStatuses = ['cancelled'];

    return projects
        .filter(p => !excludedStatuses.includes(p.status))
        .sort((a, b) => {
            // Priority order: active first, then by deadline
            const statusOrder: Record<string, number> = {
                development: 1,
                testing: 2,
                deployment: 3,
                planning: 4,
                completed: 5,
                on_hold: 6,
            };

            const aOrder = statusOrder[a.status] || 99;
            const bOrder = statusOrder[b.status] || 99;

            if (aOrder !== bOrder) return aOrder - bOrder;

            // Then by deadline (earliest first)
            if (a.deadline && b.deadline) {
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            }
            return a.deadline ? -1 : 1;
        });
}

/**
 * Calculate budget breakdown using SOLARIA formula
 * 45% humans, 20% AI, 16% taxes, 15% margin floor
 */
export function calculateBudgetSegments(totalBudget: number): BudgetBreakdown {
    return {
        humans: Math.round(totalBudget * 0.45),
        ai: Math.round(totalBudget * 0.20),
        taxes: Math.round(totalBudget * 0.16),
        margin: Math.round(totalBudget * 0.15),
        other: Math.round(totalBudget * 0.04),
    };
}

/**
 * Merge tasks into projects for consolidated view
 */
export function mergeTasksIntoProjects(
    projects: Project[],
    tasks: Task[]
): (Project & { tasks: Task[] })[] {
    const tasksByProject = tasks.reduce((acc, task) => {
        const projectId = task.project_id;
        if (!acc[projectId]) {
            acc[projectId] = [];
        }
        acc[projectId].push(task);
        return acc;
    }, {} as Record<number, Task[]>);

    return projects.map(project => ({
        ...project,
        tasks: tasksByProject[project.id] || [],
    }));
}

/**
 * Summarize projects by client for executive view
 */
export function summarizeProjectsByClient(projects: Project[]): Client[] {
    const clientMap = new Map<string, Client>();

    for (const project of projects) {
        const clientName = project.client || 'Sin Cliente';

        if (!clientMap.has(clientName)) {
            clientMap.set(clientName, {
                name: clientName,
                projects: 0,
                totalBudget: 0,
                activeProjects: 0,
            });
        }

        const client = clientMap.get(clientName)!;
        client.projects += 1;
        client.totalBudget += project.budget || 0;

        if (['development', 'testing', 'deployment'].includes(project.status)) {
            client.activeProjects += 1;
        }
    }

    return Array.from(clientMap.values())
        .sort((a, b) => b.totalBudget - a.totalBudget);
}

/**
 * Get status display properties
 */
export function getStatusDisplay(status: string): { label: string; color: string } {
    const statusConfig: Record<string, { label: string; color: string }> = {
        planning: { label: 'Planificacion', color: 'amber' },
        development: { label: 'En Desarrollo', color: 'blue' },
        testing: { label: 'Testing', color: 'purple' },
        deployment: { label: 'Despliegue', color: 'indigo' },
        completed: { label: 'Completado', color: 'green' },
        on_hold: { label: 'En Pausa', color: 'gray' },
        blocked: { label: 'Bloqueado', color: 'red' },
        cancelled: { label: 'Cancelado', color: 'gray' },
        pending: { label: 'Pendiente', color: 'yellow' },
        in_progress: { label: 'En Progreso', color: 'blue' },
    };

    return statusConfig[status] || { label: status, color: 'gray' };
}

/**
 * Calculate project health score (0-100)
 */
export function calculateProjectHealth(project: Project): number {
    let score = 100;

    // Deduct for low progress vs time elapsed
    if (project.deadline) {
        const now = new Date();
        const deadline = new Date(project.deadline);
        const created = new Date(project.created_at);
        const totalTime = deadline.getTime() - created.getTime();
        const elapsed = now.getTime() - created.getTime();
        const expectedProgress = (elapsed / totalTime) * 100;

        if (project.progress < expectedProgress - 20) {
            score -= 30; // Behind schedule
        } else if (project.progress < expectedProgress - 10) {
            score -= 15; // Slightly behind
        }
    }

    // Deduct for blocked status
    if (project.status === 'blocked' || project.status === 'on_hold') {
        score -= 25;
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Format hours to readable string
 */
export function formatHours(hours: number): string {
    if (hours < 1) {
        return `${Math.round(hours * 60)}m`;
    }
    if (hours < 24) {
        return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 8); // 8-hour workdays
    const remainingHours = hours % 8;
    return `${days}d ${remainingHours.toFixed(0)}h`;
}
