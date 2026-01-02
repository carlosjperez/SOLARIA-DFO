# Agent MCP Configuration - Documentación Técnica

**Versión:** 1.0.0
**Fecha:** 2026-01-01
**Epic:** DFO-195 (Dual MCP Mode - Sprint 2.2)

---

## Descripción General

Sistema que permite a los agentes IA configurar y gestionar conexiones a servidores MCP (Model Context Protocol) externos. Implementa el modo dual del DFO: actúa como servidor MCP (70+ tools) y como cliente MCP (conexión a Context7, Playwright, CodeRabbit, etc.).

**Flujo de funcionamiento:**
```
Dashboard UI (AgentConfigEditor)
    ↓
REST API (/api/agents/:agentId/mcp-configs)
    ↓
Database (agent_mcp_configs table)
    ↓
MCPClientManager (conexión y tool execution)
    ↓
Servidor MCP Externo
```

---

## API Endpoints

### Base URL
```
Production: https://dfo.solaria.agency/api/agents/:agentId/mcp-configs
Local:      http://localhost:3030/api/agents/:agentId/mcp-configs
```

### Autenticación
Todos los endpoints requieren JWT token:
```http
Authorization: Bearer <token>
```

---

### 1. Listar Configuraciones MCP de un Agente

**Endpoint:** `GET /api/agents/:agentId/mcp-configs`

**Descripción:** Obtiene todas las configuraciones MCP asociadas a un agente específico.

**Parámetros URL:**
- `agentId` (number, requerido): ID del agente

**Response exitoso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agent_id": 11,
      "server_name": "context7",
      "server_url": "https://context7.com/mcp",
      "auth_type": "bearer",
      "transport_type": "http",
      "enabled": true,
      "connection_status": "connected",
      "last_connected_at": "2026-01-01T10:00:00.000Z",
      "created_at": "2026-01-01T09:00:00.000Z",
      "updated_at": "2026-01-01T10:00:00.000Z"
    }
  ],
  "metadata": {
    "timestamp": "2026-01-01T10:21:00Z",
    "execution_time_ms": 12,
    "version": "3.5.1"
  }
}
```

**Ejemplo cURL:**
```bash
curl -X GET "https://dfo.solaria.agency/api/agents/11/mcp-configs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Obtener Configuración MCP Específica

**Endpoint:** `GET /api/agents/:agentId/mcp-configs/:id`

**Descripción:** Obtiene los detalles completos de una configuración MCP específica.

**Parámetros URL:**
- `agentId` (number, requerido): ID del agente
- `id` (number, requerido): ID de la configuración MCP

**Response exitoso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "agent_id": 11,
    "server_name": "context7",
    "server_url": "https://context7.com/mcp",
    "auth_type": "bearer",
    "auth_credentials": {
      "token": "***"
    },
    "transport_type": "http",
    "config_options": {
      "timeout": 30000,
      "retries": 3
    },
    "enabled": true,
    "connection_status": "connected",
    "last_connected_at": "2026-01-01T10:00:00.000Z",
    "last_error": null,
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

**Ejemplo cURL:**
```bash
curl -X GET "https://dfo.solaria.agency/api/agents/11/mcp-configs/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Crear Configuración MCP

**Endpoint:** `POST /api/agents/:agentId/mcp-configs`

**Descripción:** Crea una nueva configuración MCP para un agente.

**Parámetros URL:**
- `agentId` (number, requerido): ID del agente

**Request Body:**
```json
{
  "server_name": "context7",
  "server_url": "https://context7.com/mcp",
  "auth_type": "bearer",
  "auth_credentials": {
    "token": "your-api-token-here"
  },
  "transport_type": "http",
  "config_options": {
    "timeout": 30000,
    "retries": 3
  },
  "enabled": true
}
```

**Validación (Zod Schema):**

| Campo | Tipo | Validación | Default |
|-------|------|-----------|---------|
| `server_name` | string | Min 1 char, Max 255 chars | - |
| `server_url` | string | Valid URL, Max 2048 chars | - |
| `auth_type` | enum | 'none', 'bearer', 'basic', 'api-key' | 'none' |
| `auth_credentials` | object | Record<string, unknown> | - |
| `transport_type` | enum | 'http', 'stdio', 'sse' | 'http' |
| `config_options` | object | Record<string, unknown> | - |
| `enabled` | boolean | - | true |

**Response exitoso (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "agent_id": 11,
    "server_name": "context7",
    "server_url": "https://context7.com/mcp",
    "auth_type": "bearer",
    "transport_type": "http",
    "enabled": true,
    "connection_status": "disconnected",
    "created_at": "2026-01-01T10:30:00.000Z",
    "updated_at": "2026-01-01T10:30:00.000Z"
  }
}
```

**Errores de validación (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "server_name": {
      "_errors": ["Server name is required"]
    },
    "server_url": {
      "_errors": ["Invalid server URL"]
    }
  }
}
```

**Ejemplo cURL:**
```bash
curl -X POST "https://dfo.solaria.agency/api/agents/11/mcp-configs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "context7",
    "server_url": "https://context7.com/mcp",
    "auth_type": "bearer",
    "auth_credentials": {"token": "your-token"},
    "transport_type": "http"
  }'
```

---

### 4. Actualizar Configuración MCP

**Endpoint:** `PUT /api/agents/:agentId/mcp-configs/:id`

**Descripción:** Actualiza una configuración MCP existente.

**Parámetros URL:**
- `agentId` (number, requerido): ID del agente
- `id` (number, requerido): ID de la configuración MCP

**Request Body (todos los campos opcionales):**
```json
{
  "server_name": "context7-updated",
  "enabled": false
}
```

**Validación (Zod Schema):**
- Todos los campos son opcionales
- Al menos 1 campo debe ser proporcionado
- Mismas reglas de validación que en create

**Response exitoso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "agent_id": 11,
    "server_name": "context7-updated",
    "enabled": false,
    "updated_at": "2026-01-01T10:35:00.000Z"
  }
}
```

**Error de validación (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "_errors": ["At least one field must be provided for update"]
  }
}
```

**Ejemplo cURL:**
```bash
curl -X PUT "https://dfo.solaria.agency/api/agents/11/mcp-configs/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

### 5. Eliminar Configuración MCP

**Endpoint:** `DELETE /api/agents/:agentId/mcp-configs/:id`

**Descripción:** Elimina permanentemente una configuración MCP.

**Parámetros URL:**
- `agentId` (number, requerido): ID del agente
- `id` (number, requerido): ID de la configuración MCP

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "MCP configuration deleted successfully"
}
```

**Ejemplo cURL:**
```bash
curl -X DELETE "https://dfo.solaria.agency/api/agents/11/mcp-configs/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Probar Conexión MCP

**Endpoint:** `POST /api/agents/:agentId/mcp-configs/:id/test`

**Descripción:** Prueba la conexión al servidor MCP y lista los tools disponibles.

**Parámetros URL:**
- `agentId` (number, requerido): ID del agente
- `id` (number, requerido): ID de la configuración MCP

**Proceso:**
1. Conecta al servidor MCP usando credenciales
2. Lista tools disponibles
3. Actualiza `connection_status` y `last_connected_at` en BD
4. Desconecta
5. Retorna resultado

**Response exitoso (200):**
```json
{
  "success": true,
  "connected": true,
  "tools": [
    {
      "name": "resolve-library-id",
      "description": "Resolves package name to Context7 library ID"
    },
    {
      "name": "query-docs",
      "description": "Queries documentation with semantic search"
    }
  ],
  "server_info": {
    "name": "context7",
    "version": "1.0.0"
  }
}
```

**Response error de conexión (200 con connected: false):**
```json
{
  "success": true,
  "connected": false,
  "error": "Connection timeout after 30s"
}
```

**Ejemplo cURL:**
```bash
curl -X POST "https://dfo.solaria.agency/api/agents/11/mcp-configs/1/test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Componente React: AgentConfigEditor

### Ubicación
```
/dashboard/app/src/components/agents/AgentConfigEditor.tsx
```

### Props Interface

```typescript
interface AgentConfigEditorProps {
  agentId: number;
  agentName: string;
}
```

### Funcionalidades

1. **Listado de Configuraciones**
   - Fetch automático al montar con TanStack Query
   - Display en cards con status visual
   - Indicadores de conexión (connected/disconnected/error)

2. **Crear Configuración**
   - Form con validación Zod
   - Campos: server_name, server_url, auth_type, auth_credentials, transport_type
   - Submit con mutation y refresh automático

3. **Editar Configuración**
   - Form prellenado con datos existentes
   - Update con mutation optimista
   - Validación en cliente y servidor

4. **Probar Conexión**
   - Botón "Test Connection" en cada config
   - Feedback visual de estado (loading/success/error)
   - Muestra lista de tools disponibles si conecta

5. **Eliminar Configuración**
   - Confirmación antes de eliminar
   - Mutation con optimistic update

### Integración en AgentsPage

**Patrón de implementación:**

```tsx
import { Server } from 'lucide-react';
import { useState } from 'react';
import { AgentConfigEditor } from '@/components/agents/AgentConfigEditor';

function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <>
      {/* Agent Cards con botón de config */}
      <AgentCard
        agent={agent}
        onConfigClick={(agent) => setSelectedAgent(agent)}
      />

      {/* Modal con AgentConfigEditor */}
      {selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedAgent(null)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Configuración MCP</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedAgent.name}</p>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <AgentConfigEditor
                agentId={selectedAgent.id}
                agentName={selectedAgent.name}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**AgentCard con botón de configuración:**

```tsx
function AgentCard({
  agent,
  onConfigClick
}: {
  agent: Agent;
  onConfigClick: (agent: Agent) => void
}) {
  return (
    <div className="agent-card relative">
      {/* Botón de configuración MCP - top right */}
      <button
        onClick={() => onConfigClick(agent)}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        title="Configurar conexiones MCP"
      >
        <Server className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Resto del card... */}
    </div>
  );
}
```

---

## Schema de Base de Datos

### Tabla: agent_mcp_configs

```sql
CREATE TABLE agent_mcp_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    server_name VARCHAR(255) NOT NULL,
    server_url VARCHAR(2048) NOT NULL,
    auth_type ENUM('none', 'bearer', 'basic', 'api-key') DEFAULT 'none',
    auth_credentials JSON,
    transport_type ENUM('http', 'stdio', 'sse') DEFAULT 'http',
    config_options JSON,
    enabled BOOLEAN DEFAULT TRUE,
    connection_status ENUM('disconnected', 'connected', 'error') DEFAULT 'disconnected',
    last_connected_at DATETIME,
    last_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    INDEX idx_agent_enabled (agent_id, enabled),
    INDEX idx_connection_status (connection_status)
);
```

---

## Casos de Uso

### 1. Conectar Claude Code a Context7

```bash
# 1. Login
TOKEN=$(curl -s -X POST https://dfo.solaria.agency/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"carlosjperez","password":"bypass"}' | jq -r '.token')

# 2. Crear configuración Context7
curl -X POST "https://dfo.solaria.agency/api/agents/11/mcp-configs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "context7",
    "server_url": "https://context7.com/mcp",
    "auth_type": "bearer",
    "auth_credentials": {"token": "YOUR_CONTEXT7_TOKEN"},
    "transport_type": "http"
  }'

# 3. Probar conexión
curl -X POST "https://dfo.solaria.agency/api/agents/11/mcp-configs/1/test" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Configurar Playwright para Testing

```bash
curl -X POST "https://dfo.solaria.agency/api/agents/11/mcp-configs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "playwright",
    "server_url": "http://localhost:3033/mcp",
    "auth_type": "none",
    "transport_type": "http",
    "config_options": {
      "headless": true,
      "slowMo": 100
    }
  }'
```

### 3. Integrar CodeRabbit para Code Review

```bash
curl -X POST "https://dfo.solaria.agency/api/agents/11/mcp-configs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "coderabbit",
    "server_url": "https://api.coderabbit.ai/mcp",
    "auth_type": "api-key",
    "auth_credentials": {
      "apiKey": "YOUR_CODERABBIT_KEY"
    },
    "transport_type": "http"
  }'
```

---

## Troubleshooting

### Error: "Validation failed"

**Causa:** Campos requeridos faltantes o formato inválido.

**Solución:** Verificar el schema Zod y asegurar:
- `server_name`: No vacío, max 255 caracteres
- `server_url`: URL válida (http:// o https://)
- `auth_type`: Uno de: none, bearer, basic, api-key

### Error: "Connection timeout"

**Causa:** El servidor MCP no responde.

**Solución:**
1. Verificar que el servidor esté corriendo
2. Verificar firewall/network connectivity
3. Aumentar timeout en `config_options`:
   ```json
   {
     "config_options": {
       "timeout": 60000
     }
   }
   ```

### Error: "Authentication failed"

**Causa:** Credenciales incorrectas o tipo de auth incorrecto.

**Solución:**
1. Verificar que `auth_type` coincida con el servidor
2. Verificar formato de `auth_credentials`:
   - `bearer`: `{"token": "..."}`
   - `basic`: `{"username": "...", "password": "..."}`
   - `api-key`: `{"apiKey": "..."}`

---

## Mejoras Futuras

### Prioridad Alta (Epic 2 Sprint 2.2)
- [ ] DFO-2008: Conectar execution engine con MCP client
- [ ] Inyectar external tools en contexto del agente
- [ ] Tool discovery automático en background

### Prioridad Media (Epic 3)
- [ ] Caché de tools disponibles (Redis, TTL 5 min)
- [ ] Retry logic con exponential backoff
- [ ] Connection pooling
- [ ] Health checks periódicos

### Prioridad Baja
- [ ] UI para tool discovery visual
- [ ] Logs de llamadas a tools externos
- [ ] Métricas de latencia por servidor MCP

---

## Referencias

- [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/)
- [DFO 4.0 Implementation Plan](/Users/carlosjperez/.claude/plans/declarative-herding-melody.md)
- [AgentConfigEditor Component](../dashboard/app/src/components/agents/AgentConfigEditor.tsx)
- [Server API Implementation](../dashboard/server.ts#L3331-3595)

---

**Documentación generada:** 2026-01-01
**Autor:** ECO-Lambda (Claude Code Agent #11)
**Epic:** DFO-195 - Dual MCP Mode
**Sprint:** 2.2 Agent Integration
