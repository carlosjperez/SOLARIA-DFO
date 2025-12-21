/**
 * SOLARIA DFO - Embedding HTTP Server
 * Provides HTTP endpoint for real-time embedding generation
 * Port: 3032 (configurable via EMBEDDING_HTTP_PORT)
 */

import express from 'express';
import {
    generateEmbedding,
    generateEmbeddingBatch,
    cosineSimilarity,
    getModelInfo,
    initializeModel,
    isReady
} from './embedding-service.js';

const PORT = parseInt(process.env.EMBEDDING_HTTP_PORT || '3032', 10);

let app = null;
let server = null;

/**
 * Start the HTTP server for embedding generation
 * @returns {Promise<void>}
 */
export async function startHttpServer() {
    app = express();
    app.use(express.json({ limit: '1mb' }));

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            service: 'embedding-server',
            modelReady: isReady(),
            timestamp: new Date().toISOString()
        });
    });

    // Model info endpoint
    app.get('/info', (req, res) => {
        res.json(getModelInfo());
    });

    // Generate single embedding
    app.post('/embed', async (req, res) => {
        try {
            const { text } = req.body;

            if (!text || typeof text !== 'string') {
                return res.status(400).json({
                    error: 'Missing or invalid "text" field',
                    code: 'INVALID_INPUT'
                });
            }

            const result = await generateEmbedding(text);

            res.json({
                success: true,
                embedding: result.embedding,
                model: result.model,
                version: result.version,
                dimensions: result.dimensions,
                processingMs: result.processingMs,
                truncated: result.truncated
            });
        } catch (error) {
            console.error('[http-server] Embedding error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'EMBEDDING_FAILED'
            });
        }
    });

    // Generate batch embeddings
    app.post('/embed/batch', async (req, res) => {
        try {
            const { texts } = req.body;

            if (!Array.isArray(texts) || texts.length === 0) {
                return res.status(400).json({
                    error: 'Missing or invalid "texts" array',
                    code: 'INVALID_INPUT'
                });
            }

            if (texts.length > 100) {
                return res.status(400).json({
                    error: 'Batch size exceeds maximum of 100',
                    code: 'BATCH_TOO_LARGE'
                });
            }

            const results = await generateEmbeddingBatch(texts);

            res.json({
                success: true,
                results,
                count: results.length,
                successCount: results.filter(r => r.success).length
            });
        } catch (error) {
            console.error('[http-server] Batch embedding error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'BATCH_EMBEDDING_FAILED'
            });
        }
    });

    // Calculate similarity between two embeddings
    app.post('/similarity', (req, res) => {
        try {
            const { embedding1, embedding2 } = req.body;

            if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
                return res.status(400).json({
                    error: 'Both embedding1 and embedding2 must be arrays',
                    code: 'INVALID_INPUT'
                });
            }

            const similarity = cosineSimilarity(embedding1, embedding2);

            res.json({
                success: true,
                similarity,
                dimensionsMatch: embedding1.length === embedding2.length
            });
        } catch (error) {
            console.error('[http-server] Similarity error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'SIMILARITY_FAILED'
            });
        }
    });

    // Preload model endpoint (useful for warming up)
    app.post('/preload', async (req, res) => {
        try {
            if (isReady()) {
                return res.json({
                    success: true,
                    message: 'Model already loaded',
                    modelInfo: getModelInfo()
                });
            }

            const startTime = Date.now();
            await initializeModel();
            const loadTime = Date.now() - startTime;

            res.json({
                success: true,
                message: 'Model loaded successfully',
                loadTimeMs: loadTime,
                modelInfo: getModelInfo()
            });
        } catch (error) {
            console.error('[http-server] Preload error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'PRELOAD_FAILED'
            });
        }
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error('[http-server] Unhandled error:', err);
        res.status(500).json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    });

    // Start server
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`[http-server] Embedding server listening on port ${PORT}`);
            console.log(`[http-server] Endpoints:`);
            console.log(`  GET  /health     - Health check`);
            console.log(`  GET  /info       - Model information`);
            console.log(`  POST /embed      - Generate single embedding`);
            console.log(`  POST /embed/batch - Generate batch embeddings`);
            console.log(`  POST /similarity - Calculate cosine similarity`);
            console.log(`  POST /preload    - Preload model into memory`);
            resolve();
        });

        server.on('error', (error) => {
            console.error('[http-server] Server error:', error.message);
            reject(error);
        });
    });
}

/**
 * Stop the HTTP server
 * @returns {Promise<void>}
 */
export async function stopHttpServer() {
    if (server) {
        return new Promise((resolve) => {
            server.close(() => {
                console.log('[http-server] Server stopped');
                resolve();
            });
        });
    }
}

export { PORT };
