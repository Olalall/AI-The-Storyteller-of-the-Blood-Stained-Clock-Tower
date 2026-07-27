import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    ssr: 'server/runtime.ts',
    outDir: 'dist-server',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'runtime.mjs',
      },
    },
  },
})
