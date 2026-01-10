#!/bin/bash

set -e

echo "========================================="
echo "Deploy MCP v2.0 Minimalista"
echo "========================================="

WORK_DIR="/var/www/solaria-dfo/mcp-server"

cd $WORK_DIR

echo ""
echo "Step 1: Upload files from local (if any)"
echo "   - mcp-server/src/server-v2-minimal.ts"
echo "   - mcp-server/tsconfig.build-v2.json"
echo "   - mcp-server/Dockerfile.minimal"
echo "   - docker-compose.mcp-v2-minimal.yml"
echo ""
echo "Upload these files manually or ensure they exist."

echo ""
echo "Step 2: Stop and remove old container"
docker stop solaria-dfo-mcp-v2 || true
docker rm solaria-dfo-mcp-v2 || true

echo ""
echo "Step 3: Build new image"
docker-compose -f docker-compose.mcp-v2-minimal.yml build

echo ""
echo "Step 4: Start new container"
docker-compose -f docker-compose.mcp-v2-minimal.yml up -d

echo ""
echo "Step 5: Verify health check"
sleep 5
curl -s http://localhost:3032/health | jq .

echo ""
echo "Step 6: Check container status"
docker ps | grep solaria-dfo-mcp-v2-minimal

echo ""
echo "Step 7: View logs"
docker logs solaria-dfo-mcp-v2-minimal --tail 20

echo ""
echo "========================================="
echo "Deploy complete!"
echo "========================================="
echo ""
echo "Monitor logs with: docker logs -f solaria-dfo-mcp-v2-minimal"
echo "Check health with: curl http://148.230.118.124:3032/health"
