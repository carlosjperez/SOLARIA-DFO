#!/bin/bash

# ============================================================================
# MCP Agent Execution Tools - Test Script
# Task: DFO-189 - Test MCP Tools
# Date: 2025-12-30
# ============================================================================

set -e

BASE_URL="https://dfo.solaria.agency/mcp"
TOKEN="default"

echo "============================================================================"
echo "SOLARIA DFO - MCP Agent Execution Tools Test"
echo "Environment: Production ($BASE_URL)"
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

# Helper to call MCP tool
call_mcp_tool() {
    local tool_name=$1
    local params=$2

    curl -s -X POST "$BASE_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{
            \"jsonrpc\": \"2.0\",
            \"id\": 1,
            \"method\": \"tools/call\",
            \"params\": {
                \"name\": \"$tool_name\",
                \"arguments\": $params
            }
        }"
}

# ============================================================================
# Test 1: list_active_agent_jobs - List current jobs
# ============================================================================

echo "============================================================================"
echo "Test 1: list_active_agent_jobs - List active agent jobs"
echo "============================================================================"

RESPONSE=$(call_mcp_tool "list_active_agent_jobs" "{}")
ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')

if [ -z "$ERROR" ]; then
    test_result "list_active_agent_jobs returns successfully" 0
    echo "  Response:"
    echo "$RESPONSE" | jq '.result.content[0].text' -r | head -20
else
    test_result "list_active_agent_jobs" 1
    echo "  Error: $ERROR"
fi
echo ""

# ============================================================================
# Test 2: queue_agent_job - Queue a new job
# ============================================================================

echo "============================================================================"
echo "Test 2: queue_agent_job - Queue new job for Task #1, Agent #11"
echo "============================================================================"

QUEUE_PARAMS='{
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
}'

RESPONSE=$(call_mcp_tool "queue_agent_job" "$QUEUE_PARAMS")
ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')

if [ -z "$ERROR" ]; then
    test_result "queue_agent_job succeeds" 0

    # Extract job ID from response
    JOB_ID=$(echo "$RESPONSE" | jq -r '.result.content[0].text' | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$JOB_ID" ]; then
        echo "  Job ID: $JOB_ID"
        test_result "Job ID extracted successfully" 0
    else
        echo "  Warning: Could not extract job ID"
        test_result "Job ID extraction" 1
    fi

    echo "  Response:"
    echo "$RESPONSE" | jq '.result.content[0].text' -r | head -15
else
    test_result "queue_agent_job" 1
    echo "  Error: $ERROR"
    JOB_ID=""
fi
echo ""

# ============================================================================
# Test 3: get_agent_job_status - Get job status
# ============================================================================

echo "============================================================================"
echo "Test 3: get_agent_job_status - Get status of queued job"
echo "============================================================================"

if [ -n "$JOB_ID" ]; then
    STATUS_PARAMS="{\"jobId\": \"$JOB_ID\"}"

    RESPONSE=$(call_mcp_tool "get_agent_job_status" "$STATUS_PARAMS")
    ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')

    if [ -z "$ERROR" ]; then
        test_result "get_agent_job_status succeeds" 0
        echo "  Response:"
        echo "$RESPONSE" | jq '.result.content[0].text' -r | head -20
    else
        test_result "get_agent_job_status" 1
        echo "  Error: $ERROR"
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} get_agent_job_status (no job ID from previous test)"
fi
echo ""

# ============================================================================
# Test 4: cancel_agent_job - Cancel the job
# ============================================================================

echo "============================================================================"
echo "Test 4: cancel_agent_job - Cancel the queued job"
echo "============================================================================"

if [ -n "$JOB_ID" ]; then
    CANCEL_PARAMS="{\"jobId\": \"$JOB_ID\"}"

    RESPONSE=$(call_mcp_tool "cancel_agent_job" "$CANCEL_PARAMS")
    ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')

    if [ -z "$ERROR" ]; then
        test_result "cancel_agent_job succeeds" 0
        echo "  Response:"
        echo "$RESPONSE" | jq '.result.content[0].text' -r | head -15
    else
        test_result "cancel_agent_job" 1
        echo "  Error: $ERROR"
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} cancel_agent_job (no job ID from previous test)"
fi
echo ""

# ============================================================================
# Test 5: Error cases
# ============================================================================

echo "============================================================================"
echo "Test 5: Error Handling - Invalid parameters"
echo "============================================================================"

# Test 5.1: queue_agent_job with invalid task ID
echo "Test 5.1: queue_agent_job with non-existent task ID"
INVALID_PARAMS='{"taskId": 999999, "agentId": 11}'
RESPONSE=$(call_mcp_tool "queue_agent_job" "$INVALID_PARAMS")
ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')

if [ -n "$ERROR" ]; then
    test_result "Properly rejects invalid task ID" 0
    echo "  Error (expected): $(echo "$ERROR" | jq -r '.message')"
else
    test_result "Should reject invalid task ID" 1
fi
echo ""

# Test 5.2: get_agent_job_status with non-existent job
echo "Test 5.2: get_agent_job_status with non-existent job ID"
INVALID_JOB='{"jobId": "non-existent-job-id"}'
RESPONSE=$(call_mcp_tool "get_agent_job_status" "$INVALID_JOB")
ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')

if [ -n "$ERROR" ]; then
    test_result "Properly rejects non-existent job ID" 0
    echo "  Error (expected): $(echo "$ERROR" | jq -r '.message')"
else
    test_result "Should reject non-existent job ID" 1
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
    echo -e "${GREEN}✓ All MCP tools tested successfully!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
