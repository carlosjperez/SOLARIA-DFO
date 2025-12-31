const BASE_URL = 'http://localhost:3032/mcp';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY2FybG9zanBlcmV6Iiwicm9sZSI6ImNlbyIsImlhdCI6MTc2NzEyMTYyNywiZXhwIjoxNzY3MjA4MDI3fQ.or7B1jgfV2nX9dlwms75EpVxAQ1ilZ6zxp839goCpl0';

async function createProject() {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'create_project',
                arguments: {
                    name: 'SOLARIA DFO',
                    description: 'Test project for agent execution MCP tools',
                    client: 'Internal',
                    budget: 10000
                }
            }
        })
    });

    const data = await response.json();
    const text = data.result.content[0].text;
    const result = JSON.parse(text);
    
    console.log('Project Created:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
        return result.data.id;
    }
    return null;
}

createProject().then(projectId => {
    if (projectId) {
        console.log(`\nProject ID: ${projectId}`);
        console.log('Use this ID in set_project_context');
    }
});
