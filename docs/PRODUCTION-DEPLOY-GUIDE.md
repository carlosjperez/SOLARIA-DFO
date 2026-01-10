# 🚀 PRODUCTION DEPLOY GUIDE: MCP v2.0 (Sketch Pattern)

## Status: READY FOR DEPLOYMENT
**Date:** 2026-01-07 10:00 UTC
**Version:** 2.0.0 - Official Release
**Deprecated:** v1.0 (70+ tools) - Legacy
**Official:** v2.0 (2 core tools) - Active

---

## 📋 PRE-DEPLOY CHECKLIST

Execute on production server (148.230.118.124):

### 1. Connect to Server
\`\`\`bash
ssh root@148.230.118.124
cd /var/www/solaria-dfo
\`\`\`

### 2. Verify Current State
\`\`\`bash
# Check Docker services
docker compose -f docker-compose.prod.yml ps

# Check v1.0 status
curl -s http://localhost:3031/health
# Expected: "v1.0 healthy"

# Check current MCP API (v1.0)
curl -s -X POST http://localhost:3031/tools/call \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools | length'
# Expected: 70+ tools
\`\`\`

### 3. Pull Latest Changes
\`\`\`bash
# Pull from repository
git pull origin main

# Verify changes
git status
\`\`\`

---

## 🎯 DEPLOY STEPS

### STEP 1: Build and Deploy v2.0 Container
\`\`\`bash
# Rebuild mcp-http-v2 container with new Dockerfile
docker compose -f docker-compose.prod.yml up -d --build mcp-http-v2

# Verify container started
docker compose -f docker-compose.prod.yml ps | grep mcp-http-v2
# Expected: mcp-http-v2 is Up
\`\`\`

### STEP 2: Verify v2.0 Health
\`\`\`bash
# Direct health check on container
docker exec solaria-dfo-mcp-v2 curl http://localhost:3032/health
# Expected: "v2.0 healthy"

# Via host
curl -s http://localhost:3032/health
# Expected: "v2.0 healthy"
\`\`\`

### STEP 3: Restart Nginx
\`\`\`bash
# Restart nginx to apply new configuration
docker compose -f docker-compose.prod.yml restart nginx

# Verify nginx is running
docker compose -f docker-compose.prod.yml ps | grep nginx
# Expected: nginx is Up
\`\`\`

---

## ✅ VALIDATION TESTS

### Test 1: Nginx Routes for v2.0
\`\`\`bash
# Test v2.0 health via nginx
curl -s https://dfo.solaria.agency/mcp-v2/health
# Expected: "v2.0 healthy"

# Test v2.0 tools list
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }' | jq '.result.tools | length'
# Expected: 2 tools (get_context, run_code)
\`\`\`

### Test 2: get_context Functionality
\`\`\`bash
# Test get_context with projects
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_context",
      "arguments": {
        "include": {
          "projects": true,
          "tasks": false,
          "health": true
        }
      }
    }
  }' | jq '.result.data.context.projects | length'
# Expected: >0 projects

# Test get_context with tasks
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_context",
      "arguments": {
        "include": {
          "projects": true,
          "tasks": true,
          "health": true
        }
      }
    }
  }' | jq '.result.data.context.tasks | length'
# Expected: >0 tasks
\`\`\`

### Test 3: run_code Sandbox
\`\`\`bash
# Test simple code execution
curl -s -X POST https://dfo.solaria.agency/mcp-v2/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "run_code",
      "arguments": {
        "code": "console.log(\"[TEST v2.0] Sandbox OK\"); return { test: \"ok\", timestamp: Date.now() };",
        "timeout": 5000
      }
    }
  }' | jq '.result.data.output'
# Expected: { test: "ok", timestamp: <number> }
\`\`\`

### Test 4: Dashboard Backward Compatibility
\`\`\`bash
# TEST 4.1: Projects via Dashboard API
curl -s https://dfo.solaria.agency/api/projects | jq 'length'
# Expected: Existing projects count >0

# TEST 4.2: Tasks via Dashboard API
curl -s "https://dfo.solaria.agency/api/tasks?limit=5" | jq 'length'
# Expected: Existing tasks count

# TEST 4.3: Memories via Dashboard API
curl -s "https://dfo.solaria.agency/api/memories?limit=5" | jq 'length'
# Expected: Existing memories count

# TEST 4.4: Health via Dashboard API
curl -s https://dfo.solaria.agency/api/health
# Expected: Healthy response
\`\`\`

---

## 🔍 MONITORING CHECKLIST

After deployment, monitor for 48 hours:

### Monitor v2.0 Container
\`\`\`bash
# Follow logs in real-time
docker compose -f docker-compose.prod.yml logs -f mcp-http-v2

# Check error rate
docker compose -f docker-compose.prod.yml logs --tail=100 mcp-http-v2 | grep -i error

# Check for warnings
docker compose -f docker-compose.prod.yml logs --tail=100 mcp-http-v2 | grep -i warn
\`\`\`

### Monitor Nginx Access
\`\`\`bash
# Check v2.0 request count
docker compose -f docker-compose.prod.yml logs nginx 2>&1 | grep "/mcp-v2" | wc -l

# Check for 5xx errors
docker compose -f docker-compose.prod.yml logs nginx 2>&1 | grep "/mcp-v2" | grep " 5[0-9][0-9]"
\`\`\`

### Monitor Dashboard API
\`\`\`bash
# Test dashboard health
curl -s https://dfo.solaria.agency/api/health

# Test projects endpoint
curl -s https://dfo.solaria.agency/api/projects | jq 'length'

# Test memories endpoint
curl -s "https://dfo.solaria.agency/api/memories?limit=3"
\`\`\`

---

## 📊 SUCCESS CRITERIA

Deployment is SUCCESSFUL when ALL criteria are met:

| Criteria | Target | How to Verify |
|----------|--------|-----------------|
| v2.0 Container Running | ✅ Up | `docker ps | grep mcp-http-v2` |
| v2.0 Health Check | ✅ 200 | `curl /mcp-v2/health` |
| Tools List | ✅ 2 tools | `tools/list` returns 2 |
| get_context Works | ✅ Returns data | `get_context` returns projects/tasks |
| run_code Works | ✅ Executes code | `run_code` returns output |
| Dashboard Projects | ✅ Accessible | `/api/projects` returns data |
| Dashboard Tasks | ✅ Accessible | `/api/tasks` returns data |
| Dashboard Memories | ✅ Accessible | `/api/memories` returns data |
| No 5xx Errors | ✅ <1% | Nginx logs <1% error rate |

---

## 🔄 ROLLBACK PLAN (IF NEEDED)

If v2.0 has critical issues:

\`\`\`bash
# OPTION 1: Stop v2.0, keep v1.0
docker compose -f docker-compose.prod.yml stop mcp-http-v2

# OPTION 2: Revert nginx configuration
cp backups/mcp-v1.0-pre-migration/nginx.prod.conf infrastructure/nginx/nginx.prod.conf
docker compose -f docker-compose.prod.yml restart nginx

# OPTION 3: Revert docker-compose
cp backups/mcp-v1.0-pre-migration/docker-compose.prod.yml docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
\`\`\`

---

## 📞 SUPPORT CONTACTS

If issues arise during deployment:

1. **Dashboard Access:** https://dfo.solaria.agency
2. **Documentation:** docs/MCP-V2-MIGRATION-REPORT.md
3. **Backup Location:** backups/mcp-v1.0-pre-migration/

---

## 📝 POST-DEPLOY ACTIONS

After successful deployment (48h of stability):

### Phase 1: Announce v2.0 as Official
- Update README.md with v2.0 as official
- Add deprecation notice for v1.0 in documentation
- Set X-MCP-Version header to recommend v2.0

### Phase 2: Client Migration
- Notify all teams to use /mcp-v2 endpoint
- Provide migration guide from v1.0 to v2.0
- Document breaking changes

### Phase 3: Deprecate v1.0
- Add warning header: "X-MCP-Version-Legacy: 1.0, please use v2.0"
- Schedule v1.0 shutdown date (30 days notice)
- Monitor v1.0 usage during transition

### Phase 4: v1.0 Sunset
- Stop mcp-http container (v1.0)
- Remove v1.0 route from nginx
- Update nginx to redirect /mcp → /mcp-v2
- Clean up v1.0 source files

---

## ⚡ QUICK REFERENCE

### Key Ports After Deployment
| Service | Port | Purpose |
|---------|-------|---------|
| dashboard | 3030 | Dashboard API |
| mcp-http (v1.0) | 3031 | Legacy MCP (to be sunset) |
| mcp-http-v2 (v2.0) | 3032 | **Official MCP v2.0** |
| worker | 3034 | Background jobs |
| nginx | 80/443 | Reverse proxy |

### Key Endpoints
| Endpoint | URL | Tools |
|----------|-----|-------|
| **v2.0 Official** | /mcp-v2 | 2 tools (get_context, run_code) |
| v1.0 Legacy | /mcp | 70+ tools (deprecated) |

### v2.0 Tools
1. **get_context**: Unified system state (projects, tasks, agents, stats, health)
2. **run_code**: Secure sandbox code execution with DFO API access

---

**Guide Generated:** 2026-01-07 10:00 UTC
**Author:** ECO-Lambda | SOLARIA DFO
**Version:** 4.0 NEMESIS-ECO
