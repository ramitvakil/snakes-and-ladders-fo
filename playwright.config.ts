import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Start both dev servers before running tests */
  webServer: [
    {
      command: 'pnpm --filter server dev',
      port: 3001,
      timeout: 30_000,
      reuseExistingServer: true,
    },
    {
      command: 'pnpm --filter client dev',
      port: 5174,
      timeout: 30_000,
      reuseExistingServer: true,
    },
  ],
});
