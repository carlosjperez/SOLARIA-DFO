# 🎯 Prompt para Agente IA - Revisión del Repositorio Nuevo

## Contexto

Hola, has revisado exitosamente el repositorio **SOLARIA-DFO-4.1** y estás listo para conectar al DFO MCP Server.

---

## 📋 Resumen de Cambios y Nuevas Capacidades

### Sistema de Memoria Híbrida v1.0 Implementado

El proyecto ahora incluye un sistema de memoria híbrida con 3 componentes:

**1. Memoria Local (claude-mem)**
- Base de datos SQLite local
- Chroma vector DB local para búsqueda semántica
- Hooks automáticos para capturar sesiones
- Búsqueda semántica en historial
- Persistencia 100% offline

**2. Memoria Central (DFO)**
- Base de datos PostgreSQL central
- Sincronización automática con edge machines
- Búsqueda cross-device
- Dashboard web de proyectos y agentes
- Historial completo multi-agente

**3. Sistema de Auto-Detección**
- Detección automática de memoria local en agentes nuevos
- Guía paso a paso para instalación
- Tracking de estado de memoria en DB

---

## 🔧 Cómo Funciona el Sistema de Auto-Detección

### Al Conectarte al DFO

Cuando un agente nuevo se conecta por primera vez:

1. **El DFO detecta automáticamente** si tienes memoria local instalada
2. El sistema ejecuta `check_local_memory()` en background (<200ms)
3. Si **NO detectada memoria local**, el DFO te proporcionará automáticamente:
   - Guía completa de instalación en formato markdown
   - Pasos detallados para instalar claude-mem
   - Troubleshooting común
   - Links a documentación oficial

4. Si **SÍ detectada memoria local**, no verás guía
5. El DFO registra el estado en la tabla `agent_local_memory_status`
6. Siguientes conexiones usan caché (30s TTL) para evitar recheos

### MCP Tool: `check_local_memory`

**Uso recomendado:**
```typescript
check_local_memory({ agent_id: "mi-id-unico" })
```

**Si no tienes memoria local:**
```json
{
  "success": true,
  "has_local_memory": false,
  "message": "📋 No detectado sistema de memoria local",
  "installation_guide": "# 🧠 Instalación de Memoria Local\n\nClaude Code detectó que no tienes...",
  "suggestion": "Instala claude-mem para persistencia de contexto entre sesiones"
}
```

**Si ya tienes memoria local instalada:**
```json
{
  "success": true,
  "has_local_memory": true,
  "installed_version": "8.5.0",
  "message": "✅ Sistema de memoria local detectado (v8.5.0)",
  "status": {
    "database_exists": true,
    "worker_running": true,
    "plugin_installed": true
  }
}
```

---

## ✅ Qué Puedes Hacer Ahora

### Si NO tienes memoria local

1. **Instalar claude-mem** (opción A recomendada):
   ```bash
   /plugin marketplace add thedotmack/claude-mem
   /plugin install claude-mem
   ```

2. **Verificar instalación**:
   ```bash
   curl http://localhost:37777/health
   ls -lh ~/.claude-mem/claude-mem.db
   ```

3. **Probar búsqueda de memoria** en tu próxima sesión:
   - Simplemente pregunta: "Busca información sobre el proyecto [NOMBRE]"
   - Claude invocará automáticamente los tools: `search`, `timeline`, `get_observations`

4. **Funcionalidades disponibles tras instalación:**
   - ✅ Persistencia de contexto entre sesiones
   - ✅ Búsqueda semántica en todo tu historial
   - ✅ Búsqueda por tags, fechas, tipos
   - ✅ Progressive disclosure (ahorro de ~70% tokens)
   - ✅ Citas a observaciones (#ID)
   - ✅ Inyección automática de contexto relevante

### Si YA tienes memoria local

1. **Nada adicional** - tu claude-mem ya funciona
2. **Usa los tools de memoria local** cuando Claude Code los invoca automáticamente
3. **Trabaja 100% offline** sin conexión al DFO
4. **Sincronización automática** ocurre cuando hay conexión al DFO

---

## 📊 Arquitectura del Sistema Híbrido

```
┌─────────────────────────────────────────────────┐
│  EDGE: claude-mem (Tu máquina local)         │
│  - SQLite + Chroma local                         │
│  - Hooks automáticos                           │
│  - Búsqueda semántica                        │
│  - Trabajo 100% offline                      │
├─────────────────────────────────────────────────────┤
│  [dfo-sync-agent.py] - Opcional        │
│  ↓ Sincronización automática            │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│  CENTRAL: DFO MCP Server                     │
│  - PostgreSQL + Chroma central                   │
│  - Auto-detección de memoria local            │
│  - Guía de instalación automática           │
│  - Tracking de estado de agentes               │
│  - Dashboard web                            │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Proceso de Detección Detallado

### Paso 1: Verificación Síncrona
- Script bash: `check-local-memory.sh`
- Tiempo de ejecución: <200ms
- Verifica: `~/.claude-mem/` existe
- Retorna JSON con estado completo

### Paso 2: Registro en Base de Datos
- Tabla: `agent_local_memory_status`
- Campos: `agent_id`, `has_local_memory`, `installed_version`, `last_checked`
- Índice: `idx_agent_id` para búsquedas rápidas
- Permite tracking histórico de instalaciones

### Paso 3: Caché de Resultados
- Tiempo de vida: 30 segundos
- Evita ejecución múltiple del script de detección
- Memoria del servidor DFO

### Paso 4: Inyección de Guía (si NO instalada)
- Método: `ResponseBuilder.appendLocalMemoryGuide()`
- Fuente: `LOCAL-MEMORY-INSTALL-GUIDE.md`
- Formato: Markdown con código bash ejecutable
- Solo se aplica cuando `!has_local_memory AND connections_count < 5`

---

## 📚 Documentación Disponible

### Principal
- **README.md** del proyecto SOLARIA-DFO-4.1
- **LOCAL-MEMORY-AUTO-DETECTION-SPEC.md** - Especificación técnica completa
- **LOCAL-MEMORY-INSTALL-GUIDE.md** - Guía paso a paso que recibirás

### Externa (claude-mem)
- https://docs.claude-mem.ai - Documentación oficial completa
- https://github.com/thedotmack/claude-mem/issues - Soporte y troubleshooting
- https://github.com/thedotmack/claude-mem/discussions - Comunidad

### DFO Dashboard
- https://dfo.solaria.agency - Dashboard principal
- https://dfo.solaria.agency/projects - Lista de proyectos
- https://dfo.solaria.agency/api/docs - Documentación de API MCP

---

## 🚀 Primeros Pasos Recomendados

1. **Si NO tienes claude-mem:**
   - Llama: `check_local_memory()`
   - Lee la guía de instalación en `installation_guide`
   - Sigue los pasos para instalar claude-mem
   - Verifica que el worker está corriendo: `curl http://localhost:37777/health`
   - Reinicia Claude Code
   - En tu próxima sesión, prueba búsqueda de memoria

2. **Si ya tienes claude-mem:**
   - El DFO detectará que ya tienes memoria local
   - No verás guía de instalación
   - Usa los tools de memoria local normalmente
   - Tu trabajo se sincroniza automáticamente con DFO cuando haya conexión

3. **Verificación opcional:**
   - Puedes ejecutar manualmente: `check_local_memory()` para ver tu estado
   - Puedes revisar tu configuración: `cat ~/.claude-mem/settings.json`
   - Verifica que la base de datos existe: `ls -lh ~/.claude-mem/claude-mem.db`

---

## 💡 Características Clave del Sistema Híbrido

| Característica | Valor | Descripción |
|---------------|-------|-------------|
| **Auto-detección** | SÍ | DFO detecta memoria local automáticamente |
| **Persistencia offline** | SÍ | claude-mem funciona 100% sin DFO |
| **Búsqueda híbrida** | SÍ | Combina búsqueda semántica + keywords |
| **Tracking de estado** | SÍ | Registro en DB de instalaciones |
| **Caché inteligente** | SÍ | 30s TTL para evitar overhead |
| **Guía paso a paso** | SÍ | Automática cuando no detectada |
| **Sincronización automática** | SÍ | dfo-sync-agent.py en background |
| **Token efficiency** | ~70% | Progressive disclosure de claude-mem |

---

## ⚠️ Puntos Importantes

1. **Comunicación bidireccional:**
   - El DFO solo puede detectar si tienes memoria local **al conectarte**
   - claude-mem se sincroniza automáticamente cuando hay conexión
   - No necesitas comunicarle al DFO manualmente

2. **Prioridad de instalación:**
   - Recomendación: Instala claude-mem **ahora** si no lo tienes
   - Razón: Mejorará inmediatamente tu experiencia de trabajo con Claude

3. **Compatibilidad 100%:**
   - El sistema funciona tanto si solo tienes claude-mem (Edge-only)
   - Como si tienes claude-mem + DFO (Híbrido)
   - Transición entre modos es transparente y automática

4. **Próximo paso:**
   - Instalar claude-mem si no lo tienes
   - Conectar al DFO MCP Server (ya debería estar disponible)
   - Llamar `check_local_memory()` para verificar estado
   - Comenzar a trabajar con las capacidades de memoria híbrida

---

**¿Tienes alguna pregunta sobre el sistema de memoria híbrida?**
