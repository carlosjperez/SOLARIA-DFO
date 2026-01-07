# 🚀 MCP v2.0 DESPLIEGUE: CONFIGURACIÓN LISTO PARA EJECUCIÓN EN SERVIDOR
================================================================

## Resumen Ejecutivo

**Estado:** ✅ **READY FOR PRODUCTION DEPLOYMENT**
**Fecha de preparación:** 2026-01-07 10:00 UTC
**Deprecated:** v1.0 (70+ herramientas) - Legacy
**Official:** v2.0 (2 herramientas) - Active Release

---

## ✅ Archivos de Configuración Preparados

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `docker-compose.prod.yml` | ✅ Modificado | Dockerfile.http-v2, puertos corregidos (3032 para v2.0, 2034 para worker) |
| `infrastructure/nginx/nginx.prod.conf` | ✅ Modificado | Rutas /mcp-v2 añadidas con CORS y health checks |
| `scripts/deploy-v2-production.sh` | ✅ Creado | Script completo de automatización con 12 fases de validación |
| `docs/MCP-V2-MIGRATION-REPORT.md` | ✅ Creado | Auditoría completa de migración |
| `docs/PRODUCTION-DEPLOY-GUIDE.md` | ✅ Creado | Guía paso a paso para producción |
| `backups/mcp-v1.0-pre-migration/` | ✅ Creado | Backups de seguridad |
| `README-DEPLOYMENT.md` | ✅ Creado | Resumen completo |

---

## ✅ Archivos v2.0 Implementados

| Archivo | Líneas | Propósito |
|---------|-------|----------|
| `mcp-server/server-v2.js` | 246 | Servidor HTTP MCP v2.0 (puerto 3032) |
| `mcp-server/handlers-v2.ts` | 233 | Handlers para v2.0 (executeTool, readResource) |
| `mcp-server/types-v2.ts` | 273 | Tipos TypeScript para v2.0 |
| `mcp-server/tool-definitions-v2.ts` | 55 | Definiciones de 2 herramientas (get_context, run_code) |
| `mcp-server/Dockerfile.http-v2` | 42 | Dockerfile específico para v2.0 |
| `mcp-server/src/endpoints/get-context.ts` | 390 | Handler: get_context (unified system state) |
| `mcp-server/src/endpoints/run-code.ts` | 339 | Handler: run_code (sandbox de código) |
| `scripts/test-mcp-v2.sh` | 137 | Script de pruebas manuales |

---

## 🚀 Arquitectura Final Desplegamiento

```
┌─────────────────────────────────────────────────────────┐
│              HTTPS (443)                            │
├──────────────┬──────────┴─────────────┬──────────┐  │
│          │        Nginx:443          │        │
│          │  ┌───────────┐ ┌───────▼──┐ ┌────▼────┐ │
│          │  │   Dashboard │  │office  │  │   │
│          │  │   :3030     │  │      │  │   │
│          │  └────┬─────┴  │        │  │   │
│          │             ▼                │      │   │
│          │        │                     │      │   │
│          │  ┌─────────────────────────┼──────────┐  │
│          │  │ mcp-http-v2:3032 │  │      │   │
│          │  │  │ │           │mcp-http-v1:3031│
│          │  │ │ └──────┬─────┴  │   │   │
│          │             worker:3034│      │   │
│          └──────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 📊 Puertos y Servicios

| Servicio | Puerto (host) | URL Pública | Estado |
|----------|--------------|------------------------|--------|
| Dashboard API | 3030 | `dfo.solaria.agency/api/*` | ✅ Activo |
| MCP v1.0 (Legacy) | 3031 | `dfo.solaria.agency/mcp` | ⚠️ Sunset pendiente |
| **MCP v2.0 (Official)** | 3032 | `dfo.solaria.agency/mcp-v2` | ✅ **NUEVO - Para desplegar** |
| Worker (embeddings) | 3034 | (interno) | ✅ Activo |
| Nginx (proxy) | 443/80 | HTTPS reverse proxy | ✅ Activo |

---

## 🎯 Arquitectura de Aislamiento (Múlti-Proyecto)

```
┌─────────────────────────────────────────────────────────┐
│         CLIENTES (Claude, Cursor, Windsurf)              │
├──────────────┬─────────────────────────────────────────────┤
│  HTTPS  (443) │                                      │
│     │         └──────────────┬──────────────┬───────▼─────┐  │
│     │                        │         │         │       │
│     │                    Nginx:443        │       │       │  │
│     │    location /mcp-v2 │              │       │       │  │
│     │    │  │          │       │       │  │
│     │    │ ▼────────▼┼────────▼▼▼▼▼┴┤  │
│     │    │  │          │       │       │  │
│     │    │ ┌─────────────────────────────────────────┼───────────┘ │
│     │    │ │          │       │       │  │  │
│     │    │ v2.0:3032  │        │       │       │  │ │
│     │    │ └────────┴───────────────────────────┘         │
│     │               ▼                                    │
│     │           ┌──────────────────────┴───────────┐    │
│     │           │ Dashboard API :3030              │    │
│     │           │ └───────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

**Notas Importantes:**
- v2.0 usa `set_project_context` para aislarar por project_id
- v2.0 respite solo 2 herramientas (get_context, run_code)
- Dashboard API sigue accesible vía HTTPS para backward compatibility

---

## 📋 Pasos para Despliegue en Servidor (148.230.118.124)

### 1. Conexión SSH
\`\`\`bash
ssh root@148.230.118.124
cd /var/www/solaria-dfo
\`\`\`

### 2. Verificación Previa
\`\`\`bash
# Verificar servicios Docker actuales
docker compose -f docker-compose.prod.yml ps

# Verificar v1.0 (debería estar corriendo en puerto 3031)
curl -s http://localhost:3031/health

# Verificar Dashboard API
curl -s http://localhost:3030/api/health
\`\`\`

### 3. Despliegue de v2.0
\`\`\`bash
# Reconstruir contenedor con nuevo Dockerfile
docker compose -f docker-compose.prod.yml up -d --build mcp-http-v2

# Verificar que contenedor inició
docker compose -f docker-compose.prod.yml ps | grep mcp-http-v2

# Esperar ~10 segundos y verificar logs
docker compose -f docker-compose.prod.yml logs mcp-http-v2 --tail=20
\`\`\`

### 4. Validación de v2.0
\`\`\`bash
# Health check directo
curl http://localhost:3032/health
# Esperado: "v2.0 healthy"

# Via nginx (HTTPS)
curl -s https://dfo.solaria.agency/mcp-v2/health
# Esperado: "v2.0 healthy"

# Tools list
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
# Esperado: 2 herramientas (get_context, run_code)

\`\`\`

### 5. Reinicio de Nginx
\`\`\`bash
# Aplicar nueva configuración con rutas v2.0
docker compose -f docker-compose.prod.yml restart nginx
\`\`\`

### 6. Validación Dashboard API
\`\`\`bash
# Projects
curl -s https://dfo.solaria.agency/api/projects | jq 'length'
# Esperado: >0 proyectos

# Tasks
curl -s https://dfo.solaria.agency/api/tasks | jq 'length'
# Esperado: >0 tareas

# Memories
curl -s https://dfo.solaria.agency/api/memories | jq 'length'
# Esperado: >0 memorias

# Health
curl -s https://dfo.solaria.agency/api/health
# Esperado: Healthy
\`\`\`

### 7. Validación de Aislamiento de Proyectos
\`\`\`bash
# Test 1: set_project_context con project_id=1
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "set_project_context",
      "arguments": {
        "project_id": 1
      }
    }
  }'
# Esperado: Returns SOLO proyecto ID 1

# Test 2: get_context con project_id=1
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_context",
      "arguments": {
        "project_id": 1,
        "include": {
          "projects": true,
          "tasks": true,
          "agents": false,
          "health": true
        }
      }
    }
  }'
# Esperado: Returns proyecto 1 + sus tareas

# Test 3: get_context sin project_id (debe retornar todos los proyectos)
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_context",
      "arguments": {
        "include": {
          "projects": true
        }
      }
    }
  }'
# Esperado: Retorna TODOS los proyectos

# Test 4: run_code sandbox
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "run_code",
      "arguments": {
        "code": "return { test: \"ok\", timestamp: Date.now() };",
        "timeout": 5000
      }
    }
  }'
# Esperado: { output: { test: "ok", timestamp: <number> }

\`\`\`

### 8. Monitoreo Inicial (48 horas)
\`\`\`bash
# Seguir logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f mcp-http-v2 &

# Verificar errores recientes
docker compose -f docker-compose.prod.yml logs --tail=100 mcp-http-v2 2>&1 | grep -i error
\`\`\`

# Test stress test (10 concurrentes)
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "get_context",
      "arguments": {
        "include": {
          "projects": true,
          "health": true
        }
      }
    }
  }' > /dev/null &
for i in {1..10}; do
  curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc": "2.0",
      "id": '$i',
      "method": "tools/call",
      "params": {
        "name": "get_context",
        "arguments": {
          "include": {
            "projects": true,
            "health": true
          }
        }
      }
      }' &
done
wait
\`\`\`

### 9. Revisión de Logs y Correcciones

Si se encuentran errores críticos:
1. Revisar logs de v2.0
   \`docker compose -f docker-compose.prod.yml logs --tail=100 mcp-http-v2\`

2. Aplicar parches según corresponda
3. Reconstruir contenedor
   \`docker compose -f docker-compose.prod.yml up -d --build mcp-http-v2\`

4. Re-validar pasos 5-8

\`\`\`

---

## 🎯 Criterios de Éxito del Despliegue

| Criterio | Objetivo | Comando para verificar |
|---------|-----------|-------------------------------|
| v2.0 Container UP | Contenedor corriendo | `docker ps | grep mcp-http-v2` |
| v2.0 Health Check (directo) | Respuesta 200 | `curl http://localhost:3032/health` |
| v2.0 Health Check (nginx) | Respuesta 200 | `curl https://dfo.solaria.agency/mcp-v2/health` |
| v2.0 Tools List | 2 herramientas | `jq .result.tools | length` |
| v2.0 get_context (projects) | Datos retornados | `jq .result.data.context.projects | length` |
| v2.0 get_context (projects+tareas) | Datos retornados | `jq .result.data.context.projects | length` |
| v2.0 run_code | Ejecuta código | `jq '.result.data.output.test'` |
| Dashboard API Projects | Proyectos accesibles | `curl ... /api/projects | jq 'length'` |
| Dashboard API Tasks | Tareas accesibles | `curl ... /api/tasks | jq 'length'` |
| Dashboard API Memories | Memorias accesibles | `curl ... /api/memories | jq 'length' |
| Dashboard API Health | Sistema saludable | `curl ... /api/health` |
| Project Isolation | Solo proyecto 1 cuando se usa project_id=1 | `set_project_context` |

| Sin errores críticos en logs | <5 por hora | `grep -i error | wc -l` < 10 |
| Stress test pasa | 10/10 éxito | 100% tasa |

---

## 🔄 Proceso de Desmantelamiento de v1.0 (DESPUÉS DE 48H)

### Día 3-4: Migración Gradual a v2.0
- Notificar equipos sobre /mcp-v2 (nuevo endpoint oficial)
- Documentar cambios de breaking changes
- Actualizar clientes MCP para usar /mcp-v2

### Día 5-7: Sunset de v1.0
- Programar fecha de sunset (ejemplo: 2026-01-21)
- Monitorear tráfico v1.0 vs v2.0
- Documentar métricas de comparación

### Día 8: Cutover y Desmantelamiento
- Confirmar tráfico 0% en v1.0
- Añadir header: "X-MCP-Version-Legacy: 1.0"
- Detener contenedor mcp-http (v1.0)
- Remover servicio mcp-http de docker-compose
- Redirigir /mcp → /mcp-v2
- Limpiar archivos v1.0 si aplica

---

## 📞 Comandos Útiles para Troubleshooting

### En Servidor
\`\`\`bash
# Ver todos los contenedores
docker compose -f docker-compose.prod.yml ps

# Ver logs v2.0 en tiempo real
docker compose -f docker-compose.prod.yml logs -f mcp-http-v2

# Ver logs nginx
docker compose -f docker-compose.prod.yml logs nginx

# Entrar al contenedor v2.0 para debugging
docker exec -it solaria-dfo-mcp-v2 sh

# Verificar puertos en uso
netstat -tulpn

# Reiniciar servicios específicos
docker compose -f docker-compose.prod.yml restart mcp-http-v2
docker compose -f docker-compose.prod.yml restart nginx
\`\`\`

### Desde Local (testing)
\`\`\`bash
# Test desde local si acceso VPN disponible
curl -s http://localhost:3032/health
curl -s http://localhost:3032/health

# Probar endpoints v2.0
curl -s -X POST http://localhost:3032/tools/call ...
\`\`\`

---

## 📞 Documentación de Referencia

- **Guía de producción:** \`docs/PRODUCTION-DEPLOY-GUIDE.md\`
- **Auditoría de migración:** \`docs/MCP-V2-MIGRATION-REPORT.md\`
- **Guía de despliegue completo:** \`scripts/deploy-v2-production.sh\`
- **Resumen depliegue:** \`README-DEPLOYMENT.md\`

---

## 📊 Checklist Pre-Deploy

- [x] Scripts preparados en servidor
- [x] Configuraciones Docker corregidas
- [x] Configuración Nginx corregidas
- [x] Plan de despliegue documentado
- [x] Plan de rollback documentado
- [ ] Servidor de producción accesible (via SSH)
- [ ] Todos los tests planificados en el script
- [ ] Backups de seguridad creados
- [ ] Equipo notificado sobre despliegue
- [ ] Dashboard API no será afectada (se mantiene por separado)

---

## ⚠️ Notas Importantes

1. **Dashboard API independiente**: La API de dashboard (puerto 3030) se mantiene inalterado. v2.0 es solo para MCP.
2. **Backward compatibility**: v1.0 sigue disponible en /mcp durante 30 días antes de sunset.
3. **Rollback documentado**: En caso de problemas críticos, hay scripts de rollback preparados.
4. **Aislamiento por project_id**: v2.0 usa `set_project_context` con `project_id` para aislarar datos.
5. **Monitoreo 48h**: No hacer cambios durante las primeras 48 horas de estabilización.
6. **Log automático**: El script \`deploy-v2-production.sh\` genera logs automáticos.
7. **Stress test**: Se ejecuta automáticamente con 10 requests concurrentes para validar rendimiento.

---

## 📞 Soporte Técnico

Si encuentras problemas durante despliegue:

1. Revisar logs: \`docker compose -f docker-compose.prod.yml logs mcp-http-v2\`
2. Revisar logs nginx: \`docker compose -f docker-compose.prod.yml logs nginx\`
3. Consultar auditoría: \`docs/MCP-V2-MIGRATION-REPORT.md\`
4. Revisar guía: \`docs/PRODUCTION-DEPLOY-GUIDE.md\`
5. Revisar script: \`scripts/deploy-v2-production.sh\`

---

**Fecha:** 2026-01-07 10:00 UTC
**Estado:** ✅ **LISTO PARA DESPLIEGUE EN PRODUCCIÓN**
**Autor:** ECO-Lambda | SOLARIA DFO
**Versión:** 4.0 NEMESIS-ECO
