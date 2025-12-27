"use strict";
/**
 * SOLARIA DFO - Businesses Schema (Drizzle ORM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.businesses = exports.businessStatusEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// Business status enum
exports.businessStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'inactive',
    'planning',
    'active',
    'paused',
]);
// Businesses table
exports.businesses = (0, mysql_core_1.mysqlTable)('businesses', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 200 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    website: (0, mysql_core_1.varchar)('website', { length: 255 }),
    status: exports.businessStatusEnum.default('inactive'),
    revenue: (0, mysql_core_1.decimal)('revenue', { precision: 15, scale: 2 }).default('0'),
    expenses: (0, mysql_core_1.decimal)('expenses', { precision: 15, scale: 2 }).default('0'),
    profit: (0, mysql_core_1.decimal)('profit', { precision: 15, scale: 2 }).default('0'),
    logoUrl: (0, mysql_core_1.varchar)('logo_url', { length: 500 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
//# sourceMappingURL=businesses.js.map