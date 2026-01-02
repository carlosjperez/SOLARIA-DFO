# MCP Proxy Tools - External Server Integration

**DFO-196 | Epic 20 Sprint 2.2** | Dual MCP Mode: Agent Integration
**Autor:** ECO-Omega | DFO 4.0
**Fecha:** 2026-01-01
**Versión:** 1.0.0

---

## Resumen

SOLARIA DFO ahora opera en **Dual MCP Mode**: actúa como servidor MCP (existente) Y como cliente MCP (nuevo) para conectarse a servidores externos especializados.

### Capacidades

| Característica | Descripción |
|----------------|-------------|
| **Proxy Tools** | 2 herramientas MCP para ejecutar tools en servidores externos |
| **External Servers** | Context7 (docs), Playwright (browser), CodeRabbit (reviews) |
| **Discovery** | Auto-descubrimiento de tools disponibles en servers conectados |
| **Error Handling** | Validación robusta, mensajes descriptivos, sugerencias |
| **Dual Format** | JSON estructurado + output legible para humanos |
| **Performance** | Execution time tracking automático |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                   SOLARIA DFO 4.0 (Dual MCP Mode)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              MCP Server Mode (Existente)               │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │   70+ DFO Tools (tasks, memory, projects)    │      │    │
│  │  └────────────────────┬─────────────────────────┘      │    │
│  │                       │                                 │    │
│  │                       ▼                                 │    │
│  │         Agentes IA (Claude, GPT-4, etc.)               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              MCP Client Mode (NUEVO)                   │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │         MCP Proxy Tools                      │      │    │
│  │  │  • proxy_external_tool                       │      │    │
│  │  │  • list_external_tools                       │      │    │
│  │  └────────────────────┬─────────────────────────┘      │    │
│  │                       │                                 │    │
│  │                       ▼                                 │    │
│  │         ┌─────────────────────────┐                     │    │
│  │         │  MCPClientManager       │                     │    │
│  │         │  Connection Pool        │                     │    │
│  │         └────────────┬────────────┘                     │    │
│  │                      │                                  │    │
│  └──────────────────────┼──────────────────────────────────┘    │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │                     │                            │
│              ▼                     ▼                            │
│  ┌────────────────────┐ ┌────────────────────┐                 │
│  │   Context7 MCP     │ │  Playwright MCP    │                 │
│  │   Documentation    │ │  Browser Automation│                 │
│  └────────────────────┘ └────────────────────┘                 │
│              ▼                     ▼                            │
│  ┌────────────────────┐ ┌────────────────────┐                 │
│  │  CodeRabbit MCP    │ │   Future Servers   │                 │
│  │  Code Reviews      │ │   (Extensible)     │                 │
│  └────────────────────┘ └────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuración de Servidores Externos

### Paso 1: Configurar Agent MCP Config

Los agentes necesitan configurar qué servidores MCP externos usar.

**Tabla en DB:** `agent_mcp_configs`

```sql
CREATE TABLE agent_mcp_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  server_name VARCHAR(100) NOT NULL,
  server_url VARCHAR(500) NOT NULL,
  auth_type ENUM('none', 'bearer', 'api_key') DEFAULT 'none',
  auth_credentials TEXT DEFAULT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_agent_server (agent_id, server_name),
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
```

### Paso 2: Registrar Servidor Externo

**Ejemplo: Configurar Context7 para Agent ID 11**

```sql
INSERT INTO agent_mcp_configs
  (agent_id, server_name, server_url, auth_type, auth_credentials, enabled)
VALUES
  (11, 'context7', 'https://context7.io/mcp', 'bearer', 'your-api-key-here', TRUE);
```

### Paso 3: Verificar Conexión

```javascript
// Listar tools disponibles en Context7
list_external_tools({ server_name: "context7" })
```

---

## Herramientas MCP Disponibles

### 1. proxy_external_tool

Ejecuta una herramienta en un servidor MCP externo.

**Parámetros:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `server_name` | string | Sí | Nombre del servidor externo ("context7", "playwright", "coderabbit") |
| `tool_name` | string | Sí | Nombre del tool a ejecutar en el servidor externo |
| `params` | object | No | Parámetros para pasar al tool externo (default: {}) |
| `format` | enum | No | Formato de output: "json" o "human" (default: "json") |

**Ejemplo: Buscar documentación de React en Context7**

```javascript
proxy_external_tool({
  server_name: "context7",
  tool_name: "query-docs",
  params: {
    libraryId: "/vercel/next.js",
    query: "How to implement server-side rendering in Next.js 14?"
  },
  format: "human"
})
```

**Response (format: "human"):**

```
✅ External Tool Executed Successfully

Server: context7
Tool: query-docs
Execution Time: 1245ms

Result:
{
  "docs": [
    {
      "title": "Server Components in Next.js 14",
      "url": "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
      "snippet": "Server Components allow you to render components on the server..."
    }
  ],
  "usage": {
    "tokens": 342
  }
}
```

**Response (format: "json"):**

```json
{
  "success": true,
  "data": {
    "server_name": "context7",
    "tool_name": "query-docs",
    "executed": true,
    "result": {
      "docs": [...],
      "usage": {...}
    },
    "execution_time_ms": 1245
  },
  "metadata": {
    "timestamp": "2026-01-01T10:30:00Z",
    "version": "4.0.0"
  }
}
```

### 2. list_external_tools

Descubre herramientas disponibles en servidores MCP externos conectados.

**Parámetros:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `server_name` | string | No | Filtrar por servidor específico. Si se omite, lista todos |
| `format` | enum | No | Formato de output: "json" o "human" (default: "json") |

**Ejemplo 1: Listar todos los servidores y tools**

```javascript
list_external_tools({ format: "human" })
```

**Response:**

```
🔌 External MCP Servers and Tools
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Servers: 3
Total Tools: 18

📡 Server: context7
   Status: ✓ Connected
   Tools: 2

   • resolve-library-id
     Resolves a package/product name to a Context7-compatible library ID

   • query-docs
     Retrieves up-to-date documentation and code examples

📡 Server: playwright
   Status: ✓ Connected
   Tools: 12

   • browser_navigate
     Navigate to a URL

   • browser_click
     Perform click on a web page

   • browser_screenshot
     Take a screenshot of the current page

   [... más tools ...]

📡 Server: coderabbit
   Status: ✓ Connected
   Tools: 4

   • get_coderabbit_reviews
     Get all CodeRabbit reviews for a specific GitHub PR

   • get_review_details
     Get detailed information about a specific review

   • get_review_comments
     Get all individual line comments from reviews

   • resolve_comment
     Mark a CodeRabbit comment as resolved
```

**Ejemplo 2: Listar tools de un servidor específico**

```javascript
list_external_tools({
  server_name: "playwright",
  format: "json"
})
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_servers": 1,
    "total_tools": 12,
    "servers": [
      {
        "name": "playwright",
        "connected": true,
        "tools_count": 12,
        "tools": [
          {
            "name": "browser_navigate",
            "description": "Navigate to a URL"
          },
          {
            "name": "browser_click",
            "description": "Perform click on a web page"
          }
        ]
      }
    ]
  },
  "metadata": {
    "timestamp": "2026-01-01T10:30:00Z",
    "version": "4.0.0"
  }
}
```

---

## Servidores MCP Soportados

### Context7 - Documentación Actualizada

**URL:** `https://context7.io/mcp`
**Descripción:** Búsqueda semántica de documentación de librerías

**Tools Disponibles:**
- `resolve-library-id` - Buscar library ID por nombre
- `query-docs` - Búsqueda en documentación

**Caso de Uso:**
Cuando un agente necesita información actualizada sobre APIs o frameworks durante el desarrollo.

**Ejemplo:**
```javascript
// 1. Resolver library ID
proxy_external_tool({
  server_name: "context7",
  tool_name: "resolve-library-id",
  params: {
    libraryName: "React",
    query: "How to use hooks in React 19"
  }
})

// 2. Buscar en documentación
proxy_external_tool({
  server_name: "context7",
  tool_name: "query-docs",
  params: {
    libraryId: "/facebook/react",
    query: "useEffect cleanup function best practices"
  }
})
```

### Playwright - Automatización de Browser

**URL:** Configurado localmente vía MCP
**Descripción:** Control programático de navegadores web

**Tools Principales:**
- `browser_navigate` - Navegar a URL
- `browser_click` - Click en elementos
- `browser_screenshot` - Captura de pantalla
- `browser_type` - Escribir texto
- `browser_evaluate` - Ejecutar JavaScript

**Caso de Uso:**
Testing E2E, scraping de datos, verificación de UI/UX.

**Ejemplo:**
```javascript
// Navegar y tomar screenshot
proxy_external_tool({
  server_name: "playwright",
  tool_name: "browser_navigate",
  params: { url: "https://dfo.solaria.agency" }
})

proxy_external_tool({
  server_name: "playwright",
  tool_name: "browser_screenshot",
  params: { fullPage: true }
})
```

### CodeRabbit - Code Reviews Automáticos

**URL:** `https://api.coderabbit.ai/mcp`
**Descripción:** Análisis automático de código y reviews

**Tools Disponibles:**
- `get_coderabbit_reviews` - Reviews de un PR
- `get_review_details` - Detalle de review
- `get_review_comments` - Comentarios línea por línea
- `resolve_comment` - Marcar comentario como resuelto

**Caso de Uso:**
Code review automático en PRs de GitHub.

**Ejemplo:**
```javascript
proxy_external_tool({
  server_name: "coderabbit",
  tool_name: "get_coderabbit_reviews",
  params: {
    owner: "solaria-agency",
    repo: "SOLARIA-DFO",
    pullNumber: 42
  }
})
```

---

## Manejo de Errores

### Error 1: Servidor No Conectado

**Síntoma:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "MCP server 'context7' not found",
    "details": {
      "resource_type": "MCP server",
      "identifier": "context7"
    },
    "suggestion": "Ensure the MCP server is configured in the agent MCP config and connected. Use list_external_tools to see available servers."
  }
}
```

**Solución:**
1. Verificar que el servidor está registrado en `agent_mcp_configs`
2. Verificar que `enabled = TRUE`
3. Revisar `server_url` y credenciales
4. Usar `list_external_tools()` para ver servidores disponibles

### Error 2: Tool No Encontrado

**Síntoma:**
```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_TOOL_EXECUTION_FAILED",
    "message": "Failed to execute tool 'invalid-tool' on server 'context7'",
    "details": {
      "server": "context7",
      "tool": "invalid-tool",
      "error": "Tool not found"
    },
    "suggestion": "Check tool name and parameters. Use list_external_tools to verify available tools."
  }
}
```

**Solución:**
1. Listar tools disponibles: `list_external_tools({ server_name: "context7" })`
2. Verificar nombre exacto del tool
3. Revisar documentación del servidor externo

### Error 3: Parámetros Inválidos

**Síntoma:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid parameters for external tool",
    "details": {
      "field": "params.libraryId",
      "expected": "string",
      "received": "undefined"
    },
    "suggestion": "Review the tool's input schema and provide all required parameters"
  }
}
```

**Solución:**
1. Revisar schema del tool en documentación externa
2. Verificar que todos los parámetros requeridos están presentes
3. Validar tipos de datos

---

## Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────────────┐
│                      Agent Call Flow                            │
└─────────────────────────────────────────────────────────────────┘

1. Agente IA llama proxy_external_tool
   ↓
2. Validación Zod
   ├─ ❌ Error → Return validation error
   └─ ✅ Pass → Continue
   ↓
3. MCPClientManager.isConnected(server_name)
   ├─ ❌ Not connected → Return NOT_FOUND error
   └─ ✅ Connected → Continue
   ↓
4. MCPClientManager.executeTool(server, tool, params)
   ├─ ❌ Execution failed → Return EXECUTION_FAILED error
   └─ ✅ Success → Continue
   ↓
5. Calculate execution_time_ms
   ↓
6. Build response data
   ├─ JSON format (structured)
   └─ Human format (readable with emojis)
   ↓
7. Return success response
```

---

## Testing

### Unit Tests

**Ubicación:** `/mcp-server/src/__tests__/mcp-proxy.test.ts`

```typescript
describe('MCP Proxy Tools', () => {
  describe('proxy_external_tool', () => {
    it('should execute tool on connected server', async () => {
      const result = await proxyExternalTool.execute({
        server_name: 'context7',
        tool_name: 'query-docs',
        params: { libraryId: '/react', query: 'hooks' },
        format: 'json'
      });

      expect(result.success).toBe(true);
      expect(result.data.executed).toBe(true);
      expect(result.data.execution_time_ms).toBeGreaterThan(0);
    });

    it('should return error for non-existent server', async () => {
      const result = await proxyExternalTool.execute({
        server_name: 'invalid-server',
        tool_name: 'test',
        params: {},
        format: 'json'
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('list_external_tools', () => {
    it('should list all connected servers', async () => {
      const result = await listExternalTools.execute({
        format: 'json'
      });

      expect(result.success).toBe(true);
      expect(result.data.total_servers).toBeGreaterThan(0);
    });

    it('should filter by server name', async () => {
      const result = await listExternalTools.execute({
        server_name: 'context7',
        format: 'json'
      });

      expect(result.data.servers.length).toBe(1);
      expect(result.data.servers[0].name).toBe('context7');
    });
  });
});
```

### Integration Tests

**Ubicación:** `/mcp-server/tests/integration/mcp-proxy-flow.test.ts`

```typescript
describe('MCP Proxy Integration Flow', () => {
  it('should discover and execute external tools', async () => {
    // 1. List available tools
    const toolsList = await listExternalTools.execute({
      server_name: 'context7'
    });

    expect(toolsList.data.servers[0].tools_count).toBeGreaterThan(0);

    // 2. Execute discovered tool
    const execution = await proxyExternalTool.execute({
      server_name: 'context7',
      tool_name: toolsList.data.servers[0].tools[0].name,
      params: { test: true }
    });

    expect(execution.success).toBe(true);
  });
});
```

---

## Performance Metrics

### Execution Time Tracking

Todos los calls a `proxy_external_tool` incluyen `execution_time_ms` en el response:

```javascript
{
  "execution_time_ms": 1245  // Tiempo total incluyendo red y procesamiento
}
```

**Thresholds Esperados:**

| Servidor | Operación | Tiempo Esperado | Threshold Crítico |
|----------|-----------|-----------------|-------------------|
| Context7 | query-docs | < 2000ms | 5000ms |
| Playwright | navigate | < 1000ms | 3000ms |
| Playwright | screenshot | < 500ms | 2000ms |
| CodeRabbit | get_reviews | < 1500ms | 4000ms |

### Monitoring

Logs automáticos en `activity_logs`:

```sql
SELECT
  category,
  action,
  metadata->>'$.server_name' AS server,
  metadata->>'$.tool_name' AS tool,
  metadata->>'$.execution_time_ms' AS time_ms,
  created_at
FROM activity_logs
WHERE category = 'mcp_proxy'
ORDER BY created_at DESC
LIMIT 100;
```

---

## Troubleshooting

### Servidor no responde

**Síntomas:**
- Timeout en proxy_external_tool
- Execution time > 10 segundos

**Soluciones:**
1. Verificar conectividad de red al servidor externo
2. Revisar health del servidor: `curl https://context7.io/mcp/health`
3. Verificar rate limits del servidor
4. Reiniciar MCPClientManager connection pool

### Authentication failures

**Síntomas:**
- Error 401 Unauthorized
- "Invalid API key" en response

**Soluciones:**
1. Verificar `auth_credentials` en `agent_mcp_configs`
2. Regenerar API key en el servidor externo
3. Verificar formato del token (Bearer vs API key)

### Tool schema mismatch

**Síntomas:**
- Parámetros rechazados por el servidor externo
- "Required parameter missing"

**Soluciones:**
1. Consultar documentación actualizada del servidor externo
2. Usar `list_external_tools` para ver schema esperado
3. Verificar versión del servidor externo (puede haber cambios)

---

## Extensibilidad

### Añadir Nuevo Servidor MCP

**Paso 1: Registrar en DB**

```sql
INSERT INTO agent_mcp_configs
  (agent_id, server_name, server_url, auth_type, auth_credentials, enabled)
VALUES
  (11, 'new-server', 'https://new-server.io/mcp', 'bearer', 'token-123', TRUE);
```

**Paso 2: Configurar Adapter (Opcional)**

Si el servidor requiere lógica especial, crear adapter:

```typescript
// /mcp-server/src/client/new-server-client.ts
export class NewServerClient {
  async connect(config: MCPClientConfig): Promise<void> {
    // Lógica de conexión específica
  }

  async executeTool(toolName: string, params: any): Promise<ToolCallResult> {
    // Transformación de parámetros si es necesaria
  }
}
```

**Paso 3: Registrar en MCPClientManager**

```typescript
// mcp-client-manager.ts
import { NewServerClient } from './new-server-client.js';

const adapters = {
  'context7': Context7Client,
  'playwright': PlaywrightClient,
  'coderabbit': CodeRabbitClient,
  'new-server': NewServerClient  // ← AÑADIR
};
```

**Paso 4: Verificar**

```javascript
list_external_tools({ server_name: "new-server" })
```

---

## Mejores Prácticas

### 1. Discovery Primero

Siempre usar `list_external_tools` antes de ejecutar por primera vez:

```javascript
// ✅ CORRECTO
const tools = await list_external_tools({ server_name: "context7" });
const toolName = tools.data.servers[0].tools[0].name;

await proxy_external_tool({
  server_name: "context7",
  tool_name: toolName,
  params: { ... }
});

// ❌ INCORRECTO (asumir nombres de tools)
await proxy_external_tool({
  server_name: "context7",
  tool_name: "search-docs",  // ← Nombre podría estar mal
  params: { ... }
});
```

### 2. Error Handling Robusto

```javascript
const result = await proxy_external_tool({
  server_name: "context7",
  tool_name: "query-docs",
  params: { libraryId: "/react", query: "hooks" }
});

if (!result.success) {
  console.error(`Error: ${result.error.code}`);
  console.error(`Suggestion: ${result.error.suggestion}`);

  // Fallback strategy
  if (result.error.code === 'NOT_FOUND') {
    // Server no disponible, usar cache local
  } else if (result.error.code === 'EXTERNAL_TOOL_EXECUTION_FAILED') {
    // Tool falló, reintentar o usar alternativa
  }
}
```

### 3. Monitoring de Performance

```javascript
const start = Date.now();

const result = await proxy_external_tool({
  server_name: "context7",
  tool_name: "query-docs",
  params: { ... }
});

const totalTime = Date.now() - start;

if (totalTime > 5000) {
  console.warn(`Slow external call: ${totalTime}ms`);
  // Activar alert o retry con otro servidor
}
```

### 4. Caching de Results

Para operaciones costosas o datos estáticos:

```javascript
// Implementar cache en Redis
const cacheKey = `mcp:${server_name}:${tool_name}:${JSON.stringify(params)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const result = await proxy_external_tool({ ... });

if (result.success) {
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 300); // TTL 5 min
}
```

---

## Próximos Pasos

### Fase Actual: Foundation Complete ✅
- ✅ MCP Proxy Tools implementados
- ✅ MCPClientManager con connection pooling
- ✅ Context7, Playwright, CodeRabbit adapters
- ✅ Error handling robusto
- ✅ Documentación completa

### Fase 2: UI Agent Configuration (DFO-195)
- [ ] Component React para configurar MCP servers
- [ ] Test connection button
- [ ] Tool discovery UI
- [ ] CRUD de agent_mcp_configs

### Fase 3: Agent Execution Integration (DFO-197)
- [ ] Modificar agentWorker.ts para usar MCP client
- [ ] Inyectar external tools en contexto del agente
- [ ] Auto-invoke proxy tools durante ejecución

### Fase 4: Advanced Features
- [ ] Circuit breaker para servers fallidos
- [ ] Health monitoring dashboard
- [ ] Auto-retry con exponential backoff
- [ ] Métricas de usage por servidor/tool

---

## Referencias

- [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/)
- [Context7 Documentation](https://context7.io/docs)
- [Playwright MCP Server](https://github.com/playwright/mcp-server)
- [CodeRabbit API](https://docs.coderabbit.ai/)

---

**Documento actualizado:** 2026-01-01
**Versión DFO:** 4.0.0
**Epic:** DFO-196 ✅ Completado
