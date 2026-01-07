# 🔐 Configuración SSH - SOLARIA DFO Server

## 📋 Información del Servidor

| Propiedad | Valor |
|-----------|-------|
| **Host** | 148.230.118.124 (srv943151.hstgr.cloud) |
| **Usuario** | root |
| **Nombre** | SOLARIA DFO Server |
| **Proveedor** | Hostinger / Hetzner |

---

## 🔑 Claves SSH Configuradas

### Clave Principal de Conexión

| Archivo | Ruta | Estado |
|---------|-------|--------|
| **Privada** | `~/.ssh/id_nemesis_server` | ✅ Activa |
| **Pública** | `~/.ssh/id_nemesis_server.pub` | ✅ Disponible |

### Claves Autorizadas en Servidor

En `~/.ssh/authorized_keys` del servidor (root@148.230.118.124):

1. **ssh-ed25519** (charlie@solaria.agency)
2. **ssh-rsa** (otra clave, diferente a nemesis)

### 🔴 PROBLEMA: Clave `id_nemesis_server` NO está en authorized_keys

La clave `id_nemesis_server` que usamos para conectar ahora **NO está autorizada** en el servidor. La conexión funciona porque usamos contraseña manualmente.

---

## 🔧 Solución Permanente

### Paso 1: Agregar Clave Pública al Servidor

**Contenido de la clave pública a agregar:**

```bash
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKT5P6MWeU3TYvb+XmFcK1vHyrUilXHkFbJ4dOBlgDJq nemesis-command01@20250921
```

En el servidor (148.230.118.124), ejecutar:

```bash
# Agregar la clave al final del archivo
cd ~/.ssh
cat >> authorized_keys << 'NEWKEY'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKT5P6MWeU3TYvb+XmFcK1vHyrUilXHkFbJ4dOBlgDJq nemesis-command01@20250921
NEWKEY

# Verificar que se haya agregado
wc -l authorized_keys
```

### Paso 2: Verificar Conexión SSH

En tu máquina local, probar:

```bash
# Debería conectar SIN pedir contraseña
ssh -i ~/.ssh/id_nemesis_server root@148.230.118.124 "echo 'SSH con clave: SUCCESS' && whoami"
```

Si funciona, verás: `SSH con clave: SUCCESS` seguido de `root`

---

## 📁 Archivos de Configuración Local

### Configuración SSH (`~/.ssh/config`)

```
Host solaria-server
    HostName 148.230.118.124
    User root
    IdentityFile ~/.ssh/id_nemesis_server
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 10
    StrictHostKeyChecking accept-new
```

### Uso de la Configuración

```bash
# Conectar usando alias del config (MÁS FÁCIL)
ssh solaria-server

# Equivalente a:
ssh -i ~/.ssh/id_nemesis_server root@148.230.118.124
```

---

## 🔐 Credenciales de Acceso (GUARDADAS)

| Credencial | Valor |
|-----------|-------|
| **Host** | 148.230.118.124 |
| **Usuario** | root |
| **Contraseña** | `fVZ3cjnZ3(dfd53` |
| **Clave Privada** | `~/.ssh/id_nemesis_server` |
| **Puerto** | 22 (default SSH) |

⚠️ **IMPORTANTE:** Guardar esta contraseña en un lugar seguro (password manager) como backup.

---

## ✅ Verificación de Configuración

### 1. Verificar Permisos de Claves

En tu máquina local:

```bash
# La clave privada debe tener permisos 600
ls -la ~/.ssh/id_nemesis_server
# Debe ser: -rw------- (600)

# Si no es 600, corregir:
chmod 600 ~/.ssh/id_nemesis_server
```

### 2. Verificar Contenido de authorized_keys en Servidor

```bash
# En el servidor (148.230.118.124):
wc -l ~/.ssh/authorized_keys
# Debería mostrar al MENOS 3 líneas (2 actuales + 1 nueva)
```

### 3. Verificar Host Key

```bash
# En tu máquina local:
grep "148.230.118.124" ~/.ssh/known_hosts
# Debería mostrar la huella del servidor:
# 148.230.118.124 ecdsa-sha2-nistp256 AAAAE2Vj...
```

---

## 🚀 Métodos de Conexión

### Método 1: Usando Alias del Config (RECOMENDADO)

```bash
# Más simple y no requiere especificar clave
ssh solaria-server
```

### Método 2: Especificando Clave

```bash
ssh -i ~/.ssh/id_nemesis_server root@148.230.118.124
```

### Método 3: Con Contraseña (BACKUP)

```bash
# Solo si la clave SSH falla
ssh root@148.230.118.124
# Pedirá contraseña: fVZ3cjnZ3(dfd53
```

### Método 4: Con scp para Subir Archivos

```bash
# Subir archivo al servidor
scp -i ~/.ssh/id_nemesis_server archivo.txt root@148.230.118.124:/var/www/

# Subir directorio completo
scp -i ~/.ssh/id_nemesis_server -r carpeta/ root@148.230.118.124:/var/www/
```

---

## 📝 Comandos Útiles para Gestión del Servidor

### Crear Archivos Remotamente

```bash
# Método simple con heredoc (ideal para archivos pequeños)
ssh solaria-server "cat > /ruta/archivo.txt << 'EOF'
contenido del archivo
EOF"

# Método con echo
ssh solaria-server "echo 'contenido' > /ruta/archivo.txt"

# Método con cat (para archivos grandes)
cat archivo_local.txt | ssh solaria-server "cat > /ruta/archivo_remoto.txt"
```

### Ejecutar Scripts Remotamente

```bash
# Ejecutar script existente
ssh solaria-server "bash /var/www/solaria-dfo/scripts/script.sh"

# Ejecutar comandos múltiples
ssh solaria-server "cd /var/www/solaria-dfo && ls -la && docker ps"
```

### Ver Logs y Estado de Docker

```bash
# Ver logs de contenedor
ssh solaria-server "docker logs solaria-dfo-mcp-v2-minimal --tail 50"

# Ver estado de todos los contenedores
ssh solaria-server "docker ps -a"

# Ver logs en tiempo real
ssh solaria-server "docker logs -f solaria-dfo-mcp-v2-minimal"
```

---

## 🔄 Proceso para Deploy Futuros

### Paso 1: Preparar Archivos Localmente

```bash
# Asegurarse de estar en el proyecto
cd /Users/carlosjperez/Documents/GitHub/SOLARIA-DFO

# Verificar archivos para deploy
ls -la scripts/deploy-*.sh docker-compose.*.yml
```

### Paso 2: Subir y Ejecutar Script de Deploy

```bash
# Subir script de deploy al servidor
scp -i ~/.ssh/id_nemesis_server scripts/deploy-mcp-v2-final.sh root@148.230.118.124:/tmp/

# Ejecutar script remotamente
ssh solaria-server "bash /tmp/deploy-mcp-v2-final.sh"

# Monitorear logs en tiempo real
ssh solaria-server "docker logs -f solaria-dfo-mcp-v2-minimal"
```

### Paso 3: Verificar Deploy

```bash
# Health check
curl -s http://148.230.118.124:3032/health | jq .

# Ver logs
ssh solaria-server "docker logs solaria-dfo-mcp-v2-minimal --tail 20"

# Verificar estabilidad por 1 minuto
watch -n 10 'curl -s http://148.230.118.124:3032/health | jq .'
```

---

## 🎯 Próximos Pasos para Configurar SSH Completo

1. **[ ] Conectar al servidor** con contraseña manualmente:
   ```bash
   ssh root@148.230.118.124
   # Contraseña: fVZ3cjnZ3(dfd53
   ```

2. **[ ] Agregar clave pública al authorized_keys**:
   ```bash
   cd ~/.ssh
   # En tu máquina local, copia: cat ~/.ssh/id_nemesis_server.pub
   # En el servidor, pega el contenido al final del archivo
   cat >> authorized_keys
   ```

3. **[ ] Verificar conexión sin contraseña**:
   ```bash
   ssh -i ~/.ssh/id_nemesis_server root@148.230.118.124 "echo 'SUCCESS'"
   # Debe mostrar 'SUCCESS' sin pedir contraseña
   ```

4. **[ ] Probar deploy automatizado**:
   ```bash
   scp -i ~/.ssh/id_nemesis_server scripts/deploy-mcp-v2-final.sh root@148.230.118.124:/tmp/
   ssh solaria-server "bash /tmp/deploy-mcp-v2-final.sh"
   ```

---

## 📞 Solución de Problemas

### SSH Pide Contraseña

**Causa:** La clave pública no está en `~/.ssh/authorized_keys` del servidor.

**Solución:**
1. Conectar con contraseña manualmente
2. Agregar la clave pública al archivo
3. Verificar permisos: `chmod 600 ~/.ssh/authorized_keys`

### Connection Refused

**Causa:** Servidor no tiene SSH habilitado o firewall bloquea puerto 22.

**Solución:**
1. Verificar puerto 22: `telnet 148.230.118.124 22`
2. Verificar firewall del servidor: `ufw status` (si es Ubuntu)

### Host Key Verification Failed

**Causa:** La huella del servidor cambió o hay múltiples entradas en `known_hosts`.

**Solución:**
```bash
# Remover entrada específica del servidor
ssh-keygen -R 148.230.118.124

# Remover entrada específica
sed -i '/148\.230\.118\.124/d' ~/.ssh/known_hosts
```

---

## 📚 Referencias

- **Documentación SSH**: https://www.ssh.com/academy/ssh/key
- **Hostinger Docs**: https://support.hostinger.com/en/articles/0284483-how-to-connect-to-vps-via-ssh
- **Docker Compose**: https://docs.docker.com/compose/

---

**Última actualización:** 2026-01-07
**Autor:** ECO-Lambda | SOLARIA DFO
**Versión:** 1.0.0
