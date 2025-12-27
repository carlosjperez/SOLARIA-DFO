"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'mysql',
    schema: './db/schema/index.ts',
    out: './db/migrations',
    dbCredentials: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'solaria_construction',
    },
    verbose: true,
    strict: true,
});
//# sourceMappingURL=drizzle.config.js.map