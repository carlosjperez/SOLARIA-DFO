import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

describe('StandardPageLayout', () => {
    describe('basic rendering', () => {
        it('renders children content', () => {
            render(
                <StandardPageLayout>
                    <div data-testid="test-content">Test Content</div>
                </StandardPageLayout>
            );

            expect(screen.getByTestId('test-content')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('has main role for accessibility', () => {
            render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            expect(screen.getByRole('main')).toBeInTheDocument();
        });

        it('applies default background', () => {
            render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('bg-background');
        });

        it('applies min-h-screen class', () => {
            render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('min-h-screen');
        });
    });

    describe('maxWidth variants', () => {
        it('applies default 7xl maxWidth', () => {
            const { container } = render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.max-w-7xl');
            expect(innerContainer).toBeInTheDocument();
        });

        it('applies full maxWidth when specified', () => {
            const { container } = render(
                <StandardPageLayout maxWidth="full">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.max-w-full');
            expect(innerContainer).toBeInTheDocument();
        });

        it('applies 6xl maxWidth when specified', () => {
            const { container } = render(
                <StandardPageLayout maxWidth="6xl">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.max-w-6xl');
            expect(innerContainer).toBeInTheDocument();
        });

        it('applies 5xl maxWidth when specified', () => {
            const { container } = render(
                <StandardPageLayout maxWidth="5xl">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.max-w-5xl');
            expect(innerContainer).toBeInTheDocument();
        });

        it('applies 4xl maxWidth when specified', () => {
            const { container } = render(
                <StandardPageLayout maxWidth="4xl">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.max-w-4xl');
            expect(innerContainer).toBeInTheDocument();
        });
    });

    describe('background variants', () => {
        it('applies muted background when specified', () => {
            render(
                <StandardPageLayout background="muted">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('bg-muted/30');
        });

        it('applies card background when specified', () => {
            render(
                <StandardPageLayout background="card">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('bg-card');
        });

        it('applies default background when not specified', () => {
            render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('bg-background');
        });
    });

    describe('padding control', () => {
        it('applies default padding when noPadding is false', () => {
            const { container } = render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.mx-auto');
            expect(innerContainer).toHaveClass('px-[var(--page-padding-x)]');
            expect(innerContainer).toHaveClass('py-[var(--page-padding-y)]');
        });

        it('removes padding when noPadding is true', () => {
            const { container } = render(
                <StandardPageLayout noPadding>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.mx-auto');
            expect(innerContainer).not.toHaveClass('px-[var(--page-padding-x)]');
            expect(innerContainer).not.toHaveClass('py-[var(--page-padding-y)]');
        });
    });

    describe('custom className', () => {
        it('applies custom className to outer container', () => {
            render(
                <StandardPageLayout className="custom-test-class">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('custom-test-class');
        });

        it('preserves default classes when custom className applied', () => {
            render(
                <StandardPageLayout className="custom-class">
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('min-h-screen');
            expect(main).toHaveClass('bg-background');
            expect(main).toHaveClass('custom-class');
        });
    });

    describe('complex scenarios', () => {
        it('renders multiple children correctly', () => {
            render(
                <StandardPageLayout>
                    <div data-testid="child-1">Child 1</div>
                    <div data-testid="child-2">Child 2</div>
                    <div data-testid="child-3">Child 3</div>
                </StandardPageLayout>
            );

            expect(screen.getByTestId('child-1')).toBeInTheDocument();
            expect(screen.getByTestId('child-2')).toBeInTheDocument();
            expect(screen.getByTestId('child-3')).toBeInTheDocument();
        });

        it('handles full-bleed layout with no padding and full width', () => {
            const { container } = render(
                <StandardPageLayout maxWidth="full" noPadding>
                    <div data-testid="full-bleed">Full Bleed Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.max-w-full');
            expect(innerContainer).toBeInTheDocument();
            expect(innerContainer).not.toHaveClass('px-[var(--page-padding-x)]');
        });

        it('combines all variant props correctly', () => {
            const { container } = render(
                <StandardPageLayout
                    maxWidth="6xl"
                    background="muted"
                    className="test-class"
                    noPadding={false}
                >
                    <div>Content</div>
                </StandardPageLayout>
            );

            const main = screen.getByRole('main');
            expect(main).toHaveClass('min-h-screen');
            expect(main).toHaveClass('bg-muted/30');
            expect(main).toHaveClass('test-class');

            const innerContainer = container.querySelector('.max-w-6xl');
            expect(innerContainer).toBeInTheDocument();
            expect(innerContainer).toHaveClass('px-[var(--page-padding-x)]');
        });

        it('renders nested complex component structure', () => {
            render(
                <StandardPageLayout>
                    <header data-testid="header">Header</header>
                    <main data-testid="content">
                        <section>Section 1</section>
                        <section>Section 2</section>
                    </main>
                    <footer data-testid="footer">Footer</footer>
                </StandardPageLayout>
            );

            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('content')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
        });
    });

    describe('responsive behavior', () => {
        it('applies mx-auto for centering', () => {
            const { container } = render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.mx-auto');
            expect(innerContainer).toBeInTheDocument();
        });

        it('applies w-full for responsive width', () => {
            const { container } = render(
                <StandardPageLayout>
                    <div>Content</div>
                </StandardPageLayout>
            );

            const innerContainer = container.querySelector('.w-full');
            expect(innerContainer).toBeInTheDocument();
        });
    });
});
