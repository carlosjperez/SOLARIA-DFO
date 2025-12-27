/**
 * SOLARIA DFO - Office Clients Schema (Drizzle ORM)
 * CRM client management for Office portal
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    json,
    decimal,
    date,
    timestamp,
    mysqlEnum,
    tinyint,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { projects } from './projects.js';

// Company size enum
export const companySizeEnum = mysqlEnum('company_size', [
    'startup',
    'small',
    'medium',
    'enterprise',
]);

// Client status enum
export const clientStatusEnum = mysqlEnum('client_status', [
    'lead',
    'prospect',
    'active',
    'inactive',
    'churned',
]);

// Payment status enum
export const paymentStatusEnum = mysqlEnum('payment_status', [
    'pending',
    'received',
    'cancelled',
    'refunded',
]);

// Payment type enum
export const paymentTypeEnum = mysqlEnum('payment_type', [
    'deposit',
    'milestone',
    'final',
    'recurring',
    'other',
]);

// Office Clients table
export const officeClients = mysqlTable('office_clients', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 200 }).notNull(),
    commercialName: varchar('commercial_name', { length: 200 }),
    industry: varchar('industry', { length: 100 }),
    companySize: companySizeEnum.default('small'),
    status: clientStatusEnum.default('lead'),

    // Contact Info
    primaryEmail: varchar('primary_email', { length: 255 }),
    primaryPhone: varchar('primary_phone', { length: 50 }),
    website: varchar('website', { length: 255 }),

    // Address
    addressLine1: varchar('address_line1', { length: 255 }),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 100 }).default('Mexico'),

    // Business Info
    taxId: varchar('tax_id', { length: 50 }),
    fiscalName: varchar('fiscal_name', { length: 255 }),

    // Metrics
    lifetimeValue: decimal('lifetime_value', { precision: 15, scale: 2 }).default('0'),
    totalProjects: int('total_projects').default(0),

    // Logo
    logoUrl: varchar('logo_url', { length: 500 }),

    // Notes
    notes: text('notes'),

    // Audit
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
    assignedTo: int('assigned_to').references(() => users.id, { onDelete: 'set null' }),
});

// Office Client Contacts table
export const officeClientContacts = mysqlTable('office_client_contacts', {
    id: int('id').primaryKey().autoincrement(),
    clientId: int('client_id').notNull().references(() => officeClients.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    title: varchar('title', { length: 100 }),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    isPrimary: tinyint('is_primary').default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Office Payments table
export const officePayments = mysqlTable('office_payments', {
    id: int('id').primaryKey().autoincrement(),
    clientId: int('client_id').references(() => officeClients.id, { onDelete: 'set null' }),
    projectId: int('project_id').references(() => projects.id, { onDelete: 'set null' }),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('MXN'),
    status: paymentStatusEnum.default('pending'),
    paymentType: paymentTypeEnum.default('milestone'),
    paymentDate: date('payment_date'),
    dueDate: date('due_date'),
    reference: varchar('reference', { length: 100 }),
    invoiceNumber: varchar('invoice_number', { length: 50 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
});

// Relations
export const officeClientsRelations = relations(officeClients, ({ one, many }) => ({
    createdByUser: one(users, {
        fields: [officeClients.createdBy],
        references: [users.id],
        relationName: 'clientCreator',
    }),
    assignedToUser: one(users, {
        fields: [officeClients.assignedTo],
        references: [users.id],
        relationName: 'clientManager',
    }),
    contacts: many(officeClientContacts),
    payments: many(officePayments),
}));

export const officeClientContactsRelations = relations(officeClientContacts, ({ one }) => ({
    client: one(officeClients, {
        fields: [officeClientContacts.clientId],
        references: [officeClients.id],
    }),
}));

export const officePaymentsRelations = relations(officePayments, ({ one }) => ({
    client: one(officeClients, {
        fields: [officePayments.clientId],
        references: [officeClients.id],
    }),
    project: one(projects, {
        fields: [officePayments.projectId],
        references: [projects.id],
    }),
    createdByUser: one(users, {
        fields: [officePayments.createdBy],
        references: [users.id],
    }),
}));

// Type exports
export type OfficeClient = typeof officeClients.$inferSelect;
export type NewOfficeClient = typeof officeClients.$inferInsert;
export type OfficeClientContact = typeof officeClientContacts.$inferSelect;
export type NewOfficeClientContact = typeof officeClientContacts.$inferInsert;
export type OfficePayment = typeof officePayments.$inferSelect;
export type NewOfficePayment = typeof officePayments.$inferInsert;
