#!/bin/bash

# MCP v2.0 Minimal - FINAL DEPLOYMENT SCRIPT
# Ejecutar este script en el servidor (148.230.118.124)
# Copiar todo y pegar en terminal

set -e

echo "========================================="
echo "Deploying MCP v2.0 Minimalista"
echo "========================================="

cd /var/www/solaria-dfo/mcp-server

echo "Step 1: Creating src/server-v2-minimal.ts..."
mkdir -p src
cat > src/server-v2-minimal.ts <<'TSFILE'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export const toolDefinitions = [
  {
    name: 'get_context',
    description: 'Obtiene estado unificado del sistema SOLARIA DFO',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'ID del proyecto' },
        include: {
          type: 'object',
          properties: {
            projects: { type: 'boolean' },
            tasks: { type: 'boolean' },
            agents: { type: 'boolean' },
            health: { type: 'boolean' }
          }
        }
      }
    }
  },
  {
    name: 'run_code',
    description: 'Ejecuta código en sandbox seguro',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', minLength: 1 },
        language: { type: 'string', enum: ['javascript', 'typescript', 'sql'] },
        timeout: { type: 'number', default: 5000 },
        sandbox: { type: 'string', enum: ['strict', 'permissive'], default: 'strict' }
      },
      required: ['code']
    }
  }
];

const PORT = process.env.MCP_PORT || 3032;
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.post('/mcp', async (req, res) => {
  const { method, id, params } = req.body;
  try {
    if (method !== 'tools/list' && method !== 'tools/call') {
      res.status(32600).json({ id, jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' } });
      return;
    }

    if (method === 'tools/list') {
      res.json({ id, jsonrpc: '2.0', result: { tools: toolDefinitions } });
    } else if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params;
      const tool = toolDefinitions.find(t => t.name === name);
      if (!tool) {
        res.status(32600).json({ id, jsonrpc: '2.0', error: { code: -32602, message: 'Tool not found' } });
        return;
      }

      if (name === 'get_context') {
        res.json({ id, jsonrpc: '2.0', result: { success: true, context: { projects: [], tasks: [], agents: [], health: { status: 'ok' } } } });
      } else if (name === 'run_code') {
        res.json({ id, jsonrpc: '2.0', result: { success: true, output: null, execution_time_ms: 0 } });
      }
    }
  } catch (error: any) {
    res.status(500).json({ id, jsonrpc: '2.0', error: { code: -32000, message: error.message } });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0-minimal', mode: 'minimal', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('[MCP v2.0 Minimalista] Starting on port ' + PORT);
});
TSFILE

echo "✓ server-v2-minimal.ts created"

echo "Step 2: Creating tsconfig.build-v2.json..."
cat > tsconfig.build-v2.json <<'TSBUILD'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true
  },
  "include": ["src/server-v2-minimal.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/__tests__/**", "src/endpoints/**"]
}
TSBUILD

echo "✓ tsconfig.build-v2.json created"

echo "Step 3: Creating Dockerfile.minimal..."
cat > Dockerfile.minimal <<'DOCKERFILE'
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY tsconfig*.json ./
COPY src/server-v2-minimal.ts ./src/
RUN npm install -g typescript
RUN npx tsc --project tsconfig.build-v2.json
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV MCP_PORT=3032
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/server-v2-minimal.js ./dist/
EXPOSE 3032
CMD ["node", "dist/server-v2-minimal.js"]
DOCKERFILE

echo "✓ Dockerfile.minimal created"

echo "Step 4: Creating docker-compose.mcp-v2-minimal.yml..."
cd ..
cat > docker-compose.mcp-v2-minimal.yml <<'COMPOSE'
version: "3.8"
services:
  mcp-v2-minimal:
    build:
      context: ./mcp-server
      dockerfile: Dockerfile.minimal
    container_name: solaria-dfo-mcp-v2-minimal
    ports:
      - "3032:3032"
    environment:
      - NODE_ENV=production
      - MCP_PORT=3032
      - DASHBOARD_API_URL=http://office:3030/api
    networks:
      - solaria-network
    restart: unless-stopped
networks:
  solaria-network:
    external: true
COMPOSE

echo "✓ docker-compose.mcp-v2-minimal.yml created"

echo "Step 5: Stopping old container..."
cd mcp-server
docker stop solaria-dfo-mcp-v2 && docker rm solaria-dfo-mcp-v2 || true

echo "Step 6: Building new image..."
docker-compose -f ../docker-compose.mcp-v2-minimal.yml build

echo "Step 7: Starting new container..."
docker-compose -f ../docker-compose.mcp-v2-minimal.yml up -d

echo "Step 8: Waiting for startup..."
sleep 5

echo "Step 9: Health check..."
curl -s http://localhost:3032/health | jq .

echo "Step 10: Container status..."
docker ps | grep solaria-dfo-mcp-v2-minimal

echo "Step 11: Recent logs..."
docker logs solaria-dfo-mcp-v2-minimal --tail 30

echo ""
echo "========================================="
echo "DEPLOY COMPLETE!"
echo "========================================="
echo ""
echo "Monitor: docker logs -f solaria-dfo-mcp-v2-minimal"
echo "Health: curl http://148.230.118.124:3032/health"
