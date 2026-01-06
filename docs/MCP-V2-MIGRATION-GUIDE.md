# Guía de Migración DFO MCP v1.0 → v2.0

**Sketch Pattern** - Arquitectura simplificada con 2 core tools

---

## 📋 Resumen de Cambios

El MCP v2.0 reduce la complejidad de 70+ herramientas a solo **2 core tools**:

| Concepto | v1.0 (70+ tools) | v2.0 (2 tools) |
|----------|----------------------|-------------------|
| **Core Tools** | `list_projects`, `create_project`, `get_project`, `update_project`, `list_tasks`, `create_task`, `get_task`, `update_task`, `complete_task`, `list_agents`, `get_agent`, `update_agent_status`, etc. | `get_context`, `run_code` |
| **Enfoque** | Herramientas dedicadas para cada operación | API unificada + scripts personalizados |
| **Flexibilidad** | Limitado a tools predefinidas | Cualquier operación personalizable |

---

## 🎯 Concepto Sketch Pattern

El "Sketch Pattern" es una arquitectura minimalista que:

1. **`get_context`**: Obtiene todo el estado del sistema en una sola llamada
   - Projects, Tasks, Agents, Stats, Health, Alerts, Sprints, Epics
   - Todo paralelo en 200-300ms

2. **`run_code`**: Ejecuta código JavaScript/TypeScript/SQL en sandbox seguro
   - Timeout configurable (5-30 segundos)
   - Whitelist de endpoints para seguridad
   - Modos: strict/permissive

### Analogía

**v1.0** = Una caja de herramientas pre-fabricadas (70+ herramientas)
**v2.0** = Un lienzo + pincel (2 herramientas) para crear lo que necesitas

---

## 🔄 Ejemplos de Migración

### Ejemplo 1: Listar Proyectos

**v1.0:**
```
list_projects({ status: 'active' })
```

**v2.0:**
```
await run_code({
  code: `
const projects = await apiCall('/projects?status=active');
return { projects };
`,
  timeout: 5000
})
```

---

### Ejemplo 2: Crear una Tarea

**v1.0:**
```
create_task({
  title: 'Implementar autenticación',
  project_id: 1,
  priority: 'high',
  status: 'pending'
})
```

**v2.0:**
```
await run_code({
  code: `
const task = await apiCall('/tasks', {
  method: 'POST',
  body: JSON.stringify({
    project_id: 1,
    title: 'Implementar autenticación',
    priority: 'high',
    status: 'pending'
  })
});
return { task };
`,
  timeout: 5000
})
```

---

### Ejemplo 3: Usar Template Pre-definido

**v2.0 con Template:**
```
// Usar template 'tasks-create' de la biblioteca
const template = await getScriptTemplate('tasks-create');
await run_code({
  code: template,
  timeout: 5000
})
```

---

## 📚 Biblioteca de Templates

El MCP v2.0 incluye una biblioteca de templates pre-definidos para operaciones comunes:

### Projects
- `projects-list` - Listar todos los proyectos
- `projects-get` - Obtener proyecto específico
- `projects-create` - Crear nuevo proyecto
- `projects-update` - Actualizar proyecto

### Tasks
- `tasks-list` - Listar tareas de un proyecto
- `tasks-create` - Crear nueva tarea
- `tasks-update` - Actualizar estado de tarea
- `tasks-complete` - Marcar tarea como completada

### Agents
- `agents-list` - Listar todos los agentes
- `agents-update-status` - Actualizar estado de agente

### Memory
- `memory-create` - Crear memoria
- `memory-search` - Buscar memorias
- `memory-semantic` - Búsqueda semántica

### Dashboard
- `dashboard-overview` - Obtener overview del dashboard

### Multi-operation
- `multi-operation` - Ejecutar múltiples operaciones en paralelo

### Uso de Templates

```javascript
// Importar función de templates
import { getScriptTemplate } from './scripts/v2/templates.js';

// Obtener template
const template = await getScriptTemplate('tasks-create');

// Ejecutar con run_code
await run_code({
  code: template,
  timeout: 5000
});
```

---

## 🔒 Seguridad del Sandbox

El `run_code` incluye:

1. **Whitelist de Endpoints** (modo `strict`):
   - Solo permite acceso a endpoints específicos
   - Bloquea endpoints no autorizados

2. **Timeout**:
   - Default: 5 segundos
   - Máximo: 30 segundos
   - Previene loops infinitos

3. **Validación**:
   - Límite de código: 10,000 caracteres
   - Solo lenguajes: JavaScript, TypeScript, SQL
   - Validación de sintaxis antes de ejecución

---

## ⚡ Performance

**v1.0:**
- Latencia por tool: 50-150ms
- Para 5 operaciones: 250-750ms

**v2.0:**
- Latencia de `get_context`: 200-300ms (paralelo)
- Latencia de `run_code`: 5-30s (configurable)
- Total para 5 operaciones similares: 200-300ms (1 sola llamada `get_context`)

---

## 📖 API Reference Completa

### Tool: get_context

Obtiene el estado unificado del sistema DFO en una sola llamada.

**Parámetros:**
```typescript
{
  project_id?: number;        // Filtrar por ID de proyecto
  project_name?: string;      // Filtrar por nombre de proyecto (búsqueda parcial)
  include?: {
    projects?: boolean;      // Incluir proyectos (default: true)
    tasks?: boolean;          // Incluir tareas (default: false)
    agents?: boolean;         // Incluir agentes (default: false)
    stats?: boolean;          // Incluir estadísticas de memoria (default: false)
    health?: boolean;         // Incluir health check (default: true)
    alerts?: boolean;         // Incluir alertas (default: false)
    sprints?: boolean;        // Incluir sprints (requiere project_id)
    epics?: boolean;          // Incluir epics (requiere project_id)
  };
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "context": {
      "projects": [...],      // Si include.projects !== false
      "tasks": [...],         // Si include.tasks !== false
      "agents": [...],        // Si include.agents === true
      "stats": {...},          // Si include.stats === true
      "health": {...},         // Si include.health !== false
      "alerts": [...],        // Si include.alerts === true
      "sprints": [...],       // Si include.sprints === true + project_id
      "epics": [...]         // Si include.epics === true + project_id
      "dashboard": {...}       // Overview global si no project_id
    },
    "project_id": 1,
    "timestamp": "2026-01-06T22:00:00.000Z",
    "message": "Context retrieved for project ID: 1"
  }
}
```

---

### Tool: run_code

Ejecuta código JavaScript/TypeScript/SQL en sandbox seguro con acceso completo a la API del DFO.

**Parámetros:**
```typescript
{
  code: string;                // Código a ejecutar (máx 10,000 caracteres)
  language?: 'javascript' | 'typescript' | 'sql';  // Default: 'javascript'
  timeout?: number;            // Timeout en ms (default: 5000, max: 30000)
  sandbox?: 'strict' | 'permissive';  // Default: 'strict'
}
```

**Contexto Disponible:**
```javascript
{
  apiCall,      // Función para llamar endpoints de la API
  console,       // { log, error } - Logging sandbox
  fetch,        // fetch global
  JSON,         // JSON global
  Math,         // Math global
  Date,         // Date global
}
```

**Ejemplo de uso:**
```javascript
await run_code({
  code: `
// Ejemplo: Crear proyecto y obtener tasks
const project = await apiCall('/projects', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Nuevo Proyecto',
    client: 'Cliente',
    description: 'Descripción',
    budget: 100000,
    status: 'planning',
    priority: 'medium'
  })
});

const tasks = await apiCall('/tasks?project_id=' + project.id);

return { project, tasks };
`,
  language: 'javascript',
  timeout: 10000,
  sandbox: 'strict'
});
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "output": { project: {...}, tasks: [...] },
    "execution_time_ms": 150,
    "memory_used_mb": 0,
    "metadata": {
      "language": "javascript",
      "sandbox_mode": "strict",
      "code_length": 245
    }
  }
}
```

---

## 🎨 Patrones Comunes

### Patrón 1: Proyecto Aislado

```javascript
// 1. Establecer contexto
await run_code({
  code: getScriptTemplate('set-project-context'),
  timeout: 5000
});

// 2. Trabajar en contexto aislado
await run_code({
  code: `
const tasks = await apiCall('/tasks?status=pending');
return { ready_tasks: tasks };
`,
  timeout: 5000
});
```

### Patrón 2: Operaciones en Lote

```javascript
await run_code({
  code: `
const [projects, tasks, agents] = await Promise.all([
  apiCall('/projects'),
  apiCall('/tasks'),
  apiCall('/agents')
]);

return { projects, tasks, agents };
`,
  timeout: 10000
});
```

### Patrón 3: Error Handling

```javascript
await run_code({
  code: `
try {
  const result = await apiCall('/projects/999');
  return { result };
} catch (error) {
  return { error: error.message, suggestion: 'Use list_projects to find valid IDs' };
}
`,
  timeout: 5000
});
```

---

## 🚨 Errores Comunes

### Error 1: Endpoint no permitido (modo strict)
```
Access to endpoint "/random-endpoint" is not allowed
```
**Solución:** Usar modo `sandbox: 'permissive'` o usar endpoint de la whitelist

### Error 2: Timeout excedido
```
Execution timeout after 30000ms
```
**Solución:** Optimizar código o aumentar `timeout` parameter

### Error 3: Sintaxis inválida
```
SyntaxError: Unexpected token
```
**Solución:** Verificar código antes de enviar

---

## 📊 Comparativa de Features

| Feature | v1.0 | v2.0 |
|---------|--------|--------|
| List Projects | ✅ `list_projects()` | ✅ `run_code()` con template `projects-list` |
| Create Project | ✅ `create_project()` | ✅ `run_code()` con template `projects-create` |
| List Tasks | ✅ `list_tasks()` | ✅ `run_code()` o `get_context({include: {tasks}})` |
| Create Task | ✅ `create_task()` | ✅ `run_code()` con template `tasks-create` |
| List Agents | ✅ `list_agents()` | ✅ `run_code()` con template `agents-list` |
| Memory Operations | ✅ `memory_*()` | ✅ `run_code()` con templates `memory-*` |
| Dashboard Overview | ✅ `get_dashboard_overview()` | ✅ `get_context()` o `run_code()` |
| Custom Operations | ❌ No disponible | ✅ `run_code()` flexible |
| Parallel Fetch | ❌ Manual | ✅ `Promise.all()` en código |

---

## 🚀 Migración Paso a Paso

### Paso 1: Aprender get_context
```javascript
// Reemplazar llamadas múltiples
const [projects, tasks] = await Promise.all([
  list_projects(),
  list_tasks({ project_id: 1 })
]);

// Con una sola llamada
const context = await get_context({
  project_id: 1,
  include: { projects: true, tasks: true }
});
```

### Paso 2: Migrar llamadas a run_code
```javascript
// v1.0
const project = await create_project({...});

// v2.0
await run_code({
  code: `
const project = await apiCall('/projects', {
  method: 'POST',
  body: JSON.stringify({...})
});
return { project };
`,
  timeout: 5000
});
```

### Paso 3: Usar Templates
```javascript
import { getScriptTemplate } from './scripts/v2/templates.js';

// Obtener template pre-definido
const template = await getScriptTemplate('tasks-create');

// Personalizar si necesario
const customizedTemplate = template.replace(/'New Task'/g, "'My Custom Task'");

// Ejecutar
await run_code({ code: customizedTemplate });
```

---

## 📝 Best Practices

### 1. Usar `get_context` para lectura
✅ **Bien:** `get_context({ include: { projects, tasks, agents }})`
❌ **Mal:** `list_projects(); list_tasks(); list_agents()`

### 2. Usar `run_code` para escritura
✅ **Bien:** `run_code({ code: '...', sandbox: 'strict' })`
❌ **Mal:** Intentar usar tools v1.0 que no existen

### 3. Aprovechar `Promise.all` para paralelismo
```javascript
// Ejemplo: Múltiples fetches en paralelo
const [a, b, c] = await Promise.all([
  apiCall('/endpoint-a'),
  apiCall('/endpoint-b'),
  apiCall('/endpoint-c')
]);
```

### 4. Manejar errores apropiadamente
```javascript
try {
  const result = await apiCall('/endpoint');
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

### 5. Usar timeouts apropiados
```javascript
// Operación rápida (lectura): 5 segundos
await run_code({ code: '...', timeout: 5000 });

// Operación compleja (escritura + validación): 10 segundos
await run_code({ code: '...', timeout: 10000 });

// Operación muy compleja: 30 segundos (máximo)
await run_code({ code: '...', timeout: 30000 });
```

---

## 🎓 Recursos de Aprendizaje

1. **Script Templates**: `scripts/v2/templates.ts` - Biblioteca completa de ejemplos
2. **Type Definitions**: `types-v2.ts` - Todos los tipos TypeScript
3. **Endpoints**: `src/endpoints/get-context.ts`, `src/endpoints/run-code.ts` - Implementación de tools

---

## 💬 Preguntas Frecuentes

**Q: ¿Puedo mezclar v1.0 y v2.0?**
A: No recomendado. Migrar completamente a v2.0 para consistencia.

**Q: ¿Qué pasa con las tools v1.0?**
A: Deperadas en el cutover exitoso de v2.0.

**Q: ¿Puedo crear mis propios templates?**
A: Sí, extiende `scripts/v2/templates.ts` o define en tu código.

**Q: ¿Es seguro ejecutar código en sandbox?**
A: Sí, tiene whitelist de endpoints, timeout, y validación de sintaxis.

---

**SOLARIA Digital Field Operations**
**c) 2024-2025 SOLARIA AGENCY**
