/**
 * Protocol Enforcement Middleware
 * Ensures agents follow the mandatory DFO protocol
 *
 * @module protocol-enforcement
 */
export interface SessionState {
    sessionId: string;
    calledTools: Set<string>;
    projectContext?: {
        project_id: number;
        project_name: string;
        set_at: Date;
    };
    warnings: string[];
    violations: string[];
}
export declare class ProtocolEnforcement {
    private sessions;
    /**
     * Get or create session state
     */
    private getSession;
    /**
     * Validate before tool call - THROWS if protocol violated
     */
    beforeToolCall(sessionId: string, toolName: string, args: unknown): void;
    /**
     * After tool call - track project context
     */
    afterToolCall(sessionId: string, toolName: string, result: unknown): void;
    /**
     * Get session statistics
     */
    getSessionStats(sessionId: string): {
        tools_called: string[];
        project_context: SessionState['projectContext'];
        warnings_count: number;
        violations_count: number;
        protocol_adherence_score: number;
    };
    /**
     * Clear session (for testing)
     */
    clearSession(sessionId: string): void;
    /**
     * Get all sessions (for debugging)
     */
    getAllSessions(): Map<string, SessionState>;
}
export declare const protocolEnforcer: ProtocolEnforcement;
