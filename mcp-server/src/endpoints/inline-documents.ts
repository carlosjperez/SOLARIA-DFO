/**
 * Inline Documents Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-006
 *
 * CRUD operations for inline documents with versioning and full-text search
 */

import { z } from 'zod';
import { ResponseBuilder } from '../utils/response-builder';
import { db } from '../database';
import { formatDocument, formatDocumentList } from '../utils/formatters';
import type { Tool } from '../types/mcp';

// ============================================================================
// Constants
// ============================================================================

const VERSION = '2.0.0';

const DOCUMENT_TYPES = ['plan', 'spec', 'report', 'manual', 'adr', 'roadmap', 'audit', 'other'] as const;

// ============================================================================
// Types
// ============================================================================

interface InlineDocument {
  id: number;
  project_id: number;
  name: string;
  type: string;
  content_md?: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_agent_id?: number;
  project_name?: string;
  parent_version_id?: number;
  change_summary?: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateDocumentInputSchema = z.object({
  project_id: z.number().int().positive().optional(),
  name: z.string().min(3).max(200),
  type: z.enum(DOCUMENT_TYPES).default('plan'),
  content_md: z.string().min(1),
  format: z.enum(['json', 'human']).default('json'),
});

const GetDocumentInputSchema = z.object({
  document_id: z.number().int().positive(),
  project_id: z.number().int().positive().optional(),
  include_content: z.boolean().default(true),
  format: z.enum(['json', 'human']).default('json'),
});

const ListDocumentsInputSchema = z.object({
  project_id: z.number().int().positive().optional(),
  type: z.enum(DOCUMENT_TYPES).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  format: z.enum(['json', 'human']).default('json'),
});

const UpdateDocumentInputSchema = z.object({
  document_id: z.number().int().positive(),
  project_id: z.number().int().positive().optional(),
  name: z.string().min(3).max(200).optional(),
  type: z.enum(DOCUMENT_TYPES).optional(),
  content_md: z.string().optional(),
  change_summary: z.string().max(500).optional(),
  format: z.enum(['json', 'human']).default('json'),
});

const DeleteDocumentInputSchema = z.object({
  document_id: z.number().int().positive(),
  project_id: z.number().int().positive().optional(),
  format: z.enum(['json', 'human']).default('json'),
});

const SearchDocumentsInputSchema = z.object({
  query: z.string().min(2),
  project_id: z.number().int().positive().optional(),
  type: z.enum(DOCUMENT_TYPES).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  format: z.enum(['json', 'human']).default('json'),
});

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get document by ID with optional content
 */
async function getDocumentById(
  documentId: number,
  projectId?: number,
  includeContent: boolean = true
): Promise<InlineDocument | null> {
  const contentField = includeContent ? 'd.content_md,' : '';
  const query = `
    SELECT d.id, d.project_id, d.name, d.type, ${contentField}
           d.version, d.is_active, d.created_at, d.updated_at,
           d.created_by_agent_id, d.parent_version_id, d.change_summary,
           p.name as project_name
    FROM inline_documents d
    LEFT JOIN projects p ON d.project_id = p.id
    WHERE d.id = ? AND d.is_active = 1
      AND (? IS NULL OR d.project_id = ?)
  `;

  const results = await db.query(query, [documentId, projectId, projectId]);
  return results[0] || null;
}

/**
 * Check if document name is duplicate within project
 */
async function isDuplicateName(
  name: string,
  projectId?: number,
  excludeId?: number
): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count
    FROM inline_documents
    WHERE name = ? AND is_active = 1
      AND (? IS NULL OR project_id = ?)
      AND (? IS NULL OR id != ?)
  `;

  const results = await db.query(query, [name, projectId, projectId, excludeId, excludeId]);
  return (results[0]?.count || 0) > 0;
}

// ============================================================================
// Endpoint Implementations
// ============================================================================

/**
 * Create a new inline document
 */
export const createInlineDocument: Tool = {
  name: 'create_inline_document',
  description: 'Create a new inline document stored directly in the system',
  inputSchema: CreateDocumentInputSchema,

  async execute(params: z.infer<typeof CreateDocumentInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      // Check for duplicate name
      if (await isDuplicateName(params.name, params.project_id)) {
        return builder.error(
          'DUPLICATE_DOCUMENT',
          `A document with name "${params.name}" already exists`,
          { name: params.name }
        );
      }

      const query = `
        INSERT INTO inline_documents (
          project_id, name, type, content_md, version, is_active, created_by_agent_id
        ) VALUES (?, ?, ?, ?, 1, 1, ?)
      `;

      const result = await db.execute(query, [
        params.project_id || null,
        params.name,
        params.type,
        params.content_md,
        null, // created_by_agent_id
      ]);

      const document = await getDocumentById(result.insertId);

      const formatted = params.format === 'human' && document
        ? formatDocument(document as any)
        : undefined;

      return builder.success({
        document,
        message: `Document "${params.name}" created successfully`,
      }, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

/**
 * Get a specific inline document by ID
 */
export const getInlineDocument: Tool = {
  name: 'get_inline_document',
  description: 'Get a specific inline document by ID with full content',
  inputSchema: GetDocumentInputSchema,

  async execute(params: z.infer<typeof GetDocumentInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      const document = await getDocumentById(
        params.document_id,
        params.project_id,
        params.include_content
      );

      if (!document) {
        return builder.error(
          'DOCUMENT_NOT_FOUND',
          `Document with ID ${params.document_id} not found`,
          { document_id: params.document_id }
        );
      }

      const formatted = params.format === 'human'
        ? formatDocument(document as any)
        : undefined;

      return builder.success({ document }, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

/**
 * List all inline documents for a project
 */
export const listInlineDocuments: Tool = {
  name: 'list_inline_documents',
  description: 'List all inline documents for a project',
  inputSchema: ListDocumentsInputSchema,

  async execute(params: z.infer<typeof ListDocumentsInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      const query = `
        SELECT d.id, d.project_id, d.name, d.type,
               d.version, d.is_active, d.created_at, d.updated_at,
               d.created_by_agent_id, p.name as project_name
        FROM inline_documents d
        LEFT JOIN projects p ON d.project_id = p.id
        WHERE d.is_active = 1
          AND (? IS NULL OR d.project_id = ?)
          AND (? IS NULL OR d.type = ?)
        ORDER BY d.updated_at DESC
        LIMIT ?
      `;

      const documents = await db.query(query, [
        params.project_id, params.project_id,
        params.type, params.type,
        params.limit,
      ]);

      const formatted = params.format === 'human'
        ? formatDocumentList(documents as any[])
        : undefined;

      return builder.success({
        documents,
        total: documents.length,
        filters: {
          project_id: params.project_id,
          type: params.type,
        },
      }, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

/**
 * Update an inline document (creates new version)
 */
export const updateInlineDocument: Tool = {
  name: 'update_inline_document',
  description: 'Update an inline document, creating a new version',
  inputSchema: UpdateDocumentInputSchema,

  async execute(params: z.infer<typeof UpdateDocumentInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      // Get existing document
      const existing = await getDocumentById(params.document_id, params.project_id);

      if (!existing) {
        return builder.error(
          'DOCUMENT_NOT_FOUND',
          `Document with ID ${params.document_id} not found`,
          { document_id: params.document_id }
        );
      }

      // Check for duplicate name if name is being changed
      const newName = params.name || existing.name;
      if (params.name && params.name !== existing.name) {
        if (await isDuplicateName(params.name, params.project_id, params.document_id)) {
          return builder.error(
            'DUPLICATE_DOCUMENT',
            `A document with name "${params.name}" already exists`,
            { name: params.name }
          );
        }
      }

      // Archive old version
      await db.execute(
        'UPDATE inline_documents SET is_active = 0, archived_at = NOW() WHERE id = ?',
        [params.document_id]
      );

      // Insert new version
      const insertQuery = `
        INSERT INTO inline_documents (
          project_id, name, type, content_md, version, is_active,
          parent_version_id, change_summary, created_by_agent_id
        ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
      `;

      const result = await db.execute(insertQuery, [
        existing.project_id,
        params.name || existing.name,
        params.type || existing.type,
        params.content_md !== undefined ? params.content_md : existing.content_md,
        existing.version + 1,
        params.document_id,
        params.change_summary || null,
        null, // created_by_agent_id
      ]);

      const updatedDocument = await getDocumentById(result.insertId);

      const formatted = params.format === 'human' && updatedDocument
        ? formatDocument(updatedDocument as any)
        : undefined;

      return builder.success({
        document: updatedDocument,
        previous_version: existing.version,
        message: `Document updated to version ${existing.version + 1}`,
      }, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

/**
 * Delete an inline document (soft delete)
 */
export const deleteInlineDocument: Tool = {
  name: 'delete_inline_document',
  description: 'Delete an inline document (soft delete)',
  inputSchema: DeleteDocumentInputSchema,

  async execute(params: z.infer<typeof DeleteDocumentInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      // Get existing document
      const existing = await getDocumentById(params.document_id, params.project_id);

      if (!existing) {
        return builder.error(
          'DOCUMENT_NOT_FOUND',
          `Document with ID ${params.document_id} not found or already deleted`,
          { document_id: params.document_id }
        );
      }

      // Soft delete
      await db.execute(
        'UPDATE inline_documents SET is_active = 0, archived_at = NOW() WHERE id = ?',
        [params.document_id]
      );

      return builder.success({
        deleted: true,
        document_id: params.document_id,
        name: existing.name,
        message: `Document "${existing.name}" has been deleted`,
      }, {
        format: params.format,
        formatted: params.format === 'human'
          ? `✓ Document "${existing.name}" (ID: ${params.document_id}) has been deleted.`
          : undefined,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

/**
 * Search across all inline documents using full-text search
 */
export const searchDocuments: Tool = {
  name: 'search_documents',
  description: 'Search across all inline documents using full-text search',
  inputSchema: SearchDocumentsInputSchema,

  async execute(params: z.infer<typeof SearchDocumentsInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      // Use LIKE for basic search (FULLTEXT would require index setup)
      const searchPattern = `%${params.query}%`;

      const query = `
        SELECT d.id, d.project_id, d.name, d.type,
               d.version, d.is_active, d.created_at, d.updated_at,
               d.created_by_agent_id, p.name as project_name
        FROM inline_documents d
        LEFT JOIN projects p ON d.project_id = p.id
        WHERE d.is_active = 1
          AND (d.name LIKE ? OR d.content_md LIKE ?)
          AND (? IS NULL OR d.project_id = ?)
          AND (? IS NULL OR d.type = ?)
        ORDER BY d.updated_at DESC
        LIMIT ?
      `;

      const documents = await db.query(query, [
        searchPattern, searchPattern,
        params.project_id, params.project_id,
        params.type, params.type,
        params.limit,
      ]);

      const formatted = params.format === 'human'
        ? formatDocumentList(documents as any[])
        : undefined;

      return builder.success({
        documents,
        total: documents.length,
        query: params.query,
        filters: {
          project_id: params.project_id,
          type: params.type,
        },
      }, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

// ============================================================================
// Export
// ============================================================================

export const inlineDocumentTools = [
  createInlineDocument,
  getInlineDocument,
  listInlineDocuments,
  updateInlineDocument,
  deleteInlineDocument,
  searchDocuments,
];
