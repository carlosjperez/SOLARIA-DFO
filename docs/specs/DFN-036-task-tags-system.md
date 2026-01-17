# DFN-036: Sistema de Etiquetas para Tareas

**Status:** Implementation Ready
**Prioridad:** Alta
**Sprint:** DFO-036 (Sistema de etiquetas)
**Estimated Hours:** 8h
**Type:** FEATURE
**Date:** 2026-01-17

---

## Overview

Implement a flexible tagging system for tasks that allows multiple tags per task, color-coded categories, filtering, and visual representation.

## Motivation

- Organizar tareas por etiquetas para mejor usabilidad
- Permitir multiple etiquetas por tarea (ej: "frontend", "api", "bugfix")
- Categorizar visualmente con colores
- Facilitar filtrado y búsqueda de tareas
- Mejorar UX con visualización intuitiva
- Soporte para prioridades emergentes

## Technical Specification

### Data Model

```sql
CREATE TABLE IF NOT EXISTS task_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6' -- solaria-primary
  icon VARCHAR(50) DEFAULT 'tag',
  description TEXT,
  tag_type ENUM('bug', 'feature', 'improvement', 'refactor', 'docs', 'test', 'other') DEFAULT 'feature',
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_tag_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  tag_id INT NOT NULL,
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id),
  INDEX idx_tag_id (tag_id),
  UNIQUE KEY uk_task_tag (task_id, tag_id)
);

CREATE TABLE IF NOT EXISTS task_tag_assignments_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  history_id INT NOT NULL,
  old_value JSON, -- JSON array de old tags
  new_value JSON,  -- JSON array de new tags
  changed_by INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_history_id (history_id),
  INDEX idx_changed_by (changed_by)
);
);
```

### Predefined Tags

```sql
INSERT INTO task_tags (tag_name, display_name, color, icon, description, tag_type, is_system) VALUES
('bug', 'Bug Fix', '#ef4444', 'alert-circle', 'Reports issues', 'bug', FALSE),
('feature', 'Feature', '#3b82f6', 'plus-circle', 'New functionality', 'feature', FALSE),
('improvement', 'Improvement', '#10b981', 'trending-up', 'Code enhancements', 'improvement', FALSE),
('refactor', 'Refactor', '#a855f7', 'git-branch', 'Code restructuring', 'refactor', FALSE),
('docs', 'Documentation', '#6b7280', 'book', 'Technical documentation', 'docs', FALSE),
('test', 'Test', '#22c55e', 'flask-check', 'Test coverage', 'test', FALSE),
('other', 'Other', '#8b8980', 'hashtag', 'Miscelaneo', 'other', TRUE);
('system', 'System', '#9ca3af', 'settings', 'Internal operations', 'system', TRUE);
('priority-critical', 'Critical', '#dc2626', 'Highest priority', 'priority-critical', 'priority-critical', FALSE),
('priority-high', 'High', '#eab308', 'High priority', 'priority-high', FALSE),
('priority-medium', 'Medium', '#f59e0b', 'Medium priority', 'priority-medium', 'FALSE),
('priority-low', 'Low', '#64748b', 'Low priority', 'priority-low', FALSE);
```

### Tag Types

| Tipo | Descripción | Predefinidos | Colores |
|------|-------------|---------|----------|
| bug | Reportes de bugs | bug | 🔴 red-500 |
| feature | Nuevas funcionalidades | feature | 🔵 blue-500 |
| improvement | Mejoras de código | improvement | 🟡 green-500 |
| refactor | Refactorings | refactor | 🟣 orange-500 |
| docs | Documentación | docs | 🟣 purple-500 |
| test | Pruebas | test | 🟡 cyan-500 |
| other | Otros | other | 🟢 gray-500 |

---

## API Endpoints

### CRUD de Tags

```typescript
interface Tag {
  id: number;
  tag_name: string;
  display_name: string;
  color: string;
  icon: string;
  description: string;
  tag_type: 'bug' | 'feature' | 'improvement' | 'refactor' | 'docs' | 'test' | 'other';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface TaskTagAssignment {
  id: number;
  task_id: number;
  tag_id: number;
  assigned_by: number;
  assigned_at: string;
}

interface TagHistoryEntry {
  id: number;
  history_id: number;
  old_value: string | JSON array;
  new_value: string | JSON array;
  changed_by: number;
  changed_at: string;
}
```

### Endpoints

#### Get All Tags
```http
GET /api/tags
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": Tag[]
  },
  "metadata": {...}
}
```

#### Get Tags by Type
```http
GET /api/tags?type=bug
```

#### Get Predefined Tags
```http
GET /api/tags?predefined=true
```

#### Create Tag
```http
POST /api/tags
```

**Request:**
```json
{
  "tag_name": "security",
  "display_name": "Security",
  "color": "#dc2626",
  "icon": "shield-alert",
  "description": "Security-related tasks",
  "tag_type": "bug",
  "is_system": false
}
```

#### Update Tag
```http
PUT /api/tags/:id
```

**Request:**
```json
{
  "display_name": "Security Updated",
  "color": "#dc2626",
  "description": "Updated description"
}
```

#### Delete Tag
```http
DELETE /api/tags/:id
```

### CRUD de Asignaciones de Tags

#### Assign Tags to Task
```http
POST /api/tasks/:taskId/tags
```

**Request:**
```json
{
  "tag_ids": [3, 7, 15]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": 42,
    "tag_ids": [3, 7, 15],
    "tags": [...]
  },
  "metadata": {...}
}
```

#### Get Task Tags
```http
GET /api/tasks/:taskId/tags
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": 42,
    "tags": Tag[]
  },
  "metadata": {...}
}
```

#### Unassign Tag from Task
```http
DELETE /api/tasks/:taskId/tags/:tagId
```

#### Replace Task Tags
```http
PUT /api/tasks/:taskId/tags
```

**Request:**
```json
{
  "tag_ids": [3, 7, 15]
}
```

### Integration con Dashboard API

#### Task List Enhancement
Los endpoints de tasks (`/api/tasks`) deben devolver la información de tags:

```typescript
interface TaskResponse {
  // ... campos existentes ...
  tags?: Tag[];
}
```

### Integration con TaskDetailDrawer
El modal de detalle de tarea debe mostrar tags disponibles y permitir agregar/quitar tags.

---

## Implementation Details

### File Structure

```
mcp-server/src/endpoints/tag-management.ts  # Endpoints de CRUD
mcp-server/src/__tests__/tag-management.test.ts  # Tests
infrastructure/database/migrations/004_task_tags.sql  # Migración SQL
```

### Dependencies

- Zod para validación
- ResponseBuilder pattern (DFN-002)
- Dashboard API client
- Tests de integración con tasks API

### Priority Mapping

| Prioridad | Endpoint | Esfuerzo |
|---------|----------|----------|
| Alta | GET /api/tags, GET /api/tags?predefined=true, POST /api/tags | 3h |
| Media | PUT /api/tags/:id, DELETE /api/tags/:id | 2h |
| Alta | Assign/Unassign/Replace task tags | 2h |
| Media | Integración con /api/tasks/* | 2h |

**Total estimado:** 11 horas

---

## Acceptance Criteria

- [ ] Tags table created in database
- [ ] Predefined tags inserted (at least 12 types)
- [ ] All CRUD endpoints implemented in DFO API
- [ ] Tags visible en TaskCard
- [ ] Task list returns tags array
- [ ] Task detail modal allows tag assignment
- [ ] Tests escritos (>70% coverage)
- [ ] Documentation actualizada
- [ ] ResponseBuilder pattern used consistently

---

## Test Cases

### Input Validation
1. Aceptar nombre vacío → predefinidos tags
2. Aceptar nombres con espacios
3. Rechazar duplicados en creation
4. Validar color hex format
5. Validar tag_type enum
6. Aceptar icons válidos

### CRUD Operations
1. GET all tags - Retorna array completo
2. GET tags by type - Filtra por tipo
3. GET predefined tags - Solo predefinidos
4. POST tag - Crear nuevo tag con validación
5. PUT tag - Actualizar display_name, color, description
6. DELETE tag - Soft delete (is_active=FALSE)
7. Assign tags - Validar que task_id existe
8. Unassign tag - Validar que asignación existe
9. Replace tags - Validar tags_ids array
10. Tag history tracking - Historial de cambios auditados

### Integración
11. Task list con tags en response
12. Task detail muestra tags disponibles
13. Tags sincronizados en TaskCard onClick

### Error Handling
14. Duplicate tag name → 400 Bad Request
15. Invalid color format → 400 Bad Request
16. Invalid tag_type → 400 Bad Request
17. Task not found → 404 Not Found
18. Tag not found → 404 Not Found

### Edge Cases
19. Asignar tags a tarea completada → OK (tags son metadata, no afectan estado)
20. Borrar tag asignado → Desvincular tarea
21. Reasignar tags → OK (actualiza historial)
22. Concurrent tag assignments → OK (race condition)

---

## Notes

- Los tags son metadatos de tareas, no afectan el estado de la tarea
- Las etiquetas predefinidas están en SQL para consistencia entre entornos
- El color HEX debe ser válido (ej: #3b82f6)
- El icon puede ser emoji o texto (tag)
- La asignación de tags debe auditarse con logging para accountability
- Historial de cambios permite rollback y análisis de tendencias

---

**Related:**

- DFN-005: Stats Dashboard DFO (ya completado)
- DFN-006: Fix Inline Documents (ya completado)
- DFO-035: Task cards con info completa (completo en TaskCard, pero puede mejorarse)
- DFO-037: Task list sorting (pendiente, puede hacerse más fácil con tags)
- DFO-038: Budget editing in project view (pendiente)

---

**Created:** 2026-01-17
**Author:** Sisyphus (AI Architect)
