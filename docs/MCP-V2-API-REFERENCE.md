# MCP v2.0 API Reference

**Documentación completa de la API del Sketch Pattern DFO MCP Server v2.0**

---

## 📖 Índice

1. [Introduction](#introduction)
2. [Tools](#tools)
   - [get_context](#tool-get_context)
   - [run_code](#tool-run_code)
3. [Resources](#resources)
4. [Endpoints](#endpoints)
5. [Error Codes](#error-codes)
6. [Security](#security)
7. [Examples](#examples)

---

## Introduction

El MCP v2.0 (Sketch Pattern) es una arquitectura simplificada que reduce 70+ herramientas a solo **2 core tools**:

- **`get_context`**: Obtiene todo el estado del sistema en una sola llamada
- **`run_code`**: Ejecuta código JavaScript/TypeScript/SQL en sandbox seguro

**Filosofía:** Menos herramientas pre-fabricadas, más flexibilidad para el usuario.

---

## Tools

### Tool: get_context

Obtiene el estado unificado del sistema DFO en una sola llamada.

#### Input Schema

```typescript
{
  project_id?: number;        // ID del proyecto para filtrar contexto
  project_name?: string;      // Nombre del proyecto (búsqueda parcial, case-insensitive)
  include?: {
    projects?: boolean;      // Incluir lista de proyectos (default: true)
    tasks?: boolean;          // Incluir lista de tareas (default: false)
    agents?: boolean;         // Incluir lista de agentes (default: false)
    stats?: boolean;          // Incluir estadísticas de memoria (default: false)
    health?: boolean;         // Incluir health check del sistema (default: true)
    alerts?: boolean;         // Incluir alertas del dashboard (default: false)
    sprints?: boolean;        // Incluir sprints (requiere project_id)
    epics?: boolean;          // Incluir epics (requiere project_id)
  };
}
```

#### Output Schema

```typescript
{
  success: true,
  data: {
    context: {
      projects?: Project[];      // Lista de proyectos
      tasks?: Task[];          // Lista de tareas
      agents?: Agent[];        // Lista de agentes
      stats?: Stats;           // Estadísticas de memoria
      health?: Health;          // Health check
      alerts?: Alert[];        // Alertas activas
      sprints?: Sprint[];      // Sprints del proyecto
      epics?: Epic[];          // Epics del proyecto
      dashboard?: Overview;      // Dashboard overview (sin project_id)
    },
    project_id?: number;        // ID del proyecto resuelto
    timestamp: string;         // ISO 8601 timestamp
    message: string;           // Mensaje descriptivo
  }
}
```

#### Ejemplos de Uso

**Ejemplo 1: Contexto Global**
```javascript
const result = await get_context();
// Retorna: projects, health, dashboard overview
```

**Ejemplo 2: Contexto de Proyecto**
```javascript
const result = await get_context({
  project_id: 1,
  include: {
    projects: true,
    tasks: true,
    sprints: true,
    epics: true
  }
});
// Retorna: proyecto #1, sus tareas, sprints y epics
```

**Ejemplo 3: Búsqueda de Proyecto por Nombre**
```javascript
const result = await get_context({
  project_name: 'Akademate',
  include: { projects: true, tasks: true }
});
// Busca "Akademate" (match exacto o parcial, case-insensitive)
```

---

### Tool: run_code

Ejecuta código JavaScript/TypeScript/SQL en sandbox seguro con acceso completo a la API del DFO.

#### Input Schema

```typescript
{
  code: string;                          // Código a ejecutar (máx 10,000 caracteres)
  language?: 'javascript' | 'typescript' | 'sql';  // Default: 'javascript'
  timeout?: number;                      // Timeout en ms (default: 5000, max: 30000)
  sandbox?: 'strict' | 'permissive';      // Default: 'strict'
}
```

#### Output Schema

```typescript
{
  success: true,
  data: {
    output: any;                  // Resultado de ejecución (o error object)
    execution_time_ms: number;      // Tiempo de ejecución en ms
    memory_used_mb: number;        // Memoria utilizada en MB
    metadata: {
      language: string;           // 'javascript' | 'typescript' | 'sql'
      sandbox_mode: string;      // 'strict' | 'permissive'
      code_length: number;       // Longitud del código en caracteres
    };
  }
}
```

#### Contexto Disponible

El código se ejecuta con el siguiente contexto:

```typescript
{
  apiCall: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
  console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
  };
  fetch: typeof global.fetch;
  JSON: typeof JSON;
  Math: typeof Math;
  Date: typeof Date;
}
```

#### Sandboxes

**Strict Mode (default):**
- ✅ Solo permite endpoints de la whitelist
- ✅ Validación de cada endpoint antes de ejecutar
- ✅ Previene accesos no autorizados

**Permissive Mode:**
- ✅ Permite cualquier endpoint de la API del DFO
- ⚠️ No valida endpoints (más flexible, menos seguro)

#### Whitelist de Endpoints (Strict Mode)

```typescript
'/projects',
'/projects/:id',
'/tasks',
'/tasks/:id',
'/tasks/:id/items',
'/agents',
'/agents/:id',
'/memories',
'/memories/:id',
'/memories/search',
'/memories/semantic-search',
'/dashboard/overview',
'/dashboard/alerts',
'/sprints',
'/sprints/:id',
'/epics',
'/epics/:id',
'/health',
'/stats'
```

#### Ejemplos de Uso

**Ejemplo 1: Listar Proyectos**
```javascript
await run_code({
  code: `
const projects = await apiCall('/projects');
return { projects, count: projects.length };
`,
  timeout: 5000
});
```

**Ejemplo 2: Crear Proyecto**
```javascript
await run_code({
  code: `
const project = await apiCall('/projects', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Mi Nuevo Proyecto',
    client: 'Cliente',
    description: 'Descripción del proyecto',
    budget: 50000,
    status: 'planning',
    priority: 'medium'
  })
});
return { project };
`,
  timeout: 5000
});
```

**Ejemplo 3: Operación Compleja**
```javascript
await run_code({
  code: `
// Crear proyecto, tareas y obtener agents en paralelo
const [project, agents] = await Promise.all([
  apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify({ name: 'Nuevo Proyecto', client: 'Cliente' })
  }),
  apiCall('/agents')
]);

// Crear tarea en el nuevo proyecto
const task = await apiCall('/tasks', {
  method: 'POST',
  body: JSON.stringify({
    project_id: project.id,
    title: 'Primera tarea',
    priority: 'high',
    status: 'pending'
  })
});

return { project, agents, task };
`,
  timeout: 10000
});
```

**Ejemplo 4: Usar Template**
```javascript
import { getScriptTemplate } from './scripts/v2/templates.js';

const template = await getScriptTemplate('tasks-create');
await run_code({
  code: template,
  timeout: 5000
});
```

**Ejemplo 5: Consulta SQL**
```javascript
await run_code({
  language: 'sql',
  code: `
-- Esta es un ejemplo conceptual
-- SQL no está implementado en esta versión
SELECT * FROM projects WHERE status = 'active'
`,
  timeout: 5000
});
```

---

## Resources

Los recursos permiten leer datos directamente sin ejecutar tools.

### Available Resources

| URI | Nombre | Descripción | MIME Type |
|-----|---------|-------------|------------|
| `solaria://dashboard/overview` | Dashboard Overview | Overview del dashboard (global o por proyecto) | `application/json` |
| `solaria://projects/list` | Projects List | Lista de proyectos | `application/json` |
| `solaria://tasks/list` | Tasks List | Lista de tareas | `application/json` |
| `solaria://agents/list` | Agents List | Lista de agentes | `application/json` |

### Ejemplo de Uso

```javascript
// Leer resource de dashboard
const overview = await readResource('solaria://dashboard/overview');
```

---

## Endpoints

### Endpoints del Dashboard API

#### Projects

```
GET    /api/projects              # Listar proyectos
POST   /api/projects              # Crear proyecto
GET    /api/projects/:id           # Obtener proyecto
PUT    /api/projects/:id           # Actualizar proyecto
DELETE  /api/projects/:id           # Eliminar proyecto
```

#### Tasks

```
GET    /api/tasks                  # Listar tareas (query params: project_id, status, priority)
POST   /api/tasks                  # Crear tarea
GET    /api/tasks/:id              # Obtener tarea
PUT    /api/tasks/:id              # Actualizar tarea
DELETE  /api/tasks/:id              # Eliminar tarea
GET    /api/tasks/:id/items        # Obtener items de tarea
```

#### Agents

```
GET    /api/agents                 # Listar agentes
GET    /api/agents/:id             # Obtener agente
PUT    /api/agents/:id/status      # Actualizar estado de agente
```

#### Memory

```
GET    /api/memories               # Listar memorias
POST   /api/memories               # Crear memoria
GET    /api/memories/:id            # Obtener memoria
PUT    /api/memories/:id            # Actualizar memoria
DELETE  /api/memories/:id            # Eliminar memoria
GET    /api/memories/search         # Buscar memorias (query param)
GET    /api/memories/semantic-search # Búsqueda semántica (query param)
GET    /api/memories/stats          # Estadísticas de memoria
POST   /api/memories/:id/link       # Relacionar memorias
GET    /api/memories/:id/related    # Obtener memorias relacionadas
PUT    /api/memories/:id/boost      # Aumentar importancia
```

#### Dashboard

```
GET    /api/dashboard/overview       # Overview ejecutivo
GET    /api/dashboard/alerts        # Alertas activas
```

#### Sprints & Epics

```
GET    /api/projects/:id/sprints     # Sprints del proyecto
POST   /api/projects/:id/sprints     # Crear sprint
GET    /api/sprints/:id            # Obtener sprint
PUT    /api/sprints/:id            # Actualizar sprint

GET    /api/projects/:id/epics      # Epics del proyecto
POST   /api/projects/:id/epics      # Crear epic
GET    /api/epics/:id            # Obtener epic
PUT    /api/epics/:id            # Actualizar epic
```

---

## Error Codes

### MCP Protocol Errors

| Code | Message | Descripción |
|------|---------|------------|
| -32700 | Parse Error | Error de parsing JSON-RPC |
| -32600 | Invalid Request | Request inválido |
| -32601 | Method Not Found | Tool/Resource no encontrado |
| -32602 | Invalid Params | Parámetros inválidos |
| -32603 | Internal Error | Error interno del servidor |
| -32000 | Server Error | Error genérico del servidor |

### Application Errors

| Code | Message | Solución |
|------|---------|-----------|
| `VALIDATION_ERROR` | Parámetros de validación fallaron | Verificar input schema |
| `EXECUTION_ERROR` | Error durante ejecución de código | Revisar código y logs |
| `AUTHENTICATION_FAILED` | Error de autenticación | Verificar credenciales |
| `TIMEOUT_ERROR` | Timeout de ejecución | Aumentar timeout u optimizar código |
| `ACCESS_DENIED` | Acceso no autorizado | Usar endpoint de whitelist o modo permissive |

---

## Security

### Autenticación

El MCP v2.0 usa JWT tokens para autenticación con el Dashboard API:

```javascript
// Autenticación automática por el cliente
// Tokens se renuevan automáticamente al expirar (401)
```

### Sandbox Security

**Strict Mode (recomendado):**
- ✅ Whitelist de endpoints predefinidos
- ✅ Validación de cada endpoint antes de ejecutar
- ✅ Previene inyección de endpoints maliciosos

**Permissive Mode (solo para uso avanzado):**
- ✅ Permite cualquier endpoint de la API
- ⚠️ No valida endpoints
- ⚠️ Debe usarse solo con código confiable

### Timeout Protection

- Default: 5 segundos
- Máximo: 30 segundos
- Previene loops infinitos y consumo excesivo de recursos

### Validaciones

- Límite de código: 10,000 caracteres
- Lenguajes permitidos: JavaScript, TypeScript, SQL
- Validación de sintaxis antes de ejecución

---

## Examples

### Example 1: Flujo Completo de Trabajo

```javascript
// 1. Establecer contexto de proyecto
await run_code({
  code: `
const project = await apiCall('/projects');
const target = projects.find(p => p.name === 'Mi Proyecto');
return { project: target };
`,
  timeout: 5000
});

// 2. Obtener tareas listas
await run_code({
  code: getScriptTemplate('tasks-list'),
  timeout: 5000
});

// 3. Crear nueva tarea
await run_code({
  code: getScriptTemplate('tasks-create'),
  timeout: 5000
});
```

### Example 2: Análisis de Datos

```javascript
await run_code({
  code: `
// Obtener projects, tasks, agents en paralelo
const [projects, tasks, agents] = await Promise.all([
  apiCall('/projects'),
  apiCall('/tasks'),
  apiCall('/agents')
]);

// Calcular estadísticas
const stats = {
  totalProjects: projects.length,
  totalTasks: tasks.length,
  totalAgents: agents.length,
  avgTasksPerProject: tasks.length / projects.length,
  busyAgents: agents.filter(a => a.status === 'busy').length
};

return { stats };
`,
  timeout: 10000
});
```

### Example 3: Batch Operations

```javascript
await run_code({
  code: `
// Crear múltiples tareas en lote
const taskTitles = ['Tarea 1', 'Tarea 2', 'Tarea 3'];
const projectId = 1;

const tasks = await Promise.all(
  taskTitles.map(title =>
    apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        title: title,
        priority: 'medium',
        status: 'pending'
      })
    })
  )
);

return { createdTasks: tasks };
`,
  timeout: 15000
});
```

### Example 4: Memory Management

```javascript
await run_code({
  code: `
// Crear memoria de decisión
const memory = await apiCall('/memories', {
  method: 'POST',
  body: JSON.stringify({
    content: 'Decidimos usar JWT para autenticación',
    tags: ['decision', 'architecture', 'security'],
    importance: 0.9
  })
});

// Crear memoria de aprendizaje
const learning = await apiCall('/memories', {
  method: 'POST',
  body: JSON.stringify({
    content: 'Aprendimos que TypeScript strict mode reduce bugs',
    tags: ['learning', 'typescript'],
    importance: 0.7
  })
});

return { memory, learning };
`,
  timeout: 5000
});
```

### Example 5: Gestión Completa de Sprint

```javascript
await run_code({
  code: `
// Crear sprint
const sprint = await apiCall('/sprints', {
  method: 'POST',
  body: JSON.stringify({
    project_id: 1,
    name: 'Sprint 1',
    status: 'planned',
    start_date: new Date().toISOString(),
    goal: 'Completar features core'
  })
});

// Crear epics
const epics = await Promise.all([
  apiCall('/epics', {
    method: 'POST',
    body: JSON.stringify({
      project_id: 1,
      name: 'Epic 1: Authentication',
      status: 'open'
    })
  }),
  apiCall('/epics', {
    method: 'POST',
    body: JSON.stringify({
      project_id: 1,
      name: 'Epic 2: Authorization',
      status: 'open'
    })
  })
]);

return { sprint, epics };
`,
  timeout: 10000
});
```

---

## Types Reference

### Project
```typescript
interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  budget: number | string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}
```

### Task
```typescript
interface Task {
  id: number;
  task_code: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  project_id: number;
  assigned_agent_id?: number;
  estimated_hours?: number;
  actual_hours?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
}
```

### Agent
```typescript
interface Agent {
  id: number;
  name: string;
  role: 'architect' | 'developer' | 'tester' | 'designer' | 'product-manager';
  status: 'idle' | 'busy' | 'offline';
  assigned_tasks: number;
}
```

### Sprint
```typescript
interface Sprint {
  id: number;
  project_id: number;
  name: string;
  goal?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  velocity?: number;
  capacity?: number;
}
```

### Epic
```typescript
interface Epic {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  color?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  start_date?: string;
  target_date?: string;
}
```

---

## Changelog

### v2.0.0 (2026-01-06)

**Core Changes:**
- ✅ Reduce de 70+ tools a 2 core tools (`get_context`, `run_code`)
- ✅ Endpoint unificado para estado del sistema
- ✅ Sandbox seguro con whitelist de endpoints
- ✅ Biblioteca de templates pre-definidos

**Improvements:**
- 🚀 Mejor performance: 1 llamada vs 5 llamadas
- 🎨 Más flexibilidad para usuarios
- 📖 Mejor documentación (guía de migración + API reference)

---

**SOLARIA Digital Field Operations**
**c) 2024-2025 SOLARIA AGENCY**
