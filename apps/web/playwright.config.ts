import { defineConfig } from '@playwright/test'

// Its own command (`pnpm e2e`), so the unit loop stays fast. Set CHROME_PATH to use a
// Chrome you already have; otherwise Playwright's own browser is used.
const executablePath = process.env.CHROME_PATH

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.pw.ts',
  timeout: 20_000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    launchOptions: executablePath === undefined ? {} : { executablePath },
  },
  webServer: {
    // The app runs the way it ships: Alchemy serves the Worker and the client together.
    command: 'pnpm --dir ../.. dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
