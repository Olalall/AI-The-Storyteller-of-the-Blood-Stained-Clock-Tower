import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['ipad-hosting.spec.ts', 'rules-advisor.spec.ts', 'session-cross-browser-lifecycle.spec.ts', 'session-refresh-editor.spec.ts', 'pwa-shareable.spec.ts'],
  // 返回缓存和编辑交接有时限；串行验收，避免多个 WebKit 争用资源干扰结果。
  workers: 1,
  timeout: 60_000,
  outputDir: './artifacts/playwright-ipad-results',
  reporter: [['list'], ['json', { outputFile: './artifacts/playwright-ipad-report.json' }]],
  use: { ...devices['iPad Pro 11'], browserName: 'webkit', baseURL: 'http://127.0.0.1:4199', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'ipad-mini-portrait', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'ipad-air-portrait', use: { viewport: { width: 820, height: 1180 } } },
    { name: 'ipad-air-landscape', use: { viewport: { width: 1180, height: 820 } } },
    { name: 'ipad-split', use: { viewport: { width: 507, height: 768 } } },
  ],
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4199', url: 'http://127.0.0.1:4199', reuseExistingServer: false, timeout: 120_000 },
})
