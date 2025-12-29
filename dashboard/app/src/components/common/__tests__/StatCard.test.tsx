import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderKanban } from 'lucide-react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
    it('renders with basic props', () => {
        render(
            <StatCard
                title="Total Projects"
                value={42}
                icon={FolderKanban}
            />
        );

        expect(screen.getByText('Total Projects')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders with all variants', () => {
        const variants = ['default', 'primary', 'success', 'warning', 'danger'] as const;
        
        variants.forEach(variant => {
            const { container } = render(
                <StatCard
                    title="Test"
                    value={100}
                    icon={FolderKanban}
                    variant={variant}
                />
            );
            expect(container.querySelector('.stat-card')).toHaveClass(variant);
        });
    });

    it('handles onClick callback', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(
            <StatCard
                title="Clickable Card"
                value={10}
                icon={FolderKanban}
                onClick={handleClick}
            />
        );

        const card = screen.getByRole('button');
        await user.click(card);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard interaction when clickable', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(
            <StatCard
                title="Keyboard Card"
                value={5}
                icon={FolderKanban}
                onClick={handleClick}
            />
        );

        const card = screen.getByRole('button');
        card.focus();
        await user.keyboard('{Enter}');

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has proper accessibility attributes when clickable', () => {
        render(
            <StatCard
                title="Accessible Card"
                value={99}
                icon={FolderKanban}
                onClick={vi.fn()}
            />
        );

        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('renders with string values', () => {
        render(
            <StatCard
                title="Budget"
                value="$50K"
                icon={FolderKanban}
            />
        );

        expect(screen.getByText('$50K')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <StatCard
                title="Custom"
                value={1}
                icon={FolderKanban}
                className="custom-class"
            />
        );

        expect(container.querySelector('.stat-card')).toHaveClass('custom-class');
    });
});
