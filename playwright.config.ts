import { defineConfig } from '@playwright/test';

const baseURL = process.env.DFO_BASE_URL || 'http://localhost:3030';

export default defineConfig({
  timeout: 60_000,
  testDir: './tests',
  testMatch: '**/*.spec.{ts,js}', // Only run .spec.ts and .spec.js files (not .test.js which use Jest)
  use: {
    baseURL,
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  reporter: [['list']],
});
