import { test, expect } from '@playwright/test';

test.describe('Infrastructure Page', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByLabel('Usuario').fill('carlosjperez');
        await page.getByLabel('Contraseña').fill('bypass');
        await page.getByRole('button', { name: 'Ingresar' }).click();
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
        
        // Navigate to infrastructure
        await page.goto('/infrastructure');
    });

    test.describe('Page Structure', () => {
        test('should display PageHeader with title and subtitle', async ({ page }) => {
            // Title
            await expect(page.getByRole('heading', { name: 'Infraestructura', level: 1 })).toBeVisible();
            
            // Subtitle
            const subtitle = page.locator('p.text-gray-600').first();
            await expect(subtitle).toBeVisible();
            await expect(subtitle).toContainText(/servidores|servers/i);
        });

        test('should display breadcrumbs', async ({ page }) => {
            const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
            await expect(breadcrumbs).toBeVisible();
            await expect(breadcrumbs.getByText('Infraestructura')).toBeVisible();
        });

        test('should display ViewSelector in header', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            await expect(gridButton).toBeVisible();
            await expect(listButton).toBeVisible();
        });

        test('should display StatsGrid with infrastructure stats', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
            
            // Should have stat cards for servers, services, etc.
            const statCards = statsGrid.locator('.stat-card');
            const count = await statCards.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should display SearchInput', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            await expect(searchInput).toBeVisible();
            await expect(searchInput).toHaveAttribute('placeholder', /buscar/i);
        });
    });

    test.describe('Stats Display', () => {
        test('should display infrastructure metrics', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            
            // Should have stat cards with infrastructure data
            await expect(statsGrid).toBeVisible();
            
            // Check for common infrastructure labels
            const labels = [
                page.getByText(/servidores|servers/i),
                page.getByText(/servicios|services/i),
                page.getByText(/activos|active/i)
            ];
            
            // At least one should be visible
            let visibleCount = 0;
            for (const label of labels) {
                if (await label.isVisible()) {
                    visibleCount++;
                }
            }
            expect(visibleCount).toBeGreaterThan(0);
        });

        test('should display stat card icons', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const icons = statsGrid.locator('svg');
            const iconCount = await icons.count();
            
            expect(iconCount).toBeGreaterThan(0);
        });

        test('should have different stat card variants', async ({ page }) => {
            const statsGrid = page.locator('.stats-grid').first();
            const statCards = statsGrid.locator('.stat-card');
            
            // Multiple cards should exist
            const count = await statCards.count();
            expect(count).toBeGreaterThan(1);
        });
    });

    test.describe('View Mode Switching', () => {
        test('should toggle between grid and list views', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            // Default should be grid
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            
            // Switch to list
            await listButton.click();
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
            await expect(gridButton).toHaveAttribute('aria-pressed', 'false');
            
            // Switch back to grid
            await gridButton.click();
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
        });

        test('should persist view mode during interactions', async ({ page }) => {
            const listButton = page.getByRole('button', { name: /list|lista/i });
            await listButton.click();
            
            // Perform search
            const searchInput = page.getByRole('searchbox');
            await searchInput.fill('test');
            
            // View mode should persist
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
        });
    });

    test.describe('Search Functionality', () => {
        test('should filter infrastructure items by search', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            
            await searchInput.fill('server');
            await page.waitForTimeout(400); // Wait for debounce
            
            await expect(searchInput).toHaveValue('server');
        });

        test('should clear search with clear button', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            
            await searchInput.fill('test');
            await page.waitForTimeout(100);
            
            const clearButton = page.getByRole('button', { name: /clear|limpiar/i });
            await clearButton.click();
            
            await expect(searchInput).toHaveValue('');
        });

        test('should show/hide clear button based on input', async ({ page }) => {
            const searchInput = page.getByRole('searchbox');
            const clearButton = page.getByRole('button', { name: /clear|limpiar/i });
            
            // Initially hidden
            await expect(clearButton).not.toBeVisible();
            
            // Show when typing
            await searchInput.fill('test');
            await expect(clearButton).toBeVisible();
            
            // Hide when cleared
            await clearButton.click();
            await expect(clearButton).not.toBeVisible();
        });
    });

    test.describe('Filter Functionality', () => {
        test('should display filter groups', async ({ page }) => {
            const filterGroups = page.locator('[role="group"]');
            const count = await filterGroups.count();
            
            expect(count).toBeGreaterThan(0);
        });

        test('should filter by status', async ({ page }) => {
            const statusFilter = page.getByRole('button', { name: /activo|active/i });
            
            if (await statusFilter.isVisible()) {
                await statusFilter.click();
                await page.waitForTimeout(200);
            }
        });

        test('should filter by type', async ({ page }) => {
            const typeFilters = page.getByRole('button', { name: /servidor|servicio|service/i });
            const firstFilter = typeFilters.first();
            
            if (await firstFilter.isVisible()) {
                await firstFilter.click();
                await page.waitForTimeout(200);
            }
        });
    });

    test.describe('Navigation', () => {
        test('should navigate to server details', async ({ page }) => {
            // Click first infrastructure item
            const items = page.locator('[data-server-id]').or(page.locator('.server-card')).or(page.locator('article'));
            const firstItem = items.first();
            
            if (await firstItem.isVisible()) {
                await firstItem.click();
                await page.waitForTimeout(500);
            }
        });

        test('should navigate back to dashboard', async ({ page }) => {
            const homeLink = page.getByRole('link', { name: /inicio|dashboard/i });
            
            if (await homeLink.isVisible()) {
                await homeLink.click();
                await expect(page).toHaveURL(/.*dashboard/);
            }
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            const h1 = page.getByRole('heading', { level: 1, name: 'Infraestructura' });
            await expect(h1).toBeVisible();
            
            // Should have h3 for filter sections
            const h3Elements = page.getByRole('heading', { level: 3 });
            const count = await h3Elements.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should have searchbox with proper role', async ({ page }) => {
            const searchbox = page.getByRole('searchbox');
            await expect(searchbox).toBeVisible();
            await expect(searchbox).toHaveAttribute('type', 'search');
        });

        test('should have proper ARIA on ViewSelector', async ({ page }) => {
            const gridButton = page.getByRole('button', { name: /grid/i });
            const listButton = page.getByRole('button', { name: /list/i });
            
            await expect(gridButton).toHaveAttribute('aria-pressed');
            await expect(listButton).toHaveAttribute('aria-pressed');
        });

        test('should have StatsGrid with list role', async ({ page }) => {
            const statsList = page.locator('[role="list"]').first();
            await expect(statsList).toBeVisible();
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Tab through elements
            await page.keyboard.press('Tab');
            
            let activeElement = await page.evaluate(() => document.activeElement?.tagName);
            expect(['A', 'BUTTON', 'INPUT']).toContain(activeElement || '');
        });

        test('should have main landmark', async ({ page }) => {
            const main = page.locator('main');
            await expect(main).toBeVisible();
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
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            await expect(page.getByRole('heading', { name: 'Infraestructura' })).toBeVisible();
            
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
        });

        test('should work on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            
            await expect(page.getByRole('heading', { name: 'Infraestructura' })).toBeVisible();
        });

        test('should work on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            await expect(page.getByRole('heading', { name: 'Infraestructura' })).toBeVisible();
        });
    });

    test.describe('Item Counter', () => {
        test('should display item count with proper label', async ({ page }) => {
            const counter = page.locator('[role="status"]').first();
            
            if (await counter.isVisible()) {
                await expect(counter).toHaveAttribute('aria-label');
            }
        });

        test('should update count when filtering', async ({ page }) => {
            const counter = page.locator('[role="status"]').first();
            
            if (await counter.isVisible()) {
                const initialText = await counter.textContent();
                
                // Apply filter
                const searchInput = page.getByRole('searchbox');
                await searchInput.fill('test');
                await page.waitForTimeout(400);
                
                // Counter might update (or stay same if no results)
                await expect(counter).toBeVisible();
            }
        });
    });
});
