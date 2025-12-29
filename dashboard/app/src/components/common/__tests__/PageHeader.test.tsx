import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PageHeader, type BreadcrumbItem } from '@/components/common/PageHeader';

// Wrapper for components that need Router
const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PageHeader', () => {
    describe('basic rendering', () => {
        it('renders with title only', () => {
            renderWithRouter(<PageHeader title="Test Page" />);

            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Page');
        });

        it('renders title and subtitle', () => {
            renderWithRouter(
                <PageHeader title="Projects" subtitle="24 active projects" />
            );

            expect(screen.getByRole('heading')).toHaveTextContent('Projects');
            expect(screen.getByText('24 active projects')).toBeInTheDocument();
        });

        it('has banner role for accessibility', () => {
            renderWithRouter(<PageHeader title="Test" />);

            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

        it('has aria-label for page header', () => {
            renderWithRouter(<PageHeader title="Test" />);

            expect(screen.getByLabelText('Page header')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = renderWithRouter(
                <PageHeader title="Test" className="custom-class" />
            );
            const header = screen.getByRole('banner');

            expect(header).toHaveClass('custom-class');
        });
    });

    describe('breadcrumbs', () => {
        it('renders breadcrumbs navigation', () => {
            const breadcrumbs: BreadcrumbItem[] = [
                { label: 'Home', to: '/' },
                { label: 'Projects', to: '/projects' },
                { label: 'Details' },
            ];

            renderWithRouter(<PageHeader title="Test" breadcrumbs={breadcrumbs} />);

            expect(screen.getByLabelText('Breadcrumb navigation')).toBeInTheDocument();
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Projects')).toBeInTheDocument();
            expect(screen.getByText('Details')).toBeInTheDocument();
        });

        it('renders breadcrumb links correctly', () => {
            const breadcrumbs: BreadcrumbItem[] = [
                { label: 'Home', to: '/' },
                { label: 'Current Page' },
            ];

            renderWithRouter(<PageHeader title="Test" breadcrumbs={breadcrumbs} />);

            const homeLink = screen.getByRole('link', { name: 'Home' });
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('marks last breadcrumb as current page', () => {
            const breadcrumbs: BreadcrumbItem[] = [
                { label: 'Home', to: '/' },
                { label: 'Current' },
            ];

            renderWithRouter(<PageHeader title="Test" breadcrumbs={breadcrumbs} />);

            const currentItem = screen.getByText('Current');
            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });

        it('does not render breadcrumbs when empty array', () => {
            renderWithRouter(<PageHeader title="Test" breadcrumbs={[]} />);

            expect(screen.queryByLabelText('Breadcrumb navigation')).not.toBeInTheDocument();
        });

        it('does not render breadcrumbs when undefined', () => {
            renderWithRouter(<PageHeader title="Test" />);

            expect(screen.queryByLabelText('Breadcrumb navigation')).not.toBeInTheDocument();
        });
    });

    describe('back button', () => {
        it('renders back button when provided', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    backButton={{ to: '/previous' }}
                />
            );

            const backButton = screen.getByLabelText(/Back to/);
            expect(backButton).toBeInTheDocument();
            expect(backButton).toHaveAttribute('href', '/previous');
        });

        it('renders custom back button label', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    backButton={{ to: '/previous', label: 'Return' }}
                />
            );

            expect(screen.getByText('Return')).toBeInTheDocument();
        });

        it('renders default back button label', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    backButton={{ to: '/previous' }}
                />
            );

            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('does not render back button when not provided', () => {
            renderWithRouter(<PageHeader title="Test" />);

            expect(screen.queryByText('Back')).not.toBeInTheDocument();
        });
    });

    describe('actions', () => {
        it('renders actions in desktop view', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    actions={
                        <button data-testid="test-action">New Project</button>
                    }
                />
            );

            // Actions should be present in desktop container
            expect(screen.getByTestId('test-action')).toBeInTheDocument();
        });

        it('shows mobile menu toggle button when actions present', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    actions={<button>Action</button>}
                />
            );

            expect(screen.getByLabelText('Toggle actions menu')).toBeInTheDocument();
        });

        it('does not show mobile menu toggle when no actions', () => {
            renderWithRouter(<PageHeader title="Test" />);

            expect(screen.queryByLabelText('Toggle actions menu')).not.toBeInTheDocument();
        });
    });

    describe('mobile menu interaction', () => {
        it('mobile menu is hidden by default', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    actions={<button>Action</button>}
                />
            );

            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('opens mobile menu when toggle clicked', async () => {
            const user = userEvent.setup();

            renderWithRouter(
                <PageHeader
                    title="Test"
                    actions={<button>Action</button>}
                />
            );

            const toggleButton = screen.getByLabelText('Toggle actions menu');
            await user.click(toggleButton);

            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        it('closes mobile menu when toggle clicked again', async () => {
            const user = userEvent.setup();

            renderWithRouter(
                <PageHeader
                    title="Test"
                    actions={<button>Action</button>}
                />
            );

            const toggleButton = screen.getByLabelText('Toggle actions menu');

            // Open menu
            await user.click(toggleButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();

            // Close menu
            await user.click(toggleButton);
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('toggle button has aria-expanded attribute', async () => {
            const user = userEvent.setup();

            renderWithRouter(
                <PageHeader
                    title="Test"
                    actions={<button>Action</button>}
                />
            );

            const toggleButton = screen.getByLabelText('Toggle actions menu');

            // Initially collapsed
            expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

            // After click, expanded
            await user.click(toggleButton);
            expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
        });

        it('toggle button has aria-controls attribute', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    actions={<button>Action</button>}
                />
            );

            const toggleButton = screen.getByLabelText('Toggle actions menu');
            expect(toggleButton).toHaveAttribute('aria-controls', 'mobile-actions-menu');
        });
    });

    describe('complex scenarios', () => {
        it('renders all features together', () => {
            const breadcrumbs: BreadcrumbItem[] = [
                { label: 'Dashboard', to: '/' },
                { label: 'Projects' },
            ];

            renderWithRouter(
                <PageHeader
                    title="Project Details"
                    subtitle="View and manage project"
                    breadcrumbs={breadcrumbs}
                    backButton={{ to: '/projects', label: 'All Projects' }}
                    actions={
                        <>
                            <button>Edit</button>
                            <button>Delete</button>
                        </>
                    }
                />
            );

            expect(screen.getByText('Project Details')).toBeInTheDocument();
            expect(screen.getByText('View and manage project')).toBeInTheDocument();
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('All Projects')).toBeInTheDocument();
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        it('handles long titles with truncation', () => {
            renderWithRouter(
                <PageHeader
                    title="This is a very long title that should be truncated to prevent overflow and maintain layout integrity"
                />
            );

            const heading = screen.getByRole('heading');
            expect(heading).toHaveClass('truncate');
        });

        it('handles long subtitles with truncation', () => {
            renderWithRouter(
                <PageHeader
                    title="Test"
                    subtitle="This is a very long subtitle that should also be truncated to prevent layout issues"
                />
            );

            const subtitle = screen.getByText(/This is a very long subtitle/);
            expect(subtitle).toHaveClass('truncate');
        });

        it('renders multiple breadcrumb items correctly', () => {
            const breadcrumbs: BreadcrumbItem[] = [
                { label: 'Home', to: '/' },
                { label: 'Category', to: '/category' },
                { label: 'Subcategory', to: '/category/sub' },
                { label: 'Item' },
            ];

            renderWithRouter(<PageHeader title="Test" breadcrumbs={breadcrumbs} />);

            const nav = screen.getByLabelText('Breadcrumb navigation');
            const list = within(nav).getByRole('list');
            const items = within(list).getAllByRole('listitem');

            expect(items).toHaveLength(4);
        });
    });
});
