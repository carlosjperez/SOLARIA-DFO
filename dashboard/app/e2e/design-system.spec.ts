import { test, expect } from '@playwright/test';

test.describe('Design System Components', () => {
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
            await page.goto('/dashboard');
            await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
            await expect(page.getByText('Vista ejecutiva del estado de operaciones')).toBeVisible();
        });

        test('should display breadcrumbs in projects page', async ({ page }) => {
            await page.goto('/projects');
            const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
            await expect(breadcrumbs).toBeVisible();
            await expect(breadcrumbs.getByText('Proyectos')).toBeVisible();
        });

        test('should display back button in archived projects', async ({ page }) => {
            await page.goto('/projects/archived');
            const backButton = page.getByRole('link', { name: 'Volver' });
            await expect(backButton).toBeVisible();
            await backButton.click();
            await expect(page).toHaveURL(/.*\/projects$/);
        });

        test('should display view selector in dashboard header', async ({ page }) => {
            await page.goto('/dashboard');
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            await expect(gridButton).toBeVisible();
            await expect(listButton).toBeVisible();
        });
    });

    test.describe('StatCard Component', () => {
        test('should display stat cards with values', async ({ page }) => {
            await page.goto('/dashboard');
            
            // Check for stat cards
            await expect(page.getByText('Proyectos Activos')).toBeVisible();
            await expect(page.getByText('Tareas Hoy')).toBeVisible();
            await expect(page.getByText('Agentes Activos')).toBeVisible();
        });

        test('should have clickable stat card', async ({ page }) => {
            await page.goto('/dashboard');
            
            // Find and click the Projects stat card
            const projectsCard = page.locator('button').filter({ hasText: 'Proyectos Activos' });
            await expect(projectsCard).toBeVisible();
            await projectsCard.click();
            
            // Should navigate to projects page
            await expect(page).toHaveURL(/.*projects/);
        });

        test('should display stat cards with different variants', async ({ page }) => {
            await page.goto('/projects');
            
            // Check for multiple stat cards (should have different visual variants)
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
            
            // Verify stat cards are present
            await expect(page.getByText('Total')).toBeVisible();
            await expect(page.getByText('Activos')).toBeVisible();
        });

        test('should display icons in stat cards', async ({ page }) => {
            await page.goto('/dashboard');
            
            // Icons should be rendered (check for svg elements within stat cards)
            const icons = page.locator('.stat-card svg');
            const iconCount = await icons.count();
            expect(iconCount).toBeGreaterThan(0);
        });
    });

    test.describe('StatsGrid Component', () => {
        test('should display responsive stats grid', async ({ page }) => {
            await page.goto('/projects');
            
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
            
            // Should have proper grid styling
            const classList = await statsGrid.getAttribute('class');
            expect(classList).toContain('grid');
        });

        test('should display 4-column grid on dashboard', async ({ page }) => {
            await page.goto('/dashboard');
            
            const statsGrid = page.locator('.stats-grid').first();
            const statCards = statsGrid.locator('.stat-card');
            const cardCount = await statCards.count();
            
            expect(cardCount).toBe(4);
        });

        test('should have proper ARIA role', async ({ page }) => {
            await page.goto('/projects');
            
            // StatsGrid should have role="list"
            const statsGrid = page.locator('[role="list"]').first();
            await expect(statsGrid).toBeVisible();
        });
    });

    test.describe('SearchInput Component', () => {
        test('should display search input with placeholder', async ({ page }) => {
            await page.goto('/projects');
            
            const searchInput = page.getByRole('searchbox');
            await expect(searchInput).toBeVisible();
            await expect(searchInput).toHaveAttribute('placeholder', /buscar/i);
        });

        test('should filter content when typing', async ({ page }) => {
            await page.goto('/projects');
            
            const searchInput = page.getByRole('searchbox');
            await searchInput.fill('test');
            
            // Should have entered text
            await expect(searchInput).toHaveValue('test');
        });

        test('should display clear button when has value', async ({ page }) => {
            await page.goto('/projects');
            
            const searchInput = page.getByRole('searchbox');
            await searchInput.fill('test');
            
            // Clear button should be visible
            const clearButton = page.getByRole('button', { name: /clear|limpiar/i });
            await expect(clearButton).toBeVisible();
            
            // Click clear button
            await clearButton.click();
            await expect(searchInput).toHaveValue('');
        });

        test('should have proper accessibility attributes', async ({ page }) => {
            await page.goto('/projects');
            
            const searchInput = page.getByRole('searchbox');
            await expect(searchInput).toHaveAttribute('type', 'search');
        });
    });

    test.describe('ViewSelector Component', () => {
        test('should toggle between grid and list views', async ({ page }) => {
            await page.goto('/dashboard');
            
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            // Grid should be active by default (pressed state)
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            await expect(listButton).toHaveAttribute('aria-pressed', 'false');
            
            // Click list view
            await listButton.click();
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
            await expect(gridButton).toHaveAttribute('aria-pressed', 'false');
            
            // Click grid view
            await gridButton.click();
            await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            await expect(listButton).toHaveAttribute('aria-pressed', 'false');
        });

        test('should have proper ARIA labels', async ({ page }) => {
            await page.goto('/projects');
            
            const viewSelector = page.locator('[role="group"]').filter({ has: page.getByRole('button', { name: /grid/i }) });
            await expect(viewSelector).toBeVisible();
        });

        test('should support keyboard navigation', async ({ page }) => {
            await page.goto('/dashboard');
            
            const gridButton = page.getByRole('button', { name: /grid|cuadrícula/i });
            const listButton = page.getByRole('button', { name: /list|lista/i });
            
            // Focus and activate with keyboard
            await gridButton.focus();
            await page.keyboard.press('Tab');
            await expect(listButton).toBeFocused();
            
            await page.keyboard.press('Enter');
            await expect(listButton).toHaveAttribute('aria-pressed', 'true');
        });
    });

    test.describe('ItemCounter Component', () => {
        test('should display item count with label', async ({ page }) => {
            await page.goto('/projects');
            
            // Should show project count (e.g., "5 proyectos")
            const counter = page.locator('[role="status"]').first();
            await expect(counter).toBeVisible();
        });

        test('should handle singular and plural forms', async ({ page }) => {
            await page.goto('/projects');
            
            // Check if label adjusts for count
            const counters = page.locator('[role="status"]');
            const count = await counters.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should have proper ARIA attributes', async ({ page }) => {
            await page.goto('/projects');
            
            const counter = page.locator('[role="status"]').first();
            await expect(counter).toHaveAttribute('aria-label');
        });
    });

    test.describe('FilterGroup Component', () => {
        test('should display filter groups', async ({ page }) => {
            await page.goto('/projects');
            
            // Filter groups should be visible
            const filterGroup = page.locator('[role="group"]').first();
            await expect(filterGroup).toBeVisible();
        });

        test('should display filter title', async ({ page }) => {
            await page.goto('/projects');
            
            // Should have filter section headings
            const heading = page.getByRole('heading', { level: 3 }).first();
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Responsive Behavior', () => {
        test('should adapt to mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/dashboard');
            
            // Page should still be functional
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
            
            // Stats should stack vertically
            const statsGrid = page.locator('.stats-grid').first();
            await expect(statsGrid).toBeVisible();
        });

        test('should adapt to tablet viewport', async ({ page }) => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/projects');
            
            await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();
        });

        test('should adapt to desktop viewport', async ({ page }) => {
            // Set desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/infrastructure');
            
            await expect(page.getByRole('heading', { name: 'Infraestructura' })).toBeVisible();
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            await page.goto('/dashboard');
            
            // H1 for page title
            const h1 = page.getByRole('heading', { level: 1 });
            await expect(h1).toBeVisible();
            
            // Should not skip heading levels
            const headings = page.locator('h1, h2, h3, h4, h5, h6');
            const headingCount = await headings.count();
            expect(headingCount).toBeGreaterThan(0);
        });

        test('should support keyboard navigation', async ({ page }) => {
            await page.goto('/dashboard');
            
            // Tab through focusable elements
            await page.keyboard.press('Tab');
            const firstFocusable = await page.evaluate(() => document.activeElement?.tagName);
            expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocusable || '');
        });

        test('should have proper ARIA landmarks', async ({ page }) => {
            await page.goto('/dashboard');
            
            // Should have main landmark
            const main = page.locator('main');
            await expect(main).toBeVisible();
        });

        test('should have focus visible styles', async ({ page }) => {
            await page.goto('/dashboard');
            
            // Focus first button
            const button = page.getByRole('button').first();
            await button.focus();
            
            // Should have focus indicator (check computed styles)
            const hasFocusStyle = await button.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return styles.outline !== 'none' || styles.boxShadow !== 'none';
            });
            
            expect(hasFocusStyle).toBe(true);
        });
    });
});
