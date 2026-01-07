# 🚀 Guía de Despliegue: MCP v2.0 Production

## Status
✅ Configuraciones corregidas localmente
✅ Scripts de despliegue preparados
✅ Plan de pruebas y validación completo

---

## 📁 Archivos Generados

| Archivo | Ubicación | Propósito |
|---------|-----------|----------|
| `docker-compose.prod.yml` | Raíz del proyecto | Configuración v2.0 |
| `infrastructure/nginx/nginx.prod.conf` | infrastructure/ | Rutas v2.0 en nginx |
| `scripts/deploy-v2-production.sh` | scripts/ | Script completo de despliegue |
| `backups/mcp-v1.0-pre-migration/` | backups/ | Backup de seguridad |
| `docs/MCP-V2-MIGRATION-EOF-REPORT.md` | docs/ | Auditoría de migración |
| `docs/PRODUCTION-DEPLOY-GUIDE.md` | docs/ | Guía de producción |

---

## 🚀 Instrucciones de Despliegue en Servidor (148.230.118.124)

### PASO 1: Conectarse al servidor
\`\`\`bash
ssh root@148.230.118.124
cd /var/www/solaria-dfo
\`\`\`

### PASO 2: Copiar cambios recientes
\`\`\`bash
# Opción A: Git pull (recomendado)
git pull origin main

# Opción B: Transferir archivos manualmente (si git no funciona)
# - docker-compose.prod.yml
# - infrastructure/nginx/nginx.prod.conf
# - scripts/deploy-v2-production.sh
\`\`\`

### PASO 3: Ejecutar script de despliegue
\`\`\`bash
chmod +x scripts/deploy-v2-production.sh
./scripts/deploy-v2-production.sh
\`\`\`

### PASO 4: Monitorear despliegue
\`\`\`bash
# Seguir logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f mcp-http-v2

# En otra terminal
docker compose -f docker-compose.prod.yml logs -f nginx
\`\`\`

### PASO 5: Verificar resultados
\`\`\`bash
# Health check v2.0
curl http://localhost:3032/health

# Via nginx
curl https://dfo.solaria.agency/mcp-v2/health

# Tools list
curl -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# get_context test
curl -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_context",
      "arguments": {
        "include": {
          "projects": true,
          "tasks": true,
          "health": true
        }
      }
    }
  }'
\`\`\`

---

## ✅ Criterios de Éxito

| Test | Objetivo | Verificación |
|------|-----------|-------------|
| Deploy v2.0 | Contenedor UP | `docker ps | grep mcp-http-v2` |
| Health check | Retorna "v2.0 healthy" | `curl /mcp-v2/health` |
| Tools list | Retorna 2 herramientas | `jq .result.tools | length` |
| get_context | Retorna proyectos | `jq .result.data.context.projects | length` |
| Dashboard /api/projects | Retorna datos | `jq length` |
| Dashboard /api/tasks | Retorna datos | `jq length` |
| Dashboard /api/memories | Retorna datos | `jq length` |
| Stress test | 10 reqs completan | Script reporta 100% success |
| Logs | Sin errores críticos | `grep -i error` count < 5 |
| Aislamiento | Funciona con project_id | `set_project_context` |

---

## 🔄 Si Falla Algo

### Ruta de Rápida de Rollback
\`\`\`bash
# 1. Detener v2.0
docker compose -f docker-compose.prod.yml stop mcp-http-v2

# 2. Verificar v1.0 sigue funcionando
curl http://localhost:3031/health
# Esperado: "v1.0 healthy"

# 3. Reportar error a ECO-Lambda
\`\`\`

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────┐
│  HTTPS (443)                            │
│  ┌─────────────────────────────────────────┐ │
│  │         Nginx :443           │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    │
        ┌─────────────┬──────────────┐
        │  v1.0 :3031  │ v2.0 :3032  │
        │  (Legacy)  │ (Official) │
        └─────────────┴──────────────┘
                    │
           ┌──────────────────────────┐
           │   Dashboard :3030   │
           │  (API: proyectos,   │
           │    tareas, memorias)  │
           └──────────────────────────┘
```

---

## 📞 Soporte

Si encuentras problemas:
1. **Script principal:** `scripts/deploy-v2-production.sh`
2. **Logs:** Ver logs del contenedor mcp-http-v2
3. **Rollback:** Ver sección "Si Falla Algo" arriba
4. **Contacto:** Reportar a ECO-Lambda con detalles del error

---

**Fecha de creación:** 2026-01-07 10:00 UTC
**Autor:** ECO-Lambda | SOLARIA DFO
