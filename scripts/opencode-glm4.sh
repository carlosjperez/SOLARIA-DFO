#!/bin/bash
# opencode-glm4.sh - Ejecuta opencode con GLM-4 directamente

set -e

# Ejecutar opencode con el modelo GLM-4
claude --model "$MODEL" -p "$(cat "$PROMPT_FILE")" --stream

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función de logging
log() {
    local level=$1
    shift
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${GREEN}[${timestamp}]${NC} [${level}] $@"
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    log "ERROR" "Uso: $0 <task_id>"
    log "INFO" "Ejemplo: $0 US-003"
    log "INFO" "Tasks disponibles:"
    echo "  - US-003: Implement Stats Dashboard Endpoint"
    echo "  - US-004: Fix Inline Documents Endpoint"
    echo "  - US-005: Add Task Codes to Notifications"
    echo "  - US-006: Standardize ProjectsPage with Metrics"
    exit 1
fi

TASK_ID=$1
PROMPT_FILE="${PROMPTS_DIR}/${TASK_ID}.txt"

# Verificar que existe el archivo de prompt
if [ ! -f "$PROMPT_FILE" ]; then
    log "ERROR" "Prompt file no encontrado: $PROMPT_FILE"
    exit 1
fi

log "INFO" "=========================================="
log "INFO" "Opencode GLM-4 Task Executor"
log "INFO" "=========================================="
log "INFO" "Task ID: $TASK_ID"
log "INFO" "Model: $MODEL"
log "INFO" "Prompt File: $PROMPT_FILE"
log "INFO" "----------------------------------------"

# Crear directorio de logs si no existe
mkdir -p "$LOGS_DIR"

# Ejecutar opencode con el modelo GLM-4
log "INFO" "Ejecutando opencode con modelo $MODEL..."

claude \
    --model "$MODEL" \
    -p "$(cat "$PROMPT_FILE")" \
    --max-tokens "$MAX_TOKENS"

CLAUDE_EXIT_CODE=$?

log "INFO" "----------------------------------------"

if [ $CLAUDE_EXIT_CODE -eq 0 ]; then
    log "SUCCESS" "Tarea $TASK_ID completada exitosamente"
else
    log "ERROR" "Tarea $TASK_ID falló con código de salida: $CLAUDE_EXIT_CODE"
    exit $CLAUDE_EXIT_CODE
fi
