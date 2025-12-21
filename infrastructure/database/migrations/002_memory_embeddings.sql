-- ============================================================================
-- Migration 002: Memory Embeddings - SOLARIA DFO
-- Date: 2025-12-21
-- Purpose: Add vector embedding storage for semantic search capabilities
-- Model: Xenova/all-MiniLM-L6-v2 (384 dimensions)
-- ============================================================================

-- Step 1: Add embedding columns to memories table
ALTER TABLE memories
    ADD COLUMN embedding JSON DEFAULT NULL COMMENT 'Vector embedding (384 dimensions, stored as JSON array)',
    ADD COLUMN embedding_model VARCHAR(100) DEFAULT NULL COMMENT 'Model used for embedding generation',
    ADD COLUMN embedding_version INT DEFAULT 1 COMMENT 'Embedding version for reprocessing tracking',
    ADD COLUMN embedding_generated_at TIMESTAMP NULL COMMENT 'When embedding was generated';

-- Step 2: Add index for finding memories without embeddings (for backfill)
ALTER TABLE memories
    ADD INDEX idx_embedding_pending (embedding_generated_at);

-- Step 3: Create embedding jobs table for queue tracking
CREATE TABLE IF NOT EXISTS embedding_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    memory_id INT NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_memory (memory_id),
    INDEX idx_pending_order (status, created_at),
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Create embedding cache table for query embeddings
CREATE TABLE IF NOT EXISTS embedding_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA-256 hash of the query text',
    query_text VARCHAR(512) NOT NULL COMMENT 'Original query text (truncated)',
    embedding JSON NOT NULL COMMENT 'Cached embedding vector',
    hit_count INT DEFAULT 1 COMMENT 'Number of cache hits',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hash (query_hash),
    INDEX idx_last_accessed (last_accessed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Add embedding stats tracking
CREATE TABLE IF NOT EXISTS embedding_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    embeddings_generated INT DEFAULT 0,
    searches_performed INT DEFAULT 0,
    cache_hits INT DEFAULT 0,
    avg_similarity DECIMAL(5, 4) DEFAULT 0,
    avg_generation_ms INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Verification queries (run manually to verify)
-- ============================================================================
-- DESCRIBE memories;
-- SELECT COUNT(*) as memories_without_embeddings FROM memories WHERE embedding IS NULL;
-- SELECT * FROM embedding_jobs LIMIT 10;
-- SELECT * FROM embedding_cache LIMIT 10;
