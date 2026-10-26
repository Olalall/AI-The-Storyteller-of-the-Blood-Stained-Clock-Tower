import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'opening-preparation.spec.ts', workers: 1, timeout: 120_000,
  outputDir: './artifacts/playwright-opening-results',
  reporter: [['list'], ['json', { outputFile: './artifacts/playwright-opening-report.json' }]],
  use: { baseURL: 'http://127.0.0.1:4199', serviceWorkers: 'block', actionTimeout: 20_000, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-ipad', use: { ...devices['iPad Pro 11'], viewport: { width: 820, height: 1180 } } },
  ],
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4199', url: 'http://127.0.0.1:4199', reuseExistingServer: false },
})
