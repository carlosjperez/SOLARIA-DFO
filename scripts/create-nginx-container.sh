#!/bin/bash
set -e
echo "======================================="
echo "  CREANDO CONTENEDOR NGINX DOCKER"
echo "======================================="
echo ""

# Detener contenedor existente si existe
if docker ps -a | grep -q "solaria-dfo-nginx"; then
    echo "Deteniendo contenedor existente..."
    docker stop solaria-dfo-nginx
    docker rm solaria-dfo-nginx
fi

# Crear nuevo contenedor
echo "Creando contenedor solaria-dfo-nginx..."
docker create \
  --name solaria-dfo-nginx \
  --network solaria-dfo-network \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /var/www/solaria-dfo/infrastructure/nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro \
  -v /var/www/solaria-dfo/dashboard/app/dist:/usr/share/nginx/v2:ro \
  -v /var/www/office-app:/var/www/office-app:ro \
  --restart unless-stopped \
  -e TZ=Europe/Madrid \
  nginx:alpine

echo "Iniciando contenedor..."
docker start solaria-dfo-nginx

# Esperar que inicie
echo "Esperando 5 segundos..."
sleep 5

# Verificar estado
if docker ps | grep -q "solaria-dfo-nginx.*Up"; then
    echo "✅ Contenedor NGINX iniciado exitosamente"
else
    echo "❌ Error al iniciar contenedor"
    docker logs solaria-dfo-nginx --tail 20
    exit 1
fi

# Verificar puertos
echo ""
echo "Puertos en escucha:"
netstat -tlnp | grep -E ":(80|443)" | head -5

echo ""
echo "======================================="
echo "  CONTENEDOR NGINX DOCKER CREADO"
echo "======================================="
