#!/bin/bash
#
# DFO - Local Memory Detection Script
#
# Detects if claude-mem is installed and provides detailed status
# Used by MCP server to check agent local memory status
#
# Author: ECO-Lambda | SOLARIA DFO
# Date: 2026-01-06
# Task: MEM-005
#

set -euo pipefail

# Configuration
CLAUDE_MEM_DIR="$HOME/.claude-mem"
CLAUDE_MEM_DB="$CLAUDE_MEM_DIR/claude-mem.db"
PLUGIN_DIR="$HOME/.claude/plugins/marketplaces/thedotmack"
WORKER_URL="http://localhost:37777/health"
AGENT_ID="${1:-unknown}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detection functions
detect_database() {
    if [ -f "$CLAUDE_MEM_DB" ]; then
        echo -n "true"
        return 0
    else
        echo -n "false"
        return 1
    fi
}

detect_worker_running() {
    if command -v curl &>/dev/null; then
        local health=$(curl -s --max-time 1 --fail "$WORKER_URL" 2>/dev/null || echo "")
        if [[ "$health" == *"status"* ]]; then
            echo -n "true"
            return 0
        fi
    fi
    echo -n "false"
    return 1
}

detect_plugin_installed() {
    if [ -d "$PLUGIN_DIR/claude-mem" ]; then
        echo -n "true"
        return 0
    else
        echo -n "false"
        return 1
    fi
}

detect_version() {
    if [ -f "$CLAUDE_MEM_DIR/package.json" ]; then
        local version=$(grep -o '"version"[^,]*' "$CLAUDE_MEM_DIR/package.json" | cut -d'"' -f4)
        echo -n "${version:-unknown}"
        return 0
    else
        echo -n "unknown"
        return 1
    fi
}

detect_os() {
    echo -n "$(uname -s)"
}

detect_node_version() {
    if command -v node &>/dev/null; then
        echo -n "$(node -v 2>/dev/null || echo "not installed")"
    else
        echo -n "not installed"
    fi
}

detect_claude_code() {
    if command -v code &>/dev/null; then
        echo -n "$(code -v 2>/dev/null || echo "not installed")"
    else
        echo -n "not installed"
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
    local is_installed
    local detection_time

    # Run all detections (fast, non-blocking)
    db_exists=$(detect_database)
    worker_running=$(detect_worker_running)
    plugin_installed=$(detect_plugin_installed)
    version=$(detect_version)
    os_type=$(detect_os)
    node_version=$(detect_node_version)
    claude_version=$(detect_claude_code)

    # Determine if installed
    # Installed if: DB exists OR plugin directory exists
    if [ "$db_exists" = "true" ] || [ "$plugin_installed" = "true" ]; then
        is_installed="true"
    else
        is_installed="false"
    fi

    # Get current timestamp
    detection_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Build JSON output
    cat <<EOF
{
  "installed": ${is_installed},
  "version": "${version}",
  "os": "${os_type}",
  "node_version": "${node_version}",
  "claude_code_version": "${claude_version}",
  "status": {
    "database_exists": ${db_exists},
    "worker_running": ${worker_running},
    "plugin_installed": ${plugin_installed}
  },
  "detection_time": "${detection_time}",
  "agent_id": "${AGENT_ID}"
}
EOF
}

# Execute main function
main
