# Servidores SOLARIA DFO - Configuración y Credenciales

## Servidor Producción (Principal)
**Host:** 148.230.118.124 (Hostinger)
**Tipo:** Centralizado Multi-Servicio
**Estado:** MCP v2.0 ✅ DEPLOYADO
**Dashboard:** https://dfo.solaria.agency

---

## Credenciales Dashboard
- **Usuario:** `carlosjperez`
- **Password:** `bypass`

---

## Servicios Centralizados

| Servicio | URL | Versión | Estado | Descripción |
|----------|-----|---------|--------|-------------|
| | Dashboard (Legacy) | https://dfo.solaria.agency/mcp | v1.0 | ✅ Activo | MCP HTTP v1.0 (:3031) |
| | MCP v2.0 | https://dfo.solaria.agency/mcp-v2 | v2.0 | ✅ Activo | MCP HTTP v2.0 (:3032) - Nginx proxy OK |
| | Dashboard API | https://dfo.solaria.agency/api | - | ✅ Activo | REST API (:3030) |
| | N8N | https://n8n.solaria.agency | - | ⚠️ Configurado | Workflow automation (:5678) |

---

## Nginx Reverse Proxy (Actualizado 2026-01-07)

**Configuración Activa:** `/var/www/solaria-dfo/infrastructure/nginx/nginx.mcp-v2.conf`

**Upstreams Configurados:**
```nginx
upstream dashboard {
    server solaria-dfo-office:3030;
}

upstream mcp_v2 {
    server solaria-dfo-mcp-v2-minimal:3032;
}
```

**Contenedor Nginx:**
```bash
Nombre: solaria-dfo-nginx
Puertos: 80:80, 443:443
Red: solaria-network
Estado: Up estable
```

**Endpoints HTTPS (dfo.solaria.agency):**
- `/api` → Dashboard API (:3030)
- `/mcp` → MCP v1.0 (:3031)
- `/mcp-v2` → MCP v2.0 (:3032) ✅ **FUNCIONA**
- `/socket.io` → Dashboard WebSocket
- `/` → Dashboard frontend (proxy a office)

**Script de Restart:**
```bash
ssh root@148.230.118.124
cd /var/www/solaria-dfo
./scripts/restart-nginx.sh
```

**Nota Importante:** 
El endpoint `/mcp-v2` requiere trailing slash en la configuración nginx:
```nginx
location /mcp-v2/ {
    proxy_pass http://mcp_v2/;  # Con slash → reemplaza URI
}
```

---

## Credenciales SSH

### Servidor 148.230.118.124 (Principal)

**Acceso estándar:**
```bash
ssh -i ~/.ssh/id_ed25519 root@148.230.118.124
```

**Archivos de configuración:**
- `~/.ssh/config` - Configuración global SSH
- `~/.ssh/id_ed25519` - Clave privada principal
- `~/.ssh/known_hosts` - Hosts conocidos

### Servidor 46.62.222.138 (NEMESIS/Alternativo)

**Acceso PROBLEMÁTICO:**
```bash
ssh -i ~/.ssh/id_nemesis_server root@46.62.222.138
```

**Estado:** ⚠️ Rechaza conexiones SSH ("Permission denied")
**Causa:** El servicio SSH no está habilitado o hay configuración incorrecta

**Archivos de configuración:**
- `~/.ssh/id_nemesis_server` - Clave para servidor NEMESIS
- `~/.ssh/id_nemesis_server.pub` - Clave pública

---

## Arquitectura v4.0 (Centralizada)

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Proyecto A    │     │   Proyecto B    │     │   Proyecto C    │
│  (MCP Client)   │     │  (MCP Client)   │     │  (MCP Client)   │
└────────┬────────┘     └───────────────┘     └───────────────┘     └───────────────┘
         │                       │
         └───────────────────────┼───────────────────────┘
                                  │
                                  ▼ HTTPS (dfo.solaria.agency)
                                  │
                                  ▼
```

**Nginx Reverse Proxy:** Port 80/443
**Services:** Docker Compose orchestration

---

## Proyecto SOLARIA-DFO

**Nombre:** SOLARIA Digital Field Operations
**Versión:** 4.0.0
**Tipo:** Oficina Digital de Construcción en Campo
**Repositorio:** https://github.com/SOLARIA-AGENCY/SOLARIA-DFO

---

## Problema Detectado

### Error: `Permission denied (publickey,password)`

**Servidor:** 46.62.222.138
**Síntoma:** SSH rechaza todas las conexiones

**Causas Posibles:**

1. **Servicio SSH no iniciado:**
   - El demonio SSH no se está ejecutando en el servidor
   - Posiblemente deshabilitado por seguridad

2. **Autenticación por llave pública no habilitada:**
   - `PubkeyAuthentication` podría estar en `no`
   - Verificar configuración en `/etc/ssh/sshd_config`

3. **Clave pública no autorizada:**
   - La clave `~/.ssh/id_nemesis_server.pub` no está en `~/.ssh/authorized_keys`
   - Necesita agregar la clave pública a `authorized_keys`

4. **Credenciales incorrectos:**
   - Usuario `root` no configurado
   - Contraseña incorrecta (si está habilitada `PasswordAuthentication`)

---

## Recomendaciones Loop RAlpha

### FASE 1: Análisis de Logs (48 horas)

1. **Revisar logs del servidor 46.62**
   ```bash
   ssh root@46.62.222.138 "docker logs -f solaria-n8n --tail=1000"
   ```

2. **Identificar patrones de errores**
   - Buscar `Connection refused`, `Permission denied`, `timeout`

3. **Documentar errores recurrentes**
   - Crear memorias en el dashboard con tags `["error", "46.62", "ssh"]`

### FASE 2: Pruebas de Conexión

1. **Verificar puerto SSH estándar (22)**
   ```bash
   nc -zv 46.62.222.138 22
   ```

2. **Probar autenticación por contraseña** (como fallback)
   ```bash
   ssh root@46.62.222.138 -o PreferredAuthentications=password
   ```

### FASE 3: Corrección

1. **Habilitar servicio SSH**
   ```bash
   ssh root@46.62.222.138 "systemctl enable sshd"
   ```

2. **Verificar configuración SSH**
   ```bash
   ssh root@46.62.222.138 "cat /etc/ssh/sshd_config | grep PubkeyAuthentication"
   ```

3. **Autorizar clave pública**
   ```bash
   ssh-copy-id -i ~/.ssh/id_nemesis_server.pub root@46.62.222.138:~/.ssh/authorized_keys
   ```

### FASE 4: Validación

1. **Probar conexión**
   ```bash
   ssh -i ~/.ssh/id_nemesis_server root@46.62.222.138 "echo 'SSH Connection OK'"
   ```

2. **Verificar acceso a servicios**
   ```bash
   ssh root@46.62.222.138 "docker ps && curl -s http://localhost:5678/healthz && curl -s http://localhost:5678/postgres"
   ```

---

## Acción Inmediata Requerida

### 🚨 PRIORIDAD CRÍTICA

El servidor **46.62.222.138** tiene problemas de acceso SSH:

1. **No puede ejecutar scripts de deploy**
2. **No puede verificar estado vía SSH**
3. **Imposible realizar auditoría remota**

---

## Opciones de Solución

### Opción 1: Usar Solo Servidor 148.230

**Recomendación:** Continuar usando el servidor de producción 148.230.118.124

**Ventajas:**
- ✅ MCP v2.0 ya deployado y funcional
- ✅ Acceso SSH funcional
- ✅ Todos los servicios operando
- ✅ Dashboard accesible

**Pasos:**
1. Ejecutar script de auditoría local: `bash scripts/audit-mcp-v2.sh`
2. Seleccionar opción 1 (Auditoría Producción)

### Opción 2: Usar 46.62 con Docker Webhook

**Cómo funciona:**
- En lugar de SSH directo, usar `github_trigger_workflow` del dashboard
- El workflow llama la API del servidor (HTTPS) sin SSH
- El workflow ejecuta commands en el servidor localmente

**Requiere:**
- Configurar GitHub Actions con token
- Implementar workflow que llama endpoints del servidor

### Opción 3: Migración a 148.230

**Si se decide usar 46.62 como primario:**

**Consideraciones:**
- Migrar DFO completo a 46.62.222.138
- Actualizar DNS: `n8n.solaria.agency` → `46.62.222.138`
- Reconfigurar SSL certificates
- Actualizar documentación CLAUDE.md y AGENTS.md
- Revisar scripts de deploy

---

## Comandos Útiles

### Verificar estado servidor 148.230 (sin SSH)
```bash
# Health MCP v2.0
curl -s https://dfo.solaria.agency/mcp-v2/health

# Health Dashboard
curl -s https://dfo.solaria.agency/api/health

# Verificar Docker containers vía HTTPS
curl -s https://dfo.solaria.agency/health
```

### Verificar estado servidor 46.62 (si se corrige SSH)
```bash
# Solo si SSH funciona
nc -zv 46.62.222.138 22
```

---

## Archivos de Documentación Actualizados

Esta información debe ser registrada en:

1. **CLAUDE.md** - Configuración del servidor principal
2. **AGENTS.md** - Configuración de agentes IA
3. **Memorias del proyecto** - Credenciales y estado servidores

---

**Estado Final:** Pendiente de acción por el usuario

---

**Última actualización:** 2026-01-07
