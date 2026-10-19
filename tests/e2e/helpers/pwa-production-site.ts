import { test as base, expect } from '@playwright/test'
import { createServer, type Server } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface ProductionSite {
  url: string
  indexSha256: string
  bumpServiceWorker: () => void
  paidRequests: () => number
}
const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
}

async function closeServer(server: Server) {
  server.closeAllConnections()
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
}

/** Serves the frozen dist bytes on an isolated loopback origin. No production API, data, or model credentials exist here. */
export const test = base.extend<{ site: ProductionSite }>({
  site: async ({ baseURL: _baseURL }, provide, info) => {
    const dist = path.resolve(fileURLToPath(new URL('../../../dist/', import.meta.url)))
    const indexBytes = await readFile(path.join(dist, 'index.html'))
    let serviceWorkerRevision = 0
    let paidRequests = 0
    let apiReads = 0
    const server = createServer(async (request, response) => {
      try {
        const url = new URL(request.url ?? '/', 'http://127.0.0.1')
        if (url.pathname.startsWith('/api/')) {
          if (url.pathname.startsWith('/api/ai/') || url.pathname.endsWith('/live-test')) paidRequests++
          response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
          response.end(JSON.stringify({ fixture: true, count: ++apiReads, settings: { mode: 'off', provider: 'fake', apiKeyConfigured: false }, access: { required: false, authorized: true } }))
          return
        }
        const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'
        const target = path.resolve(dist, relative)
        if (!target.startsWith(dist + path.sep)) { response.writeHead(403); response.end(); return }
        let body: Buffer
        let extension = path.extname(target)
        try { body = await readFile(target) }
        catch {
          if (extension) { response.writeHead(404); response.end(); return }
          body = indexBytes
          extension = '.html'
        }
        // Only a comment changes between versions: exercise a real waiting SW without mutating the build.
        if (relative === 'sw.js') body = Buffer.concat([body, Buffer.from(`\n/* isolated-e2e-worker-revision:${serviceWorkerRevision} */\n`)])
        response.writeHead(200, { 'Content-Type': contentTypes[extension] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' })
        response.end(body)
      } catch { response.writeHead(500); response.end() }
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Isolated production static server did not bind')
    const indexSha256 = createHash('sha256').update(indexBytes).digest('hex').toUpperCase()
    const site = { url: `http://127.0.0.1:${address.port}`, indexSha256, bumpServiceWorker: () => { serviceWorkerRevision++ }, paidRequests: () => paidRequests }
    try { await provide(site) }
    finally {
      await info.attach('production-pwa-fixture-boundary', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ indexSha256, realServiceWorker: true, serviceWorkerCommentRevisionOnly: serviceWorkerRevision, realOsInstallation: false, productionOrPrivateDataUsed: false, paidRequests })) })
      await closeServer(server)
      expect(paidRequests).toBe(0)
    }
  },
})
export { expect }
