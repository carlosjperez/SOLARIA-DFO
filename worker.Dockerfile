# Worker container for background job processing
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY workers/package*.json ./
RUN npm ci --omit=dev

# Copy worker code
COPY workers/. .

# Environment variables
ENV NODE_ENV=production \
    REDIS_URL=redis://redis:6379

# Health check that actually tests Redis connectivity
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "const Redis = require('ioredis'); const r = new Redis(process.env.REDIS_URL); r.ping().then(() => { r.quit(); process.exit(0); }).catch(() => process.exit(1));"

# Run worker
CMD ["node", "index.js"]
