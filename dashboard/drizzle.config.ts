import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
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
