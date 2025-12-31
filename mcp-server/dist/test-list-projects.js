const BASE_URL = 'http://localhost:3032/mcp';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY2FybG9zanBlcmV6Iiwicm9sZSI6ImNlbyIsImlhdCI6MTc2NzEyMTYyNywiZXhwIjoxNzY3MjA4MDI3fQ.or7B1jgfV2nX9dlwms75EpVxAQ1ilZ6zxp839goCpl0';
async function listProjects() {
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
                name: 'list_projects',
                arguments: {}
            }
        })
    });
    const data = await response.json();
    const text = data.result.content[0].text;
    const projects = JSON.parse(text);
    console.log('Available Projects:');
    console.log('==================');
    if (projects.data && projects.data.length > 0) {
        projects.data.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}, Status: ${p.status}`);
        });
    }
    else {
        console.log('No projects found');
    }
}
listProjects();
export {};
//# sourceMappingURL=test-list-projects.js.map