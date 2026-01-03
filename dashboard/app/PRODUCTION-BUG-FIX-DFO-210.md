# Production Bug Fix - Projects Not Displaying (DFO-210)

**Date:** 2026-01-03
**Severity:** P0 - Critical Production Bug
**Status:** ✅ RESOLVED
**Fix Deployed:** 2026-01-03 16:05 UTC

---

## Executive Summary

**Problem:** Users could not see any projects in production dashboard (https://dfo.solaria.agency) despite backend API successfully returning 9 projects.

**Root Cause:** Response structure mismatch between backend (returns direct array) and frontend (expected wrapped object).

**Impact:** 100% of dashboard users unable to view or manage projects.

**Fix Time:** 75 minutes (identification → deployment)

---

## Technical Details

### Root Cause Analysis

**Backend Response Structure** (server.ts:1766):
```typescript
// Returns direct array
res.json(projects);
// Response: [{project1}, {project2}, ...]
```

**Frontend Expected Structure** (useApi.ts:93 - BEFORE FIX):
```typescript
const { data } = await projectsApi.getAll();
const projects = data.projects || data.data || [];
// ❌ BUG: data is array, data.projects = undefined, data.data = undefined
// Result: projects = [] (empty array)
```

### The Bug Explained

1. Backend returns: `[{id: 99, ...}, {id: 98, ...}, ...]` (9 projects)
2. Axios wraps in data: `{data: [{id: 99, ...}, ...]}`
3. Frontend tries: `data.projects` → `undefined` (accessing property on array)
4. Frontend tries: `data.data` → `undefined` (accessing property on array)
5. Frontend falls back to: `[]` (empty array)
6. React Query caches empty array for 5 minutes (staleTime)
7. User sees: "No hay proyectos todavia" message

### Evidence from Logs

**Before 15:55 UTC:** Browser successfully requesting `/api/projects`
```
[03/Jan/2026:13:41:23] "GET /api/projects HTTP/1.1" 200
[03/Jan/2026:13:49:17] "GET /api/projects HTTP/1.1" 200
[03/Jan/2026:15:55:42] "GET /api/projects HTTP/1.1" 200
```

**After 15:55 UTC:** No more `/api/projects` requests
```
[03/Jan/2026:15:58:10] "GET /api/dashboard/alerts HTTP/1.1" 200
[03/Jan/2026:16:08:15] "GET /api/dashboard/alerts HTTP/1.1" 200
```

**Conclusion:** React Query cache serving stale empty array, no new API calls.

---

## The Fix

**File:** `/dashboard/app/src/hooks/useApi.ts`
**Line:** 93

**BEFORE:**
```typescript
export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await projectsApi.getAll();
            // API returns { projects: [...] } not { data: [...] }
            const projects = data.projects || data.data || [];
            return projects.map((p: Record<string, unknown>) => transformProjectData(p));
        },
    });
}
```

**AFTER:**
```typescript
export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await projectsApi.getAll();
            // API returns direct array (backend line 1766: res.json(projects))
            const projects = Array.isArray(data) ? data : (data.projects || data.data || []);
            return projects.map((p: Record<string, unknown>) => transformProjectData(p));
        },
    });
}
```

**Key Change:** Check `Array.isArray(data)` FIRST before attempting to access object properties.

---

## Testing

### Test Suite Created

**File:** `/dashboard/app/src/hooks/__tests__/useProjects.test.ts`

**Coverage:**
- ✅ Direct array response (production case)
- ✅ Wrapped object with `data.projects`
- ✅ Wrapped object with `data.data`
- ✅ Empty array response
- ✅ Malformed response handling
- ✅ Snake_case to camelCase transformation
- ✅ Error handling (network, 404, 500)
- ✅ React Query integration
- ✅ Production regression prevention

**Results:** 12/12 tests passing (100%)

### Manual Verification

1. **API Response:** `curl` confirmed 9 projects returned correctly
2. **Deployment:** New build `index-DiGXsW1C.js` served successfully
3. **User Confirmation:** "ok, ahora lo vemos" - projects now visible in browser

---

## Deployment Process

```bash
# 1. Build new version
cd /Users/carlosjperez/Documents/GitHub/SOLARIA-DFO/dashboard/app
pnpm build
# ✓ built in 4.40s

# 2. Deploy to production
rsync -avz --delete dist/ root@148.230.118.124:/var/www/dfo-v2/
# sent 590,718 bytes

# 3. Reload nginx
ssh -i ~/.ssh/id_ed25519 root@148.230.118.124 \
  "docker exec solaria-dfo-nginx nginx -s reload"
# signal process started

# 4. Verify deployment
curl -s https://dfo.solaria.agency | grep "index-"
# index-DiGXsW1C.js (confirmed new bundle)
```

---

## Lessons Learned

### 1. Always Check Response Type Before Property Access

**DON'T:**
```typescript
const data = response.data;
const items = data.items || data.data || [];
```

**DO:**
```typescript
const data = response.data;
const items = Array.isArray(data) ? data : (data.items || data.data || []);
```

### 2. Backend-Frontend Contract Must Be Explicit

**Problem:** Assumed wrapped object but backend returned direct array.

**Solution:** Document API response structures in OpenAPI/Swagger spec.

### 3. React Query Cache Can Hide Bugs

**Problem:** 5-minute staleTime meant empty array served from cache, no new API calls.

**Solution:**
- Implement proper error boundaries
- Add cache invalidation on navigation
- Monitor for "no data" states that persist

### 4. Visual Verification Is Critical

**Problem:** Backend API tests passed, assumed frontend working.

**Solution:**
- Always perform end-to-end visual verification in production
- Implement automated E2E tests with Playwright
- Add monitoring/alerts for "empty state" pages

### 5. Type Safety Could Have Prevented This

**Current:** Using `Record<string, unknown>` allows any structure.

**Better:**
```typescript
interface ApiResponse<T> {
    data: T | { data: T } | { projects: T };
}

// Or enforce single response structure
type ProjectsResponse = Array<Project>;
```

---

## Prevention Strategy

### Immediate Actions (Completed)

1. ✅ Add explicit `Array.isArray()` check in `useProjects()`
2. ✅ Create comprehensive test suite (12 tests)
3. ✅ Document fix in this file
4. ✅ Update DFO task tracker (DFO-210)

### Short-term (Next Sprint)

1. **API Documentation:** Create OpenAPI spec for all endpoints
2. **Type Safety:** Define strict response types in TypeScript
3. **E2E Tests:** Add Playwright tests for critical user flows
4. **Monitoring:** Add Sentry error tracking for production
5. **Cache Strategy:** Review React Query staleTime configurations

### Long-term

1. **API Gateway:** Implement response normalization layer
2. **Contract Testing:** Add Pact tests for backend-frontend contracts
3. **Visual Regression:** Add Percy or Chromatic visual testing
4. **Alerting:** Set up alerts for "empty state" pages with traffic

---

## Related Tasks

- **DFO-210:** Fix Frontend Projects Display - Response Structure Mismatch ✅ COMPLETED
- **DFO-209:** Fix General Test Suite (177 failing tests) - IN PROGRESS
- **DFO-207:** CodeRabbit Compilation Issue - BLOCKED

---

## Metrics

| Metric | Value |
|--------|-------|
| Time to Identify | 45 minutes |
| Time to Fix | 15 minutes |
| Time to Deploy | 10 minutes |
| Time to Verify | 5 minutes |
| **Total Resolution Time** | **75 minutes** |
| Users Affected | 100% (all dashboard users) |
| Data Loss | None |
| Downtime | None (API functional) |
| Tests Added | 12 |
| Test Pass Rate | 100% |

---

## Conclusion

This bug demonstrates the importance of:
1. **Defensive programming** - Always validate data types before accessing properties
2. **End-to-end testing** - Backend success ≠ frontend success
3. **Visual verification** - Critical for user-facing features
4. **Comprehensive testing** - Prevent regressions with exhaustive test suites
5. **Clear contracts** - Backend and frontend must agree on data structures

The fix has been deployed successfully and verified in production. All 9 projects are now visible to users.

---

**Fixed By:** ECO-Lambda (Agent ID 11)
**Verified By:** Comandante (carlosjperez)
**Environment:** Production (https://dfo.solaria.agency)
**Version:** 3.5.1 (Build: index-DiGXsW1C.js)
