import { defineConfig } from '@playwright/test'
const baseURL = process.env.BOTC_DEVICE_URL
if (!baseURL) throw new Error('Set BOTC_DEVICE_URL to the running LAN HTTP preview URL.')
export default defineConfig({
  testDir: './tests/load-performance',
  testMatch: 'lan-followup.spec.ts',
  outputDir: './.codex-artifacts/device-entry/followups',
  reporter: 'list',
  use: { baseURL, actionTimeout: 15_000, navigationTimeout: 15_000, trace: 'retain-on-failure' },
})
