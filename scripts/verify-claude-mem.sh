#!/bin/bash
#
# DFO - Script de Verificación de Memoria Local
#
# Verifica si claude-mem está instalado y funciona correctamente
# Si no, proporciona instrucciones paso a paso para instalación
#
# Author: ECO-Lambda | SOLARIA DFO
# Date: 2026-01-06
# Task: MEM-005
#

set -euo pipefail

# Configuration
CLAUDE_MEM_DIR="$HOME/.claude-mem"
CLAUDE_MEM_DB="$CLAUDE_MEM_DIR/claude-mem.db"
WORKER_PORT=37777
DFO_SERVER_URL="http://localhost:3031/api"  # MCP server para testing

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
check_claude_mem_installed() {
    if [ -d "$CLAUDE_MEM_DIR" ]; then
        return 0
    else
        return 1
    fi
}

check_worker_running() {
    if command -v curl &>/dev/null; then
        local health=$(curl -s --max-time 1 "$WORKER_PORT/health" 2>/dev/null || echo "")
        if [[ "$health" == *"status"* ]]; then
            return 0
        else
            return 1
        fi
    else
        return 0
    fi
}

check_database_exists() {
    if [ -f "$CLAUDE_MEM_DB" ]; then
        return 0
    else
        return 1
    fi
}

check_plugin_installed() {
    local plugin_path="$CLAUDE_MEM_DIR/plugins/marketplaces/thedotmack/claude-mem"
    if [ -d "$plugin_path" ]; then
        return 0
    else
        return 1
    fi
}

get_version() {
    if [ -f "$CLAUDE_MEM_DIR/package.json" ]; then
        local version=$(grep -o '"version"[^,]*' "$CLAUDE_MEM_DIR/package.json" 2>/dev/null | cut -d'"' -f4 | cut -d'\'')
        echo "$version"
    else
        echo "unknown"
    fi
}

detect_os() {
    uname -s
}

detect_node_version() {
    if command -v node &>/dev/null; then
        node -v 2>/dev/null || echo "not installed"
    else
        echo "not installed"
    fi
}

detect_claude_code() {
    if command -v code &>/dev/null; then
        code -v 2>/dev/null || echo "not installed"
    else
        echo "not installed"
    fi
}

# Main detection logic
main() {
    local db_exists
    local worker_running
    local plugin_installed
    local version
    local os_type
    local node_version
    local claude_version
    local is_installed=0

    # Run detections
    db_exists=$(check_database_exists)
    worker_running=$(check_worker_running)
    plugin_installed=$(check_plugin_installed)
    version=$(get_version)
    os_type=$(detect_os)
    node_version=$(detect_node_version)
    claude_version=$(detect_claude_code)

    # Determine if installed
    # Installed if: DB exists OR plugin directory exists
    if [ "$db_exists" = "0" ] || [ "$plugin_installed" = "0" ]; then
        is_installed=1
    fi

    # Get current timestamp
    local detection_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Build JSON output
    cat <<EOF
{
  "installed": ${is_installed},
  "version": "${version}",
  "os": "${os_type}",
  "node_version": "${node_version}",
  "claude_code_version": "${claude_version}",
  "status": {
    "database_exists": $db_exists,
    "worker_running": $worker_running,
    "plugin_installed": $plugin_installed
  },
  "detection_time": "${detection_time}",
  "agent_id": "${AGENT_ID:-unknown}"
}
EOF
}