#!/bin/bash

echo "Test 1: list_active_agent_jobs"
curl -s -X POST https://dfo.solaria.agency/mcp \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer default' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_active_agent_jobs","arguments":{}}}' \
  | jq -r '.result.content[0].text' | head -20

echo ""
echo "Test 2: queue_agent_job"
curl -s -X POST https://dfo.solaria.agency/mcp \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer default' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"queue_agent_job","arguments":{"taskId":1,"agentId":11,"metadata":{"priority":"high"}}}}' \
  | jq -r '.result.content[0].text' | head -20
