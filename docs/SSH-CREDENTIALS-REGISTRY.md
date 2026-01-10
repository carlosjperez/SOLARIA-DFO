# 🔐 SSH Credentials Registry - SOLARIA-DFO

**Confidentiality Level:** 🔴 RESTRICTED - Internal Use Only
**Last Updated:** 2026-01-10
**Registry Version:** 1.0
**Encryption:** Ed25519 (modern, secure)

---

## 📋 Overview

Este documento registra todas las claves SSH configuradas para acceso a infraestructura SOLARIA. Las claves **privadas NO están incluidas en el repositorio** (protegidas por `~/.ssh/` local). Este documento describe:

- ✅ Ubicación y propósito de cada clave
- ✅ Fingerprints públicos (para auditoría)
- ✅ Hosts autorizados para cada clave
- ✅ Políticas de uso y rotación
- ✅ Procedimiento de emergencia (revocación)

---

## 🔑 Claves SSH Registradas

### 1. **id_nemesis_server** (Servidor Nemesis 148.230.118.124)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Ed25519 |
| **Fingerprint** | `SHA256:g0pvPabutJH5P3nNTKJ3VeryTO/wEN5qhTRwQNzwMY0` |
| **Público** | `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKT5P6MWeU3TYvb+XmFcK1vHyrUilXHkFbJ4dOBlgDJq nemesis-command01@20250921` |
| **Ubicación Local** | `~/.ssh/id_nemesis_server` (permisos: 600) |
| **Propósito** | Acceso root a servidor NEMESIS (Hostinger 148.230.118.124) |
| **Hosts Autorizados** | `148.230.118.124` (Hostinger VPS) |
| **Servicios** | n8n (5678), MCP Health, Database backups |
| **Estado** | ✅ Activa |
| **Rotación** | Próxima: 2026-07-10 |

**Uso:**
```bash
ssh -i ~/.ssh/id_nemesis_server root@148.230.118.124
# O vía alias (si configurado en ~/.ssh/config):
ssh nemesis-server
```

---

### 2. **nemesis_cmdr_key** (Commander Access - Universal)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Ed25519 |
| **Fingerprint** | `SHA256:BUzvQRsxMnJcHlgEWMaXJuyaabPjRQZdnTZpTIHmA4U` |
| **Público** | `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG1ohkEae9JFtEvoJSsJwrDeMw8/hGwqxqkO/w6JvDPX nemesis-commander-access` |
| **Ubicación Local** | `~/.ssh/nemesis_cmdr_key` (permisos: 600) |
| **Propósito** | Acceso universal a red NEMESIS (fallback) |
| **Hosts Autorizados** | Todos los dispositivos en red Tailscale NEMESIS |
| **Red NEMESIS** | 100.0.0.0/8 (Tailscale private network) |
| **Estado** | ✅ Activa |
| **Rotación** | Próxima: 2026-04-10 |

**Uso:**
```bash
ssh -i ~/.ssh/nemesis_cmdr_key cmdr@[ip-tailscale]
# Ejemplo:
ssh -i ~/.ssh/nemesis_cmdr_key cmdr@100.79.246.5  # Mac Mini DRAKE
```

---

### 3. **id_ed25519** (Personal Key)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Ed25519 |
| **Fingerprint** | `SHA256:tjKR+KEAKQyE1kYCxZy4VAmxLgADDvZr4GpvebOXBcU` |
| **Ubicación Local** | `~/.ssh/id_ed25519` (permisos: 600) |
| **Propósito** | Acceso personal a servidores (fallback primaria) |
| **GitHub** | ✅ Registrada (autenticación repositorios) |
| **Estado** | ✅ Activa |
| **Rotación** | Próxima: 2026-09-21 |

**Uso:**
```bash
# GitHub authentication (automático si ssh-agent está activo)
git push origin main

# Manual:
ssh -i ~/.ssh/id_ed25519 user@host
```

---

### 4. **id_ed25519_server** (Server Companion Key)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Ed25519 |
| **Fingerprint** | `SHA256:nKe4LlR5vetlTOW1RSFUAGNKyRFfs8zMGqSwq6WocxQ` |
| **Ubicación Local** | `~/.ssh/id_ed25519_server` (permisos: 600) |
| **Propósito** | Acceso específico a servicios de servidor (legacy) |
| **Estado** | ⚠️ Legacy - Usar id_nemesis_server en su lugar |
| **Rotación** | Próxima: 2025-09-21 (considerar deprecación) |

---

### 5. **adepac_deploy_auto** (Auto-Deploy Key)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | RSA 4096 |
| **Ubicación Local** | `~/.ssh/adepac_deploy_auto` (permisos: 600) |
| **Propósito** | Despliegues automáticos proyecto ADEPAC |
| **Contexto** | Cliente externo, no está en NEMESIS |
| **Estado** | ⚠️ Externo - No usar para SOLARIA-DFO |
| **Rotación** | Próxima: 2026-01-08 (cliente específico) |

---

### 6. **cepcomunicacion** (Cliente CEPCOMUNICACION)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | RSA |
| **Ubicación Local** | `~/.ssh/cepcomunicacion` (permisos: 600) |
| **Propósito** | Acceso a infraestructura cliente CEPCOMUNICACION |
| **Contexto** | Cliente específico, no está en NEMESIS |
| **Estado** | ⚠️ Externo - No usar para SOLARIA-DFO |
| **Rotación** | Próxima: 2025-11-18 |

---

### 7. **prilabsa-github-actions** (GitHub Actions Key)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | RSA 4096 |
| **Ubicación Local** | `~/.ssh/prilabsa-github-actions` (permisos: 600) |
| **Propósito** | GitHub Actions para CI/CD PRILABSA |
| **Contexto** | Integración GitHub específica |
| **Estado** | ✅ Activa para PRILABSA |
| **Rotación** | Próxima: 2026-09-22 |

---

## 🔒 SSH Config Activo

**Ubicación:** `~/.ssh/config`

```bash
# Global defaults (todas las conexiones SSH)
Host *
    PasswordAuthentication no              # Solo autenticación por clave
    PubkeyAuthentication yes
    HostbasedAuthentication no             # Deshabilitar autenticación por host
    StrictHostKeyChecking ask              # Preguntar antes de agregar nuevos hosts
    CheckHostIP yes                        # Validar IP en known_hosts

    # Encriptación moderna
    Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
    MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
    KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
    HostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256

    # Timeouts
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30

# Servidor NEMESIS
Host nemesis-server
    HostName 148.230.118.124
    User root
    IdentityFile ~/.ssh/id_nemesis_server
    StrictHostKeyChecking accept-new

# Alias adicionales (expandible)
Host solaria-hetzner
    HostName 46.62.222.138
    User root
    IdentityFile ~/.ssh/id_nemesis_server
```

---

## 📊 Matriz de Acceso

```
┌──────────────────────┬───────────────────┬────────────────┬──────────┐
│ Host                 │ Clave Primaria    │ Clave Fallback │ User     │
├──────────────────────┼───────────────────┼────────────────┼──────────┤
│ 148.230.118.124      │ id_nemesis_server │ nemesis_cmdr   │ root     │
│ (NEMESIS Hostinger)  │ (Ed25519)         │ (universal)    │          │
├──────────────────────┼───────────────────┼────────────────┼──────────┤
│ 46.62.222.138        │ id_nemesis_server │ id_ed25519     │ root     │
│ (SOLARIA Hetzner)    │ (Ed25519)         │ (fallback)     │          │
├──────────────────────┼───────────────────┼────────────────┼──────────┤
│ Red Tailscale        │ nemesis_cmdr_key  │ id_ed25519     │ cmdr     │
│ (100.0.0.0/8)        │ (universal)       │ (fallback)     │          │
├──────────────────────┼───────────────────┼────────────────┼──────────┤
│ GitHub               │ id_ed25519        │ -              │ git      │
│ (Repositorios)       │ (automático)      │                │          │
└──────────────────────┴───────────────────┴────────────────┴──────────┘
```

---

## 🛡️ Políticas de Seguridad

### A. Gestión de Claves Privadas

✅ **Obligatorio:**
- Nunca commitear claves privadas al repositorio
- Nunca compartir claves privadas por Slack, email, Discord
- Almacenar en `~/.ssh/` con permisos `600` (usuario lectura/escritura)
- Directorio `~/.ssh/` con permisos `700`
- Usar ssh-agent para gestionar claves en memoria

❌ **Prohibido:**
- Subir claves a GitHub/repositorios
- Usar claves en variables de entorno sin cifrar
- Compartir claves entre dispositivos sin rotación
- Usar misma clave para múltiples propósitos críticos

### B. Rotación de Claves

| Clave | Cadencia | Próxima Rotación |
|-------|----------|-----------------|
| nemesis_cmdr_key | 6 meses | 2026-04-10 |
| id_nemesis_server | 6 meses | 2026-07-10 |
| id_ed25519 | 12 meses | 2026-09-21 |
| id_ed25519_server | 12 meses | 2025-09-21 (vencida) |
| GitHub Actions | Anual | 2026-09-22 |
| Cliente ADEPAC | Anual | 2026-01-08 (próx) |
| Cliente CEPCOMUNICACION | Anual | 2025-11-18 (próx) |

**Nota:** Claves vencidas deben rotarse inmediatamente.

### C. Revocación de Emergencia

Si una clave privada se compromete:

1. **Immediatamente:**
   ```bash
   # Notificar al equipo vía Slack/Discord (URGENTE)
   # NO por email (posible intercepción)
   ```

2. **Dentro de 1 hora:**
   - Remover clave pública de `authorized_keys` en servidores
   - Revocación en GitHub (si aplica)
   - Notificar a todos los accesos

3. **Dentro de 24 horas:**
   - Generar nueva clave privada
   - Actualizar en todos los servidores autorizados
   - Documentar incidente

---

## 🚀 Procedimientos de Uso

### Setup Inicial (Primera Vez)

```bash
# 1. Cargar claves en SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_nemesis_server
ssh-add ~/.ssh/nemesis_cmdr_key
ssh-add ~/.ssh/id_ed25519

# 2. Verificar claves cargadas
ssh-add -l

# 3. Test de conectividad
ssh nemesis-server "echo 'SSH OK'"
```

### Conexión a Servidor

```bash
# Opción A: Alias simplificado
ssh nemesis-server

# Opción B: Explícito con clave
ssh -i ~/.ssh/id_nemesis_server root@148.230.118.124

# Opción C: Con especificación de puerto (si no es 22)
ssh -i ~/.ssh/id_nemesis_server -p 2222 root@148.230.118.124
```

### Transferencia de Archivos

```bash
# Copiar archivo a servidor
scp -i ~/.ssh/id_nemesis_server archivo.txt root@148.230.118.124:/tmp/

# Copiar desde servidor
scp -i ~/.ssh/id_nemesis_server root@148.230.118.124:/tmp/archivo.txt ./
```

### Túnel SSH (Port Forwarding)

```bash
# Forward local port 3306 a MySQL remoto
ssh -i ~/.ssh/id_nemesis_server -L 3306:localhost:3306 root@148.230.118.124 -N

# Forward remoto (reverse)
ssh -i ~/.ssh/id_nemesis_server -R 8080:localhost:3000 root@148.230.118.124
```

---

## 📝 Auditoría

### Verificación Mensual

```bash
#!/bin/bash
# Verificar estado de claves

echo "🔐 SSH Keys Audit Report"
echo "========================"
echo ""

for keyfile in ~/.ssh/id_* ~/.ssh/nemesis_* ~/.ssh/*_key; do
    if [ -f "$keyfile" ] && [ -f "$keyfile.pub" ]; then
        echo "Key: $(basename $keyfile)"
        echo "  Fingerprint: $(ssh-keygen -lf $keyfile | awk '{print $2}')"
        echo "  Type: $(ssh-keygen -lf $keyfile | awk '{print $4}' | tr -d '()')"
        echo "  Modified: $(stat -f "%Sm" $keyfile)"
        echo ""
    fi
done
```

### Log de Accesos

```bash
# Ver último acceso SSH a servidor
ssh nemesis-server "last -10"

# Ver intentos fallidos
ssh nemesis-server "grep 'Failed password' /var/log/auth.log | tail -20"
```

---

## ✅ Checklist de Implementación

- ✅ Todas las claves Ed25519 (moderno, seguro)
- ✅ SSH agent configurado en macOS
- ✅ Permisos correctos (600 para keys, 700 para ~/.ssh/)
- ✅ SSH config optimizado (cifrado, timeouts, hardening)
- ✅ Known hosts registrados
- ✅ Rotación de claves programada
- ⏳ Procedimiento de revocación documentado
- ⏳ Testing mensual de conectividad
- ⏳ Auditoría trimestral de accesos

---

## 🔗 Referencias

- **SSH Best Practices:** https://man.openbsd.org/ssh_config
- **Ed25519 Keys:** https://man.openbsd.org/ssh-keygen
- **Hardening OpenSSH:** https://stribika.github.io/2015/01/04/secure-secure-shell.html
- **NEMESIS Network:** Ver `/CLAUDE.md` sección "Red NEMESIS DEL TIEMPO"

---

**Documento clasificado como RESTRICTED**
**Para acceso: Contactar a carlosjperez@solaria.agency**
**Última auditoría: 2026-01-10**

