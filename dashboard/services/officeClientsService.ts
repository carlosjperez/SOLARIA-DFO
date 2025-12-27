/**
 * SOLARIA DFO - Office Clients Service
 * CRM client management for Office portal
 */

import type { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// Types
export interface OfficeClient {
    id: number;
    name: string;
    commercial_name: string | null;
    industry: string | null;
    company_size: 'startup' | 'small' | 'medium' | 'enterprise';
    status: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned';
    primary_email: string | null;
    primary_phone: string | null;
    website: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string;
    tax_id: string | null;
    fiscal_name: string | null;
    lifetime_value: number;
    total_projects: number;
    logo_url: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
    assigned_to: number | null;
}

export interface OfficeClientWithDetails extends OfficeClient {
    created_by_name?: string;
    assigned_to_name?: string;
    contacts_count?: number;
    active_projects_count?: number;
}

export interface OfficeClientContact {
    id: number;
    client_id: number;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
    is_primary: boolean;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface OfficePayment {
    id: number;
    client_id: number | null;
    project_id: number | null;
    amount: number;
    currency: string;
    status: 'pending' | 'received' | 'cancelled' | 'refunded';
    payment_type: 'deposit' | 'milestone' | 'final' | 'recurring' | 'other';
    payment_date: Date | null;
    due_date: Date | null;
    reference: string | null;
    invoice_number: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    created_by: number | null;
}

export interface ClientFilters {
    status?: string;
    industry?: string;
    company_size?: string;
    assigned_to?: number;
    search?: string;
    limit?: number;
    offset?: number;
}

export class OfficeClientsService {
    private db: Connection;

    constructor(db: Connection) {
        this.db = db;
    }

    // ========================================================================
    // Clients CRUD
    // ========================================================================

    /**
     * Get all clients with optional filters
     */
    async getClients(filters: ClientFilters = {}): Promise<{ clients: OfficeClientWithDetails[]; total: number }> {
        let whereClause = '1=1';
        const params: unknown[] = [];

        if (filters.status) {
            whereClause += ' AND c.status = ?';
            params.push(filters.status);
        }

        if (filters.industry) {
            whereClause += ' AND c.industry = ?';
            params.push(filters.industry);
        }

        if (filters.company_size) {
            whereClause += ' AND c.company_size = ?';
            params.push(filters.company_size);
        }

        if (filters.assigned_to) {
            whereClause += ' AND c.assigned_to = ?';
            params.push(filters.assigned_to);
        }

        if (filters.search) {
            whereClause += ' AND (c.name LIKE ? OR c.commercial_name LIKE ? OR c.primary_email LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Get total count
        const [countResult] = await this.db.execute<RowDataPacket[]>(
            `SELECT COUNT(*) as total FROM office_clients c WHERE ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get paginated results
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;

        const [rows] = await this.db.execute<RowDataPacket[]>(`
            SELECT
                c.*,
                creator.name as created_by_name,
                manager.name as assigned_to_name,
                (SELECT COUNT(*) FROM office_client_contacts WHERE client_id = c.id) as contacts_count,
                (SELECT COUNT(*) FROM projects WHERE office_client_id = c.id AND status NOT IN ('completed', 'cancelled')) as active_projects_count
            FROM office_clients c
            LEFT JOIN users creator ON c.created_by = creator.id
            LEFT JOIN users manager ON c.assigned_to = manager.id
            WHERE ${whereClause}
            ORDER BY c.updated_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        return {
            clients: rows as OfficeClientWithDetails[],
            total,
        };
    }

    /**
     * Get a single client by ID
     */
    async getClient(id: number): Promise<OfficeClientWithDetails | null> {
        const [rows] = await this.db.execute<RowDataPacket[]>(`
            SELECT
                c.*,
                creator.name as created_by_name,
                manager.name as assigned_to_name,
                (SELECT COUNT(*) FROM office_client_contacts WHERE client_id = c.id) as contacts_count,
                (SELECT COUNT(*) FROM projects WHERE office_client_id = c.id AND status NOT IN ('completed', 'cancelled')) as active_projects_count
            FROM office_clients c
            LEFT JOIN users creator ON c.created_by = creator.id
            LEFT JOIN users manager ON c.assigned_to = manager.id
            WHERE c.id = ?
        `, [id]);

        return rows.length > 0 ? (rows[0] as OfficeClientWithDetails) : null;
    }

    /**
     * Create a new client
     */
    async createClient(data: Partial<OfficeClient>): Promise<number> {
        const [result] = await this.db.execute<ResultSetHeader>(`
            INSERT INTO office_clients (
                name, commercial_name, industry, company_size, status,
                primary_email, primary_phone, website,
                address_line1, address_line2, city, state, postal_code, country,
                tax_id, fiscal_name, logo_url, notes, created_by, assigned_to
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.name,
            data.commercial_name || null,
            data.industry || null,
            data.company_size || 'small',
            data.status || 'lead',
            data.primary_email || null,
            data.primary_phone || null,
            data.website || null,
            data.address_line1 || null,
            data.address_line2 || null,
            data.city || null,
            data.state || null,
            data.postal_code || null,
            data.country || 'Mexico',
            data.tax_id || null,
            data.fiscal_name || null,
            data.logo_url || null,
            data.notes || null,
            data.created_by || null,
            data.assigned_to || null,
        ]);

        return result.insertId;
    }

    /**
     * Update a client
     */
    async updateClient(id: number, data: Partial<OfficeClient>): Promise<boolean> {
        const updates: string[] = [];
        const values: unknown[] = [];

        const fields: (keyof OfficeClient)[] = [
            'name', 'commercial_name', 'industry', 'company_size', 'status',
            'primary_email', 'primary_phone', 'website',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'tax_id', 'fiscal_name', 'logo_url', 'notes', 'assigned_to',
        ];

        for (const field of fields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (updates.length === 0) {
            return false;
        }

        values.push(id);
        await this.db.execute(
            `UPDATE office_clients SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return true;
    }

    /**
     * Delete a client (soft delete by setting status to 'churned')
     */
    async deleteClient(id: number): Promise<boolean> {
        const [result] = await this.db.execute<ResultSetHeader>(
            'UPDATE office_clients SET status = ? WHERE id = ?',
            ['churned', id]
        );
        return result.affectedRows > 0;
    }

    // ========================================================================
    // Contacts CRUD
    // ========================================================================

    /**
     * Get all contacts for a client
     */
    async getClientContacts(clientId: number): Promise<OfficeClientContact[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(
            'SELECT * FROM office_client_contacts WHERE client_id = ? ORDER BY is_primary DESC, name ASC',
            [clientId]
        );
        return rows.map(row => ({
            ...row,
            is_primary: Boolean(row.is_primary),
        })) as OfficeClientContact[];
    }

    /**
     * Get a single contact
     */
    async getContact(contactId: number): Promise<OfficeClientContact | null> {
        const [rows] = await this.db.execute<RowDataPacket[]>(
            'SELECT * FROM office_client_contacts WHERE id = ?',
            [contactId]
        );
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            is_primary: Boolean(rows[0].is_primary),
        } as OfficeClientContact;
    }

    /**
     * Create a contact
     */
    async createContact(clientId: number, data: Partial<OfficeClientContact>): Promise<number> {
        // If this is marked as primary, unset other primary contacts
        if (data.is_primary) {
            await this.db.execute(
                'UPDATE office_client_contacts SET is_primary = 0 WHERE client_id = ?',
                [clientId]
            );
        }

        const [result] = await this.db.execute<ResultSetHeader>(`
            INSERT INTO office_client_contacts (client_id, name, title, email, phone, is_primary, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            clientId,
            data.name,
            data.title || null,
            data.email || null,
            data.phone || null,
            data.is_primary ? 1 : 0,
            data.notes || null,
        ]);

        return result.insertId;
    }

    /**
     * Update a contact
     */
    async updateContact(contactId: number, data: Partial<OfficeClientContact>): Promise<boolean> {
        // If this is marked as primary, unset other primary contacts
        if (data.is_primary) {
            const contact = await this.getContact(contactId);
            if (contact) {
                await this.db.execute(
                    'UPDATE office_client_contacts SET is_primary = 0 WHERE client_id = ? AND id != ?',
                    [contact.client_id, contactId]
                );
            }
        }

        const updates: string[] = [];
        const values: unknown[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.title !== undefined) {
            updates.push('title = ?');
            values.push(data.title);
        }
        if (data.email !== undefined) {
            updates.push('email = ?');
            values.push(data.email);
        }
        if (data.phone !== undefined) {
            updates.push('phone = ?');
            values.push(data.phone);
        }
        if (data.is_primary !== undefined) {
            updates.push('is_primary = ?');
            values.push(data.is_primary ? 1 : 0);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            values.push(data.notes);
        }

        if (updates.length === 0) {
            return false;
        }

        values.push(contactId);
        await this.db.execute(
            `UPDATE office_client_contacts SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return true;
    }

    /**
     * Delete a contact
     */
    async deleteContact(contactId: number): Promise<boolean> {
        const [result] = await this.db.execute<ResultSetHeader>(
            'DELETE FROM office_client_contacts WHERE id = ?',
            [contactId]
        );
        return result.affectedRows > 0;
    }

    // ========================================================================
    // Client Projects
    // ========================================================================

    /**
     * Get projects for a client
     */
    async getClientProjects(clientId: number): Promise<any[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(`
            SELECT
                p.id, p.name, p.code, p.status, p.priority,
                p.budget, p.deadline, p.completion_percentage,
                p.created_at, p.updated_at
            FROM projects p
            WHERE p.office_client_id = ?
            ORDER BY p.updated_at DESC
        `, [clientId]);
        return rows;
    }

    /**
     * Assign a project to a client
     */
    async assignProjectToClient(clientId: number, projectId: number): Promise<boolean> {
        const [result] = await this.db.execute<ResultSetHeader>(
            'UPDATE projects SET office_client_id = ? WHERE id = ?',
            [clientId, projectId]
        );

        // Update client total projects count
        if (result.affectedRows > 0) {
            await this.updateClientProjectCount(clientId);
        }

        return result.affectedRows > 0;
    }

    /**
     * Remove project from client
     */
    async removeProjectFromClient(projectId: number): Promise<boolean> {
        // Get current client before removing
        const [projects] = await this.db.execute<RowDataPacket[]>(
            'SELECT office_client_id FROM projects WHERE id = ?',
            [projectId]
        );
        const clientId = projects[0]?.office_client_id;

        const [result] = await this.db.execute<ResultSetHeader>(
            'UPDATE projects SET office_client_id = NULL WHERE id = ?',
            [projectId]
        );

        // Update client total projects count
        if (result.affectedRows > 0 && clientId) {
            await this.updateClientProjectCount(clientId);
        }

        return result.affectedRows > 0;
    }

    /**
     * Update client's total projects count
     */
    private async updateClientProjectCount(clientId: number): Promise<void> {
        await this.db.execute(`
            UPDATE office_clients
            SET total_projects = (
                SELECT COUNT(*) FROM projects WHERE office_client_id = ?
            )
            WHERE id = ?
        `, [clientId, clientId]);
    }

    // ========================================================================
    // Payments
    // ========================================================================

    /**
     * Get payments for a client
     */
    async getClientPayments(clientId: number): Promise<OfficePayment[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(`
            SELECT p.*, proj.name as project_name
            FROM office_payments p
            LEFT JOIN projects proj ON p.project_id = proj.id
            WHERE p.client_id = ?
            ORDER BY p.payment_date DESC, p.created_at DESC
        `, [clientId]);
        return rows as OfficePayment[];
    }

    /**
     * Create a payment
     */
    async createPayment(data: Partial<OfficePayment>): Promise<number> {
        const [result] = await this.db.execute<ResultSetHeader>(`
            INSERT INTO office_payments (
                client_id, project_id, amount, currency, status, payment_type,
                payment_date, due_date, reference, invoice_number, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.client_id || null,
            data.project_id || null,
            data.amount,
            data.currency || 'MXN',
            data.status || 'pending',
            data.payment_type || 'milestone',
            data.payment_date || null,
            data.due_date || null,
            data.reference || null,
            data.invoice_number || null,
            data.notes || null,
            data.created_by || null,
        ]);

        // Update client lifetime value if payment is received
        if (data.status === 'received' && data.client_id) {
            await this.updateClientLifetimeValue(data.client_id);
        }

        return result.insertId;
    }

    /**
     * Update a payment
     */
    async updatePayment(paymentId: number, data: Partial<OfficePayment>): Promise<boolean> {
        const updates: string[] = [];
        const values: unknown[] = [];

        const fields: (keyof OfficePayment)[] = [
            'amount', 'currency', 'status', 'payment_type',
            'payment_date', 'due_date', 'reference', 'invoice_number', 'notes',
        ];

        for (const field of fields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (updates.length === 0) {
            return false;
        }

        values.push(paymentId);
        await this.db.execute(
            `UPDATE office_payments SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Update client lifetime value if relevant
        const [payments] = await this.db.execute<RowDataPacket[]>(
            'SELECT client_id FROM office_payments WHERE id = ?',
            [paymentId]
        );
        if (payments[0]?.client_id) {
            await this.updateClientLifetimeValue(payments[0].client_id);
        }

        return true;
    }

    /**
     * Update client's lifetime value based on received payments
     */
    private async updateClientLifetimeValue(clientId: number): Promise<void> {
        await this.db.execute(`
            UPDATE office_clients
            SET lifetime_value = (
                SELECT COALESCE(SUM(amount), 0)
                FROM office_payments
                WHERE client_id = ? AND status = 'received'
            )
            WHERE id = ?
        `, [clientId, clientId]);
    }

    // ========================================================================
    // Statistics
    // ========================================================================

    /**
     * Get client statistics
     */
    async getClientStats(): Promise<{
        total: number;
        by_status: Record<string, number>;
        by_size: Record<string, number>;
        total_lifetime_value: number;
    }> {
        const [totalResult] = await this.db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM office_clients'
        );

        const [statusResult] = await this.db.execute<RowDataPacket[]>(
            'SELECT status, COUNT(*) as count FROM office_clients GROUP BY status'
        );

        const [sizeResult] = await this.db.execute<RowDataPacket[]>(
            'SELECT company_size, COUNT(*) as count FROM office_clients GROUP BY company_size'
        );

        const [ltvResult] = await this.db.execute<RowDataPacket[]>(
            'SELECT SUM(lifetime_value) as total_ltv FROM office_clients'
        );

        return {
            total: totalResult[0].total,
            by_status: Object.fromEntries(statusResult.map(r => [r.status, r.count])),
            by_size: Object.fromEntries(sizeResult.map(r => [r.company_size, r.count])),
            total_lifetime_value: ltvResult[0].total_ltv || 0,
        };
    }

    /**
     * Get industries list
     */
    async getIndustries(): Promise<string[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(
            'SELECT DISTINCT industry FROM office_clients WHERE industry IS NOT NULL ORDER BY industry'
        );
        return rows.map(r => r.industry);
    }
}

export default OfficeClientsService;
