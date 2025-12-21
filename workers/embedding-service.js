/**
 * SOLARIA DFO - Embedding Service
 * Uses Transformers.js for local embedding generation
 * Model: Xenova/all-MiniLM-L6-v2 (384 dimensions)
 */

import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js for local execution
env.allowLocalModels = true;
env.useBrowserCache = false;

// Model configuration
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSIONS = 384;
const MODEL_VERSION = 1;
const MAX_TEXT_LENGTH = 512; // Model's max token limit

// Singleton pattern for model pipeline
let embeddingPipeline = null;
let modelLoadingPromise = null;
let isModelReady = false;

/**
 * Initialize the embedding model (cached after first load)
 * First load takes ~3-5 seconds, subsequent calls are instant
 * @returns {Promise<Function>} The embedding pipeline
 */
export async function initializeModel() {
    if (embeddingPipeline) {
        return embeddingPipeline;
    }

    if (modelLoadingPromise) {
        return modelLoadingPromise;
    }

    modelLoadingPromise = (async () => {
        console.log('[embedding] Loading model:', MODEL_NAME);
        const startTime = Date.now();

        try {
            embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
                quantized: true, // Use quantized model for faster inference
            });

            const loadTime = Date.now() - startTime;
            console.log(`[embedding] Model loaded successfully in ${loadTime}ms`);
            isModelReady = true;

            return embeddingPipeline;
        } catch (error) {
            console.error('[embedding] Failed to load model:', error.message);
            modelLoadingPromise = null;
            throw error;
        }
    })();

    return modelLoadingPromise;
}

/**
 * Check if the model is ready
 * @returns {boolean}
 */
export function isReady() {
    return isModelReady;
}

/**
 * Generate embedding for text content
 * @param {string} text - Text to embed
 * @returns {Promise<{embedding: number[], model: string, version: number, dimensions: number, processingMs: number}>}
 */
export async function generateEmbedding(text) {
    const startTime = Date.now();

    if (!text || typeof text !== 'string') {
        throw new Error('Text must be a non-empty string');
    }

    const pipe = await initializeModel();

    // Truncate text if too long (model has max token limit)
    const truncatedText = text.substring(0, MAX_TEXT_LENGTH).trim();

    if (truncatedText.length === 0) {
        throw new Error('Text is empty after truncation');
    }

    // Generate embedding
    const output = await pipe(truncatedText, {
        pooling: 'mean',
        normalize: true
    });

    // Convert to regular array
    const embedding = Array.from(output.data);

    const processingMs = Date.now() - startTime;

    return {
        embedding,
        model: MODEL_NAME,
        version: MODEL_VERSION,
        dimensions: EMBEDDING_DIMENSIONS,
        processingMs,
        truncated: text.length > MAX_TEXT_LENGTH
    };
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<Array<{embedding: number[], processingMs: number}>>}
 */
export async function generateEmbeddingBatch(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error('Texts must be a non-empty array');
    }

    const results = [];

    for (const text of texts) {
        try {
            const result = await generateEmbedding(text);
            results.push({ success: true, ...result });
        } catch (error) {
            results.push({ success: false, error: error.message });
        }
    }

    return results;
}

/**
 * Calculate cosine similarity between two embeddings
 * @param {number[]} a - First embedding
 * @param {number[]} b - Second embedding
 * @returns {number} Similarity score 0-1
 */
export function cosineSimilarity(a, b) {
    if (!a || !b) {
        return 0;
    }

    if (a.length !== b.length) {
        console.warn(`[embedding] Dimension mismatch: ${a.length} vs ${b.length}`);
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Find top K most similar embeddings from a list
 * @param {number[]} queryEmbedding - The query embedding
 * @param {Array<{id: number, embedding: number[]}>} candidates - List of candidate embeddings
 * @param {number} topK - Number of results to return
 * @param {number} minSimilarity - Minimum similarity threshold
 * @returns {Array<{id: number, similarity: number}>}
 */
export function findTopKSimilar(queryEmbedding, candidates, topK = 10, minSimilarity = 0.5) {
    const results = candidates
        .map(candidate => ({
            id: candidate.id,
            similarity: cosineSimilarity(queryEmbedding, candidate.embedding)
        }))
        .filter(r => r.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

    return results;
}

/**
 * Get model info
 * @returns {Object}
 */
export function getModelInfo() {
    return {
        name: MODEL_NAME,
        dimensions: EMBEDDING_DIMENSIONS,
        version: MODEL_VERSION,
        maxTextLength: MAX_TEXT_LENGTH,
        isReady: isModelReady
    };
}

// Export constants
export { MODEL_NAME, MODEL_VERSION, EMBEDDING_DIMENSIONS, MAX_TEXT_LENGTH };
