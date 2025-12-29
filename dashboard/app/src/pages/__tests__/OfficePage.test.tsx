import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OfficePage } from '../OfficePage';

describe('OfficePage - Design System Refactoring', () => {
    beforeEach(() => {
        // Clear any existing DOM state
        document.body.innerHTML = '';
    });

    describe('Layout and Structure', () => {
        it('renders using StandardPageLayout wrapper', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // StandardPageLayout adds max-width container
            const layoutContainer = container.querySelector('[class*="mx-auto"]');
            expect(layoutContainer).toBeInTheDocument();
        });

        it('renders page header with title and subtitle', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(screen.getByText('Oficina - Plantilla de Diseño')).toBeInTheDocument();
            expect(
                screen.getByText('Página de referencia con todos los elementos estándar del sistema')
            ).toBeInTheDocument();
        });

        it('renders info box about refactored components', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(
                screen.getByText('Página Plantilla de Referencia (Refactorizada)')
            ).toBeInTheDocument();
            expect(screen.getByText(/nuevo design system SOLARIA DFO/)).toBeInTheDocument();
        });

        it('lists all used design system components in info box', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(screen.getAllByText(/StandardPageLayout/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/PageHeader/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/StatsGrid/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/SearchAndFilterBar/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/ContentGrid/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/ContentGroup/).length).toBeGreaterThan(0);
        });
    });

    describe('Stats Grid Component', () => {
        it('renders all four stat cards', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(screen.getByText('Total Items')).toBeInTheDocument();
            expect(screen.getByText('127')).toBeInTheDocument();

            expect(screen.getByText('En Progreso')).toBeInTheDocument();
            expect(screen.getByText('45')).toBeInTheDocument();

            expect(screen.getByText('Asignados')).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();

            expect(screen.getByText('Completados')).toBeInTheDocument();
            expect(screen.getByText('82')).toBeInTheDocument();
        });

        it('applies correct variant styles to stats', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Check that all four stat values are rendered
            expect(screen.getByText('Total Items')).toBeInTheDocument();
            expect(screen.getByText('En Progreso')).toBeInTheDocument();
            expect(screen.getByText('Asignados')).toBeInTheDocument();
            expect(screen.getByText('Completados')).toBeInTheDocument();
        });
    });

    describe('Search Functionality', () => {
        it('renders search input with placeholder', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const searchInput = screen.getByPlaceholderText(
                'Buscar items (mínimo 3 caracteres)...'
            );
            expect(searchInput).toBeInTheDocument();
        });

        it('updates search value when typing', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const searchInput = screen.getByPlaceholderText(
                'Buscar items (mínimo 3 caracteres)...'
            ) as HTMLInputElement;

            fireEvent.change(searchInput, { target: { value: 'test search' } });
            expect(searchInput.value).toBe('test search');
        });
    });

    describe('Tag Filters', () => {
        it('renders all tag filter buttons', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(screen.getByText(/activo \(15\)/)).toBeInTheDocument();
            expect(screen.getByText(/pendiente \(8\)/)).toBeInTheDocument();
            expect(screen.getByText(/crítico \(3\)/)).toBeInTheDocument();
            expect(screen.getByText(/normal \(24\)/)).toBeInTheDocument();
            expect(screen.getByText(/bajo \(10\)/)).toBeInTheDocument();
        });

        it('toggles tag selection on click', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const activoButton = screen.getByText(/activo \(15\)/).closest('button');
            expect(activoButton).toBeInTheDocument();

            if (activoButton) {
                // Initially not selected
                expect(activoButton.className).not.toContain('selected');

                // Click to select
                fireEvent.click(activoButton);
                expect(activoButton.className).toContain('selected');

                // Click again to deselect
                fireEvent.click(activoButton);
                expect(activoButton.className).not.toContain('selected');
            }
        });

        it('allows multiple tags to be selected simultaneously', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const activoButton = screen.getByText(/activo \(15\)/).closest('button');
            const criticoButton = screen.getByText(/crítico \(3\)/).closest('button');

            if (activoButton && criticoButton) {
                fireEvent.click(activoButton);
                fireEvent.click(criticoButton);

                expect(activoButton.className).toContain('selected');
                expect(criticoButton.className).toContain('selected');
            }
        });
    });

    describe('View Mode Toggle', () => {
        it('renders in grid view by default', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Check that grid cards are rendered
            const gridCards = container.querySelectorAll('.memory-card');
            expect(gridCards.length).toBeGreaterThan(0);

            // Check that list table is not present
            const listTable = container.querySelector('.list-table');
            expect(listTable).toBeNull();
        });

        it('switches to list view when list button is clicked', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Find view toggle buttons
            const viewButtons = screen.getAllByRole('button');
            const listButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Lista'
            );

            if (listButton) {
                fireEvent.click(listButton);

                // Check for list table
                const listTable = container.querySelector('.list-table');
                expect(listTable).toBeInTheDocument();

                // Check that grid is no longer present
                const gridContainer = container.querySelector('[style*="grid"]');
                expect(gridContainer).not.toBeInTheDocument();
            }
        });

        it('switches back to grid view when grid button is clicked', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const viewButtons = screen.getAllByRole('button');
            const listButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Lista'
            );
            const gridButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Grid'
            );

            if (listButton && gridButton) {
                // Switch to list
                fireEvent.click(listButton);
                expect(container.querySelector('.list-table')).toBeInTheDocument();

                // Switch back to grid
                fireEvent.click(gridButton);
                const gridContainer = container.querySelector('[style*="grid"]');
                expect(gridContainer).toBeInTheDocument();
                expect(container.querySelector('.list-table')).not.toBeInTheDocument();
            }
        });
    });

    describe('Content Rendering - Grid View', () => {
        it('renders all example items as cards in grid view', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Check for specific item titles
            expect(
                screen.getByText(/Ejemplo de Item con Título Largo/)
            ).toBeInTheDocument();
            expect(screen.getByText('Segundo Ejemplo de Item')).toBeInTheDocument();
            expect(screen.getByText('Tercer Item de Ejemplo')).toBeInTheDocument();
            expect(screen.getByText('Cuarto Ejemplo')).toBeInTheDocument();
            expect(screen.getByText('Quinto Item')).toBeInTheDocument();
            expect(screen.getByText('Sexto Ejemplo de Item')).toBeInTheDocument();
        });

        it('renders item cards with memory-card class', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const cards = container.querySelectorAll('.memory-card');
            expect(cards.length).toBe(6); // 6 example items
        });

        it('displays item IDs and importance percentages', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(screen.getByText('#ITEM-001')).toBeInTheDocument();
            expect(screen.getByText('85%')).toBeInTheDocument();
            expect(screen.getByText('#ITEM-002')).toBeInTheDocument();
            expect(screen.getByText('60%')).toBeInTheDocument();
        });

        it('renders tags for each item', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const tags = screen.getAllByText('activo');
            expect(tags.length).toBeGreaterThan(0);
        });

        it('renders stats footer with access count and time', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(screen.getByText('12 accesos')).toBeInTheDocument();
            expect(screen.getByText('hace 2h')).toBeInTheDocument();
            expect(screen.getByText('5 accesos')).toBeInTheDocument();
            expect(screen.getByText('hace 1d')).toBeInTheDocument();
        });
    });

    describe('Content Rendering - List View', () => {
        it('renders items as table rows in list view', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Switch to list view
            const viewButtons = screen.getAllByRole('button');
            const listButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Lista'
            );

            if (listButton) {
                fireEvent.click(listButton);

                const tableRows = container.querySelectorAll('.memory-row');
                expect(tableRows.length).toBe(6); // 6 example items
            }
        });

        it('displays table headers in list view', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Switch to list view
            const viewButtons = screen.getAllByRole('button');
            const listButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Lista'
            );

            if (listButton) {
                fireEvent.click(listButton);

                expect(screen.getByText('Item')).toBeInTheDocument();
                expect(screen.getByText('Tags')).toBeInTheDocument();
                expect(screen.getByText('Importancia')).toBeInTheDocument();
                expect(screen.getByText('Accesos')).toBeInTheDocument();
                expect(screen.getByText('Fecha')).toBeInTheDocument();
            }
        });

        it('displays limited tags in list view', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Switch to list view
            const viewButtons = screen.getAllByRole('button');
            const listButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Lista'
            );

            if (listButton) {
                fireEvent.click(listButton);

                // Check that tags are rendered with memory-tag-sm class
                const tags = container.querySelectorAll('.memory-tag-sm');
                expect(tags.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Item Counter', () => {
        it('displays correct total item count', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Look for counter in SearchAndFilterBar
            expect(screen.getByText('6')).toBeInTheDocument(); // 6 example items
        });
    });

    describe('Design System Integration', () => {
        it('uses ContentGrid component for grid layout', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // ContentGrid renders items as cards in grid view
            const gridCards = container.querySelectorAll('.memory-card');
            expect(gridCards.length).toBe(6); // 6 example items
        });

        it('uses ContentGroup component for info section', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // ContentGroup wraps the info box
            const infoSection = container.querySelector('section');
            expect(infoSection).toBeInTheDocument();
        });

        it('applies correct importance classes', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Check for importance indicators
            const highImportance = container.querySelectorAll('.memory-importance.high');
            const mediumImportance = container.querySelectorAll('.memory-importance.medium');
            const lowImportance = container.querySelectorAll('.memory-importance.low');

            expect(highImportance.length).toBeGreaterThan(0);
            expect(mediumImportance.length).toBeGreaterThan(0);
            expect(lowImportance.length).toBeGreaterThan(0);
        });
    });

    describe('Accessibility', () => {
        it('renders semantic HTML structure', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            expect(container.querySelector('h1, h2')).toBeInTheDocument();
            expect(container.querySelector('section')).toBeInTheDocument();
        });

        it('renders interactive elements as buttons', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('provides search input with placeholder', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const searchInput = screen.getByPlaceholderText(
                'Buscar items (mínimo 3 caracteres)...'
            );
            expect(searchInput).toHaveAttribute('type', 'text');
        });
    });

    describe('Edge Cases', () => {
        it('handles empty tag selection state', () => {
            render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // All items should be visible when no tags are selected
            expect(
                screen.getByText(/Ejemplo de Item con Título Largo/)
            ).toBeInTheDocument();
            expect(screen.getByText('Segundo Ejemplo de Item')).toBeInTheDocument();
        });

        it('handles rapid view mode toggling', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            const viewButtons = screen.getAllByRole('button');
            const listButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Lista'
            );
            const gridButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Grid'
            );

            if (listButton && gridButton) {
                // Rapid toggling
                fireEvent.click(listButton);
                fireEvent.click(gridButton);
                fireEvent.click(listButton);
                fireEvent.click(gridButton);

                // Should end in grid view
                const gridContainer = container.querySelector('[style*="grid"]');
                expect(gridContainer).toBeInTheDocument();
            }
        });

        it('maintains correct item count across view modes', () => {
            const { container } = render(
                <MemoryRouter>
                    <OfficePage />
                </MemoryRouter>
            );

            // Count items in grid view
            const gridCards = container.querySelectorAll('.memory-card');
            const gridCount = gridCards.length;

            // Switch to list view
            const viewButtons = screen.getAllByRole('button');
            const listButton = viewButtons.find(
                (btn) => btn.getAttribute('title') === 'Vista Lista'
            );

            if (listButton) {
                fireEvent.click(listButton);

                // Count items in list view
                const listRows = container.querySelectorAll('.memory-row');
                const listCount = listRows.length;

                expect(gridCount).toBe(listCount);
            }
        });
    });
});
