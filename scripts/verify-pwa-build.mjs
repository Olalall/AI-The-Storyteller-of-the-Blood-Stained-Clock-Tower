import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const distRoot = resolve(projectRoot, 'dist')

function fail(message) {
  throw new Error(`[verify:pwa] ${message}`)
}

function requireFile(relativePath) {
  const absolutePath = resolve(distRoot, relativePath)

  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    fail(`缺少构建产物：dist/${relativePath}`)
  }

  return absolutePath
}

function pngDimensions(relativePath) {
  const buffer = readFileSync(requireFile(relativePath))
  const pngSignature = '89504e470d0a1a0a'

  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    fail(`图标不是有效 PNG：dist/${relativePath}`)
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function requireIcon(manifest, expected) {
  const icon = manifest.icons?.find((candidate) =>
    candidate.src === expected.src
      && candidate.sizes === expected.sizes
      && candidate.type === 'image/png'
      && (candidate.purpose ?? 'any') === expected.purpose,
  )

  if (!icon) {
    fail(`manifest 缺少图标声明：${expected.src} (${expected.sizes}, ${expected.purpose})`)
  }

  const dimensions = pngDimensions(expected.src)
  const expectedSize = Number(expected.sizes.split('x')[0])
  if (dimensions.width !== expectedSize || dimensions.height !== expectedSize) {
    fail(`图标尺寸错误：${expected.src} 实际为 ${dimensions.width}x${dimensions.height}`)
  }
}

const manifestPath = requireFile('manifest.webmanifest')
const serviceWorkerPath = requireFile('sw.js')
const indexPath = requireFile('index.html')
const assetFileNames = readdirSync(resolve(distRoot, 'assets'))
const entryScripts = assetFileNames.filter((fileName) => /^index-[^.]+\.js$/.test(fileName))

if (entryScripts.length !== 1) {
  fail(`dist/assets 应只有一份当前主入口脚本，实际发现 ${entryScripts.length} 份`)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

if (manifest.name !== '钟楼说书人副驾驶') fail('manifest 中文名称不正确')
if (manifest.short_name !== '钟楼副驾驶') fail('manifest short_name 不正确')
if (manifest.display !== 'standalone') fail('manifest display 必须为 standalone')
if (manifest.theme_color !== '#090d12') fail('manifest 主题色不正确')

requireIcon(manifest, {
  src: 'pwa-192x192.png',
  sizes: '192x192',
  purpose: 'any',
})
requireIcon(manifest, {
  src: 'pwa-512x512.png',
  sizes: '512x512',
  purpose: 'any',
})
requireIcon(manifest, {
  src: 'maskable-icon-512x512.png',
  sizes: '512x512',
  purpose: 'maskable',
})

const indexHtml = readFileSync(indexPath, 'utf8')
if (!indexHtml.includes('manifest.webmanifest')) fail('dist/index.html 未链接 Web App Manifest')

const builtJavaScript = [
  existsSync(resolve(distRoot, 'registerSW.js'))
    ? readFileSync(resolve(distRoot, 'registerSW.js'), 'utf8')
    : '',
  ...assetFileNames
    .filter((fileName) => fileName.endsWith('.js'))
    .map((fileName) => readFileSync(resolve(distRoot, 'assets', fileName), 'utf8')),
].join('\n')

if (!builtJavaScript.includes('serviceWorker.register')) {
  fail('构建产物未通过自动脚本或 virtual:pwa-register/react 注册 Service Worker')
}

const viteConfigSource = readFileSync(resolve(projectRoot, 'vite.config.ts'), 'utf8')
if (!/registerType:\s*['"]prompt['"]/.test(viteConfigSource)) {
  fail('PWA 更新模式必须保持 prompt')
}
if (!/skipWaiting:\s*false/.test(viteConfigSource) || !/clientsClaim:\s*false/.test(viteConfigSource)) {
  fail('PWA 不得在后台强制接管并自动刷新当前页面')
}

const viteEnvironmentTypes = readFileSync(resolve(projectRoot, 'src', 'vite-env.d.ts'), 'utf8')
if (!viteEnvironmentTypes.includes('vite/client') || !viteEnvironmentTypes.includes('vite-plugin-pwa/react')) {
  fail('src/vite-env.d.ts 缺少 Vite 或 React PWA 类型声明')
}

const serviceWorkerSource = readFileSync(serviceWorkerPath, 'utf8')
if (!serviceWorkerSource.includes('index.html')) fail('Service Worker 未预缓存应用入口')
if (!serviceWorkerSource.includes('/api/')) fail('Service Worker 缺少 /api/ NetworkOnly 规则')
if (!serviceWorkerSource.includes('NetworkOnly')) fail('Service Worker 不得为 /api/ 使用缓存策略')
if (/url:\s*["']\/api(?:\/|["'])/.test(serviceWorkerSource)) {
  fail('Service Worker 的预缓存清单不得包含 /api/ URL')
}

console.log('[verify:pwa] PWA 构建产物验证通过')
console.log('[verify:pwa] manifest、Service Worker、React 注册接口与 192/512/maskable 图标均有效')
console.log('[verify:pwa] /api/ 使用 NetworkOnly，不写入 Workbox 缓存')
