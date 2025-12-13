# SOLARIA Digital Field Operations - Oficina de Construcción en Campo

**Versión:** 3.1.0
**Última actualización:** 2025-12-13

---

## Servidor de Producción

**SOLARIA DFO está desplegado de forma centralizada:**

| Recurso | URL |
|---------|-----|
| Dashboard | https://dfo.solaria.agency |
| API | https://dfo.solaria.agency/api |
| MCP HTTP | https://dfo.solaria.agency/mcp |
| Health Check | https://dfo.solaria.agency/mcp/health |

**Credenciales Dashboard:**
- Usuario: `carlosjperez`
- Password: `bypass`

**Servidor VPS:** 148.230.118.124 (Hostinger)

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
        "Authorization": "Bearer default",
        "X-Project-Id": "mi-proyecto"
      }
    }
  }
}
```

### Herramientas MCP Disponibles

| Herramienta | Descripción |
|-------------|-------------|
| `get_dashboard_overview` | Ver KPIs ejecutivos |
| `list_tasks` | Listar tareas |
| `create_task` | Crear tarea |
| `update_task` | Actualizar tarea |
| `complete_task` | Marcar completada |
| `list_agents` | Ver agentes |
| `list_projects` | Ver proyectos |

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

## Notas para Agentes IA

1. **MCP Remoto**: Usar `https://dfo.solaria.agency/mcp` para integración
2. **Dashboard**: `https://dfo.solaria.agency` - Credenciales: `carlosjperez` / `bypass`
3. **Health Check**: `curl https://dfo.solaria.agency/mcp/health`
4. Color corporativo SOLARIA: **#f6921d** (naranja)
5. Agentes se llaman: SOLARIA-PM, SOLARIA-ARCH, SOLARIA-DEV-01, etc.
6. Para desarrollo local: `docker compose up -d` (usa `docker compose`, no `docker-compose`)
7. El servicio principal es `office` en puerto 3030

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

**SOLARIA Digital Field Operations**
**Oficina de Construcción en Campo v3.1.0**

© 2024-2025 SOLARIA AGENCY
