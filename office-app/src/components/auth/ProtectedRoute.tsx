import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '@store/useAuthStore';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Required permission to access this route */
    permission?: string;
    /** Required permissions (any of these) */
    anyPermission?: string[];
    /** Required permissions (all of these) */
    allPermissions?: string[];
    /** Required role(s) to access this route */
    roles?: UserRole[];
    /** Custom redirect path (defaults to /login) */
    redirectTo?: string;
    /** Fallback component while checking auth */
    fallback?: ReactNode;
}

/**
 * Route wrapper that requires authentication and optionally specific permissions/roles
 */
export function ProtectedRoute({
    children,
    permission,
    anyPermission,
    allPermissions,
    roles,
    redirectTo = '/login',
    fallback,
}: ProtectedRouteProps) {
    const location = useLocation();
    const {
        isAuthenticated,
        isLoading,
        user,
        verifyToken,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    } = useAuthStore();

    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // If we have a token but aren't authenticated, verify it
            const token = localStorage.getItem('token');
            if (token && !isAuthenticated) {
                await verifyToken();
            }
            setIsVerifying(false);
        };

        checkAuth();
    }, [isAuthenticated, verifyToken]);

    // Show loading state while verifying
    if (isLoading || isVerifying) {
        return (
            fallback || (
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-solaria-orange border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600">Verificando acceso...</p>
                    </div>
                </div>
            )
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role requirements
    if (roles && roles.length > 0) {
        if (!user || !roles.includes(user.role)) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <div className="text-center p-8 max-w-md">
                        <div className="text-6xl mb-4">403</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
                        <p className="text-gray-600 mb-4">
                            No tienes los permisos necesarios para acceder a esta pagina.
                        </p>
                        <p className="text-sm text-gray-500">
                            Tu rol: <span className="font-medium">{user?.role}</span>
                        </p>
                    </div>
                </div>
            );
        }
    }

    // Check permission requirements
    if (permission && !hasPermission(permission)) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="text-6xl mb-4">403</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Permiso Requerido</h2>
                    <p className="text-gray-600">
                        No tienes el permiso <code className="bg-gray-100 px-2 py-1 rounded">{permission}</code> necesario.
                    </p>
                </div>
            </div>
        );
    }

    if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(anyPermission)) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="text-6xl mb-4">403</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Permiso Requerido</h2>
                    <p className="text-gray-600">
                        Necesitas al menos uno de estos permisos: {anyPermission.join(', ')}
                    </p>
                </div>
            </div>
        );
    }

    if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(allPermissions)) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="text-6xl mb-4">403</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Permisos Requeridos</h2>
                    <p className="text-gray-600">
                        Necesitas todos estos permisos: {allPermissions.join(', ')}
                    </p>
                </div>
            </div>
        );
    }

    // All checks passed
    return <>{children}</>;
}

export default ProtectedRoute;
