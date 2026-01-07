# Nginx Reverse Proxy - MCP v2.0 Integration

**Fecha:** 2026-01-07
**Servidor:** 148.230.118.124 (SOLARIA DFO)

---

## 🎯 Problema Resuelto

### Síntoma
Endpoint `/mcp-v2` retornaba `404 Not Found` cuando accedido vía HTTPS proxy nginx:
```bash
curl https://dfo.solaria.agency/mcp-v2/health
# → 404 Not Found
# → Error HTML: "Cannot GET /mcp-v2/health"
```

### Diagnóstico
- ✅ Contenedor MCP v2.0 funcionaba correctamente en puerto 3032
- ✅ Nginx podía conectar al contenedor mcp-v2 (DNS resolución OK)
- ✅ Configuración nginx tenía `location /mcp-v2` definida
- ❌ Nginx no estaba usando este location block para requests `/mcp-v2/*`

**Causa Raíz:**
```nginx
# ❌ INCORRECTO - Sin trailing slash
location /mcp-v2 {
    proxy_pass http://mcp_v2;
}
# Resultado: nginx APPENDE el URI completo al upstream
# Request: /mcp-v2/health
# Proxy: http://mcp_v2/mcp-v2/health (404 en contenedor)
```

---

## ✅ Solución Implementada

### Configuración Correcta
```nginx
# ✅ CORRECTO - Con trailing slash
location /mcp-v2/ {
    proxy_pass http://mcp_v2/;
}
# Resultado: nginx REEMPLAZA la parte coincidente del URI
# Request: /mcp-v2/health
# Proxy: http://mcp_v2/health (200 OK)
```

### Reglas de Nginx proxy_pass
1. **Sin slash:** nginx APPENDE el request URI al upstream
   ```nginx
   location /api {
       proxy_pass http://backend;  # → http://backend/users/1
   }
   ```

2. **Con slash:** nginx REEMPLAZA la parte coincidente del URI
   ```nginx
   location /api/ {
       proxy_pass http://backend/;  # → http://backend/users/1
   }
   ```

---

## 🔧 Configuración Final

### Archivo: `/var/www/solaria-dfo/infrastructure/nginx/nginx.mcp-v2.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/json application/xml;

    upstream dashboard {
        server solaria-dfo-office:3030;
    }

    upstream mcp_v2 {
        server solaria-dfo-mcp-v2-minimal:3032;
    }

    server {
        listen 80;
        server_name localhost 127.0.0.1;

        location /health {
            access_log off;
            return 200 'healthy';
            add_header Content-Type text/plain;
        }
    }

    server {
        listen 80;
        server_name dfo.solaria.agency;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        http2 on;
        server_name dfo.solaria.agency;

        ssl_certificate /etc/letsencrypt/live/dfo.solaria.agency/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/dfo.solaria.agency/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location /api/ {
            proxy_pass http://dashboard/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Authorization $http_authorization;
        }

        location /socket.io/ {
            proxy_pass http://dashboard/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400s;
        }

        location /mcp-v2/ {
            proxy_pass http://mcp_v2/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Mcp-Session-Id $http_mcp_session_id;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location / {
            proxy_pass http://dashboard;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            access_log off;
            return 200 "OK";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 📊 Verificación de Funcionamiento

### Health Checks
```bash
# MCP v2.0 via HTTPS (nginx proxy)
curl -s https://dfo.solaria.agency/mcp-v2/health
# → {"status":"ok","version":"2.0-minimal","mode":"minimal"}

# Directo al contenedor
ssh root@148.230.118.124 "curl -s http://localhost:3032/health"
# → {"status":"ok","version":"2.0-minimal","mode":"minimal"}

# Dashboard API
curl -s https://dfo.solaria.agency/api/health
# → {"status":"healthy","database":"connected","redis":"connected"}
```

### Contenedores Activos
```bash
solaria-dfo-office         - Up 3 days    - Port 3030
solaria-dfo-mcp-v2-minimal - Up 1h+      - Port 3032
solaria-dfo-nginx          - Up stable   - Ports 80, 443
```

---

## 🚀 Script de Restart

### Archivo: `/var/www/solaria-dfo/scripts/restart-nginx.sh`

```bash
#!/bin/bash
set -e

echo "🔄 Restarting nginx with MCP v2.0 configuration..."

docker stop solaria-dfo-nginx || true
docker rm solaria-dfo-nginx || true

docker run -d --name solaria-dfo-nginx --network solaria-network \
  -p 80:80 -p 443:443 \
  -v /var/www/solaria-dfo/infrastructure/nginx/nginx.mcp-v2.conf:/etc/nginx/nginx.conf:ro \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  nginx:stable-alpine

echo "✅ Nginx restarted. Waiting for health check..."
sleep 3

# Test health
if curl -sf http://localhost/health > /dev/null; then
  echo "✅ Nginx is healthy"
else
  echo "❌ Nginx health check failed"
  docker logs solaria-dfo-nginx --tail 20
  exit 1
fi

# Test MCP v2.0
if curl -sf https://dfo.solaria.agency/mcp-v2/health > /dev/null; then
  echo "✅ MCP v2.0 endpoint is accessible"
else
  echo "❌ MCP v2.0 endpoint failed"
  exit 1
fi

# Test API
if curl -sf https://dfo.solaria.agency/api/health > /dev/null; then
  echo "✅ API endpoint is accessible"
else
  echo "❌ API endpoint failed"
  exit 1
fi

echo "🎉 All endpoints are functional!"
```

---

## 📚 Referencias

- [Nginx Documentation - proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [Understanding proxy_pass with/without trailing slash](https://serverfault.com/questions/579385/nginx-proxy-pass-examples-with-and-without-trailing-slash)
- [SOLARIA DFO - MCP v2.0 Deployment](./MCP-V2-DEPLOYMENT-COMPLETE.md)
- [SOLARIA DFO - Server Credentials](./SERVER-CREDENTIALS.md)

---

**Status:** ✅ Nginx reverse proxy MCP v2.0 COMPLETADO Y VERIFICADO
**Última actualización:** 2026-01-07 17:20 UTC
