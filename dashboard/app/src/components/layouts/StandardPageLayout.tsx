import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * StandardPageLayout Props Interface
 */
export interface StandardPageLayoutProps {
    /** Page content (PageHeader, StatsGrid, SearchAndFilterBar, ContentGrid, etc.) */
    children: ReactNode;

    /** Maximum content width variant */
    maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl';

    /** Additional CSS classes */
    className?: string;

    /** Background color variant */
    background?: 'default' | 'muted' | 'card';

    /** Remove default padding (for full-bleed layouts) */
    noPadding?: boolean;
}

/**
 * StandardPageLayout Component
 *
 * Base layout wrapper for all dashboard pages. Provides consistent spacing,
 * max-width constraints, and responsive behavior. All page content should
 * be wrapped in this component.
 *
 * @example
 * ```tsx
 * <StandardPageLayout maxWidth="7xl">
 *   <PageHeader
 *     title="Projects"
 *     subtitle="Manage your active projects"
 *   />
 *   <StatsGrid stats={projectStats} />
 *   <SearchAndFilterBar>
 *     <SearchInput value={search} onChange={setSearch} />
 *     <ViewSelector value={view} onChange={setView} />
 *   </SearchAndFilterBar>
 *   <ContentGrid>
 *     {projects.map(project => (
 *       <ProjectCard key={project.id} project={project} />
 *     ))}
 *   </ContentGrid>
 * </StandardPageLayout>
 * ```
 *
 * @example Full-width layout
 * ```tsx
 * <StandardPageLayout maxWidth="full" background="muted">
 *   <DashboardWidgets />
 * </StandardPageLayout>
 * ```
 *
 * @example Custom layout with no padding
 * ```tsx
 * <StandardPageLayout noPadding>
 *   <CustomFullBleedComponent />
 * </StandardPageLayout>
 * ```
 */
export function StandardPageLayout({
    children,
    maxWidth = '7xl',
    className,
    background = 'default',
    noPadding = false,
}: StandardPageLayoutProps) {
    // Max-width mapping usando Tailwind classes
    const maxWidthStyles = {
        'full': 'max-w-full',
        '7xl': 'max-w-7xl',
        '6xl': 'max-w-6xl',
        '5xl': 'max-w-5xl',
        '4xl': 'max-w-4xl',
    };

    // Background variant mapping
    const backgroundStyles = {
        'default': 'bg-background',
        'muted': 'bg-muted/30',
        'card': 'bg-card',
    };

    return (
        <div
            className={cn(
                // Base layout
                'min-h-screen',
                backgroundStyles[background],
                className
            )}
            role="main"
        >
            <div
                className={cn(
                    // Container con max-width
                    'mx-auto w-full',
                    maxWidthStyles[maxWidth],

                    // Padding responsivo usando design tokens
                    !noPadding && [
                        'px-[var(--page-padding-x)]',
                        'py-[var(--page-padding-y)]',
                    ]
                )}
            >
                {children}
            </div>
        </div>
    );
}
