# DFO Sync Agent - Local Memory Synchronization

Sincroniza observaciones de claude-mem (SQLite local) con el servidor central DFO.

## Requisitos

- Python 3.7+
- claude-mem instalado en `~/.claude-mem/`
- Acceso al servidor DFO (https://dfo.solaria.agency)

## Instalación

### 1. Configurar Variables de Entorno

```bash
export DFO_SERVER_URL="https://dfo.solaria.agency/mcp"
export DFO_API_URL="https://dfo.solaria.agency/api"
export DFO_USERNAME="carlosjperez"
export DFO_PASSWORD="bypass"
```

O añadir a `~/.bashrc` o `~/.zshrc`:

```bash
echo 'export DFO_SERVER_URL="https://dfo.solaria.agency/mcp"' >> ~/.bashrc
echo 'export DFO_API_URL="https://dfo.solaria.agency/api"' >> ~/.bashrc
echo 'export DFO_USERNAME="carlosjperez"' >> ~/.bashrc
echo 'export DFO_PASSWORD="bypass"' >> ~/.bashrc
source ~/.bashrc
```

### 2. Verificar Instalación

```bash
python3 scripts/dfo-sync-agent.py --help
```

Deberías ver la ayuda del script.

## Uso

### Modo Manual (Una sincronización)

```bash
# Sync normal (solo cambios desde último sync)
python3 scripts/dfo-sync-agent.py --once

# Forzar sync completo (todas las observaciones)
python3 scripts/dfo-sync-agent.py --force
```

### Modo Daemon (Sincronización automática)

```bash
# Sync cada 1 hora (default)
python3 scripts/dfo-sync-agent.py

# Sync cada 30 minutos
python3 scripts/dfo-sync-agent.py --interval 1800

# Sync cada 10 minutos
python3 scripts/dfo-sync-agent.py --interval 600
```

### Detener Daemon

Presiona `Ctrl+C` para detener el daemon.

## Configuración Automática (macOS/Linux)

### Crear Launchd Service (macOS)

```bash
# Crear archivo de configuración
cat > ~/Library/LaunchAgents/com.solaria.dfo-sync.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.solaria.dfo-sync</string>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/python3</string>
      <string>$(HOME)/Documents/GitHub/SOLARIA-DFO/scripts/dfo-sync-agent.py</string>
      <string>--interval</string>
      <string>3600</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/dfo-sync.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/dfo-sync-error.log</string>
  </dict>
</plist>
EOF

# Cargar servicio
launchctl load ~/Library/LaunchAgents/com.solaria.dfo-sync.plist

# Iniciar servicio
launchctl start com.solaria.dfo-sync
```

### Crear Systemd Service (Linux)

```bash
sudo cat > /etc/systemd/system/dfo-sync.service << 'EOF'
[Unit]
Description=DFO Memory Sync Agent
After=network.target

[Service]
Type=simple
User=carlosjperez
WorkingDirectory=/home/carlosjperez/Documents/GitHub/SOLARIA-DFO
Environment="DFO_SERVER_URL=https://dfo.solaria.agency/mcp"
Environment="DFO_API_URL=https://dfo.solaria.agency/api"
Environment="DFO_USERNAME=carlosjperez"
Environment="DFO_PASSWORD=bypass"
ExecStart=/usr/bin/python3 /home/carlosjperez/Documents/GitHub/SOLARIA-DFO/scripts/dfo-sync-agent.py --interval 3600
Restart=on-failure
RestartSec=60

[Install]
WantedBy=multi-user.target
EOF

# Recargar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar
sudo systemctl enable dfo-sync
sudo systemctl start dfo-sync
```

## Funcionamiento

### Flujo de Sincronización

```
1. Agente lee claude-mem.db (~/.claude-mem/claude-mem.db)
   ↓
2. Obtiene último sync de sync_metadata
   ↓
3. Busca observaciones nuevas (WHERE created_at > last_sync)
   ↓
4. Autentica con DFO Server
   ↓
5. POST /memory/sync con batch de observaciones
   ↓
6. DFO Server almacena en PostgreSQL
   ↓
7. Agente actualiza last_sync_time
   ↓
8. Repite cada X minutos
```

### Manejo de Errores

- **Error de autenticación**: Reintenta en 60s
- **Error de red**: Reintenta en 60s
- **Timeout de servidor**: Reintenta en 60s
- **Error de validación**: Muestra error y para

### Logs

```
STDOUT: Progress y éxito
STDERR: Errores y warnings
```

Logs de launchd/systemd:
- macOS: `/tmp/dfo-sync.log` y `/tmp/dfo-sync-error.log`
- Linux: `journalctl -u dfo-sync -f`

## Ejemplos de Uso

### Caso 1: Desarrollador que trabaja activamente

```bash
# Iniciar daemon al iniciar trabajo
python3 scripts/dfo-sync-agent.py --interval 1800

# Trabajar en proyecto...
# Daemon hace sync cada 30 min automáticamente
```

### Caso 2: Cambio de máquina

```bash
# Forzar sync completo al cambiar de computadora
python3 scripts/dfo-sync-agent.py --force --once
```

### Caso 3: Depuración

```bash
# Verbose mode para ver detalles
python3 scripts/dfo-sync-agent.py --verbose --once
```

## Arquitectura

```
┌─────────────────────────────────────┐
│  Claude-mem (Edge)              │
│  - claude-mem.db (SQLite)        │
│  - observations table             │
│  - summaries table               │
└──────────────┬──────────────────┘
               ↓ Python Script
┌─────────────────────────────────────┐
│  DFO Sync Agent                  │
│  - Lee SQLite                   │
│  - Detecta cambios             │
│  - Autentica con DFO          │
│  - HTTP POST /memory/sync       │
└──────────────┬──────────────────┘
               ↓ HTTPS
┌─────────────────────────────────────┐
│  DFO Server (Cloud)              │
│  - PostgreSQL                    │
│  - memory_observations_remote    │
│  - memory_summaries_remote       │
│  - memory_sync_log              │
└─────────────────────────────────────┘
```

## Troubleshooting

### El daemon no inicia

```bash
# Verificar permisos
ls -la scripts/dfo-sync-agent.py

# Verificar Python
python3 --version  # Debe ser >= 3.7

# Verificar variables de entorno
echo $DFO_USERNAME
echo $DFO_SERVER_URL
```

### Error de autenticación

```bash
# Verificar credenciales
curl -X POST https://dfo.solaria.agency/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"carlosjperez","password":"bypass"}'
```

### claude-mem.db no encontrado

```bash
# Verificar instalación de claude-mem
ls -la ~/.claude-mem/

# Si no existe, instalar via:
# /plugin marketplace add thedotmack/claude-mem
# /plugin install claude-mem
```

### Sync muy lento

```bash
# Reducir batch size en el script
# Editar scripts/dfo-sync-agent.py:
# LIMIT 1000 → LIMIT 500
```

## Métricas de Rendimiento

Observaciones típicas:
- Small sync (<100 obs): <5s
- Medium sync (100-1000 obs): <30s
- Large sync (>1000 obs): <2min

Uso de memoria:
- Python: ~50MB
- SQLite reader: ~5MB
- Network: ~10MB (batch 1000 obs)

## Actualización

Para actualizar el agente:

```bash
# 1. Pull últimos cambios
git pull origin main

# 2. Reiniciar daemon
launchctl restart com.solaria.dfo-sync  # macOS
sudo systemctl restart dfo-sync         # Linux
```

## Licencia

MIT - SOLARIA AGENCY

## Soporte

Para problemas o preguntas:
- Issue tracker: https://github.com/SOLARIA-AGENCY/solaria-digital-field--operations/issues
- Documentation: docs/MEMORY-SYSTEM-HYBRIDA-SPEC.md
