# Configuración de API Z.AI para GLM-4.7

El script `scripts/configure-glm-zai.sh` ha configurado OpenCode para usar GLM-4.7 con la API privada de Z.AI.

## Pasos finales

### 1. Exportar tu API Key

En tu terminal, ejecuta:

```bash
export ZAI_API_KEY='tu_api_key_aqui'
```

**Importante:** Reemplaza `'tu_api_key_aqui'` con tu API key real de Z.AI.

### 2. Opcional: Editar opencode.json manualmente

Si necesitas cambiar la URL base o configurar opciones adicionales:

```bash
nano ~/.config/opencode/opencode.json
```

Busca la sección `provider.zai` y ajusta:
- `baseURL`: URL base de la API Z.AI
- `apiKey`: Tu API key (o usar variable de entorno)

### 3. Reiniciar OpenCode

```bash
opencode --restart
```

### 4. Verificar configuración

```bash
opencode config show
```

## Resumen de configuración

| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| opencode.json | `~/.config/opencode/opencode.json` | ✅ Actualizado con Z.AI |
| oh-my-opencode.json | `~/.config/opencode/oh-my-opencode.json` | ✅ Todos los agentes con GLM-4.7 |

## Modelos configurados

**Modelo principal para todos los agentes:**
```
zai/glm-4.7-coding-plan
```

**Agentes actualizados:**
- Sisyphus (temperature: 0.1)
- Oracle (temperature: 0.1)
- Librarian (temperature: 0.1)
- Explore (temperature: 0.2)
- Frontend UI/UX Engineer (temperature: 0.3)
- Document Writer (temperature: 0.2)
- Multimodal Looker (temperature: 0.2)
- OpenCode-Builder (temperature: 0.3)
- Planner-Sisyphus (temperature: 0.2)

## Backups creados

- `~/.config/opencode/opencode.json.backup-1767779703930947000`
- `~/.config/opencode/oh-my-opencode.json.backup-1767779703955234000`

Si hay algún problema, puedes restaurar estos backups manualmente.
