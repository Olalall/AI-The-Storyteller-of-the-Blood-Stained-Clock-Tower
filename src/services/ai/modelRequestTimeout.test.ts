import { afterEach, expect, it, vi } from 'vitest'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import { nightQualityCases } from './nightSettlementQualityCases.test-support'

afterEach(() => vi.useRealTimers())

it('waits for a valid model response beyond the archive transport budget, then still aborts at the model budget', async () => {
  vi.useFakeTimers()
  const input = nightQualityCases[0].makeInput()
  const fetcher = (_url: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => resolve(new Response(JSON.stringify({ accepted: true, data: { draft: {
      status: 'answer', recommendedOutcomeId: 'correct', missing: [], journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts: [],
    } } }))), 40_000)
    init?.signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
  })
  const pending = createNightResultAdviceAsync(input, { runtimeSettings: { mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 8000 }, fetcher })
  await vi.advanceTimersByTimeAsync(40_000)
  expect((await pending)?.facts.join(' ')).not.toContain('后端夜间建议不可用')
  let aborted = false
  const stalled = createNightResultAdviceAsync(input, {
    runtimeSettings: { mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 8000 },
    fetcher: (_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => {
      aborted = true; reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })),
  })
  await vi.advanceTimersByTimeAsync(99_999)
  expect(aborted).toBe(false)
  await vi.advanceTimersByTimeAsync(1)
  expect(aborted).toBe(true)
  expect((await stalled)?.facts.join(' ')).toContain('后端夜间建议不可用')
})
