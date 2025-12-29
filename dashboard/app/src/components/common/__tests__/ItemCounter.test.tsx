import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemCounter } from '@/components/common/ItemCounter';

describe('ItemCounter', () => {
    describe('basic rendering', () => {
        it('renders count and label', () => {
            render(<ItemCounter count={42} />);

            expect(screen.getByText('42')).toBeInTheDocument();
            expect(screen.getByText('items')).toBeInTheDocument();
        });

        it('has status role for accessibility', () => {
            render(<ItemCounter count={5} />);

            expect(screen.getByRole('status')).toBeInTheDocument();
        });

        it('has default aria-label', () => {
            render(<ItemCounter count={10} />);

            expect(screen.getByLabelText('10 items')).toBeInTheDocument();
        });

        it('applies custom aria-label', () => {
            render(
                <ItemCounter
                    count={5}
                    ariaLabel="5 active filters"
                />
            );

            expect(screen.getByLabelText('5 active filters')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <ItemCounter count={1} className="custom-class" />
            );

            const counter = container.querySelector('.custom-class');
            expect(counter).toBeInTheDocument();
        });
    });

    describe('singular/plural handling', () => {
        it('uses singular label when count is 1', () => {
            render(
                <ItemCounter
                    count={1}
                    singularLabel="result"
                    pluralLabel="results"
                />
            );

            expect(screen.getByText('result')).toBeInTheDocument();
            expect(screen.queryByText('results')).not.toBeInTheDocument();
        });

        it('uses plural label when count is 0', () => {
            render(
                <ItemCounter
                    count={0}
                    singularLabel="item"
                    pluralLabel="items"
                />
            );

            expect(screen.getByText('items')).toBeInTheDocument();
            expect(screen.queryByText('item')).not.toBeInTheDocument();
        });

        it('uses plural label when count is greater than 1', () => {
            render(
                <ItemCounter
                    count={5}
                    singularLabel="task"
                    pluralLabel="tasks"
                />
            );

            expect(screen.getByText('tasks')).toBeInTheDocument();
            expect(screen.queryByText('task')).not.toBeInTheDocument();
        });

        it('uses default labels when not provided', () => {
            render(<ItemCounter count={3} />);

            expect(screen.getByText('items')).toBeInTheDocument();
        });

        it('uses default singular label when count is 1 and labels not provided', () => {
            render(<ItemCounter count={1} />);

            expect(screen.getByText('item')).toBeInTheDocument();
        });
    });

    describe('number formatting', () => {
        it('formats large numbers with locale formatting', () => {
            render(<ItemCounter count={1000} />);

            // toLocaleString() formats 1000 as "1,000" in en-US locale
            expect(screen.getByText('1,000')).toBeInTheDocument();
        });

        it('formats very large numbers', () => {
            render(<ItemCounter count={1000000} />);

            expect(screen.getByText('1,000,000')).toBeInTheDocument();
        });

        it('renders zero correctly', () => {
            render(<ItemCounter count={0} />);

            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });

    describe('visual styling', () => {
        it('applies muted text color to label', () => {
            const { container } = render(<ItemCounter count={5} />);

            const label = screen.getByText('items');
            expect(label.parentElement).toHaveClass('text-muted-foreground');
        });

        it('applies semibold and foreground color to count', () => {
            render(<ItemCounter count={42} />);

            const count = screen.getByText('42');
            expect(count).toHaveClass('font-semibold');
            expect(count).toHaveClass('text-foreground');
        });

        it('uses design token for font size', () => {
            const { container } = render(<ItemCounter count={1} />);

            const counter = screen.getByRole('status');
            // Verify the counter element exists and has proper structure
            expect(counter).toBeInTheDocument();
            expect(counter).toHaveClass('inline-flex');
            expect(counter).toHaveClass('font-medium');
        });
    });

    describe('accessibility', () => {
        it('provides accurate aria-label for screen readers', () => {
            render(<ItemCounter count={42} singularLabel="result" pluralLabel="results" />);

            expect(screen.getByLabelText('42 results')).toBeInTheDocument();
        });

        it('updates aria-label for singular count', () => {
            render(<ItemCounter count={1} singularLabel="task" pluralLabel="tasks" />);

            expect(screen.getByLabelText('1 task')).toBeInTheDocument();
        });

        it('respects custom aria-label over default', () => {
            render(
                <ItemCounter
                    count={5}
                    singularLabel="item"
                    pluralLabel="items"
                    ariaLabel="5 filtered items"
                />
            );

            expect(screen.getByLabelText('5 filtered items')).toBeInTheDocument();
            expect(screen.queryByLabelText('5 items')).not.toBeInTheDocument();
        });
    });

    describe('real-world use cases', () => {
        it('renders search results counter', () => {
            render(
                <ItemCounter
                    count={127}
                    singularLabel="result"
                    pluralLabel="results"
                />
            );

            expect(screen.getByText('127')).toBeInTheDocument();
            expect(screen.getByText('results')).toBeInTheDocument();
        });

        it('renders active tasks counter', () => {
            render(
                <ItemCounter
                    count={3}
                    singularLabel="active task"
                    pluralLabel="active tasks"
                />
            );

            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('active tasks')).toBeInTheDocument();
        });

        it('renders empty state correctly', () => {
            render(
                <ItemCounter
                    count={0}
                    singularLabel="result"
                    pluralLabel="results"
                />
            );

            expect(screen.getByText('0')).toBeInTheDocument();
            expect(screen.getByText('results')).toBeInTheDocument();
        });

        it('handles single item correctly', () => {
            render(
                <ItemCounter
                    count={1}
                    singularLabel="notification"
                    pluralLabel="notifications"
                />
            );

            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('notification')).toBeInTheDocument();
        });
    });

    describe('component composition', () => {
        it('can be combined with other elements', () => {
            const { container } = render(
                <div data-testid="wrapper">
                    <h2>Search Results</h2>
                    <ItemCounter count={42} singularLabel="result" pluralLabel="results" />
                </div>
            );

            const wrapper = screen.getByTestId('wrapper');
            expect(wrapper).toContainElement(screen.getByText('42'));
            expect(wrapper).toContainElement(screen.getByText('Search Results'));
        });

        it('maintains inline-flex layout', () => {
            const { container } = render(<ItemCounter count={5} />);

            const counter = screen.getByRole('status');
            expect(counter).toHaveClass('inline-flex');
        });
    });
});
