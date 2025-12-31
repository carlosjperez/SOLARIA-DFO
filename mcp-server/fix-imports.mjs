#!/usr/bin/env node
/**
 * Fix ESM imports to include .js extensions
 * Required for Node.js ESM with TypeScript NodeNext module resolution
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

function walkDir(dir, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

const files = walkDir('src');

console.log(`Found ${files.length} TypeScript files to process\n`);

let totalFixed = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  let modified = false;

  const newLines = lines.map(line => {
    // Match import statements with relative paths
    // Patterns:
    // import ... from '../path'
    // import ... from './path'
    const importMatch = line.match(/^(import\s+.*\s+from\s+['"])(\.\.[\/\\][^'"]+|\.\/[^'"]+)(['"])/);

    if (importMatch) {
      const [, prefix, importPath, suffix] = importMatch;

      // Skip if already has .js extension
      if (importPath.endsWith('.js')) {
        return line;
      }

      // Skip if it's a directory import (ends with /)
      if (importPath.endsWith('/')) {
        return line;
      }

      // Add .js extension
      const newLine = `${prefix}${importPath}.js${suffix}`;
      if (newLine !== line) {
        console.log(`  ${basename(file)}: ${importPath} → ${importPath}.js`);
        modified = true;
        totalFixed++;
      }
      return newLine;
    }

    return line;
  });

  if (modified) {
    writeFileSync(file, newLines.join('\n'), 'utf-8');
  }
}

console.log(`\n✓ Fixed ${totalFixed} import statements across ${files.length} files`);
