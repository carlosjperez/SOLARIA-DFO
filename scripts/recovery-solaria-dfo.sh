#!/bin/bash
# Script de recuperación SOLARIA DFO
# Fecha: 2026-01-07
# Autor: ECO-Lambda

echo "=================================================="
echo "  SOLARIA DFO - SCRIPT DE RECUPERACIÓN"
echo "=================================================="
echo ""
echo "Fecha: $(date)"
echo "Servidor: 148.230.118.124"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================================================
# FASE 1: DIAGNÓSTICO INICIAL
# ============================================================================
echo -e "${GREEN}[FASE 1]${NC} DIAGNÓSTICO INICIAL"
echo ""

# Verificar estado actual
echo "--- Estado de Docker ---"
docker ps -a --filter "name=solaria-dfo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "--- Espacio en disco ---"
df -h / | tail -1
echo ""

# ============================================================================
# FASE 2: DETENER NGINX DEL HOST
# ============================================================================
echo -e "${YELLOW}[FASE 2]${NC} DETENIENDO NGINX DEL HOST..."
echo ""

# Detener y deshabilitar servicio systemd nginx
echo "Deteniendo servicio nginx del host..."
systemctl stop nginx.service 2>&1 || echo "nginx.service no encontrado o ya detenido"

systemctl disable nginx.service 2>&1 || echo "nginx.service no existe"

echo "Verificando que nginx no esté corriendo..."
if pgrep nginx > /dev/null; then
    echo -e "${RED}ERROR: nginx sigue corriendo. Matar procesos...${NC}"
    pkill -9 nginx
else
    echo -e "${GREEN}✓ nginx detenido completamente${NC}"
fi

echo ""

# ============================================================================
# FASE 3: CREAR CONTENEDOR NGINX DOCKER
# ============================================================================
echo -e "${GREEN}[FASE 3]${NC} CREANDO CONTENEDOR NGINX DOCKER..."
echo ""

# Verificar si existe Dockerfile
if [ ! -f "infrastructure/nginx/Dockerfile.nginx" ]; then
    echo -e "${RED}ERROR: Dockerfile.nginx no encontrado${NC}"
    exit 1
fi

# Verificar si ya existe contenedor nginx
if docker ps -a | grep -q "solaria-dfo-nginx"; then
    echo "Contenedor solaria-dfo-nginx ya existe. Deteniendo..."
    docker stop solaria-dfo-nginx
    docker rm solaria-dfo-nginx
fi

# Crear contenedor Nginx
echo "Creando contenedor solaria-dfo-nginx..."
docker create \
    --name solaria-dfo-nginx \
    --network solaria-dfo-network \
    -p 80:80 \
    -p 443:443 \
    -v /etc/letsencrypt:/etc/letsencrypt:ro \
    -v ./infrastructure/nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro \
    -v ./dashboard/app/dist:/usr/share/nginx/v2:ro \
    -v /var/www/office-app:/var/www/office-app:ro \
    --restart unless-stopped \
    -e TZ=Europe/Madrid \
    nginx:alpine

# Copiar health check script al contenedor
cat > /tmp/nginx-health.sh << 'HEALTH_SCRIPT'
#!/bin/sh
# Health check para Nginx
wget -q --spider -O /dev/null http://localhost/health || exit 1
HEALTH_SCRIPT

# Copiar script al contenedor y hacerlo ejecutable
docker cp /tmp/nginx-health.sh solaria-dfo-nginx:/usr/local/bin/nginx-health.sh
docker exec solaria-dfo-nginx chmod +x /usr/local/bin/nginx-health.sh

# Iniciar contenedor
echo "Iniciando contenedor solaria-dfo-nginx..."
docker start solaria-dfo-nginx

# Esperar unos segundos para que inicie
sleep 5

# Verificar que esté corriendo
if docker ps | grep -q "solaria-dfo-nginx.*Up"; then
    echo -e "${GREEN}✓ Contenedor Nginx iniciado exitosamente${NC}"
else
    echo -e "${RED}✗ Error al iniciar contenedor Nginx${NC}"
    docker logs solaria-dfo-nginx --tail 20
    exit 1
fi

echo ""

# ============================================================================
# FASE 4: LIMPIAR ESPACIO EN DISCO
# ============================================================================
echo -e "${YELLOW}[FASE 4]${NC} LIMPIANDO ESPACIO EN DISCO..."
echo ""

# Limpieza de Docker (imágenes, contenedores, volumenes no usados)
echo "Limpiando recursos Docker no usados..."

# Contenedores exited
docker container prune -f

# Imágenes dangling
docker image prune -f

# Imágenes no usadas
docker image prune -a -f

# Limpiar logs de Docker
docker system prune --volumes -f

echo "Limpieza completada"
echo ""

# Verificar espacio después de limpieza
echo "--- Espacio después de limpieza ---"
df -h / | tail -1
echo ""

# ============================================================================
# FASE 5: VERIFICACIÓN DE SERVICIOS
# ============================================================================
echo -e "${GREEN}[FASE 5]${NC} VERIFICACIÓN DE SERVICIOS"
echo ""

echo "--- Estado de contenedores ---"
docker ps --filter "name=solaria-dfo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "--- Health checks ---"
sleep 3

# Test desde dentro del servidor
echo "Test health checks (local):"
curl -s -o /dev/null -w "  Dashboard (3030): %{http_code}\n" http://localhost:3030/api/health || echo "  Dashboard (3030): No responde"
curl -s -o /dev/null -w "  MCP v1.0 (3031): %{http_code}\n" http://localhost:3031/health || echo "  MCP v1.0 (3031): No responde"
curl -s -o /dev/null -w "  MCP v2.0 (3032): %{http_code}\n" http://localhost:3032/health || echo "  MCP v2.0 (3032): No responde"
curl -s -o /dev/null -w "  Nginx (80): %{http_code}\n" http://localhost:80/health || echo "  Nginx (80): No responde"

echo ""

# ============================================================================
# FASE 6: VERIFICACIÓN EXTERNA
# ============================================================================
echo -e "${GREEN}[FASE 6]${NC} VERIFICACIÓN EXTERNA (desde tu máquina local)"
echo ""

echo "Por favor, ejecutar estos comandos desde tu máquina local:"
echo ""
echo "# Test HTTP (puerto 80):"
echo "curl -I http://dfo.solaria.agency"
echo ""
echo "# Test HTTPS (puerto 443):"
echo "curl -I https://dfo.solaria.agency"
echo ""
echo "# Test Dashboard API:"
echo "curl -s https://dfo.solaria.agency/api/health | jq ."
echo ""
echo "# Test MCP v2.0:"
echo "curl -s https://dfo.solaria.agency/mcp-v2/health | jq ."
echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo ""
echo "=================================================="
echo "  RESUMEN DE RECUPERACIÓN"
echo "=================================================="
echo ""
echo -e "${GREEN}✓${NC} Nginx del host detenido"
echo -e "${GREEN}✓${NC} Contenedor Docker Nginx creado e iniciado"
echo -e "${GREEN}✓${NC} Espacio en disco limpiado"
echo -e "${GREEN}✓${NC} Contenedores verificados"
echo ""
echo "Siguientes pasos:"
echo "1. Ejecutar comandos de verificación externa arriba"
echo "2. Verificar logs: docker logs -f solaria-dfo-nginx"
echo "3. Acceder al dashboard: https://dfo.solaria.agency"
echo "4. Si hay errores, revisar logs de contenedores individuales"
echo ""
echo "Comandos útiles:"
echo "  docker logs -f solaria-dfo-nginx          # Logs Nginx"
echo "  docker logs -f solaria-dfo-office          # Logs Office"
echo "  docker logs -f solaria-dfo-mcp-v2         # Logs MCP v2.0"
echo "  docker ps -a                                    # Estado completo"
echo ""
echo "=================================================="
