#!/bin/bash

set -e

OPENCODE_CONFIG="/Users/carlosjperez/.config/opencode/opencode.json"

echo "========================================="
echo "Verificando Configuración de OpenCode"
echo "========================================="
echo ""

echo "1. Validando JSON..."
if jq . "$OPENCODE_CONFIG" >/dev/null 2>&1; then
    echo "✅ JSON válido"
else
    echo "❌ JSON inválido"
    exit 1
fi

echo ""
echo "2. Verificando provider.\"zai-coding-plan\"..."
if jq -e '.provider."zai-coding-plan".options.baseURL' "$OPENCODE_CONFIG" >/dev/null 2>&1; then
    echo "✅ baseURL presente"
    echo "   Valor: $(jq -r '.provider."zai-coding-plan".options.baseURL' "$OPENCODE_CONFIG")"
else
    echo "❌ baseURL ausente"
fi

if jq -e '.provider."zai-coding-plan".apiKey' "$OPENCODE_CONFIG" >/dev/null 2>&1; then
    API_KEY=$(jq -r '.provider."zai-coding-plan".apiKey' "$OPENCODE_CONFIG")
    if [ -n "$API_KEY" ] && [ "$API_KEY" != "''" ]; then
        echo "✅ apiKey presente"
        echo "   Longitud: ${#API_KEY} caracteres"
    else
        echo "❌ apiKey vacío o inválido"
    fi
else
    echo "❌ apiKey ausente"
fi

echo ""
echo "3. Verificando modelos..."
if jq -e '.provider."zai-coding-plan".models' "$OPENCODE_CONFIG" >/dev/null 2>&1; then
    MODELS=$(jq -r '.provider."zai-coding-plan".models | keys[]' "$OPENCODE_CONFIG")
    echo "✅ Modelos configurados:"
    echo "$MODELS" | sed 's/^/  - /'
else
    echo "❌ No hay modelos"
fi

echo ""
echo "4. Verificando oh-my-opencode.json..."
OMO_CONFIG="/Users/carlosjperez/.config/opencode/oh-my-opencode.json"
if [ -f "$OMO_CONFIG" ]; then
    echo "✅ Archivo existe"

    SI_SISYPHUS=$(jq -r '.agents.Sisyphus.model' "$OMO_CONFIG" 2>/dev/null || echo "NO")
    if [[ "$SI_SISYPHUS" == *"zai-coding-plan/glm-4.7-coding"* ]]; then
        echo "✅ Agente Sisyphus configurado con Z.AI Coding Plan GLM-4.7"
    else
        echo "⚠️  Agente Sisyphus no usa Z.AI Coding Plan GLM-4.7: $SI_SISYPHUS"
    fi
else
    echo "❌ Archivo no existe: $OMO_CONFIG"
fi

echo ""
echo "========================================="
echo "Verificación completada"
echo "========================================="
echo ""
echo "Para reiniciar OpenCode:"
echo "1. Mata el proceso actual (si corre):"
echo "   - Mac: Cmd+Q en la app"
echo "2. Reinicia la app"
echo ""
echo "Si el error persiste, verifica:"
echo "   1. Que la API key sea válida para Z.AI Coding Plan"
echo "   2. Que la versión de OpenCode soporte el proveedor 'zai-coding-plan'"
echo "   3. Que la baseURL sea: https://api.z.ai/api/coding/paas/v4"
echo ""
