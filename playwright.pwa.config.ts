import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'pwa-shareable.spec.ts',
  outputDir: './artifacts/playwright-pwa-results',
  reporter: [['list'], ['html', { outputFolder: './artifacts/playwright-pwa-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4174',
    serviceWorkers: 'allow',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
