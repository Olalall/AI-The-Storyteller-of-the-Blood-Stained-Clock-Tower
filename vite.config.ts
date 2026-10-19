import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { scriptTextPlugin } from './scripts/build/script-text-plugin.ts'

export default defineConfig({
  plugins: [scriptTextPlugin(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['tests/e2e/**', 'tests/load-performance/**', 'node_modules/**', 'dist/**'],
  },
})
