import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
export function useAuthVerification() {
    const [isChecking, setIsChecking] = useState(true);
    const { token, isAuthenticated, logout, login, _hasHydrated } = useAuthStore();
    useEffect(() => {
        // Wait for Zustand to hydrate from localStorage
        if (!_hasHydrated) {
            return;
        }
        async function verifyToken() {
            if (!token) {
                setIsChecking(false);
                return;
            }
            try {
                const { data } = await authApi.verify();
                if (data.success && data.user) {
                    // Update user data in case it changed
                    login(data.user, token);
                }
                else {
                    // Token is invalid
                    logout();
                }
            }
            catch {
                // Token verification failed
                logout();
            }
            finally {
                setIsChecking(false);
            }
        }
        verifyToken();
    }, [_hasHydrated]); // Run when hydration completes
    return { isChecking, isAuthenticated };
}
//# sourceMappingURL=useAuthVerification.js.map