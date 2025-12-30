import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * BackButton Props Interface
 */
export interface BackButtonProps {
    /** Optional custom route to navigate to (defaults to -1 in history) */
    to?: string;

    /** Custom label (defaults to "Back") */
    label?: string;

    /** Additional CSS classes */
    className?: string;

    /** Click handler (overrides default navigation) */
    onClick?: () => void;

    /** Visual variant */
    variant?: 'default' | 'ghost' | 'text';

    /** Show/hide icon */
    showIcon?: boolean;
}

/**
 * BackButton Component
 *
 * Navigation button for going back to previous page or specified route.
 * Uses React Router's navigate with fallback to browser history.
 *
 * @example
 * ```tsx
 * // Go back in browser history
 * <BackButton />
 *
 * // Navigate to specific route
 * <BackButton to="/dashboard" label="Back to Dashboard" />
 *
 * // Custom click handler
 * <BackButton onClick={() => console.log('Back clicked')} />
 *
 * // Text-only variant
 * <BackButton variant="text" />
 * ```
 */
export function BackButton({
    to,
    label = 'Back',
    className,
    onClick,
    variant = 'default',
    showIcon = true,
}: BackButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'inline-flex items-center gap-2',
                'text-[var(--text-sm)] font-medium',
                'transition-all duration-[var(--transition-normal)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',

                // Variant: default
                variant === 'default' && [
                    'px-3 py-2 rounded-md',
                    'bg-card border border-border',
                    'text-foreground',
                    'hover:bg-muted/50 hover:border-muted-foreground/20',
                    'active:scale-[0.98]',
                ],

                // Variant: ghost
                variant === 'ghost' && [
                    'px-3 py-2 rounded-md',
                    'text-muted-foreground',
                    'hover:bg-muted/50 hover:text-foreground',
                    'active:scale-[0.98]',
                ],

                // Variant: text
                variant === 'text' && [
                    'text-muted-foreground',
                    'hover:text-foreground',
                    'hover:underline',
                ],

                className
            )}
            type="button"
            aria-label={label}
        >
            {showIcon && (
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{label}</span>
        </button>
    );
}
