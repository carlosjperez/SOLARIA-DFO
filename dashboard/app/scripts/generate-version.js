#!/usr/bin/env node

/**
 * Auto-generate version.ts with current git commit info
 *
 * @author ECO-Lambda | DFO Version Management
 * @date 2025-12-29
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    // Get git info
    const commit = execSync('git rev-parse --short HEAD').toString().trim();
    const branch = execSync('git branch --show-current').toString().trim();
    const buildDate = new Date().toISOString();

    // Read package.json for version
    const packageJson = JSON.parse(
        execSync('cat package.json').toString()
    );
    const version = packageJson.version;

    // Generate version object
    const versionContent = `// Auto-generated file - DO NOT EDIT
// Generated at: ${buildDate}

export const VERSION = {
    version: '${version}',
    commit: '${commit}',
    branch: '${branch}',
    buildDate: '${buildDate}',
    full: 'v${version}-${commit}',
} as const;

export default VERSION;
`;

    // Write to src/version.ts
    const versionPath = join(__dirname, '..', 'src', 'version.ts');
    writeFileSync(versionPath, versionContent, 'utf-8');

    console.log(`✓ Generated version.ts: v${version}-${commit} (${branch})`);
} catch (error) {
    console.error('✗ Failed to generate version.ts:', error.message);
    process.exit(1);
}
