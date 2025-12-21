# Worker container for background job processing with vector embeddings
# Uses Transformers.js for local embedding generation
FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies for Transformers.js ONNX runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create models directory for caching (persisted via volume)
RUN mkdir -p /app/models /app/.cache

# Set cache directories for Hugging Face models
ENV HF_HOME=/app/.cache/huggingface \
    TRANSFORMERS_CACHE=/app/.cache/huggingface \
    XDG_CACHE_HOME=/app/.cache

# Install dependencies
COPY workers/package*.json ./
RUN npm ci

# Copy worker code
COPY workers/. .

# Environment variables
ENV NODE_ENV=production \
    REDIS_URL=redis://redis:6379 \
    DB_HOST=office \
    DB_PORT=3306 \
    DB_USER=solaria_user \
    DB_PASSWORD=solaria2024 \
    DB_NAME=solaria_construction \
    EMBEDDING_HTTP_PORT=3032

# Expose embedding HTTP server port
EXPOSE 3032

# Health check that tests Redis connectivity and HTTP server
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:3032/health || exit 1

# Run worker
CMD ["node", "index.js"]
