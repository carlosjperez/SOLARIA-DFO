# Agent Execution API - Testing Documentation

**Task:** DFO-188 - Create API Endpoints
**Date:** 2025-12-30
**Status:** ✅ Completed

---

## Overview

This directory contains comprehensive testing resources for the Agent Execution API endpoints:

- **Bash Script** (`agent-execution-endpoints.test.sh`) - Automated curl-based tests
- **Postman Collection** (`Agent-Execution-API.postman_collection.json`) - GUI-based testing

Both testing methods validate the same 4 endpoints with authentication, error handling, and business logic.

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/agent-execution/queue` | Queue a new agent job | ✅ Yes |
| GET | `/api/agent-execution/jobs/:id` | Get job status | ✅ Yes |
| POST | `/api/agent-execution/jobs/:id/cancel` | Cancel a job | ✅ Yes |
| GET | `/api/agent-execution/workers` | Get worker status | ✅ Yes |

---

## Method 1: Bash Script Testing (Automated)

### Prerequisites

```bash
# Install jq for JSON parsing
brew install jq  # macOS
apt-get install jq  # Ubuntu/Debian
```

### Usage

**Test against local server:**
```bash
./agent-execution-endpoints.test.sh local
```

**Test against production:**
```bash
./agent-execution-endpoints.test.sh production
```

### What the script tests

✅ **Authentication**
- Obtains JWT token via login
- Tests unauthorized requests (401)

✅ **POST /api/agent-execution/queue**
- Valid job queueing
- Validation errors (400)
- Non-existent task (404)
- Missing authentication (401)

✅ **GET /api/agent-execution/jobs/:id**
- Valid job status retrieval
- Non-existent job (404)
- Missing authentication (401)

✅ **GET /api/agent-execution/workers**
- Worker and queue metrics
- Missing authentication (401)

✅ **POST /api/agent-execution/jobs/:id/cancel**
- Job cancellation
- Non-existent job (404)
- Already completed job (404)
- Missing authentication (401)

### Sample Output

```
============================================================================
DFO 4.0 - Agent Execution API Endpoint Tests
Environment: production (https://dfo.solaria.agency)
============================================================================

============================================================================
1. Authentication - Obtaining JWT Token
============================================================================
✓ PASS Login request successful
  Token obtained: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQ...

============================================================================
2. POST /api/agent-execution/queue - Queue Agent Job
============================================================================
Test 2.1: Unauthorized request (no token)
✓ PASS Returns 401 without authentication

Test 2.2: Invalid payload (missing required fields)
✓ PASS Returns 400 for validation errors

Test 2.3: Valid request - Queue job for Task #1, Agent #11
✓ PASS Valid queue request returns 201 Created
  Job ID: 1234567890-abcdef
  Response: {"jobId":"1234567890-abcdef","taskId":1,"status":"queued"}

...

============================================================================
Test Summary
============================================================================
Passed: 15
Failed: 0
Total: 15

✓ All tests passed!
```

---

## Method 2: Postman Collection (GUI)

### Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Agent-Execution-API.postman_collection.json`
4. Collection appears in sidebar

### Configure Environment

The collection uses variables for flexible testing:

| Variable | Default | Description |
|----------|---------|-------------|
| `baseUrl` | `http://localhost:3030` | Server URL |
| `token` | (auto-saved) | JWT token from login |
| `jobId` | (auto-saved) | Job ID from queue request |

**To switch to production:**
1. Click collection settings (⚙️)
2. Variables tab
3. Change `baseUrl` to `https://dfo.solaria.agency`

### Test Workflow

#### 1. Authentication

**Run:** `Authentication → Login`

- Automatically saves JWT token to `{{token}}` variable
- All subsequent requests use this token
- Token is valid for 24 hours

#### 2. Queue a Job

**Run:** `Agent Execution → Queue Agent Job`

- Queues a new agent execution job
- Automatically saves `jobId` to variable
- Returns 201 Created with job details

**Request Body:**
```json
{
  "taskId": 1,
  "agentId": 11,
  "metadata": {
    "priority": "high",
    "estimatedHours": 2
  },
  "context": {
    "dependencies": [123, 456],
    "relatedTasks": [789]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "jobId": "1234567890-abcdef",
    "taskId": 1,
    "taskCode": "DFO-123",
    "agentId": 11,
    "agentName": "Claude Code",
    "status": "queued",
    "priority": "high",
    "queuedAt": "2025-12-30T10:30:00Z"
  }
}
```

#### 3. Get Job Status

**Run:** `Agent Execution → Get Job Status`

- Uses `{{jobId}}` from previous request
- Returns current job state and progress

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1234567890-abcdef",
    "status": "active",
    "progress": 50,
    "dbRecord": {
      "taskId": 1,
      "taskCode": "DFO-123",
      "agentId": 11,
      "status": "active",
      "progress": 50,
      "queuedAt": "2025-12-30T10:30:00Z",
      "startedAt": "2025-12-30T10:31:00Z"
    }
  }
}
```

#### 4. Get Worker Status

**Run:** `Agent Execution → Get Worker Status`

- Returns comprehensive worker/queue metrics
- No parameters required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "workers": {
      "concurrency": 5,
      "lockDuration": 30000,
      "queueName": "agent-execution",
      "status": "active"
    },
    "queue": {
      "waiting": 3,
      "active": 2,
      "completed": 145,
      "failed": 8,
      "successRate": 94.77
    },
    "activeJobs": [...]
  }
}
```

#### 5. Cancel Job

**Run:** `Agent Execution → Cancel Job`

- Cancels the job queued in step 2
- Uses `{{jobId}}` variable

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobId": "1234567890-abcdef",
    "status": "cancelled",
    "cancelledAt": "2025-12-30T10:35:00Z"
  }
}
```

### Error Case Testing

The collection includes dedicated error case requests:

**Error Cases folder:**
1. **Unauthorized - No Token** → 401
2. **Invalid Request - Bad Validation** → 400
3. **Not Found - Non-existent Task** → 404
4. **Not Found - Non-existent Job** → 404

Each request includes:
- Description of expected behavior
- Sample error response
- Assertions to verify correct error handling

---

## Authentication

All endpoints require JWT authentication via Bearer token.

### Obtaining Token

**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "carlosjperez",
  "password": "bypass"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "carlosjperez",
    "role": "ceo"
  }
}
```

### Using Token

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiry:** 24 hours

---

## Validation Rules

### POST /api/agent-execution/queue

**Required Fields:**
- `taskId` (number, positive integer)
- `agentId` (number, positive integer)

**Optional Fields:**
- `metadata.priority` (enum: critical | high | medium | low)
- `metadata.estimatedHours` (number, positive)
- `metadata.retryCount` (number, non-negative)
- `context.dependencies` (array of task IDs)
- `context.relatedTasks` (array of task IDs)
- `context.memoryIds` (array of memory IDs)
- `mcpConfigs` (array of MCP server configs)

**Validation Errors (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "taskId": {
      "_errors": ["Expected number, received string"]
    },
    "agentId": {
      "_errors": ["Task ID must be a positive integer"]
    }
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": { /* Zod validation errors */ }
}
```

### 404 Not Found
```json
{
  "error": "Task not found"
}
```

or

```json
{
  "error": "Job not found or cannot be cancelled",
  "details": "Job may already be completed or does not exist"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to queue job",
  "details": "Connection refused" // Only in development
}
```

**Note:** Error details are only included in development mode for security.

---

## Testing Checklist

Before marking endpoints as production-ready, verify:

- [ ] Authentication works correctly
- [ ] All 4 endpoints return expected status codes
- [ ] Validation rejects invalid inputs with 400
- [ ] Non-existent resources return 404
- [ ] Unauthorized requests return 401
- [ ] Database records are created/updated correctly
- [ ] Activity logs are persisted
- [ ] Socket.IO events are emitted (if applicable)
- [ ] Error messages are informative
- [ ] Production mode hides internal error details

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Start DFO Server
        run: docker compose up -d

      - name: Wait for health
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:3030/api/health; do sleep 2; done'

      - name: Run API Tests
        run: ./tests/api/agent-execution-endpoints.test.sh local

      - name: Stop containers
        run: docker compose down
```

---

## Troubleshooting

### Server not responding

```bash
# Check if server is running
curl http://localhost:3030/api/health

# Check Docker containers
docker compose ps

# View logs
docker compose logs office
```

### Token expired

Re-run the login request to get a fresh token.

### Tests failing

1. Verify server is running
2. Check database has test data (Task #1, Agent #11)
3. Ensure Redis is running for BullMQ
4. Review server logs for errors

---

## Related Documentation

- **Implementation:** `/dashboard/server.ts` (lines 510-513, 6275-6563)
- **Service:** `/dashboard/services/agentExecutionService.ts`
- **Schemas:** `/dashboard/db/schema/agent-execution.ts`
- **Migration:** `/infrastructure/database/migrations/012_agent_execution_tables.sql`

---

**DFO 4.0 - Agent Execution API Testing**
**Date:** 2025-12-30
**Tested by:** ECO-Lambda (Arquitecto/Estratega)
