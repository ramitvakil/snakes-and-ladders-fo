import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('home page loads and shows hero', async ({ page }) => {
    await page.goto('/');
    // Dismiss any guided tour overlay that may appear for first-time visitors
    const tourClose = page.locator('button[aria-label="Close tour"]');
    if (await tourClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tourClose.click();
    }
    await expect(page.locator('h1')).toContainText('Snakes & Ladders');
  });

  test('register a new user', async ({ page }) => {
    const unique = `e2e${Date.now().toString(36)}`;
    await page.goto('/register');

    await page.fill('#displayName', unique);
    await page.fill('#email', `${unique}@test.com`);
    await page.fill('#password', 'testpass123');
    await page.click('button[type="submit"]');

    // Should redirect to lobby after registration
    await expect(page).toHaveURL(/\/lobby/, { timeout: 15000 });
  });

  test('login with seeded user alice', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect away from login and show user name in nav
    await expect(page).toHaveURL(/\/lobby/, { timeout: 15000 });
    await expect(page.locator('nav')).toContainText('Alice');
  });

  test('unauthenticated user cannot access lobby', async ({ page }) => {
    await page.goto('/lobby');
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('logout works', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/lobby/, { timeout: 15000 });

    // Now logout
    await page.click('button:has-text("Sign Out")');
    await expect(page.locator('nav')).not.toContainText('Alice');
    await expect(page.locator('nav')).toContainText('Sign In');
  });
});
