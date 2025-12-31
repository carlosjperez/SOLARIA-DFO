const DASHBOARD_URL = 'https://dfo.solaria.agency/api';
const PROD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY2FybG9zanBlcmV6Iiwicm9sZSI6ImNlbyIsImlhdCI6MTc2NzEyMTc0NSwiZXhwIjoxNzY3MjA4MTQ1fQ.ExyqMat50jY0X9a3Hmk3Ql3Fkedfi82pX7eCR9_9qLU';
async function verifyProject() {
    // List all projects
    const listResponse = await fetch(`${DASHBOARD_URL}/projects`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PROD_TOKEN}`
        }
    });
    const projects = await listResponse.json();
    console.log('All Projects:');
    console.log(JSON.stringify(projects, null, 2));
    console.log('\n---\n');
    // Get specific project
    const getResponse = await fetch(`${DASHBOARD_URL}/projects/99`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PROD_TOKEN}`
        }
    });
    const project = await getResponse.json();
    console.log('Project 99:');
    console.log(JSON.stringify(project, null, 2));
}
verifyProject();
export {};
//# sourceMappingURL=verify-project.js.map