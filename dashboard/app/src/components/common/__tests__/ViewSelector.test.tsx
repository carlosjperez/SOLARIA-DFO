import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSelector } from '@/components/common/ViewSelector';

describe('ViewSelector', () => {
    describe('basic rendering', () => {
        it('renders grid and list buttons', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
            expect(screen.getByLabelText('List view')).toBeInTheDocument();
        });

        it('has group role for accessibility', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            expect(screen.getByRole('group')).toBeInTheDocument();
        });

        it('has default aria-label', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            expect(screen.getByLabelText('Toggle view mode')).toBeInTheDocument();
        });

        it('applies custom aria-label', () => {
            render(
                <ViewSelector
                    value="grid"
                    onChange={() => {}}
                    ariaLabel="Change content view"
                />
            );

            expect(screen.getByLabelText('Change content view')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(
                <ViewSelector
                    value="grid"
                    onChange={() => {}}
                    className="custom-class"
                />
            );

            const group = screen.getByRole('group');
            expect(group).toHaveClass('custom-class');
        });
    });

    describe('active state', () => {
        it('marks grid button as pressed when grid view active', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            const listButton = screen.getByLabelText('List view');

            expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            expect(listButton).toHaveAttribute('aria-pressed', 'false');
        });

        it('marks list button as pressed when list view active', () => {
            render(
                <ViewSelector value="list" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            const listButton = screen.getByLabelText('List view');

            expect(gridButton).toHaveAttribute('aria-pressed', 'false');
            expect(listButton).toHaveAttribute('aria-pressed', 'true');
        });

        it('applies active styles to grid button when selected', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            expect(gridButton).toHaveClass('bg-brand');
            expect(gridButton).toHaveClass('text-white');
        });

        it('applies active styles to list button when selected', () => {
            render(
                <ViewSelector value="list" onChange={() => {}} />
            );

            const listButton = screen.getByLabelText('List view');
            expect(listButton).toHaveClass('bg-brand');
            expect(listButton).toHaveClass('text-white');
        });

        it('applies inactive styles to non-selected button', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const listButton = screen.getByLabelText('List view');
            expect(listButton).toHaveClass('text-muted-foreground');
        });
    });

    describe('user interaction', () => {
        it('calls onChange with "grid" when grid button clicked', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <ViewSelector value="list" onChange={handleChange} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            await user.click(gridButton);

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith('grid');
        });

        it('calls onChange with "list" when list button clicked', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <ViewSelector value="grid" onChange={handleChange} />
            );

            const listButton = screen.getByLabelText('List view');
            await user.click(listButton);

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith('list');
        });

        it('calls onChange when clicking already active button', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <ViewSelector value="grid" onChange={handleChange} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            await user.click(gridButton);

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith('grid');
        });

        it('has button type to prevent form submission', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            const listButton = screen.getByLabelText('List view');

            expect(gridButton).toHaveAttribute('type', 'button');
            expect(listButton).toHaveAttribute('type', 'button');
        });
    });

    describe('keyboard navigation', () => {
        it('supports focus on grid button', async () => {
            const user = userEvent.setup();

            render(
                <ViewSelector value="list" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            await user.tab();

            expect(gridButton).toHaveFocus();
        });

        it('supports tab navigation between buttons', async () => {
            const user = userEvent.setup();

            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            const listButton = screen.getByLabelText('List view');

            await user.tab();
            expect(gridButton).toHaveFocus();

            await user.tab();
            expect(listButton).toHaveFocus();
        });

        it('activates button on Enter key', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <ViewSelector value="grid" onChange={handleChange} />
            );

            const listButton = screen.getByLabelText('List view');
            listButton.focus();
            await user.keyboard('{Enter}');

            expect(handleChange).toHaveBeenCalledWith('list');
        });

        it('activates button on Space key', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <ViewSelector value="grid" onChange={handleChange} />
            );

            const listButton = screen.getByLabelText('List view');
            listButton.focus();
            await user.keyboard(' ');

            expect(handleChange).toHaveBeenCalledWith('list');
        });
    });

    describe('icons', () => {
        it('renders LayoutGrid icon in grid button', () => {
            const { container } = render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            const icon = gridButton.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('lucide-layout-grid');
        });

        it('renders List icon in list button', () => {
            const { container } = render(
                <ViewSelector value="list" onChange={() => {}} />
            );

            const listButton = screen.getByLabelText('List view');
            const icon = listButton.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('lucide-list');
        });

        it('hides icons from screen readers with aria-hidden', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            const icon = gridButton.querySelector('svg');

            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('responsive behavior', () => {
        it('hides text labels on mobile with sm:inline class', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            const gridButton = screen.getByLabelText('Grid view');
            const textSpan = gridButton.querySelector('span');

            expect(textSpan).toHaveClass('hidden');
            expect(textSpan).toHaveClass('sm:inline');
        });

        it('renders "Grid" text label', () => {
            render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            expect(screen.getByText('Grid')).toBeInTheDocument();
        });

        it('renders "List" text label', () => {
            render(
                <ViewSelector value="list" onChange={() => {}} />
            );

            expect(screen.getByText('List')).toBeInTheDocument();
        });
    });

    describe('controlled component behavior', () => {
        it('reflects external value changes', () => {
            const { rerender } = render(
                <ViewSelector value="grid" onChange={() => {}} />
            );

            expect(screen.getByLabelText('Grid view')).toHaveAttribute('aria-pressed', 'true');

            rerender(
                <ViewSelector value="list" onChange={() => {}} />
            );

            expect(screen.getByLabelText('List view')).toHaveAttribute('aria-pressed', 'true');
            expect(screen.getByLabelText('Grid view')).toHaveAttribute('aria-pressed', 'false');
        });
    });
});
