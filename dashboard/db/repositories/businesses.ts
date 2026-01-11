/**
 * SOLARIA DFO - Businesses Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db, pool } from '../index.js';
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

export async function countBusinesses(filters?: {
    status?: string;
}) {
    let query = `SELECT COUNT(*) as total FROM businesses WHERE 1=1`;
    const params: any[] = [];

    if (filters?.status && filters.status !== 'all') {
        query += ' AND status = ?';
        params.push(filters.status);
    }

    return pool.execute(query, params);
}

export async function findBusinessWithProjectCount(id: number) {
    return pool.execute(`
        SELECT b.id, b.name, COUNT(p.id) as project_count
        FROM businesses b
        LEFT JOIN projects p ON p.business_id = b.id AND p.status IN ('active', 'planning')
        WHERE b.id = ?
        GROUP BY b.id
    `, [id]);
}

export async function findAllBusinessesWithProjectCount(filters?: {
    status?: string;
    limit?: number;
}) {
    let query = `
        SELECT
            b.*,
            COALESCE((SELECT COUNT(*) FROM projects p WHERE p.client = b.name), 0) as project_count
        FROM businesses b
        WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status && filters.status !== 'all') {
        query += ' AND b.status = ?';
        params.push(filters.status);
    }

    query += ' ORDER BY b.name ASC';

    if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    }

    return pool.execute(query, params);
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

// ============================================================================
// Office Clients (office_clients table)
// ============================================================================

export async function findOfficeClients(filters?: {
    status?: string;
    industry?: string;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    let query = sql`SELECT * FROM office_clients WHERE 1=1`;
    const conditions = [];

    if (filters?.status) {
        conditions.push(sql`status = ${filters.status}`);
    }
    if (filters?.industry) {
        conditions.push(sql`industry = ${filters.industry}`);
    }
    if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(sql`(name LIKE ${searchTerm} OR commercial_name LIKE ${searchTerm} OR primary_email LIKE ${searchTerm})`);
    }

    // Build full query with conditions
    let fullQuery = 'SELECT * FROM office_clients WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
        fullQuery += ' AND status = ?';
        params.push(filters.status);
    }
    if (filters?.industry) {
        fullQuery += ' AND industry = ?';
        params.push(filters.industry);
    }
    if (filters?.search) {
        fullQuery += ' AND (name LIKE ? OR commercial_name LIKE ? OR primary_email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    fullQuery += ' ORDER BY updated_at DESC';

    if (filters?.limit) {
        fullQuery += ' LIMIT ?';
        params.push(filters.limit);
    }
    if (filters?.offset) {
        fullQuery += ' OFFSET ?';
        params.push(filters.offset);
    }

    return pool.execute(fullQuery, params);
}

export async function countOfficeClients(filters?: {
    status?: string;
    industry?: string;
    search?: string;
}) {
    let query = 'SELECT COUNT(*) as total FROM office_clients WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }
    if (filters?.industry) {
        query += ' AND industry = ?';
        params.push(filters.industry);
    }
    if (filters?.search) {
        query += ' AND (name LIKE ? OR commercial_name LIKE ? OR primary_email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    return pool.execute(query, params);
}

export async function findOfficeClientById(clientId: number) {
    return db.execute(sql`
        SELECT * FROM office_clients WHERE id = ${clientId}
    `);
}

export async function findOfficeClientWithDetails(clientId: number) {
    const client = await findOfficeClientById(clientId);
    const contacts = await findClientContacts(clientId);
    const projects = await db.execute(sql`
        SELECT id, name, code, status, budget, deadline
        FROM projects
        WHERE office_client_id = ${clientId}
    `);
    const payments = await db.execute(sql`
        SELECT * FROM office_payments
        WHERE client_id = ${clientId}
        ORDER BY payment_date DESC
        LIMIT 10
    `);

    return {
        client: (client[0] as unknown as any[])[0] || null,
        contacts: (contacts[0] as unknown as any[]),
        projects: (projects[0] as unknown as any[]),
        payments: (payments[0] as unknown as any[])
    };
}

export async function createOfficeClient(data: {
    name: string;
    commercialName?: string | null;
    industry?: string | null;
    companySize?: string;
    status?: string;
    primaryEmail?: string | null;
    primaryPhone?: string | null;
    website?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string;
    taxId?: string | null;
    fiscalName?: string | null;
    notes?: string | null;
    createdBy?: number | null;
    assignedTo?: number | null;
}) {
    const result = await db.execute(sql`
        INSERT INTO office_clients
        (name, commercial_name, industry, company_size, status,
         primary_email, primary_phone, website,
         address_line1, address_line2, city, state, postal_code, country,
         tax_id, fiscal_name, notes, created_by, assigned_to)
        VALUES (
            ${data.name},
            ${data.commercialName || null},
            ${data.industry || null},
            ${data.companySize || 'small'},
            ${data.status || 'lead'},
            ${data.primaryEmail || null},
            ${data.primaryPhone || null},
            ${data.website || null},
            ${data.addressLine1 || null},
            ${data.addressLine2 || null},
            ${data.city || null},
            ${data.state || null},
            ${data.postalCode || null},
            ${data.country || 'Mexico'},
            ${data.taxId || null},
            ${data.fiscalName || null},
            ${data.notes || null},
            ${data.createdBy || null},
            ${data.assignedTo || null}
        )
    `);

    return (result[0] as any).insertId;
}

export async function updateOfficeClient(clientId: number, data: Record<string, any>) {
    const allowedFields = [
        'name', 'commercial_name', 'industry', 'company_size', 'status',
        'primary_email', 'primary_phone', 'website',
        'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
        'tax_id', 'fiscal_name', 'notes', 'assigned_to', 'lifetime_value', 'logo_url'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    Object.keys(data).forEach(key => {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = ?`);
            values.push(data[key]);
        }
    });

    if (updates.length === 0) return null;

    const query = `UPDATE office_clients SET ${updates.join(', ')} WHERE id = ?`;
    values.push(clientId);

    await pool.execute(query, values);
    return findOfficeClientById(clientId);
}

export async function deleteOfficeClient(clientId: number) {
    return db.execute(sql`
        DELETE FROM office_clients WHERE id = ${clientId}
    `);
}

// ============================================================================
// Office Payments
// ============================================================================

export async function findOfficePayments(filters?: {
    status?: string;
    clientId?: number;
    projectId?: number;
    limit?: number;
    offset?: number;
}) {
    let query = `
        SELECT p.*,
               c.name as client_name,
               pr.name as project_name
        FROM office_payments p
        LEFT JOIN office_clients c ON p.client_id = c.id
        LEFT JOIN projects pr ON p.project_id = pr.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
    }
    if (filters?.clientId) {
        query += ' AND p.client_id = ?';
        params.push(filters.clientId);
    }
    if (filters?.projectId) {
        query += ' AND p.project_id = ?';
        params.push(filters.projectId);
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    }
    if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
    }

    return pool.execute(query, params);
}

export async function findOfficePaymentById(paymentId: number) {
    return db.execute(sql`
        SELECT p.*,
               c.name as client_name,
               pr.name as project_name
        FROM office_payments p
        LEFT JOIN office_clients c ON p.client_id = c.id
        LEFT JOIN projects pr ON p.project_id = pr.id
        WHERE p.id = ${paymentId}
    `);
}

export async function createOfficePayment(data: {
    clientId?: number | null;
    projectId?: number | null;
    amount: number;
    currency?: string;
    status?: string;
    paymentType?: string;
    paymentDate?: string | null;
    dueDate?: string | null;
    reference?: string | null;
    invoiceNumber?: string | null;
    notes?: string | null;
    createdBy?: number | null;
}) {
    const result = await db.execute(sql`
        INSERT INTO office_payments
        (client_id, project_id, amount, currency, status, payment_type,
         payment_date, due_date, reference, invoice_number, notes, created_by)
        VALUES (
            ${data.clientId || null},
            ${data.projectId || null},
            ${data.amount},
            ${data.currency || 'MXN'},
            ${data.status || 'pending'},
            ${data.paymentType || 'milestone'},
            ${data.paymentDate || null},
            ${data.dueDate || null},
            ${data.reference || null},
            ${data.invoiceNumber || null},
            ${data.notes || null},
            ${data.createdBy || null}
        )
    `);

    return (result[0] as any).insertId;
}

export async function updateOfficePayment(paymentId: number, data: Record<string, any>) {
    const allowedFields = [
        'amount', 'currency', 'status', 'payment_type',
        'payment_date', 'due_date', 'reference', 'invoice_number', 'notes'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    Object.keys(data).forEach(key => {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = ?`);
            values.push(data[key]);
        }
    });

    if (updates.length === 0) return null;

    const query = `UPDATE office_payments SET ${updates.join(', ')} WHERE id = ?`;
    values.push(paymentId);

    await pool.execute(query, values);
    return findOfficePaymentById(paymentId);
}

// ============================================================================
// Office Projects Stats
// ============================================================================

export async function findOfficeProjectsWithStats(filters?: {
    status?: string;
    clientId?: number;
    limit?: number;
    offset?: number;
}) {
    let query = `
        SELECT p.*,
               c.name as client_name,
               (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
               (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
               (SELECT SUM(amount) FROM office_payments WHERE project_id = p.id AND status = 'paid') as total_paid
        FROM projects p
        LEFT JOIN office_clients c ON p.office_client_id = c.id
        WHERE p.office_visible = 1
    `;
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
    }
    if (filters?.clientId) {
        query += ' AND p.office_client_id = ?';
        params.push(filters.clientId);
    }

    query += ' ORDER BY p.updated_at DESC';

    if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    }
    if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
    }

    return pool.execute(query, params);
}
