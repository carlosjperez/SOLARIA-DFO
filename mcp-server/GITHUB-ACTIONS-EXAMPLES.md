# GitHub Actions Integration - MCP Tools Examples

**Author:** ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
**Date:** 2025-12-31
**Task:** DFO-3003

## Overview

This document provides comprehensive examples for using the 4 GitHub Actions MCP tools integrated into SOLARIA DFO.

## Available Tools

| Tool | Purpose |
|------|---------|
| `github_trigger_workflow` | Trigger GitHub Actions workflows from DFO tasks |
| `github_get_workflow_status` | Query workflow run status and completion details |
| `github_create_issue_from_task` | Auto-create GitHub issue from DFO task |
| `github_create_pr_from_task` | Auto-create GitHub pull request from DFO task |

---

## Prerequisites

### Environment Configuration

Required environment variables in `.env`:

```bash
GITHUB_TOKEN=ghp_your_github_personal_access_token
GITHUB_API_URL=https://api.github.com  # Optional, defaults to this
```

### GitHub Token Scopes

Your GitHub token needs these permissions:
- `repo` - Full repository access
- `workflow` - Update GitHub Action workflows
- `admin:repo_hook` - Read/write repository hooks (for status updates)

### Database Schema

The integration requires these tables (created in DFO-3001):
- `github_workflows` - Workflow definitions
- `github_workflow_runs` - Run execution tracking
- `github_task_links` - Links between DFO tasks and GitHub items

---

## 1. Triggering Workflows

### Basic Workflow Trigger

```typescript
// Trigger a workflow on the main branch
const result = await executeTool("github_trigger_workflow", {
  owner: "solaria-agency",
  repo: "my-project",
  workflow_id: "deploy.yml",
  ref: "main",
  project_id: 1,
  format: "json"
});

console.log(result);
// Output:
// {
//   "success": true,
//   "workflow_id": 1,
//   "run_id": 100,
//   "github_run_id": 123456789,
//   "workflow_name": "Deploy Production",
//   "run_number": 42,
//   "run_url": "https://github.com/solaria-agency/my-project/actions/runs/123456789",
//   "status": "queued"
// }
```

### Trigger with Custom Inputs

```typescript
// Trigger workflow with custom parameters
const result = await executeTool("github_trigger_workflow", {
  owner: "solaria-agency",
  repo: "my-project",
  workflow_id: "deploy.yml",
  ref: "develop",
  inputs: {
    environment: "staging",
    version: "2.0.0",
    enable_tests: true
  },
  project_id: 1,
  task_id: 42,  // Optional: link to DFO task
  format: "json"
});
```

### Human-Readable Output

```typescript
// Get human-friendly formatted output
const result = await executeTool("github_trigger_workflow", {
  owner: "solaria-agency",
  repo: "my-project",
  workflow_id: "ci.yml",
  ref: "feature/new-ui",
  project_id: 1,
  format: "human"
});

console.log(result.formatted);
// Output:
// ✅ Workflow Triggered Successfully
//
// Workflow: CI Tests
// Run #: 15
// Status: queued
//
// View run: https://github.com/solaria-agency/my-project/actions/runs/123456789
```

---

## 2. Monitoring Workflow Status

### Check Workflow Run Status

```typescript
const result = await executeTool("github_get_workflow_status", {
  owner: "solaria-agency",
  repo: "my-project",
  github_run_id: 123456789,
  format: "json"
});

console.log(result);
// Output:
// {
//   "success": true,
//   "github_run_id": 123456789,
//   "run_number": 42,
//   "status": "completed",
//   "conclusion": "success",
//   "started_at": "2025-12-31T10:00:00Z",
//   "completed_at": "2025-12-31T10:15:00Z",
//   "duration_seconds": 900,
//   "html_url": "https://github.com/solaria-agency/my-project/actions/runs/123456789"
// }
```

### Monitor In-Progress Workflow

```typescript
const result = await executeTool("github_get_workflow_status", {
  owner: "solaria-agency",
  repo: "my-project",
  github_run_id: 123456789,
  format: "human"
});

console.log(result.formatted);
// Output:
// 🔄 Workflow Run #42
//
// Status: in_progress
// Started: 12/31/2025, 10:00:00 AM
//
// View: https://github.com/solaria-agency/my-project/actions/runs/123456789
```

### Polling Pattern for Workflow Completion

```typescript
async function waitForWorkflowCompletion(owner, repo, runId, timeoutMs = 600000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const result = await executeTool("github_get_workflow_status", {
      owner,
      repo,
      github_run_id: runId,
      format: "json"
    });

    if (result.data.status === "completed") {
      return result.data;
    }

    // Wait 30 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  throw new Error("Workflow timeout after 10 minutes");
}

// Usage
const finalStatus = await waitForWorkflowCompletion("solaria-agency", "my-project", 123456789);
console.log(`Workflow ${finalStatus.conclusion === 'success' ? 'succeeded' : 'failed'}`);
```

---

## 3. Creating GitHub Issues from DFO Tasks

### Auto-Create Issue

```typescript
// Create issue from DFO task
const result = await executeTool("github_create_issue_from_task", {
  task_id: 42,
  owner: "solaria-agency",
  repo: "my-project",
  labels: ["enhancement", "backend"],
  assignees: ["carlosjperez"],
  format: "json"
});

console.log(result);
// Output:
// {
//   "success": true,
//   "task_id": 42,
//   "task_code": "DFO-042",
//   "issue_number": 123,
//   "issue_url": "https://github.com/solaria-agency/my-project/issues/123",
//   "task_link_id": 1
// }
```

### Generated Issue Format

The tool automatically generates a well-formatted issue:

```markdown
# [DFO-042] Implement user authentication

Add JWT-based authentication system

---
**DFO Task:** DFO-042
**Status:** in_progress
**Created from:** SOLARIA DFO
```

### Human-Readable Output

```typescript
const result = await executeTool("github_create_issue_from_task", {
  task_id: 42,
  owner: "solaria-agency",
  repo: "my-project",
  format: "human"
});

console.log(result.formatted);
// Output:
// ✅ GitHub Issue Created
//
// Task: DFO-042
// Issue: #123
//
// View: https://github.com/solaria-agency/my-project/issues/123
```

---

## 4. Creating GitHub PRs from DFO Tasks

### Auto-Create Pull Request

```typescript
const result = await executeTool("github_create_pr_from_task", {
  task_id: 42,
  owner: "solaria-agency",
  repo: "my-project",
  head_branch: "feature/dark-mode",
  base_branch: "main",
  labels: ["feature", "ui"],
  assignees: ["carlosjperez"],
  draft: false,
  format: "json"
});

console.log(result);
// Output:
// {
//   "success": true,
//   "task_id": 42,
//   "task_code": "DFO-042",
//   "pr_number": 456,
//   "pr_url": "https://github.com/solaria-agency/my-project/pull/456",
//   "task_link_id": 2,
//   "draft": false
// }
```

### Create Draft PR

```typescript
// Create draft PR for work-in-progress
const result = await executeTool("github_create_pr_from_task", {
  task_id: 42,
  owner: "solaria-agency",
  repo: "my-project",
  head_branch: "feature/wip",
  base_branch: "develop",
  draft: true,  // Mark as draft
  format: "json"
});
```

### Generated PR Format

The tool creates a PR with structured template:

```markdown
# [DFO-042] Add dark mode support

## Description
Implement theme switcher with dark mode

## Changes
- [ ] Implementation complete
- [ ] Tests added/updated
- [ ] Documentation updated

---
**DFO Task:** DFO-042
**Status:** in_progress
**Created from:** SOLARIA DFO
```

---

## Complete Workflow Examples

### CI/CD Automation Flow

```typescript
async function automatedDeploymentFlow(taskId: number) {
  // 1. Create PR from task
  console.log("Creating PR...");
  const pr = await executeTool("github_create_pr_from_task", {
    task_id: taskId,
    owner: "solaria-agency",
    repo: "my-project",
    head_branch: `task/${taskId}`,
    base_branch: "main",
    labels: ["deployment"],
    format: "json"
  });

  console.log(`PR created: #${pr.data.pr_number}`);

  // 2. Trigger CI workflow
  console.log("Triggering CI...");
  const workflow = await executeTool("github_trigger_workflow", {
    owner: "solaria-agency",
    repo: "my-project",
    workflow_id: "ci.yml",
    ref: `task/${taskId}`,
    inputs: { pr_number: pr.data.pr_number.toString() },
    project_id: 1,
    task_id: taskId,
    format: "json"
  });

  console.log(`CI started: Run #${workflow.data.run_number}`);

  // 3. Monitor workflow
  console.log("Monitoring workflow...");
  let status;
  while (true) {
    status = await executeTool("github_get_workflow_status", {
      owner: "solaria-agency",
      repo: "my-project",
      github_run_id: workflow.data.github_run_id,
      format: "json"
    });

    if (status.data.status === "completed") break;

    console.log(`Status: ${status.data.status}`);
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  // 4. Report results
  if (status.data.conclusion === "success") {
    console.log(`✅ CI passed! Duration: ${status.data.duration_seconds}s`);
    console.log(`PR ready for review: ${pr.data.pr_url}`);
  } else {
    console.log(`❌ CI failed: ${status.data.conclusion}`);
    console.log(`View logs: ${status.data.html_url}`);
  }
}

// Usage
await automatedDeploymentFlow(42);
```

### Issue Tracking Integration

```typescript
async function syncTaskWithGitHub(taskId: number) {
  // Get task details
  const task = await executeTool("get_task", { task_id: taskId });

  if (task.data.status === "pending") {
    // Create issue when task starts
    const issue = await executeTool("github_create_issue_from_task", {
      task_id: taskId,
      owner: "solaria-agency",
      repo: "my-project",
      labels: ["dfo-task"],
      format: "json"
    });

    console.log(`Issue created: #${issue.data.issue_number}`);

  } else if (task.data.status === "in_progress" && task.data.progress >= 80) {
    // Create PR when task is almost done
    const pr = await executeTool("github_create_pr_from_task", {
      task_id: taskId,
      owner: "solaria-agency",
      repo: "my-project",
      head_branch: `task/${taskId}`,
      base_branch: "develop",
      draft: true,
      format: "json"
    });

    console.log(`Draft PR created: #${pr.data.pr_number}`);
  }
}
```

---

## Error Handling

### Handling Workflow Trigger Failures

```typescript
const result = await executeTool("github_trigger_workflow", {
  owner: "solaria-agency",
  repo: "my-project",
  workflow_id: "nonexistent.yml",
  ref: "main",
  project_id: 1,
  format: "json"
});

if (!result.success) {
  console.error("Error:", result.error.code);
  console.error("Message:", result.error.message);
  console.error("Suggestion:", result.error.suggestion);

  // Output:
  // Error: WORKFLOW_TRIGGER_FAILED
  // Message: Failed to trigger workflow
  // Suggestion: Check GitHub token permissions and workflow configuration
}
```

### Handling Non-Existent Tasks

```typescript
const result = await executeTool("github_create_issue_from_task", {
  task_id: 999999,
  owner: "solaria-agency",
  repo: "my-project",
  format: "json"
});

if (!result.success) {
  console.error(result.error);

  // Output:
  // {
  //   "code": "NOT_FOUND",
  //   "message": "Task with ID 999999 not found",
  //   "details": { task_id: 999999 },
  //   "suggestion": "Verify the task ID exists using list_tasks"
  // }
}
```

### Handling GitHub API Rate Limits

```typescript
try {
  const result = await executeTool("github_create_issue_from_task", {
    task_id: 42,
    owner: "solaria-agency",
    repo: "my-project",
    format: "json"
  });
} catch (error) {
  if (error.error?.message?.includes("rate limit")) {
    console.error("GitHub API rate limit exceeded");
    console.error("Wait before retrying");
  }
}
```

---

## Integration Testing

### Manual Test Commands

```bash
# Test workflow trigger
curl -X POST http://localhost:3031/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "github_trigger_workflow",
      "arguments": {
        "owner": "solaria-agency",
        "repo": "test-repo",
        "workflow_id": "test.yml",
        "ref": "main",
        "project_id": 1,
        "format": "json"
      }
    }
  }'

# Test workflow status
curl -X POST http://localhost:3031/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "github_get_workflow_status",
      "arguments": {
        "owner": "solaria-agency",
        "repo": "test-repo",
        "github_run_id": 123456789,
        "format": "json"
      }
    }
  }'
```

### Verify Tools Registration

```bash
# List all available MCP tools
curl -X POST http://localhost:3031/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }' | jq '.result[] | select(.name | startswith("github_"))'

# Should output 4 tools:
# - github_trigger_workflow
# - github_get_workflow_status
# - github_create_issue_from_task
# - github_create_pr_from_task
```

---

## Database Queries

### View Workflow Runs

```sql
SELECT
  gwr.id,
  gwr.github_run_id,
  gwr.github_run_number,
  gwr.status,
  gwr.conclusion,
  gw.workflow_name,
  t.title as task_title
FROM github_workflow_runs gwr
JOIN github_workflows gw ON gwr.workflow_id = gw.id
LEFT JOIN tasks t ON gwr.task_id = t.id
WHERE gwr.project_id = 1
ORDER BY gwr.created_at DESC
LIMIT 10;
```

### View GitHub Task Links

```sql
SELECT
  gtl.id,
  gtl.link_type,
  gtl.github_item_number,
  gtl.github_item_url,
  t.title as task_title,
  CONCAT(p.code, '-', t.task_number) as task_code
FROM github_task_links gtl
JOIN tasks t ON gtl.task_id = t.id
JOIN projects p ON t.project_id = p.id
WHERE gtl.project_id = 1
ORDER BY gtl.created_at DESC;
```

---

## Best Practices

### 1. Always Link Workflows to Tasks

```typescript
// ✅ GOOD: Include task_id for tracking
await executeTool("github_trigger_workflow", {
  // ... other params
  task_id: 42,  // Link to DFO task
});

// ❌ BAD: No task linkage
await executeTool("github_trigger_workflow", {
  // ... other params
  // Missing task_id
});
```

### 2. Use Human Format for Logs

```typescript
// ✅ GOOD: Human-readable logs
const result = await executeTool("github_trigger_workflow", {
  // ... params
  format: "human"
});

console.log(result.formatted);  // Pretty output

// ✅ GOOD: JSON for programmatic use
const result = await executeTool("github_trigger_workflow", {
  // ... params
  format: "json"
});

processData(result.data);
```

### 3. Handle Errors Gracefully

```typescript
// ✅ GOOD: Always check success
const result = await executeTool("github_trigger_workflow", { /* ... */ });

if (result.success) {
  console.log("Success:", result.data);
} else {
  console.error("Failed:", result.error.message);
  console.error("Suggestion:", result.error.suggestion);
}
```

### 4. Poll Wisely

```typescript
// ✅ GOOD: Reasonable polling interval
const pollInterval = 30000;  // 30 seconds

// ❌ BAD: Too frequent polling
const pollInterval = 1000;  // 1 second (will hit rate limits)
```

---

## Security Considerations

### Token Storage

```bash
# ✅ GOOD: Environment variable
GITHUB_TOKEN=ghp_xxxxx

# ❌ BAD: Hardcoded in code
const token = "ghp_xxxxx";  // NEVER DO THIS
```

### Scoped Tokens

Create tokens with minimal required scopes:
- For CI/CD: `repo`, `workflow`
- For issue tracking only: `public_repo` (if public repo)

### Webhook Signatures

When implementing DFO-3004 (Webhook Receiver):
```typescript
// Always verify HMAC signature
const signature = req.headers['x-hub-signature-256'];
const isValid = verifyGitHubSignature(req.body, signature, secret);

if (!isValid) {
  return res.status(401).json({ error: "Invalid signature" });
}
```

---

## Troubleshooting

### "Workflow not found" Error

**Cause:** Workflow file doesn't exist or token lacks permissions

**Solution:**
1. Verify workflow file exists: `.github/workflows/deploy.yml`
2. Check token has `workflow` scope
3. Ensure workflow is in default branch

### "Branch not found" Error

**Cause:** The `ref` (branch) doesn't exist

**Solution:**
```bash
# Verify branch exists
git ls-remote --heads origin feature/my-branch

# Create branch if needed
git checkout -b feature/my-branch
git push -u origin feature/my-branch
```

### "Task not found" Error

**Cause:** Task ID doesn't exist or wrong project context

**Solution:**
```typescript
// Verify task exists
const tasks = await executeTool("list_tasks", { project_id: 1 });
console.log(tasks.data.map(t => ({ id: t.id, title: t.title })));
```

---

## Next Steps

After implementing these tools (DFO-3003), the next task is:

**DFO-3004: Workflow Webhook Receiver**
- Create `POST /webhooks/github/workflow` endpoint
- HMAC signature verification
- Update `github_workflow_runs` table on status changes
- Emit WebSocket event `github_workflow_update`

This will enable real-time status updates when GitHub workflows complete.

---

## Support

For issues or questions:
1. Check test file: `mcp-server/src/__tests__/github-actions.test.ts`
2. Review implementation: `mcp-server/src/endpoints/github-actions.ts`
3. Check service: `dashboard/services/githubActionsService.ts`

---

**Generated:** 2025-12-31
**DFO Task:** DFO-3003
**Sprint:** SPRINT012 (Epic 3 Sprint 3.1)
