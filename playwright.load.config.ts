import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/load-performance',
  outputDir: './.codex-artifacts/load-performance/browser',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4183', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4183', url: 'http://127.0.0.1:4183', reuseExistingServer: false, timeout: 60000 },
})
