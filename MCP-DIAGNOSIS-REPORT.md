# MCP Server Diagnosis Report
**Fecha:** 2026-01-17
**Sesión:** Ralph Loop - Fix MCP Server Phase 1
**Estado:** Parcialmente funcional, requiere corrección de autenticación

---

## 📊 Summary de Estado Actual

| Servicio | Estado | Detalles |
|----------|--------|----------|
| Dashboard API | ✅ Funcional | `/api/health` OK, `/api/auth/login` OK |
| MCP HTTP v1.0 | ⚠️ Parcial | Tools funcionan, auth falla |
| MCP HTTP v2.0 | ❌ No corriendo | `/mcp-v2` no responde |
| Nginx | ✅ Funcional | Routing correcto |
| API Pública | ✅ Funcional | `/api/public` accesible |

---

## 🔍 Problemas Identificados

### 1. **CRITICAL: Mismatch de JWT_SECRET** 🔥

**Síntomas:**
```
curl -X POST /api/auth/login
→ Devuelve token válido (token_A)

curl /api/projects Authorization: Bearer token_A
→ Error: "Invalid or expired token"
```

**Causa Raíz:**
- Dashboard API (container `office`) genera tokens con `JWT_SECRET_A`
- MCP server (container `mcp-http`) usa `JWT_SECRET_B` para verificar
- `JWT_SECRET_A != JWT_SECRET_B`

**Archivos Afectados:**
- `docker-compose.prod.yml` líneas 23, 32, 52
- `mcp-server/http-server.ts` líneas 96, 215
- `dashboard/server.js` líneas 480, 506

**Impacto:**
- `set_project_context` falla al intentar llamar `/api/projects`
- MCP server no puede autenticarse con Dashboard API
- Bloquea TODAS las operaciones que requieren DB

**Prioridad:** 🔥 CRITICAL - BLOQUEA TODO

---

### 2. **HIGH: MCP v2.0 no está deployado** ⚠️

**Síntomas:**
```
curl https://dfo.solaria.agency/mcp-v2/health
→ "Cannot GET /mcp-v2/health" (HTML error)

curl https://dfo.solaria.agency/mcp-v2/tools/list
→ No response (timeout)
```

**Causa Raíz:**
- Container `mcp-http-v2` no está corriendo
- Nginx tiene config para `/mcp-v2` pero upstream no existe

**Archivos Afectados:**
- `docker-compose.prod.yml` líneas 68-92 (service mcp-http-v2 definido pero no iniciado)
- `infrastructure/nginx/nginx.prod.conf` líneas 126-158 (location /mcp-v2 configurado)

**Impacto:**
- MCP v2.0 Sketch Pattern (70+ tools → 2 tools) NO disponible
- Solo MCP v1.0 está operativo

**Prioridad:** HIGH - Bloquea FASE 2 del plan

---

### 3. **MEDIUM: Health check endpoint HTTP** 🟡

**Síntomas:**
```
curl https://dfo.solaria.agency/mcp/health
→ "Cannot GET /mcp/health" (HTML error)
```

**Causa Raíz:**
- `mcp-server/http-server.ts` tiene handler para GET `/mcp` (líneas 595-606)
- Pero Express está devolviendo HTML de error por defecto
- No se está alcanzando el código del handler

**Archivos Afectados:**
- `mcp-server/http-server.ts` líneas 595-629

**Impacto:**
- Health check externo falla
- Monitoring tools no pueden verificar status del MCP server

**Prioridad:** MEDIUM - No bloqueante pero afecta observability

---

### 4. **LOW: set_project_context devuelve error genérico** 🟢

**Síntomas:**
```
POST /mcp/tools/call set_project_context(project_id: 1)
→ {"error": {"code": -32000, "message": "Invalid status code: 32600"}}
```

**Causa Raíz:**
- Error 32600 es un código JSON-RPC, no HTTP
- Estás siendo procesado como HTTP status en línea 580 de `http-server.ts`
- Confusión entre JSON-RPC error codes y HTTP status codes

**Archivos Afectados:**
- `mcp-server/http-server.ts` línea 580

**Impacto:**
- Mensaje de error confuso para usuarios
- Dificulta debugging

**Prioridad:** LOW - UX problem, no funcional

---

## 🔧 Soluciones Propuestas

### Fix #1: Mismatch de JWT_SECRET (CRITICAL)

**Solución Inmediata:**
```yaml
# docker-compose.prod.yml
services:
  office:
    environment:
      - JWT_SECRET=${JWT_SECRET:-solaria_jwt_secret_2024_min32chars_secure}

  mcp-http:
    environment:
      - JWT_SECRET=${JWT_SECRET:-solaria_jwt_secret_2024_min32chars_secure}
      # ^ MISMO valor que office

  mcp-http-v2:
    environment:
      - JWT_SECRET=${JWT_SECRET:-solaria_jwt_secret_2024_min32chars_secure}
      # ^ MISMO valor que office
```

**Comandos:**
```bash
# En servidor de producción (148.230.118.124)
cd /var/www/solaria-dfo
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Verificar JWT_SECRET consistente
docker exec solaria-dfo-office env | grep JWT_SECRET
docker exec solaria-dfo-mcp env | grep JWT_SECRET
# Deben ser IGUALES
```

**Verificación:**
```bash
# Test auth
TOKEN=$(curl -s -X POST https://dfo.solaria.agency/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"carlosjperez","password":"bypass"}' | jq -r '.token')

curl -s https://dfo.solaria.agency/api/projects \
  -H "Authorization: Bearer $TOKEN"
# Debe retornar proyectos, no error "Invalid or expired token"
```

---

### Fix #2: Deploy MCP v2.0 (HIGH)

**Solución:**
```bash
# Asegurar que mcp-http-v2 está corriendo
cd /var/www/solaria-dfo
docker-compose -f docker-compose.prod.yml up -d mcp-http-v2

# Verificar status
docker ps | grep mcp
# Debe mostrar ambos: solaria-dfo-mcp y solaria-dfo-mcp-v2
```

**Verificación:**
```bash
curl -s https://dfo.solaria.agency/mcp-v2/health
# Debe retornar JSON, no HTML error

curl -s -X POST https://dfo.solaria.agency/mcp-v2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# Debe retornar tools get_context y run_code
```

---

### Fix #3: Health check HTTP endpoint (MEDIUM)

**Solución:**
Revisar `mcp-server/http-server.ts` líneas 595-629 para asegurar que GET `/mcp` devuelva JSON cuando no acepte text/event-stream.

**Código actual (líneas 595-606):**
```typescript
app.get("/mcp", async (req: Request, res: Response) => {
  const acceptHeader = req.headers.accept || "";
  if (!acceptHeader.includes("text/event-stream")) {
    res.json({
      status: "ok",
      server: "solaria-dashboard",
      version: "3.1.0",
      transport: "http",
    });
    return;
  }
  // ... resto del código SSE
```

**Posible problema:**
El Express route puede estar siendo interceptado por otro middleware o ruta con mayor precedencia.

**Investigación requerida:**
- Revisar si hay conflicto de rutas
- Verificar middleware ordering
- Test en local para reproducir

---

### Fix #4: Mensaje de error genérico (LOW)

**Solución:**
Mejorar manejo de errores en `mcp-server/http-server.ts` línea 580:

```typescript
// Código actual:
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

if (errorMessage.includes("Authorization")) {
  statusCode = 401;
  errorCode = -32601; // Unauthorized
} else if (errorMessage.includes("Invalid status code")) {
  // Ya es un código de error JSON-RPC, no conviertas a HTTP status
  statusCode = 400;
  errorCode = parseInt(errorMessage.split(" ")[1]) || -32000;
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

---

## 📋 Plan de Acción Inmediata

### Paso 1: Fix JWT_SECRET (30 min) 🔥
1. Acceder a servidor de producción (SSH)
2. Verificar JWT_SECRET en todos los containers
3. Actualizar docker-compose.prod.yml si es necesario
4. Redeploy MCP server
5. Verificar autenticación

### Paso 2: Deploy MCP v2.0 (15 min) ⚠️
1. Iniciar container mcp-http-v2
2. Verificar que esté corriendo
3. Test MCP v2.0 endpoints
4. Actualizar documentación si es necesario

### Paso 3: Fix health check (20 min) 🟡
1. Reproducir issue en local
2. Debug middleware/routes
3. Implementar fix
4. Test en staging

### Paso 4: Mejorar mensajes de error (10 min) 🟢
1. Implementar mejor manejo de errores
2. Test con varios escenarios
3. Commit y deploy

**Tiempo Total Estimado:** 1 hora 15 minutos

---

## ✅ Checklist de Verificación Post-Fix

- [ ] MCP server puede autenticarse con Dashboard API
- [ ] `set_project_context` funciona correctamente
- [ ] `/mcp/health` devuelve JSON, no HTML
- [ ] MCP v2.0 está corriendo y responde
- [ ] Tools list retorna correctas (v1.0: 70+, v2.0: 2)
- [ ] get_context funciona en MCP v2.0
- [ ] Mensajes de error son claros y útiles
- [ ] Health checks de todos los containers pasan
- [ ] Logs no muestran errores de autenticación

---

## 📊 Métricas Antes/Despues

| Métrica | Antes | Objetivo |
|---------|--------|----------|
| MCP server funcional | Parcial | 100% |
| set_project_context | ❌ Falla | ✅ Funciona |
| Auth con Dashboard API | ❌ Fails | ✅ Works |
| MCP v2.0 deploy | ❌ No running | ✅ Running |
| Health check OK | ⚠️ HTML error | ✅ JSON response |
| Tokens válidos | ❌ Rejected | ✅ Accepted |

---

## 🎓 Lecciones Aprendidas

1. **Consistencia de secrets es crítica:** JWT_SECRET debe ser IDÉNTICO en todos los servicios
2. **Versionado del API:** MCP v1.0 y v2.0 pueden coexistir pero necesitan proper deployment
3. **Health checks deben ser fiables:** No devolver HTML cuando se espera JSON
4. **Error messages importan:** Códigos de error confusos dificultan debugging

---

**Reporte Generado:** 2026-01-17
**Autor:** Sisyphus (AI Architect)
**Siguiente Revisión:** Post-fix verification
