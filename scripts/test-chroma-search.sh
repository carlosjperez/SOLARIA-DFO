#!/bin/bash
# Chroma Vector Search Test
# DFO Server 46.62.222.138
# Memory System Hybrid

set -e

# Configuration
CHROMA_URL="${CHROMA_URL:-http://localhost:8000}"
COLLECTION_ID="${COLLECTION_ID:-}"
QUERY="${1:-JWT refresh}"
DFO_TOKEN="${DFO_TOKEN:-}"

echo "🔍 Chroma Vector Search Test"
echo "═══════════════════════════════════"
echo "Configuration:"
echo "  Chroma URL: $CHROMA_URL"
echo "  Collection ID: $COLLECTION_ID"
echo "  Query: $QUERY"
echo ""

# Function: Search in Chroma
test_search() {
    local query=$1
    local n_results=${2:-10}
    
    echo "🔍 Testing search for: \"$query\""
    echo "   Limit: $n_results results"
    echo ""
    
    # Create search payload
    PAYLOAD=$(jq -n \
        --arg query "$query" \
        --arg n_results "$n_results" \
        '{
            "query": {
                "texts": [$query],
                "n_results": $n_results
            },
            "include": ["metadatas", "documents", "distances"]
        }')
    
    # Call Chroma query API
    echo "   Sending request to Chroma..."
    RESPONSE=$(curl -s -X POST "$CHROMA_URL/api/v1/query" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
        --max-time 10)
    
    # Parse response
    if [ $? -eq 0 ]; then
        echo "   ✓ Response received"
        
        # Extract results
        RESULTS=$(echo "$RESPONSE" | jq -r '.results[0] // empty array fallback')
        
        if [ "$RESULTS" != "null" ] && [ -n "$RESULTS" ]; then
            RESULT_COUNT=$(echo "$RESULTS" | jq 'length')
            echo ""
            echo "   📊 Results: $RESULT_COUNT matches found"
            echo ""
            
            # Display top 5 results
            echo "$RESULTS" | jq -r '.[:5] | .[] |
                "Result \(.index + 1):",
                "  Text: \(.text)",
                "  Distance: \(.distance)",
                "  Score: \(1 - .distance)"
            '
        else
            echo "   ❌ No results found"
        fi
    else
        echo "   ❌ Request failed: curl returned $?"
    fi
    
    echo ""
}

# Function: Test add embedding
test_add_embedding() {
    local text=$1
    local collection_id=$2
    
    echo "📝 Testing add embedding for: \"$text\""
    echo "   Collection: $collection_id"
    echo ""
    
    PAYLOAD=$(jq -n \
        --arg text "$text" \
        --arg collection_id "$collection_id" \
        '{
            "documents": [
                {
                    "id": "test_doc_'"$(date +%s)"'",
                    "text": $text
                }
            ]
        }')
    
    echo "   Adding to Chroma..."
    RESPONSE=$(curl -s -X POST "$CHROMA_URL/api/v1/collections/$collection_id/add" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" \
        --max-time 10)
    
    if [ $? -eq 0 ]; then
        DOC_ID=$(echo "$RESPONSE" | jq -r '.ids[0]')
        echo "   ✓ Document added: $DOC_ID"
    else
        echo "   ❌ Failed to add document"
    fi
    
    echo ""
}

# Function: List collections
test_list_collections() {
    echo "📋 Listing Chroma collections..."
    echo ""
    
    RESPONSE=$(curl -s -X GET "$CHROMA_URL/api/v1/collections" \
        --max-time 10)
    
    if [ $? -eq 0 ]; then
        echo "   Collections:"
        echo "$RESPONSE" | jq -r '.[] | "  - Name: \(.name), ID: \(.id), Count: \(.metadata?.count)"'
    else
        echo "   ❌ Failed to list collections"
    fi
    
    echo ""
}

# Function: Get collection info
test_collection_info() {
    local collection_id=$1
    
    echo "ℹ️  Getting collection info for: $collection_id"
    echo ""
    
    RESPONSE=$(curl -s -X GET "$CHROMA_URL/api/v1/collections/$collection_id" \
        --max-time 10)
    
    if [ $? -eq 0 ]; then
        echo "   Collection Info:"
        echo "$RESPONSE" | jq '.'
    else
        echo "   ❌ Failed to get collection info"
    fi
    
    echo ""
}

# Check arguments
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 [command] [args]"
    echo ""
    echo "Commands:"
    echo "  search <query> [n_results]    - Search in Chroma (default: 10 results)"
    echo "  add <text> <collection_id>  - Add test document with embedding"
    echo "  list                          - List all collections"
    echo "  info <collection_id>          - Get collection info"
    echo "  health                         - Check Chroma health"
    echo ""
    echo "Examples:"
    echo "  $0 search \"JWT refresh\" 5"
    echo "  $0 add \"Test document\" memory_observations"
    echo "  $0 list"
    echo "  $0 health"
    exit 1
fi

COMMAND=$1
shift

# Execute command
case $COMMAND in
    search)
        test_search "$QUERY" "$2"
        ;;
    add)
        test_add_embedding "$2" "$3"
        ;;
    list)
        test_list_collections
        ;;
    info)
        test_collection_info "$2"
        ;;
    health)
        echo "💓 Chroma Health Check"
        echo ""
        
        RESPONSE=$(curl -s "$CHROMA_URL/api/v1/heartbeat" \
            --max-time 10)
        
        if [ $? -eq 0 ]; then
            echo "$RESPONSE" | jq '.'
            echo "   ✅ Chroma is running"
        else
            echo "   ❌ Chroma not responding"
        fi
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "   Run '$0' for usage"
        exit 1
        ;;
esac
