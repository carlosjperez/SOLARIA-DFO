import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSelector } from '../ViewSelector';

describe('ViewSelector', () => {
    it('renders grid and list buttons', () => {
        render(
            <ViewSelector
                value="grid"
                onChange={vi.fn()}
            />
        );

        expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
        expect(screen.getByLabelText('List view')).toBeInTheDocument();
    });

    it('shows grid as pressed when value is grid', () => {
        render(
            <ViewSelector
                value="grid"
                onChange={vi.fn()}
            />
        );

        const gridButton = screen.getByLabelText('Grid view');
        const listButton = screen.getByLabelText('List view');

        expect(gridButton).toHaveAttribute('aria-pressed', 'true');
        expect(listButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows list as pressed when value is list', () => {
        render(
            <ViewSelector
                value="list"
                onChange={vi.fn()}
            />
        );

        const gridButton = screen.getByLabelText('Grid view');
        const listButton = screen.getByLabelText('List view');

        expect(gridButton).toHaveAttribute('aria-pressed', 'false');
        expect(listButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onChange with grid when grid button is clicked', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <ViewSelector
                value="list"
                onChange={handleChange}
            />
        );

        const gridButton = screen.getByLabelText('Grid view');
        await user.click(gridButton);

        expect(handleChange).toHaveBeenCalledWith('grid');
    });

    it('calls onChange with list when list button is clicked', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <ViewSelector
                value="grid"
                onChange={handleChange}
            />
        );

        const listButton = screen.getByLabelText('List view');
        await user.click(listButton);

        expect(handleChange).toHaveBeenCalledWith('list');
    });

    it('has proper group role with aria-label', () => {
        render(
            <ViewSelector
                value="grid"
                onChange={vi.fn()}
                ariaLabel="Toggle view mode"
            />
        );

        const group = screen.getByRole('group', { name: 'Toggle view mode' });
        expect(group).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <ViewSelector
                value="grid"
                onChange={handleChange}
            />
        );

        const listButton = screen.getByLabelText('List view');
        listButton.focus();
        await user.keyboard('{Enter}');

        expect(handleChange).toHaveBeenCalledWith('list');
    });

    it('applies custom className', () => {
        const { container } = render(
            <ViewSelector
                value="grid"
                onChange={vi.fn()}
                className="custom-selector"
            />
        );

        expect(container.querySelector('.custom-selector')).toBeInTheDocument();
    });
});
