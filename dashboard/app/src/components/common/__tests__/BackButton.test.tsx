import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackButton } from '@/components/common/BackButton';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('BackButton', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    describe('basic rendering', () => {
        it('renders with default label "Back"', () => {
            render(<BackButton />);

            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('renders with custom label', () => {
            render(<BackButton label="Go Back" />);

            expect(screen.getByText('Go Back')).toBeInTheDocument();
        });

        it('has button type to prevent form submission', () => {
            render(<BackButton />);

            const button = screen.getByRole('button', { name: 'Back' });
            expect(button).toHaveAttribute('type', 'button');
        });

        it('has aria-label matching the label', () => {
            render(<BackButton label="Return to Dashboard" />);

            expect(screen.getByLabelText('Return to Dashboard')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(<BackButton className="custom-class" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
        });
    });

    describe('icon rendering', () => {
        it('shows ArrowLeft icon by default', () => {
            render(<BackButton />);

            const button = screen.getByRole('button');
            const icon = button.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('lucide-arrow-left');
        });

        it('hides icon when showIcon is false', () => {
            render(<BackButton showIcon={false} />);

            const button = screen.getByRole('button');
            const icon = button.querySelector('svg');

            expect(icon).not.toBeInTheDocument();
        });

        it('icon has aria-hidden for accessibility', () => {
            render(<BackButton />);

            const icon = screen.getByRole('button').querySelector('svg');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('navigation behavior', () => {
        it('navigates back in history by default', async () => {
            const user = userEvent.setup();
            render(<BackButton />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });

        it('navigates to specific route when "to" prop provided', async () => {
            const user = userEvent.setup();
            render(<BackButton to="/dashboard" />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });

        it('calls custom onClick handler when provided', async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(<BackButton onClick={handleClick} />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(handleClick).toHaveBeenCalledTimes(1);
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('custom onClick overrides "to" navigation', async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(<BackButton to="/dashboard" onClick={handleClick} />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(handleClick).toHaveBeenCalledTimes(1);
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('variant styles', () => {
        it('applies default variant styles by default', () => {
            render(<BackButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-card');
            expect(button).toHaveClass('border');
            expect(button).toHaveClass('border-border');
        });

        it('applies ghost variant styles', () => {
            render(<BackButton variant="ghost" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('text-muted-foreground');
            expect(button).not.toHaveClass('bg-card');
            expect(button).not.toHaveClass('border');
        });

        it('applies text variant styles', () => {
            render(<BackButton variant="text" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('text-muted-foreground');
            expect(button).not.toHaveClass('bg-card');
            expect(button).not.toHaveClass('border');
            expect(button).not.toHaveClass('px-3');
        });

        it('preserves core classes across variants', () => {
            const variants: Array<'default' | 'ghost' | 'text'> = ['default', 'ghost', 'text'];

            variants.forEach(variant => {
                const { unmount } = render(<BackButton variant={variant} />);

                const button = screen.getByRole('button');
                expect(button).toHaveClass('inline-flex');
                expect(button).toHaveClass('items-center');

                unmount();
            });
        });
    });

    describe('keyboard navigation', () => {
        it('can be focused with keyboard', async () => {
            const user = userEvent.setup();
            render(<BackButton />);

            const button = screen.getByRole('button');
            await user.tab();

            expect(button).toHaveFocus();
        });

        it('activates on Enter key', async () => {
            const user = userEvent.setup();
            render(<BackButton />);

            const button = screen.getByRole('button');
            button.focus();
            await user.keyboard('{Enter}');

            expect(mockNavigate).toHaveBeenCalledTimes(1);
        });

        it('activates on Space key', async () => {
            const user = userEvent.setup();
            render(<BackButton />);

            const button = screen.getByRole('button');
            button.focus();
            await user.keyboard(' ');

            expect(mockNavigate).toHaveBeenCalledTimes(1);
        });
    });

    describe('accessibility', () => {
        it('has proper focus-visible ring', () => {
            render(<BackButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('focus-visible:outline-none');
            expect(button).toHaveClass('focus-visible:ring-2');
            expect(button).toHaveClass('focus-visible:ring-brand');
        });

        it('provides clear button role', () => {
            render(<BackButton label="Back to Home" />);

            expect(screen.getByRole('button', { name: 'Back to Home' })).toBeInTheDocument();
        });
    });

    describe('real-world use cases', () => {
        it('renders breadcrumb-style back button', () => {
            render(
                <BackButton
                    to="/projects"
                    label="Back to Projects"
                    variant="text"
                />
            );

            expect(screen.getByText('Back to Projects')).toBeInTheDocument();
        });

        it('renders page header back button', () => {
            render(
                <BackButton
                    label="Dashboard"
                    to="/dashboard"
                />
            );

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });

        it('renders modal cancel button', async () => {
            const user = userEvent.setup();
            const handleClose = vi.fn();

            render(
                <BackButton
                    label="Cancel"
                    onClick={handleClose}
                    variant="ghost"
                />
            );

            await user.click(screen.getByRole('button'));
            expect(handleClose).toHaveBeenCalled();
        });
    });

    describe('visual feedback', () => {
        it('includes hover state classes for default variant', () => {
            render(<BackButton />);

            const button = screen.getByRole('button');
            expect(button.className).toContain('hover:bg-muted/50');
        });

        it('includes active scale effect for default variant', () => {
            render(<BackButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('active:scale-[0.98]');
        });

        it('includes transition classes', () => {
            render(<BackButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('transition-all');
            expect(button).toHaveClass('duration-[var(--transition-normal)]');
        });
    });
});
