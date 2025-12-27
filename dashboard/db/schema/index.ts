/**
 * SOLARIA DFO - Drizzle Schema Index
 * Exports all table schemas and types
 */

// Users
export * from './users.js';

// Projects (includes clients, documents, requests, metrics)
export * from './projects.js';

// AI Agents (includes states, metrics)
export * from './agents.js';

// Tasks (includes items, tags, tag assignments)
export * from './tasks.js';

// Alerts & Activity Logs
export * from './alerts.js';

// Memories (includes tags, crossrefs, events)
export * from './memories.js';

// Businesses
export * from './businesses.js';

// Office CRM (clients, contacts, payments)
export * from './office-clients.js';

// Permissions (RBAC)
export * from './permissions.js';
