# 🧠 Instalación de Memoria Local - Guía Paso a Paso

Claude Code detectó que no tienes instalado el sistema de memoria local. Esto te permitirá:

- ✅ **Persistencia de contexto** entre sesiones
- ✅ **Búsqueda semántica** en tu historial
- ✅ **Trabajo offline** sin dependencia del DFO
- ✅ **Eficiencia de tokens** (~70% de ahorro en primera respuesta)

---

## Paso 1: Instalar claude-mem

### Opción A: Vía Claude Code (Recomendado)

Esta es la forma más simple de instalar claude-mem si ya tienes Claude Code.

1. Abre Claude Code
2. Ejecuta el siguiente comando en el terminal:

```bash
/plugin marketplace add thedotmack/claude-mem
```

3. Espera a que se descargue (3-5 segundos)
4. Ejecuta:

```bash
/plugin install claude-mem
```

5. Reinicia Claude Code

### Opción B: Vía npm (Alternativo)

Si no puedes usar Claude Code o prefieres instalar manualmente:

```bash
npm install -g @thedotmack/claude-mem
claude-mem setup
```

### Opción C: Vía curl (Para entornos sin Claude Code)

```bash
curl -fsSL https://raw.githubusercontent.com/thedotmack/claude-mem/main/install.sh | bash
```

---

## Paso 2: Verificar Instalación

### 2.1 Verificar que el Worker está corriendo

El servicio de worker debe estar activo en el puerto `37777`.

```bash
curl -s http://localhost:37777/health
```

**Respuesta esperada:**

```json
{
  "status": "ok",
  "version": "8.5.0",
  "uptime": 1234
}
```

### 2.2 Verificar la Base de Datos

```bash
ls -lh ~/.claude-mem/claude-mem.db
```

Deberías ver un archivo de tamaño inicial (~1-10MB).

### 2.3 Verificar que el Plugin está Instalado

```bash
ls -la ~/.claude/plugins/marketplaces/thedotmack/claude-mem
```

Deberías ver el directorio del plugin instalado.

---

## Paso 3: Configurar Hooks (Opcional)

claude-mem configura automáticamente los hooks en la primera ejecución. Puedes verificar la configuración:

```bash
cat ~/.claude-mem/settings.json
```

**Configuración típica:**

```json
{
  "hooks": {
    "sessionStart": true,
    "userPromptSubmit": true,
    "postToolUse": true,
    "sessionEnd": true
  },
  "worker": {
    "port": 37777
  },
  "injection": {
    "enabled": true,
    "maxTokens": 2000
  }
}
```

---

## Paso 4: Probar Búsqueda de Memoria

Ahora que tienes claude-mem instalado, puedes probar la búsqueda de memoria en tu próxima sesión con Claude Code.

### 4.1 Búsqueda de Prueba

En tu próxima sesión, simplemente pregunta:

```
Busca información sobre el proyecto [NOMBRE DE TU PROYECTO]
```

Claude Code invocará automáticamente los tools de búsqueda de memoria local (`search`, `timeline`, `get_observations`).

### 4.2 Resultado Esperado

Deberías ver:

1. **Resultados de búsqueda** con contexto relevante
2. **Citas** (ej: `#123`) que referencian observaciones específicas
3. **Token efficiency** - menos llamadas para obtener contexto

---

## Paso 5: Probar Trabajo Offline

claude-mem funciona 100% sin conexión al DFO. Prueba esto:

1. Cierra tu conexión a internet
2. Abre una nueva sesión de Claude Code
3. Ejecuta un comando git o escribe código
4. Pregunta: "¿Qué hemos hecho últimamente?"

Claude buscará en tu memoria local (SQLite + Chroma) y te responderá aunque sin internet.

---

## Troubleshooting

### El worker no inicia

**Síntoma:** No puedes acceder a `http://localhost:37777`

**Solución:**

```bash
# Verificar si hay otro proceso usando el puerto
lsof -i :37777

# Si hay proceso, mátalo
kill -9 $(lsof -t :37777 | tail -1 | awk '{print $2}')

# Reiniciar worker
claude-mem restart
```

### Claude Code no detecta plugins

**Síntoma:** Los tools de memoria no aparecen

**Solución:**

```bash
# Verificar instalación de plugins
ls -la ~/.claude/plugins/marketplaces/

# Reinstalar
/plugin remove claude-mem
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

### Base de datos corrupta

**Síntoma:** Errores al acceder a la memoria

**Solución:**

```bash
# Restaurar desde backup (si existe)
mv ~/.claude-mem/claude-mem.db.backup ~/.claude-mem/claude-mem.db

# O recrear la base de datos
rm ~/.claude-mem/claude-mem.db
claude-mem restart
```

### Memoria consume demasiado espacio

**Síntoma:** La base de datos crece sin límite

**Solución:**

```bash
# Verificar tamaño
du -sh ~/.claude-mem/claude-mem.db

# Compactar base de datos
claude-mem compact

# Verificar después de compactación
du -sh ~/.claude-mem/claude-mem.db
```

---

## ¿Por qué necesitas esto?

| Característica | Sin Memoria | Con Memoria |
|---------------|--------------|--------------|
| **Persistencia** | Claude olvida todo | Recuerda entre sesiones |
| **Búsqueda** | Solo chat actual | Búsqueda en todo el historial |
| **Trabajo Offline** | Necesita DFO | Funciona sin internet |
| **Tokens** | Repite preguntas | Ahorra ~70% de tokens |

---

## Documentación Adicional

- **Documentación completa:** https://docs.claude-mem.ai
- **Repositorio:** https://github.com/thedotmack/claude-mem
- **Issues:** https://github.com/thedotmack/claude-mem/issues

---

**DFO - Sistema de Memoria Híbrida v1.0**
**© 2026 SOLARIA AGENCY | Digital Field Operations**
