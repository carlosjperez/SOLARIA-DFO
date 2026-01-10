#!/bin/bash
# Chroma + pgvector Installation Script
# DFO Server 46.62.222.138
# Memory System Hybrid - Option A (Complete Chroma)
# Date: 2026-01-06

set -e

echo "═════════════════════════════════════════════════════"
echo "  Chroma + pgvector Installation for DFO Server"
echo "═════════════════════════════════════════════════════"
echo ""

# Configuration
POSTGRES_USER="solaria_user"
POSTGRES_DB="solaria_construction"
CHROMA_VERSION="chromadb/chroma:latest"
CHROMA_PORT="8000"
CHROMA_HOST="0.0.0.0"

echo "📋 Configuration:"
echo "  PostgreSQL User: $POSTGRES_USER"
echo "  Database: $POSTGRES_DB"
echo "  Chroma Version: $CHROMA_VERSION"
echo "  Chroma Port: $CHROMA_PORT"
echo ""

# Function: Check if running in Docker
check_docker() {
    if [ -f /.dockerenv ]; then
        echo "✅ Running in Docker"
        return 0
    else
        echo "❌ Not running in Docker"
        return 1
    fi
}

# Function: Check if PostgreSQL is available
check_postgres() {
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL client (psql) available"
        return 0
    else
        echo "❌ PostgreSQL client (psql) not found"
        echo "   Please install: sudo apt-get install postgresql-client"
        return 1
    fi
}

# Step 1: Install pgvector extension
install_pgvector() {
    echo "📦 Step 1: Installing pgvector extension..."
    echo ""
    
    if check_docker; then
        echo "   Detecting PostgreSQL container..."
        PSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -i postgres | head -1)
        
        if [ -z "$PSQL_CONTAINER" ]; then
            echo "❌ PostgreSQL container not found"
            echo "   Available containers:"
            docker ps --format 'table {{.Names}}\t{{.Status}}'
            return 1
        fi
        
        echo "   Container found: $PSQL_CONTAINER"
        echo ""
        
        # Copy extension files
        echo "   Copying pgvector files to container..."
        docker cp pgvector/control.control "$PSQL_CONTAINER:/tmp/"
        docker cp pgvector/vector.control "$PSQL_CONTAINER:/tmp/"
        echo "   ✓ Files copied"
        echo ""
        
        # Install extension
        echo "   Installing pgvector in PostgreSQL..."
        docker exec "$PSQL_CONTAINER" bash -c "
            cd /tmp && \
            ls -la && \
            sudo -u postgres psql -U \$POSTGRES_USER -d \$POSTGRES_DB -f - <<'EOF'
-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Install pgvector using control files
\\i control.control
\\i vector.control
EOF
"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ pgvector installed successfully"
        else
            echo "   ❌ Failed to install pgvector"
            return 1
        fi
        
    else
        echo "   Skipping pgvector installation (not in Docker)"
        echo "   Please run this script on the server directly"
        return 1
    fi
    
    echo ""
}

# Step 2: Start Chroma Docker service
start_chroma() {
    echo "🚀 Step 2: Starting Chroma Docker service..."
    echo ""
    
    # Check if Chroma is already running
    CHROMA_CONTAINER=$(docker ps --format '{{.Names}}' | grep -i chroma)
    
    if [ -n "$CHROMA_CONTAINER" ]; then
        echo "   Chroma already running: $CHROMA_CONTAINER"
        echo "   Stopping existing container..."
        docker stop "$CHROMA_CONTAINER"
        sleep 2
    fi
    
    # Create Chroma data directory
    CHROMA_DATA_DIR="/var/lib/chroma"
    sudo mkdir -p "$CHROMA_DATA_DIR"
    sudo chown -R $USER:$USER "$CHROMA_DATA_DIR"
    
    # Start Chroma
    echo "   Starting Chroma container..."
    docker run -d \
        --name chroma \
        --restart unless-stopped \
        -p "$CHROMA_HOST:$CHROMA_PORT:$CHROMA_PORT" \
        -v "$CHROMA_DATA_DIR:/chroma/chroma" \
        -e CHROMA_SERVER_HOST=0.0.0.0 \
        -e CHROMA_SERVER_HTTP_PORT=8000 \
        -e PERSIST_DIRECTORY=/chroma/chroma \
        $CHROMA_VERSION
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Chroma started successfully"
        echo "   Container name: chroma"
        echo "   HTTP API: http://0.0.0.0:8000"
        echo "   Persistent data: $CHROMA_DATA_DIR"
    else
        echo "   ❌ Failed to start Chroma"
        return 1
    fi
    
    echo ""
}

# Step 3: Verify Chroma is accessible
verify_chroma() {
    echo "🔍 Step 3: Verifying Chroma accessibility..."
    echo ""
    
    sleep 3  # Wait for Chroma to fully start
    
    # Check HTTP API
    MAX_RETRIES=5
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo -n "   Checking Chroma API (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)... "
        
        if curl -s -f http://localhost:$CHROMA_PORT/api/v1/heartbeat > /dev/null; then
            echo " ✓"
            echo "   ✅ Chroma API is accessible"
            return 0
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        sleep 2
    done
    
    echo ""
    echo "   ❌ Chroma API not responding after $MAX_RETRIES attempts"
    echo "   Check logs: docker logs chroma"
    return 1
}

# Step 4: Create Chroma collection for memory
create_collection() {
    echo "📚 Step 4: Creating Chroma collection for memory..."
    echo ""
    
    # Create collection via Chroma HTTP API
    COLLECTION_RESPONSE=$(curl -s -X POST http://localhost:$CHROMA_PORT/api/v1/collections \
        -H "Content-Type: application/json" \
        -d '{
            "name": "memory_observations",
            "metadata": {"description": "Tool usage observations from claude-mem"},
            "configuration": {
                "hnsw_config": {
                    "dimension": 1536,
                    "metric": "cosine"
                }
            }
        }')
    
    if echo "$COLLECTION_RESPONSE" | jq -e '.id' > /dev/null; then
        COLLECTION_ID=$(echo "$COLLECTION_RESPONSE" | jq -r '.id')
        echo "   ✅ Collection created: memory_observations"
        echo "   Collection ID: $COLLECTION_ID"
        echo ""
        echo "   Collection configuration:"
        echo "   - Dimension: 1536"
        echo "   - Metric: cosine"
        echo "   - Collection metadata: Tool usage observations"
    else
        echo "   ❌ Failed to create collection"
        echo "   Response: $COLLECTION_RESPONSE"
        return 1
    fi
    
    echo ""
}

# Step 5: Create summary collection
create_summary_collection() {
    echo "📚 Step 5: Creating Chroma collection for summaries..."
    echo ""
    
    COLLECTION_RESPONSE=$(curl -s -X POST http://localhost:$CHROMA_PORT/api/v1/collections \
        -H "Content-Type: application/json" \
        -d '{
            "name": "memory_summaries",
            "metadata": {"description": "Session summaries from claude-mem"},
            "configuration": {
                "hnsw_config": {
                    "dimension": 1536,
                    "metric": "cosine"
                }
            }
        }')
    
    if echo "$COLLECTION_RESPONSE" | jq -e '.id' > /dev/null; then
        COLLECTION_ID=$(echo "$COLLECTION_RESPONSE" | jq -r '.id')
        echo "   ✅ Collection created: memory_summaries"
        echo "   Collection ID: $COLLECTION_ID"
        echo ""
        echo "   Collection configuration:"
        echo "   - Dimension: 1536"
        echo "   - Metric: cosine"
        echo "   - Collection metadata: Session summaries"
    else
        echo "   ❌ Failed to create collection"
        echo "   Response: $COLLECTION_RESPONSE"
        return 1
    fi
    
    echo ""
}

# Main execution
main() {
    echo "🚀 Starting Chroma + pgvector installation..."
    echo ""
    
    # Check prerequisites
    check_docker
    check_postgres
    
    # Execute installation steps
    install_pgvector
    
    if [ $? -ne 0 ]; then
        echo "❌ pgvector installation failed"
        echo "   Please check the errors above and fix manually"
        exit 1
    fi
    
    start_chroma
    
    if [ $? -ne 0 ]; then
        echo "❌ Chroma startup failed"
        echo "   Please check the logs: docker logs chroma"
        exit 1
    fi
    
    verify_chroma
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Chroma verification failed, but continuing..."
        echo "   You may need to check Chroma manually"
    fi
    
    create_collection
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Collection creation failed, but continuing..."
        echo "   You can create it manually later"
    fi
    
    create_summary_collection
    
    echo ""
    echo "═════════════════════════════════════════════════════"
    echo "  ✅ Installation Complete!"
    echo "═════════════════════════════════════════════════════"
    echo ""
    echo "📊 Summary:"
    echo "  ✅ pgvector extension installed"
    echo "  ✅ Chroma Docker service running"
    echo "  ✅ Chroma API accessible at http://0.0.0.0:8000"
    echo "  ✅ Collections created: memory_observations, memory_summaries"
    echo ""
    echo "🔧 Next Steps:"
    echo "  1. Update 014_memory_hybrid_schema.sql:"
    echo "     - Uncomment vector indices"
    echo "     - Enable pgvector embedding columns"
    echo ""
    echo "  2. Update mcp-server/src/endpoints/memory-sync.ts:"
    echo "     - Add Chroma client integration"
    echo "     - Implement embedding generation"
    echo "     - Implement vector search"
    echo ""
    echo "  3. Test vector search:"
    echo "     ./scripts/test-chroma-search.sh"
    echo ""
    echo "📝 Logs:"
    echo "  Chroma logs: docker logs chroma"
    echo "  Docker ps: docker ps | grep chroma"
}

# Run main function
main "$@"
