import { useAuthStore, PERMISSIONS, PermissionCode, UserRole } from '@store/useAuthStore';

/**
 * Hook for checking user permissions
 */
export function usePermissions() {
    const { user, permissions, hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();

    /**
     * Check if user can perform an action
     */
    const can = (permission: PermissionCode | string): boolean => {
        return hasPermission(permission);
    };

    /**
     * Check if user can perform any of the given actions
     */
    const canAny = (permissionList: (PermissionCode | string)[]): boolean => {
        return hasAnyPermission(permissionList);
    };

    /**
     * Check if user can perform all of the given actions
     */
    const canAll = (permissionList: (PermissionCode | string)[]): boolean => {
        return hasAllPermissions(permissionList);
    };

    /**
     * Check if user has a specific role
     */
    const hasRole = (role: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    };

    /**
     * Check if user is an admin (admin, ceo, cto)
     */
    const isAdmin = (): boolean => {
        return hasRole(['admin', 'ceo', 'cto']);
    };

    /**
     * Check if user is C-suite level
     */
    const isCSuite = (): boolean => {
        return hasRole(['ceo', 'cto', 'coo', 'cfo']);
    };

    /**
     * Check if user can manage other users
     */
    const canManageUsers = (): boolean => {
        return can(PERMISSIONS.ADMIN_USERS);
    };

    return {
        // Current user info
        user,
        role: user?.role,
        permissions,

        // Permission checks
        can,
        canAny,
        canAll,

        // Role checks
        hasRole,
        isAdmin,
        isCSuite,
        canManageUsers,

        // Permission constants
        PERMISSIONS,
    };
}

export default usePermissions;
