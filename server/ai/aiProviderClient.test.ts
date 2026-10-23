import { createServer, type Server } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { AIProviderError, callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'

const secret = 'sk-provider-secret-should-not-leak'

function settings(fetcher: FetchLike) {
  return {
    baseUrl: 'https://ai.example.test/v1',
    model: 'review-model',
    apiKey: secret,
    timeoutSeconds: 1,
    fetcher,
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function listen(server: Server) {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Expected a local test server')
  return `http://127.0.0.1:${address.port}`
}

async function close(server: Server) {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
}

describe('OpenAI-compatible provider client', () => {
  it('uses Gemini compatible reasoning and enough output budget for the real truncated JSON regression', async () => {
    const fetcher: FetchLike = async (_url, init) => {
      const body = JSON.parse(String(init?.body))
      expect(body).toMatchObject({ model: 'gemini-test-model', reasoning_effort: 'low', max_tokens: 6000 })
      expect(body).not.toHaveProperty('thinking')
      expect(JSON.stringify(body)).not.toContain(secret)
      return jsonResponse({ choices: [{ message: { content: '{"ok":true}' } }] })
    }
    await expect(callOpenAICompatibleJSON({ ...settings(fetcher), model: 'gemini-test-model' }, [])).resolves.toEqual({ ok: true })
  })
  it('parses a JSON object from a mock chat completion response', async () => {
    const fetcher: FetchLike = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      const requestBody = JSON.parse(String(init?.body)) as { model?: string; thinking?: { type?: string } }
      expect(requestBody.model).toBe('review-model')
      expect(requestBody.thinking).toEqual({ type: 'disabled' })
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
      expect(init?.redirect).toBe('error')
      return jsonResponse({
        choices: [{ message: { content: JSON.stringify({ ok: true, summary: '复盘草稿' }) } }],
      })
    }

    await expect(callOpenAICompatibleJSON<{ ok: boolean }>(settings(fetcher), [
      { role: 'system', content: '只返回 JSON' },
      { role: 'user', content: '生成复盘' },
    ])).resolves.toEqual({ ok: true, summary: '复盘草稿' })
  })

  it('maps 429 to AI_PROVIDER_RATE_LIMITED without leaking the key', async () => {
    const fetcher: FetchLike = async () => jsonResponse({ error: 'too many requests' }, 429)

    await expect(callOpenAICompatibleJSON(settings(fetcher), [])).rejects.toMatchObject({
      code: 'AI_PROVIDER_RATE_LIMITED',
      status: 429,
    })
    await callOpenAICompatibleJSON(settings(fetcher), []).catch((error: unknown) => {
      expect(error).toBeInstanceOf(AIProviderError)
      expect(JSON.stringify(error)).not.toContain(secret)
      expect(error instanceof Error ? error.message : '').not.toContain(secret)
    })
  })

  it('maps aborts to AI_PROVIDER_TIMEOUT', async () => {
    const fetcher: FetchLike = (_input, init) => new Promise((_resolve, reject) => {
      const signal = init?.signal
      if (!signal) return
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    })

    await expect(callOpenAICompatibleJSON({ ...settings(fetcher), timeoutSeconds: 0.001 }, [])).rejects.toMatchObject({
      code: 'AI_PROVIDER_TIMEOUT',
      status: 504,
    })
  })

  it('maps bad provider JSON to AI_PROVIDER_BAD_RESPONSE', async () => {
    const fetcher: FetchLike = async () => jsonResponse({
      choices: [{ message: { content: '{not json' } }],
    })

    await expect(callOpenAICompatibleJSON(settings(fetcher), [])).rejects.toMatchObject({
      code: 'AI_PROVIDER_BAD_RESPONSE',
      status: 502,
    })
  })

  it('keeps a timeout classification when headers arrive before a stalled JSON body', async () => {
    const fetcher: FetchLike = async (_input, init) => new Response(new ReadableStream({
      start(controller) { init?.signal?.addEventListener('abort', () => controller.error(new Error('stream read aborted'))) },
    }))
    await expect(callOpenAICompatibleJSON({ ...settings(fetcher), timeoutSeconds: 0.001 }, [])).rejects.toMatchObject({ code: 'AI_PROVIDER_TIMEOUT', status: 504 })
  })

  it('accepts JSON object content wrapped by provider prose or fences', async () => {
    const fetcher: FetchLike = async () => jsonResponse({
      choices: [{ message: { content: '```json\n{"ok":true,"summary":"wrapped"}\n```' } }],
    })

    await expect(callOpenAICompatibleJSON<{ ok: boolean }>(settings(fetcher), [])).resolves.toEqual({
      ok: true,
      summary: 'wrapped',
    })
  })

  it.each([false, true])('never follows a provider redirect or forwards the credential (cross-origin=%s)', async (crossOrigin) => {
    let captureRequests = 0
    let providerRequests = 0
    const capture = createServer((_request, response) => {
      captureRequests++
      response.end('{}')
    })
    const captureUrl = await listen(capture)
    const provider = createServer((request, response) => {
      if (request.url === '/capture') {
        captureRequests++
        response.end('{}')
        return
      }
      providerRequests++
      response.writeHead(307, { Location: crossOrigin ? `${captureUrl}/capture` : '/capture' })
      response.end()
    })
    const providerUrl = await listen(provider)
    try {
      await expect(callOpenAICompatibleJSON({
        ...settings(fetch), baseUrl: `${providerUrl}/v1`, timeoutSeconds: 3,
      }, [])).rejects.toMatchObject({ code: 'AI_PROVIDER_UNAVAILABLE' })
      expect(providerRequests).toBe(1)
      expect(captureRequests).toBe(0)
    } finally {
      await Promise.all([close(provider), close(capture)])
    }
  })

  it.each([
    () => jsonResponse({ error: secret }, 401),
    () => jsonResponse({ echoedKey: secret, choices: [] }),
    () => jsonResponse({ choices: [{ message: { content: secret } }] }),
  ])('keeps provider response text and echoed credentials out of errors and debug logs', async (response) => {
    vi.stubEnv('BOTC_AI_DEBUG', '1')
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      await callOpenAICompatibleJSON(settings(async () => response()), []).catch((error: unknown) => {
        expect(error).toBeInstanceOf(AIProviderError)
        expect(String(error)).not.toContain(secret)
      })
      expect(warning).toHaveBeenCalled()
      expect(JSON.stringify(warning.mock.calls)).not.toContain(secret)
    } finally {
      vi.unstubAllEnvs()
      warning.mockRestore()
    }
  })
})
