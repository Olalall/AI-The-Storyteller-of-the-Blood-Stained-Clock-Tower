import type { IncomingMessage } from 'node:http'

const MEBIBYTE = 1024 * 1024

export const runtimeBodyLimits = {
  ai: MEBIBYTE,
  api: 5 * MEBIBYTE,
} as const

export const runtimeRateLimits = {
  ai: 10,
  api: 30,
  windowMs: 60_000,
} as const

type LimitedRequestKind = 'ai' | 'api'

export function isPublicModeEnabled(value: string | undefined) {
  return value === 'true' || value === '1'
}

function limitedRequestKind(pathname: string): LimitedRequestKind | null {
  const path = pathname.split('?', 1)[0]
  if (path === '/api/settings/ai' || path.startsWith('/api/settings/ai/')) return 'ai'
  if (path === '/api/ai' || path.startsWith('/api/ai/')) return 'ai'
  if (path === '/api' || path.startsWith('/api/')) return 'api'
  return null
}

export function runtimeBodyLimitForPath(pathname: string) {
  const kind = limitedRequestKind(pathname)
  return kind ? runtimeBodyLimits[kind] : null
}

export class RequestBodyTooLargeError extends Error {
  readonly code = 'PAYLOAD_TOO_LARGE'
  readonly status = 413
  readonly limitBytes: number
  readonly receivedBytes: number

  constructor(limitBytes: number, receivedBytes: number) {
    super(`请求体超过 ${limitBytes} 字节限制`)
    this.name = 'RequestBodyTooLargeError'
    this.limitBytes = limitBytes
    this.receivedBytes = receivedBytes
  }
}

export function isRequestBodyTooLargeError(error: unknown): error is RequestBodyTooLargeError {
  return error instanceof RequestBodyTooLargeError
}

function declaredContentLength(request: IncomingMessage) {
  const rawValue = request.headers['content-length']
  if (typeof rawValue !== 'string' || !/^\d+$/.test(rawValue)) return null
  const value = Number(rawValue)
  return Number.isSafeInteger(value) ? value : null
}

export async function readIncomingMessageBody(request: IncomingMessage, limitBytes: number) {
  if (!Number.isSafeInteger(limitBytes) || limitBytes < 0) {
    throw new RangeError('请求体限制必须是非负安全整数')
  }

  const declaredBytes = declaredContentLength(request)
  if (declaredBytes !== null && declaredBytes > limitBytes) {
    request.pause()
    throw new RequestBodyTooLargeError(limitBytes, declaredBytes)
  }

  return await new Promise<Uint8Array>((resolve, reject) => {
    const chunks: Buffer[] = []
    let receivedBytes = 0
    let settled = false

    const cleanup = () => {
      request.off('data', onData)
      request.off('end', onEnd)
      request.off('aborted', onAborted)
      request.off('error', onError)
    }

    const settleWithError = (error: Error) => {
      if (settled) return
      settled = true
      cleanup()
      request.pause()
      reject(error)
    }

    const onData = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      receivedBytes += buffer.byteLength
      if (receivedBytes > limitBytes) {
        settleWithError(new RequestBodyTooLargeError(limitBytes, receivedBytes))
        return
      }
      chunks.push(buffer)
    }

    const onEnd = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve(Buffer.concat(chunks, receivedBytes))
    }

    const onAborted = () => settleWithError(new Error('请求体在读取完成前中止'))
    const onError = (error: Error) => settleWithError(error)

    request.on('data', onData)
    request.on('end', onEnd)
    request.on('aborted', onAborted)
    request.on('error', onError)
  })
}

export function clientIpFromRequest(request: IncomingMessage) {
  return request.socket.remoteAddress ?? 'unknown'
}

export interface RuntimeRateLimitResult {
  applies: boolean
  allowed: boolean
  clientIp?: string
  limit?: number
  remaining?: number
  retryAfterSeconds?: number
}

interface RateLimitEntry {
  count: number
  lastSeen: number
  windowStartedAt: number
}

export interface RuntimeIpRateLimiterOptions {
  now?: () => number
  maxEntries?: number
}

export function createRuntimeIpRateLimiter(options: RuntimeIpRateLimiterOptions = {}) {
  const now = options.now ?? Date.now
  const maxEntries = options.maxEntries ?? 10_000
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1) {
    throw new RangeError('限流器最大条目数必须是正安全整数')
  }

  const entries = new Map<string, RateLimitEntry>()

  const removeExpiredEntries = (currentTime: number) => {
    for (const [key, entry] of entries) {
      if (currentTime - entry.windowStartedAt >= runtimeRateLimits.windowMs) entries.delete(key)
    }
  }

  const makeRoomForEntry = (currentTime: number) => {
    if (entries.size < maxEntries) return
    removeExpiredEntries(currentTime)
    if (entries.size < maxEntries) return

    let oldestKey: string | undefined
    let oldestSeenAt = Number.POSITIVE_INFINITY
    for (const [key, entry] of entries) {
      if (entry.lastSeen < oldestSeenAt) {
        oldestKey = key
        oldestSeenAt = entry.lastSeen
      }
    }
    if (oldestKey !== undefined) entries.delete(oldestKey)
  }

  return {
    check(request: IncomingMessage, pathname = request.url ?? '/'): RuntimeRateLimitResult {
      const kind = limitedRequestKind(pathname)
      if (!kind) return { applies: false, allowed: true }

      const currentTime = now()
      const clientIp = clientIpFromRequest(request)
      const key = `${kind}:${clientIp}`
      const limit = runtimeRateLimits[kind]
      let entry = entries.get(key)

      if (!entry || currentTime - entry.windowStartedAt >= runtimeRateLimits.windowMs) {
        if (!entry) makeRoomForEntry(currentTime)
        entry = { count: 0, lastSeen: currentTime, windowStartedAt: currentTime }
        entries.set(key, entry)
      }

      entry.count += 1
      entry.lastSeen = currentTime
      const allowed = entry.count <= limit
      return {
        applies: true,
        allowed,
        clientIp,
        limit,
        remaining: Math.max(0, limit - entry.count),
        retryAfterSeconds: allowed
          ? 0
          : Math.max(1, Math.ceil((runtimeRateLimits.windowMs - (currentTime - entry.windowStartedAt)) / 1000)),
      }
    },

    clear() {
      entries.clear()
    },

    size() {
      return entries.size
    },
  }
}
