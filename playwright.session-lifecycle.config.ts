import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const evidence = path.resolve('.tmp/release-20261019-cross-browser-editor')
const requestedRun = process.env.BOTC_LIFECYCLE_RUN
const run = requestedRun && ['baseline', 'dirty-baseline', 'supplemental', 'supplemental-chromium'].includes(requestedRun) ? requestedRun : 'production'
const chromium = { browserName: 'chromium' as const, channel: 'chromium', launchOptions: { ignoreDefaultArgs: ['--disable-back-forward-cache'] } }

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'session-cross-browser-lifecycle.spec.ts',
  outputDir: path.join(evidence, `${run}-browser-results`),
  workers: 2,
  timeout: 45_000,
  reporter: [['list'], ['json', { outputFile: path.join(evidence, `${run}-browser-report.json`) }]],
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium-desktop', use: { ...chromium, viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-android-touch', use: { ...devices['Pixel 7'], ...chromium } },
    { name: 'firefox-desktop', use: { browserName: 'firefox', viewport: { width: 1440, height: 900 } } },
    { name: 'firefox-narrow', use: { browserName: 'firefox', viewport: { width: 390, height: 844 }, isMobile: false } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-iphone-touch', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4322',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
