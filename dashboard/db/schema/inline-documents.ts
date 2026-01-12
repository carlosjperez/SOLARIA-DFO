/**
 * SOLARIA DFO - Inline Documents Schema (Drizzle ORM)
 * Stores markdown documents directly in the database with versioning
 *
 * Created: 2026-01-12 - Phase 2.4: Schema creation for Drizzle migration
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    longtext,
    boolean,
    timestamp,
    mysqlEnum,
    index,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects.js';
import { aiAgents } from './agents.js';

// ============================================================================
// Enums
// ============================================================================

/**
 * Document type enum
 */
export const inlineDocumentTypeEnum = mysqlEnum('type', [
    'plan',
    'spec',
    'report',
    'manual',
    'adr',
    'roadmap',
    'audit',
    'other',
]);

// ============================================================================
// Inline Documents Table
// ============================================================================

/**
 * inline_documents table
 * Stores markdown documents with versioning support
 * When a document is updated, the old version is archived (is_active=0)
 * and a new version is created linking to the parent via parent_version_id
 */
export const inlineDocuments = mysqlTable(
    'inline_documents',
    {
        id: int('id').primaryKey().autoincrement(),
        projectId: int('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 255 }).notNull(),
        type: inlineDocumentTypeEnum.default('plan'),
        contentMd: longtext('content_md').notNull(),
        version: int('version').default(1).notNull(),
        isActive: boolean('is_active').default(true).notNull(),

        // Versioning
        parentVersionId: int('parent_version_id'),
        changeSummary: varchar('change_summary', { length: 500 }),
        archivedAt: timestamp('archived_at'),

        // Audit
        createdByAgentId: int('created_by_agent_id').references(() => aiAgents.id, {
            onDelete: 'set null',
        }),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        // Indexes
        projectIdIdx: index('idx_inline_documents_project_id').on(table.projectId),
        typeIdx: index('idx_inline_documents_type').on(table.type),
        isActiveIdx: index('idx_inline_documents_is_active').on(table.isActive),
        projectTypeIdx: index('idx_inline_documents_project_type').on(
            table.projectId,
            table.type
        ),
        parentVersionIdx: index('idx_inline_documents_parent_version').on(
            table.parentVersionId
        ),
    })
);

// ============================================================================
// Relations
// ============================================================================

export const inlineDocumentsRelations = relations(inlineDocuments, ({ one }) => ({
    project: one(projects, {
        fields: [inlineDocuments.projectId],
        references: [projects.id],
    }),
    createdBy: one(aiAgents, {
        fields: [inlineDocuments.createdByAgentId],
        references: [aiAgents.id],
    }),
    parentVersion: one(inlineDocuments, {
        fields: [inlineDocuments.parentVersionId],
        references: [inlineDocuments.id],
    }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type InlineDocument = typeof inlineDocuments.$inferSelect;
export type NewInlineDocument = typeof inlineDocuments.$inferInsert;
