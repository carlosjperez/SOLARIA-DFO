# SOLARIA Digital Field Operations - Guia para Agentes IA

**Version:** 1.0.0
**Fecha:** 2025-12-15

---

## Bienvenido a SOLARIA DFO

Eres un agente IA conectandose a la **Oficina de Construccion en Campo** de SOLARIA. Este sistema te permite:

- Gestionar tareas y proyectos de forma autonoma
- Almacenar y recuperar memoria persistente a largo plazo
- Coordinar con otros agentes IA
- Reportar progreso a dashboards ejecutivos

---

## Protocolo de Inicializacion OBLIGATORIO

> **IMPORTANTE:** Debes seguir este protocolo al inicio de CADA sesion.

### 1. Registrar Proyecto (OBLIGATORIO)

```javascript
// PRIMERA llamada - Sin esto no puedes operar
set_project_context({ project_name: "Nombre del Proyecto" })
```

**Respuesta esperada:**
```json
{
  "success": true,
  "project_id": 1,
  "project_name": "Mi Proyecto",
  "session_id": "mcp-xxx-xxx",
  "instruction": "Contexto establecido. Todas las operaciones estan aisladas a este proyecto."
}
```

### 2. Cargar Memoria del Proyecto

```javascript
// Recuperar contexto y decisiones previas
memory_search({
  query: "arquitectura decisiones configuracion",
  tags: ["decision", "context", "architecture", "config"]
})
```

**Por que es importante:**
- Evita repetir decisiones ya tomadas
- Mantiene consistencia entre sesiones
- Recupera configuraciones y requisitos

### 3. Verificar Estado Actual

```javascript
// Ver panorama general
get_dashboard_overview()

// Ver tareas pendientes
list_tasks({ status: "pending" })

// Ver tareas en progreso
list_tasks({ status: "in_progress" })
```

---

## Sistema de Memoria Persistente

La memoria es tu herramienta mas importante para mantener contexto entre sesiones.

### Herramientas Disponibles

| Herramienta | Uso |
|-------------|-----|
| `memory_create` | Guardar nueva memoria |
| `memory_search` | Buscar memorias existentes |
| `memory_list` | Listar con filtros |
| `memory_get` | Obtener por ID |
| `memory_update` | Modificar memoria |
| `memory_delete` | Eliminar memoria |
| `memory_boost` | Aumentar importancia |
| `memory_link` | Relacionar dos memorias |
| `memory_tags` | Ver tags disponibles |
| `memory_stats` | Estadisticas |

### Cuando Crear Memorias

#### Alta Importancia (0.7 - 1.0)
- Decisiones arquitectonicas
- Bugs criticos y sus soluciones
- Configuraciones de produccion
- Requisitos confirmados por cliente
- Credenciales y endpoints importantes

```javascript
memory_create({
  content: "Arquitectura: React 19 + Vite 6 + Payload CMS 3.0. Base de datos PostgreSQL.",
  tags: ["decision", "architecture"],
  importance: 0.9
})
```

#### Media Importancia (0.4 - 0.6)
- Patrones de codigo adoptados
- Preferencias del cliente
- TODOs para futuras sesiones
- Notas de reuniones

```javascript
memory_create({
  content: "Cliente prefiere componentes minimalistas sin animaciones excesivas",
  tags: ["preference", "context"],
  importance: 0.5
})
```

#### Baja Importancia (0.1 - 0.3)
- Contexto temporal
- Notas rapidas
- Ideas para explorar

### Tags Recomendados

```
decision      - Decisiones tecnicas tomadas
architecture  - Diseno de sistema
bug           - Problemas encontrados
solution      - Soluciones implementadas
config        - Configuraciones
requirement   - Requisitos del proyecto
learning      - Aprendizajes
context       - Contexto general
credential    - Credenciales (usar con cuidado)
pattern       - Patrones de codigo
todo          - Pendientes para futuro
meeting       - Notas de reuniones
feedback      - Comentarios recibidos
```

---

## Gestion de Tareas

### Crear Tarea

```javascript
create_task({
  title: "Implementar formulario de contacto",
  description: "Formulario con validacion Zod, honeypot anti-spam, integracion Mailchimp",
  priority: "high",
  status: "todo",
  tags: ["frontend", "forms", "validation"]
})
```

### Actualizar Progreso

```javascript
update_task({
  task_id: 123,
  status: "in_progress",
  notes: "Iniciando implementacion de validacion"
})
```

### Completar Tarea

```javascript
complete_task({
  task_id: 123,
  notes: "Formulario completado. Validacion Zod, honeypot, integracion Mailchimp funcional."
})

// IMPORTANTE: Crear memoria de la solucion
memory_create({
  content: "Formulario contacto: Validacion con Zod schema, honeypot field oculto, API route /api/contact, integracion Mailchimp via webhook",
  tags: ["solution", "implementation", "forms"],
  importance: 0.7
})
```

---

## Flujo de Trabajo Recomendado

```
INICIO DE SESION
       |
       v
1. set_project_context()
       |
       v
2. memory_search() - Recuperar contexto
       |
       v
3. list_tasks({ status: "pending" })
       |
       v
4. Seleccionar tarea a trabajar
       |
       v
5. update_task({ status: "in_progress" })
       |
       v
6. [TRABAJAR EN LA TAREA]
       |
       v
7. complete_task()
       |
       v
8. memory_create() - Documentar solucion
       |
       v
9. Siguiente tarea o fin de sesion

FIN DE SESION
       |
       v
memory_create() - Guardar contexto pendiente
```

---

## Buenas Practicas

### DO (Hacer)

- Siempre iniciar con `set_project_context()`
- Buscar memorias antes de tomar decisiones
- Documentar decisiones importantes en memoria
- Actualizar estado de tareas en tiempo real
- Usar tags consistentes

### DON'T (No Hacer)

- Operar sin contexto de proyecto establecido
- Tomar decisiones sin consultar memoria previa
- Olvidar documentar soluciones implementadas
- Dejar tareas en "in_progress" sin completar
- Guardar informacion sensible sin cifrar

---

## Conexion MCP

### URL del Servidor
```
https://dfo.solaria.agency/mcp
```

### Headers Requeridos
```
Authorization: Bearer default
Content-Type: application/json
```

### Verificar Conexion
```bash
curl https://dfo.solaria.agency/mcp/health
```

### Respuesta Esperada
```json
{
  "status": "ok",
  "dashboard": "connected",
  "sessions": 3
}
```

---

## Dashboard Web

Puedes supervisar el estado en:
- **URL:** https://dfo.solaria.agency
- **Usuario:** carlosjperez
- **Password:** bypass

### Secciones Disponibles
- Dashboard principal - KPIs ejecutivos
- Proyectos - Lista de proyectos activos
- **Memorias** - Sistema de memoria persistente
- Infraestructura - Estado de servidores

---

## Soporte

Si encuentras problemas:
1. Verificar health check: `curl https://dfo.solaria.agency/mcp/health`
2. Revisar logs del proyecto
3. Crear memoria con tag `bug` documentando el problema

---

**SOLARIA Digital Field Operations**
**Oficina de Construccion en Campo**

© 2024-2025 SOLARIA AGENCY

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
