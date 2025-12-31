const BASE_URL = 'http://localhost:3032/mcp';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY2FybG9zanBlcmV6Iiwicm9sZSI6ImNlbyIsImlhdCI6MTc2NzEyMTYyNywiZXhwIjoxNzY3MjA4MDI3fQ.or7B1jgfV2nX9dlwms75EpVxAQ1ilZ6zxp839goCpl0';

async function testSetContext() {
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
                name: 'set_project_context',
                arguments: { project_id: 99 }
            }
        })
    });

    const data = await response.json();
    console.log('Full Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.result && data.result.content) {
        const text = data.result.content[0].text;
        console.log('\nParsed Result:');
        try {
            const parsed = JSON.parse(text);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Not JSON:', text);
        }
    }
}

testSetContext();
