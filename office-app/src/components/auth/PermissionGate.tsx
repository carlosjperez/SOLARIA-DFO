import { ReactNode } from 'react';
import { usePermissions } from '@hooks/usePermissions';
import { UserRole } from '@store/useAuthStore';

interface PermissionGateProps {
    children: ReactNode;
    /** Required permission to show content */
    permission?: string;
    /** Required permissions (any of these) */
    anyPermission?: string[];
    /** Required permissions (all of these) */
    allPermissions?: string[];
    /** Required role(s) */
    roles?: UserRole[];
    /** What to show if permission is denied (optional) */
    fallback?: ReactNode;
    /** Invert the check (show if NOT having permission) */
    invert?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * // Show only if user can create clients
 * <PermissionGate permission="clients.create">
 *   <Button>Nuevo Cliente</Button>
 * </PermissionGate>
 *
 * @example
 * // Show if user has any of these permissions
 * <PermissionGate anyPermission={['clients.edit', 'clients.delete']}>
 *   <ActionsMenu />
 * </PermissionGate>
 *
 * @example
 * // Show different content for admins
 * <PermissionGate roles={['admin', 'ceo']} fallback={<ViewerDashboard />}>
 *   <AdminDashboard />
 * </PermissionGate>
 */
export function PermissionGate({
    children,
    permission,
    anyPermission,
    allPermissions,
    roles,
    fallback = null,
    invert = false,
}: PermissionGateProps) {
    const { can, canAny, canAll, hasRole } = usePermissions();

    let hasAccess = true;

    // Check single permission
    if (permission) {
        hasAccess = can(permission);
    }

    // Check any permission
    if (anyPermission && anyPermission.length > 0) {
        hasAccess = canAny(anyPermission);
    }

    // Check all permissions
    if (allPermissions && allPermissions.length > 0) {
        hasAccess = canAll(allPermissions);
    }

    // Check roles
    if (roles && roles.length > 0) {
        hasAccess = hasRole(roles);
    }

    // Invert if needed
    if (invert) {
        hasAccess = !hasAccess;
    }

    // Return children or fallback
    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Convenience component for admin-only content
 */
export function AdminOnly({
    children,
    fallback = null,
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <PermissionGate roles={['admin', 'ceo', 'cto']} fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

/**
 * Convenience component for C-suite only content
 */
export function CSuiteOnly({
    children,
    fallback = null,
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <PermissionGate roles={['ceo', 'cto', 'coo', 'cfo']} fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

/**
 * Convenience component for manager+ content
 */
export function ManagerOnly({
    children,
    fallback = null,
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <PermissionGate roles={['admin', 'ceo', 'cto', 'coo', 'cfo', 'manager']} fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

export default PermissionGate;
