import { db } from '../drizzle';
import { sql, eq, and } from 'drizzle-orm';

// ============================================================================
// Inline Documents
// ============================================================================

export async function findInlineDocumentsByProject(projectId: number, type?: string) {
    if (type) {
        return db.execute(sql`
            SELECT id, project_id, name, type, version, is_active,
                   created_at, updated_at, created_by_agent_id
            FROM inline_documents
            WHERE project_id = ${projectId} AND is_active = 1 AND type = ${type}
            ORDER BY updated_at DESC
        `);
    }

    return db.execute(sql`
        SELECT id, project_id, name, type, version, is_active,
               created_at, updated_at, created_by_agent_id
        FROM inline_documents
        WHERE project_id = ${projectId} AND is_active = 1
        ORDER BY updated_at DESC
    `);
}

export async function findInlineDocumentById(id: number) {
    return db.execute(sql`
        SELECT * FROM inline_documents
        WHERE id = ${id} AND is_active = 1
    `);
}

export async function createInlineDocument(data: {
    projectId: number;
    name: string;
    type: string;
    contentMd: string;
    createdByAgentId?: number | null;
}) {
    const result = await db.execute(sql`
        INSERT INTO inline_documents (project_id, name, type, content_md, version, is_active, created_by_agent_id)
        VALUES (${data.projectId}, ${data.name}, ${data.type}, ${data.contentMd}, 1, 1, ${data.createdByAgentId || null})
    `);

    const insertId = (result[0] as any).insertId;

    // Get the newly created document
    const newDoc = await db.execute(sql`
        SELECT * FROM inline_documents WHERE id = ${insertId}
    `);

    return (newDoc[0] as any[])[0];
}

export async function updateInlineDocument(id: number, data: {
    name?: string;
    contentMd?: string;
}) {
    // Mark current version as inactive
    await db.execute(sql`
        UPDATE inline_documents SET is_active = 0 WHERE id = ${id}
    `);

    // Get current document
    const current = await db.execute(sql`
        SELECT * FROM inline_documents WHERE id = ${id}
    `);

    const currentDoc = (current[0] as any[])[0];

    // Create new version
    const result = await db.execute(sql`
        INSERT INTO inline_documents (project_id, name, type, content_md, version, is_active, created_by_agent_id)
        VALUES (
            ${currentDoc.project_id},
            ${data.name || currentDoc.name},
            ${currentDoc.type},
            ${data.contentMd || currentDoc.content_md},
            ${currentDoc.version + 1},
            1,
            ${currentDoc.created_by_agent_id}
        )
    `);

    const insertId = (result[0] as any).insertId;

    // Get the new version
    const newDoc = await db.execute(sql`
        SELECT * FROM inline_documents WHERE id = ${insertId}
    `);

    return (newDoc[0] as any[])[0];
}

export async function deleteInlineDocument(id: number) {
    return db.execute(sql`
        UPDATE inline_documents SET is_active = 0 WHERE id = ${id}
    `);
}

export async function searchInlineDocuments(searchTerm: string, projectId?: number) {
    if (projectId) {
        return db.execute(sql`
            SELECT id, project_id, name, type, version, is_active,
                   created_at, updated_at, created_by_agent_id
            FROM inline_documents
            WHERE project_id = ${projectId}
              AND is_active = 1
              AND (name LIKE ${`%${searchTerm}%`} OR content_md LIKE ${`%${searchTerm}%`})
            ORDER BY updated_at DESC
        `);
    }

    return db.execute(sql`
        SELECT id, project_id, name, type, version, is_active,
               created_at, updated_at, created_by_agent_id
        FROM inline_documents
        WHERE is_active = 1
          AND (name LIKE ${`%${searchTerm}%`} OR content_md LIKE ${`%${searchTerm}%`})
        ORDER BY updated_at DESC
    `);
}
