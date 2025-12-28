import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/components/common/SearchInput';

describe('SearchInput', () => {

    describe('basic rendering', () => {
        it('renders input with default placeholder', () => {
            render(<SearchInput onChange={() => {}} />);

            expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        });

        it('renders with custom placeholder', () => {
            render(
                <SearchInput
                    onChange={() => {}}
                    placeholder="Search tasks..."
                />
            );

            expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
        });

        it('has text input type', () => {
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('type', 'text');
        });

        it('has default aria-label', () => {
            render(<SearchInput onChange={() => {}} />);

            expect(screen.getByLabelText('Search')).toBeInTheDocument();
        });

        it('applies custom aria-label', () => {
            render(
                <SearchInput
                    onChange={() => {}}
                    ariaLabel="Search projects"
                />
            );

            expect(screen.getByLabelText('Search projects')).toBeInTheDocument();
        });

        it('applies custom className to wrapper', () => {
            const { container } = render(
                <SearchInput onChange={() => {}} className="custom-class" />
            );

            const wrapper = container.querySelector('.custom-class');
            expect(wrapper).toBeInTheDocument();
        });
    });

    describe('search icon', () => {
        it('renders search icon', () => {
            const { container } = render(<SearchInput onChange={() => {}} />);

            const icon = container.querySelector('.lucide-search');
            expect(icon).toBeInTheDocument();
        });

        it('icon has aria-hidden for accessibility', () => {
            const { container } = render(<SearchInput onChange={() => {}} />);

            const icon = container.querySelector('.lucide-search');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });

        it('icon is positioned on the left', () => {
            const { container } = render(<SearchInput onChange={() => {}} />);

            const icon = container.querySelector('.lucide-search');
            expect(icon).toHaveClass('absolute', 'left-3');
        });
    });

    describe('controlled value', () => {
        it('displays provided value', () => {
            render(
                <SearchInput value="test query" onChange={() => {}} />
            );

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('test query');
        });

        it('updates when value prop changes', () => {
            const { rerender } = render(
                <SearchInput value="initial" onChange={() => {}} />
            );

            let input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('initial');

            rerender(
                <SearchInput value="updated" onChange={() => {}} />
            );

            input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('updated');
        });

        it('starts with empty value by default', () => {
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('');
        });
    });

    describe('user input', () => {
        it('updates local value immediately on typing', async () => {
            const user = userEvent.setup();
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            await user.type(input, 'test');

            expect(input.value).toBe('test');
        });

        it('allows typing multiple characters', async () => {
            const user = userEvent.setup();
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            await user.type(input, 'search query');

            expect(input.value).toBe('search query');
        });

        it('allows clearing input', async () => {
            const user = userEvent.setup();
            render(<SearchInput value="test" onChange={() => {}} />);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            await user.clear(input);

            expect(input.value).toBe('');
        });
    });

    describe('debouncing', () => {
        it('debounces onChange callback by default 300ms', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput onChange={handleChange} debounceMs={100} />);

            const input = screen.getByRole('textbox');
            await user.type(input, 'test');

            // Should not call immediately
            expect(handleChange).not.toHaveBeenCalled();

            // Wait for debounce
            await waitFor(() => {
                expect(handleChange).toHaveBeenCalledTimes(1);
                expect(handleChange).toHaveBeenCalledWith('test');
            }, { timeout: 200 });
        });

        it('respects custom debounce delay', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <SearchInput onChange={handleChange} debounceMs={150} />
            );

            const input = screen.getByRole('textbox');
            await user.type(input, 'test');

            // Not called immediately
            expect(handleChange).not.toHaveBeenCalled();

            // Wait for custom debounce
            await waitFor(() => {
                expect(handleChange).toHaveBeenCalledTimes(1);
            }, { timeout: 250 });
        });

        it('resets debounce timer on new input', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput onChange={handleChange} debounceMs={100} />);

            const input = screen.getByRole('textbox');

            // Type multiple characters quickly
            await user.type(input, 'test');

            // Wait for debounce - should only call once with final value
            await waitFor(() => {
                expect(handleChange).toHaveBeenCalled();
            }, { timeout: 200 });

            expect(handleChange).toHaveBeenCalledWith('test');
        });

        it('does not call onChange if value matches controlled value', async () => {
            const handleChange = vi.fn();

            render(<SearchInput value="test" onChange={handleChange} debounceMs={50} />);

            // Wait to ensure no calls
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('clear button', () => {
        it('shows clear button when input has value', () => {
            render(<SearchInput value="test" onChange={() => {}} />);

            expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
        });

        it('hides clear button when input is empty', () => {
            render(<SearchInput value="" onChange={() => {}} />);

            expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
        });

        it('clears input when clear button clicked', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput value="test" onChange={handleChange} />);

            const clearButton = screen.getByLabelText('Clear search');
            await user.click(clearButton);

            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input.value).toBe('');
        });

        it('calls onChange immediately when cleared (no debounce)', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput value="test" onChange={handleChange} />);

            const clearButton = screen.getByLabelText('Clear search');
            await user.click(clearButton);

            // Should call immediately without waiting for debounce
            expect(handleChange).toHaveBeenCalledTimes(1);
            expect(handleChange).toHaveBeenCalledWith('');
        });

        it('clear button has X icon', () => {
            const { container } = render(
                <SearchInput value="test" onChange={() => {}} />
            );

            const clearButton = screen.getByLabelText('Clear search');
            const icon = clearButton.querySelector('.lucide-x');
            expect(icon).toBeInTheDocument();
        });

        it('hides clear button when disabled', () => {
            render(
                <SearchInput value="test" onChange={() => {}} disabled />
            );

            expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
        });
    });

    describe('disabled state', () => {
        it('disables input when disabled prop is true', () => {
            render(<SearchInput onChange={() => {}} disabled />);

            const input = screen.getByRole('textbox');
            expect(input).toBeDisabled();
        });

        it('applies disabled styles', () => {
            render(<SearchInput onChange={() => {}} disabled />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('disabled:opacity-50');
            expect(input).toHaveClass('disabled:cursor-not-allowed');
        });

        it('prevents typing when disabled', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput onChange={handleChange} disabled />);

            const input = screen.getByRole('textbox');
            await user.type(input, 'test');

            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('auto-focus', () => {
        it('auto-focuses input when autoFocus is true', () => {
            render(<SearchInput onChange={() => {}} autoFocus />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveFocus();
        });

        it('does not auto-focus by default', () => {
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox');
            expect(input).not.toHaveFocus();
        });
    });

    describe('keyboard navigation', () => {
        it('can be focused with tab', async () => {
            const user = userEvent.setup();
            render(<SearchInput onChange={() => {}} />);

            await user.tab();

            const input = screen.getByRole('textbox');
            expect(input).toHaveFocus();
        });

        it('clear button can be focused with tab', async () => {
            const user = userEvent.setup();
            render(<SearchInput value="test" onChange={() => {}} />);

            const input = screen.getByRole('textbox');
            input.focus();

            await user.tab();

            const clearButton = screen.getByLabelText('Clear search');
            expect(clearButton).toHaveFocus();
        });

        it('activates clear button with Enter key', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput value="test" onChange={handleChange} />);

            const clearButton = screen.getByLabelText('Clear search');
            clearButton.focus();
            await user.keyboard('{Enter}');

            expect(handleChange).toHaveBeenCalledWith('');
        });
    });

    describe('accessibility', () => {
        it('has proper focus ring on input', () => {
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('focus:outline-none');
            expect(input).toHaveClass('focus:ring-2');
            expect(input).toHaveClass('focus:ring-brand');
        });

        it('has proper focus ring on clear button', () => {
            render(<SearchInput value="test" onChange={() => {}} />);

            const clearButton = screen.getByLabelText('Clear search');
            expect(clearButton).toHaveClass('focus-visible:outline-none');
            expect(clearButton).toHaveClass('focus-visible:ring-2');
            expect(clearButton).toHaveClass('focus-visible:ring-brand');
        });

        it('provides textbox role for screen readers', () => {
            render(<SearchInput onChange={() => {}} />);

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
    });

    describe('visual feedback', () => {
        it('includes hover state on input', () => {
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox');
            expect(input.className).toContain('hover:border-muted-foreground/30');
        });

        it('includes transition classes', () => {
            render(<SearchInput onChange={() => {}} />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('transition-all');
            expect(input).toHaveClass('duration-[var(--transition-normal)]');
        });

        it('clear button has hover state', () => {
            render(<SearchInput value="test" onChange={() => {}} />);

            const clearButton = screen.getByLabelText('Clear search');
            expect(clearButton.className).toContain('hover:text-foreground');
            expect(clearButton.className).toContain('hover:bg-muted/50');
        });
    });

    describe('real-world use cases', () => {
        it('handles task search scenario', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(
                <SearchInput
                    onChange={handleChange}
                    placeholder="Search tasks..."
                    ariaLabel="Search tasks"
                    debounceMs={100}
                />
            );

            const input = screen.getByRole('textbox');
            await user.type(input, 'bug fix');

            // Wait for debounce
            await waitFor(() => {
                expect(handleChange).toHaveBeenCalledWith('bug fix');
            }, { timeout: 200 });
        });

        it('handles clearing after search', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput value="test" onChange={handleChange} />);

            const clearButton = screen.getByLabelText('Clear search');
            await user.click(clearButton);

            expect(handleChange).toHaveBeenCalledWith('');
            expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
        });
    });
});
