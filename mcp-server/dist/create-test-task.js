const DASHBOARD_URL = 'https://dfo.solaria.agency/api';
const PROD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY2FybG9zanBlcmV6Iiwicm9sZSI6ImNlbyIsImlhdCI6MTc2NzEyMTc0NSwiZXhwIjoxNzY3MjA4MTQ1fQ.ExyqMat50jY0X9a3Hmk3Ql3Fkedfi82pX7eCR9_9qLU';
async function createTask() {
    const response = await fetch(`${DASHBOARD_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PROD_TOKEN}`
        },
        body: JSON.stringify({
            project_id: 99,
            title: 'Test task for agent execution',
            description: 'This is a test task for MCP agent execution tools',
            status: 'pending',
            priority: 'high',
            assigned_agent_id: 11
        })
    });
    const result = await response.json();
    console.log('Task Created:');
    console.log(JSON.stringify(result, null, 2));
    if (result.data && result.data.id) {
        console.log(`\n✅ Task ID: ${result.data.id}`);
        return result.data.id;
    }
    return null;
}
createTask();
export {};
//# sourceMappingURL=create-test-task.js.map