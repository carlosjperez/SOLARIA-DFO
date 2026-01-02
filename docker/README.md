# SOLARIA DFO - Docker Environment Guide

**Version:** 4.0.0
**Stack:** React 19 + Vite + Node.js 22 + TypeScript + MariaDB + Redis

---

## 📁 Estructura

```
docker/
├── dev/                           # Entorno de Desarrollo
│   ├── Dockerfile.office          # Single-stage, hot-reload
│   ├── Dockerfile.mcp             # Single-stage, tsx watch
│   ├── Dockerfile.worker          # Single-stage, nodemon
│   └── docker-compose.yml         # Config dev con volúmenes
│
└── prod/                          # Entorno de Producción
    ├── Dockerfile.office          # Multi-stage, optimizado
    ├── Dockerfile.mcp             # Multi-stage, Alpine
    ├── Dockerfile.worker          # Multi-stage, optimizado
    └── docker-compose.yml         # Config prod, sin volúmenes código
```

---

## 🔧 Configuración Inicial

### 1. Copiar variables de entorno

```bash
cd /Users/carlosjperez/Documents/GitHub/SOLARIA-DFO
cp .env.example .env
```

### 2. Editar .env según entorno

**Para Desarrollo:**
```bash
NODE_ENV=development
DB_PASSWORD=solaria2024
JWT_SECRET=solaria_jwt_secret_dev_not_for_production
ALLOW_DEFAULT_TOKEN=true
```

**Para Producción:**
```bash
NODE_ENV=production
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
JWT_SECRET=$(openssl rand -base64 32)
ALLOW_DEFAULT_TOKEN=false
```

---

## 🚀 Comandos de Desarrollo

### Iniciar todos los servicios (con hot-reload)
```bash
cd docker/dev
docker compose up -d
```

### Ver logs en tiempo real
```bash
docker compose logs -f
docker compose logs -f office    # Solo dashboard
docker compose logs -f mcp       # Solo MCP server
docker compose logs -f worker    # Solo worker
```

### Rebuild después de cambios en package.json
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Detener servicios
```bash
docker compose down              # Detener pero mantener volúmenes
docker compose down -v           # Detener y eliminar volúmenes (⚠️ borra DB)
```

### Acceder a shell dentro del contenedor
```bash
docker compose exec office bash      # Dashboard
docker compose exec mcp sh           # MCP server (Alpine)
docker compose exec worker bash      # Worker
```

### Verificar estado de servicios
```bash
docker compose ps
curl http://localhost:3030/api/health   # Dashboard health
curl http://localhost:3031/health       # MCP health
curl http://localhost:3032/health       # Worker health
```

---

## 🏭 Comandos de Producción

### Build optimizado
```bash
cd docker/prod
docker compose build --no-cache
```

### Iniciar en background
```bash
docker compose up -d
```

### Ver logs (últimas 100 líneas)
```bash
docker compose logs --tail=100
```

### Restart servicios sin downtime
```bash
docker compose restart office
docker compose restart mcp
docker compose restart worker
```

### Detener producción
```bash
docker compose down              # Mantener datos
docker compose down -v           # ⚠️ ELIMINA TODOS LOS DATOS
```

### Backup de base de datos
```bash
docker compose exec office mariadb-dump -uroot -pSolariaRoot2024 \
  solaria_construction > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup
```bash
docker compose exec -T office mariadb -uroot -pSolariaRoot2024 \
  solaria_construction < backup_20260101_120000.sql
```

---

## 📊 Diferencias Clave Dev vs Prod

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| **Dockerfile** | Single-stage | Multi-stage (builder + runner) |
| **Dependencias** | Todas (incluye devDependencies) | Solo producción (--omit=dev) |
| **Código fuente** | Montado como volumen | Copiado en imagen (compiled) |
| **Hot-reload** | ✅ Sí (tsx watch, nodemon) | ❌ No |
| **NODE_ENV** | development | production |
| **Logs** | Verbose | Minimal |
| **Restart policy** | unless-stopped | unless-stopped |
| **JWT_SECRET** | Simple (dev only) | Fuerte (32+ chars) |
| **DB Password** | Simple (solaria2024) | Fuerte y única |
| **Default token** | Permitido (ALLOW_DEFAULT_TOKEN=true) | Bloqueado (false) |
| **Tamaño imagen** | ~800MB (con devDeps) | ~450MB (optimizada) |
| **Build time** | Rápido (solo deps) | Lento (compila TypeScript) |
| **Seguridad** | Media (desarrollo local) | Alta (hardened) |
| **SSL/HTTPS** | No requerido | Obligatorio (nginx) |

---

## 🔍 Troubleshooting

### Puerto 3030 ya en uso
```bash
lsof -ti:3030 | xargs kill -9
# O cambiar puerto en docker-compose.yml: "3031:3030"
```

### Hot-reload no funciona en dev
```bash
# Verificar que volúmenes estén montados
docker compose exec office ls -la /app
# Debe mostrar archivos de código, NO node_modules de host
```

### Base de datos no conecta
```bash
# Verificar que office esté healthy
docker compose ps
# Esperar 30-45 segundos para MariaDB initialization
docker compose logs office | grep "MariaDB"
```

### Rebuild limpio (resolver problemas de cache)
```bash
docker compose down -v
docker system prune -a --volumes
docker compose build --no-cache
docker compose up -d
```

### Ver uso de recursos
```bash
docker stats
# O específico:
docker stats solaria-dfo-office-dev solaria-dfo-mcp-dev
```

---

## 🌐 URLs de Acceso

| Servicio | URL Desarrollo | URL Producción |
|----------|----------------|----------------|
| Dashboard | http://localhost:3030 | https://dfo.solaria.agency |
| Dashboard Legacy | http://localhost:3030/legacy | https://dfo.solaria.agency/legacy |
| API | http://localhost:3030/api | https://dfo.solaria.agency/api |
| MCP HTTP | http://localhost:3031 | https://dfo.solaria.agency/mcp |
| MCP Health | http://localhost:3031/health | https://dfo.solaria.agency/mcp/health |
| Worker Embeddings | http://localhost:3032 | http://148.230.118.124:3032 |
| Redis | localhost:6379 | redis:6379 (interno) |
| MariaDB | localhost:33060 | office:3306 (interno) |

**Credenciales dashboard:**
- Usuario: `carlosjperez`
- Password: `bypass`

---

## 🔒 Seguridad en Producción

### Checklist obligatorio antes de deploy:

- [ ] Cambiadas todas las contraseñas por defecto
- [ ] JWT_SECRET generado con `openssl rand -base64 32`
- [ ] ALLOW_DEFAULT_TOKEN=false
- [ ] Firewall configurado (UFW)
- [ ] SSL/TLS habilitado (Let's Encrypt)
- [ ] Backups automáticos configurados
- [ ] Monitoreo y alertas activos
- [ ] `.env` en .gitignore (nunca commitear)
- [ ] Permisos de archivos restringidos (600 para .env)
- [ ] Rate limiting configurado
- [ ] Headers de seguridad en nginx

### Hardening adicional:

```bash
# Limitar memoria del worker
docker compose up -d --scale worker=1 --memory="1g"

# Logs rotativos
docker compose logs --tail=1000 > logs/docker_$(date +%Y%m%d).log

# Monitoring con healthchecks
watch -n 5 'curl -sf http://localhost:3030/api/health || echo "DOWN"'
```

---

## 📚 Referencias

- **Documentación completa**: `/CLAUDE.md` (proyecto)
- **SOLARIA Methodology**: `/docs/SOLARIA-METHODOLOGY.md`
- **API Documentation**: https://dfo.solaria.agency/api/docs
- **MCP Protocol**: https://modelcontextprotocol.io

---

**SOLARIA Digital Field Operations**
**Professional Docker Configuration v4.0.0**

© 2024-2025 SOLARIA AGENCY
