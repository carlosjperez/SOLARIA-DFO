# Solución: Integración GLM-4 con ralph-tui

**Versión:** 1.1
**Fecha:** 2026-01-17
**Estado:** ⚠️ INVESTIGANDO

---

## 🚨 Problema Detectado

### Situación Actual

| Componente | Estado | Detalle |
|-----------|--------|---------|
| **Configuración GLM-4** | ✅ OK | Archivo `~/.config/opencode/settings.json` creado correctamente |
| **Script Wrapper** | ✅ OK | Script `scripts/opencode-glm4.sh` creado y es ejecutable |
| **Prompt US-003** | ✅ OK | Archivo `prompts/US-003.txt` creado con contenido completo |
| **Ejecución** | ❌ FALLIDA | La opción `--stream` no es reconocida por opencode |

### Errores Recurrentes

```
error: unknown option '--stream'
error: unknown option '--max-tokens'
```

**Causa Raíz:**

La versión de opencode integrada con ralph-tui (v2.1.9) no soporta las opciones de línea de comandos de opencode CLI estándar.

---

## 🔍 Diagnóstico Detallado

### Integración Ralph-TUI x Opencode

ralph-tui integra opencode como un **plugin** especial. Esto puede causar:

1. **Argumentos enmascarados** - ralph-tui puede pasar argumentos que opencode no espera
2. **Opciones no soportadas** - Si la versión de opencode es antigua o limitada, ciertos argumentos no funcionan
3. **Configuración de sesión** - El servicio `zai-coding-plan` puede interferir con el manejo de sesiones

### Verificación Necesaria

```bash
# Verificar versión de opencode
claude --version

# Verificar opciones disponibles
claude --help | grep -E "stream|token|prompt|message"
```

---

## 💡 Soluciones Propuestas

### Opción 1: Uso Directo de Opencode CLI (RECOMENDADA)

**Ventajas:**
- ✅ Sin dependencias de scripts
- ✅ Control total de los argumentos
- ✅ Compatibilidad con todas las versiones de opencode
- ✅ Más simple y mantenible

**Uso:**

```bash
# Ejecutar prompt directamente
claude --model glm-4 --prompt "$(cat prompts/US-003.txt)"

# Con límite de tokens
claude --model glm-4 --prompt "$(cat prompts/US-003.txt)" --max-tokens 10000

# Sin límite (usar valor del modelo)
claude --model glm-4 --prompt "$(cat prompts/US-003.txt)"
```

---

### Opción 2: Usar Script sin Opciones Problemáticas

**Simplificación del script:**

```bash
# Solo usar argumentos básicos
claude --model "$MODEL" -p "$(cat "$PROMPT_FILE")"

# Si es necesario, usar variables de entorno
export OPCODE_MODEL=glm-4

# En el script:
claude --model "$OPCODE_MODEL" -p "$(cat "$PROMPT_FILE")"
```

---

### Opción 3: Revertir a Ralph-TUI Nativo

Si el problema es específico de la integración con ralph-tui, revertir al uso de ralph-tui con el servicio por defecto (que usa el modelo configurado en ralph-tui):

```bash
# Verificar configuración de ralph-tui
cat .ralph-tui/.ralphrc

# Usar modelo configurado en .ralphrc
ralph-tui run --prd ./prd.json
```

---

## 🎯 Recomendación Inmediata

**USAR OPCIÓN 1: Uso Directo de Opencode CLI**

```bash
cd /Users/carlosjperez/Documents/GitHub/SOLARIA-DFO
claude --model glm-4 --prompt "$(cat prompts/US-003.txt)" --stream
```

Esto permite:
- Ejecutar la tarea US-003 directamente
- Usar GLM-4 para generar el código del endpoint `/stats`
- No depender del script wrapper ni de ralph-tui

---

## 📊 Estado Actual

| Componente | Estado |
|-----------|--------|
| Configuración GLM-4 | ✅ Completado |
| Script Wrapper | ✅ Creado |
| Prompt US-003 | ✅ Creado |
| Documentación | ✅ Actualizada |
| Ejecución | ⚠️ Pendiente de solución |

---

## 🔄 Próximos Pasos Sugeridos

1. Probar Opción 1 (uso directo de opencode CLI)
2. Si funciona, crear scripts adicionales para US-004 a US-006
3. Documentar el flujo de trabajo establecido
4. Crear template de prompt reutilizable para las siguientes tareas

---

## 📝 Notas Importantes

- **Script wrapper aún útil**: Aunque no funciona con `--stream`, el script puede ser reutilizado cuando se resuelva el problema de integración
- **Configuración GLM-4 mantiene**: La configuración en `~/.config/opencode/settings.json` sigue siendo válida para uso directo de opencode
- **Prompt US-003 está listo**: Contiene toda la información necesaria para implementar el endpoint `/stats`

---

**Versión:** 1.1 (Actualizada)
**Próxima revisión:** Cuando se resuelva el problema de integración
