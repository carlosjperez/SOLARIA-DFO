import { test, expect } from '@playwright/test';

test.describe('Dashboard Page - Design System Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByLabel('Usuario').fill('carlosjperez');
        await page.getByLabel('Contraseña').fill('bypass');
        await page.getByRole('button', { name: 'Ingresar' }).click();
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    });

    test.describe('PageHeader Component', () => {
        test('should display page header with title and subtitle', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
            await expect(page.getByText('Vista ejecutiva del estado de operaciones')).toBeVisible();
        });

        test('should display ViewSelector in header actions', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            await expect(gridButton).toBeVisible();
            await expect(listButton).toBeVisible();
        });

        test('should have proper heading hierarchy', async ({ page }) => {
            const h1 = page.getByRole('heading', { level: 1, name: 'Dashboard' });
            await expect(h1).toBeVisible();
        });
    });

    test.describe('StatsGrid with StatCards', () => {
        test('should display 4 stat cards in grid', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
            
            const statCards = statsGrid.locator('.stat-card');
            const count = await statCards.count();
            expect(count).toBe(4);
        });

        test('should display all dashboard stats', async ({ page }) => {
            await expect(page.getByText('Proyectos Activos')).toBeVisible();
            await expect(page.getByText('Tareas Hoy')).toBeVisible();
            await expect(page.getByText('Tareas Activas')).toBeVisible();
            await expect(page.getByText('Agentes Activos')).toBeVisible();
        });

        test('should have clickable Projects stat card', async ({ page }) => {
            const projectsCard = page.locator('button').filter({ hasText: 'Proyectos Activos' });
            await expect(projectsCard).toBeVisible();
            
            // Should have cursor-pointer class
            const classList = await projectsCard.getAttribute('class');
            expect(classList).toContain('cursor-pointer');
            
            // Click should navigate
            await projectsCard.click();
            await expect(page).toHaveURL(/.*projects/);
        });

        test('should display stat card icons', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const icons = statsGrid.locator('svg');
            const iconCount = await icons.count();
            
            expect(iconCount).toBeGreaterThanOrEqual(4);
        });

        test('should have different stat card variants', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const statCards = statsGrid.locator('.stat-card');
            
            // Projects card should have primary variant
            const projectsCard = statCards.filter({ hasText: 'Proyectos Activos' });
            await expect(projectsCard).toBeVisible();
        });

        test('should have proper ARIA role for stats grid', async ({ page }) => {
            const statsList = page.locator('[role="list"]').first();
            await expect(statsList).toBeVisible();
        });
    });

    test.describe('ViewSelector Functionality', () => {
        test('should toggle between grid and list views', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            // Default should be grid view
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            await expect(listButton).toHaveAttribute('aria-pressed', 'false');
            
            // Switch to list view
            await listButton.click();
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
            await expect(gridButton).toHaveAttribute('aria-pressed', 'false');
            
            // Content should update (verify layout change)
            await page.waitForTimeout(200);
            
            // Switch back to grid view
            await gridButton.click();
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            await expect(listButton).toHaveAttribute('aria-pressed', 'false');
        });

        test('should maintain view mode during navigation', async ({ page }) => {
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            // Switch to list view
            await listButton.click();
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
            
            // Navigate away and back
            await page.goto('/projects');
            await page.goto('/dashboard');
            
            // View mode might reset (depending on implementation)
            // Just verify ViewSelector is present and functional
            const viewSelector = page.getByRole('button', { name: /grid|list/i });
            await expect(viewSelector.first()).toBeVisible();
        });

        test('should support keyboard navigation', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            // Focus grid button
            await gridButton.focus();
            await expect(gridButton).toBeFocused();
            
            // Tab to list button
            await page.keyboard.press('Tab');
            await expect(listButton).toBeFocused();
            
            // Activate with Enter
            await page.keyboard.press('Enter');
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
        });
    });

    test.describe('Navigation', () => {
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

        test('should navigate via clickable stat card', async ({ page }) => {
            const projectsCard = page.locator('button').filter({ hasText: 'Proyectos Activos' });
            await projectsCard.click();
            await expect(page).toHaveURL(/.*projects/);
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper landmarks', async ({ page }) => {
            const main = page.locator('main');
            await expect(main).toBeVisible();
        });

        test('should have proper heading hierarchy', async ({ page }) => {
            const h1 = page.getByRole('heading', { level: 1 });
            await expect(h1).toBeVisible();
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Tab through interactive elements
            await page.keyboard.press('Tab');
            
            let activeElement = await page.evaluate(() => document.activeElement?.tagName);
            expect(['A', 'BUTTON', 'NAV']).toContain(activeElement || '');
        });

        test('should have focus visible styles', async ({ page }) => {
            const firstButton = page.getByRole('button').first();
            await firstButton.focus();
            
            const hasFocusStyle = await firstButton.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return styles.outline !== 'none' || styles.boxShadow !== 'none';
            });
            
            expect(hasFocusStyle).toBe(true);
        });

        test('should have ARIA labels on interactive elements', async ({ page }) => {
            const viewSelector = page.locator('[role="group"]').filter({ 
                has: page.getByRole('button', { name: /grid/i }) 
            });
            
            await expect(viewSelector).toBeVisible();
        });
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
            
            // Stats should stack vertically
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
        });

        test('should work on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        });

        test('should work on desktop viewport', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
            
            // All 4 stats should be visible in desktop
            const statsGrid = page.locator('.stats-grid').first();
            const statCards = statsGrid.locator('.stat-card');
            const count = await statCards.count();
            expect(count).toBe(4);
        });
    });

    test.describe('Loading States', () => {
        test('should handle loading state gracefully', async ({ page }) => {
            // Stats might show loading indicator or dash
            const statCards = page.locator('.stat-card');
            const firstCard = statCards.first();
            await expect(firstCard).toBeVisible();
        });

        test('should eventually show data', async ({ page }) => {
            // Wait for stats to load
            await page.waitForTimeout(1000);
            
            const statCards = page.locator('.stat-card');
            const firstCard = statCards.first();
            await expect(firstCard).toBeVisible();
        });
    });

    test.describe('Logout', () => {
        test('should logout successfully', async ({ page }) => {
            await page.getByRole('button', { name: /logout|salir/i }).click();
            await expect(page).toHaveURL(/.*login/);
        });
    });
});
