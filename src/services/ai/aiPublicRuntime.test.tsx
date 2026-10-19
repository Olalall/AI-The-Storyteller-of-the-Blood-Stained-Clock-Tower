// @vitest-environment-options {"url":"https://botc.example.test/"}
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AISettingsSheet } from '../../features/ai-settings/AISettingsSheet'
import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { catfishingPrototypeSeatProfiles } from '../../features/setup'
import { archiveRuntimeSettingsStorageKey, readArchiveRuntimeSettings, saveArchiveRuntimeSettings } from '../archive/archiveRuntimeSettings'
import { generateSetupCandidates } from './aiService'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import { createSetupAdviceDraftAsync } from './setupAdviceHttp'

vi.mock('../../features/ai-settings/AssetPackSettingsSection', () => ({ AssetPackSettingsSection: () => <section>角色图标</section> }))

describe('public AI callers on the actual page origin', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('shows the fixed server access form on a fresh device, without seeding or changing archive storage', async () => {
    const fetcher = vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      settings: { mode: 'backend_proxy', provider: 'openai-compatible', baseUrl: 'https://provider.example.test/v1', model: 'fixed-server-model', apiKeyConfigured: true },
      access: { required: true, authorized: false },
    })))
    render(<AISettingsSheet />)
    fireEvent.click(screen.getByRole('button', { name: '打开AI API设置' }))
    await screen.findByRole('heading', { name: 'fixed-server-model' })
    expect(screen.getByLabelText('AI 访问口令', { exact: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '后端代理' })).toBeInTheDocument()
    expect(fetcher).toHaveBeenCalledExactlyOnceWith('https://botc.example.test/api/settings/ai', expect.any(Object))
    expect(localStorage.getItem(archiveRuntimeSettingsStorageKey)).toBeNull()
    expect(readArchiveRuntimeSettings().mode).toBe('local')
  })

  it.each(['local', 'http'] as const)('sends setup and night requests to this website despite an old %s archive setting', async (mode) => {
    saveArchiveRuntimeSettings({ mode, baseUrl: 'https://archive.example.test', timeoutMs: 8000 })
    localStorage.setItem('botc-copilot-session-v1', 'old-game')
    const before = JSON.stringify(localStorage)
    const fetcher = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify({ accepted: true, data: { draft: {
      provider: 'openai-compatible', draftOnly: true, status: 'needs_input', summary: '请核对信息。', missing: ['主持补充事实'],
      recommendedCandidateIds: [],
    } } })))
    const candidates = generateSetupCandidates({ scriptId: 'catfishing', seatProfiles: catfishingPrototypeSeatProfiles })
    const setup = { scriptId: 'catfishing', scriptName: 'Catfishing', knowledgeVersion: 'test-v1', playerCount: 12, candidates, seats: [] }
    await createSetupAdviceDraftAsync(setup, { fetcher })
    const item = initialNightWorkbenchState.queue.find(entry => entry.id === 'night-3-cerenovus')!
    const night = { state: initialNightWorkbenchState, item, draft: { ...emptyWakeDraft(), targets: [3], roleChoice: 'investigator' } }
    const nightBefore = JSON.stringify(night)
    await createNightResultAdviceAsync(night, { fetcher })
    expect(fetcher.mock.calls.map(call => String(call[0]))).toEqual([
      'https://botc.example.test/api/ai/setup-advice', 'https://botc.example.test/api/ai/night-settlement-advice',
    ])
    expect(JSON.stringify(localStorage)).toBe(before)
    expect(JSON.stringify(night)).toBe(nightBefore)
  })
})
