#!/bin/sh
# wait-for-services.sh
# Waits for services to be reachable before starting server

echo "Waiting for services to be ready..."

MAX_RETRIES=30
RETRY_DELAY=2

# Wait for test-db TCP connection (port 3306)
echo "Checking test-db:3306 connectivity..."
for i in $(seq 1 $MAX_RETRIES); do
    if nc -z test-db 3306 > /dev/null 2>&1; then
        echo "✓ test-db:3306 is reachable"
        break
    fi
    if [ "$i" -eq "$MAX_RETRIES" ]; then
        echo "✗ Failed to connect to test-db:3306 after ${MAX_RETRIES} attempts"
        exit 1
    fi
    echo "  Waiting for test-db (attempt $i/$MAX_RETRIES)..."
    sleep $RETRY_DELAY
done

# Wait for test-redis TCP connection (port 6379)
echo "Checking test-redis:6379 connectivity..."
for i in $(seq 1 $MAX_RETRIES); do
    if nc -z test-redis 6379 > /dev/null 2>&1; then
        echo "✓ test-redis:6379 is reachable"
        break
    fi
    if [ "$i" -eq "$MAX_RETRIES" ]; then
        echo "✗ Failed to connect to test-redis:6379 after ${MAX_RETRIES} attempts"
        exit 1
    fi
    echo "  Waiting for test-redis (attempt $i/$MAX_RETRIES)..."
    sleep $RETRY_DELAY
done

echo "✓ All services are reachable - starting server"
echo ""
exec "$@"
