/**
 * SOLARIA DFO - Permissions Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
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

// ============================================================================
// Permissions CRUD
// ============================================================================

export async function findAllPermissions() {
    return db
        .select()
        .from(permissions)
        .orderBy(permissions.category, permissions.code);
}

export async function findPermissionById(id: number) {
    const result = await db
        .select()
        .from(permissions)
        .where(eq(permissions.id, id))
        .limit(1);
    return result[0] || null;
}

export async function findPermissionByCode(code: string) {
    const result = await db
        .select()
        .from(permissions)
        .where(eq(permissions.code, code))
        .limit(1);
    return result[0] || null;
}

export async function createPermission(data: NewPermission): Promise<Permission> {
    const insertResult = await db.insert(permissions).values(data);
    return findPermissionById(insertResult[0].insertId) as Promise<Permission>;
}

// ============================================================================
// Role Permissions
// ============================================================================

export async function findAllRolePermissions() {
    return db.execute(sql`
        SELECT rp.role, p.code as permission
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        ORDER BY rp.role, p.code
    `);
}

export async function findRolePermissionsByRole(role: string) {
    return db
        .select({
            role: rolePermissions.role,
            permissionId: rolePermissions.permissionId,
        })
        .from(rolePermissions)
        .where(eq(rolePermissions.role, role));
}

export async function addRolePermission(data: NewRolePermission) {
    return db.insert(rolePermissions).values(data);
}

export async function removeRolePermission(role: string, permissionId: number) {
    return db
        .delete(rolePermissions)
        .where(
            sql`${rolePermissions.role} = ${role} AND ${rolePermissions.permissionId} = ${permissionId}`
        );
}

// ============================================================================
// User Preferences
// ============================================================================

export async function findUserPreferencesByUserId(userId: number) {
    const result = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);
    return result[0] || null;
}

export async function upsertUserPreferences(
    userId: number,
    data: Partial<NewUserPreference>
) {
    const existing = await findUserPreferencesByUserId(userId);

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

    return findUserPreferencesByUserId(userId);
}
