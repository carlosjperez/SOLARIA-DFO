/**
 * SOLARIA DFO - Businesses Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq, desc, sql, and } from 'drizzle-orm';
import {
    businesses,
    type Business,
    type NewBusiness,
} from '../schema/index.js';

// ============================================================================
// Businesses CRUD
// ============================================================================

export async function findAllBusinesses(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
}) {
    const conditions = [];

    if (filters?.status) {
        conditions.push(sql`${businesses.status} = ${filters.status}`);
    }

    let query = db.select().from(businesses);

    if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
    }

    // Order by name ascending (default for listings)
    query = query.orderBy(businesses.name) as any;

    // Apply limit and offset
    if (filters?.limit) {
        query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
        query = query.offset(filters.offset) as any;
    }

    return query;
}

export async function findBusinessById(id: number) {
    const result = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, id))
        .limit(1);
    return result[0] || null;
}

export async function createBusiness(data: NewBusiness): Promise<Business> {
    const insertResult = await db.insert(businesses).values(data);
    return findBusinessById(insertResult[0].insertId) as Promise<Business>;
}

export async function updateBusiness(id: number, data: Partial<NewBusiness>) {
    await db.update(businesses).set(data).where(eq(businesses.id, id));
    return findBusinessById(id);
}

export async function deleteBusiness(id: number) {
    return db.delete(businesses).where(eq(businesses.id, id));
}

export async function findBusinessWithStats(id: number) {
    return db.execute(sql`
        SELECT
            b.*,
            (SELECT COUNT(*) FROM projects WHERE business_id = b.id) as projects_count,
            (SELECT COUNT(*) FROM projects WHERE business_id = b.id AND status = 'active') as active_projects_count
        FROM businesses b
        WHERE b.id = ${id}
    `);
}

// ============================================================================
// Office Client Contacts
// ============================================================================

export async function findClientContacts(clientId: number) {
    return db.execute(sql`
        SELECT * FROM office_client_contacts
        WHERE client_id = ${clientId}
        ORDER BY is_primary DESC, name
    `);
}

export async function createClientContact(data: {
    clientId: number;
    name: string;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
    isPrimary?: boolean;
    notes?: string | null;
}) {
    // If setting as primary, unset other primaries
    if (data.isPrimary) {
        await db.execute(sql`
            UPDATE office_client_contacts SET is_primary = 0
            WHERE client_id = ${data.clientId}
        `);
    }

    const result = await db.execute(sql`
        INSERT INTO office_client_contacts (client_id, name, title, email, phone, is_primary, notes)
        VALUES (
            ${data.clientId},
            ${data.name},
            ${data.title || null},
            ${data.email || null},
            ${data.phone || null},
            ${data.isPrimary ? 1 : 0},
            ${data.notes || null}
        )
    `);

    return (result[0] as any).insertId;
}

export async function updateClientContact(contactId: number, data: {
    name?: string;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
    isPrimary?: boolean;
    notes?: string | null;
}) {
    // If setting as primary, get client_id first then unset other primaries
    if (data.isPrimary) {
        const contactResult = await db.execute(sql`
            SELECT client_id FROM office_client_contacts WHERE id = ${contactId}
        `);
        const contact = (contactResult[0] as unknown as any[])[0];

        if (contact) {
            await db.execute(sql`
                UPDATE office_client_contacts SET is_primary = 0
                WHERE client_id = ${contact.client_id} AND id != ${contactId}
            `);
        }
    }

    // Update with conditional logic - only update provided fields
    const sets: string[] = [];

    if (data.name !== undefined) {
        await db.execute(sql`UPDATE office_client_contacts SET name = ${data.name} WHERE id = ${contactId}`);
    }
    if (data.title !== undefined) {
        await db.execute(sql`UPDATE office_client_contacts SET title = ${data.title} WHERE id = ${contactId}`);
    }
    if (data.email !== undefined) {
        await db.execute(sql`UPDATE office_client_contacts SET email = ${data.email} WHERE id = ${contactId}`);
    }
    if (data.phone !== undefined) {
        await db.execute(sql`UPDATE office_client_contacts SET phone = ${data.phone} WHERE id = ${contactId}`);
    }
    if (data.isPrimary !== undefined) {
        await db.execute(sql`UPDATE office_client_contacts SET is_primary = ${data.isPrimary ? 1 : 0} WHERE id = ${contactId}`);
    }
    if (data.notes !== undefined) {
        await db.execute(sql`UPDATE office_client_contacts SET notes = ${data.notes} WHERE id = ${contactId}`);
    }

    return contactId;
}

export async function deleteClientContact(contactId: number) {
    return db.execute(sql`
        DELETE FROM office_client_contacts WHERE id = ${contactId}
    `);
}

export async function findClientProjects(clientId: number) {
    return db.execute(sql`
        SELECT p.*,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
        FROM projects p
        WHERE p.office_client_id = ${clientId}
        ORDER BY p.created_at DESC
    `);
}
