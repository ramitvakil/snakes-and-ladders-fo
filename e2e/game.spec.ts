import { test, expect, Page } from '@playwright/test';

/** Helper: dismiss any guided tour overlay */
async function dismissTour(page: Page) {
  // Wait a bit for tour to potentially appear
  await page.waitForTimeout(1500);
  const tourClose = page.locator('button[aria-label="Close tour"]');
  if (await tourClose.isVisible({ timeout: 1000 }).catch(() => false)) {
    await tourClose.click();
    await page.waitForTimeout(500);
  }
}

/** Helper: login as a seeded user */
async function loginAs(page: Page, email: string, password = 'password123') {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/lobby/, { timeout: 15000 });
}

test.describe('Single-Player Mode', () => {
  test('create and play a single-player game', async ({ page }) => {
    await loginAs(page, 'alice@example.com');
    await page.goto('/lobby');
    await dismissTour(page);

    // Click Quick Single-Player button
    const singleBtn = page.locator('button:has-text("Single-Player"), button:has-text("Single Player")');
    await expect(singleBtn).toBeVisible({ timeout: 5000 });
    await singleBtn.click();

    // Single-player auto-adds bot and starts the game automatically
    // Should navigate directly to game page
    await page.waitForURL(/\/game\//, { timeout: 20000 });

    // Board should be visible
    await expect(page.locator('h1')).toContainText('Game', { timeout: 5000 });
  });
});

test.describe('Multiplayer Mode', () => {
  test('create room and add bot', async ({ page }) => {
    await loginAs(page, 'bob@example.com');
    await page.goto('/lobby');
    await dismissTour(page);

    // Create a room
    const roomInput = page.locator('input[placeholder="Room name"]');
    await expect(roomInput).toBeVisible({ timeout: 5000 });
    await roomInput.fill(`E2E-${Date.now().toString(36)}`);
    await page.click('button:has-text("Create")');

    // Wait for the current room panel — use specific "Players (X/Y)" format
    await expect(page.locator('text=/Players \\(\\d+\\/\\d+\\)/')).toBeVisible({ timeout: 10000 });

    // Wait briefly for socket to stabilize
    await page.waitForTimeout(2000);

    // Add a bot
    const addBotBtn = page.locator('button:has-text("Add Bot")');
    await expect(addBotBtn).toBeVisible({ timeout: 3000 });
    await addBotBtn.click();

    // Wait for bot to appear (playerCount should increase)
    const startBtn = page.locator('button:has-text("Start Game")');
    await expect(startBtn).toBeEnabled({ timeout: 10000 });

    // Start the game
    await startBtn.click();

    // Should navigate to game
    await page.waitForURL(/\/game\//, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Game', { timeout: 5000 });
  });
});

test.describe('Leaderboard & Profile', () => {
  test('leaderboard page loads', async ({ page }) => {
    await page.goto('/leaderboard');
    await dismissTour(page);
    await expect(page.locator('h1')).toContainText(/leaderboard/i, { timeout: 5000 });
  });

  test('profile page loads for authenticated user', async ({ page }) => {
    await loginAs(page, 'alice@example.com');
    await dismissTour(page);
    // Click the profile link in the navbar (shows user's display name)
    await page.click('a[href="/profile"]');
    await expect(page).toHaveURL(/\/profile/, { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Profile', { timeout: 10000 });
  });
});

test.describe('Help & Guided Navigation', () => {
  test('help button opens menu with options', async ({ page }) => {
    await page.goto('/');
    await dismissTour(page);

    // Click the help button
    const helpBtn = page.locator('[data-testid="help-button"]');
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();

    // Should see menu options
    await expect(page.locator('text=How to Play')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=Guided Tour')).toBeVisible({ timeout: 2000 });
  });

  test('How to Play modal opens and closes', async ({ page }) => {
    await page.goto('/');
    await dismissTour(page);

    // Open How to Play
    const helpBtn = page.locator('[data-testid="help-button"]');
    await helpBtn.click();
    await page.click('text=How to Play');

    // Modal should be visible with game content
    await expect(page.locator('text=Objective')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=How a Turn Works')).toBeVisible();

    // Close it — use the "Got it — Let's Play!" button (which is inside the modal at z-10100)
    const gotItBtn = page.locator('button:has-text("Got it — Let")');
    await expect(gotItBtn).toBeVisible({ timeout: 2000 });
    await gotItBtn.click();
    await expect(page.locator('text=Objective')).not.toBeVisible({ timeout: 3000 });
  });

  test('guided tour can be launched and navigated', async ({ page }) => {
    await page.goto('/');
    await dismissTour(page);

    // Open via help menu
    const helpBtn = page.locator('[data-testid="help-button"]');
    await helpBtn.click();
    await page.click('text=Guided Tour');

    // Tour should appear — step 1
    await expect(page.locator('text=Welcome to Snakes')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Step 1 of')).toBeVisible();

    // Click through all steps using the Next button inside the tooltip
    const nextBtn = page.locator('.rounded-xl.bg-gray-900 button:has-text("Next")');
    while (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nextBtn.click({ force: true });
      await page.waitForTimeout(400);
    }

    // Last step should show "Got it!" button
    const finishBtn = page.locator('.rounded-xl.bg-gray-900 button:has-text("Got it!")');
    if (await finishBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await finishBtn.click({ force: true });
    }

    // Tour should close
    await expect(page.locator('text=Step 1 of')).not.toBeVisible({ timeout: 3000 });
  });
});
