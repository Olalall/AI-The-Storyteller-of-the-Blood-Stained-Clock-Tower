import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { scriptTextPlugin } from './scripts/build/script-text-plugin.ts'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    scriptTextPlugin(),
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeManifestIcons: false,
      manifest: {
        id: '/',
        name: '钟楼说书人副驾驶',
        short_name: '钟楼副驾驶',
        description: '面向线下《血染钟楼》说书人的配板、夜序、投票、日志与复盘辅助工具。',
        lang: 'zh-CN',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#090d12',
        theme_color: '#090d12',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
        globPatterns: ['index.html', 'assets/index-*.{js,css}', 'favicon.svg', 'pwa-*.png', 'maskable-icon-*.png'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /^\/assets\/.+-[A-Za-z0-9_-]{8}\.(?:js|css)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'botc-static-v1', expiration: { maxEntries: 1200 } },
          },
          {
            urlPattern: ({ url }) => url.pathname === '/api' || url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
        ],
      },
    }),
  ],
  build: {
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    // Bound parallel DOM suites on Windows so deferred panels keep their real timing budget.
    maxWorkers: 4,
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['tests/e2e/**', 'tests/load-performance/**', 'node_modules/**', 'dist/**', '.tmp/**', '.codex-artifacts/**'],
  },
})
