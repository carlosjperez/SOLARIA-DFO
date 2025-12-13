# SOLARIA Digital Field Operations

**Oficina Digital de Construccion en Campo** - Version 3.0.0

Sistema autocontenido para gestion de proyectos de software con supervision ejecutiva (CEO/CTO/COO/CFO).

## Arquitectura Unificada v3.0

A partir de la version 3.0, DFO utiliza una **arquitectura unificada** basada en el servicio `office`:

```
┌─────────────────────────────────────────────────────────────┐
│                    SOLARIA DFO v3.0                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Office Container (Puerto 3030)            │    │
│  │  ┌───────────────┐    ┌───────────────────────┐    │    │
│  │  │   MariaDB     │    │   Node.js Dashboard   │    │    │
│  │  │   (embedded)  │◄──►│   (Express+Socket.IO) │    │    │
│  │  └───────────────┘    └───────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                             │                                │
│  ┌──────────────┐    ┌─────┴─────┐    ┌──────────────┐     │
│  │    Redis     │    │   Worker  │    │    Nginx     │     │
│  │   (cache)    │◄──►│  (queues) │    │  (optional)  │     │
│  └──────────────┘    └───────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Inicio Rapido

```bash
# 1. Clonar y configurar
git clone https://github.com/SOLARIA-AGENCY/solaria-digital-field--operations.git
cd solaria-digital-field--operations
cp .env.example .env

# 2. Levantar servicios (3 contenedores: office, redis, worker)
docker compose up -d

# 3. Verificar estado
docker compose ps
curl http://localhost:3030/api/health

# 4. Acceder al dashboard
# URL: http://localhost:3030
# Usuario: carlosjperez
# Password: bypass
```

## Comandos Utiles

```bash
# Desarrollo
docker compose up -d              # Iniciar servicios
docker compose logs -f office     # Ver logs del dashboard
docker compose down               # Detener servicios

# Testing
pnpm test                         # Tests API y integracion
pnpm test:ui                      # Tests UI con Playwright

# Mantenimiento
docker compose restart office     # Reiniciar dashboard
docker volume ls                  # Ver volumenes
docker compose down -v            # Eliminar datos (CUIDADO)

# Proyecto Akademate
pnpm ingest-akademate             # Poblar con datos de Akademate
```

## Configuracion

### Variables de Entorno (.env)

```bash
# Base de datos (NO usar caracteres especiales en passwords)
DB_PASSWORD=solaria2024
MYSQL_ROOT_PASSWORD=SolariaRoot2024
DB_NAME=solaria_construction
DB_USER=solaria_user

# Aplicacion
NODE_ENV=production
PORT=3030
JWT_SECRET=your_secret_min_32_chars

# Proyecto a monitorear (opcional)
REPO_PATH=/path/to/your/project
PROJECT_NAME=MyProject
CI_MODE=false
```

> **IMPORTANTE**: Evitar caracteres especiales (!@#$%^&*) en passwords para prevenir problemas de escaping en bash.

## Servicios

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| office | 3030 | Dashboard C-Suite + API REST + MariaDB |
| redis | 6379 | Cache y cola de trabajos |
| worker | - | Procesador de trabajos en background |
| nginx | 80/443 | Reverse proxy (opcional, con `--profile with-proxy`) |

## API Endpoints

### Autenticacion
- `POST /api/auth/login` - Iniciar sesion
- `POST /api/auth/logout` - Cerrar sesion
- `GET /api/auth/verify` - Verificar token

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Detalle de proyecto
- `PUT /api/projects/:id` - Actualizar proyecto

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/:id` - Detalle de tarea
- `PUT /api/tasks/:id` - Actualizar tarea

### Agentes IA
- `GET /api/agents` - Listar agentes
- `GET /api/agents/:id` - Estado de agente
- `PUT /api/agents/:id/status` - Actualizar estado

### C-Suite Dashboards
- `GET /api/csuite/ceo` - Vista CEO
- `GET /api/csuite/cto` - Vista CTO
- `GET /api/csuite/coo` - Vista COO
- `GET /api/csuite/cfo` - Vista CFO

### Integracion de Agentes
- `POST /api/agent/register-doc` - Registrar documento
- `POST /api/agent/update-project` - Actualizar proyecto
- `POST /api/agent/add-task` - Agregar tarea
- `POST /api/agent/log-activity` - Registrar actividad

## Estructura del Proyecto

```
solaria-digital-field--operations/
├── dashboard/                    # C-Suite Dashboard
│   ├── server.js                # Express + Socket.IO server
│   ├── public/                  # Static HTML/CSS/JS
│   └── Dockerfile
├── workers/                      # Background job processor
│   └── index.js                 # Redis queue consumer
├── mcp-server/                  # MCP para agentes IA
│   └── server.js                # Stdio-based MCP server
├── infrastructure/
│   ├── database/
│   │   └── mysql-init.sql       # Schema inicial
│   └── nginx/
│       └── nginx.unified.conf   # Config nginx consolidada
├── tests/
│   ├── ui-smoke.spec.ts         # Tests UI
│   ├── api.spec.ts              # Tests API
│   └── integration.spec.ts      # Tests integracion
├── docker-compose.yml           # Compose unificado v3.0
├── office.Dockerfile            # Imagen office
├── office-entrypoint.sh         # Entrypoint con retry logic
├── .env.example                 # Variables de entorno ejemplo
└── README.md
```

## Caracteristicas Clave

### Retry Logic en Base de Datos
El servidor incluye reconexion automatica con backoff exponencial:
- 10 intentos maximos al inicio
- Delay incremental (1s, 2s, 4s, 8s... max 30s)
- Health check cada 30 segundos
- Reconexion automatica si pierde conexion

### WebSocket (Socket.IO)
Actualizaciones en tiempo real para:
- Estados de agentes
- Metricas de proyectos
- Alertas criticas
- Cambios en tareas

### Seguridad
- Autenticacion JWT
- Rate limiting
- CORS configurado
- Headers de seguridad (Helmet)
- CSP permisivo para CDNs

## Testing

```bash
# Instalar dependencias de test
pnpm install

# Tests API (requiere servicios activos)
pnpm exec playwright test tests/api.spec.ts

# Tests de integracion
pnpm exec playwright test tests/integration.spec.ts

# Tests UI smoke
pnpm exec playwright test tests/ui-smoke.spec.ts

# Todos los tests
pnpm test
```

## Troubleshooting

### Dashboard no arranca
```bash
# Ver logs
docker compose logs office

# Problemas comunes:
# 1. MariaDB no esta listo - esperar 30-45 segundos
# 2. Password con caracteres especiales - simplificar en .env
# 3. Puerto 3030 ocupado - verificar con lsof -i :3030
```

### Base de datos no conecta
```bash
# Verificar que MariaDB esta corriendo
docker compose exec office mariadb-admin ping

# Reset completo (elimina datos!)
docker compose down -v
docker compose up -d
```

### Tests fallan
```bash
# Verificar que servicios estan activos
curl http://localhost:3030/api/health

# Ver estado de contenedores
docker compose ps
```

## Migracion desde v2.0

Si usabas `docker-compose.single.yml` o el multi-container setup:

1. Respaldar datos si necesario
2. Actualizar a version 3.0
3. Usar el nuevo `docker-compose.yml` unificado
4. Las credenciales ahora son simplificadas (sin caracteres especiales)

```bash
# Eliminar volumenes antiguos (CUIDADO - pierde datos)
docker compose down -v
docker volume rm solaria-digital-field--operations_mysql_data

# Levantar con nuevos volumenes
docker compose up -d
```

## Contribuir

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m "feat: mi feature"`
4. Push: `git push origin feature/mi-feature`
5. Crear Pull Request

## Licencia

MIT License - Ver [LICENSE](LICENSE)

---

**SOLARIA Digital Field Operations** - *Gestion de proyectos potenciada por IA*

© 2024-2025 SOLARIA AGENCY. Todos los derechos reservados.
