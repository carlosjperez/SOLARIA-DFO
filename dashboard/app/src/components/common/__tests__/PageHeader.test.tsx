import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PageHeader } from '../PageHeader';

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PageHeader', () => {
    it('renders title and subtitle', () => {
        renderWithRouter(
            <PageHeader
                title="Dashboard"
                subtitle="Vista ejecutiva del estado"
            />
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Vista ejecutiva del estado')).toBeInTheDocument();
    });

    it('renders breadcrumbs when provided', () => {
        renderWithRouter(
            <PageHeader
                title="Project Details"
                breadcrumbs={[
                    { label: 'Home', to: '/' },
                    { label: 'Projects', to: '/projects' },
                    { label: 'Current', to: '/projects/1' }
                ]}
            />
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('renders back button when provided', () => {
        renderWithRouter(
            <PageHeader
                title="Archived Projects"
                backButton={{ to: '/projects', label: 'Volver' }}
            />
        );

        const backButton = screen.getByLabelText('Volver');
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveAttribute('href', '/projects');
    });

    it('renders actions when provided', () => {
        renderWithRouter(
            <PageHeader
                title="Dashboard"
                actions={<button>Action Button</button>}
            />
        );

        expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
        renderWithRouter(
            <PageHeader title="Test Page" />
        );

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Test Page');
    });

    it('has breadcrumb navigation with proper ARIA', () => {
        renderWithRouter(
            <PageHeader
                title="Test"
                breadcrumbs={[
                    { label: 'Home', to: '/' },
                    { label: 'Page', to: '/page' }
                ]}
            />
        );

        const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
        expect(nav).toBeInTheDocument();
    });

    it('mobile menu has proper ARIA attributes', () => {
        renderWithRouter(
            <PageHeader
                title="Test"
                breadcrumbs={[{ label: 'Home', to: '/' }]}
            />
        );

        const menuButton = screen.getByLabelText(/open menu/i);
        expect(menuButton).toHaveAttribute('aria-expanded');
    });
});
