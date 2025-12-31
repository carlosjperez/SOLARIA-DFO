// Test MCP Agent Execution Tools
const BASE_URL = 'https://dfo.solaria.agency/mcp';
async function listTools() {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer default'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list'
        })
    });
    const data = await response.json();
    console.log('=== Available Agent-Related Tools ===');
    const agentTools = data.result.tools.filter(t => t.name.includes('agent') || t.name.includes('job'));
    agentTools.forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description.substring(0, 80)}...`);
    });
    console.log(`\nTotal agent/job tools: ${agentTools.length}`);
    return agentTools;
}
async function testTool(toolName, args = {}) {
    console.log(`\n=== Testing: ${toolName} ===`);
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer default'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: args
            }
        })
    });
    const data = await response.json();
    if (data.error) {
        console.log(`❌ Error: ${data.error.message}`);
    }
    else {
        console.log(`✅ Success`);
        console.log(data.result.content[0].text.substring(0, 500));
    }
}
async function main() {
    try {
        await listTools();
        // Try the agent execution tools
        await testTool('queue_agent_job', {
            taskId: 1,
            agentId: 11,
            metadata: { priority: 'high' }
        });
        await testTool('list_active_agent_jobs');
    }
    catch (error) {
        console.error('Test failed:', error.message);
    }
}
main();
export {};
//# sourceMappingURL=test-tools.js.map