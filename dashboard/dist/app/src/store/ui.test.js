import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './ui';
describe('UI Store', () => {
    beforeEach(() => {
        // Reset store state before each test
        useUIStore.setState({
            sidebarOpen: true,
            theme: 'dark',
        });
    });
    it('initializes with default state', () => {
        const state = useUIStore.getState();
        expect(state.sidebarOpen).toBe(true);
        expect(state.theme).toBe('dark');
    });
    it('toggles sidebar correctly', () => {
        useUIStore.getState().toggleSidebar();
        expect(useUIStore.getState().sidebarOpen).toBe(false);
        useUIStore.getState().toggleSidebar();
        expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
    it('sets sidebar open state directly', () => {
        useUIStore.getState().setSidebarOpen(false);
        expect(useUIStore.getState().sidebarOpen).toBe(false);
        useUIStore.getState().setSidebarOpen(true);
        expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
    it('toggles theme correctly', () => {
        useUIStore.getState().toggleTheme();
        expect(useUIStore.getState().theme).toBe('light');
        useUIStore.getState().toggleTheme();
        expect(useUIStore.getState().theme).toBe('dark');
    });
    it('sets theme directly', () => {
        useUIStore.getState().setTheme('light');
        expect(useUIStore.getState().theme).toBe('light');
        useUIStore.getState().setTheme('dark');
        expect(useUIStore.getState().theme).toBe('dark');
    });
});
//# sourceMappingURL=ui.test.js.map