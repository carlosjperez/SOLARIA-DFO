import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemCounter } from '../ItemCounter';

describe('ItemCounter', () => {
    it('renders singular label when count is 1', () => {
        render(
            <ItemCounter
                count={1}
                singularLabel="proyecto"
                pluralLabel="proyectos"
            />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('proyecto')).toBeInTheDocument();
    });

    it('renders plural label when count is 0', () => {
        render(
            <ItemCounter
                count={0}
                singularLabel="tarea"
                pluralLabel="tareas"
            />
        );

        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('tareas')).toBeInTheDocument();
    });

    it('renders plural label when count is greater than 1', () => {
        render(
            <ItemCounter
                count={5}
                singularLabel="agente"
                pluralLabel="agentes"
            />
        );

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('agentes')).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
        render(
            <ItemCounter
                count={10}
                singularLabel="item"
                pluralLabel="items"
            />
        );

        const counter = screen.getByRole('status');
        expect(counter).toHaveAttribute('aria-label', '10 items');
    });

    it('applies custom className', () => {
        render(
            <ItemCounter
                count={3}
                singularLabel="file"
                pluralLabel="files"
                className="custom-counter"
            />
        );

        const counter = screen.getByRole('status');
        expect(counter).toHaveClass('custom-counter');
    });

    it('updates when count changes', () => {
        const { rerender } = render(
            <ItemCounter
                count={1}
                singularLabel="proyecto"
                pluralLabel="proyectos"
            />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('proyecto')).toBeInTheDocument();

        rerender(
            <ItemCounter
                count={5}
                singularLabel="proyecto"
                pluralLabel="proyectos"
            />
        );

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('proyectos')).toBeInTheDocument();
    });

    it('uses default labels when not provided', () => {
        render(<ItemCounter count={2} />);

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('items')).toBeInTheDocument();
    });

    it('formats large numbers with locale string', () => {
        render(
            <ItemCounter
                count={1000}
                singularLabel="result"
                pluralLabel="results"
            />
        );

        // toLocaleString formats 1000 as "1,000" in en-US
        expect(screen.getByText(/1,000|1.000/)).toBeInTheDocument();
    });

    it('supports custom aria-label', () => {
        render(
            <ItemCounter
                count={42}
                singularLabel="result"
                pluralLabel="results"
                ariaLabel="Custom label for screen readers"
            />
        );

        const counter = screen.getByRole('status');
        expect(counter).toHaveAttribute('aria-label', 'Custom label for screen readers');
    });
});
