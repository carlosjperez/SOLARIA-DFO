#!/bin/bash

# Get auth token
TOKEN=$(curl -s -X POST https://dfo.solaria.agency/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"carlosjperez","password":"bypass"}' | jq -r '.token')

echo "Token: ${TOKEN:0:20}..."
echo ""

# Test GitHub trigger workflow endpoint
echo "Testing POST /api/github/trigger-workflow"
curl -s -X POST https://dfo.solaria.agency/api/github/trigger-workflow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}' | head -50
