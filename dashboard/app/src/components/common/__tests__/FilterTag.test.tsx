import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterTag } from '@/components/common/FilterTag';

describe('FilterTag', () => {

    describe('basic rendering', () => {
        it('renders with label', () => {
            render(<FilterTag label="Status: Active" onRemove={() => {}} />);

            expect(screen.getByText('Status: Active')).toBeInTheDocument();
        });

        it('renders remove button', () => {
            render(<FilterTag label="Test Filter" onRemove={() => {}} />);

            expect(screen.getByLabelText(/remove filter.*test filter/i)).toBeInTheDocument();
        });

        it('has role group with label', () => {
            render(<FilterTag label="Priority: High" onRemove={() => {}} />);

            expect(screen.getByRole('group', { name: 'Filter: Priority: High' })).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} className="custom-class" />
            );

            const tag = container.querySelector('.custom-class');
            expect(tag).toBeInTheDocument();
        });

        it('renders X icon in remove button', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} />
            );

            const icon = container.querySelector('.lucide-x');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('color variants', () => {
        it('applies default color by default', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('bg-muted', 'text-muted-foreground');
        });

        it('applies primary color variant', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} color="primary" />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('bg-brand/10', 'text-brand');
        });

        it('applies success color variant', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} color="success" />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('bg-green-500/10', 'text-green-700');
        });

        it('applies warning color variant', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} color="warning" />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('bg-amber-500/10', 'text-amber-700');
        });

        it('applies danger color variant', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} color="danger" />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('bg-red-500/10', 'text-red-700');
        });
    });

    describe('remove functionality', () => {
        it('calls onRemove when remove button clicked', async () => {
            const user = userEvent.setup();
            const handleRemove = vi.fn();

            render(<FilterTag label="Test Filter" onRemove={handleRemove} />);

            const removeButton = screen.getByLabelText(/remove filter.*test filter/i);
            await user.click(removeButton);

            expect(handleRemove).toHaveBeenCalledTimes(1);
        });

        it('does not call onRemove when disabled', async () => {
            const user = userEvent.setup();
            const handleRemove = vi.fn();

            render(<FilterTag label="Test" onRemove={handleRemove} disabled />);

            const removeButton = screen.getByLabelText(/remove filter/i);
            await user.click(removeButton);

            expect(handleRemove).not.toHaveBeenCalled();
        });
    });

    describe('disabled state', () => {
        it('disables remove button when disabled', () => {
            render(<FilterTag label="Test" onRemove={() => {}} disabled />);

            const removeButton = screen.getByLabelText(/remove filter/i);
            expect(removeButton).toBeDisabled();
        });

        it('applies opacity when disabled', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} disabled />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('opacity-50', 'cursor-not-allowed');
        });
    });

    describe('keyboard navigation', () => {
        it('remove button is focusable with tab', async () => {
            const user = userEvent.setup();
            render(<FilterTag label="Test" onRemove={() => {}} />);

            await user.tab();

            const removeButton = screen.getByLabelText(/remove filter/i);
            expect(removeButton).toHaveFocus();
        });

        it('activates remove with Enter key', async () => {
            const user = userEvent.setup();
            const handleRemove = vi.fn();

            render(<FilterTag label="Test" onRemove={handleRemove} />);

            const removeButton = screen.getByLabelText(/remove filter/i);
            removeButton.focus();
            await user.keyboard('{Enter}');

            expect(handleRemove).toHaveBeenCalledTimes(1);
        });

        it('activates remove with Space key', async () => {
            const user = userEvent.setup();
            const handleRemove = vi.fn();

            render(<FilterTag label="Test" onRemove={handleRemove} />);

            const removeButton = screen.getByLabelText(/remove filter/i);
            removeButton.focus();
            await user.keyboard(' ');

            expect(handleRemove).toHaveBeenCalledTimes(1);
        });
    });

    describe('accessibility', () => {
        it('has proper ARIA label for group', () => {
            render(<FilterTag label="Category: Books" onRemove={() => {}} />);

            expect(screen.getByRole('group', { name: 'Filter: Category: Books' })).toBeInTheDocument();
        });

        it('has proper ARIA label for remove button', () => {
            render(<FilterTag label="Status: Active" onRemove={() => {}} />);

            expect(screen.getByLabelText('Remove filter: Status: Active')).toBeInTheDocument();
        });

        it('uses custom removeLabel when provided', () => {
            render(
                <FilterTag
                    label="Test"
                    onRemove={() => {}}
                    removeLabel="Delete"
                />
            );

            expect(screen.getByLabelText('Delete: Test')).toBeInTheDocument();
        });

        it('icon is hidden from screen readers', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} />
            );

            const icon = container.querySelector('.lucide-x');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });

        it('has focus-visible styles', () => {
            render(<FilterTag label="Test" onRemove={() => {}} />);

            const removeButton = screen.getByLabelText(/remove filter/i);
            expect(removeButton).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-brand');
        });
    });

    describe('visual feedback', () => {
        it('has hover state on remove button', () => {
            render(<FilterTag label="Test" onRemove={() => {}} />);

            const removeButton = screen.getByLabelText(/remove filter/i);
            expect(removeButton.className).toContain('hover:bg-foreground/10');
        });

        it('has transition classes', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('transition-all');
        });

        it('has active scale animation on remove button', () => {
            render(<FilterTag label="Test" onRemove={() => {}} />);

            const removeButton = screen.getByLabelText(/remove filter/i);
            expect(removeButton.className).toContain('active:scale-90');
        });

        it('has rounded pill shape', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('rounded-full');
        });
    });

    describe('layout', () => {
        it('uses inline-flex for label and button', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('inline-flex', 'items-center');
        });

        it('has proper spacing between label and button', () => {
            const { container } = render(
                <FilterTag label="Test" onRemove={() => {}} />
            );

            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('gap-1.5');
        });

        it('label has whitespace-nowrap to prevent wrapping', () => {
            render(<FilterTag label="Very Long Filter Label That Should Not Wrap" onRemove={() => {}} />);

            const label = screen.getByText('Very Long Filter Label That Should Not Wrap');
            expect(label).toHaveClass('whitespace-nowrap');
        });
    });

    describe('real-world use cases', () => {
        it('handles status filter removal', async () => {
            const user = userEvent.setup();
            const handleRemove = vi.fn();

            render(
                <FilterTag
                    label="Status: Active"
                    onRemove={handleRemove}
                    color="success"
                />
            );

            const removeButton = screen.getByLabelText(/remove filter.*status: active/i);
            await user.click(removeButton);

            expect(handleRemove).toHaveBeenCalled();
        });

        it('handles priority filter with danger color', () => {
            const { container } = render(
                <FilterTag
                    label="Priority: Critical"
                    onRemove={() => {}}
                    color="danger"
                />
            );

            expect(screen.getByText('Priority: Critical')).toBeInTheDocument();
            const tag = container.querySelector('[role="group"]');
            expect(tag).toHaveClass('bg-red-500/10', 'text-red-700');
        });

        it('handles category filter with custom className', () => {
            const { container } = render(
                <FilterTag
                    label="Category: Development"
                    onRemove={() => {}}
                    className="mb-2"
                />
            );

            const tag = container.querySelector('.mb-2');
            expect(tag).toBeInTheDocument();
        });
    });
});
