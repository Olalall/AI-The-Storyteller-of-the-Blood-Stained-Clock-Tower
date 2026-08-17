import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createAIProxyHandlers, createAIProxyRoutes } from './ai'
import { createOpenAICompatibleReviewDraftProvider } from './ai/reviewDraftProvider'
import { isAIProviderConfigured, readAIProviderPrivateSettings } from './ai/aiProviderSettings'
import { createArchiveHandlers } from './archive/handlers'
import { createArchiveHttpRoutes } from './archive/httpArchiveRoutes'
import { JsonArchiveRepository } from './archive/jsonArchiveRepository'
import { createRecoveryHandlers } from './recovery/handlers'
import { createRecoveryHttpRoutes, recoveryRoutePrefix } from './recovery/httpRecoveryRoutes'
import { JsonRecoveryRepository } from './recovery/jsonRecoveryRepository'
import { corsPreflightResponse, isCorsPreflight, withLocalCors } from './runtimeCors'
import {
  createRuntimeIpRateLimiter,
  isPublicModeEnabled,
  isRequestBodyTooLargeError,
  readIncomingMessageBody,
  runtimeBodyLimitForPath,
} from './runtimeSecurity'

interface ArchiveRuntimeOptions {
  dataFile?: string
  /** 半局快照的落点。与 dataFile 分开，是为了让「半局不进战绩」在存储层面就无法违反。 */
  recoveryDataFile?: string
  staticDir?: string
  /** 公开分享站：匿名页面可用，但服务器私有数据接口默认关闭。 */
  publicAccessMode?: boolean
  /** 公开分享站允许浏览器 BYOK 访问的 AI 服务主机名。 */
  publicAIAllowedHosts?: readonly string[]
}

export interface StartArchiveRuntimeOptions extends ArchiveRuntimeOptions {
  host?: string
  port?: number
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function nodeRequestToFetchRequest(request: IncomingMessage, enforcePublicLimits = false) {
  const host = request.headers.host ?? '127.0.0.1'
  const url = new URL(request.url ?? '/', `http://${host}`)
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const bodyLimit = enforcePublicLimits ? runtimeBodyLimitForPath(url.pathname) : null
  const body = !hasBody
    ? undefined
    : bodyLimit === null
      ? ReadableStream.from(request)
      : await readIncomingMessageBody(request, bodyLimit)
  return new Request(url, {
    method: request.method,
    headers: request.headers as HeadersInit,
    body,
    duplex: body instanceof ReadableStream ? 'half' : undefined,
  } as RequestInit)
}

async function writeFetchResponse(response: Response, output: ServerResponse) {
  output.statusCode = response.status
  response.headers.forEach((value, key) => output.setHeader(key, value))
  if (!response.body) {
    output.end()
    return
  }

  for await (const chunk of response.body) {
    output.write(chunk)
  }
  output.end()
}

function defaultDataFile() {
  return path.resolve(process.env.BOTC_ARCHIVE_DATA_FILE ?? 'data/archives/archives.json')
}

function defaultRecoveryDataFile() {
  return path.resolve(process.env.BOTC_RECOVERY_DATA_FILE ?? 'data/recovery/recovery-snapshots.json')
}

function defaultStaticDir() {
  return path.resolve(process.env.BOTC_STATIC_DIR ?? 'dist')
}

function contentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()
  if (extension === '.html') return 'text/html; charset=utf-8'
  if (extension === '.js' || extension === '.mjs') return 'text/javascript; charset=utf-8'
  if (extension === '.css') return 'text/css; charset=utf-8'
  if (extension === '.webmanifest') return 'application/manifest+json; charset=utf-8'
  if (extension === '.json') return 'application/json; charset=utf-8'
  if (extension === '.svg') return 'image/svg+xml'
  if (extension === '.png') return 'image/png'
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.webp') return 'image/webp'
  if (extension === '.ico') return 'image/x-icon'
  return 'application/octet-stream'
}

function safeStaticPath(staticDir: string, pathname: string) {
  const decodedPath = decodeURIComponent(pathname)
  const requestedPath = decodedPath === '/' ? '/index.html' : decodedPath
  const relativePath = requestedPath.replace(/^\/+/, '')
  const resolvedPath = path.resolve(staticDir, relativePath)
  const relativeFromRoot = path.relative(staticDir, resolvedPath)
  if (relativeFromRoot.startsWith('..') || path.isAbsolute(relativeFromRoot)) return null
  return resolvedPath
}

async function serveStatic(request: Request, staticDir: string) {
  const url = new URL(request.url)
  const filePath = safeStaticPath(staticDir, url.pathname)
  if (!filePath) return null

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) return null
    const headers = { 'Content-Type': contentType(filePath) }
    if (request.method === 'HEAD') return new Response(null, { status: 200, headers })
    return new Response(await readFile(filePath), { status: 200, headers })
  } catch {
    const indexPath = path.resolve(staticDir, 'index.html')
    try {
      const headers = { 'Content-Type': contentType(indexPath) }
      if (request.method === 'HEAD') return new Response(null, { status: 200, headers })
      return new Response(await readFile(indexPath), { status: 200, headers })
    } catch {
      return null
    }
  }
}

export function createArchiveRuntime(options: ArchiveRuntimeOptions = {}) {
  const publicAccessMode = options.publicAccessMode ?? false
  const repository = new JsonArchiveRepository(options.dataFile ?? defaultDataFile())
  const privateAISettings = readAIProviderPrivateSettings()
  const reviewProviderForSettings = (settings: { baseUrl: string; model: string; apiKey: string; timeoutSeconds: number }) => (
    createOpenAICompatibleReviewDraftProvider({
      baseUrl: settings.baseUrl,
      model: settings.model,
      apiKey: settings.apiKey,
      timeoutSeconds: settings.timeoutSeconds,
    })
  )
  const archiveRoute = createArchiveHttpRoutes(createArchiveHandlers(repository, {
    reviewDraftProvider: !publicAccessMode && isAIProviderConfigured(privateAISettings)
      ? reviewProviderForSettings({
          baseUrl: privateAISettings.baseUrl ?? '',
          model: privateAISettings.model ?? '',
          apiKey: privateAISettings.apiKey ?? '',
          timeoutSeconds: privateAISettings.timeoutSeconds,
        })
      : undefined,
    reviewDraftProviderForRequest: (settings) => reviewProviderForSettings({
      baseUrl: settings.baseUrl,
      model: settings.model,
      apiKey: settings.apiKey,
      timeoutSeconds: settings.timeoutSeconds ?? privateAISettings.timeoutSeconds,
    }),
  }))
  const recoveryRoute = createRecoveryHttpRoutes(createRecoveryHandlers(
    new JsonRecoveryRepository(options.recoveryDataFile ?? defaultRecoveryDataFile()),
  ))
  const publicAIAllowedHosts = options.publicAIAllowedHosts
    ?? (process.env.BOTC_PUBLIC_AI_ALLOWED_HOSTS ?? '').split(',')
  const aiRoute = createAIProxyRoutes(createAIProxyHandlers({
    publicAccess: {
      mode: publicAccessMode ? 'public' : 'local',
      allowedProviderHostnames: publicAIAllowedHosts,
    },
  }))
  const staticDir = options.staticDir ?? defaultStaticDir()

  async function routeRuntimeRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/healthz') {
      return json({ ok: true, service: 'botc-storyteller-backend' })
    }
    if (url.pathname.startsWith('/api/settings/ai') || url.pathname.startsWith('/api/ai/')) return aiRoute(request)
    if (publicAccessMode && url.pathname.startsWith('/api/')) {
      return json({
        accepted: false,
        error: {
          code: 'PUBLIC_API_FORBIDDEN',
          message: '公开分享模式不提供服务器归档或恢复接口；请使用当前浏览器的本机存档。',
        },
      }, 403)
    }
    // 恢复命名空间必须排在下面那条 /api/ 兜底之前。兜底把一切 /api/ 交给归档路由，
    // 排在它后面的路由一条请求都收不到——而且是静悄悄地收不到，
    // 表现为「后端好像没这个接口」，最坏的情况是半局被归档路由收下、进了战绩。
    if (url.pathname.startsWith(recoveryRoutePrefix)) return recoveryRoute(request)
    if (url.pathname.startsWith('/api/')) return archiveRoute(request)
    if (request.method === 'GET' || request.method === 'HEAD') {
      const staticResponse = await serveStatic(request, staticDir)
      if (staticResponse) return staticResponse
    }
    return json({ accepted: false, error: { code: 'BAD_REQUEST', message: '未匹配的后端接口' } }, 404)
  }

  return async function handleRuntimeRequest(request: Request): Promise<Response> {
    if (isCorsPreflight(request)) return corsPreflightResponse(request)
    return withLocalCors(request, await routeRuntimeRequest(request))
  }
}

export function startArchiveRuntime(options: StartArchiveRuntimeOptions = {}) {
  const publicAccessMode = options.publicAccessMode ?? isPublicModeEnabled(process.env.BOTC_PUBLIC_ACCESS_MODE)
  const handleRequest = createArchiveRuntime({ ...options, publicAccessMode })
  const rateLimiter = createRuntimeIpRateLimiter()
  const server = createServer(async (incoming, outgoing) => {
    try {
      if (publicAccessMode) {
        const rateLimit = rateLimiter.check(incoming)
        if (!rateLimit.allowed) {
          incoming.pause()
          outgoing.setHeader('Connection', 'close')
          outgoing.setHeader('Retry-After', String(rateLimit.retryAfterSeconds ?? 60))
          await writeFetchResponse(json({
            accepted: false,
            error: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试。' },
          }, 429), outgoing)
          return
        }
      }
      const request = await nodeRequestToFetchRequest(incoming, publicAccessMode)
      await writeFetchResponse(await handleRequest(request), outgoing)
    } catch (error) {
      if (isRequestBodyTooLargeError(error)) {
        outgoing.setHeader('Connection', 'close')
        await writeFetchResponse(json({
          accepted: false,
          error: { code: error.code, message: '请求内容过大，服务器已拒绝处理。' },
        }, error.status), outgoing)
        return
      }
      await writeFetchResponse(json({ accepted: false, error: { code: 'BAD_REQUEST', message: '后端请求处理失败' } }, 500), outgoing)
    }
  })
  const port = options.port ?? Number(process.env.BOTC_BACKEND_PORT ?? process.env.PORT ?? 8787)
  const host = options.host ?? process.env.BOTC_BACKEND_HOST ?? '127.0.0.1'
  server.listen(port, host)
  return server
}

export async function closeArchiveRuntime(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function isDirectRun() {
  return Boolean(process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)
}

if (isDirectRun()) {
  const server = startArchiveRuntime()
  server.on('listening', () => {
    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : process.env.BOTC_BACKEND_PORT
    console.log(`BOTC backend listening on http://127.0.0.1:${port}`)
  })
}
