import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StatCard Props Interface
 * Tarjeta de estadística reutilizable con soporte para variantes, iconos y cambios porcentuales
 */
export interface StatCardProps {
    /** Título de la estadística */
    title: string;

    /** Valor principal a mostrar (número o string) */
    value: string | number;

    /** Cambio porcentual opcional con tendencia */
    change?: {
        value: number;
        trend: 'up' | 'down';
    };

    /** Ícono opcional (Lucide icon component) */
    icon?: LucideIcon;

    /** Handler para hacer la card clickeable */
    onClick?: () => void;

    /** Variante visual de la card */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';

    /** Clase CSS adicional */
    className?: string;
}

/**
 * StatCard Component
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Proyectos Activos"
 *   value={24}
 *   change={{ value: 12, trend: 'up' }}
 *   icon={FolderOpen}
 *   variant="primary"
 * />
 * ```
 */
export function StatCard({
    title,
    value,
    change,
    icon: Icon,
    onClick,
    variant = 'default',
    className,
}: StatCardProps) {
    const isClickable = !!onClick;

    // Variant styles mapping
    const variantStyles = {
        default: {
            bg: 'bg-card',
            border: 'border-border',
            iconBg: 'bg-muted',
            iconColor: 'text-foreground',
        },
        primary: {
            bg: 'bg-card',
            border: 'border-brand/30',
            iconBg: 'bg-brand/10',
            iconColor: 'text-brand',
        },
        success: {
            bg: 'bg-card',
            border: 'border-success/30',
            iconBg: 'bg-success/10',
            iconColor: 'text-success',
        },
        warning: {
            bg: 'bg-card',
            border: 'border-warning/30',
            iconBg: 'bg-warning/10',
            iconColor: 'text-warning',
        },
        danger: {
            bg: 'bg-card',
            border: 'border-error/30',
            iconBg: 'bg-error/10',
            iconColor: 'text-error',
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            onClick={onClick}
            className={cn(
                // Base styles usando design tokens
                'rounded-xl border p-[var(--stat-card-padding)]',
                'transition-all duration-[var(--transition-normal)]',

                // Background y border por variante
                styles.bg,
                styles.border,

                // Hover states
                isClickable && [
                    'cursor-pointer',
                    'hover:shadow-[var(--shadow-card-hover)]',
                    'hover:scale-[1.02]',
                    'active:scale-[0.98]',
                ],

                // Custom className
                className
            )}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={isClickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            } : undefined}
            aria-label={isClickable ? `${title}: ${value}` : undefined}
        >
            <div className="flex items-start justify-between gap-[var(--stat-card-gap)]">
                {/* Left: Icon + Content */}
                <div className="flex-1 min-w-0">
                    {Icon && (
                        <div
                            className={cn(
                                'rounded-lg p-2 mb-3 inline-flex',
                                styles.iconBg
                            )}
                        >
                            <Icon className={cn('h-5 w-5', styles.iconColor)} />
                        </div>
                    )}

                    {/* Title */}
                    <p className="text-[var(--stat-title-size)] text-muted-foreground mb-1 truncate">
                        {title}
                    </p>

                    {/* Value */}
                    <p className="text-[var(--stat-value-size)] font-bold text-foreground truncate">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                </div>

                {/* Right: Change indicator (if present) */}
                {change && (
                    <div
                        className={cn(
                            'flex items-center gap-1 text-[var(--stat-change-size)] font-medium px-2 py-1 rounded-full',
                            change.trend === 'up'
                                ? 'bg-success/10 text-success'
                                : 'bg-error/10 text-error'
                        )}
                        aria-label={`${change.trend === 'up' ? 'Incremento' : 'Decremento'} del ${Math.abs(change.value)}%`}
                    >
                        <span>{change.trend === 'up' ? '↑' : '↓'}</span>
                        <span>{Math.abs(change.value)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
