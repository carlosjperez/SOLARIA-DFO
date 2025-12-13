#!/bin/bash

# ============================================================================
# SOLARIA Digital Field Operations - Remote MCP Client Installer
# Installs MCP client configuration for connecting to centralized DFO server
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color

# SOLARIA DFO Configuration
DFO_SERVER="${DFO_SERVER:-https://dfo.solaria.agency}"
DFO_MCP_URL="${DFO_SERVER}/mcp"

echo -e "${ORANGE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       SOLARIA Digital Field Operations - MCP Client           ║"
echo "║                   Remote Installation                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# Detect OS
# ============================================================================
detect_os() {
    case "$(uname -s)" in
        Darwin*) echo "macos" ;;
        Linux*)  echo "linux" ;;
        MINGW*|CYGWIN*|MSYS*) echo "windows" ;;
        *) echo "unknown" ;;
    esac
}

OS=$(detect_os)
echo -e "${BLUE}Detected OS:${NC} $OS"

# ============================================================================
# Detect AI Environment
# ============================================================================
detect_environment() {
    # Claude Code / Claude Desktop
    if [ -d "$HOME/.claude" ]; then
        if [ -f "$HOME/.claude/claude_desktop_config.json" ]; then
            echo "claude_desktop"
            return
        fi
        echo "claude_code"
        return
    fi

    # Cursor
    if [ -d "$HOME/.config/Cursor" ] || [ -d "$HOME/Library/Application Support/Cursor" ]; then
        echo "cursor"
        return
    fi

    # Windsurf
    if [ -d "$HOME/.config/windsurf" ] || [ -d "$HOME/Library/Application Support/Windsurf" ]; then
        echo "windsurf"
        return
    fi

    # VS Code with Continue
    if [ -d "$HOME/.continue" ]; then
        echo "continue"
        return
    fi

    echo "generic"
}

ENV=$(detect_environment)
echo -e "${BLUE}Detected environment:${NC} $ENV"

# ============================================================================
# Get config file path
# ============================================================================
get_config_path() {
    case "$1" in
        claude_code)
            echo "$HOME/.claude/claude_code_config.json"
            ;;
        claude_desktop)
            echo "$HOME/.claude/claude_desktop_config.json"
            ;;
        cursor)
            if [ "$OS" = "macos" ]; then
                echo "$HOME/Library/Application Support/Cursor/User/mcp.json"
            else
                echo "$HOME/.config/Cursor/User/mcp.json"
            fi
            ;;
        windsurf)
            if [ "$OS" = "macos" ]; then
                echo "$HOME/Library/Application Support/Windsurf/mcp_config.json"
            else
                echo "$HOME/.config/windsurf/mcp_config.json"
            fi
            ;;
        continue)
            echo "$HOME/.continue/config.json"
            ;;
        *)
            echo "$HOME/.mcp/mcp-servers.json"
            ;;
    esac
}

CONFIG_PATH=$(get_config_path "$ENV")
echo -e "${BLUE}Config path:${NC} $CONFIG_PATH"

# ============================================================================
# Prompt for project information
# ============================================================================
echo ""
echo -e "${YELLOW}Project Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get project name
read -p "Project name (e.g., my-awesome-app): " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME=$(basename "$(pwd)")
fi

# Get API key or use default
echo ""
echo -e "${BLUE}API Key (optional):${NC}"
echo "  Leave empty to use default authentication (carlosjperez/bypass)"
echo "  Or enter your SOLARIA DFO API key (sk-solaria-...)"
read -p "API Key: " API_KEY

if [ -z "$API_KEY" ]; then
    # Use default credentials - we'll use basic auth
    AUTH_HEADER="Bearer default"
    echo -e "${YELLOW}Using default authentication${NC}"
else
    AUTH_HEADER="Bearer $API_KEY"
    echo -e "${GREEN}Using provided API key${NC}"
fi

# ============================================================================
# Generate MCP Configuration
# ============================================================================
echo ""
echo -e "${BLUE}Generating MCP configuration...${NC}"

# Create config directory if needed
mkdir -p "$(dirname "$CONFIG_PATH")"

# Generate the MCP server configuration
MCP_CONFIG=$(cat <<EOF
{
  "mcpServers": {
    "solaria-dfo": {
      "transport": {
        "type": "http",
        "url": "${DFO_MCP_URL}"
      },
      "headers": {
        "Authorization": "${AUTH_HEADER}",
        "X-Project-Id": "${PROJECT_NAME}"
      },
      "description": "SOLARIA Digital Field Operations - Centralized Project Management"
    }
  }
}
EOF
)

# Check if config file exists and merge
if [ -f "$CONFIG_PATH" ]; then
    echo -e "${YELLOW}Existing configuration found. Merging...${NC}"

    # Backup existing config
    cp "$CONFIG_PATH" "${CONFIG_PATH}.backup"

    # Use Node.js to merge JSON if available
    if command -v node &> /dev/null; then
        node -e "
        const fs = require('fs');
        const existing = JSON.parse(fs.readFileSync('$CONFIG_PATH', 'utf8'));
        const newConfig = $MCP_CONFIG;

        // Merge mcpServers
        existing.mcpServers = existing.mcpServers || {};
        existing.mcpServers['solaria-dfo'] = newConfig.mcpServers['solaria-dfo'];

        fs.writeFileSync('$CONFIG_PATH', JSON.stringify(existing, null, 2));
        console.log('Configuration merged successfully');
        "
    else
        # Fallback: just write new config (may overwrite)
        echo -e "${YELLOW}Node.js not found. Writing new configuration...${NC}"
        echo "$MCP_CONFIG" > "$CONFIG_PATH"
    fi
else
    echo "$MCP_CONFIG" > "$CONFIG_PATH"
fi

echo -e "${GREEN}Configuration saved to: $CONFIG_PATH${NC}"

# ============================================================================
# Test connection
# ============================================================================
echo ""
echo -e "${BLUE}Testing connection to SOLARIA DFO...${NC}"

if command -v curl &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${DFO_SERVER}/mcp/health" 2>/dev/null || echo "error\n000")
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
    BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Connection successful!${NC}"
        echo "  Server status: $BODY"
    else
        echo -e "${YELLOW}⚠ Could not connect to server (HTTP $HTTP_CODE)${NC}"
        echo "  This might be normal if the server isn't deployed yet."
        echo "  The configuration has been saved and will work once the server is available."
    fi
else
    echo -e "${YELLOW}curl not found. Skipping connection test.${NC}"
fi

# ============================================================================
# Create local project marker
# ============================================================================
echo ""
echo -e "${BLUE}Creating project marker...${NC}"

# Create a .solaria directory in the current project
mkdir -p .solaria
cat > .solaria/config.json <<EOF
{
  "project_name": "${PROJECT_NAME}",
  "dfo_server": "${DFO_SERVER}",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo -e "${GREEN}✓ Project marker created: .solaria/config.json${NC}"

# ============================================================================
# Instructions
# ============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Installation Complete!                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""

case "$ENV" in
    claude_code)
        echo "  1. Restart Claude Code"
        echo "  2. The 'solaria-dfo' MCP server will be available automatically"
        echo ""
        echo "  Available tools:"
        echo "    - get_dashboard_overview"
        echo "    - list_projects / create_project / get_project"
        echo "    - list_tasks / create_task / update_task / complete_task"
        echo "    - list_agents / get_agent"
        echo "    - log_activity"
        ;;
    cursor)
        echo "  1. Restart Cursor"
        echo "  2. Open the MCP panel (Cmd/Ctrl + Shift + P > 'MCP: Show Panel')"
        echo "  3. The 'solaria-dfo' server should appear"
        ;;
    windsurf)
        echo "  1. Restart Windsurf"
        echo "  2. The MCP server will be available in Cascade"
        ;;
    *)
        echo "  1. Restart your AI application"
        echo "  2. The 'solaria-dfo' MCP server will be available"
        ;;
esac

echo ""
echo -e "${BLUE}Dashboard URL:${NC} ${DFO_SERVER}"
echo -e "${BLUE}MCP Endpoint:${NC} ${DFO_MCP_URL}"
echo ""
echo -e "${ORANGE}Need help? Visit: https://github.com/SOLARIA-AGENCY/solaria-digital-field--operations${NC}"
echo ""
