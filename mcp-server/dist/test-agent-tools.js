// Comprehensive test of Agent Execution MCP Tools
const BASE_URL = 'http://localhost:3032/mcp';
// Use a test token generated with the local server's JWT_SECRET
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY2FybG9zanBlcmV6Iiwicm9sZSI6ImNlbyIsImlhdCI6MTc2NzEyMTYyNywiZXhwIjoxNzY3MjA4MDI3fQ.or7B1jgfV2nX9dlwms75EpVxAQ1ilZ6zxp839goCpl0';
// Store session ID for maintaining context
let sessionId = null;
async function callTool(toolName, args = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
    };
    // Include session ID if available (for project isolation)
    if (sessionId) {
        headers['Mcp-Session-Id'] = sessionId;
    }
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Math.floor(Math.random() * 1000),
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: args
            }
        })
    });
    return response.json();
}
async function main() {
    console.log('='.repeat(80));
    console.log('DFO-189: MCP Agent Execution Tools - Comprehensive Test');
    console.log('='.repeat(80));
    console.log('');
    let testsPassed = 0;
    let testsFailed = 0;
    let jobId = null;
    // First, set project context (required for project isolation)
    console.log('Setup: Setting project context');
    console.log('-'.repeat(80));
    try {
        const result = await callTool('set_project_context', {
            project_id: 99
        });
        if (result.error) {
            console.log('❌ FAIL: Could not set project context:', result.error.message);
            process.exit(1);
        }
        else {
            console.log('✅ Project context set successfully');
            const response = JSON.parse(result.result.content[0].text);
            // Store session ID for subsequent requests
            sessionId = response.session_id;
            console.log('  Project ID:', response.project_id);
            console.log('  Project Name:', response.project_name);
            console.log('  Session ID:', sessionId);
        }
    }
    catch (error) {
        console.log('❌ FAIL: Could not set project context:', error.message);
        process.exit(1);
    }
    console.log('');
    // Test 1: list_active_agent_jobs
    console.log('Test 1: list_active_agent_jobs');
    console.log('-'.repeat(80));
    try {
        const result = await callTool('list_active_agent_jobs');
        if (result.error) {
            console.log('❌ FAIL:', result.error.message);
            testsFailed++;
        }
        else {
            console.log('✅ PASS: Tool executed successfully');
            const text = result.result.content[0].text;
            console.log(text.substring(0, 300) + '...');
            testsPassed++;
        }
    }
    catch (error) {
        console.log('❌ FAIL:', error.message);
        testsFailed++;
    }
    console.log('');
    // Test 2: queue_agent_job with valid data
    console.log('Test 2: queue_agent_job (valid task)');
    console.log('-'.repeat(80));
    try {
        const result = await callTool('queue_agent_job', {
            task_id: 538,
            agent_id: 11,
            metadata: {
                priority: 'high',
                estimatedHours: 2
            },
            context: {
                dependencies: [],
                relatedTasks: []
            }
        });
        if (result.error) {
            console.log('❌ FAIL:', result.error.message);
            testsFailed++;
        }
        else {
            const text = result.result.content[0].text;
            try {
                const response = JSON.parse(text);
                if (response.success && response.data && response.data.jobId) {
                    console.log('✅ PASS: Job queued successfully');
                    jobId = response.data.jobId;
                    console.log('  Job ID:', jobId);
                    console.log('  Status:', response.data.status);
                    console.log('  Task:', response.data.taskCode);
                    testsPassed++;
                }
                else {
                    console.log('❌ FAIL: Job queue failed -', response.error?.message || 'Unknown error');
                    testsFailed++;
                }
            }
            catch (parseError) {
                if (text.startsWith('Error:')) {
                    console.log('❌ FAIL:', text.substring(0, 200));
                    testsFailed++;
                }
                else {
                    throw parseError;
                }
            }
        }
    }
    catch (error) {
        console.log('❌ FAIL:', error.message);
        testsFailed++;
    }
    console.log('');
    // Test 3: get_agent_job_status
    if (jobId) {
        console.log('Test 3: get_agent_job_status');
        console.log('-'.repeat(80));
        try {
            const result = await callTool('get_agent_job_status', { job_id: jobId });
            if (result.error) {
                console.log('❌ FAIL:', result.error.message);
                testsFailed++;
            }
            else {
                const text = result.result.content[0].text;
                try {
                    const response = JSON.parse(text);
                    if (response.success) {
                        console.log('✅ PASS: Job status retrieved successfully');
                        console.log('  Status:', response.data.status);
                        console.log('  Progress:', response.data.progress + '%');
                        testsPassed++;
                    }
                    else {
                        console.log('❌ FAIL:', response.error?.message || 'Unknown error');
                        testsFailed++;
                    }
                }
                catch (parseError) {
                    if (text.startsWith('Error:')) {
                        console.log('❌ FAIL:', text.substring(0, 200));
                        testsFailed++;
                    }
                    else {
                        throw parseError;
                    }
                }
            }
        }
        catch (error) {
            console.log('❌ FAIL:', error.message);
            testsFailed++;
        }
        console.log('');
    }
    // Test 4: cancel_agent_job
    if (jobId) {
        console.log('Test 4: cancel_agent_job');
        console.log('-'.repeat(80));
        try {
            const result = await callTool('cancel_agent_job', { job_id: jobId });
            if (result.error) {
                console.log('❌ FAIL:', result.error.message);
                testsFailed++;
            }
            else {
                const text = result.result.content[0].text;
                try {
                    const response = JSON.parse(text);
                    if (response.success) {
                        console.log('✅ PASS: Job cancelled successfully');
                        console.log('  Job ID:', response.data.jobId);
                        console.log('  Status:', response.data.status);
                        testsPassed++;
                    }
                    else {
                        console.log('❌ FAIL:', response.error?.message || 'Unknown error');
                        testsFailed++;
                    }
                }
                catch (parseError) {
                    if (text.startsWith('Error:')) {
                        console.log('❌ FAIL:', text.substring(0, 200));
                        testsFailed++;
                    }
                    else {
                        throw parseError;
                    }
                }
            }
        }
        catch (error) {
            console.log('❌ FAIL:', error.message);
            testsFailed++;
        }
        console.log('');
    }
    // Test 5: Error handling - invalid task ID
    console.log('Test 5: Error handling (invalid task ID)');
    console.log('-'.repeat(80));
    try {
        const result = await callTool('queue_agent_job', {
            task_id: 999999,
            agent_id: 11
        });
        const text = result.result.content[0].text;
        try {
            const response = JSON.parse(text);
            if (!response.success && response.error) {
                console.log('✅ PASS: Correctly rejected invalid task ID');
                console.log('  Error:', response.error.code);
                testsPassed++;
            }
            else {
                console.log('❌ FAIL: Should have rejected invalid task ID');
                testsFailed++;
            }
        }
        catch (parseError) {
            if (text.startsWith('Error:')) {
                console.log('✅ PASS: Correctly rejected invalid task ID');
                console.log('  Error message:', text.substring(0, 100));
                testsPassed++;
            }
            else {
                throw parseError;
            }
        }
    }
    catch (error) {
        console.log('❌ FAIL:', error.message);
        testsFailed++;
    }
    console.log('');
    // Test 6: Error handling - invalid job ID
    console.log('Test 6: Error handling (non-existent job ID)');
    console.log('-'.repeat(80));
    try {
        const result = await callTool('get_agent_job_status', {
            job_id: 'non-existent-job-id'
        });
        const text = result.result.content[0].text;
        try {
            const response = JSON.parse(text);
            if (!response.success && response.error) {
                console.log('✅ PASS: Correctly rejected non-existent job ID');
                console.log('  Error:', response.error.code);
                testsPassed++;
            }
            else {
                console.log('❌ FAIL: Should have rejected non-existent job ID');
                testsFailed++;
            }
        }
        catch (parseError) {
            if (text.startsWith('Error:')) {
                console.log('✅ PASS: Correctly rejected non-existent job ID');
                console.log('  Error message:', text.substring(0, 100));
                testsPassed++;
            }
            else {
                throw parseError;
            }
        }
    }
    catch (error) {
        console.log('❌ FAIL:', error.message);
        testsFailed++;
    }
    console.log('');
    // Summary
    console.log('='.repeat(80));
    console.log('Test Summary');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`Total: ${testsPassed + testsFailed}`);
    console.log('');
    if (testsFailed === 0) {
        console.log('🎉 All tests passed! DFO-189 complete.');
        process.exit(0);
    }
    else {
        console.log('⚠️  Some tests failed.');
        process.exit(1);
    }
}
main();
export {};
//# sourceMappingURL=test-agent-tools.js.map