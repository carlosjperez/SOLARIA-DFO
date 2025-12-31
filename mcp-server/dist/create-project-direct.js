const DASHBOARD_URL = 'https://dfo.solaria.agency/api';
const PROD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY2FybG9zanBlcmV6Iiwicm9sZSI6ImNlbyIsImlhdCI6MTc2NzEyMTc0NSwiZXhwIjoxNzY3MjA4MTQ1fQ.ExyqMat50jY0X9a3Hmk3Ql3Fkedfi82pX7eCR9_9qLU';
async function createProject() {
    const response = await fetch(`${DASHBOARD_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PROD_TOKEN}`
        },
        body: JSON.stringify({
            name: 'SOLARIA DFO Test',
            description: 'Test project for agent execution MCP tools',
            client: 'Internal',
            budget: 10000,
            status: 'development'
        })
    });
    const result = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(result, null, 2));
    if (result.success && result.data) {
        console.log(`\n✅ Project created successfully`);
        console.log(`Project ID: ${result.data.id}`);
        console.log(`Project Name: ${result.data.name}`);
        return result.data;
    }
    else {
        console.log('❌ Failed to create project');
        return null;
    }
}
createProject();
export {};
//# sourceMappingURL=create-project-direct.js.map