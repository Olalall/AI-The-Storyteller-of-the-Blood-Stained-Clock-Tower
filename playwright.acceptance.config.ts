import { defineConfig } from '@playwright/test'
import path from 'node:path'
const output = process.env.BOTC_ACCEPTANCE_DIR
if (!output) throw new Error('请使用 npm run verify:auto 启动验收')
export default defineConfig({
  testDir: './tests/load-performance',
  outputDir: path.join(output, 'browser'),
  workers: 2,
  retries: 0,
  globalSetup: './scripts/acceptance/verify-entry.mjs',
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(output, 'browser-results.json') }],
    ['html', { outputFolder: path.join(output, 'html'), open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4287',
    actionTimeout: 15_000, navigationTimeout: 15_000,
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
  },
  webServer: {
    command: `node node_modules/vite/bin/vite.js preview --outDir "${path.join(output, 'dist')}" --host 127.0.0.1 --port 4287 --strictPort`,
    url: 'http://127.0.0.1:4287', reuseExistingServer: false, timeout: 60_000,
  },
})
