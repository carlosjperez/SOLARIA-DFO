# Tag System - Usage Guide

**Version:** 1.0.0
**Date:** 2026-01-17
**Related:** DFO-036

---

## Overview

The Tag System provides a flexible way to categorize tasks with multiple tags per task, color-coded categories, and visual representation. Tags are metadata that don't affect task status but help with organization, filtering, and visual identification.

## Key Features

- **Multiple tags per task**: Assign unlimited tags to any task
- **Color-coded**: Each tag has a customizable hex color
- **Tag types**: Built-in types (bug, feature, improvement, refactor, docs, test, other)
- **Priority tags**: Special tags for task priorities (priority-critical, priority-high, priority-medium, priority-low)
- **Audit trail**: Complete history of tag changes for accountability
- **Flexible filtering**: Filter tags by type, predefined status, or all active tags

## Predefined Tags

The system comes with 12 predefined tags:

| Tag Name | Display Name | Color | Type | Description |
|-----------|---------------|--------|------|-------------|
| bug | Bug Fix | #ef4444 | bug | Reports issues |
| feature | Feature | #3b82f6 | feature | New functionality |
| improvement | Improvement | #10b981 | improvement | Code enhancements |
| refactor | Refactor | #a855f7 | refactor | Code restructuring |
| docs | Documentation | #6b7280 | docs | Technical documentation |
| test | Test | #22c55e | test | Test coverage |
| other | Other | #8b8980 | other | Miscellaneous |
| system | System | #9ca3af | system | Internal operations |
| priority-critical | Critical | #dc2626 | priority-critical | Highest priority |
| priority-high | High | #eab308 | priority-high | High priority |
| priority-medium | Medium | #f59e0b | priority-medium | Medium priority |
| priority-low | Low | #64748b | priority-low | Low priority |

---

## API Endpoints

### Tag Management

#### Get All Tags
```http
GET /api/tags
```

Query parameters:
- `type`: Filter by tag type (bug, feature, improvement, etc.)
- `predefined`: `true` to show only system tags
- `is_active`: `true`/`false` to filter active status

Response:
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": 1,
        "tag_name": "bug",
        "display_name": "Bug Fix",
        "color": "#ef4444",
        "icon": "alert-circle",
        "description": "Reports issues",
        "tag_type": "bug",
        "is_active": true,
        "is_system": false,
        "sort_order": 100,
        "created_at": "2026-01-17T10:30:39.000Z",
        "updated_at": "2026-01-17T10:30:39.000Z"
      }
    ]
  },
  "metadata": {
    "timestamp": "2026-01-17T10:30:39.000Z",
    "request_id": null,
    "execution_time_ms": null
  }
}
```

#### Create Tag
```http
POST /api/tags
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Request body:
```json
{
  "tag_name": "security",
  "display_name": "Security",
  "color": "#dc2626",
  "icon": "shield-alert",
  "description": "Security-related tasks",
  "tag_type": "bug",
  "is_system": false,
  "sort_order": 100
}
```

Validation rules:
- `tag_name`: Required, lowercase alphanumeric with hyphens only (e.g., `security`, `backend-api`)
- `display_name`: Required, human-readable label
- `color`: Optional, valid hex format `#RRGGBB` (default: `#3b82f6`)
- `icon`: Optional, icon identifier (default: `tag`)
- `tag_type`: Optional, must be one of: `bug`, `feature`, `improvement`, `refactor`, `docs`, `test`, `other`, `system`, `priority-critical`, `priority-high`, `priority-medium`, `priority-low`
- `is_system`: Optional, marks as system tag (default: `false`)
- `sort_order`: Optional, display order (default: `100`)

#### Update Tag
```http
PUT /api/tags/:id
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Request body (all fields optional):
```json
{
  "display_name": "Updated Security",
  "color": "#991b1b",
  "icon": "shield",
  "description": "Updated description",
  "tag_type": "feature",
  "is_active": false,
  "sort_order": 50
}
```

#### Delete Tag
```http
DELETE /api/tags/:id
Authorization: Bearer <JWT_TOKEN>
```

Note: System tags (`is_system: true`) cannot be deleted and will return 403 Forbidden.

### Task Tag Assignment

#### Get Task Tags
```http
GET /api/tasks/:taskId/tags
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "success": true,
  "data": {
    "task_id": 42,
    "tags": [
      {
        "id": 1,
        "tag_name": "bug",
        "display_name": "Bug Fix",
        "color": "#ef4444",
        "icon": "alert-circle",
        "tag_type": "bug"
      }
    ]
  }
}
```

#### Add Tag to Task
```http
POST /api/tasks/:taskId/tags
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Request body (either `tag_id` or `tag_name` required):
```json
{
  "tag_id": 1
}
```

Or with tag name:
```json
{
  "tag_name": "bug"
}
```

#### Remove Tag from Task
```http
DELETE /api/tasks/:taskId/tags/:tagId
Authorization: Bearer <JWT_TOKEN>
```

#### Replace All Task Tags
```http
PUT /api/tasks/:taskId/tags
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Request body:
```json
{
  "tag_ids": [1, 3, 7]
}
```

Note: This replaces all existing tags on the task with the provided list. An empty array (`[]`) removes all tags.

#### Get Tasks by Tag
```http
GET /api/tasks/by-tag/:tagName
Authorization: Bearer <JWT_TOKEN>
```

Query parameters:
- `project_id`: Filter by project ID
- `status`: Filter by task status
- `limit`: Maximum number of tasks to return (default: 50, max: 200)

---

## Frontend Integration

### TaskCard Component

The TaskCard displays up to 4 tags with a "+X more" indicator. Tags are shown as color-coded pill badges with proper text contrast (white text on dark backgrounds, dark text on light backgrounds).

Example usage:
```tsx
<TaskCard
  task={task}
  onClick={() => openTaskDetail(task.id)}
  showProject={true}
/>
```

### TaskDetailDrawer Component

The TaskDetailDrawer shows all assigned tags and allows:
- Viewing current tags
- Adding new tags from available tags list
- Removing tags with X button
- Auto-reload after tag changes

Tag colors automatically adjust text contrast for readability using the `isColorDark()` utility function.

---

## Tag Types and Their Colors

### Bug Type
- **Color**: #ef4444 (red-500)
- **Use case**: Issues, bug fixes, error reports
- **Example**: "Fix login authentication bug"

### Feature Type
- **Color**: #3b82f6 (blue-500)
- **Use case**: New features, functionality additions
- **Example**: "Implement user dashboard"

### Improvement Type
- **Color**: #10b981 (green-500)
- **Use case**: Code enhancements, optimizations, refactors
- **Example**: "Optimize database queries"

### Refactor Type
- **Color**: #a855f7 (purple-500)
- **Use case**: Code restructuring, technical debt reduction
- **Example**: "Migrate to new API structure"

### Documentation Type
- **Color**: #6b7280 (gray-500)
- **Use case**: Technical documentation, guides, README files
- **Example**: "Update API documentation"

### Test Type
- **Color**: #22c55e (green-500)
- **Use case**: Test coverage, unit tests, integration tests
- **Example**: "Add test for tag API"

### Other Type
- **Color**: #8b8980 (gray-500)
- **Use case**: Miscellaneous, uncategorized tasks
- **Example**: "Review and clean up"

---

## Best Practices

### Tag Organization

1. **Use descriptive names**: Make tag names clear and specific
   - Good: `api-auth`, `frontend-performance`, `database-schema`
   - Bad: `stuff`, `fix`, `todo`

2. **Choose appropriate colors**: Use colors that align with tag purpose
   - Bug fixes: Red, orange
   - Features: Blue, green
   - Docs: Gray, purple

3. **Limit tag types**: Don't create too many custom tags
   - Use predefined tags when possible
   - Create custom tags only for specific needs

4. **Consistent naming**: Use kebab-case for technical tags
   - Good: `user-authentication`, `api-optimization`
   - Bad: `user authentication`, `api optimization`

### Tag Assignment Strategy

1. **Feature-based grouping**: Assign tags based on feature areas
   - `frontend-ui`, `backend-api`, `database-schema`, `devops-infrastructure`

2. **Priority indicators**: Use priority tags for high-priority tasks
   - `priority-critical` for production issues
   - `priority-high` for deadline-sensitive tasks

3. **Work type classification**: Distinguish between task types
   - `bug` for fixes
   - `feature` for new functionality
   - `refactor` for technical improvements

### Using Tags for Filtering

1. **By tag type**: Find all bug fixes or features
   ```
   GET /api/tags?type=bug
   GET /api/tasks/by-tag/feature
   ```

2. **By project**: Combine with project filtering
   ```
   GET /api/tasks?project_id=1
   GET /api/tasks/by-tag/bug?project_id=1
   ```

3. **By status**: Find pending tasks with specific tags
   ```
   GET /api/tasks?status=pending
   GET /api/tasks/by-tag/bug?status=pending
   ```

---

## Tag History and Audit Trail

All tag changes on tasks are tracked in `task_tag_assignments_history` table. This provides:

1. **Accountability**: See who changed tags and when
2. **Rollback capability**: View previous tag assignments
3. **Analytics**: Analyze tag trends and usage patterns
4. **Debugging**: Track down when tags were changed

History query example:
```sql
SELECT
    tta.*,
    u.name as changed_by_name
FROM task_tag_assignments_history tta
LEFT JOIN users u ON tta.changed_by = u.id
WHERE tta.task_id = 42
ORDER BY tta.changed_at DESC;
```

---

## WebSocket Events

Tag assignments trigger real-time updates via Socket.IO:

### Task Tag Added
```javascript
socket.on('task_tag_added', (data) => {
  console.log('Tag added to task:', data.task_id, data.tag);
  // data: { task_id: 42, tag: { id: 1, name: 'bug', color: '#ef4444' }
});
```

### Task Tag Removed
```javascript
socket.on('task_tag_removed', (data) => {
  console.log('Tag removed from task:', data.task_id, data.tag_id);
  // data: { task_id: 42, tag_id: 1 }
});
```

### Task Tags Replaced
```javascript
socket.on('task_tags_replaced', (data) => {
  console.log('Tags replaced on task:', data.task_id, data.tags);
  // data: { task_id: 42, tags: [...] }
});
```

---

## Examples

### Example 1: Creating a Custom Tag

```javascript
const response = await fetch('/api/tags', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tag_name: 'api-security',
    display_name: 'API Security',
    color: '#dc2626',
    icon: 'shield',
    description: 'Security-related API tasks',
    tag_type: 'bug'
  })
});

const data = await response.json();
console.log('Created tag:', data.data.tag);
```

### Example 2: Adding Tags to a Task

```javascript
const taskId = 42;
const tagId = 3;

await fetch(`/api/tasks/${taskId}/tags`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ tag_id: tagId })
});
```

### Example 3: Finding Tasks by Tag

```javascript
const response = await fetch('/api/tasks/by-tag/bug?project_id=1&status=pending', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
console.log('Bug tasks for project 1:', data.data.tasks);
```

### Example 4: Filtering Tags by Type

```javascript
// Get only bug tags
const bugTags = await fetch('/api/tags?type=bug', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get only predefined tags
const systemTags = await fetch('/api/tags?predefined=true', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Example 5: Bulk Tag Assignment

```javascript
const taskId = 42;
const tagIds = [1, 3, 7, 12];

await fetch(`/api/tasks/${taskId}/tags`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ tag_ids: tagIds })
});
```

---

## Error Handling

### Common Error Codes

| Status | Error | Description | Solution |
|--------|-------|-------------|----------|
| 400 | Bad Request | Invalid request body, invalid color format, invalid tag_type |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Attempting to delete system tags, insufficient permissions |
| 404 | Not Found | Tag or task not found |
| 409 | Conflict | Duplicate tag name, tag already assigned to task |
| 500 | Internal Server Error | Server error, check logs |

### Error Response Format

```json
{
  "success": false,
  "error": "Tag name already exists"
}
```

---

## Migration Notes

When deploying the Tag System, ensure you run the database migration:

```bash
# Apply migration to production database
mysql -u root -p solaria_construction < infrastructure/database/migrations/016_task_tags.sql

# Or via Docker
docker compose exec -i office mysql -u root -p solaria_construction < infrastructure/database/migrations/016_task_tags.sql
```

The migration creates:
1. `task_tags` table with 12 predefined tags
2. `task_tag_assignments` table for tag-to-task relationships
3. `task_tag_assignments_history` table for audit trail

---

## Performance Considerations

- Tag queries use indexed columns (`idx_tag_id`, `idx_task_id`, `idx_tag_type`)
- Foreign key constraints ensure data integrity with CASCADE deletes
- Tag history tracks all changes for auditing
- Use `is_active` flag instead of hard deletes for soft deletion capability

---

## Security Notes

1. **JWT required**: All tag management endpoints require authentication
2. **Permission checks**: System tags cannot be deleted (`is_system: true`)
3. **Input validation**: Color format, tag_type enum, tag_name format are validated
4. **SQL injection prevention**: Use prepared statements for all database queries
5. **Audit logging**: All tag changes are logged to `activity_logs`

---

## Troubleshooting

### Tags not appearing on TaskCard

**Problem**: TaskCard doesn't show tags

**Solution**:
1. Verify database migration was applied
2. Check that `GET /api/tasks/:id` returns `tags` array
3. Check browser console for JavaScript errors
4. Verify task object has `tags` property

### Cannot delete system tags

**Problem**: Getting 403 Forbidden when deleting tag

**Solution**: System tags (`is_system: true`) are protected and cannot be deleted. Create a custom tag instead or modify the existing one if needed.

### Tag colors not displaying correctly

**Problem**: Colors don't match expected values

**Solution**:
1. Verify color is valid hex format: `#RRGGBB`
2. Check that `isColorDark()` function is calculating text contrast correctly
3. Ensure background color is applied inline, not via CSS class

### Tags not syncing in real-time

**Problem**: Tag changes not reflected in other clients

**Solution**:
1. Verify Socket.IO connection is active
2. Check that `socket.on('task_tag_added')` listener is registered
3. Ensure client receives and handles WebSocket events
4. Check server logs for WebSocket emission

---

## Related Documentation

- [DFN-002: JSON-First API Standardization](DFN-002-json-api-standardization.md) - API response format
- [DFN-004: Ready Tasks Endpoint](DFN-004-ready-tasks-endpoint.md) - Task querying with tags
- [README.md](../../README.md) - Dashboard overview and architecture
- [AGENTS.md](../../AGENTS.md) - Agent usage guide for DFO

---

**SOLARIA Digital Field Operations**

© 2025-2026 SOLARIA AGENCY
