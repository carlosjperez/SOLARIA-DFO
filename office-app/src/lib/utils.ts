import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency with locale
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
}

/**
 * Calculate budget breakdown (SOLARIA formula)
 * 45% humans, 20% AI, 16% taxes, 15% margin floor
 */
export function calculateBudgetBreakdown(totalBudget: number) {
    return {
        humans: totalBudget * 0.45,
        ai: totalBudget * 0.20,
        taxes: totalBudget * 0.16,
        margin: totalBudget * 0.15,
        other: totalBudget * 0.04,
    };
}

/**
 * Get status color class
 */
export function getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
        development: 'status-development',
        testing: 'status-testing',
        completed: 'status-completed',
        blocked: 'status-blocked',
        planning: 'status-planning',
        'on_hold': 'status-on-hold',
    };
    return statusMap[status] || 'status-planning';
}

/**
 * Get priority color class
 */
export function getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
        critical: 'priority-critical',
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low',
    };
    return priorityMap[priority] || 'priority-medium';
}
