import { afterEach, describe, expect, it, vi } from 'vitest'
import { askRulesAdvisor } from './rulesAdvisorHttp'
const input = { scriptId: 'catfishing', question: '首夜顺序？', history: [] }
const runtime = { mode: 'http' as const, baseUrl: 'http://127.0.0.1:3000', timeoutMs: 8000 }
afterEach(() => vi.unstubAllGlobals())

describe('rules advisor transport', () => {
  it.each([
    [401, { error: { code: 'AI_ACCESS_REQUIRED' } }, '设备验证已到期'],
    [429, {}, '请求太频繁'],
    [502, {}, 'AI 暂时无法回答'],
    [200, { accepted: true, data: { answer: { summary: '<script>bad</script>' } } }, 'AI 暂时无法回答'],
  ])('handles HTTP %s without trusting arbitrary response content', async (status, body, message) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status })))
    await expect(askRulesAdvisor(input, new AbortController().signal, runtime)).rejects.toThrow(message as string)
  })
  it('does not silently fake a local answer', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
    await expect(askRulesAdvisor(input, new AbortController().signal, { ...runtime, mode: 'local' })).rejects.toThrow('需要连接 AI 后端')
    expect(fetcher).not.toHaveBeenCalled()
  })
})
