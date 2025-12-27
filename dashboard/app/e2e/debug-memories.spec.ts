import { test } from '@playwright/test';

test('Debug Memories Page', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Query state') || text.includes('error') || text.includes('Error')) {
            consoleLogs.push('[' + msg.type() + '] ' + text);
        }
    });

    const apiResponses: { url: string; status: number; body: string }[] = [];
    page.on('response', async response => {
        if (response.url().includes('/api/memories')) {
            try {
                const body = await response.text();
                apiResponses.push({
                    url: response.url(),
                    status: response.status(),
                    body: body.substring(0, 2000)
                });
            } catch (e) {
                apiResponses.push({
                    url: response.url(),
                    status: response.status(),
                    body: 'Could not read body'
                });
            }
        }
    });

    // Step 1: Login first
    await page.goto('https://dfo.solaria.agency/login');
    await page.waitForTimeout(1000);

    // Use environment variables for credentials (set E2E_USERNAME and E2E_PASSWORD)
    const username = process.env.E2E_USERNAME || 'test_user';
    const password = process.env.E2E_PASSWORD || 'test_pass';
    await page.fill('input[type="text"], input[name="username"], input[placeholder*="usuario"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"], button:has-text("Ingresar")');

    // Wait for redirect after login
    await page.waitForTimeout(3000);
    console.log('=== After login, URL:', page.url());

    // Step 2: Navigate to memories
    await page.goto('https://dfo.solaria.agency/memories');
    console.log('=== Navigated to memories');

    // Wait for page to load
    await page.waitForTimeout(6000);

    // Check for loading spinner
    const loader = await page.locator('.animate-spin').count();
    console.log('=== LOADER VISIBLE:', loader > 0);

    // Check what's on screen
    const bodyText = await page.locator('body').innerText();
    console.log('=== PAGE TEXT (first 500 chars):', bodyText.substring(0, 500));

    // Print API responses
    console.log('\n=== API RESPONSES ===');
    apiResponses.forEach(r => {
        console.log('URL:', r.url);
        console.log('Status:', r.status);
        console.log('Body:', r.body);
        console.log('---');
    });

    // Print console logs
    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(l => console.log(l));

    await page.screenshot({ path: '.playwright-mcp/memories-debug-auth.png', fullPage: true });
    console.log('\n=== Screenshot saved ===');
});
