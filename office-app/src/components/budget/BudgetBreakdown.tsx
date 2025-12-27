/**
 * BudgetBreakdown Component
 * Visualizes SOLARIA budget formula segments:
 * - 45% Humans
 * - 20% AI
 * - 16% Taxes
 * - 15% Margin
 * - 4% Other
 */

import { useMemo } from 'react';
import { calculateBudgetSegments } from '@lib/office-utils';
import { cn } from '@lib/utils';
import { Users, Bot, Receipt, TrendingUp, MoreHorizontal } from 'lucide-react';

interface BudgetBreakdownProps {
    totalBudget: number;
    className?: string;
    variant?: 'horizontal' | 'vertical' | 'compact';
    showTotal?: boolean;
    currency?: string;
}

interface SegmentConfig {
    key: keyof ReturnType<typeof calculateBudgetSegments>;
    label: string;
    percentage: number;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
}

const SEGMENT_CONFIG: SegmentConfig[] = [
    {
        key: 'humans',
        label: 'Humanos',
        percentage: 45,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        icon: <Users className="h-4 w-4" />,
    },
    {
        key: 'ai',
        label: 'IA',
        percentage: 20,
        color: 'text-purple-600',
        bgColor: 'bg-purple-500',
        icon: <Bot className="h-4 w-4" />,
    },
    {
        key: 'taxes',
        label: 'Impuestos',
        percentage: 16,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500',
        icon: <Receipt className="h-4 w-4" />,
    },
    {
        key: 'margin',
        label: 'Margen',
        percentage: 15,
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        icon: <TrendingUp className="h-4 w-4" />,
    },
    {
        key: 'other',
        label: 'Otros',
        percentage: 4,
        color: 'text-gray-600',
        bgColor: 'bg-gray-400',
        icon: <MoreHorizontal className="h-4 w-4" />,
    },
];

function formatCurrency(amount: number, currency = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function BudgetBreakdown({
    totalBudget,
    className,
    variant = 'horizontal',
    showTotal = true,
    currency = 'MXN',
}: BudgetBreakdownProps) {
    const segments = useMemo(() => calculateBudgetSegments(totalBudget), [totalBudget]);

    if (variant === 'compact') {
        return (
            <div className={cn('space-y-2', className)}>
                {/* Stacked bar */}
                <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                    {SEGMENT_CONFIG.map((config) => (
                        <div
                            key={config.key}
                            className={cn(config.bgColor, 'transition-all duration-300')}
                            style={{ width: `${config.percentage}%` }}
                            title={`${config.label}: ${formatCurrency(segments[config.key], currency)} (${config.percentage}%)`}
                        />
                    ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-xs">
                    {SEGMENT_CONFIG.map((config) => (
                        <div key={config.key} className="flex items-center gap-1">
                            <div className={cn('h-2 w-2 rounded-full', config.bgColor)} />
                            <span className="text-gray-600">{config.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (variant === 'vertical') {
        return (
            <div className={cn('space-y-4', className)}>
                {showTotal && (
                    <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-500">Presupuesto Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(totalBudget, currency)}
                        </p>
                    </div>
                )}
                <div className="space-y-3">
                    {SEGMENT_CONFIG.map((config) => (
                        <div key={config.key} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={config.color}>{config.icon}</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {config.label}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {config.percentage}%
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(segments[config.key], currency)}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={cn(config.bgColor, 'h-full transition-all duration-500')}
                                    style={{ width: `${config.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Default: horizontal grid
    return (
        <div className={cn('space-y-4', className)}>
            {showTotal && (
                <div className="text-center">
                    <p className="text-sm text-gray-500">Presupuesto Total</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(totalBudget, currency)}
                    </p>
                </div>
            )}

            {/* Stacked bar visualization */}
            <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
                {SEGMENT_CONFIG.map((config) => (
                    <div
                        key={config.key}
                        className={cn(
                            config.bgColor,
                            'flex items-center justify-center transition-all duration-300 hover:opacity-80'
                        )}
                        style={{ width: `${config.percentage}%` }}
                        title={`${config.label}: ${formatCurrency(segments[config.key], currency)}`}
                    />
                ))}
            </div>

            {/* Segment cards */}
            <div className="grid grid-cols-5 gap-2">
                {SEGMENT_CONFIG.map((config) => (
                    <div
                        key={config.key}
                        className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className={cn('mx-auto mb-1 w-fit rounded-full p-1.5', config.color, 'bg-opacity-10')}>
                            {config.icon}
                        </div>
                        <p className="text-xs font-medium text-gray-500">{config.label}</p>
                        <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(segments[config.key], currency)}
                        </p>
                        <p className="text-xs text-gray-400">{config.percentage}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BudgetBreakdown;
