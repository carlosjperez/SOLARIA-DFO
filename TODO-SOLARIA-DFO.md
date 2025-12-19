# SOLARIA DFO - Lista de Tareas Pendientes

**Proyecto:** SOLARIA Digital Field Operations
**Ultima actualizacion:** 2025-12-19

---

## P0 - Criticas (Bloqueantes)

### DFO-032: Deep linking para cards de dashboard
- [x] Implementar `showTaskDetail(taskId)` - navegar a detalle de tarea
- [x] Implementar `showProjectDetail(projectSlug)` - navegar a detalle de proyecto
- [x] Hacer todas las cards clickeables en widgets:
  - [x] Tareas Completadas
  - [x] Nuevas Tareas por Proyecto
  - [x] Proyectos Recientes
- [x] CSS hover states para indicar que son clickeables
- **Status:** COMPLETED (e071c56f)
- **Impacto:** UX - cards ahora navegables

### DFO-033: Task codes visibles en UI
- [x] Mostrar codigo (DFO-XXX) en lugar de ID en todas las vistas
- [x] Kanban view - mostrar codigo en cards
- [x] Task detail modal - mostrar codigo en header
- [x] Notificaciones - mostrar codigo
- [x] Widgets - mostrar codigo
- **Status:** COMPLETED (e071c56f)
- **Impacto:** Consistencia visual mejorada

### DFO-034: Kanban real-time updates
- [ ] Socket.IO: escuchar `task_created` y agregar card sin refresh
- [ ] Socket.IO: escuchar `task_updated` y mover card sin refresh
- [ ] Socket.IO: escuchar `task_deleted` y remover card sin refresh
- **Status:** NOT STARTED
- **Bug reportado:** Tareas nuevas no aparecen en Kanban sin refresh

---

## P1 - Alta Prioridad

### DFO-035: Task cards con info completa (FEATURE)
- [ ] Mostrar en cards toda la info de la vista lista
- [ ] Incluir: codigo, titulo, descripcion truncada
- [ ] Incluir: prioridad, estado, progreso
- [ ] Incluir: agente asignado, fecha creacion
- [ ] Incluir: proyecto, tags/etiquetas
- [ ] Diseño responsive para mobile
- **Status:** NOT STARTED
- **Tipo:** FEATURE

### DFO-036: Sistema de etiquetas para tareas (FEATURE)
- [ ] Crear tabla `task_tags` en DB
- [ ] Tags predefinidos: bug, feature, improvement, refactor, docs, test
- [ ] UI para agregar/quitar tags en task detail
- [ ] Filtrar tareas por tag
- [ ] Colores distintivos por tipo de tag
- [ ] API endpoints para CRUD de tags
- **Status:** NOT STARTED
- **Tipo:** FEATURE

### DFO-037: Task list sorting
- [ ] Ordenar por fecha de creacion
- [ ] Ordenar por estado (pending, in_progress, completed)
- [ ] Ordenar por prioridad (critical, high, medium, low)
- [ ] Ordenar por agente asignado
- [ ] Ordenar por progreso (0-100%)
- [ ] UI: dropdown o botones de ordenacion
- [ ] Persistir preferencia en localStorage
- **Status:** NOT STARTED
- **Impacto:** UX - facilita gestion de tareas

### DFO-038: Budget editing in project view (FEATURE)
- [ ] Vista de presupuestos debe permitir editar presupuesto del proyecto
- [ ] Input field para modificar budget (numerico)
- [ ] Guardar cambios via API PUT /api/projects/:id
- [ ] Validacion de formato numerico
- [ ] Feedback visual al guardar
- [ ] Historial de cambios (opcional)
- **Status:** NOT STARTED
- **Tipo:** FEATURE
- **Impacto:** Permite gestionar presupuestos directamente desde dashboard

### DFO-002: Security audit
- [ ] Review OWASP Top 10
- [ ] Validar sanitizacion de inputs
- [ ] Verificar JWT implementation
- [ ] Rate limiting en endpoints criticos
- **Status:** pending
- **Agent:** NEMESIS-SEC

### DFO-003: Write Playwright tests
- [ ] Tests E2E para login flow
- [ ] Tests E2E para dashboard widgets
- [ ] Tests E2E para Kanban view
- [ ] Tests E2E para task CRUD
- [ ] Tests E2E para project management
- **Status:** pending
- **Agent:** NEMESIS-TST

### DFO-012: EPIC-H: API Layer
- [ ] Documentar todos los endpoints REST
- [ ] Agregar OpenAPI/Swagger spec
- [ ] Validar error handling consistente
- **Status:** pending

### DFO-030: MCP Server - Memory tools integration
- [ ] Verificar herramientas memory_* funcionan correctamente
- [ ] Tests para cada tool
- [ ] Documentar en CLAUDE.md
- **Status:** pending

---

## P2 - Media Prioridad

### DFO-010: EPIC-J: Deployment
- [ ] Docker production setup completo
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated backups
- [ ] Health monitoring
- **Status:** pending

### DFO-011: EPIC-I: Frontend Portal
- [ ] Migrar a React si es necesario
- [ ] O mantener vanilla JS optimizado
- [ ] Documentar arquitectura frontend
- **Status:** pending

### DFO-022: New tasks per project widget
- [ ] Agrupar tareas por proyecto
- [ ] Filtros por fecha/prioridad
- [ ] Paginacion si hay muchas
- **Status:** pending

---

## P3 - Baja Prioridad / Cleanup

### DFO-007: Test Task - All Fields
- [ ] Eliminar - es tarea de prueba
- **Status:** TO DELETE

### DFO-008: Agent Task - Null Values
- [ ] Eliminar - es tarea de prueba
- **Status:** TO DELETE

### DFO-009: Agent Task - All Fields
- [ ] Eliminar - es tarea de prueba
- **Status:** TO DELETE

---

## Tareas Completadas (Reference)

- [x] DFO-001: Setup Docker infrastructure
- [x] DFO-004: Implement Quick Access
- [x] DFO-005: Design database schema
- [x] DFO-013-019: EPICs A-G (foundation modules)
- [x] DFO-020: Notifications system
- [x] DFO-021: Global completed tasks widget
- [x] DFO-023: Auto-set progress 100%
- [x] DFO-024-026: VibeSDK Sprints 1-3
- [x] DFO-027: E2E Tests Notification System
- [x] DFO-028: VibeSDK external link
- [x] DFO-029: Memorias page
- [x] DFO-031: Auto-generate task codes

---

## Proximos Pasos

1. **Implementar DFO-032** (deep linking) - mas impacto en UX
2. **Implementar DFO-033** (task codes en UI) - consistencia
3. **Implementar DFO-034** (Kanban real-time) - fix bug reportado
4. Desplegar y verificar
5. Subir tareas corregidas a la base de datos

---

## Notas

- Este archivo es la fuente de verdad local
- Actualizar despues de cada reset de Docker
- Sincronizar con DB cuando sea estable
