# DFO-189: Agent Execution MCP Tools - Test Plan

**Task:** DFO-189 - Add MCP Tools for Agent Execution
**Date:** 2026-01-01
**Tester:** ECO-Lambda (Automated Testing via MCP)

---

## Test Environment

- **MCP Server:** https://dfo.solaria.agency/mcp
- **Tools Implemented:** 4
- **Test Data:**
  - Valid task_id: 537 (DFO-204-EPIC21 - "GitHub PR Creation Flow")
  - Valid agent_id: 11 (Claude Code)
  - Invalid task_id: 99999
  - Invalid agent_id: 99999

---

## Tool 1: `queue_agent_job`

### Test Case 1.1: Valid Job Queue (Happy Path)

**Input:**
```json
{
  "task_id": 537,
  "agent_id": 11,
  "metadata": {
    "priority": "high",
    "estimatedHours": 2,
    "retryCount": 3
  },
  "context": {
    "dependencies": [522],
    "relatedTasks": [535, 536],
    "memoryIds": []
  },
  "format": "human"
}
```

**Expected Output:**
```
✅ Agent job queued successfully

Job ID: mcp-{timestamp}-{random}
Task: DFO-204-EPIC21 (#537)
Agent: Claude Code (#11)
Priority: high
Status: queued
Queued: {timestamp}

The job is now waiting in the execution queue and will be processed by the next available worker.
```

**Validation:**
- ✓ Job inserted in `agent_jobs` table
- ✓ Status = 'waiting'
- ✓ Progress = 0
- ✓ Priority = 2 (high → 2)
- ✓ job_data JSON contains all metadata
- ✓ bullmq_job_id generated with 'mcp-' prefix

---

### Test Case 1.2: Invalid Task ID

**Input:**
```json
{
  "task_id": 99999,
  "agent_id": 11,
  "format": "json"
}
```

**Expected Output:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Task with ID 99999 was not found",
    "details": { "entity": "Task", "id": 99999 }
  }
}
```

**Validation:**
- ✓ No job created in database
- ✓ Error code = "NOT_FOUND"
- ✓ CommonErrors.notFound() used

---

### Test Case 1.3: Invalid Agent ID

**Input:**
```json
{
  "task_id": 537,
  "agent_id": 99999,
  "format": "json"
}
```

**Expected Output:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Agent with ID 99999 was not found",
    "details": { "entity": "Agent", "id": 99999 }
  }
}
```

**Validation:**
- ✓ No job created in database
- ✓ Error code = "NOT_FOUND"
- ✓ Agent validation before job creation

---

### Test Case 1.4: Zod Schema Validation (Invalid Input)

**Input:**
```json
{
  "task_id": "not-a-number",
  "agent_id": 11
}
```

**Expected Output:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task ID must be a positive integer"
  }
}
```

**Validation:**
- ✓ Zod validation catches type error
- ✓ Clear error message
- ✓ No database query attempted

---

### Test Case 1.5: Priority Mapping

**Input:** Various priority values
```json
{ "metadata": { "priority": "critical" } }  → priority DB: 1
{ "metadata": { "priority": "high" } }      → priority DB: 2
{ "metadata": { "priority": "medium" } }    → priority DB: 3
{ "metadata": { "priority": "low" } }       → priority DB: 4
{ "metadata": {} }                          → priority DB: 4 (default)
```

**Validation:**
- ✓ Critical → 1
- ✓ High → 2
- ✓ Medium → 3
- ✓ Low/undefined → 4

---

## Tool 2: `get_agent_job_status`

### Test Case 2.1: Get Status of Existing Job

**Pre-condition:** Job created with Test Case 1.1

**Input:**
```json
{
  "job_id": "mcp-1735747200000-abc123xyz",
  "format": "human"
}
```

**Expected Output:**
```
Job Status Report
════════════════════════════════════════
⏳ Status: WAITING
📋 Task: DFO-204-EPIC21 (#537)
🤖 Agent: Claude Code (#11)
📊 Progress: 0%
⏰ Queued: {timestamp}
🔁 Attempts: 0/3
```

**Validation:**
- ✓ Job found in database
- ✓ Status emoji correct (⏳ for waiting)
- ✓ All fields populated
- ✓ Human format applied correctly

---

### Test Case 2.2: Non-Existent Job

**Input:**
```json
{
  "job_id": "nonexistent-job-id",
  "format": "json"
}
```

**Expected Output:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Job with ID nonexistent-job-id was not found"
  }
}
```

**Validation:**
- ✓ NOT_FOUND error returned
- ✓ No stack trace leak

---

### Test Case 2.3: Job with Error

**Pre-condition:** Manually update job status to 'failed' with error

**Input:**
```json
{
  "job_id": "{valid_job_id}",
  "format": "human"
}
```

**Expected Output:**
```
Job Status Report
════════════════════════════════════════
❌ Status: FAILED
📋 Task: DFO-204-EPIC21 (#537)
🤖 Agent: Claude Code (#11)
📊 Progress: 50%
⏰ Queued: {timestamp}
▶️  Started: {timestamp}
🔁 Attempts: 3/3

⚠️  Last Error:
Connection timeout to external MCP server
```

**Validation:**
- ✓ Failed emoji (❌)
- ✓ Error section displayed
- ✓ Attempt count shows max reached

---

## Tool 3: `list_active_agent_jobs`

### Test Case 3.1: List All Active Jobs

**Pre-condition:** Multiple jobs in database (waiting, active, completed)

**Input:**
```json
{
  "format": "human"
}
```

**Expected Output:**
```
Active Agent Jobs
════════════════════════════════════════
Total jobs: 5
  Waiting: 2
  Active: 1
  Completed: 2
  Failed: 0

Jobs:
─────────────────────────────────────────
⏳ Job #1 (mcp-...-xyz)
   Task: DFO-204-EPIC21 (#537)
   Agent: Claude Code (#11)
   Status: waiting
   Priority: high
   Progress: 0%

🔄 Job #2 (mcp-...-abc)
   Task: DFO-203-EPIC21 (#536)
   Agent: Claude Code (#11)
   Status: active
   Priority: medium
   Progress: 45%

✅ Job #3 (mcp-...-def)
   Task: DFO-202-EPIC21 (#535)
   Agent: Claude Code (#11)
   Status: completed
   Priority: low
   Progress: 100%
```

**Validation:**
- ✓ All jobs listed
- ✓ Correct status counts
- ✓ Status emojis correct
- ✓ Progress percentages shown

---

### Test Case 3.2: Filter by Project

**Input:**
```json
{
  "project_id": 1,
  "format": "json"
}
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "jobId": "mcp-...",
        "taskId": 537,
        "taskCode": "DFO-204-EPIC21",
        "status": "waiting",
        "progress": 0,
        "priority": "high"
      }
    ],
    "totalJobs": 5,
    "statusCounts": {
      "waiting": 2,
      "active": 1,
      "completed": 2,
      "failed": 0
    }
  }
}
```

**Validation:**
- ✓ Only jobs from project_id=1
- ✓ Status counts correct
- ✓ JSON format

---

### Test Case 3.3: No Active Jobs

**Pre-condition:** All jobs completed or cancelled

**Input:**
```json
{
  "format": "human"
}
```

**Expected Output:**
```
Active Agent Jobs
════════════════════════════════════════
Total jobs: 0

No active jobs in the queue.
```

**Validation:**
- ✓ Empty state handled gracefully
- ✓ Clear message
- ✓ No error thrown

---

## Tool 4: `cancel_agent_job`

### Test Case 4.1: Cancel Waiting Job

**Pre-condition:** Job in 'waiting' status

**Input:**
```json
{
  "job_id": "mcp-...-xyz",
  "format": "human"
}
```

**Expected Output:**
```
🚫 Job cancelled successfully

Job ID: mcp-...-xyz
Task: DFO-204-EPIC21 (#537)
Previous status: waiting
New status: cancelled

The job has been removed from the execution queue.
```

**Validation:**
- ✓ Job status updated to 'cancelled'
- ✓ cancelled_at timestamp set
- ✓ Success response

---

### Test Case 4.2: Cancel Active Job

**Pre-condition:** Job in 'active' status

**Input:**
```json
{
  "job_id": "mcp-...-abc",
  "format": "json"
}
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "jobId": "mcp-...-abc",
    "taskId": 536,
    "taskCode": "DFO-203-EPIC21",
    "previousStatus": "active",
    "newStatus": "cancelled",
    "cancelledAt": "2026-01-01T15:30:00Z"
  }
}
```

**Validation:**
- ✓ Active job cancelled
- ✓ Worker notified (if BullMQ integrated)
- ✓ Status updated

---

### Test Case 4.3: Cancel Already Completed Job

**Pre-condition:** Job in 'completed' status

**Input:**
```json
{
  "job_id": "mcp-...-def",
  "format": "json"
}
```

**Expected Output:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE",
    "message": "Cannot cancel job in status: completed",
    "details": {
      "jobId": "mcp-...-def",
      "currentStatus": "completed"
    }
  }
}
```

**Validation:**
- ✓ Error for completed jobs
- ✓ INVALID_STATE error code
- ✓ Current status included in error

---

### Test Case 4.4: Cancel Non-Existent Job

**Input:**
```json
{
  "job_id": "fake-job-id",
  "format": "json"
}
```

**Expected Output:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Job with ID fake-job-id was not found"
  }
}
```

**Validation:**
- ✓ NOT_FOUND error
- ✓ No database corruption
- ✓ No silent failure

---

## Integration Tests

### Integration Test 1: Full Lifecycle

**Steps:**
1. Queue job (Test 1.1)
2. Get status → waiting (Test 2.1)
3. List active jobs → job appears (Test 3.1)
4. Cancel job (Test 4.1)
5. Get status → cancelled (Test 2.1)
6. List active jobs → job not in list (Test 3.1)

**Validation:**
- ✓ Full lifecycle works end-to-end
- ✓ Status transitions correct
- ✓ No orphaned records

---

### Integration Test 2: Multiple Agents

**Steps:**
1. Queue 3 jobs for different agents (11, 2, 3)
2. List all active jobs
3. Verify all jobs appear
4. Cancel job for agent 11
5. Verify other jobs unaffected

**Validation:**
- ✓ Multi-agent support works
- ✓ Job isolation correct
- ✓ Cancel doesn't affect other agents

---

### Integration Test 3: Priority Queue Behavior

**Steps:**
1. Queue 4 jobs with priorities: low, high, critical, medium
2. List active jobs
3. Verify priority order in response

**Validation:**
- ✓ Priority values stored correctly
- ✓ Jobs can be sorted by priority
- ✓ Priority mapping (critical=1, high=2, medium=3, low=4)

---

## Error Handling Tests

### Error Test 1: Database Connection Failure

**Simulation:** Disconnect database
**Expected:** CommonErrors.databaseError() with retry suggestion

### Error Test 2: Malformed JSON in job_data

**Simulation:** Corrupt JSON in database
**Expected:** Graceful parsing error

### Error Test 3: Missing Required Fields

**Simulation:** Zod validation on incomplete input
**Expected:** Clear validation error messages

---

## Performance Tests

### Performance Test 1: Queue 100 Jobs

**Metrics:**
- Average time per queue: < 100ms
- Database lock contention: None
- Memory usage: Stable

### Performance Test 2: List 1000 Jobs

**Metrics:**
- Query time: < 500ms
- Pagination support: Yes
- Memory efficient: No full load

---

## Security Tests

### Security Test 1: SQL Injection

**Input:**
```json
{
  "job_id": "mcp-123'; DROP TABLE agent_jobs; --"
}
```

**Expected:** Safe parameterized query, no SQL execution

### Security Test 2: XSS in job_data

**Input:**
```json
{
  "metadata": {
    "note": "<script>alert('xss')</script>"
  }
}
```

**Expected:** Data stored as-is, sanitized on output

---

## Test Execution Commands

### Manual Testing via curl

```bash
# 1. Queue Job
curl -X POST https://dfo.solaria.agency/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer default" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "queue_agent_job",
      "arguments": {
        "task_id": 537,
        "agent_id": 11,
        "format": "human"
      }
    }
  }'

# 2. Get Status
curl -X POST https://dfo.solaria.agency/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer default" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_agent_job_status",
      "arguments": {
        "job_id": "mcp-...-xyz",
        "format": "human"
      }
    }
  }'

# 3. List Active Jobs
curl -X POST https://dfo.solaria.agency/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer default" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_active_agent_jobs",
      "arguments": {
        "format": "human"
      }
    }
  }'

# 4. Cancel Job
curl -X POST https://dfo.solaria.agency/mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer default" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "cancel_agent_job",
      "arguments": {
        "job_id": "mcp-...-xyz",
        "format": "human"
      }
    }
  }'
```

---

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Valid Job Queue | ⏳ Pending | |
| 1.2 Invalid Task ID | ⏳ Pending | |
| 1.3 Invalid Agent ID | ⏳ Pending | |
| 1.4 Zod Validation | ⏳ Pending | |
| 1.5 Priority Mapping | ⏳ Pending | |
| 2.1 Get Existing Job | ⏳ Pending | |
| 2.2 Non-Existent Job | ⏳ Pending | |
| 2.3 Job with Error | ⏳ Pending | |
| 3.1 List All Jobs | ⏳ Pending | |
| 3.2 Filter by Project | ⏳ Pending | |
| 3.3 No Active Jobs | ⏳ Pending | |
| 4.1 Cancel Waiting | ⏳ Pending | |
| 4.2 Cancel Active | ⏳ Pending | |
| 4.3 Cancel Completed | ⏳ Pending | |
| 4.4 Cancel Non-Existent | ⏳ Pending | |
| INT-1 Full Lifecycle | ⏳ Pending | |
| INT-2 Multiple Agents | ⏳ Pending | |
| INT-3 Priority Queue | ⏳ Pending | |

---

## Conclusion

This test plan covers:
- ✅ 15 unit test cases
- ✅ 3 integration test scenarios
- ✅ 3 error handling tests
- ✅ 2 performance tests
- ✅ 2 security tests

**Total Test Coverage:** 25 test scenarios

**Next Steps:**
1. Execute manual tests via curl against production MCP
2. Implement automated test suite in `/mcp-server/tests/agent-execution.test.ts`
3. Add to CI/CD pipeline
4. Update DFO-189 documentation in CLAUDE.md

---

**Test Plan Created:** 2026-01-01
**Version:** 1.0
**Status:** Ready for Execution
