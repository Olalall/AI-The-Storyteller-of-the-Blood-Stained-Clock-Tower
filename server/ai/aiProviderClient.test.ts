import { describe, expect, it } from 'vitest'
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

describe('OpenAI-compatible provider client', () => {
  it('parses a JSON object from a mock chat completion response', async () => {
    const fetcher: FetchLike = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      const requestBody = JSON.parse(String(init?.body)) as { model?: string; thinking?: { type?: string } }
      expect(requestBody.model).toBe('review-model')
      expect(requestBody.thinking).toEqual({ type: 'disabled' })
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
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

  it('accepts JSON object content wrapped by provider prose or fences', async () => {
    const fetcher: FetchLike = async () => jsonResponse({
      choices: [{ message: { content: '```json\n{"ok":true,"summary":"wrapped"}\n```' } }],
    })

    await expect(callOpenAICompatibleJSON<{ ok: boolean }>(settings(fetcher), [])).resolves.toEqual({
      ok: true,
      summary: 'wrapped',
    })
  })
})
