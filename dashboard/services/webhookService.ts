/**
 * SOLARIA DFO - Webhook Service
 *
 * Handles webhook subscriptions and event dispatching for n8n integration.
 * Supports async delivery with retries and logging.
 */

import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import crypto from 'crypto';

// Types
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

export class WebhookService {
    private db: Connection;
    private deliveryQueue: Array<{
        webhook: Webhook;
        payload: WebhookPayload;
        retryCount: number;
    }> = [];
    private isProcessing = false;

    constructor(db: Connection) {
        this.db = db;
    }

    /**
     * Dispatch an event to all matching webhooks
     */
    async dispatch(
        eventType: string,
        data: Record<string, unknown>,
        projectId?: number
    ): Promise<void> {
        try {
            // Find matching webhooks
            const webhooks = await this.findMatchingWebhooks(eventType, projectId);

            if (webhooks.length === 0) {
                return;
            }

            const payload: WebhookPayload = {
                event: eventType,
                timestamp: new Date().toISOString(),
                data,
                project_id: projectId,
                source: 'solaria-dfo',
            };

            // Queue deliveries
            for (const webhook of webhooks) {
                this.deliveryQueue.push({
                    webhook,
                    payload,
                    retryCount: 0,
                });
            }

            // Process queue (non-blocking)
            this.processQueue();
        } catch (error) {
            console.error('[WebhookService] Dispatch error:', error);
        }
    }

    /**
     * Find webhooks matching event type and project
     */
    private async findMatchingWebhooks(
        eventType: string,
        projectId?: number
    ): Promise<Webhook[]> {
        const [rows] = await this.db.execute<(Webhook & RowDataPacket)[]>(
            `SELECT * FROM webhooks
             WHERE active = 1
             AND (event_type = ? OR event_type = 'all')
             AND (project_id IS NULL OR project_id = ?)`,
            [eventType, projectId || null]
        );
        return rows;
    }

    /**
     * Process the delivery queue
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.deliveryQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.deliveryQueue.length > 0) {
            const item = this.deliveryQueue.shift()!;
            const result = await this.deliverWebhook(item.webhook, item.payload);

            // Log delivery
            await this.logDelivery(item.webhook, item.payload, result, item.retryCount);

            // Handle retry on failure
            if (!result.success && item.retryCount < item.webhook.max_retries) {
                // Requeue with delay
                setTimeout(() => {
                    this.deliveryQueue.push({
                        ...item,
                        retryCount: item.retryCount + 1,
                    });
                    this.processQueue();
                }, item.webhook.retry_delay_ms * (item.retryCount + 1));
            }

            // Update webhook stats
            await this.updateWebhookStats(item.webhook.id, result);
        }

        this.isProcessing = false;
    }

    /**
     * Deliver a single webhook
     */
    private async deliverWebhook(
        webhook: Webhook,
        payload: WebhookPayload
    ): Promise<WebhookDeliveryResult> {
        const startTime = Date.now();

        try {
            // Prepare headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'User-Agent': 'SOLARIA-DFO-Webhook/1.0',
                'X-Webhook-Event': payload.event,
                'X-Webhook-Timestamp': payload.timestamp,
                ...(webhook.headers || {}),
            };

            // Add HMAC signature if secret is configured
            if (webhook.secret) {
                const signature = this.generateSignature(
                    JSON.stringify(payload),
                    webhook.secret
                );
                headers['X-Webhook-Signature'] = signature;
            }

            // Make request
            const response = await fetch(webhook.url, {
                method: webhook.http_method,
                headers,
                body: webhook.http_method !== 'GET' ? JSON.stringify(payload) : undefined,
            });

            const responseBody = await response.text();
            const responseTimeMs = Date.now() - startTime;

            return {
                success: response.ok,
                statusCode: response.status,
                responseBody: responseBody.substring(0, 1000), // Truncate
                responseTimeMs,
            };
        } catch (error) {
            return {
                success: false,
                responseTimeMs: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Generate HMAC signature
     */
    private generateSignature(payload: string, secret: string): string {
        return crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    }

    /**
     * Log webhook delivery to database
     */
    private async logDelivery(
        webhook: Webhook,
        payload: WebhookPayload,
        result: WebhookDeliveryResult,
        retryCount: number
    ): Promise<void> {
        try {
            await this.db.execute(
                `INSERT INTO webhook_deliveries
                 (webhook_id, event_type, event_payload, request_url,
                  response_status_code, response_body, response_time_ms,
                  success, error_message, retry_count)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    webhook.id,
                    payload.event,
                    JSON.stringify(payload),
                    webhook.url,
                    result.statusCode || null,
                    result.responseBody || null,
                    result.responseTimeMs,
                    result.success ? 1 : 0,
                    result.error || null,
                    retryCount,
                ]
            );
        } catch (error) {
            console.error('[WebhookService] Log delivery error:', error);
        }
    }

    /**
     * Update webhook statistics
     */
    private async updateWebhookStats(
        webhookId: number,
        result: WebhookDeliveryResult
    ): Promise<void> {
        try {
            const updateField = result.success ? 'success_count' : 'failure_count';
            await this.db.execute(
                `UPDATE webhooks SET
                 trigger_count = trigger_count + 1,
                 ${updateField} = ${updateField} + 1,
                 last_triggered_at = NOW(),
                 last_status_code = ?,
                 last_error = ?
                 WHERE id = ?`,
                [
                    result.statusCode || null,
                    result.error || null,
                    webhookId,
                ]
            );
        } catch (error) {
            console.error('[WebhookService] Update stats error:', error);
        }
    }

    // ========================================================================
    // CRUD Operations
    // ========================================================================

    /**
     * List all webhooks
     */
    async list(projectId?: number): Promise<Webhook[]> {
        let query = 'SELECT * FROM webhooks';
        const params: (number | null)[] = [];

        if (projectId !== undefined) {
            query += ' WHERE project_id = ? OR project_id IS NULL';
            params.push(projectId);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await this.db.execute<(Webhook & RowDataPacket)[]>(query, params);
        return rows;
    }

    /**
     * Get a single webhook by ID
     */
    async get(id: number): Promise<Webhook | null> {
        const [rows] = await this.db.execute<(Webhook & RowDataPacket)[]>(
            'SELECT * FROM webhooks WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    /**
     * Create a new webhook
     */
    async create(data: {
        name: string;
        url: string;
        event_type: string;
        project_id?: number;
        http_method?: 'POST' | 'GET' | 'PUT';
        secret?: string;
        headers?: Record<string, string>;
        max_retries?: number;
        retry_delay_ms?: number;
    }): Promise<number> {
        // Generate secret if not provided
        const secret = data.secret || crypto.randomBytes(32).toString('hex');

        const [result] = await this.db.execute<ResultSetHeader>(
            `INSERT INTO webhooks
             (name, url, event_type, project_id, http_method, secret, headers, max_retries, retry_delay_ms)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.url,
                data.event_type,
                data.project_id || null,
                data.http_method || 'POST',
                secret,
                data.headers ? JSON.stringify(data.headers) : null,
                data.max_retries || 3,
                data.retry_delay_ms || 1000,
            ]
        );

        return result.insertId;
    }

    /**
     * Update a webhook
     */
    async update(
        id: number,
        data: Partial<{
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
        }>
    ): Promise<boolean> {
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            params.push(data.name);
        }
        if (data.url !== undefined) {
            updates.push('url = ?');
            params.push(data.url);
        }
        if (data.event_type !== undefined) {
            updates.push('event_type = ?');
            params.push(data.event_type);
        }
        if (data.project_id !== undefined) {
            updates.push('project_id = ?');
            params.push(data.project_id);
        }
        if (data.http_method !== undefined) {
            updates.push('http_method = ?');
            params.push(data.http_method);
        }
        if (data.secret !== undefined) {
            updates.push('secret = ?');
            params.push(data.secret);
        }
        if (data.headers !== undefined) {
            updates.push('headers = ?');
            params.push(JSON.stringify(data.headers));
        }
        if (data.active !== undefined) {
            updates.push('active = ?');
            params.push(data.active ? 1 : 0);
        }
        if (data.max_retries !== undefined) {
            updates.push('max_retries = ?');
            params.push(data.max_retries);
        }
        if (data.retry_delay_ms !== undefined) {
            updates.push('retry_delay_ms = ?');
            params.push(data.retry_delay_ms);
        }

        if (updates.length === 0) {
            return false;
        }

        params.push(id);

        const [result] = await this.db.execute<ResultSetHeader>(
            `UPDATE webhooks SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        return result.affectedRows > 0;
    }

    /**
     * Delete a webhook
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await this.db.execute<ResultSetHeader>(
            'DELETE FROM webhooks WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Get recent deliveries for a webhook
     */
    async getDeliveries(
        webhookId: number,
        limit = 50
    ): Promise<Record<string, unknown>[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(
            `SELECT * FROM webhook_deliveries
             WHERE webhook_id = ?
             ORDER BY created_at DESC
             LIMIT ?`,
            [webhookId, limit]
        );
        return rows;
    }

    /**
     * Test a webhook by sending a test event
     */
    async test(id: number): Promise<WebhookDeliveryResult> {
        const webhook = await this.get(id);
        if (!webhook) {
            return {
                success: false,
                responseTimeMs: 0,
                error: 'Webhook not found',
            };
        }

        const testPayload: WebhookPayload = {
            event: 'test',
            timestamp: new Date().toISOString(),
            data: {
                message: 'This is a test webhook from SOLARIA DFO',
                webhook_id: id,
                webhook_name: webhook.name,
            },
            source: 'solaria-dfo',
        };

        const result = await this.deliverWebhook(webhook, testPayload);
        await this.logDelivery(webhook, testPayload, result, 0);
        await this.updateWebhookStats(id, result);

        return result;
    }
}

export default WebhookService;
