import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentGroup } from '../ContentGroup';

describe('ContentGroup', () => {
    describe('Rendering', () => {
        it('renders children content', () => {
            render(
                <ContentGroup>
                    <div data-testid="content">Test Content</div>
                </ContentGroup>
            );

            expect(screen.getByTestId('content')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('renders as a section element', () => {
            const { container } = render(
                <ContentGroup>
                    <div>Content</div>
                </ContentGroup>
            );

            expect(container.querySelector('section')).toBeInTheDocument();
        });

        it('applies custom className to wrapper', () => {
            const { container } = render(
                <ContentGroup className="custom-wrapper-class">
                    <div>Content</div>
                </ContentGroup>
            );

            const section = container.querySelector('section.custom-wrapper-class');
            expect(section).toBeInTheDocument();
        });

        it('applies custom contentClassName to content area', () => {
            const { container } = render(
                <ContentGroup contentClassName="custom-content-class">
                    <div data-testid="content">Content</div>
                </ContentGroup>
            );

            const contentDiv = screen.getByTestId('content').parentElement;
            expect(contentDiv).toHaveClass('custom-content-class');
        });
    });

    describe('Title and Subtitle', () => {
        it('renders title when provided', () => {
            render(
                <ContentGroup title="Test Title">
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });

        it('renders title as h2 by default', () => {
            render(
                <ContentGroup title="Test Title">
                    <div>Content</div>
                </ContentGroup>
            );

            const heading = screen.getByText('Test Title');
            expect(heading.tagName).toBe('H2');
        });

        it('renders title with custom heading level', () => {
            render(
                <ContentGroup title="Test Title" titleLevel="h3">
                    <div>Content</div>
                </ContentGroup>
            );

            const heading = screen.getByText('Test Title');
            expect(heading.tagName).toBe('H3');
        });

        it('renders subtitle when provided', () => {
            render(
                <ContentGroup
                    title="Test Title"
                    subtitle="Test subtitle description"
                >
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByText('Test subtitle description')).toBeInTheDocument();
        });

        it('does not render subtitle without title', () => {
            render(
                <ContentGroup subtitle="Test subtitle">
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.queryByText('Test subtitle')).not.toBeInTheDocument();
        });

        it('does not render header section when no title or actions', () => {
            const { container } = render(
                <ContentGroup>
                    <div data-testid="content">Content</div>
                </ContentGroup>
            );

            const header = container.querySelector('.flex.items-start.justify-between');
            expect(header).not.toBeInTheDocument();
        });
    });

    describe('Title Levels and Styling', () => {
        it.each([
            ['h1', 'H1'],
            ['h2', 'H2'],
            ['h3', 'H3'],
            ['h4', 'H4'],
            ['h5', 'H5'],
            ['h6', 'H6'],
        ] as const)('renders title as %s when titleLevel is %s', (level, expectedTag) => {
            render(
                <ContentGroup title="Test Title" titleLevel={level}>
                    <div>Content</div>
                </ContentGroup>
            );

            const heading = screen.getByText('Test Title');
            expect(heading.tagName).toBe(expectedTag);
        });
    });

    describe('Actions', () => {
        it('renders actions when provided', () => {
            render(
                <ContentGroup
                    title="Test Title"
                    actions={<button data-testid="action-btn">Action</button>}
                >
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByTestId('action-btn')).toBeInTheDocument();
        });

        it('renders actions without title', () => {
            render(
                <ContentGroup
                    actions={<button data-testid="action-btn">Action</button>}
                >
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByTestId('action-btn')).toBeInTheDocument();
        });

        it('renders multiple action buttons', () => {
            render(
                <ContentGroup
                    title="Test Title"
                    actions={
                        <div data-testid="actions-wrapper">
                            <button>Action 1</button>
                            <button>Action 2</button>
                        </div>
                    }
                >
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByTestId('actions-wrapper')).toBeInTheDocument();
            expect(screen.getByText('Action 1')).toBeInTheDocument();
            expect(screen.getByText('Action 2')).toBeInTheDocument();
        });
    });

    describe('Spacing', () => {
        it('applies medium spacing by default', () => {
            const { container } = render(
                <ContentGroup title="Title">
                    <div>Content</div>
                </ContentGroup>
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('space-y-4');
        });

        it('applies small spacing', () => {
            const { container } = render(
                <ContentGroup title="Title" spacing="sm">
                    <div>Content</div>
                </ContentGroup>
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('space-y-3');
        });

        it('applies large spacing', () => {
            const { container } = render(
                <ContentGroup title="Title" spacing="lg">
                    <div>Content</div>
                </ContentGroup>
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('space-y-6');
        });
    });

    describe('Accessibility', () => {
        it('uses title as aria-label when provided', () => {
            render(
                <ContentGroup title="Test Section">
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByLabelText('Test Section')).toBeInTheDocument();
        });

        it('uses custom aria-label when provided', () => {
            render(
                <ContentGroup ariaLabel="Custom Label">
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
        });

        it('prefers custom aria-label over title', () => {
            render(
                <ContentGroup title="Title" ariaLabel="Custom Label">
                    <div>Content</div>
                </ContentGroup>
            );

            expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
            expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
        });
    });

    describe('Complex Layouts', () => {
        it('renders with title, subtitle, and actions', () => {
            render(
                <ContentGroup
                    title="Main Title"
                    subtitle="Subtitle text"
                    actions={<button>Action</button>}
                >
                    <div data-testid="content">Content</div>
                </ContentGroup>
            );

            expect(screen.getByText('Main Title')).toBeInTheDocument();
            expect(screen.getByText('Subtitle text')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
            expect(screen.getByTestId('content')).toBeInTheDocument();
        });

        it('renders nested ContentGroup components', () => {
            render(
                <ContentGroup title="Parent Group">
                    <ContentGroup title="Child Group">
                        <div data-testid="nested-content">Nested Content</div>
                    </ContentGroup>
                </ContentGroup>
            );

            expect(screen.getByText('Parent Group')).toBeInTheDocument();
            expect(screen.getByText('Child Group')).toBeInTheDocument();
            expect(screen.getByTestId('nested-content')).toBeInTheDocument();
        });
    });
});
