# SOLARIA Digital Field Operations - Oficina de Construcción en Campo

**Versión:** 3.5.0
**Última actualización:** 2025-12-23

---

## Servidor de Producción

**SOLARIA DFO está desplegado de forma centralizada:**

| Recurso | URL |
|---------|-----|
| Dashboard (React) | https://dfo.solaria.agency |
| Dashboard (Legacy) | https://dfo.solaria.agency/legacy |
| API (Auth) | https://dfo.solaria.agency/api |
| API Publica | https://dfo.solaria.agency/api/public |
| MCP HTTP | https://dfo.solaria.agency/mcp |
| Health Check | https://dfo.solaria.agency/mcp/health |

**API Publica (Sin auth):**
- `GET /api/public/projects` - Lista proyectos
- `GET /api/public/businesses` - Lista negocios
- `GET /api/public/tasks` - Lista tareas
- `GET /api/public/dashboard` - Stats agregados

**Credenciales Dashboard:**
- Usuario: `carlosjperez`
- Password: `bypass`

**Servidor VPS:** 148.230.118.124 (Hostinger)

---

## Acceso SSH al Servidor

**Conexión directa:**
```bash
ssh -i ~/.ssh/id_ed25519 root@148.230.118.124
```

| Parámetro | Valor |
|-----------|-------|
| Host | 148.230.118.124 |
| Usuario | root |
| Clave SSH | `~/.ssh/id_ed25519` |
| Provider | Hostinger VPS |

**Claves SSH disponibles en ~/.ssh/:**
- `id_ed25519` ✓ (FUNCIONA para este servidor)
- `id_nemesis_server`
- `nemesis_cmdr_key`

---

## Certificados SSL (Let's Encrypt)

**Ubicación:** `/etc/letsencrypt/live/`

| Dominio | Ruta | Estado |
|---------|------|--------|
| dfo.solaria.agency | `/etc/letsencrypt/live/dfo.solaria.agency/` | ✓ Activo |
| office.solaria.agency | `/etc/letsencrypt/live/office.solaria.agency/` | ✓ Activo |
| prilabsa.solaria.agency | `/etc/letsencrypt/live/prilabsa.solaria.agency/` | ✓ Activo |

**Archivos por dominio:**
- `fullchain.pem` - Cadena completa
- `privkey.pem` - Clave privada
- `cert.pem` - Certificado
- `chain.pem` - Cadena intermedia

---

## React Dashboard (Principal)

**URL:** https://dfo.solaria.agency

| Componente | Ubicación |
|------------|-----------|
| Build local | `dashboard/app/dist/` |
| Servidor | `/var/www/dfo-v2/` |
| Nginx mount | `/usr/share/nginx/v2` |
| Legacy (vanilla) | https://dfo.solaria.agency/legacy |

**Deploy desde local:**
```bash
cd dashboard/app
pnpm build
rsync -avz --delete dist/ root@148.230.118.124:/var/www/dfo-v2/
ssh -i ~/.ssh/id_ed25519 root@148.230.118.124 "docker exec solaria-dfo-nginx nginx -s reload"
```

**Notas de deploy:**
- El dashboard React se sirve via Nginx desde `/usr/share/nginx/v2`
- El volumen Docker mapea `/var/www/dfo-v2/` → `/usr/share/nginx/v2`
- Nginx maneja el routing SPA con `try_files $uri $uri/ /index.html`
- El dashboard vanilla está disponible en `/legacy/` para referencia

---

## Propósito

Esta es una **Oficina Digital de Construcción en Campo** completamente autocontenida y aislada. Su propósito es:

1. Gestionar proyectos de construcción de software de forma autónoma
2. Proporcionar dashboards ejecutivos para CEO, CTO, COO y CFO
3. Coordinar agentes IA especializados (SOLARIA Agents)
4. Ser desmantelable sin afectar el proyecto construido
5. Integrarse con cualquier agente IA via MCP (Model Context Protocol)

---

## Arquitectura v3.1 (Centralizada)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Proyecto A    │     │   Proyecto B    │     │   Proyecto C    │
│  (MCP Client)   │     │  (MCP Client)   │     │  (MCP Client)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    HTTPS (dfo.solaria.agency)
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│                    VPS Hostinger (148.230.118.124)             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │    Nginx     │───►│  MCP HTTP    │───►│   Dashboard  │     │
│  │   (80/443)   │    │   (:3031)    │    │   (:3030)    │     │
│  └──────────────┘    └──────────────┘    └──────┬───────┘     │
│                                                  │             │
│                                           ┌──────▼───────┐     │
│                                           │   MariaDB    │     │
│                                           │  (embedded)  │     │
│                                           └──────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| office | 3030, 33060 | Dashboard + API + MariaDB (embebido) |
| redis | 6379 | Cache y colas de trabajo |
| worker | - | Procesador de trabajos background |
| nginx | 80/443 | Reverse proxy (opcional) |

---

## Inicio Rápido

```bash
# 1. Levantar servicios (SOLO 3 contenedores necesarios)
docker compose up -d

# 2. Verificar estado
curl http://localhost:3030/api/health

# 3. Acceder al dashboard
# URL: http://localhost:3030
# Usuario: carlosjperez
# Password: bypass
```

---

## IMPORTANTE: Configuración de Credenciales

> **NUNCA usar caracteres especiales (!@#$%^&*) en passwords**
> Causan problemas de escaping en bash y scripts.

Credenciales estándar en `.env`:
```bash
DB_PASSWORD=solaria2024
MYSQL_ROOT_PASSWORD=SolariaRoot2024
```

---

## MCP Integration (Para Agentes IA)

### Conexión Remota (Recomendado)

```bash
# Opción 1: Script automático
bash <(curl -s https://dfo.solaria.agency/install.sh)

# Opción 2: Script desde GitHub
curl -O https://raw.githubusercontent.com/SOLARIA-AGENCY/solaria-digital-field--operations/main/scripts/install-mcp-remote.sh
chmod +x install-mcp-remote.sh
./install-mcp-remote.sh
```

### Configuración Manual (Claude Code)

Editar `~/.claude/claude_code_config.json`:

```json
{
  "mcpServers": {
    "solaria-dfo": {
      "transport": {
        "type": "http",
        "url": "https://dfo.solaria.agency/mcp"
      },
      "headers": {
        "Authorization": "Bearer default"
      }
    }
  }
}
```

---

## ⚠️ IMPORTANTE: Registro de Contexto de Proyecto

### Antes de cualquier operación, el agente DEBE registrar su proyecto:

```javascript
// OBLIGATORIO al inicio de cada sesión
set_project_context({ project_name: "Nombre del Proyecto" })
```

### Por qué es necesario:
- Múltiples agentes pueden trabajar simultáneamente en diferentes proyectos
- Sin contexto, podrías ver/modificar datos de otros proyectos
- El aislamiento previene contaminación de información entre proyectos

### Flujo correcto:

```
1. Al iniciar sesión en un proyecto:
   → Llamar: set_project_context({ project_name: "Mi Proyecto" })
   → Recibir: session_id y confirmación

2. Verificar contexto actual:
   → Llamar: get_current_context()
   → Ver: project_id, isolation_enabled, mensaje

3. Realizar operaciones normales:
   → list_tasks(), create_task(), etc.
   → Todas aisladas al proyecto registrado
```

### Ejemplo práctico:

```
Usuario: Lista las tareas pendientes

Agente: Primero verifico mi contexto de proyecto...
[Llama get_current_context()]

Si no hay contexto:
[Llama set_project_context({ project_name: "PRILABSA Website" })]

Ahora puedo listar tareas:
[Llama list_tasks({ status: "pending" })]
→ Solo retorna tareas del proyecto PRILABSA
```

### Si intentas acceder a otro proyecto:
```
Error: ACCESS DENIED: Cannot access project #3. You are isolated to project #1
```

---

### Herramientas MCP Disponibles

| Herramienta | Descripción |
|-------------|-------------|
| `set_project_context` | **OBLIGATORIO** Registrar proyecto al inicio |
| `get_current_context` | Verificar contexto actual |
| `get_dashboard_overview` | Ver KPIs ejecutivos |
| `list_tasks` | Listar tareas |
| `create_task` | Crear tarea |
| `update_task` | Actualizar tarea |
| `complete_task` | Marcar completada |
| `list_agents` | Ver agentes |
| `list_projects` | Ver proyectos |

### Herramientas de Memoria (Integrado de Memora)

Sistema de memoria persistente para almacenar decisiones, contexto y aprendizajes.

| Herramienta | Descripción |
|-------------|-------------|
| `memory_create` | Crear nueva memoria |
| `memory_list` | Listar memorias (filtros: tags, query, importancia) |
| `memory_get` | Obtener memoria por ID |
| `memory_search` | Búsqueda full-text |
| `memory_update` | Actualizar memoria |
| `memory_delete` | Eliminar memoria |
| `memory_tags` | Ver tags disponibles |
| `memory_stats` | Estadísticas de uso |
| `memory_boost` | Aumentar importancia |
| `memory_related` | Memorias relacionadas |
| `memory_link` | Crear relación entre memorias |

#### Tags Predefinidos
`decision`, `learning`, `context`, `requirement`, `bug`, `solution`, `pattern`, `config`, `credential`, `todo`, `meeting`, `feedback`

#### Ejemplo de Uso
```javascript
// Guardar una decisión arquitectónica
memory_create({
  content: "Usaremos JWT con refresh tokens para auth",
  tags: ["decision", "architecture"],
  importance: 0.8
})

// Buscar decisiones previas
memory_search({
  query: "authentication architecture",
  tags: ["decision"]
})
```

---

## Comandos Útiles

```bash
# Desarrollo
docker compose up -d              # Iniciar
docker compose logs -f office     # Ver logs
docker compose down               # Detener

# Testing
pnpm test                         # Todos los tests
pnpm exec playwright test         # Tests Playwright

# Mantenimiento
docker compose restart office     # Reiniciar
docker compose down -v            # Reset completo (CUIDADO)

# Ingesta de proyecto
pnpm ingest-akademate             # Poblar con Akademate
```

---

## API Endpoints

### Autenticación
```
POST /api/auth/login     - Login
GET  /api/auth/verify    - Verificar token
POST /api/auth/logout    - Logout
```

### Proyectos
```
GET    /api/projects          - Listar
POST   /api/projects          - Crear
GET    /api/projects/:id      - Detalle
PUT    /api/projects/:id      - Actualizar
```

### Tareas
```
GET    /api/tasks             - Listar
POST   /api/tasks             - Crear
GET    /api/tasks/:id         - Detalle
PUT    /api/tasks/:id         - Actualizar
```

### Memorias
```
GET    /api/memories              - Listar (query, tags, limit, offset)
GET    /api/memories/search       - Busqueda full-text
GET    /api/memories/tags         - Tags disponibles
GET    /api/memories/stats        - Estadisticas
GET    /api/memories/:id          - Detalle
GET    /api/memories/:id/related  - Memorias relacionadas
POST   /api/memories              - Crear
POST   /api/memories/:id/boost    - Aumentar importancia
POST   /api/memories/crossrefs    - Crear relacion
PUT    /api/memories/:id          - Actualizar
DELETE /api/memories/:id          - Eliminar
```

### Agentes
```
GET /api/agents               - Listar
PUT /api/agents/:id/status    - Actualizar estado
```

### C-Suite
```
GET /api/csuite/ceo           - Vista CEO
GET /api/csuite/cto           - Vista CTO
GET /api/csuite/coo           - Vista COO
GET /api/csuite/cfo           - Vista CFO
```

### Agent Integration
```
POST /api/agent/register-doc   - Registrar documento
POST /api/agent/update-project - Actualizar proyecto
POST /api/agent/add-task       - Agregar tarea
POST /api/agent/log-activity   - Registrar actividad
```

---

## Características v3.0

### Retry Logic en Base de Datos
- 10 intentos con backoff exponencial al inicio
- Health check cada 30 segundos
- Reconexión automática si pierde conexión

### WebSocket (Socket.IO)
Actualizaciones en tiempo real para:
- Estados de agentes
- Métricas de proyectos
- Alertas críticas
- Cambios en tareas

### Seguridad
- JWT authentication
- Rate limiting
- Helmet security headers
- CORS configurado

---

## Troubleshooting

### Dashboard no arranca
```bash
docker compose logs office
# Esperar 30-45 segundos para MariaDB
```

### Base de datos no conecta
```bash
# Reset completo (CUIDADO - pierde datos)
docker compose down -v
docker compose up -d
```

### Tests fallan
```bash
curl http://localhost:3030/api/health
docker compose ps
```

---

## Protocolo de Desmantelamiento

```bash
# 1. Exportar datos
docker exec office mariadb -uroot -pSolariaRoot2024 solaria_construction -e "SELECT * FROM projects" > backup.sql

# 2. Detener servicios
docker compose down

# 3. Eliminar volúmenes (opcional)
docker compose down -v
```

---

## 🚀 Protocolo de Inicialización de Agentes IA (v2.0)

> **OBLIGATORIO:** Todo agente IA que se conecte a SOLARIA DFO DEBE seguir este protocolo al inicio de cada sesión.

### Paso 1: Registrar Contexto de Proyecto
```javascript
// PRIMERA llamada obligatoria
set_project_context({ project_name: "Nombre del Proyecto" })
```

### Paso 2: Cargar Memoria Relevante
```javascript
// Buscar decisiones y contexto previo del proyecto
memory_search({ query: "decisiones arquitectura contexto", tags: ["decision", "context"] })
```

### Paso 3: Verificar Tareas en Progreso y sus Subtareas
```javascript
// Ver tareas asignadas
const tasks = list_tasks({ status: "in_progress" })

// Para cada tarea, cargar sus subtareas pendientes
for (task of tasks) {
    list_task_items({ task_id: task.id, include_completed: false })
}
```

### Paso 4: Al Tomar Nueva Tarea - CREAR DESGLOSE OBLIGATORIO

Cuando cambies una tarea a "in_progress", **DEBES** crear el desglose de subtareas:

```javascript
// Actualizar estado
update_task({ task_id: 123, status: "in_progress" })

// OBLIGATORIO: Crear desglose granular
create_task_items({
    task_id: 123,
    items: [
        { title: "Analizar requisitos y código existente", estimated_minutes: 30 },
        { title: "Diseñar solución técnica", estimated_minutes: 45 },
        { title: "Implementar cambios en [archivo]", estimated_minutes: 60 },
        { title: "Agregar/actualizar tests", estimated_minutes: 30 },
        { title: "Documentar cambios", estimated_minutes: 15 },
        { title: "Verificar y limpiar código", estimated_minutes: 15 }
    ]
})
```

### Paso 5: Actualizar Progreso Granular

Al completar cada subtarea:
```javascript
complete_task_item({
    task_id: 123,
    item_id: 456,
    notes: "Implementado correctamente, tests pasan",
    actual_minutes: 45
})
// El progreso del task padre se actualiza AUTOMÁTICAMENTE
```

### Paso 6: Al Finalizar Sesión

Guardar contexto importante en memoria:
```javascript
memory_create({
    content: "Resumen de la sesión: completé X items de tarea Y. Pendiente: Z.",
    tags: ["session", "context"],
    importance: 0.6
})
```

### Buenas Prácticas para Subtareas

**Granularidad Ideal:**
- Cada subtarea = 15-60 minutos de trabajo
- Verbos de acción claros: "Implementar", "Agregar", "Refactorizar"
- Específicas: mencionar archivos/componentes cuando sea posible

**Ejemplo de Desglose Típico:**
```javascript
create_task_items({
    task_id: 789,
    items: [
        { title: "Revisar schema actual de DB", estimated_minutes: 15 },
        { title: "Crear migración para nueva tabla", estimated_minutes: 20 },
        { title: "Implementar modelo en server.js", estimated_minutes: 30 },
        { title: "Agregar endpoints CRUD", estimated_minutes: 45 },
        { title: "Crear herramientas MCP", estimated_minutes: 30 },
        { title: "Actualizar UI del dashboard", estimated_minutes: 40 },
        { title: "Probar flujo completo", estimated_minutes: 20 },
        { title: "Actualizar documentación", estimated_minutes: 15 }
    ]
})
```

### Buenas Prácticas de Memoria

**Cuándo crear memorias (importance 0.7-1.0):**
- Decisiones arquitectónicas importantes
- Bugs encontrados y sus soluciones
- Configuraciones críticas (API keys, endpoints)
- Requisitos confirmados por el cliente
- Patrones de código adoptados

**Cuándo crear memorias (importance 0.3-0.6):**
- Contexto de conversaciones
- TODOs y notas para sesiones futuras
- Feedback recibido

**Tags recomendados:**
- `decision` - Decisiones técnicas tomadas
- `architecture` - Diseño de sistema
- `bug` - Problemas encontrados
- `solution` - Soluciones implementadas
- `config` - Configuraciones
- `requirement` - Requisitos del proyecto
- `learning` - Aprendizajes
- `context` - Contexto general

### Ejemplo de Sesión Típica (v2.0)

```
1. Agente se conecta a SOLARIA DFO
   ↓
2. set_project_context({ project_name: "PRILABSA Website" })
   ↓
3. memory_search({ query: "arquitectura decisiones recientes" })
   ↓  → Recupera: "Usamos Payload CMS, React 19, TailwindCSS 4"
4. list_tasks({ status: "in_progress" })
   ↓  → Ve: "Tarea #123 - Implementar formulario de contacto"
5. list_task_items({ task_id: 123 })
   ↓  → Ve: "3/7 items completados"
6. [Continúa trabajando en el siguiente item pendiente...]
   ↓
7. complete_task_item({
     task_id: 123,
     item_id: 456,
     notes: "Validación Zod implementada",
     actual_minutes: 35
   })
   ↓  → Progreso actualizado: 4/7 (57%)
8. [Al finalizar todos los items, el task se completa automáticamente]
   ↓
9. memory_create({
     content: "Formulario implementado con validación Zod y honeypot anti-spam",
     tags: ["solution", "implementation"],
     importance: 0.7
   })
```

---

## Notas para Agentes IA

1. **MCP Remoto**: Usar `https://dfo.solaria.agency/mcp` para integración
2. **Dashboard**: `https://dfo.solaria.agency` - Credenciales: `carlosjperez` / `bypass`
3. **Memorias**: Accesible desde Dashboard → Sidebar → Memorias
4. **Health Check**: `curl https://dfo.solaria.agency/mcp/health`
5. Color corporativo SOLARIA: **#f6921d** (naranja)
6. Agentes se llaman: SOLARIA-PM, SOLARIA-ARCH, SOLARIA-DEV-01, etc.
7. Para desarrollo local: `docker compose up -d` (usa `docker compose`, no `docker-compose`)
8. El servicio principal es `office` en puerto 3030
9. **SIEMPRE** guardar decisiones importantes en memoria para persistencia a largo plazo

### Verificar Conexión MCP

```bash
# Test health
curl https://dfo.solaria.agency/mcp/health

# Test tools list
curl -X POST https://dfo.solaria.agency/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

---

## 📚 Lecciones Aprendidas

> Sección de aprendizajes capturados durante el desarrollo. Cada lección también está guardada en el sistema de memorias MCP.

### L-001: Verificar tareas in_progress antes de pending

**Fecha:** 2025-12-20
**Contexto:** Migración de stack DFO-054
**Memoria ID:** 10

**Problema:** Al buscar tareas con `list_tasks({ status: "pending" })` se omiten las tareas que ya están en progreso.

**Solución:**
```javascript
// Flujo correcto de inicio de sesión:
// 1. Establecer contexto
set_project_context({ project_id: X })

// 2. Ver qué hay en progreso PRIMERO
list_tasks({ status: "in_progress" })

// 3. Luego ver pendientes
list_tasks({ status: "pending" })
```

**Regla:** SIEMPRE verificar `in_progress` antes de `pending` para no perder tareas activas.

---

**SOLARIA Digital Field Operations**
**Oficina de Construcción en Campo v3.2.0**

© 2024-2025 SOLARIA AGENCY
