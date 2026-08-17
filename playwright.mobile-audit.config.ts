import { defineConfig } from '@playwright/test'

const androidUA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36'
const ipadUA = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'mobile-human-click-audit.spec.ts',
  workers: 1,
  outputDir: './artifacts/playwright-mobile-audit-results',
  reporter: [['list'], ['html', { outputFolder: './artifacts/playwright-mobile-audit-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4176',
    serviceWorkers: 'allow',
    hasTouch: true,
    isMobile: true,
    trace: 'on',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'android-360', use: { viewport: { width: 360, height: 800 }, userAgent: androidUA, deviceScaleFactor: 3 } },
    { name: 'android-390', use: { viewport: { width: 390, height: 844 }, userAgent: androidUA, deviceScaleFactor: 3 } },
    { name: 'ipad-768', use: { viewport: { width: 768, height: 1024 }, userAgent: ipadUA, deviceScaleFactor: 2 } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4176',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
