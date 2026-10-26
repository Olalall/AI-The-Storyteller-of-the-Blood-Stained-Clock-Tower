import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['nomination-rules.spec.ts', 'day-core-recovery.spec.ts'],
  workers: 1,
  timeout: 60_000,
  outputDir: './artifacts/playwright-nomination-results',
  reporter: [['list'], ['json', { outputFile: './artifacts/playwright-nomination-report.json' }]],
  use: { baseURL: 'http://127.0.0.1:4198', serviceWorkers: 'block', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-ipad', use: { ...devices['iPad Pro 11'], viewport: { width: 820, height: 1180 } } },
  ],
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4198', url: 'http://127.0.0.1:4198', reuseExistingServer: false, timeout: 120_000 },
})
