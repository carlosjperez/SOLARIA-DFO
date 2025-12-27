import { test, expect } from '@playwright/test';
test.describe('Dashboard', () => {
    // Login before each test
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Usuario').fill('carlosjperez');
        await page.getByLabel('Contraseña').fill('bypass');
        await page.getByRole('button', { name: 'Ingresar' }).click();
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    });
    test('should display dashboard stats', async ({ page }) => {
        await expect(page.getByText('Proyectos Activos')).toBeVisible();
        await expect(page.getByText('Tareas Hoy')).toBeVisible();
        await expect(page.getByText('Agentes Activos')).toBeVisible();
    });
    test('should navigate to projects page', async ({ page }) => {
        await page.getByRole('link', { name: 'Proyectos' }).click();
        await expect(page).toHaveURL(/.*projects/);
        await expect(page.getByText('Proyectos')).toBeVisible();
    });
    test('should navigate to tasks page', async ({ page }) => {
        await page.getByRole('link', { name: 'Tareas' }).click();
        await expect(page).toHaveURL(/.*tasks/);
        await expect(page.getByText('Tareas')).toBeVisible();
    });
    test('should navigate to agents page', async ({ page }) => {
        await page.getByRole('link', { name: 'Agentes' }).click();
        await expect(page).toHaveURL(/.*agents/);
        await expect(page.getByText('Agentes IA')).toBeVisible();
    });
    test('should navigate to memories page', async ({ page }) => {
        await page.getByRole('link', { name: 'Memorias' }).click();
        await expect(page).toHaveURL(/.*memories/);
        await expect(page.getByText('Memorias')).toBeVisible();
    });
    test('should logout successfully', async ({ page }) => {
        await page.getByRole('button', { name: /logout|salir/i }).click();
        await expect(page).toHaveURL(/.*login/);
    });
});
//# sourceMappingURL=dashboard.spec.js.map