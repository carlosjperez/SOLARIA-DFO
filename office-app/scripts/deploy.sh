#!/bin/bash
# SOLARIA Office Dashboard - Deploy Script
# Usage: ./deploy.sh [staging|production]

set -e

# Configuration
DIST_DIR="dist"
REMOTE_USER="root"
REMOTE_HOST="148.230.118.124"
REMOTE_PATH="/var/www/office-v2"
SSH_KEY="$HOME/.ssh/id_ed25519"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse environment
ENV="${1:-staging}"

if [[ "$ENV" == "production" ]]; then
    log_warn "Deploying to PRODUCTION"
else
    log_info "Deploying to staging (default)"
fi

# Pre-flight checks
if [ ! -d "$DIST_DIR" ]; then
    log_error "Build directory '$DIST_DIR' not found. Run 'pnpm build' first."
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH key not found at $SSH_KEY"
    exit 1
fi

# Show what will be deployed
log_info "Build contents:"
ls -la "$DIST_DIR/"
echo ""

# Sync to server
log_info "Syncing to $REMOTE_HOST:$REMOTE_PATH..."

rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    "$DIST_DIR/" \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# Verify deployment
log_info "Verifying deployment..."
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "ls -la $REMOTE_PATH/ | head -10"

# Reload Nginx if needed
log_info "Reloading Nginx..."
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "docker exec solaria-dfo-nginx nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true"

echo ""
log_info "Deploy complete!"
log_info "Dashboard available at: https://dfo.solaria.agency/office/"
