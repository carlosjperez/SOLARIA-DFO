#!/bin/bash

# ============================================================================
# DFO 4.0 - Agent Execution API Endpoint Tests
# Task: DFO-188 - Create API Endpoints
# Date: 2025-12-30
# ============================================================================
#
# This script tests all 4 agent execution endpoints with proper authentication
# and error handling scenarios.
#
# Prerequisites:
# - Server running on http://localhost:3030 OR https://dfo.solaria.agency
# - Valid user credentials (carlosjperez / bypass)
# - jq installed for JSON parsing
#
# Usage:
#   ./agent-execution-endpoints.test.sh [local|production]
#

set -e

# Configuration
ENV=${1:-local}

if [ "$ENV" = "production" ]; then
    BASE_URL="https://dfo.solaria.agency"
else
    BASE_URL="http://localhost:3030"
fi

echo "============================================================================"
echo "DFO 4.0 - Agent Execution API Endpoint Tests"
echo "Environment: $ENV ($BASE_URL)"
echo "============================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test result
test_result() {
    local test_name=$1
    local status=$2

    if [ "$status" -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} $test_name"
        ((TESTS_FAILED++))
    fi
}

# Helper function to assert HTTP status
assert_status() {
    local expected=$1
    local actual=$2
    local test_name=$3

    if [ "$expected" -eq "$actual" ]; then
        test_result "$test_name" 0
    else
        echo "  Expected status: $expected, got: $actual"
        test_result "$test_name" 1
    fi
}

echo "============================================================================"
echo "1. Authentication - Obtaining JWT Token"
echo "============================================================================"

# Get JWT token
TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"carlosjperez","password":"bypass"}')

HTTP_STATUS=$(echo "$TOKEN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TOKEN_RESPONSE" | sed '$d')

assert_status 200 "$HTTP_STATUS" "Login request successful"

if [ "$HTTP_STATUS" -eq 200 ]; then
    TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.token')
    echo "  Token obtained: ${TOKEN:0:50}..."
    echo ""
else
    echo -e "${RED}ERROR: Could not obtain authentication token. Aborting tests.${NC}"
    exit 1
fi

# ============================================================================
# Test 2: POST /api/agent-execution/queue - Queue a new job
# ============================================================================

echo "============================================================================"
echo "2. POST /api/agent-execution/queue - Queue Agent Job"
echo "============================================================================"

# Test 2.1: Unauthorized request (no token)
echo "Test 2.1: Unauthorized request (no token)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-execution/queue" \
  -H "Content-Type: application/json" \
  -d '{"taskId":1,"agentId":1}')

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 401 "$HTTP_STATUS" "Returns 401 without authentication"
echo ""

# Test 2.2: Invalid payload (missing required fields)
echo "Test 2.2: Invalid payload (missing required fields)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-execution/queue" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"taskId":"not-a-number"}')

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 400 "$HTTP_STATUS" "Returns 400 for validation errors"
echo ""

# Test 2.3: Valid request - Queue job
echo "Test 2.3: Valid request - Queue job for Task #1, Agent #11"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-execution/queue" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
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
  }')

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" -eq 201 ]; then
    test_result "Valid queue request returns 201 Created" 0
    JOB_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.jobId')
    echo "  Job ID: $JOB_ID"
    echo "  Response: $(echo "$RESPONSE_BODY" | jq -c '.data')"
else
    assert_status 201 "$HTTP_STATUS" "Valid queue request"
    echo "  Response: $RESPONSE_BODY"
fi
echo ""

# Test 2.4: Non-existent task
echo "Test 2.4: Non-existent task (taskId: 999999)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-execution/queue" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"taskId":999999,"agentId":11}')

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 404 "$HTTP_STATUS" "Returns 404 for non-existent task"
echo ""

# ============================================================================
# Test 3: GET /api/agent-execution/jobs/:id - Get Job Status
# ============================================================================

echo "============================================================================"
echo "3. GET /api/agent-execution/jobs/:id - Get Job Status"
echo "============================================================================"

# Test 3.1: Unauthorized request
echo "Test 3.1: Unauthorized request (no token)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/agent-execution/jobs/test-id")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 401 "$HTTP_STATUS" "Returns 401 without authentication"
echo ""

# Test 3.2: Non-existent job
echo "Test 3.2: Non-existent job ID"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/agent-execution/jobs/non-existent-job-id" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 404 "$HTTP_STATUS" "Returns 404 for non-existent job"
echo ""

# Test 3.3: Valid job ID (if we have one from Test 2.3)
if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    echo "Test 3.3: Valid job ID ($JOB_ID)"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/agent-execution/jobs/$JOB_ID" \
      -H "Authorization: Bearer $TOKEN")

    HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

    assert_status 200 "$HTTP_STATUS" "Returns job status successfully"
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "  Job status: $(echo "$RESPONSE_BODY" | jq -r '.data.status')"
        echo "  Progress: $(echo "$RESPONSE_BODY" | jq -r '.data.progress')%"
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} Test 3.3: No valid job ID from previous test"
fi
echo ""

# ============================================================================
# Test 4: GET /api/agent-execution/workers - Get Worker Status
# ============================================================================

echo "============================================================================"
echo "4. GET /api/agent-execution/workers - Get Worker Status"
echo "============================================================================"

# Test 4.1: Unauthorized request
echo "Test 4.1: Unauthorized request (no token)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/agent-execution/workers")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 401 "$HTTP_STATUS" "Returns 401 without authentication"
echo ""

# Test 4.2: Valid request
echo "Test 4.2: Valid request - Get worker status"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/agent-execution/workers" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" -eq 200 ]; then
    test_result "Returns worker status successfully" 0
    echo "  Queue metrics:"
    echo "    - Waiting: $(echo "$RESPONSE_BODY" | jq -r '.data.queue.waiting')"
    echo "    - Active: $(echo "$RESPONSE_BODY" | jq -r '.data.queue.active')"
    echo "    - Completed: $(echo "$RESPONSE_BODY" | jq -r '.data.queue.completed')"
    echo "    - Failed: $(echo "$RESPONSE_BODY" | jq -r '.data.queue.failed')"
    echo "    - Success Rate: $(echo "$RESPONSE_BODY" | jq -r '.data.queue.successRate')%"
    echo "  Worker config:"
    echo "    - Concurrency: $(echo "$RESPONSE_BODY" | jq -r '.data.workers.concurrency')"
    echo "    - Status: $(echo "$RESPONSE_BODY" | jq -r '.data.workers.status')"
else
    assert_status 200 "$HTTP_STATUS" "Valid worker status request"
    echo "  Response: $RESPONSE_BODY"
fi
echo ""

# ============================================================================
# Test 5: POST /api/agent-execution/jobs/:id/cancel - Cancel Job
# ============================================================================

echo "============================================================================"
echo "5. POST /api/agent-execution/jobs/:id/cancel - Cancel Job"
echo "============================================================================"

# Test 5.1: Unauthorized request
echo "Test 5.1: Unauthorized request (no token)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-execution/jobs/test-id/cancel")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 401 "$HTTP_STATUS" "Returns 401 without authentication"
echo ""

# Test 5.2: Non-existent job
echo "Test 5.2: Non-existent job ID"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-execution/jobs/non-existent-job/cancel" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
assert_status 404 "$HTTP_STATUS" "Returns 404 for non-existent job"
echo ""

# Test 5.3: Cancel valid job (if we have one)
if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    echo "Test 5.3: Cancel valid job ($JOB_ID)"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/agent-execution/jobs/$JOB_ID/cancel" \
      -H "Authorization: Bearer $TOKEN")

    HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

    # Could be 200 (success) or 404 (already completed/cancelled)
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 404 ]; then
        test_result "Cancel job request handled correctly" 0
        if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "  Job cancelled at: $(echo "$RESPONSE_BODY" | jq -r '.data.cancelledAt')"
        else
            echo "  Job could not be cancelled (may be completed already)"
        fi
    else
        test_result "Cancel job request" 1
        echo "  Response: $RESPONSE_BODY"
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} Test 5.3: No valid job ID from previous test"
fi
echo ""

# ============================================================================
# Test Summary
# ============================================================================

echo "============================================================================"
echo "Test Summary"
echo "============================================================================"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
