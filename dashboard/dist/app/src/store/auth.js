import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    _hasHydrated: false,
    login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
    }),
    logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
    }),
    updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
    })),
    setHasHydrated: (state) => set({ _hasHydrated: state }),
}), {
    name: 'solaria-auth',
    partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
    }),
    onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
    },
}));
//# sourceMappingURL=auth.js.map