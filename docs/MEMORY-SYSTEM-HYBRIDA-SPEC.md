# SOLARIA Memory System - Híbrida

## Especificación Técnica v1.0

**Proyecto:** SOLARIA Digital Field Operations
**Fecha:** 2026-01-06
**Estado:** Planning
**Prioridad:** Critical
**Presupuesto:** $50,000.00

---

## 1. Resumen Ejecutivo

Sistema de memoria persistente híbrido que combina:
- **claude-mem (Edge)**: Memoria local ultra-rápida para contexto inmediato
- **DFO Central (Cloud)**: Memoria centralizada para histórico y cross-device

**Objetivo:** Proporcionar contexto continuo a agentes IA a través de sesiones, manteniendo:
- Performance inmediato (<10ms queries)
- Disponibilidad offline
- Histórico persistente
- Cross-device sync

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────┐
│  EDGE (Máquina Local)                        │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  claude-mem (Plugin OpenCode)        │   │
│  │  ├─ SQLite: ~/.claude-mem/           │   │
│  │  │  ├─ claude-mem.db                 │   │
│  │  │  └─ vector-db/ (Chroma)          │   │
│  │  ├─ Worker HTTP: 127.0.0.1:37777    │   │
│  │  └─ Hooks: SessionStart, ToolUse,    │   │
│  │              SessionEnd                 │   │
│  └──────────────────────────────────────────┘   │
└──────────────┬────────────────────────────────┘
               ↓ HTTPS (batch sync)
┌─────────────────────────────────────────────────┐
│  CLOUD (DFO Server 46.62.222.138)            │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  DFO MCP Server + Memory Module        │   │
│  │  ├─ PostgreSQL (memory_*)            │   │
│  │  ├─ Chroma DB (vectors)              │   │
│  │  ├─ Sync API (/memory/*)             │   │
│  │  └─ MCP Tools (memory_*)             │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 3. Componentes

### 3.1 claude-mem Local (Edge)

**Propósito:**
- Capturar observaciones de sesiones OpenCode
- Proporcionar búsqueda ultra-rápida
- Funcionar offline

**Tecnologías:**
- Runtime: Bun
- Database: SQLite 3
- Vector DB: Chroma (local)
- Web Server: Express.js (localhost:37777)

**Funcionalidades:**
1. **Captura automática**
   - SessionStart → Inyectar contexto relevante
   - UserPromptSubmit → Track user messages
   - PostToolUse → Almacenar observación
   - SessionEnd → Generar summary con Claude Agent SDK

2. **Almacenamiento**
   - Observaciones en SQLite
   - Embeddings en Chroma
   - Metadata: session_id, tool_name, project, timestamp

3. **Búsqueda**
   - Full-text search (SQLite FTS5)
   - Semantic search (Chroma embeddings)
   - Progressive disclosure (3-layer)

4. **Sync**
   - Batch periódico (cada 1 hora)
   - Sync manual (/memory sync)
   - Conflict resolution: Last-write-wins

---

### 3.2 DFO Memory Central (Cloud)

**Propósito:**
- Histórico completo (todos los dispositivos)
- Cross-device context sharing
- Backup centralizado
- Colaboración multi-dev

**Tecnologías:**
- Database: PostgreSQL (existente)
- Vector DB: Chroma (service)
- API: Express.js (DFO MCP Server)
- MCP Protocol: @modelcontextprotocol/sdk

**Funcionalidades:**
1. **API Endpoints**
   - `POST /memory/sync` - Recibir batch de observaciones
   - `GET /memory/search` - Búsqueda semántica
   - `GET /memory/context/:project` - Contexto relevante
   - `GET /memory/timeline/:session` - Timeline de sesión

2. **MCP Tools**
   - `memory_sync_remote` - Sincronizar con central
   - `memory_search_remote` - Buscar en todas las máquinas
   - `memory_get_context` - Obtener contexto para sesión
   - `memory_restore` - Restaurar desde backup

3. **Vector Search**
   - Chroma integration con OpenAI embeddings
   - Ranking por relevancia + tiempo
   - Cross-machine aggregation

---

## 4. Schema de Base de Datos

### 4.1 Memoria Local (SQLite - claude-mem)

```sql
-- Observaciones de tool usage
CREATE TABLE observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_input JSON,
  tool_response JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resúmenes de sesiones
CREATE TABLE summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  key_points JSON,
  tags JSON,
  observations_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync metadata
CREATE TABLE sync_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  last_synced_at TIMESTAMP,
  synced_observation_ids JSON,
  machine_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para búsquedas rápidas
CREATE INDEX idx_observations_session ON observations(session_id);
CREATE INDEX idx_observations_created ON observations(created_at DESC);
CREATE VIRTUAL TABLE obs_fts USING fts5(
  content='observations',
  tool_name,
  metadata
);
```

---

### 4.2 Memoria Central (PostgreSQL - DFO)

```sql
-- Máquinas registradas
CREATE TABLE memory_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id TEXT UNIQUE NOT NULL,
  machine_name TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);

-- Observaciones remotas
CREATE TABLE memory_observations_remote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id TEXT NOT NULL REFERENCES memory_machines(machine_id),
  local_observation_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_input JSONB,
  tool_output JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_machine FOREIGN KEY (machine_id)
    REFERENCES memory_machines(machine_id) ON DELETE CASCADE
);

-- Resúmenes de sesiones
CREATE TABLE memory_summaries_remote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  project TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[],
  tags TEXT[],
  observations_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de sincronizaciones
CREATE TABLE memory_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'batch', 'manual', 'session_end'
  observations_count INTEGER,
  sync_duration_ms INTEGER,
  status TEXT, -- 'success', 'partial', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inyecciones de contexto (tracking)
CREATE TABLE memory_context_injections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_session_id TEXT,
  source_observations UUID[],
  injection_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices optimizados
CREATE INDEX idx_remote_machine ON memory_observations_remote(machine_id);
CREATE INDEX idx_remote_session ON memory_observations_remote(session_id);
CREATE INDEX idx_remote_created ON memory_observations_remote(created_at DESC);
CREATE INDEX idx_sync_log_machine ON memory_sync_log(machine_id);
```

---

## 5. Flujo de Trabajo

### 5.1 Captura y Almacenamiento (Edge)

```
1. OpenCode inicia sesión
   ↓
2. claude-mem: SessionStart hook
   ↓
3. Búsqueda local: Últimas observaciones (últimos 7 días)
   ↓
4. Inyección de contexto en prompt:
   ════ PROJECT MEMORY (LOCAL) ═══
   • Obs #412: JWT auth implementado (3 días)
   • Obs #398: Sessions table schema
   ═════════════════════════════════════════
   ↓
5. Usuario trabaja: read(), write(), edit()...
   ↓
6. claude-mem: PostToolUse hook (x7 observaciones)
   ↓
7. Cada tool → INSERT INTO observations (SQLite)
   ↓
8. Sesión finaliza
   ↓
9. claude-mem: SessionEnd hook
   ↓
10. Generación de summary con Claude Agent SDK
   ↓
11. INSERT INTO summaries (SQLite)
   ↓
12. [AUTO] DFO Sync Agent detecta cambios
   ↓
13. Batch sync → DFO Server (cada 1 hora)
```

---

### 5.2 Sincronización (Bidireccional)

```
EDGE → CLOUD (Push):
────────────────────────────────
1. DFO Sync Agent detecta cambios pendientes
2. SELECT * FROM observations
   WHERE created_at > last_synced_at
3. POST /memory/sync con batch
4. DFO Server:
   - INSERT INTO memory_observations_remote
   - Genera embeddings (Chroma)
   - INSERT INTO memory_sync_log
5. Edge actualiza last_synced_at

CLOUD → EDGE (Pull - opcional):
─────────────────────────────────
1. Usuari abre nueva sesión en otra máquina
2. MCP call: memory_get_context(project="SOLARIA-DFO")
3. DFO Server:
   - Vector search en Chroma
   - Agrega observaciones de todas las máquinas
4. Inyección de contexto cross-device
```

---

### 5.3 Búsqueda y Retrieval

```
1. Usuario pregunta: "¿Cómo implementamos el refresh token?"
   ↓
2. claude-mem local:
   - Full-text search: SELECT * FROM obs_fts WHERE 'refresh token'
   - Resultado: 3 observaciones locales
   ↓
3. Si usuario quiere contexto completo:
   - MCP call: memory_search_remote(query="refresh token")
   ↓
4. DFO Server:
   - Vector search en Chroma
   - Agrega observaciones de todas las máquinas
   - Ranking por relevancia + tiempo
   ↓
5. Resultado combinado:
   ════ CROSS-DEVICE CONTEXT ═══
   • Macbook (carlos): Refresh token hace 15 días
   • Desktop (oficina): Tests completados ayer
   ═════════════════════════════════════════
```

---

## 6. MCP Tools

### 6.1 Tools DFO Memory (Nuevos)

```typescript
{
  name: "memory_sync_remote",
  description: "Sincronizar memoria local con servidor central",
  inputSchema: {
    type: "object",
    properties: {
      sync_type: {
        type: "string",
        enum: ["batch", "manual", "full"],
        default: "manual"
      },
      force: { type: "boolean", default: false }
    }
  }
}

{
  name: "memory_search_remote",
  description: "Buscar en memoria central (todas las máquinas)",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", required: true },
      project: { type: "string" },
      machine_id: { type: "string" }, // opcional
      time_range: {
        type: "object",
        properties: {
          from: { type: "string" }, // ISO date
          to: { type: "string" }
        }
      },
      limit: { type: "number", default: 50 }
    }
  }
}

{
  name: "memory_get_context",
  description: "Obtener contexto relevante para sesión actual",
  inputSchema: {
    type: "object",
    properties: {
      project: { type: "string" },
      session_id: { type: "string" }
    }
  }
}

{
  name: "memory_restore",
  description: "Restaurar memoria desde servidor central",
  inputSchema: {
    type: "object",
    properties: {
      machine_id: { type: "string" },
      date_range: { type: "object" },
      include_embeddings: { type: "boolean", default: true }
    }
  }
}
```

---

## 7. Políticas

### 7.1 Retención de Datos

```
EDGE (claude-mem):
├─ Observaciones: 30 días
├─ Resúmenes: 365 días
└─ Embeddings: 30 días

CLOUD (DFO):
├─ Observaciones: Permanente (configurable)
├─ Resúmenes: Permanente
└─ Embeddings: 365 días

Pruning:
├─ Frecuencia: Semanal
└─ Método: DELETE WHERE created_at < retention_date
```

---

### 7.2 Prioridad de Búsqueda

```
1. Mismo proyecto + últimos 7 días (peso: 1.0)
2. Mismo proyecto + últimos 30 días (peso: 0.8)
3. Similares tags + cualquier fecha (peso: 0.6)
4. Otros proyectos (peso: 0.4)
```

---

### 7.3 Sincronización

```
Batch periódico:
├─ Frecuencia: 1 hora
├─ Tamaño batch: Max 1000 obs
└─ Timeout: 30 segundos

Sync manual:
├─ Trigger: /memory sync
├─ Tamaño: Ilimitado
└─ Timeout: 2 minutos

Sync conflictos:
├─ Strategy: Last-write-wins
├─ Metadata: who, when, what changed
└─ Notification: Usuario notificado
```

---

## 8. Performance

### 8.1 Métricas Objetivo

```
EDGE (claude-mem):
├─ Query local: <10ms (95th percentile)
├─ Storage: <50ms por observación
└─ Batch sync: <30s (1000 obs)

CLOUD (DFO):
├─ Query central: <100ms (95th percentile)
├─ Storage: <200ms por observación
└─ Vector search: <150ms

Sync:
├─ Latencia red: 50-200ms
├─ Throughput: 100 obs/segundo
└─ Total sync: <5 minutos (histórico completo)
```

---

### 8.2 Escalabilidad

```
EDGE:
├─ Máquinas: Ilimitadas
├─ Obs por máquina: 100,000 (30 días @ 100 obs/día)
└─ Total: Depende de # máquinas

CLOUD:
├─ Máquinas: 100+ concurrentes
├─ Total obs: 10,000,000+ (100 máquinas @ 1000 obs/día)
├─ PostgreSQL: Escala horizontal (read replicas)
└─ Chroma: Escala horizontal (sharding)
```

---

## 9. Seguridad

### 9.1 Autenticación

```
EDGE:
├─ Auth: No requerido (local only)
└─ Access: Solo usuario local

CLOUD:
├─ Auth: JWT tokens (DFO system)
├─ Machine ID: UUID único por dispositivo
└─ API Rate Limit: 100 req/segundo/máquina
```

---

### 9.2 Privacidad

```
EDGE:
├─ Datos locales: Nunca enviados sin consentimiento
├─ Encrypting: Opcional (SQLite encryption)
└─ Private tags: <private> no se sincroniza

CLOUD:
├─ Data in transit: HTTPS/TLS 1.3
├─ Data at rest: PostgreSQL encryption at rest
└─ GDPR: Right to deletion
```

---

## 10. Costos

### 10.1 Infraestructura (Existente)

```
CLOUD (DFO Server):
├─ Servidor: $0 (ya existe - 46.62.222.138)
├─ PostgreSQL: $0 (ya existe)
├─ Chroma: $0 (open-source)
└─ Embeddings: $0.10-0.20 / 1K tokens

EDGE (claude-mem):
├─ SQLite: $0 (bundled)
├─ Chroma local: $0 (open-source)
└─ Runtime: $0 (Bun)

TOTAL ADICIONAL: $0-50/mes (solo embeddings)
```

---

## 11. Timeline de Implementación

### Fase 1: Infraestructura DFO (2-3 días)
- [ ] Crear tablas PostgreSQL
- [ ] Implementar endpoints `/memory/sync`, `/memory/search`
- [ ] Configurar Chroma vector DB
- [ ] Add MCP tools a DFO Server

### Fase 2: Sync Agent Local (1 día)
- [ ] Desarrollar DFO Sync Agent
- [ ] Integrar con claude-mem local
- [ ] Implementar batch sync periódico

### Fase 3: Testing & Refinamiento (1 día)
- [ ] Test sync bidireccional
- [ ] Test conflict resolution
- [ ] Test cross-device search
- [ ] Performance benchmarks

### Fase 4: Despliegue (1 día)
- [ ] Deploy DFO endpoints a producción
- [ ] Configurar Chroma service
- [ ] Documentación de usuario

**TOTAL:** 5-6 días

---

## 12. Métricas de Éxito

```
Performance:
✓ Queries locales: <10ms (95th)
✓ Queries cross-device: <100ms (95th)
✓ Sync batch: <5 minutos (histórico completo)

Funcionalidad:
✓ Offline disponible: 100%
✓ Cross-device context: 100%
✓ Retención de datos: 365 días+

Uso:
✓ Sesiones con contexto: >90%
✓ Sync exitoso: >95%
✓ User satisfaction: >4.0/5.0
```

---

## 13. Alternativas Consideradas

### Opción A: Solo claude-mem (Local)
```
Pros:
✓ Performance excelente
✓ Offline disponible
✓ Zero infrastructure

Contras:
✗ Sin cross-device
✗ No backup central
✗ Sin colaboración

Veredicto: ❌ Rechazado (falta collaboration)
```

---

### Opción B: Solo DFO Central (Cloud)
```
Pros:
✓ Cross-device
✓ Backup central
✓ Colaboración

Contras:
✗ Performance degradado (latencia red)
✗ No offline
✗ Single point of failure

Veredicto: ❌ Rechazado (falta performance)
```

---

### Opción C: Híbrida (EDGE + CLOUD) ✅
```
Pros:
✓ Performance local (<10ms)
✓ Offline disponible
✓ Cross-device sync
✓ Backup central
✓ Colaboración
✓ Costo cero (infraestructura existente)

Contras:
⚠️ Eventual consistency (1 hora retraso)
⚠️ Complejidad media (dos sistemas)

Veredicto: ✅ ACEPTADO (mejor balance)
```

---

## 14. Appendix

### 14.1 Referencias

- claude-mem: https://github.com/thedotmack/claude-mem
- OpenCode: https://github.com/ohmyopencode/oh-my-opencode
- Chroma DB: https://www.trychroma.com/
- MCP Protocol: https://modelcontextprotocol.io/

### 14.2 Version History

- v1.0 (2026-01-06): Especificación inicial

---

**Autor:** ECO-Lambda (Λ) - SOLARIA AGENCY
**Revisión:** v1.0
**Estado:** Ready for Implementation
