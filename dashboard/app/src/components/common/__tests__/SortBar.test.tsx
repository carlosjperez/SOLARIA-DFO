import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortBar, type SortConfig, type SortOption } from '@/components/common/SortBar';

const mockOptions: SortOption[] = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date Created' },
    { value: 'priority', label: 'Priority' },
];

describe('SortBar', () => {
    describe('basic rendering', () => {
        it('renders select with options', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const select = screen.getByRole('combobox', { name: /sort field/i });
            expect(select).toBeInTheDocument();
            expect(select).toHaveValue('name');
        });

        it('renders all options in dropdown', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(screen.getByRole('option', { name: 'Name' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Date Created' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Priority' })).toBeInTheDocument();
        });

        it('renders direction toggle button', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(screen.getByRole('button', { name: /sort direction: ascending/i })).toBeInTheDocument();
        });

        it('shows ascending icon when direction is asc', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };
            const { container } = render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button', { name: /ascending/i });
            const icon = button.querySelector('.lucide-arrow-up');
            expect(icon).toBeInTheDocument();
        });

        it('shows descending icon when direction is desc', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'desc' };
            const { container } = render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button', { name: /descending/i });
            const icon = button.querySelector('.lucide-arrow-down');
            expect(icon).toBeInTheDocument();
        });

        it('has group role for accessibility', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(screen.getByRole('group', { name: /sort by/i })).toBeInTheDocument();
        });

        it('applies custom aria-label', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                    ariaLabel="Sort tasks"
                />
            );

            expect(screen.getByRole('group', { name: 'Sort tasks' })).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };
            const { container } = render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                    className="custom-class"
                />
            );

            const group = container.querySelector('.custom-class');
            expect(group).toBeInTheDocument();
        });
    });

    describe('field selection', () => {
        it('displays current field value', () => {
            const mockSort: SortConfig = { field: 'priority', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('priority');
        });

        it('calls onChange when field changes', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                />
            );

            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'date');

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith({
                field: 'date',
                direction: 'asc',
            });
        });

        it('preserves direction when field changes', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'desc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                />
            );

            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'priority');

            expect(handleChange).toHaveBeenCalledWith({
                field: 'priority',
                direction: 'desc', // Preserved
            });
        });

        it('updates value when prop changes', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };
            const { rerender } = render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            let select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('name');

            rerender(
                <SortBar
                    value={{ field: 'date', direction: 'asc' }}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('date');
        });
    });

    describe('direction toggle', () => {
        it('toggles from asc to desc when clicked', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button', { name: /ascending/i });
            await user.click(button);

            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith({
                field: 'name',
                direction: 'desc',
            });
        });

        it('toggles from desc to asc when clicked', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'desc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button', { name: /descending/i });
            await user.click(button);

            expect(handleChange).toHaveBeenCalledWith({
                field: 'name',
                direction: 'asc',
            });
        });

        it('preserves field when direction toggles', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'priority', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button');
            await user.click(button);

            expect(handleChange).toHaveBeenCalledWith({
                field: 'priority', // Preserved
                direction: 'desc',
            });
        });

        it('updates icon when direction changes', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };
            const { container, rerender } = render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(container.querySelector('.lucide-arrow-up')).toBeInTheDocument();
            expect(container.querySelector('.lucide-arrow-down')).not.toBeInTheDocument();

            rerender(
                <SortBar
                    value={{ field: 'name', direction: 'desc' }}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(container.querySelector('.lucide-arrow-up')).not.toBeInTheDocument();
            expect(container.querySelector('.lucide-arrow-down')).toBeInTheDocument();
        });
    });

    describe('disabled state', () => {
        it('disables select when disabled prop is true', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                    disabled
                />
            );

            const select = screen.getByRole('combobox');
            expect(select).toBeDisabled();
        });

        it('disables toggle button when disabled prop is true', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                    disabled
                />
            );

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('prevents onChange when disabled', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                    disabled
                />
            );

            const button = screen.getByRole('button');
            await user.click(button);

            expect(handleChange).not.toHaveBeenCalled();
        });

        it('applies disabled styles to select', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                    disabled
                />
            );

            const select = screen.getByRole('combobox');
            expect(select).toHaveClass('disabled:opacity-50');
            expect(select).toHaveClass('disabled:cursor-not-allowed');
        });

        it('applies disabled styles to button', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                    disabled
                />
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('disabled:opacity-50');
            expect(button).toHaveClass('disabled:cursor-not-allowed');
        });
    });

    describe('keyboard navigation', () => {
        it('select can be focused with tab', async () => {
            const user = userEvent.setup();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            await user.tab();

            const select = screen.getByRole('combobox');
            expect(select).toHaveFocus();
        });

        it('button can be focused with tab', async () => {
            const user = userEvent.setup();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            await user.tab(); // Focus select
            await user.tab(); // Focus button

            const button = screen.getByRole('button');
            expect(button).toHaveFocus();
        });

        it('button activates on Enter key', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button');
            button.focus();
            await user.keyboard('{Enter}');

            expect(handleChange).toHaveBeenCalledWith({
                field: 'name',
                direction: 'desc',
            });
        });

        it('button activates on Space key', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button');
            button.focus();
            await user.keyboard(' ');

            expect(handleChange).toHaveBeenCalledWith({
                field: 'name',
                direction: 'desc',
            });
        });
    });

    describe('accessibility', () => {
        it('has proper focus ring on select', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const select = screen.getByRole('combobox');
            expect(select).toHaveClass('focus:outline-none');
            expect(select).toHaveClass('focus:ring-2');
            expect(select).toHaveClass('focus:ring-brand');
        });

        it('has proper focus ring on button', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('focus-visible:outline-none');
            expect(button).toHaveClass('focus-visible:ring-2');
            expect(button).toHaveClass('focus-visible:ring-brand');
        });

        it('provides clear aria-label for direction button', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(screen.getByRole('button', { name: 'Sort direction: ascending' })).toBeInTheDocument();
        });

        it('updates aria-label when direction changes', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };
            const { rerender } = render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(screen.getByRole('button', { name: /ascending/i })).toBeInTheDocument();

            rerender(
                <SortBar
                    value={{ field: 'name', direction: 'desc' }}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            expect(screen.getByRole('button', { name: /descending/i })).toBeInTheDocument();
        });

        it('has sr-only label for select', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const label = screen.getByText('Sort field');
            expect(label).toHaveClass('sr-only');
        });

        it('icon has aria-hidden', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };
            const { container } = render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const icon = container.querySelector('.lucide-arrow-up');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('visual feedback', () => {
        it('includes hover state on select', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const select = screen.getByRole('combobox');
            expect(select.className).toContain('hover:border-muted-foreground/30');
        });

        it('includes hover state on button', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button');
            expect(button.className).toContain('hover:bg-muted/50');
        });

        it('includes transition classes', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const select = screen.getByRole('combobox');
            const button = screen.getByRole('button');

            expect(select).toHaveClass('transition-all');
            expect(select).toHaveClass('duration-[var(--transition-normal)]');
            expect(button).toHaveClass('transition-all');
            expect(button).toHaveClass('duration-[var(--transition-normal)]');
        });

        it('button has active scale effect', () => {
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={mockOptions}
                />
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('active:scale-[0.98]');
        });
    });

    describe('real-world use cases', () => {
        it('handles task sorting scenario', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();
            const mockSort: SortConfig = { field: 'name', direction: 'asc' };

            const taskOptions: SortOption[] = [
                { value: 'name', label: 'Task Name' },
                { value: 'priority', label: 'Priority' },
                { value: 'deadline', label: 'Deadline' },
            ];

            render(
                <SortBar
                    value={mockSort}
                    onChange={handleChange}
                    options={taskOptions}
                />
            );

            // Change to priority
            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'priority');

            expect(handleChange).toHaveBeenLastCalledWith({
                field: 'priority',
                direction: 'asc',
            });

            // Toggle to descending
            const button = screen.getByRole('button');
            await user.click(button);

            expect(handleChange).toHaveBeenLastCalledWith({
                field: 'name', // Would be priority in real app after re-render
                direction: 'desc',
            });
        });

        it('handles empty state gracefully', () => {
            const mockSort: SortConfig = { field: '', direction: 'asc' };

            render(
                <SortBar
                    value={mockSort}
                    onChange={() => {}}
                    options={[]}
                />
            );

            const select = screen.getByRole('combobox');
            expect(select).toBeInTheDocument();
            expect(select.children).toHaveLength(0);
        });
    });
});
