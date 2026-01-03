"use strict";
/**
 * SOLARIA DFO - Webhook Service
 *
 * Handles webhook subscriptions and event dispatching for n8n integration.
 * Supports async delivery with retries and logging.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
var crypto_1 = require("crypto");
var WebhookService = /** @class */ (function () {
    function WebhookService(db) {
        this.deliveryQueue = [];
        this.isProcessing = false;
        this.db = db;
    }
    /**
     * Dispatch an event to all matching webhooks
     */
    WebhookService.prototype.dispatch = function (eventType, data, projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var webhooks, payload, _i, webhooks_1, webhook, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.findMatchingWebhooks(eventType, projectId)];
                    case 1:
                        webhooks = _a.sent();
                        if (webhooks.length === 0) {
                            return [2 /*return*/];
                        }
                        payload = {
                            event: eventType,
                            timestamp: new Date().toISOString(),
                            data: data,
                            project_id: projectId,
                            source: 'solaria-dfo',
                        };
                        // Queue deliveries
                        for (_i = 0, webhooks_1 = webhooks; _i < webhooks_1.length; _i++) {
                            webhook = webhooks_1[_i];
                            this.deliveryQueue.push({
                                webhook: webhook,
                                payload: payload,
                                retryCount: 0,
                            });
                        }
                        // Process queue (non-blocking)
                        this.processQueue();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[WebhookService] Dispatch error:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find webhooks matching event type and project
     */
    WebhookService.prototype.findMatchingWebhooks = function (eventType, projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.execute("SELECT * FROM webhooks\n             WHERE active = 1\n             AND (event_type = ? OR event_type = 'all')\n             AND (project_id IS NULL OR project_id = ?)", [eventType, projectId || null])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    /**
     * Process the delivery queue
     */
    WebhookService.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isProcessing || this.deliveryQueue.length === 0) {
                            return [2 /*return*/];
                        }
                        this.isProcessing = true;
                        _loop_1 = function () {
                            var item, result;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        item = this_1.deliveryQueue.shift();
                                        return [4 /*yield*/, this_1.deliverWebhook(item.webhook, item.payload)];
                                    case 1:
                                        result = _b.sent();
                                        // Log delivery
                                        return [4 /*yield*/, this_1.logDelivery(item.webhook, item.payload, result, item.retryCount)];
                                    case 2:
                                        // Log delivery
                                        _b.sent();
                                        // Handle retry on failure
                                        if (!result.success && item.retryCount < item.webhook.max_retries) {
                                            // Requeue with delay
                                            setTimeout(function () {
                                                _this.deliveryQueue.push(__assign(__assign({}, item), { retryCount: item.retryCount + 1 }));
                                                _this.processQueue();
                                            }, item.webhook.retry_delay_ms * (item.retryCount + 1));
                                        }
                                        // Update webhook stats
                                        return [4 /*yield*/, this_1.updateWebhookStats(item.webhook.id, result)];
                                    case 3:
                                        // Update webhook stats
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!(this.deliveryQueue.length > 0)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        this.isProcessing = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deliver a single webhook
     */
    WebhookService.prototype.deliverWebhook = function (webhook, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, headers, signature, response, responseBody, responseTimeMs, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        headers = __assign({ 'Content-Type': 'application/json', 'User-Agent': 'SOLARIA-DFO-Webhook/1.0', 'X-Webhook-Event': payload.event, 'X-Webhook-Timestamp': payload.timestamp }, (webhook.headers || {}));
                        // Add HMAC signature if secret is configured
                        if (webhook.secret) {
                            signature = this.generateSignature(JSON.stringify(payload), webhook.secret);
                            headers['X-Webhook-Signature'] = signature;
                        }
                        return [4 /*yield*/, fetch(webhook.url, {
                                method: webhook.http_method,
                                headers: headers,
                                body: webhook.http_method !== 'GET' ? JSON.stringify(payload) : undefined,
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 3:
                        responseBody = _a.sent();
                        responseTimeMs = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: response.ok,
                                statusCode: response.status,
                                responseBody: responseBody.substring(0, 1000), // Truncate
                                responseTimeMs: responseTimeMs,
                            }];
                    case 4:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                responseTimeMs: Date.now() - startTime,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error',
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate HMAC signature
     */
    WebhookService.prototype.generateSignature = function (payload, secret) {
        return crypto_1.default
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    };
    /**
     * Log webhook delivery to database
     */
    WebhookService.prototype.logDelivery = function (webhook, payload, result, retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.execute("INSERT INTO webhook_deliveries\n                 (webhook_id, event_type, event_payload, request_url,\n                  response_status_code, response_body, response_time_ms,\n                  success, error_message, retry_count)\n                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
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
                            ])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('[WebhookService] Log delivery error:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update webhook statistics
     */
    WebhookService.prototype.updateWebhookStats = function (webhookId, result) {
        return __awaiter(this, void 0, void 0, function () {
            var updateField, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updateField = result.success ? 'success_count' : 'failure_count';
                        return [4 /*yield*/, this.db.execute("UPDATE webhooks SET\n                 trigger_count = trigger_count + 1,\n                 ".concat(updateField, " = ").concat(updateField, " + 1,\n                 last_triggered_at = NOW(),\n                 last_status_code = ?,\n                 last_error = ?\n                 WHERE id = ?"), [
                                result.statusCode || null,
                                result.error || null,
                                webhookId,
                            ])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('[WebhookService] Update stats error:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // CRUD Operations
    // ========================================================================
    /**
     * List all webhooks
     */
    WebhookService.prototype.list = function (projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, params, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = 'SELECT * FROM webhooks';
                        params = [];
                        if (projectId !== undefined) {
                            query += ' WHERE project_id = ? OR project_id IS NULL';
                            params.push(projectId);
                        }
                        query += ' ORDER BY created_at DESC';
                        return [4 /*yield*/, this.db.execute(query, params)];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    /**
     * Get a single webhook by ID
     */
    WebhookService.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.execute('SELECT * FROM webhooks WHERE id = ?', [id])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    /**
     * Create a new webhook
     */
    WebhookService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var secret, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        secret = data.secret || crypto_1.default.randomBytes(32).toString('hex');
                        return [4 /*yield*/, this.db.execute("INSERT INTO webhooks\n             (name, url, event_type, project_id, http_method, secret, headers, max_retries, retry_delay_ms)\n             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                data.name,
                                data.url,
                                data.event_type,
                                data.project_id || null,
                                data.http_method || 'POST',
                                secret,
                                data.headers ? JSON.stringify(data.headers) : null,
                                data.max_retries || 3,
                                data.retry_delay_ms || 1000,
                            ])];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, result.insertId];
                }
            });
        });
    };
    /**
     * Update a webhook
     */
    WebhookService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, params, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = [];
                        params = [];
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
                            return [2 /*return*/, false];
                        }
                        params.push(id);
                        return [4 /*yield*/, this.db.execute("UPDATE webhooks SET ".concat(updates.join(', '), " WHERE id = ?"), params)];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, result.affectedRows > 0];
                }
            });
        });
    };
    /**
     * Delete a webhook
     */
    WebhookService.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.execute('DELETE FROM webhooks WHERE id = ?', [id])];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, result.affectedRows > 0];
                }
            });
        });
    };
    /**
     * Get recent deliveries for a webhook
     */
    WebhookService.prototype.getDeliveries = function (webhookId_1) {
        return __awaiter(this, arguments, void 0, function (webhookId, limit) {
            var rows;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.execute("SELECT * FROM webhook_deliveries\n             WHERE webhook_id = ?\n             ORDER BY created_at DESC\n             LIMIT ?", [webhookId, limit])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    /**
     * Test a webhook by sending a test event
     */
    WebhookService.prototype.test = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var webhook, testPayload, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(id)];
                    case 1:
                        webhook = _a.sent();
                        if (!webhook) {
                            return [2 /*return*/, {
                                    success: false,
                                    responseTimeMs: 0,
                                    error: 'Webhook not found',
                                }];
                        }
                        testPayload = {
                            event: 'test',
                            timestamp: new Date().toISOString(),
                            data: {
                                message: 'This is a test webhook from SOLARIA DFO',
                                webhook_id: id,
                                webhook_name: webhook.name,
                            },
                            source: 'solaria-dfo',
                        };
                        return [4 /*yield*/, this.deliverWebhook(webhook, testPayload)];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, this.logDelivery(webhook, testPayload, result, 0)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.updateWebhookStats(id, result)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return WebhookService;
}());
exports.WebhookService = WebhookService;
exports.default = WebhookService;
//# sourceMappingURL=webhookService.js.map