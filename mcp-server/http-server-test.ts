/**
 * Test HTTP Server for MCP - Port 3032
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { handleMCPRequest, listTools } from './handlers.js';

const app = express();
const PORT = 3032;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check
app.get('/mcp/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        dashboard: 'connected',
        sessions: 0
    });
});

// MCP endpoint
app.post('/mcp', async (req, res) => {
    try {
        const response = await handleMCPRequest(req.body);
        res.json(response);
    } catch (error: any) {
        res.status(500).json({
            jsonrpc: '2.0',
            id: req.body.id,
            error: {
                code: -32603,
                message: 'Internal error',
                data: error.message
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`MCP Test Server listening on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/mcp/health`);
    console.log(`MCP: http://localhost:${PORT}/mcp`);
});
