import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/store/ui';

// Wrap component with router for NavLink
const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Sidebar', () => {
    beforeEach(() => {
        useUIStore.setState({ sidebarOpen: true, theme: 'dark' });
    });

    it('renders navigation links', () => {
        renderWithRouter(<Sidebar />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Proyectos')).toBeInTheDocument();
        expect(screen.getByText('Negocios')).toBeInTheDocument();
        expect(screen.getByText('Infraestructura')).toBeInTheDocument();
        expect(screen.getByText('Memorias')).toBeInTheDocument();
    });

    it('shows logo when sidebar is open', () => {
        renderWithRouter(<Sidebar />);
        // Uses getAllByText since SOLARIA appears in both img alt and span text
        expect(screen.getAllByText(/SOLARIA/i).length).toBeGreaterThan(0);
        expect(screen.getByText('Digital Field Operations')).toBeInTheDocument();
    });

    it('hides text when sidebar is collapsed', () => {
        useUIStore.setState({ sidebarOpen: false });
        renderWithRouter(<Sidebar />);
        expect(screen.queryByText('SOLARIA')).not.toBeInTheDocument();
    });

    it('toggles sidebar on button click', () => {
        renderWithRouter(<Sidebar />);

        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
});
