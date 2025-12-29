import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Breadcrumb Item Interface
 */
export interface BreadcrumbItem {
    /** Display label for the breadcrumb */
    label: string;

    /** Optional link destination (if undefined, renders as text) */
    to?: string;
}

/**
 * PageHeader Props Interface
 */
export interface PageHeaderProps {
    /** Main page title */
    title: string;

    /** Optional subtitle or description */
    subtitle?: string;

    /** Action buttons or elements */
    actions?: ReactNode;

    /** Show back button with optional custom config */
    backButton?: {
        /** Destination path for back navigation */
        to: string;
        /** Optional custom label (default: "Back") */
        label?: string;
    };

    /** Breadcrumb navigation array */
    breadcrumbs?: BreadcrumbItem[];

    /** Additional CSS classes */
    className?: string;
}

/**
 * PageHeader Component
 *
 * Responsive page header with title, subtitle, actions, breadcrumbs, and back button.
 * On mobile, actions are collapsed into a dropdown menu.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Projects"
 *   subtitle="24 active projects"
 *   breadcrumbs={[
 *     { label: 'Dashboard', to: '/' },
 *     { label: 'Projects' }
 *   ]}
 *   actions={
 *     <button className="btn-primary">New Project</button>
 *   }
 * />
 * ```
 */
export function PageHeader({
    title,
    subtitle,
    actions,
    backButton,
    breadcrumbs,
    className,
}: PageHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header
            className={cn(
                'pb-[var(--spacing-lg)] mb-[var(--spacing-xl)]',
                'border-b border-border',
                className
            )}
            role="banner"
            aria-label="Page header"
        >
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav
                    className="mb-[var(--spacing-md)]"
                    aria-label="Breadcrumb navigation"
                >
                    <ol className="flex items-center gap-[var(--spacing-xs)] text-[var(--text-sm)] text-muted-foreground">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index} className="flex items-center gap-[var(--spacing-xs)]">
                                {index > 0 && (
                                    <ChevronRight
                                        className="h-4 w-4 flex-shrink-0"
                                        aria-hidden="true"
                                    />
                                )}
                                {crumb.to ? (
                                    <Link
                                        to={crumb.to}
                                        className="hover:text-foreground transition-colors truncate"
                                        aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span
                                        className="text-foreground font-medium truncate"
                                        aria-current="page"
                                    >
                                        {crumb.label}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Main Header Content */}
            <div className="flex items-start justify-between gap-[var(--spacing-md)]">
                {/* Left: Title and Subtitle */}
                <div className="flex-1 min-w-0">
                    {/* Back Button */}
                    {backButton && (
                        <Link
                            to={backButton.to}
                            className={cn(
                                'inline-flex items-center gap-2 mb-[var(--spacing-sm)]',
                                'text-[var(--text-sm)] text-muted-foreground',
                                'hover:text-foreground transition-colors'
                            )}
                            aria-label={`Back to ${backButton.label || 'previous page'}`}
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            <span>{backButton.label || 'Back'}</span>
                        </Link>
                    )}

                    <h1 className="text-[var(--text-3xl)] font-bold text-foreground truncate mb-[var(--spacing-xs)]">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-[var(--text-base)] text-muted-foreground truncate">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right: Actions (Desktop) */}
                {actions && (
                    <>
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-[var(--spacing-sm)]">
                            {actions}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={cn(
                                    'p-2 rounded-lg transition-colors',
                                    'hover:bg-muted active:bg-muted/80',
                                    'border border-border'
                                )}
                                aria-label="Toggle actions menu"
                                aria-expanded={mobileMenuOpen}
                                aria-controls="mobile-actions-menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Actions Dropdown */}
            {actions && mobileMenuOpen && (
                <div
                    id="mobile-actions-menu"
                    className={cn(
                        'md:hidden mt-[var(--spacing-md)]',
                        'p-[var(--spacing-md)] rounded-lg',
                        'bg-muted/50 border border-border',
                        'flex flex-col gap-[var(--spacing-sm)]'
                    )}
                    role="menu"
                >
                    {actions}
                </div>
            )}
        </header>
    );
}
