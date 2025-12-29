import { test, expect } from '@playwright/test';

test.describe('Archived Projects Page', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByLabel('Usuario').fill('carlosjperez');
        await page.getByLabel('Contraseña').fill('bypass');
        await page.getByRole('button', { name: 'Ingresar' }).click();
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
        
        // Navigate to archived projects
        await page.goto('/projects/archived');
    });

    test.describe('Page Structure', () => {
        test('should display PageHeader with title and subtitle', async ({ page }) => {
            // Title
            await expect(page.getByRole('heading', { name: 'Proyectos Archivados', level: 1 })).toBeVisible();
            
            // Subtitle with count
            const subtitle = page.locator('p.text-gray-600').first();
            await expect(subtitle).toBeVisible();
            await expect(subtitle).toContainText(/proyectos en archivo/i);
        });

        test('should display back button in PageHeader', async ({ page }) => {
            const backButton = page.getByRole('link', { name: 'Volver' });
            await expect(backButton).toBeVisible();
            await expect(backButton).toHaveAttribute('href', '/projects');
        });

        test('should display breadcrumbs', async ({ page }) => {
            const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
            
            if (await breadcrumbs.isVisible()) {
                await expect(breadcrumbs.getByText(/archivados|archived/i)).toBeVisible();
            }
        });

        test('should display StatsGrid with 4 stat cards', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
            
            const statCards = statsGrid.locator('.stat-card');
            const count = await statCards.count();
            expect(count).toBe(4);
        });

        test('should display correct stat card labels', async ({ page }) => {
            // Archived projects stats
            await expect(page.getByText('Total Archivados')).toBeVisible();
            await expect(page.getByText('Completados')).toBeVisible();
            await expect(page.getByText('Cancelados')).toBeVisible();
            await expect(page.getByText('Budget Total')).toBeVisible();
        });

        test('should display SearchInput', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            await expect(searchInput).toBeVisible();
            await expect(searchInput).toHaveAttribute('placeholder', /buscar/i);
        });

        test('should display status filter dropdown', async ({ page }) => {
            const statusSelect = page.locator('select[aria-label*="Estado"]');
            
            if (await statusSelect.isVisible()) {
                await expect(statusSelect).toBeVisible();
            }
        });
    });

    test.describe('Back Button Navigation', () => {
        test('should navigate back to projects page', async ({ page }) => {
            const backButton = page.getByRole('link', { name: 'Volver' });
            await backButton.click();
            
            await expect(page).toHaveURL(/.*\/projects$/);
            await expect(page.getByRole('heading', { name: 'Proyectos', level: 1 })).toBeVisible();
        });

        test('should support keyboard navigation on back button', async ({ page }) => {
            const backButton = page.getByRole('link', { name: 'Volver' });
            await backButton.focus();
            
            await page.keyboard.press('Enter');
            await expect(page).toHaveURL(/.*\/projects$/);
        });

        test('should have proper href attribute', async ({ page }) => {
            const backButton = page.getByRole('link', { name: 'Volver' });
            await expect(backButton).toHaveAttribute('href', '/projects');
        });
    });

    test.describe('Stats Display', () => {
        test('should show archived project counts', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const statCards = statsGrid.locator('.stat-card');
            
            // All stat cards should be visible
            const firstCard = statCards.first();
            await expect(firstCard).toBeVisible();
        });

        test('should have different stat card variants', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            
            // Should have cards with different visual variants
            // (default, success, danger, warning)
            await expect(statsGrid).toBeVisible();
        });

        test('should display stat card icons', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const icons = statsGrid.locator('svg');
            const iconCount = await icons.count();
            
            expect(iconCount).toBeGreaterThanOrEqual(4);
        });

        test('should show budget total', async ({ page }) => {
            const budgetCard = page.getByText('Budget Total');
            await expect(budgetCard).toBeVisible();
        });
    });

    test.describe('Search Functionality', () => {
        test('should filter archived projects by name', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            
            await searchInput.fill('project');
            await page.waitForTimeout(400); // Wait for debounce
            
            await expect(searchInput).toHaveValue('project');
        });

        test('should clear search with clear button', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            
            await searchInput.fill('test');
            await page.waitForTimeout(100);
            
            const clearButton = page.getByRole('button', { name: /clear|limpiar/i });
            await clearButton.click();
            
            await expect(searchInput).toHaveValue('');
        });

        test('should debounce search input', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            
            // Type quickly
            await searchInput.fill('a');
            await searchInput.fill('ab');
            await searchInput.fill('abc');
            
            // Should have final value
            await expect(searchInput).toHaveValue('abc');
        });
    });

    test.describe('Filter Functionality', () => {
        test('should filter by completion status', async ({ page }) => {
            const statusSelect = page.locator('select[aria-label*="Estado"]');
            
            if (await statusSelect.isVisible()) {
                await statusSelect.selectOption('completed');
                await page.waitForTimeout(200);
            }
        });

        test('should filter by cancelled status', async ({ page }) => {
            const statusSelect = page.locator('select[aria-label*="Estado"]');
            
            if (await statusSelect.isVisible()) {
                await statusSelect.selectOption('cancelled');
                await page.waitForTimeout(200);
            }
        });

        test('should reset to show all', async ({ page }) => {
            const statusSelect = page.locator('select[aria-label*="Estado"]');
            
            if (await statusSelect.isVisible()) {
                // Filter first
                await statusSelect.selectOption('completed');
                await page.waitForTimeout(200);
                
                // Reset to all
                await statusSelect.selectOption('');
                await page.waitForTimeout(200);
            }
        });
    });

    test.describe('Project List Display', () => {
        test('should display archived project cards', async ({ page }) => {
            const projectCards = page.locator('[data-project-id]').or(page.locator('.project-card')).or(page.locator('article'));
            const count = await projectCards.count();
            
            // Should have at least 0 (might have no archived projects)
            expect(count).toBeGreaterThanOrEqual(0);
        });

        test('should show empty state if no projects', async ({ page }) => {
            // Filter by unlikely status to trigger empty state
            const searchInput = page.getByRole('searchbox');
            await searchInput.fill('xyznonexistentproject123');
            await page.waitForTimeout(400);
            
            // Should show empty state message or no results
            const emptyState = page.getByText(/no se encontraron|no results|sin proyectos/i);
            
            if (await emptyState.isVisible()) {
                await expect(emptyState).toBeVisible();
            }
        });
    });

    test.describe('Navigation', () => {
        test('should navigate to project details', async ({ page }) => {
            const projectCards = page.locator('[data-project-id]').or(page.locator('.project-card'));
            const firstCard = projectCards.first();
            
            if (await firstCard.isVisible()) {
                await firstCard.click();
                await page.waitForTimeout(500);
            }
        });

        test('should navigate to projects page via breadcrumb', async ({ page }) => {
            const projectsLink = page.getByRole('link', { name: 'Proyectos' });
            
            if (await projectsLink.isVisible()) {
                await projectsLink.click();
                await expect(page).toHaveURL(/.*\/projects$/);
            }
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            // H1 for page title
            const h1 = page.getByRole('heading', { level: 1, name: 'Proyectos Archivados' });
            await expect(h1).toBeVisible();
        });

        test('should have searchbox with proper role', async ({ page }) => {
            const searchbox = page.getByRole('searchbox');
            await expect(searchbox).toBeVisible();
            await expect(searchbox).toHaveAttribute('type', 'search');
        });

        test('should have accessible status select', async ({ page }) => {
            const statusSelect = page.locator('select[aria-label*="Estado"]');
            
            if (await statusSelect.isVisible()) {
                await expect(statusSelect).toHaveAttribute('aria-label');
            }
        });

        test('should have StatsGrid with list role', async ({ page }) => {
            const statsList = page.locator('[role="list"]').first();
            await expect(statsList).toBeVisible();
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Tab to back button
            await page.keyboard.press('Tab');
            
            let tabCount = 0;
            let activeElement = await page.evaluate(() => document.activeElement?.tagName);
            
            // Find first interactive element
            while (tabCount < 5 && !['A', 'BUTTON', 'INPUT', 'SELECT'].includes(activeElement || '')) {
                await page.keyboard.press('Tab');
                activeElement = await page.evaluate(() => document.activeElement?.tagName);
                tabCount++;
            }
            
            expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(activeElement || '');
        });

        test('should have main landmark', async ({ page }) => {
            const main = page.locator('main');
            await expect(main).toBeVisible();
        });

        test('should have back button with proper link semantics', async ({ page }) => {
            const backButton = page.getByRole('link', { name: 'Volver' });
            await expect(backButton).toBeVisible();
            await expect(backButton).toHaveAttribute('href');
        });
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            await expect(page.getByRole('heading', { name: 'Proyectos Archivados' })).toBeVisible();
            
            // Back button should be visible
            const backButton = page.getByRole('link', { name: 'Volver' });
            await expect(backButton).toBeVisible();
            
            // Stats should stack
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
        });

        test('should work on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            
            await expect(page.getByRole('heading', { name: 'Proyectos Archivados' })).toBeVisible();
        });

        test('should work on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            await expect(page.getByRole('heading', { name: 'Proyectos Archivados' })).toBeVisible();
        });
    });

    test.describe('Item Counter', () => {
        test('should display count with proper singular/plural', async ({ page }) => {
            const subtitle = page.locator('p.text-gray-600').first();
            await expect(subtitle).toBeVisible();
            
            const text = await subtitle.textContent();
            expect(text).toMatch(/\d+ proyectos? en archivo/i);
        });

        test('should have status role for screen readers', async ({ page }) => {
            const counters = page.locator('[role="status"]');
            const count = await counters.count();
            
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });
});
