/**
 * SOLARIA DFO - Workers Launcher
 * Starts multiple background workers in parallel:
 * - Embedding Generation Worker (index.js)
 * - Agent Execution Worker (agentWorker.js)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workers = [
    {
        name: 'Embedding Worker',
        script: join(__dirname, 'index.js'),
        color: '\x1b[36m', // Cyan
    },
    {
        name: 'Agent Execution Worker',
        script: join(__dirname, 'agentWorker.js'),
        color: '\x1b[35m', // Magenta
    },
];

const RESET_COLOR = '\x1b[0m';
const processes = [];

function startWorker(worker) {
    console.log(`${worker.color}[${worker.name}]${RESET_COLOR} Starting...`);

    const proc = spawn('node', [worker.script], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: process.env,
    });

    // Prefix stdout with worker name and color
    proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter((line) => line.trim());
        lines.forEach((line) => {
            console.log(`${worker.color}[${worker.name}]${RESET_COLOR} ${line}`);
        });
    });

    // Prefix stderr with worker name and color
    proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter((line) => line.trim());
        lines.forEach((line) => {
            console.error(`${worker.color}[${worker.name}]${RESET_COLOR} ${line}`);
        });
    });

    proc.on('error', (error) => {
        console.error(`${worker.color}[${worker.name}]${RESET_COLOR} Process error:`, error.message);
    });

    proc.on('exit', (code, signal) => {
        console.log(`${worker.color}[${worker.name}]${RESET_COLOR} Exited with code ${code} (signal: ${signal})`);

        // Remove from processes array
        const index = processes.indexOf(proc);
        if (index > -1) {
            processes.splice(index, 1);
        }

        // If any worker exits unexpectedly, shut down all workers
        if (code !== 0 && code !== null) {
            console.error(`${worker.color}[${worker.name}]${RESET_COLOR} Unexpected exit, shutting down all workers...`);
            shutdown();
        }
    });

    return proc;
}

function shutdown() {
    console.log('\n[Workers Launcher] Shutting down all workers...');

    processes.forEach((proc, index) => {
        console.log(`[Workers Launcher] Stopping worker ${index + 1}/${processes.length}...`);
        proc.kill('SIGTERM');
    });

    // Force exit after 10 seconds
    setTimeout(() => {
        console.log('[Workers Launcher] Force exit after 10s timeout');
        process.exit(1);
    }, 10000);
}

// ============================================================================
// Main
// ============================================================================

console.log('='.repeat(60));
console.log('SOLARIA DFO - Background Workers');
console.log('='.repeat(60));
console.log(`Starting ${workers.length} workers...`);
console.log('');

// Start all workers
workers.forEach((worker) => {
    const proc = startWorker(worker);
    processes.push(proc);
});

console.log('');
console.log('='.repeat(60));
console.log(`✓ All ${workers.length} workers started`);
console.log('='.repeat(60));
console.log('');

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n[Workers Launcher] Received SIGTERM');
    shutdown();
});

process.on('SIGINT', () => {
    console.log('\n[Workers Launcher] Received SIGINT');
    shutdown();
});

// Keep process alive
process.on('exit', (code) => {
    console.log(`[Workers Launcher] Process exiting with code ${code}`);
});
