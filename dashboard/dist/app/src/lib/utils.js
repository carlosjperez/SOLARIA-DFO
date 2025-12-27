import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}
export function formatDateTime(date) {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}
export function formatRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 7)
        return formatDate(date);
    if (days > 0)
        return `hace ${days}d`;
    if (hours > 0)
        return `hace ${hours}h`;
    if (minutes > 0)
        return `hace ${minutes}m`;
    return 'ahora';
}
export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
}
export function formatNumber(num) {
    return new Intl.NumberFormat('es-MX').format(num);
}
export function formatPercentage(value, decimals = 0) {
    return `${value.toFixed(decimals)}%`;
}
export function truncate(str, length) {
    if (str.length <= length)
        return str;
    return `${str.slice(0, length)}...`;
}
export function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
export function getStatusColor(status) {
    const colors = {
        active: 'bg-green-500',
        in_progress: 'bg-blue-500',
        pending: 'bg-yellow-500',
        completed: 'bg-green-500',
        blocked: 'bg-red-500',
        review: 'bg-purple-500',
        inactive: 'bg-gray-500',
        error: 'bg-red-500',
        busy: 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
}
export function getPriorityColor(priority) {
    const colors = {
        critical: 'text-red-500 bg-red-500/10',
        high: 'text-orange-500 bg-orange-500/10',
        medium: 'text-yellow-500 bg-yellow-500/10',
        low: 'text-green-500 bg-green-500/10',
    };
    return colors[priority] || 'text-gray-500 bg-gray-500/10';
}
//# sourceMappingURL=utils.js.map