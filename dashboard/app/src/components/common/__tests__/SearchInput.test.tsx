import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders with placeholder', () => {
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                placeholder="Search projects..."
            />
        );

        expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
    });

    it('displays current value', () => {
        render(
            <SearchInput
                value="test query"
                onChange={vi.fn()}
            />
        );

        const input = screen.getByRole('searchbox');
        expect(input).toHaveValue('test query');
    });

    it('calls onChange after debounce delay', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup({ delay: null });

        render(
            <SearchInput
                value=""
                onChange={handleChange}
                debounceMs={300}
            />
        );

        const input = screen.getByRole('searchbox');
        await user.type(input, 'test');

        expect(handleChange).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith('test');
        });
    });

    it('shows clear button when value is not empty', () => {
        render(
            <SearchInput
                value="some text"
                onChange={vi.fn()}
            />
        );

        const clearButton = screen.getByLabelText(/clear search/i);
        expect(clearButton).toBeInTheDocument();
    });

    it('hides clear button when value is empty', () => {
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
            />
        );

        const clearButton = screen.queryByLabelText(/clear search/i);
        expect(clearButton).not.toBeInTheDocument();
    });

    it('clears input when clear button is clicked', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <SearchInput
                value="test"
                onChange={handleChange}
            />
        );

        const clearButton = screen.getByLabelText(/clear search/i);
        await user.click(clearButton);

        expect(handleChange).toHaveBeenCalledWith('');
    });

    it('has proper ARIA attributes', () => {
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                ariaLabel="Search for projects"
            />
        );

        const input = screen.getByRole('searchbox');
        expect(input).toHaveAttribute('aria-label', 'Search for projects');
    });

    it('applies custom className', () => {
        const { container } = render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                className="custom-search"
            />
        );

        expect(container.querySelector('.custom-search')).toBeInTheDocument();
    });

    it('clear button is keyboard accessible', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <SearchInput
                value="test"
                onChange={handleChange}
            />
        );

        const clearButton = screen.getByLabelText(/clear search/i);
        clearButton.focus();
        await user.keyboard('{Enter}');

        expect(handleChange).toHaveBeenCalledWith('');
    });
});
