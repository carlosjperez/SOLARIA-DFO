# GitHub Webhook Setup - SOL-5

## Purpose

Configure GitHub repository webhook to automatically sync commits with DFO tasks.

## Webhook Configuration

### 1. Add Webhook in GitHub Repository

Navigate to your repository settings:

```
https://github.com/YOUR_ORG/YOUR_REPO/settings/hooks/new
```

### 2. Webhook Settings

| Setting | Value |
|---------|-------|
| **Payload URL** | `https://dfo.solaria.agency/webhooks/github` |
| **Content type** | `application/json` |
| **Secret** | (see below) |
| **SSL verification** | ✓ Enable SSL verification |
| **Which events** | Just the push event |
| **Active** | ✓ |

### 3. Webhook Secret

The webhook secret is configured in the Docker container via environment variable:

```bash
GITHUB_WEBHOOK_SECRET=your-secret-key-here
```

**To update the secret:**

1. Edit `docker-compose.prod.yml` and add to office service:
   ```yaml
   environment:
     GITHUB_WEBHOOK_SECRET: "your-secret-key-here"
   ```

2. Restart the container:
   ```bash
   cd /var/www/solaria-dfo
   docker compose -f docker-compose.prod.yml up -d office
   ```

**Security Note:** Use a strong random string (minimum 32 characters). Generate with:
```bash
openssl rand -hex 32
```

## How It Works

### Commit Message Pattern

The webhook looks for `[DFO-XXX]` references in commit messages:

```bash
git commit -m "[DFO-123] Implement user authentication"
```

### Auto-Completion Keywords

If commit message contains completion keywords, the task will be auto-completed:

- `completes [DFO-123]`
- `closes [DFO-123]`
- `fixes [DFO-123]`
- `resolves [DFO-123]`
- `finished [DFO-123]`
- `done [DFO-123]`

**Example:**
```bash
git commit -m "Fixes [DFO-123] - Resolved authentication bug"
```

This will:
1. Log the commit in activity_logs
2. Auto-complete task DFO-123
3. Set progress to 100%
4. Add completion notes with commit details

### Branch Filtering

Only commits to `main` branch trigger webhook processing. Other branches are ignored.

## Testing

Test the webhook endpoint:

```bash
curl -X POST https://dfo.solaria.agency/webhooks/github \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "commits": [
      {
        "id": "abc123",
        "message": "[DFO-999] Test commit",
        "author": {
          "name": "Test User",
          "email": "test@example.com"
        },
        "url": "https://github.com/org/repo/commit/abc123",
        "timestamp": "2025-12-30T10:00:00Z"
      }
    ],
    "repository": {
      "name": "test-repo",
      "full_name": "org/test-repo"
    },
    "pusher": {
      "name": "Test User"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "status": "no_tasks_found",
  "processed": 0,
  "errors": []
}
```

## Webhook Deliveries

View webhook delivery history in GitHub:

```
https://github.com/YOUR_ORG/YOUR_REPO/settings/hooks
```

Click on the webhook → "Recent Deliveries" tab

### Successful Delivery

- Status: 200 OK
- Response body: `{"success":true,"status":"processed","processed":1,"errors":[]}`

### Failed Delivery

Check server logs:
```bash
docker compose -f docker-compose.prod.yml logs office | grep webhook
```

## Integration with SOL-4 (Git Hooks)

SOL-4 git hooks automatically add `[DFO-XXX]` to commits based on branch name:

```bash
# Create feature branch
git checkout -b feature/DFO-123-auth-system

# Commit (hook auto-adds [DFO-123])
git commit -m "Add login form"
# → Becomes: "[DFO-123] Add login form"

# Push to trigger webhook
git push origin feature/DFO-123-auth-system
```

When merged to main, the webhook will:
1. Detect `[DFO-123]` reference
2. Log activity in DFO
3. Auto-complete if merge commit has completion keywords

## Troubleshooting

### Webhook returns 404

**Cause:** Server not running or route not registered

**Solution:**
```bash
# Check container status
docker compose -f docker-compose.prod.yml ps office

# Check logs
docker compose -f docker-compose.prod.yml logs office

# Restart if needed
docker compose -f docker-compose.prod.yml restart office
```

### Webhook returns 401 (Unauthorized)

**Cause:** Invalid signature or missing secret

**Solution:**
1. Verify GITHUB_WEBHOOK_SECRET is set in container
2. Ensure GitHub webhook secret matches container env var
3. Check signature header is being sent: `X-Hub-Signature-256`

### Task not found in DFO

**Cause:** Task code doesn't exist in database

**Check:**
```bash
# Find task in DFO
curl https://dfo.solaria.agency/api/tasks?search=DFO-123
```

Task must exist in DFO before webhook can update it.

### Commits not triggering webhook

**Possible causes:**
1. Webhook not configured in GitHub repository
2. Commits not pushed to `main` branch
3. Webhook disabled or SSL verification failing

**Verify:**
1. Check GitHub webhook settings (Active checkbox)
2. Test webhook with "Redeliver" button
3. Check Recent Deliveries for errors

## Security

### HMAC SHA-256 Verification

All webhook requests are verified using HMAC SHA-256:

```typescript
const hmac = crypto.createHmac('sha256', secret);
const digest = 'sha256=' + hmac.update(payload).digest('hex');
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(digest)
);
```

Requests with invalid signatures are rejected with 401 Unauthorized.

### SSL/TLS

All webhook traffic is encrypted via HTTPS. GitHub sends:
- TLS 1.2+ connections
- Strong cipher suites
- Valid SSL certificates

Nginx terminates SSL and forwards to backend over localhost.

## Monitoring

### Activity Logs

All webhook events are logged in `activity_logs` table:

```sql
SELECT * FROM activity_logs
WHERE category = 'git_commit'
ORDER BY created_at DESC
LIMIT 10;
```

### Webhook Metrics

Track webhook performance:

```bash
# Count webhook requests (last 24h)
docker compose -f docker-compose.prod.yml logs office \
  | grep "POST /webhooks/github" \
  | grep "$(date -u +%Y-%m-%d)" \
  | wc -l
```

## Maintenance

### Update Webhook Endpoint

If webhook URL changes, update in GitHub settings:

1. Navigate to repository webhook settings
2. Edit webhook
3. Update Payload URL
4. Save webhook

### Rotate Webhook Secret

Periodically rotate the secret (recommended: every 90 days):

1. Generate new secret:
   ```bash
   openssl rand -hex 32
   ```

2. Update in GitHub webhook settings

3. Update `GITHUB_WEBHOOK_SECRET` in docker-compose.prod.yml

4. Restart container:
   ```bash
   docker compose -f docker-compose.prod.yml up -d office
   ```

---

## Summary

| Feature | Status |
|---------|--------|
| Endpoint | https://dfo.solaria.agency/webhooks/github |
| Auth | HMAC SHA-256 signature verification |
| Events | Push events only |
| Branch filter | main branch only |
| Task detection | `[DFO-XXX]` pattern |
| Auto-completion | Completion keywords support |
| Activity logging | ✓ All commits logged |
| Error handling | ✓ Graceful failure |

---

**Last Updated:** 2025-12-30
**Implementation:** SOL-5 - GitHub Webhook → DFO
**Related:** SOL-4 (Git Hooks Auto-Reference)
