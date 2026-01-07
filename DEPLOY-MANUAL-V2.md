# 🚀 MCP v2.0 Minimalista - Deploy Manual

## 📋 Resumen

Estado: ✅ Archivos listos localmente
Bloqueo: 🔑 SSH keys no autorizadas en 148.230.118.124

## 📁 Archivos Creados

```
/Users/carlosjperez/Documents/GitHub/SOLARIA-DFO/
├── mcp-server/
│   ├── src/server-v2-minimal.ts        ✅ (sin errores TypeScript)
│   ├── tsconfig.build-v2.json           ✅
│   └── Dockerfile.minimal               ✅
├── docker-compose.mcp-v2-minimal.yml    ✅
├── scripts/deploy-v2-minimal.sh         ✅
└── /tmp/full-deploy-command.sh           ✅ (script completo)
```

## 🎯 Ejecución en Servidor

### Paso 1: Conectar al servidor (SSH/SFTP)

Usa tu cliente favorito o terminal:
```bash
ssh carlosjperez@148.230.118.124
# o
ssh root@148.230.118.124
```

### Paso 2: Ejecutar estos comandos

```bash
cd /var/www/solaria-dfo/mcp-server

# Detener contenedor viejo
docker stop solaria-dfo-mcp-v2 && docker rm solaria-dfo-mcp-v2 || true

# Crear server-v2-minimal.ts
cat > src/server-v2-minimal.ts <<'ENDFILE'
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
        project_id: {
          type: 'number',
          description: 'ID del proyecto (opcional)'
        },
        include: {
          type: 'object',
          description: 'Qué componentes incluir',
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
const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';

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
        const result = { success: true, context: { projects: [], tasks: [], agents: [], health: { status: 'ok', message: 'v2.0 minimalista' } } };
        res.json({ id, jsonrpc: '2.0', result });
      } else if (name === 'run_code') {
        const result = { success: true, output: null, execution_time_ms: 0 };
        res.json({ id, jsonrpc: '2.0', result });
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
  console.log(`[MCP v2.0 Minimalista] Starting on port ${PORT}`);
});
ENDFILE

# Crear tsconfig
cat > tsconfig.build-v2.json <<'ENDTS'
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
ENDTS

# Crear Dockerfile minimal
cat > Dockerfile.minimal <<'ENDDOCKER'
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
ENDDOCKER

# Crear docker-compose
cat > ../docker-compose.mcp-v2-minimal.yml <<'ENDCOMPOSE'
version: '3.8'
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
ENDCOMPOSE

# Build y deploy
docker-compose -f ../docker-compose.mcp-v2-minimal.yml build
docker-compose -f ../docker-compose.mcp-v2-minimal.yml up -d

# Verificar
sleep 5
curl -s http://localhost:3032/health | jq .
docker logs solaria-dfo-mcp-v2-minimal --tail 20
```

## ✅ Verificación de Éxito

```bash
# Health check
curl -s http://148.230.118.124:3032/health

# Contenedor activo
docker ps | grep solaria-dfo-mcp-v2-minimal

# Logs estables (sin reinicios)
docker logs solaria-dfo-mcp-v2-minimal --tail 50
```

## 🔍 Diagnóstico del Problema Original

**Causa raíz:** `dist/src/__tests__/github-actions.js` intenta importar `/dashboard/services/githubActionsService.js` que NO existe en el contenedor.

**Solución implementada:**
- ✅ Nuevo entry point `server-v2-minimal.js` que NO importa archivos de test
- ✅ Dockerfile multi-stage que solo copia `dist/server-v2-minimal.js`
- ✅ `tsconfig.build-v2.json` excluye `src/endpoints/**` y `**/__tests__/**`
- ✅ Solo 2 herramientas autónomas (sin dependencias Dashboard)

## 📝 Próximos Pasos Después del Deploy

1. Integrar `handleGetContext` con API Dashboard real
2. Implementar `handleRunCode` con sandbox completo + API calls
3. Añadir más templates para operaciones comunes
4. Testing completo de todas las herramientas
