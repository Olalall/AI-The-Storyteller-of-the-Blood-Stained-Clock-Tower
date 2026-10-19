import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'

// 同一生产构建、冷缓存、固定网络/CPU；只测本地页面，不调用后端/模型。
const output = process.argv[2] ?? '.codex-artifacts/initial-load.json'
const root = resolve('dist')
const cache = new Map()
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' }
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const file = resolve(root, pathname === '/' ? 'index.html' : '.' + pathname)
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return }
    let value = cache.get(file)
    if (!value) {
      const raw = await readFile(file)
      const zipped = ['.js', '.css', '.html'].includes(extname(file))
      value = { body: zipped ? gzipSync(raw) : raw, zipped }
      cache.set(file, value)
    }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', ...(value.zipped ? { 'Content-Encoding': 'gzip' } : {}) })
    res.end(value.body)
  } catch { res.writeHead(404).end() }
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const url = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()
const runs = []
try {
  for (let index = 0; index < 3; index++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } })
    const page = await context.newPage()
    await context.route('**/*', (route) => route.request().url().startsWith(url) ? route.continue() : route.abort())
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 1250000, uploadThroughput: 1250000 })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(url, { waitUntil: 'load' })
    await page.locator('.dashboard').waitFor()
    const measured = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource').filter((entry) => entry.name.includes('/assets/') && entry.name.split('?')[0].endsWith('.js'))
      return { dashboardObservedMs: performance.now(), fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null, jsEncodedBytes: resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0), jsDecodedBytes: resources.reduce((sum, entry) => sum + entry.decodedBodySize, 0), jsFiles: resources.map((entry) => entry.name.split('/').at(-1)) }
    })
    runs.push({ ...measured, errors })
    await context.close()
  }
  const median = (field) => runs.map((run) => run[field]).sort((a, b) => a - b)[1]
  const report = { conditions: 'Chromium 390x900; fresh context; gzip local static server; 10Mbps; 100ms; CPU x4; external requests blocked; 3 runs; local timing not real-device/VPS results', runs, median: { dashboardObservedMs: median('dashboardObservedMs'), fcpMs: median('fcpMs'), jsEncodedBytes: median('jsEncodedBytes'), jsDecodedBytes: median('jsDecodedBytes') } }
  await mkdir(resolve(output, '..'), { recursive: true })
  await writeFile(output, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.median))
} finally { await browser.close(); await new Promise((done) => server.close(done)) }
