# GitHub Actions Webhook Integration

**DFO-201-EPIC21** | Epic 3: GitHub Actions Integration
**Autor:** ECO-Lambda
**Fecha:** 2025-12-31
**Versión:** 1.0.0

---

## Resumen

SOLARIA DFO ahora puede recibir webhooks de GitHub Actions para actualizar automáticamente el estado de workflows en el dashboard en tiempo real.

### Capacidades

| Característica | Descripción |
|----------------|-------------|
| **Eventos soportados** | workflow_run (queued, in_progress, completed) |
| **Seguridad** | HMAC SHA-256 signature verification |
| **Real-time** | Socket.IO events para actualización instantánea |
| **Logging** | Activity logs con metadata completa |
| **Error handling** | Reintentos automáticos, graceful degradation |

---

## Configuración del Webhook en GitHub

### Paso 1: Acceder a Settings del Repositorio

1. Navega a tu repositorio en GitHub
2. Settings → Webhooks → Add webhook

### Paso 2: Configurar el Endpoint

**Payload URL:**
```
https://dfo.solaria.agency/webhooks/github/workflow
```

**Content type:**
```
application/json
```

**Secret:** (usar el valor de `GITHUB_WEBHOOK_SECRET` del servidor)
```
[Tu secret configurado en .env]
```

### Paso 3: Seleccionar Eventos

Marcar únicamente:
- ☑️ **Workflow runs**

Desmarcar:
- ☐ Push events (se maneja en otro endpoint)
- ☐ Otros eventos

### Paso 4: Activar

- ☑️ Active
- Save webhook

---

## Variables de Entorno Requeridas

```bash
# .env del servidor DFO
GITHUB_WEBHOOK_SECRET="your-secret-key-here"
```

**⚠️ Importante:**
- El secret debe ser el mismo en GitHub y en el servidor DFO
- Usar un secret fuerte (mínimo 32 caracteres)
- Nunca commitear el secret al repositorio

---

## Flujo de Procesamiento

```
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions Workflow                   │
│                   (Push, PR, Manual trigger)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ workflow_run event
                       ▼
         ┌─────────────────────────────┐
         │   POST /webhooks/github/    │
         │         workflow            │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌──────────────────────────────┐
         │  HMAC Signature Verification │
         │   (verifyGitHubSignature)    │
         └──────────┬───────────────────┘
                    │
                    ├─ ❌ Invalid → 401 Unauthorized
                    │
                    ▼
         ┌──────────────────────────────┐
         │   Event Type Validation      │
         │  (must be 'workflow_run')    │
         └──────────┬───────────────────┘
                    │
                    ├─ ❌ Wrong event → 400 Bad Request
                    │
                    ▼
         ┌──────────────────────────────┐
         │  handleWorkflowRunEvent()    │
         │                              │
         │  1. Find workflow in DB      │
         │  2. Calculate duration       │
         │  3. Update status            │
         │  4. Log activity             │
         │  5. Emit Socket.IO event     │
         └──────────┬───────────────────┘
                    │
                    ▼
         ┌──────────────────────────────┐
         │   200 OK (success: true)     │
         └──────────────────────────────┘
```

---

## Tipos de Eventos y Acciones

### workflow_run.queued

Workflow fue añadido a la cola pero no ha iniciado.

**Payload key fields:**
```json
{
  "action": "queued",
  "workflow_run": {
    "status": "queued",
    "conclusion": null,
    "run_started_at": null
  }
}
```

**Actualización en DFO:**
- `status` = "queued"
- `conclusion` = NULL
- `started_at` = NULL
- `completed_at` = NULL
- `duration_seconds` = NULL

---

### workflow_run.in_progress

Workflow está ejecutándose actualmente.

**Payload key fields:**
```json
{
  "action": "in_progress",
  "workflow_run": {
    "status": "in_progress",
    "conclusion": null,
    "run_started_at": "2025-12-31T10:00:00Z"
  }
}
```

**Actualización en DFO:**
- `status` = "in_progress"
- `conclusion` = NULL
- `started_at` = workflow_run.run_started_at
- `completed_at` = NULL
- `duration_seconds` = NULL

---

### workflow_run.completed

Workflow finalizó (success, failure, cancelled, etc.).

**Payload key fields:**
```json
{
  "action": "completed",
  "workflow_run": {
    "status": "completed",
    "conclusion": "success" | "failure" | "cancelled" | "skipped",
    "run_started_at": "2025-12-31T10:00:00Z",
    "updated_at": "2025-12-31T10:15:00Z"
  }
}
```

**Actualización en DFO:**
- `status` = "completed"
- `conclusion` = workflow_run.conclusion
- `started_at` = workflow_run.run_started_at
- `completed_at` = workflow_run.updated_at
- `duration_seconds` = calculated (completed_at - started_at)

**Activity log level:**
- `conclusion === "failure"` → level: **error**
- Otros → level: **info**

---

## Ejemplo de Payload Completo

```json
{
  "action": "completed",
  "workflow_run": {
    "id": 123456789,
    "name": "Deploy Production",
    "head_branch": "main",
    "head_sha": "abc123def456",
    "run_number": 42,
    "event": "push",
    "status": "completed",
    "conclusion": "success",
    "workflow_id": 1,
    "html_url": "https://github.com/org/repo/actions/runs/123456789",
    "created_at": "2025-12-31T10:00:00Z",
    "updated_at": "2025-12-31T10:15:00Z",
    "run_started_at": "2025-12-31T10:00:05Z"
  },
  "repository": {
    "name": "test-repo",
    "full_name": "solaria-agency/test-repo"
  },
  "sender": {
    "login": "carlosjperez"
  }
}
```

---

## Socket.IO Events

Cada actualización de workflow emite un evento Socket.IO para actualización en tiempo real del dashboard.

### Event: `github_workflow_update`

**Payload:**
```javascript
{
  workflow_run_id: 1,           // ID interno en DFO
  github_run_id: 123456789,     // ID de GitHub
  run_number: 42,               // Número de ejecución
  workflow_name: "Deploy Production",
  status: "completed",
  conclusion: "success",
  action: "completed",          // queued | in_progress | completed
  project_id: 1,
  task_id: 42,                  // null si no está asociado a tarea
  html_url: "https://github.com/org/repo/actions/runs/123456789"
}
```

### Ejemplo de Listener (Frontend)

```javascript
socket.on('github_workflow_update', (data) => {
  console.log(`Workflow ${data.run_number}: ${data.status} - ${data.conclusion}`);

  // Actualizar UI
  updateWorkflowCard(data.workflow_run_id, {
    status: data.status,
    conclusion: data.conclusion,
    url: data.html_url
  });

  // Mostrar notificación si falló
  if (data.conclusion === 'failure') {
    showNotification(`Workflow ${data.workflow_name} failed`, 'error');
  }
});
```

---

## Estructura de Base de Datos

### Tabla: `github_workflow_runs`

```sql
CREATE TABLE github_workflow_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workflow_id INT NOT NULL,
  project_id INT NOT NULL,
  task_id INT DEFAULT NULL,
  github_run_id BIGINT UNIQUE NOT NULL,
  github_run_number INT NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  branch VARCHAR(255) NOT NULL,
  commit_sha VARCHAR(255) NOT NULL,
  run_url TEXT NOT NULL,
  status ENUM('queued', 'in_progress', 'completed') NOT NULL,
  conclusion ENUM('success', 'failure', 'cancelled', 'skipped', 'timed_out') DEFAULT NULL,
  started_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  duration_seconds INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_github_run_id (github_run_id),
  INDEX idx_project_id (project_id),
  INDEX idx_task_id (task_id),
  INDEX idx_status (status),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

**Campos clave:**
- `github_run_id`: ID único de GitHub (BIGINT porque GitHub usa IDs grandes)
- `status`: Estado actual (queued, in_progress, completed)
- `conclusion`: Resultado final (success, failure, etc.) - NULL si no completado
- `duration_seconds`: Calculado automáticamente en completed

---

## Activity Logs

Cada evento de workflow genera un registro en `activity_logs`:

```javascript
{
  project_id: 1,
  category: "github_workflow",
  action: "Workflow run #42 completed",
  level: "info" | "error",  // error si conclusion === 'failure'
  metadata: {
    github_run_id: 123456789,
    run_number: 42,
    workflow_name: "Deploy Production",
    repository: "solaria-agency/test-repo",
    status: "completed",
    conclusion: "success",
    branch: "main",
    commit_sha: "abc123def456",
    html_url: "https://github.com/..."
  }
}
```

---

## Testing

### Tests Automatizados

**Ubicación:** `tests/services/github-webhook-receiver.test.js`

**Cobertura:**
- ✅ HMAC signature verification (3 tests)
- ✅ Workflow event processing (7 tests)

**Ejecutar tests:**
```bash
npm test -- tests/services/github-webhook-receiver.test.js
```

### Test Manual con cURL

```bash
# 1. Generar payload
PAYLOAD='{"action":"completed","workflow_run":{"id":123,"status":"completed","conclusion":"success"}}'

# 2. Calcular HMAC signature
SECRET="your-webhook-secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# 3. Enviar request
curl -X POST https://dfo.solaria.agency/webhooks/github/workflow \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: workflow_run" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "status": "processed"
}
```

---

## Seguridad

### HMAC Signature Verification

El servidor verifica que cada webhook proviene de GitHub:

1. GitHub firma el payload con tu secret usando HMAC SHA-256
2. Envía la firma en el header `X-Hub-Signature-256`
3. DFO recalcula la firma usando el mismo secret
4. Compara ambas firmas usando `crypto.timingSafeEqual()` (timing-safe)

**Si las firmas no coinciden:**
- Request rechazado con `401 Unauthorized`
- Log de advertencia en server logs

### Mejores Prácticas

1. **Secret fuerte:**
   - Mínimo 32 caracteres
   - Caracteres aleatorios (use a password generator)
   - Nunca commitear al repo

2. **HTTPS:**
   - GitHub solo envía webhooks a URLs HTTPS
   - Certificado válido requerido

3. **Validación:**
   - Verificar siempre signature
   - Validar event type (`X-GitHub-Event`)
   - Sanitizar inputs

---

## Troubleshooting

### Webhook no llega al servidor

**Síntomas:**
- GitHub marca el delivery como failed
- Logs del servidor no muestran el request

**Soluciones:**
1. Verificar que el servidor esté accesible públicamente
2. Verificar firewall/security groups
3. Verificar SSL certificate válido
4. Revisar GitHub webhook delivery logs

### Signature verification fails

**Síntomas:**
- Server logs: "Invalid signature"
- Response: `401 Unauthorized`

**Soluciones:**
1. Verificar que `GITHUB_WEBHOOK_SECRET` coincida en GitHub y servidor
2. Revisar que no haya espacios/newlines en el secret
3. Verificar que GitHub esté enviando `X-Hub-Signature-256`

### Workflow no se encuentra en DB

**Síntomas:**
- Response: `{ status: "not_found", error: "Workflow run X not found in DFO" }`

**Soluciones:**
1. Verificar que el workflow fue triggereado desde DFO primero
2. Revisar `github_workflow_runs` table para el `github_run_id`
3. Si el workflow fue manual, crear entrada manualmente en DB

### Socket.IO no actualiza dashboard

**Síntomas:**
- Webhook procesado correctamente
- Dashboard no se actualiza en tiempo real

**Soluciones:**
1. Verificar conexión Socket.IO en browser console
2. Revisar que el listener esté registrado: `socket.on('github_workflow_update', ...)`
3. Verificar que `io` está pasado a `handleWorkflowRunEvent()`

---

## Monitoreo

### Métricas a Trackear

| Métrica | Descripción | Threshold |
|---------|-------------|-----------|
| **Delivery success rate** | % webhooks procesados exitosamente | > 95% |
| **Processing time** | Tiempo desde recepción hasta DB update | < 500ms |
| **Signature failures** | Cantidad de firmas inválidas | < 5/día |
| **Not found errors** | Workflows no encontrados en DB | < 10/día |

### Dashboard de GitHub

GitHub provee un dashboard de webhooks en:
```
Settings → Webhooks → [tu webhook] → Recent Deliveries
```

**Información disponible:**
- Request headers
- Request payload
- Response status
- Response body
- Response time
- Redeliver option (útil para debugging)

---

## Próximos Pasos (Roadmap)

### Fase 2: Auto-Trigger Workflows desde DFO

- [ ] MCP tool: `trigger_github_workflow`
- [ ] UI: Botón "Deploy" en tasks
- [ ] Auto-create workflow run en DB antes de trigger

### Fase 3: Workflow Status en Dashboard

- [ ] Widget de workflows en project dashboard
- [ ] Timeline de deployments
- [ ] Alertas de failures

### Fase 4: Advanced Features

- [ ] Rollback automático en deployment failures
- [ ] Workflow approval gates
- [ ] Multi-environment deployments (staging, prod)

---

## Referencias

- [GitHub Webhooks Documentation](https://docs.github.com/en/webhooks)
- [GitHub Actions API](https://docs.github.com/en/rest/actions)
- [HMAC Authentication Best Practices](https://www.npmjs.com/package/crypto#crypto_crypto_createhmac_algorithm_key_options)

---

**Documento actualizado:** 2025-12-31
**Versión DFO:** 3.5.1
**Epic:** DFO-201-EPIC21 ✅ Completado
