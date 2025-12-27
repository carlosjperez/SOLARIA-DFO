import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { endpoints } from '@lib/api';

// User types
export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: UserRole;
}

export type UserRole =
    | 'ceo'
    | 'cto'
    | 'coo'
    | 'cfo'
    | 'admin'
    | 'manager'
    | 'agent'
    | 'viewer';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    permissions: string[];

    // Actions
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    verifyToken: () => Promise<boolean>;
    setPermissions: (permissions: string[]) => void;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            permissions: [],

            login: async (username: string, password: string) => {
                try {
                    set({ isLoading: true });
                    const response = await endpoints.auth.login({ username, password });
                    const { token, user } = response.data;

                    // Store token
                    localStorage.setItem('token', token);

                    // Fetch permissions for the user's role
                    try {
                        const permResponse = await endpoints.office.permissions.my();
                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            permissions: permResponse.data.permissions || [],
                        });
                    } catch {
                        // If permissions fail, still login but with empty permissions
                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            permissions: [],
                        });
                    }

                    return true;
                } catch (error) {
                    set({ isLoading: false });
                    console.error('Login failed:', error);
                    return false;
                }
            },

            logout: async () => {
                try {
                    await endpoints.auth.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                }
                localStorage.removeItem('token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    permissions: [],
                });
            },

            verifyToken: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ isAuthenticated: false, isLoading: false });
                    return false;
                }

                try {
                    set({ isLoading: true });
                    const response = await endpoints.auth.verify();

                    if (response.data.valid && response.data.user) {
                        // Fetch permissions
                        try {
                            const permResponse = await endpoints.office.permissions.my();
                            set({
                                user: response.data.user,
                                token,
                                isAuthenticated: true,
                                isLoading: false,
                                permissions: permResponse.data.permissions || [],
                            });
                        } catch {
                            set({
                                user: response.data.user,
                                token,
                                isAuthenticated: true,
                                isLoading: false,
                                permissions: [],
                            });
                        }
                        return true;
                    } else {
                        localStorage.removeItem('token');
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            permissions: [],
                        });
                        return false;
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    localStorage.removeItem('token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        permissions: [],
                    });
                    return false;
                }
            },

            setPermissions: (permissions: string[]) => {
                set({ permissions });
            },

            hasPermission: (permission: string) => {
                const { permissions, user } = get();
                // Admin and C-suite roles have full access
                if (user?.role === 'admin' || user?.role === 'ceo') {
                    return true;
                }
                return permissions.includes(permission);
            },

            hasAnyPermission: (permissionList: string[]) => {
                const { permissions, user } = get();
                if (user?.role === 'admin' || user?.role === 'ceo') {
                    return true;
                }
                return permissionList.some((p) => permissions.includes(p));
            },

            hasAllPermissions: (permissionList: string[]) => {
                const { permissions, user } = get();
                if (user?.role === 'admin' || user?.role === 'ceo') {
                    return true;
                }
                return permissionList.every((p) => permissions.includes(p));
            },
        }),
        {
            name: 'office-auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                permissions: state.permissions,
            }),
        }
    )
);

// Permission codes constants for type safety
export const PERMISSIONS = {
    // Projects
    PROJECTS_VIEW: 'projects.view',
    PROJECTS_CREATE: 'projects.create',
    PROJECTS_EDIT: 'projects.edit',
    PROJECTS_DELETE: 'projects.delete',
    PROJECTS_MANAGE_TEAM: 'projects.manage_team',

    // Clients
    CLIENTS_VIEW: 'clients.view',
    CLIENTS_CREATE: 'clients.create',
    CLIENTS_EDIT: 'clients.edit',
    CLIENTS_DELETE: 'clients.delete',

    // Tasks
    TASKS_VIEW: 'tasks.view',
    TASKS_CREATE: 'tasks.create',
    TASKS_EDIT: 'tasks.edit',
    TASKS_DELETE: 'tasks.delete',
    TASKS_ASSIGN: 'tasks.assign',

    // Agents
    AGENTS_VIEW: 'agents.view',
    AGENTS_MANAGE: 'agents.manage',

    // Analytics
    ANALYTICS_VIEW: 'analytics.view',
    ANALYTICS_EXPORT: 'analytics.export',

    // Reports
    REPORTS_VIEW: 'reports.view',
    REPORTS_CREATE: 'reports.create',
    REPORTS_EXPORT: 'reports.export',

    // Payments
    PAYMENTS_VIEW: 'payments.view',
    PAYMENTS_CREATE: 'payments.create',
    PAYMENTS_EDIT: 'payments.edit',

    // Settings
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_EDIT: 'settings.edit',

    // Admin
    ADMIN_USERS: 'admin.users',
    ADMIN_ROLES: 'admin.roles',
    ADMIN_SYSTEM: 'admin.system',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Convenience hook for auth
export function useAuth() {
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        permissions,
        login,
        logout,
        verifyToken,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    } = useAuthStore();

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        permissions,
        login,
        logout,
        verifyToken,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
