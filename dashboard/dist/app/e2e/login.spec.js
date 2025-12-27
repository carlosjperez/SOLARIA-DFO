import { test, expect } from '@playwright/test';
test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByText('SOLARIA DFO')).toBeVisible();
        await expect(page.getByLabel('Usuario')).toBeVisible();
        await expect(page.getByLabel('Contraseña')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
    });
    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Usuario').fill('invalid');
        await page.getByLabel('Contraseña').fill('invalid');
        await page.getByRole('button', { name: 'Ingresar' }).click();
        // Should show error message
        await expect(page.getByText(/Error/i)).toBeVisible({ timeout: 5000 });
    });
    test('should redirect to dashboard on successful login', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Usuario').fill('carlosjperez');
        await page.getByLabel('Contraseña').fill('bypass');
        await page.getByRole('button', { name: 'Ingresar' }).click();
        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
        await expect(page.getByText('Dashboard')).toBeVisible();
    });
    test('should redirect unauthenticated users to login', async ({ page }) => {
        await page.goto('/dashboard');
        // Should be redirected to login
        await expect(page).toHaveURL(/.*login/);
    });
});
//# sourceMappingURL=login.spec.js.map