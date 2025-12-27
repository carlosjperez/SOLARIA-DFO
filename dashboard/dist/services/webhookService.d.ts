/**
 * SOLARIA DFO - Webhook Service
 *
 * Handles webhook subscriptions and event dispatching for n8n integration.
 * Supports async delivery with retries and logging.
 */
import { Connection } from 'mysql2/promise';
export interface Webhook {
    id: number;
    name: string;
    project_id: number | null;
    url: string;
    event_type: string;
    http_method: 'POST' | 'GET' | 'PUT';
    secret: string | null;
    headers: Record<string, string> | null;
    active: number;
    max_retries: number;
    retry_delay_ms: number;
    trigger_count: number;
    success_count: number;
    failure_count: number;
}
export interface WebhookPayload {
    event: string;
    timestamp: string;
    data: Record<string, unknown>;
    project_id?: number;
    source: 'solaria-dfo';
}
export interface WebhookDeliveryResult {
    success: boolean;
    statusCode?: number;
    responseBody?: string;
    responseTimeMs: number;
    error?: string;
}
export declare class WebhookService {
    private db;
    private deliveryQueue;
    private isProcessing;
    constructor(db: Connection);
    /**
     * Dispatch an event to all matching webhooks
     */
    dispatch(eventType: string, data: Record<string, unknown>, projectId?: number): Promise<void>;
    /**
     * Find webhooks matching event type and project
     */
    private findMatchingWebhooks;
    /**
     * Process the delivery queue
     */
    private processQueue;
    /**
     * Deliver a single webhook
     */
    private deliverWebhook;
    /**
     * Generate HMAC signature
     */
    private generateSignature;
    /**
     * Log webhook delivery to database
     */
    private logDelivery;
    /**
     * Update webhook statistics
     */
    private updateWebhookStats;
    /**
     * List all webhooks
     */
    list(projectId?: number): Promise<Webhook[]>;
    /**
     * Get a single webhook by ID
     */
    get(id: number): Promise<Webhook | null>;
    /**
     * Create a new webhook
     */
    create(data: {
        name: string;
        url: string;
        event_type: string;
        project_id?: number;
        http_method?: 'POST' | 'GET' | 'PUT';
        secret?: string;
        headers?: Record<string, string>;
        max_retries?: number;
        retry_delay_ms?: number;
    }): Promise<number>;
    /**
     * Update a webhook
     */
    update(id: number, data: Partial<{
        name: string;
        url: string;
        event_type: string;
        project_id: number | null;
        http_method: 'POST' | 'GET' | 'PUT';
        secret: string;
        headers: Record<string, string>;
        active: boolean;
        max_retries: number;
        retry_delay_ms: number;
    }>): Promise<boolean>;
    /**
     * Delete a webhook
     */
    delete(id: number): Promise<boolean>;
    /**
     * Get recent deliveries for a webhook
     */
    getDeliveries(webhookId: number, limit?: number): Promise<Record<string, unknown>[]>;
    /**
     * Test a webhook by sending a test event
     */
    test(id: number): Promise<WebhookDeliveryResult>;
}
export default WebhookService;
