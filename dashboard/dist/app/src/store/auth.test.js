import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth';
describe('Auth Store', () => {
    beforeEach(() => {
        // Reset store state before each test
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    });
    it('initializes with default state', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });
    it('logs in user correctly', () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin',
        };
        const mockToken = 'mock-jwt-token';
        useAuthStore.getState().login(mockUser, mockToken);
        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe(mockToken);
        expect(state.isAuthenticated).toBe(true);
    });
    it('logs out user correctly', () => {
        // First log in
        useAuthStore.getState().login({ id: 1, username: 'test', name: 'Test', email: 'test@test.com', role: 'admin' }, 'token');
        // Then log out
        useAuthStore.getState().logout();
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });
    it('updates user data correctly', () => {
        // First log in
        useAuthStore.getState().login({ id: 1, username: 'test', name: 'Test', email: 'test@test.com', role: 'admin' }, 'token');
        // Update user
        useAuthStore.getState().updateUser({ name: 'Updated Name' });
        const state = useAuthStore.getState();
        expect(state.user?.name).toBe('Updated Name');
        expect(state.user?.username).toBe('test'); // Other fields unchanged
    });
    it('does not update when no user is logged in', () => {
        useAuthStore.getState().updateUser({ name: 'Updated Name' });
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
    });
});
//# sourceMappingURL=auth.test.js.map