#!/bin/bash
# SOLARIA DFO - n8n Deployment Script
# Version: 1.0.0
#
# This script deploys n8n workflow automation to the production VPS
# Prerequisites:
#   - DNS record for n8n.solaria.agency pointing to 148.230.118.124
#   - SSH access to the server
#   - DFO stack already running

set -e

# Configuration
SERVER="148.230.118.124"
SSH_USER="root"
SSH_KEY="~/.ssh/id_ed25519"
REMOTE_DIR="/var/www/solaria-dfo"
LOCAL_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  SOLARIA DFO - n8n Deployment${NC}"
echo -e "${BLUE}============================================${NC}"

# Step 1: Verify prerequisites
echo -e "\n${YELLOW}[1/6] Verifying prerequisites...${NC}"

# Check SSH connection
if ssh -i $SSH_KEY -o ConnectTimeout=10 $SSH_USER@$SERVER "echo 'SSH OK'" > /dev/null 2>&1; then
    echo -e "${GREEN}  SSH connection: OK${NC}"
else
    echo -e "${RED}  SSH connection: FAILED${NC}"
    exit 1
fi

# Check DNS (optional)
if host n8n.solaria.agency > /dev/null 2>&1; then
    echo -e "${GREEN}  DNS n8n.solaria.agency: OK${NC}"
else
    echo -e "${YELLOW}  DNS n8n.solaria.agency: Not resolved (may need to configure)${NC}"
fi

# Step 2: Copy files to server
echo -e "\n${YELLOW}[2/6] Copying configuration files...${NC}"

# Copy docker-compose.n8n.yml
scp -i $SSH_KEY "$LOCAL_DIR/docker-compose.n8n.yml" $SSH_USER@$SERVER:$REMOTE_DIR/
echo -e "${GREEN}  docker-compose.n8n.yml: Copied${NC}"

# Copy updated nginx config
scp -i $SSH_KEY "$LOCAL_DIR/infrastructure/nginx/nginx.prod.conf" $SSH_USER@$SERVER:$REMOTE_DIR/infrastructure/nginx/
echo -e "${GREEN}  nginx.prod.conf: Copied${NC}"

# Step 3: Create .env file for n8n (if not exists)
echo -e "\n${YELLOW}[3/6] Configuring environment variables...${NC}"

ssh -i $SSH_KEY $SSH_USER@$SERVER "cat > $REMOTE_DIR/.env.n8n << 'EOF'
# n8n Environment Variables
N8N_DB_PASSWORD=n8nSecure2024
N8N_USER=admin
N8N_PASSWORD=SolariaAdmin2024
EOF
"
echo -e "${GREEN}  .env.n8n: Created${NC}"

# Step 4: Create Docker network if not exists and deploy n8n
echo -e "\n${YELLOW}[4/6] Deploying n8n stack...${NC}"

ssh -i $SSH_KEY $SSH_USER@$SERVER "cd $REMOTE_DIR && \
    # Ensure the DFO network exists
    docker network inspect solaria-dfo_solaria-dfo-network > /dev/null 2>&1 || \
    docker network create solaria-dfo_solaria-dfo-network && \
    # Deploy n8n stack
    docker compose -f docker-compose.n8n.yml --env-file .env.n8n up -d"

echo -e "${GREEN}  n8n stack: Deployed${NC}"

# Step 5: Obtain SSL certificate
echo -e "\n${YELLOW}[5/6] Obtaining SSL certificate for n8n.solaria.agency...${NC}"

# First, we need nginx to respond on port 80 for the ACME challenge
# The nginx config already has the /.well-known/acme-challenge/ location

ssh -i $SSH_KEY $SSH_USER@$SERVER "
    # Check if certificate already exists
    if [ -f /etc/letsencrypt/live/n8n.solaria.agency/fullchain.pem ]; then
        echo 'SSL certificate already exists'
    else
        # Stop nginx temporarily if it can't handle the request yet
        docker stop solaria-dfo-nginx 2>/dev/null || true

        # Obtain certificate using standalone mode
        certbot certonly --standalone \
            -d n8n.solaria.agency \
            --non-interactive \
            --agree-tos \
            --email charlie@solaria.agency \
            --no-eff-email \
            || echo 'SSL certificate request may have failed - check DNS'

        # Restart nginx
        docker start solaria-dfo-nginx 2>/dev/null || true
    fi
"

# Check if SSL was successful
if ssh -i $SSH_KEY $SSH_USER@$SERVER "test -f /etc/letsencrypt/live/n8n.solaria.agency/fullchain.pem"; then
    echo -e "${GREEN}  SSL certificate: OK${NC}"
else
    echo -e "${YELLOW}  SSL certificate: Not obtained (may need manual setup)${NC}"
    echo -e "${YELLOW}  Run manually: certbot certonly --standalone -d n8n.solaria.agency${NC}"
fi

# Step 6: Reload nginx
echo -e "\n${YELLOW}[6/6] Reloading nginx...${NC}"

ssh -i $SSH_KEY $SSH_USER@$SERVER "docker exec solaria-dfo-nginx nginx -t && \
    docker exec solaria-dfo-nginx nginx -s reload"

echo -e "${GREEN}  Nginx: Reloaded${NC}"

# Final verification
echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}  Verification${NC}"
echo -e "${BLUE}============================================${NC}"

# Check n8n health
echo -e "\n${YELLOW}Checking n8n health...${NC}"
sleep 5

if ssh -i $SSH_KEY $SSH_USER@$SERVER "docker exec solaria-n8n wget -q --spider http://localhost:5678/healthz"; then
    echo -e "${GREEN}  n8n internal health: OK${NC}"
else
    echo -e "${YELLOW}  n8n internal health: Starting... (may take a moment)${NC}"
fi

# Check postgres health
if ssh -i $SSH_KEY $SSH_USER@$SERVER "docker exec solaria-n8n-postgres pg_isready -U n8n_user -d n8n"; then
    echo -e "${GREEN}  PostgreSQL health: OK${NC}"
else
    echo -e "${YELLOW}  PostgreSQL health: Check logs${NC}"
fi

echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${BLUE}============================================${NC}"

echo -e "\n${YELLOW}Access n8n:${NC}"
echo -e "  URL: https://n8n.solaria.agency"
echo -e "  User: admin"
echo -e "  Pass: SolariaAdmin2024"

echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "  View logs: ssh $SSH_USER@$SERVER 'docker logs -f solaria-n8n'"
echo -e "  Restart:   ssh $SSH_USER@$SERVER 'cd $REMOTE_DIR && docker compose -f docker-compose.n8n.yml restart'"
echo -e "  Stop:      ssh $SSH_USER@$SERVER 'cd $REMOTE_DIR && docker compose -f docker-compose.n8n.yml down'"
