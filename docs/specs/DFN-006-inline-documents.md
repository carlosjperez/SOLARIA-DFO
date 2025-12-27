# DFN-006: Fix Endpoint Inline Documents

**Status:** Implementation Ready
**Author:** ECO-Lambda
**Date:** 2025-12-27
**Sprint:** 1
**Estimated Hours:** 2
**Priority:** Alta

---

## Overview

Refactor the inline documents endpoints to use the standardized ResponseBuilder pattern from DFN-002. The current implementation has inconsistent response formats and lacks proper error handling.

## Problem Statement

Current issues identified:
1. `create_inline_document` returns non-standard HTML/text responses
2. Inconsistent error handling across document operations
3. Missing Zod validation for inputs
4. No human-readable format support
5. Unclear versioning behavior

## Technical Specification

### Tool Definitions

```typescript
// Create Inline Document
{
  name: 'create_inline_document',
  description: 'Create a new inline document stored directly in the system',
  inputSchema: z.object({
    project_id: z.number().int().positive().optional(),
    name: z.string().min(3).max(200),
    type: z.enum(['plan', 'spec', 'report', 'manual', 'adr', 'roadmap', 'audit', 'other']).default('plan'),
    content_md: z.string().min(1),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Get Inline Document
{
  name: 'get_inline_document',
  description: 'Get a specific inline document by ID with full content',
  inputSchema: z.object({
    document_id: z.number().int().positive(),
    project_id: z.number().int().positive().optional(),
    include_content: z.boolean().default(true),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// List Inline Documents
{
  name: 'list_inline_documents',
  description: 'List all inline documents for a project',
  inputSchema: z.object({
    project_id: z.number().int().positive().optional(),
    type: z.enum(['plan', 'spec', 'report', 'manual', 'adr', 'roadmap', 'audit', 'other']).optional(),
    limit: z.number().int().min(1).max(100).default(20),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Update Inline Document
{
  name: 'update_inline_document',
  description: 'Update an inline document, creating a new version',
  inputSchema: z.object({
    document_id: z.number().int().positive(),
    project_id: z.number().int().positive().optional(),
    name: z.string().min(3).max(200).optional(),
    type: z.enum(['plan', 'spec', 'report', 'manual', 'adr', 'roadmap', 'audit', 'other']).optional(),
    content_md: z.string().optional(),
    change_summary: z.string().max(500).optional(),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Delete Inline Document
{
  name: 'delete_inline_document',
  description: 'Delete an inline document (soft delete)',
  inputSchema: z.object({
    document_id: z.number().int().positive(),
    project_id: z.number().int().positive().optional(),
    format: z.enum(['json', 'human']).default('json'),
  }),
}

// Search Documents
{
  name: 'search_documents',
  description: 'Search across all inline documents using full-text search',
  inputSchema: z.object({
    query: z.string().min(2),
    project_id: z.number().int().positive().optional(),
    type: z.enum(['plan', 'spec', 'report', 'manual', 'adr', 'roadmap', 'audit', 'other']).optional(),
    limit: z.number().int().min(1).max(50).default(20),
    format: z.enum(['json', 'human']).default('json'),
  }),
}
```

### Response Schemas

```typescript
// Document Response
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
}

// Create Response
interface CreateDocumentResponse {
  success: true;
  data: {
    document: InlineDocument;
    message: string;
  };
  metadata: ResponseMetadata;
}

// List Response
interface ListDocumentsResponse {
  success: true;
  data: {
    documents: InlineDocument[];
    total: number;
    filters: {
      project_id?: number;
      type?: string;
    };
  };
  metadata: ResponseMetadata;
}
```

### Human-Readable Formats

#### Single Document
```
📄 DFN-003 Health Check Specification
   Type: spec | Version: 2
   Created: Dec 27, 2025
   Updated: Dec 27, 2025
   Project: DFO Enhancement Plan

Content Preview:
────────────────────────────────────────
# DFN-003: Health Check Automatizado

**Status:** Implementation Ready
**Author:** ECO-Lambda
...
```

#### Document List
```
Found 5 documents:

1. 📄 DFN-002 API Standardization
   Type: spec | Version: 3 | Updated: Dec 27, 2025

2. 📄 DFN-003 Health Check
   Type: spec | Version: 1 | Updated: Dec 27, 2025

3. 📄 Sprint 1 Retrospective
   Type: report | Version: 1 | Updated: Dec 27, 2025
```

## Implementation Details

### File Location
`mcp-server/src/endpoints/inline-documents.ts`

### Database Queries

#### Create Document
```sql
INSERT INTO inline_documents (
  project_id, name, type, content_md, version, is_active, created_by_agent_id
) VALUES (?, ?, ?, ?, 1, 1, ?)
```

#### Get Document
```sql
SELECT d.*, p.name as project_name
FROM inline_documents d
LEFT JOIN projects p ON d.project_id = p.id
WHERE d.id = ? AND d.is_active = 1
  AND (? IS NULL OR d.project_id = ?)
```

#### List Documents
```sql
SELECT d.*, p.name as project_name
FROM inline_documents d
LEFT JOIN projects p ON d.project_id = p.id
WHERE d.is_active = 1
  AND (? IS NULL OR d.project_id = ?)
  AND (? IS NULL OR d.type = ?)
ORDER BY d.updated_at DESC
LIMIT ?
```

#### Search Documents
```sql
SELECT d.*, p.name as project_name,
  MATCH(d.name, d.content_md) AGAINST(? IN BOOLEAN MODE) as relevance
FROM inline_documents d
LEFT JOIN projects p ON d.project_id = p.id
WHERE d.is_active = 1
  AND MATCH(d.name, d.content_md) AGAINST(? IN BOOLEAN MODE)
  AND (? IS NULL OR d.project_id = ?)
  AND (? IS NULL OR d.type = ?)
ORDER BY relevance DESC
LIMIT ?
```

#### Update Document (with versioning)
```sql
-- Archive old version
UPDATE inline_documents
SET is_active = 0, archived_at = NOW()
WHERE id = ?;

-- Insert new version
INSERT INTO inline_documents (
  project_id, name, type, content_md, version, is_active,
  parent_version_id, change_summary, created_by_agent_id
)
SELECT project_id, ?, ?, ?, version + 1, 1, id, ?, ?
FROM inline_documents
WHERE id = ?;
```

### Error Handling

| Error | Code | HTTP Status |
|-------|------|-------------|
| Document not found | DOCUMENT_NOT_FOUND | 404 |
| Project mismatch | ACCESS_DENIED | 403 |
| Validation failed | VALIDATION_ERROR | 400 |
| Duplicate name | DUPLICATE_DOCUMENT | 409 |
| Database error | DATABASE_ERROR | 500 |

## Test Cases

### Create Document
1. Create with valid data
2. Create with minimum required fields
3. Reject missing name
4. Reject name too short (<3 chars)
5. Reject empty content
6. Reject invalid type

### Get Document
7. Get existing document with content
8. Get without content (include_content=false)
9. Return 404 for non-existent
10. Return 404 for deleted document
11. Enforce project isolation

### List Documents
12. List all documents
13. Filter by project_id
14. Filter by type
15. Respect limit
16. Return empty array (not error) when none found

### Update Document
17. Update content creates new version
18. Update name only
19. Update type only
20. Include change_summary
21. Reject update on deleted document

### Delete Document
22. Soft delete marks inactive
23. Deleted document not in list
24. Deleted document returns 404
25. Cannot delete already deleted

### Search Documents
26. Find by exact name
27. Find by content keyword
28. Case insensitive search
29. Respect project filter
30. Respect type filter

### Human Format
31. Correct icons in output
32. Preview truncates long content
33. All fields displayed

## Acceptance Criteria

- [ ] All 6 endpoints implemented with ResponseBuilder
- [ ] Zod validation on all inputs
- [ ] JSON and human format supported
- [ ] Versioning works correctly
- [ ] Soft delete implemented
- [ ] Full-text search working
- [ ] Tests written (minimum 30)
- [ ] Coverage > 75%
- [ ] Formatter in registry

## Related

- DFN-002: JSON-First API Standardization
- handlers.ts: Existing inline document handlers (to be deprecated)
