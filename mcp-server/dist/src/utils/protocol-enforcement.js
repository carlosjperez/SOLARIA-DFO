/**
 * Protocol Enforcement Middleware
 * Ensures agents follow the mandatory DFO protocol
 *
 * @module protocol-enforcement
 */
export class ProtocolEnforcement {
    sessions = new Map();
    /**
     * Get or create session state
     */
    getSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                sessionId,
                calledTools: new Set(),
                warnings: [],
                violations: [],
            });
        }
        return this.sessions.get(sessionId);
    }
    /**
     * Validate before tool call - THROWS if protocol violated
     */
    beforeToolCall(sessionId, toolName, args) {
        const session = this.getSession(sessionId);
        // MANDATORY RULE 1: set_project_context must be called first
        // (except for system tools)
        const systemTools = [
            'set_project_context',
            'get_current_context',
            'get_work_context',
            'list_projects',
            'get_health',
            'get_stats',
        ];
        if (!systemTools.includes(toolName)) {
            if (!session.calledTools.has('set_project_context')) {
                const error = `🚫 PROTOCOL VIOLATION: Must call set_project_context first

Required action:
  mcp.call("set_project_context", {
    project_name: "Your Project Name"
  })

Why: Project isolation ensures data integrity and prevents accidental cross-project operations.

Current tool: ${toolName}
Session: ${sessionId}`;
                session.violations.push(error);
                throw new Error(error);
            }
        }
        // RECOMMENDED RULE 1: Check work context before starting work
        const workStartTools = [
            'create_task',
            'update_task',
            'create_task_items',
        ];
        if (workStartTools.includes(toolName)) {
            if (!session.calledTools.has('get_work_context')) {
                const warning = `⚠️  PROTOCOL WARNING: Recommended to call get_work_context first

Why: get_work_context() returns:
  - Tasks currently in_progress (avoid duplicate work)
  - Recent memory/context (maintain continuity)
  - Suggested next actions (smart prioritization)

Current tool: ${toolName}
You can continue, but consider calling get_work_context first.`;
                session.warnings.push(warning);
                console.warn(warning);
            }
        }
        // MANDATORY RULE 2: Must create task_items before marking in_progress
        if (toolName === 'update_task') {
            const params = args;
            if (params.status === 'in_progress') {
                // We can't check DB here, but we can warn
                const warning = `⚠️  PROTOCOL WARNING: When marking task as in_progress

Best practice:
  1. Call create_task_items() first to create subtask breakdown
  2. Then update status to in_progress
  3. Then complete_task_item() as you work through each subtask

This enables granular progress tracking and better visibility.`;
                session.warnings.push(warning);
                console.warn(warning);
            }
        }
        // Track tool usage
        session.calledTools.add(toolName);
    }
    /**
     * After tool call - track project context
     */
    afterToolCall(sessionId, toolName, result) {
        const session = this.getSession(sessionId);
        // Track project context when set
        if (toolName === 'set_project_context') {
            const resultData = result;
            session.projectContext = {
                project_id: resultData.project_id,
                project_name: resultData.project_name,
                set_at: new Date(),
            };
        }
    }
    /**
     * Get session statistics
     */
    getSessionStats(sessionId) {
        const session = this.getSession(sessionId);
        // Calculate protocol adherence score (0-100)
        let score = 100;
        score -= session.violations.length * 50; // Major penalty for violations
        score -= session.warnings.length * 10; // Minor penalty for warnings
        score = Math.max(0, score);
        return {
            tools_called: Array.from(session.calledTools),
            project_context: session.projectContext,
            warnings_count: session.warnings.length,
            violations_count: session.violations.length,
            protocol_adherence_score: score,
        };
    }
    /**
     * Clear session (for testing)
     */
    clearSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    /**
     * Get all sessions (for debugging)
     */
    getAllSessions() {
        return this.sessions;
    }
}
// Singleton instance
export const protocolEnforcer = new ProtocolEnforcement();
//# sourceMappingURL=protocol-enforcement.js.map