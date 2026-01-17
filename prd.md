# PRD: SOLARIA Digital Field Operations - Complete Implementation Plan

**Project:** SOLARIA-DFO v4.0
**Version:** 1.0
**Status:** In Progress (83.5% complete)
**Last Updated:** 2026-01-16

---

## Executive Summary

SOLARIA Digital Field Operations is a project management system with executive supervision and AI agent integration via MCP. The project is currently **83.5% complete** with operational services in production.

### Current Metrics

| Metric | Value | % |
|--------|-------|---|
| Total Tasks | 27 | 100% |
| Completed | 0 | 0% |
| Pending | 27 | 100% |
| **Effort Remaining** | **~229h** | **~17.5 person-weeks** |

---

## USER STORIES

### PHASE 1: CRITICAL FIXES

#### US-001: Fix MCP Server - DB + set_project_context
**Priority**: 🔥 Critical
**Effort**: 24h

As a developer, I want the MCP server to function correctly so that AI agents can establish project context and execute operations reliably.

**Acceptance Criteria**:
- MCP server returns healthy status
- `set_project_context` endpoint operates without errors
- Database connection is stable
- Integration tests pass
- Health check endpoint returns valid JSON

**Technical Details**:
- Fix DB initialization issue
- Implement fallback to Dashboard API
- Fix `set_project_context` to use API instead of local DB
- Add comprehensive error handling
- Regression tests in staging

---

#### US-002: Implement Health Check Endpoint
**Priority**: High
**Effort**: 4h

As a system administrator, I want a `/health` endpoint to monitor infrastructure status so that I can identify and resolve issues proactively.

**Acceptance Criteria**:
- Endpoint returns health status for all services
- Includes database, Redis, filesystem, memory, CPU, and uptime checks
- Response includes latency metrics where applicable
- Endpoint returns structured JSON
- Tests covering all check scenarios

**Technical Details**:
```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string, latency_ms?: number };
    redis: { status: string, latency_ms?: number };
    filesystem: { free_space_gb: number, used_percent: number };
    memory: { used_percent: number, available_mb: number };
    cpu: { load_avg: number[], usage_percent: number };
    uptime: { seconds: number, human: string };
  };
}
```

---

#### US-003: Implement Stats Dashboard Endpoint
**Priority**: High
**Effort**: 6h

As a project manager, I want a `/stats` endpoint to view aggregated system metrics so that I can make data-driven decisions about project progress.

**Acceptance Criteria**:
- Endpoint returns comprehensive statistics
- Supports filtering by project_id, sprint_id, date range
- Returns task, project, agent, velocity, and sprint metrics
- Supports JSON and human-readable formats
- Tests covering all filter combinations

**Technical Details**:
```typescript
interface StatsResponse {
  tasks: {
    total: number;
    by_status: { pending: number; in_progress: number; completed: number };
    by_priority: { critical: number; high: number; medium: number; low: number };
    avg_completion_hours: number;
  };
  projects: {
    active: number;
    completed: number;
    archived: number;
    total_budget: string;
  };
  agents: {
    active: number;
    total_tasks_assigned: number;
    avg_tasks_per_agent: number;
  };
  velocity: {
    last_7_days: number;
    last_30_days: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  sprints: {
    active: { id: number, name: string, progress_percent: number };
  };
}
```

---

#### US-004: Fix Inline Documents Endpoint
**Priority**: High
**Effort**: 2h

As an AI agent, I want the inline documents endpoint to handle long documents correctly so that I can retrieve and display document content reliably.

**Acceptance Criteria**:
- Endpoint handles long documents without serialization errors
- Strict input validation with Zod schemas
- Consistent error handling
- Support for both JSON and human-readable formats
- Tests covering edge cases

**Technical Details**:
- Migrate to ResponseBuilder pattern
- Apply Zod validation
- Fix error handling
- Ensure format='human' support

---

#### US-005: Add Task Codes to Notifications
**Priority**: High
**Effort**: 2h

As a project manager, I want task notifications to include task codes (e.g., DFO-155) so that I can quickly identify and navigate to specific tasks.

**Acceptance Criteria**:
- Socket.IO events include task_number and epic_number
- ActivityFeed renders formatted task codes as clickable links
- Types TypeScript updated with new fields
- Tests verify notification formatting

---

#### US-006: Standardize ProjectsPage with Metrics
**Priority**: High
**Effort**: 3h

As a user, I want the Projects page to have consistent metrics and visual selectors so that I can efficiently navigate and manage projects.

**Acceptance Criteria**:
- Projects page uses standard layout components
- Consistent metrics display
- Visual selectors for views (list/grid/kanban)
- 88% completion → 100% completion
- Regression tests pass

---

### PHASE 2: MCP REFACTORING

#### US-007: Design and Implement MCP v2.0 Architecture
**Priority**: Critical
**Effort**: 8h

As a developer, I want to implement MCP v2.0 using the Sketch pattern so that we can reduce complexity from 70+ tools to 2 main endpoints.

**Acceptance Criteria**:
- Design document for MCP v2.0 architecture
- Branch `feature/mcp-refactoring-v2` created
- Full backup of current MCP server
- Documentation of current tool behavior
- Test suite for functional equivalence

**Technical Details**:
- Reduce tools from 70+ to 2 (get_context, run_code)
- Eliminate local DB dependency
- Reduce token consumption from ~500 to ~75 tokens/request (85% reduction)
- Simplified maintenance

---

#### US-008: Implement get_context Endpoint
**Priority**: Critical
**Effort**: 10h

As an AI agent, I want a `get_context` endpoint that returns complete system state so that I can understand the current project context in a single call.

**Acceptance Criteria**:
- Endpoint returns project, tasks, agents, stats, health, sprints, memories
- Supports optional includes for each data type
- Returns both JSON and human-readable formats
- Validates input parameters
- Tests covering all include combinations

**Technical Details**:
```typescript
interface GetContextParams {
  project_id?: number;
  project_name?: string;
  include?: {
    tasks?: boolean;
    agents?: boolean;
    stats?: boolean;
    health?: boolean;
    sprints?: boolean;
    memories?: boolean;
  };
  format?: 'json' | 'human';
}
```

---

#### US-009: Implement run_code Endpoint with Sandbox
**Priority**: Critical
**Effort**: 10h

As an AI agent, I want a `run_code` endpoint that executes JavaScript/TypeScript code in a secure sandbox so that I can perform complex operations with full API access.

**Acceptance Criteria**:
- Endpoint executes arbitrary JS/TS code
- Secure sandbox using vm2
- Timeout configured (max 30s)
- Provides apiCall helper with JWT auth
- Includes utility functions (fetch, console, formatDate, formatCurrency)
- Tests covering code execution, errors, timeouts, and security

**Technical Details**:
```typescript
interface RunCodeParams {
  code: string;
  language?: 'javascript' | 'typescript' | 'sql';
  timeout?: number;
  sandbox?: 'strict' | 'permissive';
}
```

**Security Requirements**:
- Complete isolation with vm2
- Whitelist of allowed API endpoints
- AST parsing for code validation
- Rate limiting per session
- Complete execution logs

---

#### US-010: Migrate All MCP Tools to run_code Scripts
**Priority**: High
**Effort**: 12h

As a developer, I want to migrate all 70+ MCP tools to `run_code` scripts so that we can maintain a minimal codebase.

**Acceptance Criteria**:
- All project operations (create, read, update, delete) use run_code
- All task operations use run_code
- All memory operations use run_code
- All agent operations use run_code
- Usage examples for each category
- Functional equivalence tests pass

**Technical Details**:
- List all current MCP tools
- Create script library for common operations
- Migrate each tool category
- Validate functionality matches original
- Document usage patterns

---

#### US-0011: Deploy and Monitor MCP v2.0
**Priority**: High
**Effort**: 4h

As a DevOps engineer, I want to deploy MCP v2.0 with dual operation so that we can safely transition without downtime.

**Acceptance Criteria**:
- MCP v2.0 deployed to staging
- Dual operation (v1 + v2) for 48 hours
- Metrics comparison (tokens, latency, errors)
- Cut-over to v2.0 if metrics green
- Lessons learned documented

**Success Metrics**:
- Tool reduction: ≥95% (70+ → 2)
- Tokens per request: ≤15% of current
- Latency: ≥60% faster
- Zero API errors
- Zero MCP server errors

---

### PHASE 3: FRONTEND MIGRATION

#### US-012: Configure Storybook
**Priority**: High
**Effort**: 8h

As a developer, I want Storybook configured so that I can develop and document components in isolation.

**Acceptance Criteria**:
- Storybook with Vite + React + TS preset
- Addons: a11y, viewport, controls
- Stories for existing components (PageHeader, StatsGrid, StatCard, BackButton, StandardPageLayout)
- Props documentation and usage examples
- Build configured for deployment

---

#### US-013: Implement ContentGrid and ContentGroup Components
**Priority**: Medium
**Effort**: 5h

As a developer, I want responsive layout components so that I can eliminate grid code duplication.

**Acceptance Criteria**:
- `ContentGrid.tsx` with columns (1/2/3), gap, loading, emptyState
- `ContentGroup.tsx` with wrapper and optional title
- Responsive behavior (mobile: 1 col, tablet: 2 cols, desktop: 3 cols)
- Rendering and responsive tests
- Storybook stories

---

#### US-014: Implement SearchAndFilterBar Component
**Priority**: 🔥 Critical
**Effort**: 6h

As a developer, I want a unified search and filter component so that I can standardize UX across all listing pages.

**Acceptance Criteria**:
- Interface with SearchInput + multiple FilterDropdown
- Composition pattern (children composables)
- Controlled/uncontrolled state management modes
- Integration with design tokens
- Exhaustive tests (multiple filters, search + filters, clear all)
- Storybook with real usage examples

---

#### US-015: Implement SortBar Component
**Priority**: Medium
**Effort**: 5h

As a user, I want a visual sorting component so that I can sort content consistently across pages.

**Acceptance Criteria**:
- Sorting criteria dropdown
- Visual asc/desc toggle with icons
- onChange callback with `{ field, direction }`
- Complete accessibility (keyboard, ARIA)
- Interaction tests
- Storybook stories

---

#### US-016: Implement ViewSelector Component
**Priority**: Medium
**Effort**: 3h

As a user, I want a view selector (Grid/List/Kanban) so that I can switch between display modes consistently.

**Acceptance Criteria**:
- Component with Lucide icons (LayoutGrid, List, Columns)
- Hover/focus/active states
- localStorage persistence
- View change tests
- Storybook stories

---

#### US-017: Refactor Office Page as Reference
**Priority**: 🔥 Critical
**Effort**: 6h

As a developer, I want to refactor the Office page first so that it serves as a template for other page migrations.

**Acceptance Criteria**:
- Office page migrated to StandardPageLayout
- Integrated PageHeader, SearchAndFilterBar, ContentGrid
- Filters migrated to FilterDropdown components
- Comprehensive regression tests
- Pattern documented in PATTERNS.md

**Dependencies**: SearchAndFilterBar, ContentGrid, ViewSelector, SortBar

---

#### US-018: Refactor Businesses Page
**Priority**: Medium
**Effort**: 5h

As a developer, I want to refactor the Businesses page following the Office page pattern so that consistency is maintained across pages.

**Acceptance Criteria**:
- Follows pattern established by Office page
- Custom components replaced with standard ones
- Filters, search, and sorting verified
- Regression tests pass
- Code review comparing with Office

---

#### US-019: Refactor Memories Page
**Priority**: Medium
**Effort**: 5h

As a developer, I want to refactor the Memories page with special attention to semantic search and tags so that the persistent memory system is standardized.

**Acceptance Criteria**:
- Follows migration pattern
- Semantic search and tags properly handled
- Boost system and related memories verified
- Full-text and vector search tests
- Regression tests pass

---

#### US-020: Configure Visual Regression Tests
**Priority**: Medium
**Effort**: 4h

As a QA engineer, I want visual regression tests so that I can prevent UI regressions in page migrations.

**Acceptance Criteria**:
- Percy.io or Chromatic configured
- Snapshots for Office, Businesses, Memories pages
- States captured: empty, loading, with data, active filters
- Integrated in CI/CD
- Baseline established for comparisons

---

#### US-021: Refactor Projects Page
**Priority**: 🔥 Critical
**Effort**: 8h

As a user, I want the Projects page (most used) migrated so that I have a consistent and performant experience.

**Acceptance Criteria**:
- Complex filter logic migrated to standard components
- Creation/editing modals preserved
- Navigation to ProjectDetailPage maintained
- Exhaustive multiple filter tests
- Performance testing for large lists

---

#### US-022: Refactor Infrastructure Page
**Priority**: Medium
**Effort**: 6h

As a sysadmin, I want the Infrastructure page migrated so that I can monitor health checks, connections, and system status.

**Acceptance Criteria**:
- Migrated to standard components
- Health check functionality preserved
- Real-time status indicators maintained
- Connection and monitoring tests
- Regression tests pass

---

#### US-023: Refactor Archived Projects Page
**Priority**: Medium
**Effort**: 5h

As a project manager, I want the Archived Projects page migrated so that I can efficiently manage archived projects.

**Acceptance Criteria**:
- Follows established pattern
- Archive search functional
- Restore functionality verified
- Archive date filters working
- Archive/restore tests pass

---

#### US-024: Conduct Accessibility Audit
**Priority**: Medium
**Effort**: 6h

As a user with disabilities, I want WCAG 2.1 AA compliant pages so that I can use the application effectively.

**Acceptance Criteria**:
- axe DevTools run on all pages
- Lighthouse accessibility audit completed
- ARIA labels and keyboard navigation verified
- Screen reader testing (NVDA/JAWS)
- All issues fixed
- Accessibility standards documented

---

#### US-025: Implement Integration Tests
**Priority**: Medium
**Effort**: 8h

As a QA engineer, I want integration tests for critical business flows so that I can ensure correct system behavior.

**Acceptance Criteria**:
- Test suite with React Testing Library
- Flows: create project → edit → archive → restore
- Multiple simultaneous filter tests
- Page navigation tests
- Integrated in CI/CD

---

#### US-026: Refactor Dashboard Page
**Priority**: 🔥 Critical
**Effort**: 10h

As a user, I want the main Dashboard page migrated so that I have a consistent experience with stats, charts, and real-time updates.

**Acceptance Criteria**:
- Exhaustive analysis of current Dashboard
- Section-by-section incremental migration
- Real-time functionality (WebSocket) preserved
- Stats, charts, activity feed migrated
- Comprehensive tests for each section
- Performance testing (no regression)

---

#### US-027: Complete Final Polish and Launch Preparation
**Priority**: High
**Effort**: 26h

As a project owner, I want the system production-ready with complete security, documentation, monitoring, and QA so that we can launch with confidence.

**Acceptance Criteria**:

**Security Audit (4h)**:
- OWASP Top 10 review
- Input sanitization validation
- JWT implementation verification
- Rate limiting on critical endpoints
- RBAC permissions review
- Basic penetration testing
- All vulnerabilities fixed

**Final Documentation (6h)**:
- API Documentation (OpenAPI/Swagger)
- Dashboard User Guide
- MCP Integration Guide
- Troubleshooting Guide
- Updated Architecture Overview
- Deployment Guide
- Onboarding Guide

**Performance Optimization (4h)**:
- Lighthouse audit on all pages
- Bundle size optimized (<500KB gzip)
- Code splitting implemented
- Lazy loading configured
- Component memoization
- List virtualization
- Lighthouse score >90 on all pages

**Load Testing (3h)**:
- k6 or Artillery configured
- Tests for 100, 500, 1000 concurrent users
- Bottlenecks identified
- Slow queries optimized
- Caching implemented
- System limits documented

**Backup & DR Plan (2h)**:
- Automated daily DB backups
- Offsite backup storage (S3)
- Configuration and file backups
- Restore procedure documented
- Restore tested in staging
- RPO/RTO documented

**Monitoring & Alerting (3h)**:
- Grafana dashboards for key metrics
- Alerts configured (Slack/PagerDuty)
- Error monitoring (Sentry)
- Uptime monitoring
- Performance monitoring (APM)
- Centralized logging
- Alert thresholds documented

**Final QA & UAT (4h)**:
- Complete manual QA of all features
- UAT with stakeholders
- Feedback collected and issues fixed
- All tests passing
- Success metrics verified
- Final project sign-off

---

## TECHNICAL STACK

### Backend
- Node.js 22+
- Express.js
- MariaDB
- Redis
- Socket.IO (real-time)

### Frontend
- React 18+
- TypeScript
- Vite
- TailwindCSS
- Storybook

### Testing
- Jest
- React Testing Library
- Playwright (E2E)
- Percy/Chromatic (visual)

### Infrastructure
- Docker
- Docker Compose
- Nginx (reverse proxy)
- PM2 (process manager)

---

## SUCCESS METRICS

### Technical Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|--------------|
| Completion Rate | 83.5% | 100% | Completed tasks / Total |
| MCP Tools | 70+ | 2 | Tool count |
| Tokens per Request | ~500 | ≤75 | Monitoring |
| API Latency | 250ms | <150ms | p95 latency |
| Lighthouse Performance | N/A | >90 | Lighthouse CI |
| Lighthouse Accessibility | N/A | >95 | axe DevTools |
| Bundle Size | N/A | <500KB gzip | Webpack analyzer |
| Test Coverage | N/A | >75% | Jest coverage |

---

**Document Version**: 1.0
**Author**: Sisyphus (AI Architect)
**Date**: 2026-01-16
**Next Review**: 2026-02-16

---

**END OF PRD**
