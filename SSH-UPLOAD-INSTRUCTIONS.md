# COMANDO PARA SUBIR Y EJECUTAR SCRIPT DE DEPLOYMENT
# ===========================================================

# Copia y pega este comando en tu terminal local para subir el script al servidor:

```bash
echo "Copiando archivo al servidor..."
cat /tmp/full-deploy-command.sh | ssh -i ~/.ssh/id_nemesis_server -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o ServerAliveInterval=5 -o ServerAliveCountMax=2 carlosjperez@148.230.118.124 'cat > /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh'
```

# Si eso no funciona (por permisos SSH), intenta con usuario root:

```bash
cat /tmp/full-deploy-command.sh | ssh -i ~/.ssh/id_nemesis_server -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 root@148.230.118.124 'cat > /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh'
```

# O usando openssl base64 (bypass de heredocs):

```bash
openssl base64 -in /tmp/full-deploy-command.sh | ssh -i ~/.ssh/id_nemesis_server -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 carlosjperez@148.230.118.124 'base64 -d > /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh'
```

# ===========================================================
# SI TODOS LOS COMANDOS SSH FALLAN (PERMISO DENEGADO)
# ===========================================================

# Opción 1: Usar SFTP/SCP con tu cliente favorito
# - Subir /tmp/full-deploy-command.sh a /var/www/solaria-dfo/mcp-server/
# - Ejecutar: chmod +x full-deploy-command.sh && ./full-deploy-command.sh

# Opción 2: Acceder al servidor manualmente
# - Abre una terminal SSH al servidor (con tu contraseña)
# - Copia y pega el contenido de /tmp/full-deploy-command.sh
# - Ejecuta el script

# Opción 3: Verificar autenticación SSH
# - Las claves están en: ~/.ssh/id_ed25519, id_ed25519_server, id_nemesis_server
# - Verificar que las claves públicas están en el servidor: ~/.ssh/authorized_keys
# - Si no, agregarlas: cat ~/.ssh/id_*.pub | ssh root@server 'cat >> ~/.ssh/authorized_keys'

# ===========================================================
# CONTENIDO DEL SCRIPT (/tmp/full-deploy-command.sh)
# ===========================================================

El script crea los siguientes archivos en el servidor:
- /var/www/solaria-dfo/mcp-server/src/server-v2-minimal.ts
- /var/www/solaria-dfo/mcp-server/tsconfig.build-v2.json
- /var/www/solaria-dfo/mcp-server/Dockerfile.minimal
- /var/www/solaria-dfo/docker-compose.mcp-v2-minimal.yml

Luego ejecuta:
1. docker stop solaria-dfo-mcp-v2 && docker rm solaria-dfo-mcp-v2
2. docker-compose -f docker-compose.mcp-v2-minimal.yml build
3. docker-compose -f docker-compose.mcp-v2-minimal.yml up -d
4. curl http://localhost:3032/health
5. docker logs solaria-dfo-mcp-v2-minimal
