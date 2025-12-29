import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderOpen } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';

describe('StatCard', () => {
    it('renders with required props', () => {
        render(<StatCard title="Test Stat" value={42} />);

        expect(screen.getByText('Test Stat')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('formats numeric values with locale', () => {
        render(<StatCard title="Large Number" value={1234567} />);

        expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('renders string values as-is', () => {
        render(<StatCard title="Status" value="Active" />);

        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
        const { container } = render(
            <StatCard title="Projects" value={10} icon={FolderOpen} />
        );

        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });

    it('renders change indicator with up trend', () => {
        render(
            <StatCard
                title="Revenue"
                value={1000}
                change={{ value: 15, trend: 'up' }}
            />
        );

        expect(screen.getByText('↑')).toBeInTheDocument();
        expect(screen.getByText('15%')).toBeInTheDocument();
        expect(screen.getByLabelText(/incremento del 15%/i)).toBeInTheDocument();
    });

    it('renders change indicator with down trend', () => {
        render(
            <StatCard
                title="Errors"
                value={5}
                change={{ value: -20, trend: 'down' }}
            />
        );

        expect(screen.getByText('↓')).toBeInTheDocument();
        expect(screen.getByText('20%')).toBeInTheDocument();
        expect(screen.getByLabelText(/decremento del 20%/i)).toBeInTheDocument();
    });

    describe('variants', () => {
        it('applies default variant styles', () => {
            const { container } = render(<StatCard title="Test" value={1} />);
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('bg-card');
            expect(card).toHaveClass('border-border');
        });

        it('applies primary variant styles', () => {
            const { container } = render(
                <StatCard title="Test" value={1} variant="primary" />
            );
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('border-brand/30');
        });

        it('applies success variant styles', () => {
            const { container } = render(
                <StatCard title="Test" value={1} variant="success" />
            );
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('border-success/30');
        });

        it('applies warning variant styles', () => {
            const { container } = render(
                <StatCard title="Test" value={1} variant="warning" />
            );
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('border-warning/30');
        });

        it('applies danger variant styles', () => {
            const { container } = render(
                <StatCard title="Test" value={1} variant="danger" />
            );
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('border-error/30');
        });
    });

    describe('interactivity', () => {
        it('calls onClick when clicked', async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(<StatCard title="Clickable" value={1} onClick={handleClick} />);

            const card = screen.getByRole('button');
            await user.click(card);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('calls onClick on Enter key', async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(<StatCard title="Clickable" value={1} onClick={handleClick} />);

            const card = screen.getByRole('button');
            card.focus();
            await user.keyboard('{Enter}');

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('calls onClick on Space key', async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(<StatCard title="Clickable" value={1} onClick={handleClick} />);

            const card = screen.getByRole('button');
            card.focus();
            await user.keyboard(' ');

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('applies cursor-pointer when clickable', () => {
            const { container } = render(
                <StatCard title="Clickable" value={1} onClick={() => {}} />
            );
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('cursor-pointer');
        });

        it('does not apply cursor-pointer when not clickable', () => {
            const { container } = render(<StatCard title="Static" value={1} />);
            const card = container.firstChild as HTMLElement;

            expect(card).not.toHaveClass('cursor-pointer');
        });

        it('sets role=button when clickable', () => {
            render(<StatCard title="Clickable" value={1} onClick={() => {}} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('sets tabIndex when clickable', () => {
            render(<StatCard title="Clickable" value={1} onClick={() => {}} />);

            const card = screen.getByRole('button');
            expect(card).toHaveAttribute('tabIndex', '0');
        });

        it('sets aria-label when clickable', () => {
            render(<StatCard title="Projects" value={24} onClick={() => {}} />);

            expect(screen.getByLabelText('Projects: 24')).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('has proper aria-label for change indicator', () => {
            render(
                <StatCard
                    title="Test"
                    value={1}
                    change={{ value: 10, trend: 'up' }}
                />
            );

            expect(screen.getByLabelText(/incremento del 10%/i)).toBeInTheDocument();
        });

        it('is keyboard navigable when clickable', () => {
            render(<StatCard title="Test" value={1} onClick={() => {}} />);

            const card = screen.getByRole('button');
            expect(card).toHaveAttribute('tabIndex', '0');
        });

        it('truncates long text to prevent overflow', () => {
            const { container } = render(
                <StatCard
                    title="This is a very long title that should be truncated"
                    value="This is a very long value that should be truncated"
                />
            );

            const title = screen.getByText(/This is a very long title/);
            const value = screen.getByText(/This is a very long value/);

            expect(title).toHaveClass('truncate');
            expect(value).toHaveClass('truncate');
        });
    });

    describe('custom className', () => {
        it('applies custom className', () => {
            const { container } = render(
                <StatCard title="Test" value={1} className="custom-class" />
            );
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('custom-class');
        });

        it('merges custom className with default classes', () => {
            const { container } = render(
                <StatCard title="Test" value={1} className="custom-class" />
            );
            const card = container.firstChild as HTMLElement;

            expect(card).toHaveClass('custom-class');
            expect(card).toHaveClass('rounded-xl');
            expect(card).toHaveClass('border');
        });
    });
});
