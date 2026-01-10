#!/bin/bash

# Configurar API privada GLM-4.7 con coding plan de z.ai
# Este script configura opencode.json y oh-my-opencode.json

set -e

OPENCODE_CONFIG="$HOME/.config/opencode/opencode.json"
OMO_CONFIG="$HOME/.config/opencode/oh-my-opencode.json"

echo "=============================================="
echo "  Configuración GLM-4.7 con Z.AI API"
echo "=============================================="
echo ""

# Verificar API key
if [ -z "$ZAI_API_KEY" ]; then
    echo "ADVERTENCIA: ZAI_API_KEY no está definida en variables de entorno"
    echo "Debes editar opencode.json manualmente y agregar tu API key:"
    echo '  "apiKey": "TU_API_KEY_AQUI"'
    echo ""
fi

# Función para crear backup
backup_file() {
    local filepath="$1"
    if [ ! -f "$filepath" ]; then
        echo "ERROR: Archivo no existe: $filepath"
        exit 1
    fi
    local backup_path="${filepath}.backup-$(date +%s%N)"
    cp "$filepath" "$backup_path"
    echo "Backup creado: $backup_path"
}

# Función para actualizar opencode.json
update_opencode_config() {
    echo ""
    echo "Actualizando opencode.json..."

    backup_file "$OPENCODE_CONFIG"

    # Agregar proveedor zai usando jq si existe
    if command -v jq >/dev/null 2>&1; then
        # jq disponible - usarlo
        if ! jq -e '.provider.zai' "$OPENCODE_CONFIG" >/dev/null 2>&1; then
            echo "Agregando proveedor Z.AI a opencode.json..."
            jq '
                .provider.zai = {
                    "name": "Z.AI",
                    "baseURL": "https://api.z.ai/v1",
                    "apiKey": "'"'"$ZAI_API_KEY"'"'",
                    "models": {
                        "glm-4.7-coding-plan": {
                            "name": "GLM 4.7 Coding Plan (Z.AI)",
                            "limit": {
                                "context": 131072,
                                "output": 65536
                            },
                            "modalities": {
                                "input": ["text"],
                                "output": ["text"]
                            }
                        },
                        "glm-4.7": {
                            "name": "GLM 4.7 (Z.AI)",
                            "limit": {
                                "context": 131072,
                                "output": 65536
                            },
                            "modalities": {
                                "input": ["text"],
                                "output": ["text"]
                            }
                        }
                    }
                }
            ' "$OPENCODE_CONFIG" > "$OPENCODE_CONFIG.tmp"
            mv "$OPENCODE_CONFIG.tmp" "$OPENCODE_CONFIG"
            echo "Proveedor Z.AI agregado a opencode.json"
        else
            echo "Proveedor Z.AI ya existe en opencode.json"
        fi
    else
        echo "ERROR: jq no está instalado. Por favor instala: brew install jq"
        exit 1
    fi

    echo "opencode.json actualizado"
    echo ""
}

# Función para actualizar oh-my-opencode.json
update_omo_config() {
    echo "Actualizando oh-my-opencode.json..."

    if [ -f "$OMO_CONFIG" ]; then
        backup_file "$OMO_CONFIG"
    fi

    # Crear/actualizar configuración de agentes
    cat > "$OMO_CONFIG.tmp" << 'EOF'
{
  "agents": {
    "Sisyphus": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.1
    },
    "OpenCode-Builder": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.3
    },
    "Planner-Sisyphus": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.2
    },
    "oracle": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.1
    },
    "librarian": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.1
    },
    "explore": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.2
    },
    "frontend-ui-ux-engineer": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.3
    },
    "document-writer": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.2
    },
    "multimodal-looker": {
      "model": "zai/glm-4.7-coding-plan",
      "temperature": 0.2
    }
  },
  "google_auth": false,
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json"
}
EOF

    mv "$OMO_CONFIG.tmp" "$OMO_CONFIG"
    echo "oh-my-opencode.json actualizado"
    echo ""
}

# Ejecutar actualizaciones
trap 'echo ""; echo "ERROR: Restaurando backups..."; backup_dir="$HOME/.config/opencode"; latest_backup=$(ls -t "$backup_dir"/opencode.json.backup-* 2>/dev/null | head -1); if [ -n "$latest_backup" ]; then cp "$backup_dir/$latest_backup" "$OPENCODE_CONFIG"; echo "Backup restaurado: $latest_backup"; fi; exit 1' ERR

update_opencode_config
update_omo_config

echo "=============================================="
echo "  Configuración completada correctamente"
echo "=============================================="
echo ""
echo "Próximos pasos:"
echo "1. Exporta tu API key: export ZAI_API_KEY='tu_key_aqui'"
echo "2. Si la URL es diferente a https://api.z.ai/v1, edítalo en opencode.json"
echo "3. Reinicia OpenCode: opencode --restart"
echo "4. Verifica configuración: opencode config show"
echo ""
