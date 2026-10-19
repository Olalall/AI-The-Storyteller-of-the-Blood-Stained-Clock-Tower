import type { IncomingMessage } from 'node:http'
import { PassThrough } from 'node:stream'
import { describe, expect, it } from 'vitest'
import {
  RequestBodyTooLargeError,
  clientIpFromRequest,
  createRuntimeIpRateLimiter,
  isPublicModeEnabled,
  isRequestBodyTooLargeError,
  readIncomingMessageBody,
  runtimeBodyLimitForPath,
  runtimeBodyLimits,
} from './runtimeSecurity'

type TestIncomingMessage = IncomingMessage & PassThrough

function incomingMessage(options: {
  headers?: Record<string, string>
  remoteAddress?: string
  url?: string
} = {}) {
  const stream = new PassThrough() as TestIncomingMessage
  Object.defineProperties(stream, {
    headers: { configurable: true, value: options.headers ?? {} },
    socket: { configurable: true, value: { remoteAddress: options.remoteAddress } },
    url: { configurable: true, value: options.url ?? '/' },
  })
  return stream
}

describe('runtime public mode', () => {
  it.each(['true', '1'])('only enables for explicit %s', (value) => {
    expect(isPublicModeEnabled(value)).toBe(true)
  })

  it.each([undefined, '', 'false', '0', 'TRUE', ' true', '1 '])('does not enable for %s', (value) => {
    expect(isPublicModeEnabled(value)).toBe(false)
  })
})

describe('runtime request body policy', () => {
  it('limits AI routes to 1 MiB', () => {
    expect(runtimeBodyLimitForPath('/api/settings/ai/live-test')).toBe(runtimeBodyLimits.ai)
    expect(runtimeBodyLimitForPath('/api/ai/setup-advice?source=browser')).toBe(runtimeBodyLimits.ai)
  })

  it('limits archive, recovery, and other API routes to 5 MiB', () => {
    expect(runtimeBodyLimitForPath('/api/archives')).toBe(runtimeBodyLimits.api)
    expect(runtimeBodyLimitForPath('/api/recovery/game-1')).toBe(runtimeBodyLimits.api)
    expect(runtimeBodyLimitForPath('/api/future-route')).toBe(runtimeBodyLimits.api)
  })

  it('does not limit health checks or static files', () => {
    expect(runtimeBodyLimitForPath('/healthz')).toBeNull()
    expect(runtimeBodyLimitForPath('/assets/app.js')).toBeNull()
  })
})

describe('streamed request body reading', () => {
  it('reads legitimate streamed content up to the limit', async () => {
    const request = incomingMessage()
    const result = readIncomingMessageBody(request, 6)
    request.write('abc')
    request.end('def')

    expect(Buffer.from(await result).toString('utf8')).toBe('abcdef')
  })

  it('rejects an oversized declared length as 413 before consuming the stream', async () => {
    const request = incomingMessage({ headers: { 'content-length': '7' } })

    const result = readIncomingMessageBody(request, 6)

    await expect(result).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE', status: 413 })
    expect(request.isPaused()).toBe(true)
  })

  it('does not trust a small Content-Length when streamed bytes exceed the limit', async () => {
    const request = incomingMessage({ headers: { 'content-length': '1' } })
    const result = readIncomingMessageBody(request, 5)
    request.write('abc')
    request.write('def')

    await expect(result).rejects.toBeInstanceOf(RequestBodyTooLargeError)
    expect(request.isPaused()).toBe(true)
  })

  it('exposes a narrow 413 type guard', () => {
    expect(isRequestBodyTooLargeError(new RequestBodyTooLargeError(5, 6))).toBe(true)
    expect(isRequestBodyTooLargeError(new Error('other failure'))).toBe(false)
  })
})

describe('runtime IP rate limiter', () => {
  it('limits AI to 10 requests per minute and resets after the window', () => {
    let currentTime = 1_000
    const limiter = createRuntimeIpRateLimiter({ now: () => currentTime })
    const request = incomingMessage({ remoteAddress: '203.0.113.8' })

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      expect(limiter.check(request, '/api/ai/setup-advice').allowed).toBe(true)
    }
    expect(limiter.check(request, '/api/ai/setup-advice')).toMatchObject({
      applies: true,
      allowed: false,
      limit: 10,
      remaining: 0,
      retryAfterSeconds: 60,
    })

    currentTime += 60_000
    expect(limiter.check(request, '/api/ai/setup-advice')).toMatchObject({ allowed: true, remaining: 9 })
  })

  it('uses a separate 30 request bucket for other API routes', () => {
    const limiter = createRuntimeIpRateLimiter()
    const request = incomingMessage({ remoteAddress: '203.0.113.9' })

    for (let attempt = 1; attempt <= 30; attempt += 1) {
      expect(limiter.check(request, '/api/archives').allowed).toBe(true)
    }
    expect(limiter.check(request, '/api/recovery/game-1').allowed).toBe(false)
    expect(limiter.check(request, '/api/ai/setup-advice').allowed).toBe(true)
  })

  it('does not count health checks or static files', () => {
    const limiter = createRuntimeIpRateLimiter()
    const request = incomingMessage({ remoteAddress: '203.0.113.10' })

    expect(limiter.check(request, '/healthz')).toEqual({ applies: false, allowed: true })
    expect(limiter.check(request, '/assets/app.js')).toEqual({ applies: false, allowed: true })
    expect(limiter.size()).toBe(0)
  })

  it('uses socket.remoteAddress and ignores spoofed forwarding headers', () => {
    const limiter = createRuntimeIpRateLimiter()
    const first = incomingMessage({
      headers: { 'x-forwarded-for': '198.51.100.1' },
      remoteAddress: '203.0.113.11',
    })
    const second = incomingMessage({
      headers: { 'x-forwarded-for': '198.51.100.2' },
      remoteAddress: '203.0.113.11',
    })

    expect(clientIpFromRequest(first)).toBe('203.0.113.11')
    for (let attempt = 1; attempt <= 10; attempt += 1) limiter.check(first, '/api/ai/setup-advice')
    expect(limiter.check(second, '/api/ai/setup-advice').allowed).toBe(false)
  })

  it('caps Map growth by evicting the least recently seen entry', () => {
    let currentTime = 0
    const limiter = createRuntimeIpRateLimiter({ maxEntries: 2, now: () => currentTime })
    const first = incomingMessage({ remoteAddress: '203.0.113.1' })
    const second = incomingMessage({ remoteAddress: '203.0.113.2' })
    const third = incomingMessage({ remoteAddress: '203.0.113.3' })

    limiter.check(first, '/api/archives')
    currentTime += 1
    limiter.check(second, '/api/archives')
    currentTime += 1
    limiter.check(third, '/api/archives')

    expect(limiter.size()).toBe(2)
    expect(limiter.check(first, '/api/archives')).toMatchObject({ allowed: true, remaining: 29 })
  })
})
