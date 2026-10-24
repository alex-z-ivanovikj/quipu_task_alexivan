import { defineConfig, devices } from '@playwright/test';

/**
 * BASE_URL points at the ParaBank host (no /parabank suffix).
 * Default is the local Docker container started by `npm run parabank:up`.
 */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'soap',
      testDir: './tests/soap',
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
