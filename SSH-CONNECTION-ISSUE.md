# 🔌 SSH CONNECTION ISSUE - FINAL STATUS

## ❌ Issue: Cannot connect via SSH

Todas las claves SSH locales fueron probadas y **TODAS fallaron** con:
```
Permission denied (publickey,password).
```

### Claves probadas:

| Clave | Usuario | Resultado |
|--------|----------|------------|
| `~/.ssh/id_ed25519` | root, carlosjperez | ❌ Fail |
| `~/.ssh/id_ed25519_server` | root, carlosjperez | ❌ Fail |
| `~/.ssh/id_nemesis_server` | root, carlosjperez | ❌ Fail |
| `~/.ssh/solaria-hetzner/id_solaria_hetzner_prod` | root, carlosjperez | ❌ Fail |

### Config SSH encontrada:

```
Host solaria-server
    HostName 148.230.118.124
    User root
    IdentityFile ~/.ssh/id_ed25519_server
```

### Diagnóstico:

El problema es que **las claves públicas no están en el servidor**:
- Archivo `~/.ssh/authorized_keys` NO existe o no contiene tus claves
- Solo se puede conectar con usuario/contraseña manual

---

## ✅ SOLUCIONES

### Opción 1: Agregar Claves SSH al Servidor (RECOMENDADO)

En el servidor (148.230.118.124), ejecuta:

```bash
# Crear directorio SSH si no existe
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Crear authorized_keys si no existe
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Agregar cada clave pública (desde tu máquina local):
# Copia el contenido de cada archivo .pub y ejecuta:
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..." >> ~/.ssh/authorized_keys

# Verificar
cat ~/.ssh/authorized_keys
```

Claves a agregar (contenidos de los archivos `.pub`):
- `~/.ssh/id_ed25519.pub`
- `~/.ssh/id_ed25519_server.pub`
- `~/.ssh/id_nemesis_server.pub`
- `~/.ssh/solaria-hetzner/id_solaria_hetzner_prod.pub`

### Opción 2: Ejecutar Script Manualmente

1. Conéctate al servidor con tu usuario/contraseña
2. Copia y pega el contenido de: `scripts/deploy-mcp-v2-final.sh`
3. Ejecuta el script

### Opción 3: Verificar Requisitos del Servidor

```bash
# Verificar que Node.js y Docker estén disponibles
node --version
npm --version
docker --version
docker-compose --version
```

---

## 📁 Archivos Listos para Deploy

**En tu máquina local:**

```
/Users/carlosjperez/Documents/GitHub/SOLARIA-DFO/
├── mcp-server/
│   ├── src/server-v2-minimal.ts        ✅ (compilable)
│   ├── tsconfig.build-v2.json           ✅
│   └── Dockerfile.minimal               ✅
├── docker-compose.mcp-v2-minimal.yml    ✅
├── scripts/deploy-mcp-v2-final.sh      ✅ (script completo)
├── DEPLOY-MANUAL-V2.md                 ✅ (instrucciones)
└── SSH-CONNECTION-ISSUE.md             ✅ (este archivo)
```

---

## 🎯 Contenido del Deployment Script

El script `scripts/deploy-mcp-v2-final.sh` crea estos archivos en el servidor:

1. **`src/server-v2-minimal.ts`** - Entry point minimalista
2. **`tsconfig.build-v2.json`** - Config exclusiva
3. **`Dockerfile.minimal`** - Multi-stage build
4. **`../docker-compose.mcp-v2-minimal.yml`** - Compose config

Luego ejecuta:
```bash
docker stop solaria-dfo-mcp-v2 && docker rm solaria-dfo-mcp-v2
docker-compose -f ../docker-compose.mcp-v2-minimal.yml build
docker-compose -f ../docker-compose.mcp-v2-minimal.yml up -d
```

---

## ✅ VERIFICACIÓN DE ÉXITO

Después de ejecutar el script, verifica:

```bash
# 1. Health check
curl -s http://148.230.118.124:3032/health

# 2. Contenedor debe estar activo
docker ps | grep solaria-dfo-mcp-v2-minimal

# 3. Logs sin reinicios infinitos
docker logs solaria-dfo-mcp-v2-minimal --tail 30

# 4. Monitor por 1 minuto para estabilidad
watch -n 10 'docker ps | grep solaria-dfo-mcp-v2-minimal'
```

---

## 📝 PRÓXIMOS PASOS DESPUÉS DEL DEPLOY

Una vez que el contenedor esté estable:

1. Integrar `handleGetContext` con Dashboard API real
2. Implementar `handleRunCode` con sandbox completo
3. Añadir templates para operaciones comunes (CRUD projects/tasks)
4. Testing exhaustivo de ambas herramientas
5. Documentar API en Swagger/OpenAPI
