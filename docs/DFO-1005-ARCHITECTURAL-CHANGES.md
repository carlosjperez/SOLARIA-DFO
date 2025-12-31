# DFO-1005: Parallel Agent Execution Engine - Architectural Changes

**Epic:** Epic 1 - Parallel Agent Execution Engine
**Sprint:** 1.2 - Execution Control
**Date:** 2025-12-30
**Status:** ✅ Deployed to Production

---

## Executive Summary

Implementación del motor de ejecución paralela de agentes mediante BullMQ, permitiendo procesar múltiples tareas de agentes simultáneamente con manejo de dependencias y contexto completo.

**Impacto:**
- Capacidad de procesar hasta 5 jobs simultáneos (concurrency: 5)
- Carga automática de contexto (tareas, dependencias, memorias)
- Tracking de progreso en tiempo real (0-100%)
- Detección automática de bloqueadores
- Arquitectura multi-worker escalable

---

## Cambios Arquitectónicos Principales

### 1. Multi-Worker Architecture

**Antes:** Worker container ejecutaba solo embedding worker (`index.js`)

**Después:** Worker container ejecuta múltiples workers en paralelo vía launcher

```
┌─────────────────────────────────────────────────┐
│         Worker Container (start.js)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐    ┌──────────────────┐  │
│  │ Embedding Worker │    │  Agent Execution │  │
│  │   (index.js)     │    │   Worker         │  │
│  │   Port: 3032     │    │ (agentWorker.js) │  │
│  └────────┬─────────┘    └────────┬─────────┘  │
│           │                       │             │
│           └───────────┬───────────┘             │
│                       │                         │
│              ┌────────▼────────┐                │
│              │  Shared Redis   │                │
│              │  (BullMQ Queue) │                │
│              └─────────────────┘                │
└─────────────────────────────────────────────────┘
```

**Beneficios:**
- Isolación de procesos (un crash no afecta al otro)
- Console output color-coded para debugging
- Graceful shutdown coordinado
- Escalabilidad: fácil añadir más workers

**Implementación:** `/workers/start.js` (129 líneas)

---

### 2. BullMQ Queue Integration

**Queue:** `agent-execution`
**Backend:** Redis (puerto 6379)
**Concurrency:** 5 jobs simultáneos

**Job Data Schema:**
```typescript
interface AgentJobData {
    taskId: number;           // Task a ejecutar
    taskCode: string;         // Código único (e.g., "SOL-123")
    agentId: number;          // Agente asignado (ID del registro agents)
    agentName: string;        // Nombre del agente
    projectId: number;        // Proyecto asociado
}
```

**Job Processing Pipeline (5 fases):**

```
┌─────────────────────────────────────────────────┐
│ Phase 1: Context Loading (5% progress)          │
│  - Load task with project/epic/sprint info      │
│  - Load task items (subtasks)                   │
│  - Load dependencies (blockers check)           │
│  - Load relevant memories (FULLTEXT search)     │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│ Phase 2: Validation (20% progress)              │
│  - Check for active blockers                    │
│  - If blocked: return error "TASK_BLOCKED"      │
│  - If clear: update task status to in_progress  │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│ Phase 3: Agent Execution (30-90% progress)      │
│  - [PLACEHOLDER - TO BE IMPLEMENTED]            │
│  - Will integrate with MCP client               │
│  - Will execute agent with full context         │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│ Phase 4: Finalization (90-100% progress)        │
│  - Calculate task progress from items           │
│  - Update task status (completed/in_progress)   │
│  - Log execution time                           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│ Result: AgentJobResult                          │
│  - success: boolean                             │
│  - taskId, taskCode, agentId                    │
│  - itemsCompleted, itemsTotal, progress         │
│  - executionTimeMs                              │
│  - taskStatus (completed/in_progress/blocked)   │
│  - error (if failed)                            │
└─────────────────────────────────────────────────┘
```

---

### 3. Context Loading System

**Función:** `loadTaskContext(jobData)`
**Propósito:** Cargar todo el contexto necesario para ejecutar un agente

**Contexto Cargado:**

1. **Task Details:**
   ```sql
   SELECT t.*, p.name as project_name, e.name as epic_name,
          s.name as sprint_name,
          (SELECT COUNT(*) FROM task_items WHERE task_id = t.id) as items_total,
          (SELECT COUNT(*) FROM task_items WHERE task_id = t.id AND is_completed = 1) as items_completed
   FROM tasks t
   LEFT JOIN projects p ON t.project_id = p.id
   LEFT JOIN epics e ON t.epic_id = e.id
   LEFT JOIN sprints s ON t.sprint_id = s.id
   WHERE t.id = ?
   ```

2. **Task Items (Subtasks):**
   ```sql
   SELECT * FROM task_items WHERE task_id = ? ORDER BY sort_order ASC
   ```

3. **Dependencies:**
   ```sql
   SELECT td.*, t1.status as source_task_status, t2.status as target_task_status
   FROM task_dependencies td
   LEFT JOIN tasks t1 ON td.source_task_id = t1.id
   LEFT JOIN tasks t2 ON td.target_task_id = t2.id
   WHERE td.source_task_id = ? OR td.target_task_id = ?
   ```

   Filtrado de blockers:
   - Solo tipo `blocks`
   - Target es la tarea actual
   - Source no está completado

4. **Relevant Memories:**
   ```sql
   SELECT m.*
   FROM memories m
   WHERE (m.project_id = ? OR m.project_id IS NULL)
     AND MATCH(m.content, m.summary) AGAINST(? IN BOOLEAN MODE)
   ORDER BY m.importance DESC, m.created_at DESC
   LIMIT 10
   ```

   Search terms: `task_code + project_code + primeras 3 palabras del título`

**Resultado:**
```typescript
interface TaskContext {
    task: {
        ...taskData,
        items: TaskItem[],
        items_pending: TaskItem[],
        items_completed_count: number
    },
    dependencies: {
        all: Dependency[],
        blockers: Dependency[]  // Only blocking dependencies
    },
    memories: Memory[]  // Top 10 relevant memories
}
```

---

### 4. BullMQ Event System

**Worker Events → Database Updates:**

```javascript
// Event: Job Completed
worker.on('completed', async (job, result) => {
    await db.execute(`
        UPDATE agent_jobs
        SET status = 'completed',
            job_result = ?,
            completed_at = NOW(),
            execution_time_ms = ?,
            progress = 100
        WHERE bullmq_job_id = ?
    `, [JSON.stringify(result), result.executionTimeMs, job.id]);
});

// Event: Job Failed
worker.on('failed', async (job, error) => {
    await db.execute(`
        UPDATE agent_jobs
        SET status = 'failed',
            last_error = ?,
            completed_at = NOW()
        WHERE bullmq_job_id = ?
    `, [error.message, job.id]);
});
```

**Custom Events:**
- `ready` - Worker inicializado
- `active` - Job iniciado
- `completed` - Job exitoso
- `failed` - Job falló
- `error` - Error crítico del worker

---

### 5. Redis Configuration Requirements

**CRÍTICO:** BullMQ requiere configuración específica de Redis

**Problema Encontrado:**
```
Error: BullMQ: Your redis options maxRetriesPerRequest must be null.
```

**Razón:** BullMQ usa operaciones de bloqueo Redis (BLPOP, BRPOP) que necesitan tiempo ilimitado

**Solución Aplicada:**
```javascript
const workerOptions = {
    connection: new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,      // REQUERIDO para BullMQ
        enableReadyCheck: false,         // Evita delays innecesarios
    }),
    concurrency: 5,
    lockDuration: 30000,
    autorun: true,
};
```

**Referencias:**
- [BullMQ Redis Configuration](https://docs.bullmq.io/guide/connections)
- Commit fix: `140c34c`

---

### 6. Database Connection with Retry Logic

**Estrategia:** Retry exponencial para manejar inicialización de MariaDB

```javascript
async function connectToDatabase() {
    const maxRetries = 10;
    const retryDelay = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const connection = await mysql.createConnection(dbConfig);
            console.log('[agentWorker] ✓ Database connected successfully');
            return connection;
        } catch (error) {
            console.error(`[agentWorker] Database connection attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                console.log(`[agentWorker] Retrying in ${retryDelay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            } else {
                throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
            }
        }
    }
}
```

**Parámetros:**
- Max retries: 10
- Delay: 5 segundos
- Total timeout: ~50 segundos

**Razón:** Worker container inicia antes que office container (MariaDB embedded)

---

### 7. Graceful Shutdown

**Implementación en start.js:**

```javascript
async function shutdown(signal) {
    console.log(`[Workers Launcher] Received ${signal}, shutting down gracefully...`);

    try {
        await worker.close();
        console.log('[agentWorker] ✓ Worker closed');
    } catch (error) {
        console.error('[agentWorker] ✗ Error closing worker:', error.message);
    }

    try {
        if (db) {
            await db.end();
            console.log('[agentWorker] ✓ Database closed');
        }
    } catch (error) {
        console.error('[agentWorker] ✗ Error closing database:', error.message);
    }

    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

**Secuencia de Shutdown:**
1. Cerrar worker BullMQ (detiene procesamiento de jobs)
2. Esperar jobs en progreso (lockDuration: 30s)
3. Cerrar conexión DB
4. Exit code 0

**Timeout:** Force exit después de 10 segundos si no termina

---

### 8. ESM Migration

**Decisión:** Migrar `/workers/` a ES Modules puro

**Razón:**
- Worker container usa Node.js 22 con `"type": "module"` en package.json
- Dashboard workers son TypeScript (compilan a CommonJS)
- Necesidad de separación entre dashboard y worker container

**Implementación:**

| File | Type | Runtime |
|------|------|---------|
| `/dashboard/workers/agentWorker.ts` | TypeScript | Dashboard (tsc → CommonJS) |
| `/workers/agentWorker.js` | ESM | Worker container (Node 22 nativo) |

**Patrón de imports ESM:**
```javascript
// CommonJS (dashboard)
const { Worker } = require('bullmq');

// ESM (workers)
import { Worker } from 'bullmq';
import mysql from 'mysql2/promise';
import Redis from 'ioredis';
```

**package.json:**
```json
{
  "type": "module",
  "main": "start.js"
}
```

---

## Archivos Modificados

### Nuevos Archivos

1. **`/workers/agentWorker.js`** (412 líneas)
   - Worker BullMQ para ejecución de agentes
   - Carga de contexto completo
   - 5 fases de procesamiento
   - Event handlers para actualización de DB

2. **`/workers/start.js`** (129 líneas)
   - Multi-worker launcher
   - Gestión de procesos con spawn
   - Console output color-coded
   - Graceful shutdown coordinado

### Archivos Modificados

1. **`/workers/package.json`**
   - Added: `"bullmq": "^5.34.3"`
   - Changed: `"main": "start.js"`
   - Added scripts: `start:embedding`, `start:agent`

2. **`/workers/package-lock.json`**
   - Regenerado con dependencias de BullMQ
   - 186 líneas añadidas

3. **`/worker.Dockerfile`**
   - Changed: `CMD ["node", "start.js"]`
   - Previously: `CMD ["node", "index.js"]`

---

## Deployment History

### Commit 1: f93c5ac
**Message:** "feat(workers): implement BullMQ agent execution worker"

**Changes:**
- Created `/workers/agentWorker.js`
- Created `/workers/start.js`
- Modified `/workers/package.json`
- Modified `/worker.Dockerfile`

**Result:** Build failed - package-lock.json out of sync

---

### Commit 2: 6944a9d
**Message:** "chore(workers): update package-lock.json with BullMQ dependencies"

**Changes:**
- Regenerated `/workers/package-lock.json` via `npm install`
- Added 186 lines of BullMQ dependencies

**Result:** Build succeeded, runtime failed - BullMQ Redis config error

---

### Commit 3: 140c34c
**Message:** "fix(workers): add required BullMQ Redis configuration"

**Changes:**
- Modified `/workers/agentWorker.js` lines 295-303
- Added `maxRetriesPerRequest: null`
- Added `enableReadyCheck: false`

**Result:** ✅ Deployment successful, both workers running

---

## Production Status

**Deployment Date:** 2025-12-30
**Environment:** https://dfo.solaria.agency
**Server:** 148.230.118.124

**Container Status:**
```
NAME                  STATUS
solaria-dfo-worker    Up 2 hours (healthy)
solaria-dfo-office    Up 2 hours (healthy)
solaria-dfo-mcp       Up 12 hours (healthy)
solaria-dfo-redis     Up 12 hours (healthy)
```

**Worker Logs:**
```
[Embedding Worker] Model ready: Xenova/all-MiniLM-L6-v2 (384 dims)
[Embedding Worker] Embedding server listening on port 3032

[Agent Execution Worker] Queue: agent-execution
[Agent Execution Worker] Concurrency: 5
[Agent Execution Worker] Status: READY
[Agent Execution Worker] ✓ Database connected successfully
[Agent Execution Worker] Initialization complete, waiting for jobs...
```

---

## Lecciones Aprendidas

### L-DFO-001: BullMQ Redis Configuration

**Problema:** Worker crasheaba con error "maxRetriesPerRequest must be null"

**Causa:** BullMQ usa comandos de bloqueo Redis (BLPOP) que no pueden tener retry timeout

**Solución:** Configurar explícitamente Redis client:
```javascript
new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
})
```

**Referencias:** https://docs.bullmq.io/guide/connections

---

### L-DFO-002: Multi-Worker Process Management

**Problema:** Necesidad de ejecutar múltiples workers en un solo container

**Solución:** Launcher con Node.js spawn
- Mejor que PM2 (dependencia extra)
- Mejor que bash script (no maneja señales bien)
- Color-coded output para debugging
- Auto-shutdown si cualquier worker falla

---

### L-DFO-003: ESM vs TypeScript Separation

**Problema:** Worker container necesita ESM, dashboard usa TypeScript

**Solución:** Mantener ambas versiones:
- `/dashboard/workers/*.ts` - TypeScript para desarrollo
- `/workers/*.js` - ESM para deployment

**Trade-off:** Duplicación de código, pero:
- Worker container arranca más rápido (no tsc build)
- Debugging más simple (no source maps)
- TypeScript compilation errors no bloquean deployment

---

## Próximos Pasos

### Pendientes de DFO-1005

1. **Phase 3 Implementation** (Líneas 213-226 de agentWorker.js)
   - Actualmente es placeholder con delays
   - Implementar integración con MCP client
   - Ejecutar agente con contexto cargado
   - Actualizar task items durante ejecución

2. **Error Handling Improvements**
   - Retry logic configurable
   - Circuit breaker pattern
   - Dead letter queue para jobs fallidos

3. **Monitoring & Observability**
   - Métricas Prometheus
   - Grafana dashboards
   - Alert rules para failures

### Siguiente Tarea: DFO-1006

**Add WebSocket Events**
- `agent_job_queued`
- `agent_job_started`
- `agent_job_progress`
- `agent_job_completed`
- `agent_job_failed`

**Status:** 60% complete (basic events implemented, need worker events)

---

## Referencias

- **Epic Plan:** `/Users/carlosjperez/.claude/plans/declarative-herding-melody.md`
- **BullMQ Docs:** https://docs.bullmq.io
- **Task in DFO:** https://dfo.solaria.agency/tasks (ID: TBD)
- **Commits:** f93c5ac, 6944a9d, 140c34c

---

**Documentado por:** ECO-Lambda (Λ)
**Fecha:** 2025-12-30
**Versión DFO:** 3.5.1 → 4.0.0-alpha
