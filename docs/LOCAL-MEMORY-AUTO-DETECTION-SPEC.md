# Sistema de Auto-Detección e Instalación de Memoria Local

**Version:** 1.0.0
**Fecha:** 2026-01-06
**Autor:** ECO-Lambda | SOLARIA DFO
**Task:** MEM-005

---

## 📋 Resumen Ejecutivo

Sistema que detecta automáticamente si un agente tiene instalado el sistema de memoria local (claude-mem) y le brinda instrucciones paso a paso para activarlo.

**Objetivo:** Que cualquier agente conectado al DFO pueda tener memoria local sin configuración manual.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  AGENTE NUEVO (Conexión inicial)                   │
│  Sin memoria local instalada                         │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  1. DFO MCP Server detecta agente conectado          │
│     → Ejecuta check_local_memory() (non-blocking)       │
│     → Lee script /scripts/check-local-memory.sh          │
│     → Detecta: OS, Node, Claude Code, claude-mem     │
│     → Retorna: { installed, version, os }               │
│  2. Marca estado en tabla agent_local_memory_status     │
│     → agent_id, has_local_memory, installed_at,           │
│       last_checked                                       │
└──────────────────┬──────────────────────────────────────┘
                   ↓
           ¿INSTALADO?
              ↙            ↘
        [NO]             [SÍ]
          ↓                   ↓
[ADJUNTA GUÍA]   [CONTINÚA]
          ↓                   ↓
[RESPONSE MCP]   [SIGUIENTE REQUEST]
con banner         con acceso a
de instalación     herramientas de memoria
          ↓                   ↓
┌─────────────────┐     ┌─────────────────┐
│  Agente ve     │     │  Agente usa     │
│  instrucciones  │     │  memory tools    │
│  e instala     │     │  normalmente     │
└─────────────────┘     └─────────────────┘
```

---

## 🗄️ Tabla de Base de Datos

### `agent_local_memory_status`

```sql
CREATE TABLE agent_local_memory_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agent_id VARCHAR(255) NOT NULL,
  has_local_memory BOOLEAN NOT NULL DEFAULT false,
  installed_version VARCHAR(20),
  installed_at TIMESTAMP NULL,
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  os_type VARCHAR(50),
  node_version VARCHAR(20),
  claude_code_version VARCHAR(20),
  installation_method VARCHAR(50),
  UNIQUE KEY unique_agent (agent_id)
);
```

**Índices:**
- `idx_agent_id` en `agent_id` para búsquedas rápidas

---

## 🔍 Estrategia de Detección

### Script: `scripts/check-local-memory.sh`

**Detecciones en cascada (orden de prioridad):**

| Paso | Detección | Método | Tiempo |
|------|-----------|---------|---------|
| 1 | claude-mem instalado | `test -d ~/.claude-mem/` | <5ms |
| 2 | Database existe | `test -f ~/.claude-mem/claude-mem.db` | <5ms |
| 3 | Worker corriendo | `curl -s http://localhost:37777/health` | <100ms |
| 4 | Plugin instalado | `test -d ~/.claude/plugins/marketplaces/thedotmack/claude-mem` | <5ms |
| 5 | Node disponible | `which node || command -v node` | <10ms |
| 6 | npm disponible | `which npm || command -v npm` | <10ms |

**Lógica de resultado:**

```bash
if [ -d ~/.claude-mem/ ] && [ -f ~/.claude-mem/claude-mem.db ]; then
    INSTALLED=true
    # Detectar versión del package.json si existe
    VERSION=$(cat ~/.claude-mem/package.json 2>/dev/null | grep '"version"' || echo "unknown")
else
    INSTALLED=false
fi

# Detectar OS
OS=$(uname -s)

# Detectar Node version
NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")

# Detectar Claude Code
if command -v code &>/dev/null; then
    CLAUDE_VERSION=$(code -v 2>/dev/null || echo "unknown")
else
    CLAUDE_VERSION="not installed"
fi

# Output JSON para DFO
echo "{\"installed\":$INSTALLED,\"version\":\"$VERSION\",\"os\":\"$OS\",\"node\":\"$NODE_VERSION\",\"claude\":\"$CLAUDE_VERSION\"}"
```

**Tiempo total de ejecución:** <200ms (detection síncrona, no blocking)

---

## 🛠️ MCP Tool: `check_local_memory`

**Endpoint:** POST `/api/check-local-memory`

**Request:**
```typescript
{
  // No parameters required - usa agent_id del request actual
}
```

**Response:**
```typescript
// Si NO instalado
{
  success: true,
  has_local_memory: false,
  message: "📋 No detectado sistema de memoria local",
  installation_guide: "..."  // Contenido de LOCAL-MEMORY-INSTALL-GUIDE.md
}

// Si SÍ instalado
{
  success: true,
  has_local_memory: true,
  installed_version: "8.5.0",
  os: "Darwin",
  node_version: "v18.19.0",
  claude_code_version: "1.20.0",
  message: "✅ Sistema de memoria local detectado",
  status: {
    database_exists: true,
    worker_running: true,
    plugin_installed: true,
    last_check: "2026-01-06T14:30:00Z"
  }
}
```

**Cache en memoria (30s):**
```typescript
const checkCache = new Map<string, any>();
const CACHE_TTL = 30000; // 30 segundos

function getCachedCheck(agentId: string) {
  const cached = checkCache.get(agentId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  return null;
}
```

---

## 📚️ Guía de Instalación

**Archivo:** `docs/LOCAL-MEMORY-INSTALL-GUIDE.md`

**Estructura:**

```markdown
# 🧠 Instalación de Memoria Local - Guía Paso a Paso

## ¿Qué es esto?

Sistema de memoria persistente que permite a Claude Code recordar contexto entre sesiones.

## Paso 1: Instalar claude-mem

### Opción A: Vía Claude Code (Recomendado)

1. Abre Claude Code
2. Ejecuta: `/plugin marketplace add thedotmack/claude-mem`
3. Espera a que se descargue (3-5s)
4. Ejecuta: `/plugin install claude-mem`
5. Reinicia Claude Code

### Opción B: Vía npm (Alternativo)

```bash
npm install -g @thedotmack/claude-mem
claude-mem setup
```

### Opción C: Vía curl (Para entornos sin Claude Code)

```bash
# Descargar e instalar
curl -fsSL https://raw.githubusercontent.com/thedotmack/claude-mem/main/install.sh | bash
```

## Paso 2: Verificar Instalación

### Verificar Worker Service

```bash
# El worker debe estar corriendo en puerto 37777
curl http://localhost:37777/health

# Expected response:
# {"status":"ok","version":"8.5.0"}
```

### Verificar Base de Datos

```bash
# Verificar que existe la DB
ls -la ~/.claude-mem/claude-mem.db

# Verificar tamaño esperado (~1-10MB inicial)
du -sh ~/.claude-mem/claude-mem.db
```

### Probar Búsqueda de Memoria

En tu próxima sesión con Claude Code, simplemente pregunta:

```
Busca información sobre el proyecto [NOMBRE DEL PROYECTO]
```

Claude Code invocará automáticamente los tools de búsqueda de memoria.

## Paso 3: Configurar Hooks (Opcional)

claude-mem configura hooks automáticamente en primera ejecución. Puedes verificar:

```bash
# Ver configuración
cat ~/.claude-mem/settings.json
```

## Paso 4: Probar Memoria en Sesión Real

1. Inicia nueva sesión con Claude Code
2. Ejecuta: `git log --oneline -5` (o cualquier comando)
3. Pregunta: "¿Qué commits hemos hecho últimamente?"

Claude buscará automáticamente en la memoria local y responderá.

## Troubleshooting

### El worker no inicia

```bash
# Verificar puertos en uso
lsof -i :37777

# Si está ocupado, matar proceso
kill -9 $(lsof -t :37777 | tail -1 | awk '{print $2}')
```

### Claude Code no detecta plugins

```bash
# Verificar instalación de plugins
ls -la ~/.claude/plugins/marketplaces/

# Reinstalar
/plugin remove claude-mem
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

## ¿Por qué necesito esto?

- **Persistencia:** Claude recuerda decisiones de sesiones anteriores
- **Búsqueda Semántica:** Encuentra información relevante sin repetir trabajo
- **Trabajo Offline:** Funciona sin conexión al DFO
- **Token Efficiency:** Reduce llamadas a tools en ~70%
```

---

## 🔄 Inyección en Respuestas MCP

### Estrategia: ResponseBuilder Interceptor

**Archivo:** `mcp-server/src/utils/response-builder.ts`

**Modificación:**

```typescript
export class ResponseBuilder {
  // ... código existente ...

  /**
   * Detecta si el agente necesita guía de memoria local
   * e inyecta instrucciones en la respuesta
   */
  static async withLocalMemoryGuide(
    agentId: string,
    baseResponse: any,
    db: DatabaseConnection
  ): Promise<any> {
    // Verificar si el agente fue checkeado en últimos 5 minutos
    const [check] = await db.execute(`
      SELECT * FROM agent_local_memory_status
      WHERE agent_id = ?
        AND last_checked > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY last_checked DESC LIMIT 1
    `, [agentId]);

    if (!check) {
      // Primer check - ejecutar detección
      return this.withLocalMemoryCheck(agentId, baseResponse, db);
    }

    // Si ya fue checkeado y NO tiene memoria
    if (!check.has_local_memory && check.installed_at) {
      return this.withInstallationGuide(baseResponse);
    }

    // Si tiene memoria instalada, no modificar
    return baseResponse;
  }

  /**
   * Ejecuta check de memoria local de forma síncrona
   */
  static async withLocalMemoryCheck(
    agentId: string,
    baseResponse: any,
    db: DatabaseConnection
  ): Promise<any> {
    try {
      // Ejecutar script en background (non-blocking)
      const { spawn } = await import('child_process');
      const check = spawn('bash', [
        '/path/to/check-local-memory.sh',
        '--agent-id',
        agentId
      ], {
        stdio: 'pipe',
        timeout: 5000 // 5s máximo
      });

      let output = '';
      check.stdout.on('data', (data) => { output += data; });

      const result = await new Promise((resolve) => {
        check.on('close', (code) => {
          const checkResult = JSON.parse(output);
          resolve(checkResult);
        });
      });

      // Guardar en DB
      await db.execute(`
        INSERT INTO agent_local_memory_status
          (agent_id, has_local_memory, installed_version, os_type, node_version, claude_code_version, installation_method)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          has_local_memory = ?,
          installed_version = ?,
          os_type = ?,
          node_version = ?,
          claude_code_version = ?,
          last_checked = NOW()
      `, [
        agentId,
        result.installed,
        result.version || null,
        result.os,
        result.node,
        result.claude,
        result.installed ? 'mcp-check' : null
      ]);

      // Si NO instalado, adjuntar guía
      if (!result.installed) {
        return this.withInstallationGuide(baseResponse);
      }

      return baseResponse;
    } catch (error) {
      console.error('[local-memory-check] Error:', error);
      return baseResponse; // No bloquear respuesta si falla
    }
  }

  /**
   * Adjunta guía de instalación como text block
   */
  static withInstallationGuide(baseResponse: any): any {
    const installationGuide = fs.readFileSync(
      './docs/LOCAL-MEMORY-INSTALL-GUIDE.md',
      'utf-8'
    );

    return {
      ...baseResponse,
      content: `
${installationGuide}

---
[Respuesta original del DFO]
${baseResponse.content || baseResponse.data}
      `
    };
  }
}
```

**Middleware en endpoints:**

```typescript
// Aplicar a TODOS los endpoints relevantes
app.use(async (req, res, next) => {
  const agentId = req.headers['x-agent-id'] || 'unknown';

  const originalJson = res.json;
  res.json = async (data) => {
    // Aplicar guía si es necesario
    const enhanced = await ResponseBuilder.withLocalMemoryGuide(agentId, data, db);
    return originalJson.call(res, enhanced);
  };

  next();
});
```

---

## 📊 Métricas de Implementación

| Componente | Archivo | Líneas Estimadas | Tiempo |
|-------------|----------|-------------------|---------|
| Script bash | `scripts/check-local-memory.sh` | ~120 | 1h |
| MCP Tool | `mcp-server/src/endpoints/local-memory-check.ts` | ~200 | 1.5h |
| Guía MD | `docs/LOCAL-MEMORY-INSTALL-GUIDE.md` | ~250 | 0.5h |
| DB Migration | `infrastructure/database/migrations/015_local_memory_status.sql` | ~30 | 0.5h |
| ResponseBuilder | `mcp-server/src/utils/response-builder.ts` (modif) | ~100 | 1h |
| **TOTAL** | | **~900 líneas / 4.5h** |

---

## 🎯 Criterios de Éxito

- [ ] Script bash ejecuta detección en <200ms
- [ ] MCP tool retorna JSON válido en todos los casos
- [ ] Guía de instalación es clara y ejecutable
- [ ] ResponseBuilder no bloquea responses principales
- [ ] Tabla DB creada con índice en agent_id
- [ ] Sistema funciona sin conexión a claude-mem (mocking)
- [ ] Testing con agentes reales

---

## 🚨 Limitaciones y Consideraciones

1. **Non-Blocking:** El check debe ser síncrono y rápido (<200ms)
2. **Cache:** Resultados cacheados por 30s para evitar overhead
3. **Privacy:** No enviar datos del agente a servicios externos
4. **Fallback:** Si el check falla, el DFO debe continuar funcionando
5. **Respecto:** El sistema NO debe forzar instalación, solo sugerir

---

**© 2026 SOLARIA AGENCY | Digital Field Operations**
