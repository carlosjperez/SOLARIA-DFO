// Test local MCP server tools
const BASE_URL = 'http://localhost:3032/mcp';
async function listTools() {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list'
        })
    });
    const data = await response.json();
    console.log('=== Available Agent Execution Tools ===\n');
    const agentExecTools = data.result.tools.filter(t => t.name.includes('queue_agent') ||
        t.name.includes('job') ||
        t.name.includes('cancel_agent') ||
        t.name.includes('list_active'));
    if (agentExecTools.length > 0) {
        console.log('✅ FOUND Agent Execution Tools:\n');
        agentExecTools.forEach(tool => {
            console.log(`  - ${tool.name}`);
            console.log(`    ${tool.description.substring(0, 100)}...`);
            console.log('');
        });
    }
    else {
        console.log('❌ No agent execution tools found');
        console.log(`\nTotal tools available: ${data.result.tools.length}`);
        console.log('First 10 tool names:');
        data.result.tools.slice(0, 10).forEach(t => console.log(`  - ${t.name}`));
    }
}
listTools().catch(console.error);
export {};
//# sourceMappingURL=test-local.js.map