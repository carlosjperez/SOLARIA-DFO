import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * ContentGroup Props Interface
 */
export interface ContentGroupProps {
    /** Group content */
    children: ReactNode;

    /** Optional group title/heading */
    title?: string;

    /** Optional subtitle/description */
    subtitle?: string;

    /** Title heading level (default: 'h2') */
    titleLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    /** Optional actions to display in the header (e.g., buttons) */
    actions?: ReactNode;

    /** Additional CSS classes for the wrapper */
    className?: string;

    /** Additional CSS classes for the content area */
    contentClassName?: string;

    /** Spacing between title and content (default: 'md') */
    spacing?: 'sm' | 'md' | 'lg';

    /** Accessible label for the group */
    ariaLabel?: string;
}

/**
 * ContentGroup Component
 *
 * Wrapper component for grouping related content with an optional title and actions.
 * Provides consistent spacing and layout patterns for content sections.
 *
 * **Use Cases:**
 * - Grouping cards in a section (e.g., "Recent Projects")
 * - Organizing dashboard widgets
 * - Separating different content types on a page
 * - Creating titled sections with actions (e.g., "See All")
 *
 * @example Basic usage with title
 * ```tsx
 * <ContentGroup title="Active Projects">
 *   <ContentGrid>
 *     <ProjectCard project={project1} />
 *     <ProjectCard project={project2} />
 *   </ContentGrid>
 * </ContentGroup>
 * ```
 *
 * @example With title and actions
 * ```tsx
 * <ContentGroup
 *   title="Recent Tasks"
 *   subtitle="Your most recently updated tasks"
 *   actions={
 *     <Button variant="outline" size="sm">
 *       View All
 *     </Button>
 *   }
 * >
 *   <TaskList tasks={recentTasks} />
 * </ContentGroup>
 * ```
 *
 * @example Without title (just spacing)
 * ```tsx
 * <ContentGroup>
 *   <StatsGrid stats={stats} />
 * </ContentGroup>
 * ```
 *
 * @example Custom spacing
 * ```tsx
 * <ContentGroup title="Settings" spacing="lg">
 *   <SettingsForm />
 * </ContentGroup>
 * ```
 */
export function ContentGroup({
    children,
    title,
    subtitle,
    titleLevel = 'h2',
    actions,
    className,
    contentClassName,
    spacing = 'md',
    ariaLabel,
}: ContentGroupProps) {
    const TitleTag = titleLevel;

    // Spacing mapping
    const spacingStyles = {
        'sm': 'space-y-3',
        'md': 'space-y-4',
        'lg': 'space-y-6',
    };

    // Title size mapping based on heading level
    const titleSizeStyles = {
        'h1': 'text-3xl font-bold',
        'h2': 'text-2xl font-bold',
        'h3': 'text-xl font-semibold',
        'h4': 'text-lg font-semibold',
        'h5': 'text-base font-semibold',
        'h6': 'text-sm font-semibold',
    };

    return (
        <section
            className={cn(
                'w-full',
                spacingStyles[spacing],
                className
            )}
            aria-label={ariaLabel || title}
        >
            {/* Header (Title + Actions) */}
            {(title || actions) && (
                <div className="flex items-start justify-between gap-4">
                    {/* Title and Subtitle */}
                    {title && (
                        <div className="space-y-1">
                            <TitleTag className={cn(
                                titleSizeStyles[titleLevel],
                                'text-foreground'
                            )}>
                                {title}
                            </TitleTag>
                            {subtitle && (
                                <p className="text-sm text-muted-foreground">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    {actions && (
                        <div className="shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className={cn('w-full', contentClassName)}>
                {children}
            </div>
        </section>
    );
}
