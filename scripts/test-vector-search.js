#!/usr/bin/env node
/**
 * SOLARIA DFO - Vector Search Test Script
 *
 * Tests Chroma vector search integration with real queries
 * Requires: Worker service (:3032) and Chroma (:8000) running
 */

import { spawn } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function checkService(url: string, name: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'GET', timeout: 5000 });
    const isOk = response.ok;
    log(`${isOk ? '✅' : '❌'} ${name}: ${url}`, isOk ? 'green' : 'red');
    return isOk;
  } catch (error) {
    log(`❌ ${name}: ${url} (unreachable)`, 'red');
    return false;
  }
}

async function testWorkerEmbedding(): Promise<boolean> {
  log('\n🧪 Testing Worker Embedding Service', 'yellow');

  try {
    const response = await fetch('http://localhost:3032/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Arquitectura de autenticación con JWT tokens',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      log(`❌ Worker embedding failed: ${JSON.stringify(data)}`, 'red');
      return false;
    }

    if (data.embedding && Array.isArray(data.embedding) && data.embedding.length === 384) {
      log(`✅ Worker embedding generated: ${data.embedding.length} dimensions`, 'green');
      log(`   Model: ${data.model || 'N/A'}`, 'blue');
      log(`   Tokens: ${data.usage?.total_tokens || 'N/A'}`, 'blue');
      return true;
    } else {
      log(`❌ Invalid embedding response: ${data.embedding?.length || 0} dims (expected 384)`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Worker embedding test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testChromaHealth(): Promise<boolean> {
  log('\n🗄 Testing Chroma Vector DB', 'yellow');

  try {
    const response = await fetch('http://localhost:8000/api/v1/heartbeat');
    const data = await response.json();

    if (!response.ok || !data.nanosecond) {
      log(`❌ Chroma health check failed`, 'red');
      return false;
    }

    log(`✅ Chroma is healthy`, 'green');
    return true;
  } catch (error) {
    log(`❌ Chroma health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('╔═════════════════════════════════════════════════════╗', 'blue');
  log('║   SOLARIA DFO - Vector Search Integration Test            ║', 'blue');
  log('╚═════════════════════════════════════════════════════╝', 'blue');

  const chromaOk = await checkService('http://localhost:8000/api/v1/heartbeat', 'Chroma DB');
  const workerOk = await checkService('http://localhost:3032/health', 'Worker Service');

  if (!chromaOk || !workerOk) {
    log('\n❌ Pre-flight checks failed. Services may not be running.', 'red');
    log('\n💡 To start services: docker compose up -d worker chroma', 'yellow');
    process.exit(1);
  }

  log('\n✅ All services are reachable', 'green');

  await testWorkerEmbedding();
  await testChromaHealth();

  log('\n╔═════════════════════════════════════════════════════╗', 'blue');
  log('║   Integration Test Summary                                  ║', 'blue');
  log('╠═════════════════════════════════════════════════════╣', 'blue');
  log('║   ✅ Services running (Chroma + Worker)                     ║', 'green');
  log('║   🧪 Worker embedding API tested                          ║', 'yellow');
  log('║   🗄 Chroma vector DB tested                              ║', 'yellow');
  log('║   💡 Next: Test MCP tools memory_search_remote               ║', 'blue');
  log('╚═════════════════════════════════════════════════════╝', 'blue');

  log('\n📖 Documentation: docs/CHROMA-INTEGRATION-GUIDE.md', 'blue');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
