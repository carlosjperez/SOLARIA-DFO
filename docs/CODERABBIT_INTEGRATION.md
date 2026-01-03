# CodeRabbit Integration - SOLARIA DFO

**Version:** 1.0.0
**Date:** 2026-01-02
**Author:** ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
**Tasks:** DFO-202-EPIC21, DFO-203-EPIC21

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
  - [React Hook: useCodeRabbitComments](#react-hook-usecoderabbithooks)
  - [React Component: CodeRabbitComment](#react-component-coderabbitcomment)
  - [DiffViewer Integration](#diffviewer-integration)
- [Backend API](#backend-api)
  - [GET /api/code-review/:owner/:repo/:pullNumber](#get-apicode-reviewownerrepopullnumber)
  - [POST /api/code-review/:owner/:repo/comments/:commentId/resolve](#post-apicode-reviewownerrepocommentscommentidresolve)
- [MCP Integration](#mcp-integration)
- [Caching Strategy](#caching-strategy)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

SOLARIA DFO integrates with **CodeRabbit AI** to provide intelligent code review comments directly in the DiffViewer component. This integration uses the **Model Context Protocol (MCP)** instead of webhooks, providing a more flexible and reliable architecture.

**Key Features:**
- ✅ Real-time AI code review comments in diff viewer
- ✅ Severity-based comment classification (critical/high/medium/low/info)
- ✅ Type-based categorization (suggestion/issue/praise/question)
- ✅ Inline resolve/dismiss functionality
- ✅ Redis caching for performance (5-minute TTL)
- ✅ MCP-based architecture for flexibility
- ✅ Full TypeScript support

---

## Architecture

### MCP-Based Design (Not Webhook-Based)

Unlike traditional webhook-based integrations, SOLARIA DFO uses MCP (Model Context Protocol) to pull CodeRabbit comments on-demand. This provides several advantages:

1. **No webhook infrastructure required** - No need to expose public endpoints or manage webhook secrets
2. **On-demand fetching** - Comments are fetched when needed, not pushed automatically
3. **GitHub as source of truth** - Comments always reflect the current state on GitHub
4. **Simplified deployment** - No need to configure CodeRabbit webhook URLs
5. **Reusable MCP infrastructure** - Leverages existing DFO MCP proxy tools

### Data Flow

```
┌──────────────┐
│   Frontend   │
│  DiffViewer  │
└──────┬───────┘
       │ 1. HTTP GET /api/code-review/:owner/:repo/:pr
       ▼
┌──────────────┐
│  Dashboard   │
│   API        │──► 2. Check Redis cache
│  (server.ts) │◄── 3. Cache hit? Return cached data
└──────┬───────┘
       │ 4. Cache miss? Continue...
       │ MCP JSON-RPC POST
       ▼
┌──────────────┐
│  DFO MCP     │
│   Server     │──► 5. Proxy to CodeRabbit MCP
│ (localhost:  │
│     3031)    │
└──────┬───────┘
       │ 6. MCP tool: proxy_external_tool
       ▼
┌──────────────┐
│  CodeRabbit  │
│  MCP Server  │──► 7. Fetch comments from GitHub API
│              │
└──────────────┘
       │ 8. Return comments
       ▼
    (Response flows back up the chain)
       │ 9. Dashboard caches in Redis (5 min TTL)
       ▼
┌──────────────┐
│   Frontend   │──► 10. Display comments inline with diff
└──────────────┘
```

---

## Components

### React Hook: useCodeRabbitComments

**Location:** `/dashboard/app/src/hooks/useCodeRabbitComments.ts`

Custom React hook for fetching CodeRabbit review comments from a GitHub PR.

#### Interface

```typescript
export interface CodeRabbitComment {
  id: number;
  review_id: number;
  file_path: string;
  line: number;
  original_line: number | null;
  body: string;
  author: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: 'suggestion' | 'issue' | 'praise' | 'question';
  created_at: string;
  updated_at: string;
  resolved: boolean;
  html_url: string;
}

export interface UseCodeRabbitCommentsOptions {
  autoFetch?: boolean;       // Default: true
  pollingInterval?: number;  // Default: 0 (disabled)
}

export interface UseCodeRabbitCommentsReturn {
  comments: CodeRabbitComment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

#### Usage

```typescript
import { useCodeRabbitComments } from '../../hooks/useCodeRabbitComments';

const MyComponent = () => {
  const { comments, loading, error, refetch } = useCodeRabbitComments(
    'solaria-agency',  // owner
    'dfo',            // repo
    123,              // pullNumber
    {
      autoFetch: true,
      pollingInterval: 0, // Set to 30000 for 30-second polling
    }
  );

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh Comments</button>
      {comments.map(comment => (
        <div key={comment.id}>{comment.body}</div>
      ))}
    </div>
  );
};
```

#### Features

- **Automatic fetching** on mount (configurable via `autoFetch`)
- **Manual refetch** function for updating comments
- **Optional polling** for real-time updates
- **Severity inference** from comment content (keywords: critical, security, error, warning, etc.)
- **Type inference** from content patterns (suggest, consider, good, nice, ?, etc.)
- **Loading and error states** for UI feedback
- **JWT authentication** via `localStorage.getItem('auth_token')`

---

### React Component: CodeRabbitComment

**Location:** `/dashboard/app/src/components/code-review/CodeRabbitComment.tsx`

Individual CodeRabbit comment display component with resolve/dismiss actions.

#### Props

```typescript
export interface CodeRabbitCommentProps {
  comment: CodeRabbitCommentType;
  onResolve?: (commentId: number) => Promise<void>;
  onDismiss?: (commentId: number) => Promise<void>;
  className?: string;
}
```

#### Usage

```typescript
import { CodeRabbitComment } from './CodeRabbitComment';

const handleResolve = async (commentId: number) => {
  await fetch(`/api/code-review/owner/repo/comments/${commentId}/resolve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resolution: 'addressed' }),
  });
  refetchComments();
};

const handleDismiss = async (commentId: number) => {
  await fetch(`/api/code-review/owner/repo/comments/${commentId}/resolve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resolution: 'wont_fix' }),
  });
  refetchComments();
};

<CodeRabbitComment
  comment={comment}
  onResolve={handleResolve}
  onDismiss={handleDismiss}
/>
```

#### Visual Features

- **Severity badges** with color coding:
  - 🔴 Critical: Red background
  - 🟠 High: Orange background
  - 🟡 Medium: Yellow background
  - 🔵 Low: Blue background
  - ⚪ Info: Gray background
- **Type icons**: 💡 Suggestion, ⚠️ Issue, 👍 Praise, ❓ Question
- **Status badges**: ✓ Resolved (green) or Pending (amber)
- **Relative timestamps**: "2 hours ago", "just now", etc.
- **Action buttons** with loading states (spinner during API calls)
- **GitHub link** to view comment in GitHub PR
- **Dark mode support** via TailwindCSS dark: variants

---

### DiffViewer Integration

**Location:** `/dashboard/app/src/components/code-review/DiffViewer.tsx`

The DiffViewer component has been extended to display CodeRabbit comments inline with diff lines.

#### New Props

```typescript
export interface DiffViewerProps {
  // ... existing props ...
  enableCodeRabbit?: boolean;   // Enable CodeRabbit integration
  owner?: string;               // Repository owner
  repo?: string;                // Repository name
  pullNumber?: number;          // Pull request number
}
```

#### Usage

```typescript
import { DiffViewer } from './DiffViewer';

<DiffViewer
  diffString={diffString}
  viewMode="unified"
  showLineNumbers={true}
  enableComments={true}
  enableCodeRabbit={true}           // NEW: Enable CodeRabbit
  owner="solaria-agency"            // NEW: Repo owner
  repo="dfo"                        // NEW: Repo name
  pullNumber={123}                  // NEW: PR number
/>
```

#### Features

- **Inline comment display** - CodeRabbit comments appear directly below the relevant diff line
- **Loading indicator** in header - Shows "Loading CodeRabbit comments..." spinner
- **Error display** - Shows error banner if fetching fails
- **Comment count badge** - Shows "X CodeRabbit comments" in header when loaded
- **Automatic refetch** after resolve/dismiss actions
- **Filtered by file and line** - Only shows comments relevant to current diff
- **Grouped by line** - Multiple comments on same line are grouped together

---

## Backend API

### GET /api/code-review/:owner/:repo/:pullNumber

Fetch CodeRabbit review comments for a pull request.

#### Authentication

Requires JWT Bearer token in `Authorization` header.

#### Request

```bash
GET /api/code-review/solaria-agency/dfo/123
Authorization: Bearer <jwt_token>
```

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 456789,
        "review_id": 123456,
        "file_path": "src/server.ts",
        "line": 42,
        "original_line": null,
        "body": "Consider using a more descriptive variable name here.",
        "author": "coderabbitai[bot]",
        "severity": "low",
        "type": "suggestion",
        "created_at": "2026-01-02T10:00:00Z",
        "updated_at": "2026-01-02T10:00:00Z",
        "resolved": false,
        "html_url": "https://github.com/solaria-agency/dfo/pull/123#discussion_r456789"
      }
    ]
  },
  "metadata": {
    "cached": true,
    "timestamp": "2026-01-02T10:00:00Z"
  }
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Missing required parameters: owner, repo, or pullNumber"
  }
}
```

#### Implementation Details

**File:** `/dashboard/server.ts` (lines 7023-7200)

**Flow:**
1. Validate route parameters (owner, repo, pullNumber)
2. Check Redis cache with key `coderabbit:{owner}:{repo}:{pullNumber}`
3. If cache hit, return cached data with `metadata.cached: true`
4. If cache miss, call MCP server at `http://localhost:3031` (or `MCP_SERVER_URL`)
5. Use MCP tool `proxy_external_tool` to call CodeRabbit `get_review_comments`
6. Parse MCP JSON-RPC response and extract comments
7. Store in Redis with 5-minute TTL (300 seconds)
8. Return comments with `metadata.cached: false`

**Error Handling:**
- `400 MISSING_PARAMETERS` - Missing owner, repo, or pullNumber
- `400 INVALID_PULL_NUMBER` - PR number is not a positive integer
- `500 MCP_ERROR` - MCP server returned an error
- `500 INVALID_MCP_RESPONSE` - Invalid MCP response structure
- `500 INVALID_JSON` - Failed to parse MCP response as JSON
- `500 INTERNAL_ERROR` - Generic server error

---

### POST /api/code-review/:owner/:repo/comments/:commentId/resolve

Resolve or dismiss a CodeRabbit comment.

#### Authentication

Requires JWT Bearer token in `Authorization` header.

#### Request

```bash
POST /api/code-review/solaria-agency/dfo/comments/456789/resolve
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "resolution": "addressed",
  "note": "Fixed in latest commit"
}
```

#### Request Body

```typescript
{
  resolution?: 'addressed' | 'wont_fix' | 'not_applicable';  // Default: 'addressed'
  note?: string;                                             // Optional note
}
```

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "comment_id": 456789,
    "resolved": true,
    "resolution": "addressed"
  },
  "message": "CodeRabbit comment resolved successfully"
}
```

#### Implementation Details

**File:** `/dashboard/server.ts` (lines 7202-7368)

**Flow:**
1. Validate route parameters (owner, repo, commentId)
2. Validate request body (resolution type)
3. Call MCP server to proxy CodeRabbit `resolve_comment` tool
4. Parse MCP response
5. **Invalidate Redis cache** - Delete all keys matching `coderabbit:{owner}:{repo}:*`
6. Return success response

**Cache Invalidation:**
- Uses `redis.keys()` to find all cached PRs for the repository
- Deletes all matching keys to ensure fresh data on next fetch
- Logs how many cache entries were invalidated
- Graceful fallback if Redis is unavailable

---

## MCP Integration

### External MCP Server: CodeRabbit

SOLARIA DFO uses the CodeRabbit MCP server to fetch code review comments. This server must be configured in the agent's MCP configuration.

#### Configuration Example

```json
{
  "mcpServers": {
    "coderabbit": {
      "transport": {
        "type": "http",
        "url": "https://mcp.coderabbit.ai"
      },
      "headers": {
        "Authorization": "Bearer <coderabbit_api_key>"
      }
    }
  }
}
```

### Available MCP Tools

The CodeRabbit MCP server provides the following tools (accessed via `proxy_external_tool`):

1. **get_coderabbit_reviews**
   - Fetch all reviews for a PR
   - Params: `{ owner, repo, pullNumber }`

2. **get_review_details**
   - Get details of a specific review
   - Params: `{ owner, repo, pullNumber, reviewId }`

3. **get_review_comments**
   - Fetch all review comments for a PR (used by DFO)
   - Params: `{ owner, repo, pullNumber }`

4. **get_comment_details**
   - Get details of a specific comment
   - Params: `{ owner, repo, commentId }`

5. **resolve_comment**
   - Mark a comment as resolved (used by DFO)
   - Params: `{ owner, repo, commentId, resolution, note }`

6. **resolve_conversation**
   - Resolve entire conversation thread
   - Params: `{ owner, repo, commentId, resolved, note }`

### MCP Call Pattern

```typescript
// Example: Fetching comments via MCP
const mcpResponse = await fetch('http://localhost:3031', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer default',
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'proxy_external_tool',
      arguments: {
        server_name: 'coderabbit',
        tool_name: 'get_review_comments',
        params: {
          owner: 'solaria-agency',
          repo: 'dfo',
          pullNumber: 123,
        },
        format: 'json',
      },
    },
  }),
});
```

---

## Caching Strategy

### Redis Cache Implementation

**Purpose:** Reduce MCP calls and improve performance

#### Cache Key Format

```
coderabbit:{owner}:{repo}:{pullNumber}
```

**Examples:**
- `coderabbit:solaria-agency:dfo:123`
- `coderabbit:facebook:react:45678`

#### Cache TTL

**5 minutes (300 seconds)**

Rationale:
- Comments don't change frequently during active review
- 5 minutes provides good balance between freshness and performance
- Automatic expiration prevents stale data

#### Cache Payload

```json
{
  "comments": [ /* array of CodeRabbitComment objects */ ],
  "timestamp": "2026-01-02T10:00:00Z"
}
```

#### Cache Invalidation

**Trigger:** When a comment is resolved or dismissed

**Strategy:** Delete all cache entries for the repository

```typescript
const cachePattern = `coderabbit:${owner}:${repo}:*`;
const keys = await redis.keys(cachePattern);
await redis.del(...keys);
```

**Why invalidate all PRs?**
- The resolve endpoint doesn't include the PR number in route params
- Safer to invalidate all PRs than risk serving stale data
- Low cost since each repo typically has few active PRs

#### Cache Metrics

**Logging:**
- `[CodeRabbit] Cache HIT for coderabbit:owner:repo:123`
- `[CodeRabbit] Cache MISS for coderabbit:owner:repo:123`
- `[CodeRabbit] Cached 15 comments for coderabbit:owner:repo:123 (TTL: 5 min)`
- `[CodeRabbit] Invalidated 3 cache entries for owner/repo`

#### Fallback Behavior

If Redis is unavailable or fails:
- **Read errors:** Log warning, proceed with MCP call
- **Write errors:** Log warning, return data without caching
- **Invalidation errors:** Log warning, proceed with response
- **No request failures** due to Redis issues (graceful degradation)

---

## Usage Examples

### Example 1: Basic DiffViewer with CodeRabbit

```typescript
import { DiffViewer } from '@/components/code-review/DiffViewer';

const PullRequestReview = () => {
  const diffString = `diff --git a/server.ts b/server.ts
index abc123..def456 100644
--- a/server.ts
+++ b/server.ts
@@ -42,7 +42,7 @@ class Server {
-  const user = getUserById(id);
+  const user = await getUserById(id);
`;

  return (
    <DiffViewer
      diffString={diffString}
      viewMode="unified"
      enableCodeRabbit={true}
      owner="solaria-agency"
      repo="dfo"
      pullNumber={123}
    />
  );
};
```

### Example 2: Manual Comment Fetching

```typescript
import { useCodeRabbitComments } from '@/hooks/useCodeRabbitComments';

const ManualFetch = () => {
  const { comments, loading, error, refetch } = useCodeRabbitComments(
    'solaria-agency',
    'dfo',
    123,
    { autoFetch: false } // Don't fetch automatically
  );

  return (
    <div>
      <button onClick={refetch} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Comments'}
      </button>
      {error && <div className="text-red-500">Error: {error}</div>}
      <div>Total comments: {comments.length}</div>
    </div>
  );
};
```

### Example 3: Real-Time Polling

```typescript
const RealtimeComments = () => {
  const { comments, loading } = useCodeRabbitComments(
    'solaria-agency',
    'dfo',
    123,
    {
      autoFetch: true,
      pollingInterval: 30000, // Poll every 30 seconds
    }
  );

  return (
    <div>
      {loading && <div>Syncing with CodeRabbit...</div>}
      <div>
        {comments.map(comment => (
          <div key={comment.id}>
            <strong>{comment.severity.toUpperCase()}</strong>: {comment.body}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Example 4: Custom Resolve Handler

```typescript
const CustomResolve = () => {
  const { comments, refetch } = useCodeRabbitComments('owner', 'repo', 123);

  const handleCustomResolve = async (commentId: number, resolution: string) => {
    try {
      // Call API
      await fetch(`/api/code-review/owner/repo/comments/${commentId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution,
          note: `Resolved via custom workflow at ${new Date().toISOString()}`,
        }),
      });

      // Show success notification
      alert('Comment resolved!');

      // Refetch to update UI
      await refetch();
    } catch (error) {
      alert('Failed to resolve comment');
    }
  };

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.body}</p>
          <button onClick={() => handleCustomResolve(comment.id, 'addressed')}>
            Mark as Addressed
          </button>
          <button onClick={() => handleCustomResolve(comment.id, 'wont_fix')}>
            Won't Fix
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Troubleshooting

### Comments Not Loading

**Symptom:** DiffViewer shows "Loading..." indefinitely

**Possible Causes:**
1. MCP server not running
2. CodeRabbit MCP server not configured
3. Invalid GitHub credentials
4. Network connectivity issues

**Debug Steps:**
```bash
# 1. Check MCP server is running
curl http://localhost:3031/health

# 2. Check MCP proxy tool is available
curl -X POST http://localhost:3031 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 3. Test CodeRabbit connection
curl -X POST http://localhost:3031 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer default" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"list_external_tools",
      "arguments":{"server_name":"coderabbit"}
    }
  }'

# 4. Check Dashboard logs
docker logs solaria-dfo-office | grep CodeRabbit
```

### Cache Not Working

**Symptom:** Every request shows "Cache MISS" in logs

**Possible Causes:**
1. Redis not running
2. Redis connection issues
3. Different cache keys being used

**Debug Steps:**
```bash
# 1. Check Redis is running
docker exec solaria-dfo-redis redis-cli ping
# Should return: PONG

# 2. Check cache keys
docker exec solaria-dfo-redis redis-cli KEYS "coderabbit:*"

# 3. Check cache TTL
docker exec solaria-dfo-redis redis-cli TTL "coderabbit:owner:repo:123"
# Should return: number of seconds remaining (0-300)

# 4. Manual cache test
docker exec solaria-dfo-redis redis-cli SET "test:key" "test:value" EX 60
docker exec solaria-dfo-redis redis-cli GET "test:key"
```

### Resolve/Dismiss Not Working

**Symptom:** Clicking resolve/dismiss does nothing or shows error

**Possible Causes:**
1. Invalid JWT token
2. Comment ID mismatch
3. MCP server error
4. Network issues

**Debug Steps:**
```bash
# 1. Verify JWT token
TOKEN=$(localStorage.getItem('auth_token'))
curl -X GET http://localhost:3030/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"

# 2. Test resolve endpoint manually
curl -X POST http://localhost:3030/api/code-review/owner/repo/comments/123/resolve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resolution":"addressed","note":"Test"}'

# 3. Check Dashboard error logs
docker logs solaria-dfo-office | grep "Resolve comment error"
```

### Severity/Type Not Displaying Correctly

**Symptom:** All comments show as "info" or "suggestion"

**Cause:** Content-based inference requires specific keywords

**Keywords for Severity:**
- **critical:** "critical", "security", "vulnerability"
- **high:** "error", "bug", "issue"
- **medium:** "warning", "concern"
- **low:** "suggestion", "consider"
- **info:** (default)

**Keywords for Type:**
- **suggestion:** "suggest", "consider", "recommend"
- **issue:** "issue", "problem", "error"
- **praise:** "good", "nice", "well"
- **question:** "?", "why", "how"

**Fix:** Ensure CodeRabbit comments contain these keywords for proper classification.

---

## Performance Metrics

### Expected Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Cache Hit Rate** | 70-80% | Typical for active reviews |
| **API Response Time (cached)** | <50ms | Redis lookup + JSON parse |
| **API Response Time (uncached)** | 500-1500ms | MCP call + GitHub API |
| **Cache TTL** | 5 minutes | Balances freshness vs performance |
| **Memory per PR** | ~10-50KB | Depends on comment count |

### Monitoring

**Logs to Watch:**
```
[CodeRabbit] Cache HIT/MISS
[CodeRabbit] Cached X comments for key (TTL: 5 min)
[CodeRabbit] Invalidated X cache entries for owner/repo
```

**Redis Monitoring:**
```bash
# Watch cache usage
watch -n 1 'redis-cli INFO stats | grep keyspace'

# Monitor cache hit rate
redis-cli INFO stats | grep keyspace_hits
redis-cli INFO stats | grep keyspace_misses
```

---

## Future Enhancements

### Planned Features

1. **Cache Warming**
   - Pre-fetch comments for active PRs
   - Reduce initial load time
   - Scheduled background job

2. **Metrics Dashboard**
   - Cache hit/miss ratio visualization
   - API response time graphs
   - Comment resolution rate

3. **Webhook Integration (Optional)**
   - Listen for GitHub PR events
   - Proactive cache invalidation
   - Real-time comment updates

4. **Batch Operations**
   - Resolve multiple comments at once
   - Bulk dismiss workflow
   - Comment filtering by severity

5. **Comment Search**
   - Full-text search across comments
   - Filter by severity/type/author
   - Search history

---

## References

- **Task DFO-202-EPIC21:** DiffViewer Component (8h) - COMPLETED
- **Task DFO-203-EPIC21:** CodeReview Integration (6h) - IN PROGRESS
- **DFO Analysis:** `/dashboard/app/DFO-205-ANALYSIS.md`
- **CodeRabbit MCP Server:** https://github.com/coderabbitai/mcp-server
- **Model Context Protocol:** https://modelcontextprotocol.io

---

**Last Updated:** 2026-01-02
**Maintained By:** ECO-Lambda | SOLARIA DFO Team
