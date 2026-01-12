/**
 * SOLARIA DFO - Permissions Repository (Drizzle ORM)
 * Handles permissions, role-permissions, and user preferences
 *
 * Updated: 2026-01-12 - Phase 2.4: BaseRepository pattern migration
 */

import { db } from '../index.js';
import { eq, sql, and } from 'drizzle-orm';
import {
    permissions,
    rolePermissions,
    userPreferences,
    type Permission,
    type NewPermission,
    type RolePermission,
    type NewRolePermission,
    type UserPreference,
    type NewUserPreference,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Permissions Repository Class
// ============================================================================

class PermissionsRepository extends BaseRepository<Permission, NewPermission, typeof permissions> {
    constructor() {
        super(permissions, 'Permission');
    }

    /**
     * Find all permissions ordered by category and code
     */
    async findAllOrdered(): Promise<Permission[]> {
        return db
            .select()
            .from(permissions)
            .orderBy(permissions.category, permissions.code);
    }

    /**
     * Find permission by code
     */
    async findByCode(code: string): Promise<Permission | null> {
        return this.findOne(eq(permissions.code, code));
    }

    // ========================================================================
    // Role Permissions
    // ========================================================================

    /**
     * Get all role-permission mappings with joined permission data
     */
    async findAllRolePermissions() {
        return db.execute(sql`
            SELECT rp.role, p.code as permission
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            ORDER BY rp.role, p.code
        `);
    }

    /**
     * Get role-permission mappings by role
     */
    async findRolePermissionsByRole(role: string) {
        return db
            .select({
                role: rolePermissions.role,
                permissionId: rolePermissions.permissionId,
            })
            .from(rolePermissions)
            .where(eq(rolePermissions.role, role));
    }

    /**
     * Get full permission objects for a role
     */
    async findPermissionsByRole(role: string) {
        return db.execute(sql`
            SELECT p.code, p.name, p.description, p.category
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role = ${role}
            ORDER BY p.category, p.code
        `);
    }

    /**
     * Add permission to role
     */
    async addRolePermission(data: NewRolePermission) {
        return db.insert(rolePermissions).values(data);
    }

    /**
     * Remove permission from role
     */
    async removeRolePermission(role: string, permissionId: number) {
        return db
            .delete(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.role, role),
                    eq(rolePermissions.permissionId, permissionId)
                )
            );
    }

    // ========================================================================
    // User Preferences
    // ========================================================================

    /**
     * Get user preferences by user ID
     */
    async findUserPreferences(userId: number): Promise<UserPreference | null> {
        const result = await db
            .select()
            .from(userPreferences)
            .where(eq(userPreferences.userId, userId))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Create or update user preferences
     */
    async upsertUserPreferences(
        userId: number,
        data: Partial<NewUserPreference>
    ): Promise<UserPreference | null> {
        const existing = await this.findUserPreferences(userId);

        if (existing) {
            await db
                .update(userPreferences)
                .set(data)
                .where(eq(userPreferences.userId, userId));
        } else {
            await db.insert(userPreferences).values({
                userId,
                ...data,
            });
        }

        return this.findUserPreferences(userId);
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const permissionsRepo = new PermissionsRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Find all permissions
 * @deprecated Use permissionsRepo.findAllOrdered() directly
 */
export async function findAllPermissions() {
    return permissionsRepo.findAllOrdered();
}

/**
 * Find permission by ID
 * @deprecated Use permissionsRepo.findById() directly
 */
export async function findPermissionById(id: number) {
    return permissionsRepo.findById(id);
}

/**
 * Find permission by code
 * @deprecated Use permissionsRepo.findByCode() directly
 */
export async function findPermissionByCode(code: string) {
    return permissionsRepo.findByCode(code);
}

/**
 * Create new permission
 * @deprecated Use permissionsRepo.create() directly
 */
export async function createPermission(data: NewPermission): Promise<Permission> {
    return permissionsRepo.create(data);
}

/**
 * Get all role-permission mappings
 * @deprecated Use permissionsRepo.findAllRolePermissions() directly
 */
export async function findAllRolePermissions() {
    return permissionsRepo.findAllRolePermissions();
}

/**
 * Get role-permission mappings by role
 * @deprecated Use permissionsRepo.findRolePermissionsByRole() directly
 */
export async function findRolePermissionsByRole(role: string) {
    return permissionsRepo.findRolePermissionsByRole(role);
}

/**
 * Get permissions for a role
 * @deprecated Use permissionsRepo.findPermissionsByRole() directly
 */
export async function findPermissionsByRole(role: string) {
    return permissionsRepo.findPermissionsByRole(role);
}

/**
 * Add permission to role
 * @deprecated Use permissionsRepo.addRolePermission() directly
 */
export async function addRolePermission(data: NewRolePermission) {
    return permissionsRepo.addRolePermission(data);
}

/**
 * Remove permission from role
 * @deprecated Use permissionsRepo.removeRolePermission() directly
 */
export async function removeRolePermission(role: string, permissionId: number) {
    return permissionsRepo.removeRolePermission(role, permissionId);
}

/**
 * Get user preferences
 * @deprecated Use permissionsRepo.findUserPreferences() directly
 */
export async function findUserPreferencesByUserId(userId: number) {
    return permissionsRepo.findUserPreferences(userId);
}

/**
 * Create or update user preferences
 * @deprecated Use permissionsRepo.upsertUserPreferences() directly
 */
export async function upsertUserPreferences(
    userId: number,
    data: Partial<NewUserPreference>
) {
    return permissionsRepo.upsertUserPreferences(userId, data);
}

// Export repository instance for direct usage
export { permissionsRepo };
