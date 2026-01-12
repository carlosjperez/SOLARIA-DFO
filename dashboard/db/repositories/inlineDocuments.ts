/**
 * SOLARIA DFO - Inline Documents Repository (Drizzle ORM)
 * CRUD operations for markdown documents with versioning
 *
 * Updated: 2026-01-12 - Phase 2.4: Migrated to Drizzle with BaseRepository
 */

import { db } from '../index.js';
import { eq, and, like, or, sql, desc } from 'drizzle-orm';
import {
    inlineDocuments,
    type InlineDocument,
    type NewInlineDocument,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Inline Documents Repository Class
// ============================================================================

class InlineDocumentsRepository extends BaseRepository<
    InlineDocument,
    NewInlineDocument,
    typeof inlineDocuments
> {
    constructor() {
        super(inlineDocuments, 'InlineDocument');
    }

    /**
     * Find active documents by project with optional type filter
     */
    async findByProject(projectId: number, type?: string): Promise<InlineDocument[]> {
        const conditions = [
            eq(inlineDocuments.projectId, projectId),
            eq(inlineDocuments.isActive, true),
        ];

        if (type) {
            conditions.push(sql`${inlineDocuments.type} = ${type}`);
        }

        return db
            .select()
            .from(inlineDocuments)
            .where(and(...conditions))
            .orderBy(desc(inlineDocuments.updatedAt));
    }

    /**
     * Find active document by ID
     */
    async findActiveById(id: number): Promise<InlineDocument | null> {
        const result = await db
            .select()
            .from(inlineDocuments)
            .where(and(eq(inlineDocuments.id, id), eq(inlineDocuments.isActive, true)))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Create new document
     */
    async createDocument(data: {
        projectId: number;
        name: string;
        type: string;
        contentMd: string;
        createdByAgentId?: number | null;
    }): Promise<InlineDocument> {
        const insertResult = await db.insert(inlineDocuments).values({
            projectId: data.projectId,
            name: data.name,
            type: data.type as any,
            contentMd: data.contentMd,
            version: 1,
            isActive: true,
            createdByAgentId: data.createdByAgentId || null,
        });

        return this.findById(insertResult[0].insertId) as Promise<InlineDocument>;
    }

    /**
     * Update document by creating new version
     * Archives the old version and creates a new active one
     */
    async updateDocument(
        id: number,
        data: {
            name?: string;
            type?: string;
            contentMd?: string;
            changeSummary?: string | null;
            createdByAgentId?: number | null;
        }
    ): Promise<{ document: InlineDocument; previousVersion: number } | null> {
        // Get existing active document
        const currentDoc = await this.findActiveById(id);
        if (!currentDoc) {
            return null;
        }

        // Archive old version
        await db
            .update(inlineDocuments)
            .set({
                isActive: false,
                archivedAt: sql`NOW()`,
            })
            .where(eq(inlineDocuments.id, id));

        // Insert new version
        const insertResult = await db.insert(inlineDocuments).values({
            projectId: currentDoc.projectId,
            name: data.name || currentDoc.name,
            type: (data.type || currentDoc.type) as any,
            contentMd: data.contentMd !== undefined ? data.contentMd : currentDoc.contentMd,
            version: currentDoc.version + 1,
            isActive: true,
            parentVersionId: id,
            changeSummary: data.changeSummary || null,
            createdByAgentId:
                data.createdByAgentId !== undefined
                    ? data.createdByAgentId
                    : currentDoc.createdByAgentId,
        });

        const newDoc = await this.findById(insertResult[0].insertId);

        return {
            document: newDoc!,
            previousVersion: currentDoc.version,
        };
    }

    /**
     * Soft delete document (set is_active = false)
     */
    async softDelete(id: number): Promise<boolean> {
        const result = await db
            .update(inlineDocuments)
            .set({ isActive: false })
            .where(eq(inlineDocuments.id, id));

        return (result[0] as any).affectedRows > 0;
    }

    /**
     * Search documents by name or content
     */
    async search(searchTerm: string, projectId?: number): Promise<InlineDocument[]> {
        const searchPattern = `%${searchTerm}%`;

        const conditions = [
            eq(inlineDocuments.isActive, true),
            or(
                like(inlineDocuments.name, searchPattern),
                like(inlineDocuments.contentMd, searchPattern)
            ),
        ];

        if (projectId) {
            conditions.push(eq(inlineDocuments.projectId, projectId));
        }

        return db
            .select()
            .from(inlineDocuments)
            .where(and(...conditions))
            .orderBy(desc(inlineDocuments.updatedAt));
    }

    /**
     * Get document version history
     */
    async getVersionHistory(documentId: number): Promise<InlineDocument[]> {
        // Find the current version or any version in the chain
        const doc = await this.findById(documentId);
        if (!doc) return [];

        // Walk up to find the root, then get all versions
        let rootId = documentId;
        let current = doc;

        // Find root (document with no parent)
        while (current.parentVersionId) {
            rootId = current.parentVersionId;
            const parent = await this.findById(rootId);
            if (!parent) break;
            current = parent;
        }

        // Get all versions from this root
        const versions: InlineDocument[] = [];
        let nextId: number | null = rootId;

        // Traverse forward through versions
        while (nextId) {
            const version = await this.findById(nextId);
            if (version) {
                versions.push(version);
                // Find child version
                const child = await db
                    .select()
                    .from(inlineDocuments)
                    .where(eq(inlineDocuments.parentVersionId, nextId))
                    .limit(1);
                nextId = child[0]?.id || null;
            } else {
                nextId = null;
            }
        }

        return versions;
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const inlineDocumentsRepo = new InlineDocumentsRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Find documents by project
 * @deprecated Use inlineDocumentsRepo.findByProject() directly
 */
export async function findInlineDocumentsByProject(projectId: number, type?: string) {
    const docs = await inlineDocumentsRepo.findByProject(projectId, type);
    // Return in format compatible with db.execute
    return [docs, []];
}

/**
 * Find document by ID
 * @deprecated Use inlineDocumentsRepo.findActiveById() directly
 */
export async function findInlineDocumentById(id: number) {
    const doc = await inlineDocumentsRepo.findActiveById(id);
    return doc ? [[doc], []] : [[], []];
}

/**
 * Create new document
 * @deprecated Use inlineDocumentsRepo.createDocument() directly
 */
export async function createInlineDocument(data: {
    projectId: number;
    name: string;
    type: string;
    contentMd: string;
    createdByAgentId?: number | null;
}) {
    return inlineDocumentsRepo.createDocument(data);
}

/**
 * Update document (creates new version)
 * @deprecated Use inlineDocumentsRepo.updateDocument() directly
 */
export async function updateInlineDocument(
    id: number,
    data: {
        name?: string;
        type?: string;
        contentMd?: string;
        changeSummary?: string | null;
        createdByAgentId?: number | null;
    }
) {
    return inlineDocumentsRepo.updateDocument(id, data);
}

/**
 * Delete document (soft delete)
 * @deprecated Use inlineDocumentsRepo.softDelete() directly
 */
export async function deleteInlineDocument(id: number) {
    const success = await inlineDocumentsRepo.softDelete(id);
    // Return format compatible with db.execute
    return [{ affectedRows: success ? 1 : 0 }, []];
}

/**
 * Search documents
 * @deprecated Use inlineDocumentsRepo.search() directly
 */
export async function searchInlineDocuments(searchTerm: string, projectId?: number) {
    const docs = await inlineDocumentsRepo.search(searchTerm, projectId);
    return [docs, []];
}

// Export repository instance for direct usage
export { inlineDocumentsRepo };
