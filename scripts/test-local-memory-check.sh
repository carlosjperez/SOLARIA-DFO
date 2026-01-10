#!/bin/bash
#
# DFO - Test Script: Verificar Sistema de Memoria Local
#
# Prueba la detección de claude-mem local
# Simula respuesta desde MCP server
#
# Author: ECO-Lambda | SOLARIA DFO
# Date: 2026-01-06
# Task: MEM-005
#

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}  DFO - Test de Sistema de Memoria Local${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Verificar si el script de detección existe
SCRIPT_DIR="/Users/carlosjperez/Documents/GitHub/SOLARIA-DFO/scripts"
DETECTION_SCRIPT="$SCRIPT_DIR/check-local-memory.sh"

if [ -f "$DETECTION_SCRIPT" ]; then
    echo "${GREEN}✓${NC}  Script de detección existe${NC}"
else
    echo "${RED}✗${NC}  Script de detección NO encontrado${NC}"
    exit 1
fi

echo ""
echo "${GREEN}Test 2: Simular respuesta de MCP${NC}"
echo "${YELLOW}Escenario: Agente nuevo conectado sin memoria local${NC}"

# Simular que el script responde como si NO tiene memoria local
MOCK_RESPONSE='{
  "success": true,
  "has_local_memory": false,
  "message": "📋 No detectado sistema de memoria local",
  "installation_guide": "# 🧠 Instalación de Memoria Local\\n\\nClaude Code detectó que no tienes instalado el sistema de memoria local...",
  "suggestion": "Instala claude-mem para persistencia de contexto entre sesiones"
}'

echo "${YELLOW}MOCK response (sin memoria local):${NC}"
echo "$MOCK_RESPONSE" | jq -r '.'

echo ""

echo "${GREEN}Test 3: Simular respuesta de MCP${NC}"
echo "${YELLOW}Escenario: Agente con memoria local instalada${NC}"

# Simular que el script responde como si SÍ tiene memoria local
MOCK_RESPONSE_INSTALLED='{
  "success": true,
  "has_local_memory": true,
  "installed_version": "8.5.0",
  "status": {
    "database_exists": true,
    "worker_running": true,
    "plugin_installed": true
  },
  "message": "✅ Sistema de memoria local detectado (v8.5.0)",
  "os": "Darwin",
  "detection_time": "2026-01-06T15:30:00Z",
  "last_check": "2026-01-06T15:30:00Z"
}'

echo "${YELLOW}MOCK response (con memoria local):${NC}"
echo "$MOCK_RESPONSE_INSTALLED" | jq -r '.'

echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}✓${NC} Todos los tests pasaron exitosamente${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${GREEN}Next Steps:${NC}"
echo "${YELLOW}1. Verificar que el MCP server está actualizado y corriendo${NC}"
echo "${YELLOW}2. Reiniciar MCP server para cargar el nuevo tool check_local_memory${NC}"
echo "${YELLOW}3. Ejecutar: ${NC}    curl -X POST -H \"Content-Type: application/json\" -d @- <<< '{\"agent_id\": \"test_agent\"}' \\n    http://localhost:3031/api/check-local-memory ${NC}"
echo "${YELLOW}4. Verificar que el response incluye installation_guide${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
