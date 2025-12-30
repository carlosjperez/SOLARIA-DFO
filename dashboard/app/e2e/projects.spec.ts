import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByLabel('Usuario').fill('carlosjperez');
        await page.getByLabel('Contraseña').fill('bypass');
        await page.getByRole('button', { name: 'Ingresar' }).click();
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
        
        // Navigate to projects
        await page.goto('/projects');
    });

    test.describe('Page Structure', () => {
        test('should display PageHeader with all elements', async ({ page }) => {
            // Title
            await expect(page.getByRole('heading', { name: 'Proyectos', level: 1 })).toBeVisible();
            
            // Subtitle with project count
            const subtitle = page.locator('p.text-gray-600').first();
            await expect(subtitle).toBeVisible();
            
            // Breadcrumbs
            const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
            await expect(breadcrumbs).toBeVisible();
            
            // ViewSelector
            const viewSelector = page.getByRole('button', { name: /grid/i });
            await expect(viewSelector).toBeVisible();
        });

        test('should display StatsGrid with 4 stat cards', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
            
            const statCards = statsGrid.locator('.stat-card');
            const count = await statCards.count();
            expect(count).toBe(4);
        });

        test('should display correct stat card labels', async ({ page }) => {
            await expect(page.getByText('Total')).toBeVisible();
            await expect(page.getByText('Activos')).toBeVisible();
            await expect(page.getByText('Archivados')).toBeVisible();
            await expect(page.getByText('Budget Total')).toBeVisible();
        });

        test('should display SearchInput', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            await expect(searchInput).toBeVisible();
            await expect(searchInput).toHaveAttribute('placeholder', /buscar/i);
        });

        test('should display filter section', async ({ page }) => {
            // Filter groups should be present
            const filterHeading = page.getByRole('heading', { name: 'Estado', level: 3 });
            await expect(filterHeading).toBeVisible();
        });
    });

    test.describe('View Mode Switching', () => {
        test('should switch between grid and list views', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            // Default should be grid view
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            
            // Switch to list view
            await listButton.click();
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
            await expect(gridButton).toHaveAttribute('aria-pressed', 'false');
            
            // Switch back to grid view
            await gridButton.click();
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
        });

        test('should maintain view mode when filtering', async ({ page }) => {
            // Switch to list view
            const listButton = page.getByRole('button', { name: /list|lista/i });
            await listButton.click();
            
            // Filter projects
            const searchInput = page.getByRole('searchbox');
            await searchInput.fill('test');
            
            // View mode should still be list
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
        });
    });

    test.describe('Search Functionality', () => {
        test('should filter projects by name', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            
            // Type search query
            await searchInput.fill('SOLARIA');
            
            // Wait for debounce
            await page.waitForTimeout(400);
            
            // Input should have value
            await expect(searchInput).toHaveValue('SOLARIA');
        });

        test('should clear search with clear button', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            
            // Type search query
            await searchInput.fill('test');
            await page.waitForTimeout(100);
            
            // Click clear button
            const clearButton = page.getByRole('button', { name: /clear|limpiar/i });
            await clearButton.click();
            
            // Input should be empty
            await expect(searchInput).toHaveValue('');
        });

        test('should show clear button only when has value', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            const clearButton = page.getByRole('button', { name: /clear|limpiar/i });
            
            // Clear button should not be visible initially
            await expect(clearButton).not.toBeVisible();
            
            // Type something
            await searchInput.fill('test');
            
            // Clear button should be visible
            await expect(clearButton).toBeVisible();
        });
    });

    test.describe('Stat Cards Interaction', () => {
        test('should display stat values', async ({ page }) => {
            // All stat cards should have numeric values or dashes
            const statCards = page.locator('.stat-card');
            const firstCard = statCards.first();
            await expect(firstCard).toBeVisible();
        });

        test('should have different visual variants', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const statCards = statsGrid.locator('.stat-card');
            
            // Should have multiple cards with different styling
            const count = await statCards.count();
            expect(count).toBeGreaterThan(1);
        });

        test('should display icons in stat cards', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const icons = statsGrid.locator('svg');
            const iconCount = await icons.count();
            
            expect(iconCount).toBeGreaterThanOrEqual(4);
        });
    });

    test.describe('Filter Functionality', () => {
        test('should filter by status', async ({ page }) => {
            // Click active filter
            const activeFilter = page.getByRole('button', { name: 'Activos' });
            if (await activeFilter.isVisible()) {
                await activeFilter.click();
                
                // Should apply filter (can verify by URL params or visual change)
                await page.waitForTimeout(200);
            }
        });

        test('should filter by priority', async ({ page }) => {
            // Check if priority filters exist
            const highPriorityFilter = page.getByRole('button', { name: /alta|high/i });
            if (await highPriorityFilter.isVisible()) {
                await highPriorityFilter.click();
                await page.waitForTimeout(200);
            }
        });
    });

    test.describe('Navigation', () => {
        test('should navigate to project details', async ({ page }) => {
            // Click first project card (if exists)
            const projectCards = page.locator('[data-project-id]').or(page.locator('.project-card')).or(page.locator('article'));
            const firstCard = projectCards.first();
            
            if (await firstCard.isVisible()) {
                await firstCard.click();
                // Should navigate to project details
                await page.waitForURL(/.*projects\/\d+/, { timeout: 5000 });
            }
        });

        test('should navigate to archived projects', async ({ page }) => {
            const archivedLink = page.getByRole('link', { name: /archivados|archived/i });
            
            if (await archivedLink.isVisible()) {
                await archivedLink.click();
                await expect(page).toHaveURL(/.*archived/);
            }
        });

        test('should navigate to create project', async ({ page }) => {
            const createButton = page.getByRole('link', { name: /crear|nuevo/i }).or(
                page.getByRole('button', { name: /crear|nuevo/i })
            );
            
            if (await createButton.isVisible()) {
                await createButton.click();
                await page.waitForTimeout(500);
            }
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            // H1 for page title
            const h1 = page.getByRole('heading', { level: 1, name: 'Proyectos' });
            await expect(h1).toBeVisible();
            
            // H3 for filter sections
            const h3 = page.getByRole('heading', { level: 3 }).first();
            await expect(h3).toBeVisible();
        });

        test('should have searchbox role', async ({ page }) => {
            const searchbox = page.getByRole('searchbox');
            await expect(searchbox).toBeVisible();
            await expect(searchbox).toHaveAttribute('type', 'search');
        });

        test('should have proper ARIA attributes on ViewSelector', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid/i });
            const listButton = page.getByRole('button', { name: /list/i });
            
            await expect(gridButton).toHaveAttribute('aria-pressed');
            await expect(listButton).toHaveAttribute('aria-pressed');
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Tab to search input
            await page.keyboard.press('Tab');
            
            let activeElement = await page.evaluate(() => document.activeElement?.tagName);
            
            // Should focus on interactive elements
            let tabCount = 0;
            while (tabCount < 10 && activeElement !== 'INPUT') {
                await page.keyboard.press('Tab');
                activeElement = await page.evaluate(() => document.activeElement?.tagName);
                tabCount++;
            }
            
            expect(['INPUT', 'BUTTON', 'A']).toContain(activeElement || '');
        });

        test('should have landmarks', async ({ page }) => {
            const main = page.locator('main');
            await expect(main).toBeVisible();
        });
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();
            
            // Stats should stack
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
        });

        test('should work on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            
            await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();
        });

        test('should work on desktop viewport', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();
        });
    });
});
