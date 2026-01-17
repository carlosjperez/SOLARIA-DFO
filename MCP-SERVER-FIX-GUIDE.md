# MCP Server Fix Guide - Production Deployment

**Fecha:** 2026-01-17
**Prioridad:** CRITICAL - FASE 1 del plan de completación
**Tiempo estimado:** 1 hora 15 minutos

---

## 📋 Resumen de Cambios Requeridos

### Cambio #1: Consistencia de JWT_SECRET (CRITICAL) 🔥

**Problema:**
- Dashboard API usa `JWT_SECRET_A` para generar tokens
- MCP server usa `JWT_SECRET_B` para verificar tokens
- `JWT_SECRET_A != JWT_SECRET_B` → Auth failures

**Archivos a modificar:**

1. **docker-compose.prod.yml**
   ```yaml
   services:
     office:
       environment:
         - JWT_SECRET=${JWT_SECRET:-solaria_jwt_secret_2024_min32chars_secure}
         # Asegurar mismo valor en todos los servicios

     mcp-http:
       environment:
         - JWT_SECRET=${JWT_SECRET:-solaria_jwt_secret_2024_min32chars_secure}
         # ^ DEBE ser IDÉNTICO a office

     mcp-http-v2:
       environment:
         - JWT_SECRET=${JWT_SECRET:-solaria_jwt_secret_2024_min32chars_secure}
         # ^ DEBE ser IDÉNTICO a office
   ```

2. **Verificar en servidor de producción:**
   ```bash
   # SSH a producción (148.230.118.124)
   cd /var/www/solaria-dfo

   # Verificar JWT_SECRET en cada container
   docker exec solaria-dfo-office sh -c 'echo $JWT_SECRET'
   docker exec solaria-dfo-mcp sh -c 'echo $JWT_SECRET'

   # Si son diferentes, fijarlas
   export JWT_SECRET=solaria_jwt_secret_2024_min32chars_secure
   ```

**Comandos de deployment:**
```bash
# 1. SSH a servidor
ssh root@148.230.118.124

# 2. Navegar al proyecto
cd /var/www/solaria-dfo

# 3. Verificar estado actual
docker-compose -f docker-compose.prod.yml ps

# 4. Detener containers
docker-compose -f docker-compose.prod.yml down

# 5. Verificar JWT_SECRET (opcional: fijar si es necesario)
vim .env
# Asegurar: JWT_SECRET=solaria_jwt_secret_2024_min32chars_secure

# 6. Levantar containers con JWT_SECRET consistente
docker-compose -f docker-compose.prod.yml up -d

# 7. Verificar que todos los containers corran
docker-compose -f docker-compose.prod.yml ps
# Debe mostrar: solaria-dfo-office, solaria-dfo-mcp, solaria-dfo-mcp-v2
```

**Verificación post-deployment:**
```bash
# Test auth
TOKEN=$(curl -s -X POST https://dfo.solaria.agency/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"carlosjperez","password":"bypass"}' | jq -r '.token')

# Test projects endpoint con token
curl -s https://dfo.solaria.agency/api/projects \
  -H "Authorization: Bearer $TOKEN" | jq '.projects | length'
# Debe retornar número > 0 (o array vacío, no error "Invalid or expired token")
```

**Tiempo estimado:** 30 minutos

---

### Cambio #2: Deploy MCP v2.0 (HIGH) ⚠️

**Problema:**
- MCP v2.0 (Sketch Pattern) no está corriendo
- Solo MCP v1.0 está operativo
- Bloquea FASE 2 del plan de completación

**Archivos a verificar:**

1. **docker-compose.prod.yml** (ya tiene config de mcp-http-v2)
   - Servicio está definido líneas 68-92
   - Pero puede no estar iniciándose

**Comandos de deployment:**
```bash
# 1. SSH a servidor
ssh root@148.230.118.124
cd /var/www/solaria-dfo

# 2. Verificar qué containers están corriendo
docker ps | grep mcp
# Debe mostrar:
# - solaria-dfo-mcp (puerto 3031, v1.0)
# - solaria-dfo-mcp-v2 (puerto 3032, v2.0)

# 3. Si mcp-http-v2 no está corriendo, iniciarlo
docker-compose -f docker-compose.prod.yml up -d mcp-http-v2

# 4. Verificar status
docker-compose -f docker-compose.prod.yml ps

# 5. Verificar health check
docker ps | grep solaria-dfo-mcp-v2
# Debe mostrar "healthy" en STATUS column
```

**Verificación post-deployment:**
```bash
# Test MCP v2.0 health
curl -s https://dfo.solaria.agency/mcp-v2/health | jq '.'

# Test MCP v2.0 tools list
curl -s -X POST https://dfo.solaria.agency/mcp-v2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools | length'
# Debe retornar 2 (get_context y run_code)

# Test MCP v2.0 get_context
curl -s -X POST https://dfo.solaria.agency/mcp-v2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params": {"name":"get_context","arguments":{}}
  }' | jq '.result.success'
# Debe retornar true
```

**Tiempo estimado:** 15 minutos

---

### Cambio #3: Health Check HTTP endpoint (MEDIUM) 🟡

**Problema:**
- GET `/mcp` devuelve HTML error en producción
- Debe devolver JSON status

**Análisis:**
El código en `mcp-server/http-server.ts` líneas 595-629 parece correcto.
El problema puede ser:
1. Nginx no está proxying GET `/mcp` correctamente
2. Diferente versión del código está corriendo en producción
3. Hay un conflicto de rutas

**Solución alternativa:**
Usar `/health` y `/mcp/health` que SÍ funcionan:

```bash
# Estos endpoints YA están funcionando correctamente:
curl -s https://dfo.solaria.agency/health | jq '.'
curl -s https://dfo.solaria.agency/mcp/health | jq '.'
```

**Investigación adicional en producción:**
```bash
# 1. SSH a servidor
ssh root@148.230.118.124

# 2. Ver logs del MCP server
docker logs solaria-dfo-mcp --tail 50

# 3. Test localmente (desde dentro del container)
docker exec -it solaria-dfo-mcp sh
curl http://localhost:3031/health
curl http://localhost:3031/mcp
# Comparar resultados

# 4. Verificar código del container
docker exec -it solaria-dfo-mcp sh
cat /app/http-server.js | grep -A 10 "app.get(\"/mcp\""
```

**Si se encuentra bug en código:**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild MCP server container
docker-compose -f docker-compose.prod.yml build mcp-http

# 3. Restart container
docker-compose -f docker-compose.prod.yml up -d mcp-http

# 4. Verificar
curl -s https://dfo.solaria.agency/mcp/health
```

**Tiempo estimado:** 20 minutos

---

### Cambio #4: Mejorar mensajes de error (LOW) 🟢

**Problema:**
`set_project_context` devuelve error genérico: "Invalid status code: 32600"

**Archivos a modificar:**
1. **mcp-server/http-server.ts** línea 580

**Cambio requerido:**
```typescript
// Código actual (línea 577-587):
res.status(errorMessage.includes("Authorization") ? 401 : 500).json({
  jsonrpc: "2.0",
  id: req.body?.id,
  error: {
    code: -32000,
    message: errorMessage,
  },
});

// Código mejorado:
let statusCode = 500;
let errorCode = -32000;

// Parsear mensaje de error para determinar tipo
if (errorMessage.includes("Authorization") || errorMessage.includes("Invalid or expired token")) {
  statusCode = 401;
  errorCode = -32601; // Invalid credentials
} else if (errorMessage.includes("Database connection failed")) {
  statusCode = 503;
  errorCode = -32602; // Service unavailable
} else if (errorMessage.includes("Project not found")) {
  statusCode = 404;
  errorCode = -32603; // Not found
} else if (errorMessage.includes("status code:")) {
  // Intentar parsear código JSON-RPC
  const match = errorMessage.match(/status code: (-?\d+)/);
  if (match) {
    errorCode = parseInt(match[1]);
    statusCode = 400; // Bad request para JSON-RPC errors
  }
}

res.status(statusCode).json({
  jsonrpc: "2.0",
  id: req.body?.id,
  error: {
    code: errorCode,
    message: errorMessage,
  },
});
```

**Comandos de deployment:**
```bash
# 1. Aplicar cambios en código
cd /Users/carlosjperez/Documents/GitHub/SOLARIA-DFO/mcp-server
# Editar http-server.ts línea 577-587

# 2. Commit cambios
git add http-server.ts
git commit -m "fix(mcp): Improve error handling with specific error codes

- Map common errors to specific HTTP status codes
- Preserve JSON-RPC error codes in responses
- Better UX with clearer error messages
- Fixes: MCP-DIAGNOSIS-REPORT.md Fix #4"

# 3. Push a remote
git push origin main

# 4. SSH a producción y deploy
ssh root@148.230.118.124
cd /var/www/solaria-dfo

# 5. Pull latest changes
git pull origin main

# 6. Rebuild MCP server
docker-compose -f docker-compose.prod.yml build mcp-http

# 7. Restart container
docker-compose -f docker-compose.prod.yml up -d mcp-http

# 8. Test fix
curl -s -X POST https://dfo.solaria.agency/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params": {
      "name": "set_project_context",
      "arguments": {"project_id": 1}
    }
  }' | jq '.error.code, .error.message'
# Debe retornar código específico (ej: -32603), no -32000
```

**Tiempo estimado:** 10 minutos

---

## ✅ Checklist de Verificación Completa

### Post-Fix Verificación

- [ ] **JWT_SECRET consistente:**
  - [ ] Todos los containers tienen mismo JWT_SECRET
  - [ ] `/api/auth/login` genera tokens válidos
  - [ ] `/api/projects` acepta esos tokens
  - [ ] No hay errores "Invalid or expired token" en logs

- [ ] **MCP v2.0 corriendo:**
  - [ ] Container `solaria-dfo-mcp-v2` está corriendo
  - [ ] `/mcp-v2/health` responde con JSON
  - [ ] `tools/list` retorna 2 tools (get_context, run_code)
  - [ ] `get_context` funciona correctamente

- [ ] **Health check funcionando:**
  - [ ] `/health` responde con JSON
  - [ ] `/mcp/health` responde con JSON
  - [ ] Monitoring tools pueden hacer ping

- [ ] **Mensajes de error mejorados:**
  - [ ] `set_project_context` devuelve código de error específico
  - [ ] HTTP status codes son correctos (401, 404, 503)
  - [ ] Mensajes son claros y útiles

- [ ] **General:**
  - [ ] Todos los containers están "healthy"
  - [ ] No hay errores en logs de Docker
  - [ ] Tests de integración pasan
  - [ ] Dashboard funciona correctamente

---

## 📊 Métricas de Éxito

| Métrica | Antes | Objetivo |
|---------|--------|----------|
| Auth成功率 | 0% | 100% |
| MCP v2.0 uptime | 0% | 100% |
| Health check OK | 50% | 100% |
| Error codes específicos | 0% | 100% |
| MCP server health | Degraded | Healthy |

---

## 🔙 Rollback Plan

Si algo sale mal después de los cambios:

```bash
# 1. SSH a servidor
ssh root@148.230.118.124
cd /var/www/solaria-dfo

# 2. Revertir a versión anterior
git log --oneline -5  # Ver commits recientes
git revert <commit-hash>  # O git reset --hard <commit-hash>

# 3. Rebuild y restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar
docker-compose -f docker-compose.prod.yml ps
curl -s https://dfo.solaria.agency/health
```

---

## 📝 Notas de Producción

**Servidor:** 148.230.118.124
**Ruta del proyecto:** /var/www/solaria-dfo
**Config de Docker:** docker-compose.prod.yml
**Branch:** main
**Repo:** /var/www/solaria-dfo (git)

**Containers relevantes:**
- solaria-dfo-office (Dashboard API, puerto 3030)
- solaria-dfo-mcp (MCP v1.0, puerto 3031)
- solaria-dfo-mcp-v2 (MCP v2.0, puerto 3032)
- solaria-dfo-nginx (Reverse proxy, puertos 80/443)

**Logs importantes:**
```bash
# Logs de MCP server
docker logs solaria-dfo-mcp --tail 100

# Logs de Dashboard
docker logs solaria-dfo-office --tail 100

# Logs de Nginx
docker logs solaria-dfo-nginx --tail 100

# Logs de docker-compose
docker-compose -f docker-compose.prod.yml logs --tail 50
```

---

## 🎓 Lessons Learned

1. **Consistencia de secrets es crítica:** JWT_SECRET debe ser IDÉNTICO en todos los servicios que comunican
2. **Health checks deben ser fiables:** No devolver HTML cuando se espera JSON
3. **Versionado debe ser claro:** Diferenciar entre MCP v1.0 y v2.0
4. **Error codes importan:** Usar códigos específicos ayuda a debugging
5. **Testing en local vs producción:** Lo que funciona local puede fallar en producción por environment differences

---

**Documento creado:** 2026-01-17
**Próxima revisión:** Post-deployment verification
