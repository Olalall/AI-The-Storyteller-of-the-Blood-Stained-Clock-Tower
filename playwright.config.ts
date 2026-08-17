import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['pwa-shareable.spec.ts', 'mobile-human-click-audit.spec.ts'],
  // 入口包包含完整智能板子数据；Windows 本机同时开十多个页面会让首屏加载互相抢 CPU，
  // 产生与业务无关的 page.goto 超时。四个 worker 仍并行，但保持完整回归稳定。
  workers: 4,
  outputDir: './artifacts/playwright-results',
  reporter: [['list'], ['html', { outputFolder: './artifacts/playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
