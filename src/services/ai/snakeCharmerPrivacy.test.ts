// Copy to src/services/ai/snakeCharmerPrivacy.test.ts; imports below target that location.
import { beforeAll, describe, expect, it } from 'vitest'
import { roleResearchForAI, smartScriptPacks, smartScriptRegistry } from '../../domain/scripts'
import { paXingDuShiSmartScriptPack } from '../../domain/scripts/packs/pa-xing-du-shi'
import { roleKnowledgeForAI } from '../../domain/role-knowledge'
import { cardinalitySession } from '../../features/night-workbench/state/nightCardinality.test-support'
import { projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { buildNightSettlementRequest } from './contextBuilder'
import { captureNightQualityRequest } from './nightSettlementQualityCases.test-support'
import { buildNightSettlementProviderMessages } from '../../../server/ai/nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider } from '../../../server/ai/nightSettlementProvider'
import type { NightSettlementProviderRequest } from '../../../server/ai/types'

beforeAll(() => {
  if (!smartScriptRegistry.get('pa-xing-du-shi')) smartScriptRegistry.register(paXingDuShiSmartScriptPack)
})

function actualCrawlingCityInput() {
  const state = projected(cardinalitySession('pa-xing-du-shi', 'snakecharmer', 12, true))
  const item = state.queue.find(entry => entry.id === state.activeCursorId)!
  const demon = Object.values(state.seatSnapshots).find(seat => seat.role?.id === 'alhadikhia')!
  expect(item.roleId).toBe('snakecharmer')
  expect(demon).toBeDefined()
  return { state, item, draft: { ...emptyWakeDraft(), targets: [demon.seatId], draftRevision: 1,
    storytellerContext: '主持已核实发动者健康清醒且善良，目标是存活、邪恶的真实哈迪寂亚。双方当前阵营已核实，无保护、替死、登记或其他干扰。只给本次交换草稿及分别私密告知，不自动执行。' } }
}

// Offline, independent privacy oracle. It does not filter or repair production output.
function playerPoisonLeaks(value: { playerMessageDrafts?: readonly string[] }) {
  return (value.playerMessageDrafts ?? []).filter(line => /中毒|醉酒|poison(?:ed)?|drunk/i.test(line))
}

function answer(input: NightSettlementProviderRequest, playerMessageDrafts: string[]) {
  return { status: 'answer', confidence: 'high', recommendedOutcomeId: input.availableOutcomes.find(outcome => outcome.ready)!.id,
    summary: '命中真实恶魔，交换角色及双方已核实的当前阵营，所有变更待主持确认。',
    missing: [], warnings: [], ruleFacts: ['原恶魔成为中毒舞蛇人；毒只供主持核对。'],
    journalDrafts: ['舞蛇人命中真实恶魔，交换角色与当前阵营。'], playerMessageDrafts,
    stateChangeDrafts: ['原恶魔成为新舞蛇人并中毒，原舞蛇人成为新哈迪寂亚；按已核实的双方当前阵营交换。'],
    authorityWarnings: ['新舞蛇人的中毒仅供主持核对，不告知玩家；状态由主持另行确认。'] }
}

async function throughProvider(input: NightSettlementProviderRequest, raw: ReturnType<typeof answer>) {
  const before = structuredClone(input)
  const provider = createOpenAICompatibleNightSettlementProvider({
    baseUrl: 'https://offline.example.test/v1', model: 'offline-test', apiKey: 'offline-test-only', timeoutSeconds: 1,
    fetcher: async (_url, init) => {
      const sent = JSON.parse(String(init?.body))
      const prompt = JSON.parse(sent.messages[1].content)
      expect(prompt.input).toEqual(input)
      expect(prompt.constraints).toEqual(expect.arrayContaining([expect.stringMatching(/玩家稿不能泄露.*毒醉/)]))
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(raw) } }] }), { status: 200 })
    },
  })
  const result = await provider.generateNightSettlementAdvice(input)
  expect(input).toEqual(before)
  return result.draft
}

describe('actual Crawling City Snake Charmer private copy', () => {
  it('does not expose poison in Snake Charmer player templates across registered packs', () => {
    const affected = smartScriptPacks.filter(pack => pack.roles.some(role => role.id.replaceAll('_', '') === 'snakecharmer'))
    expect(affected.length).toBeGreaterThan(0)
    const leaks = affected.flatMap(pack => {
      const role = pack.roles.find(entry => entry.id.replaceAll('_', '') === 'snakecharmer')!
      return (role.research?.playerMessageTemplates ?? []).filter(line => /中毒|醉酒|poison(?:ed)?|drunk/i.test(line)).map(line => ({ scriptId: pack.scriptId, line }))
    })
    expect(leaks).toEqual([])
  })

  it('keeps poison out of actual 830 request templates while retaining the host-only poison rule', async () => {
    const input = actualCrawlingCityInput(), before = structuredClone(input)
    const context = buildNightSettlementRequest(input).context
    const request = await captureNightQualityRequest(input)
    expect(context.roleResearch).toEqual(roleResearchForAI('pa-xing-du-shi', 'snakecharmer'))
    expect(request.roleResearch).toEqual(context.roleResearch)
    expect(request.roleResearch?.playerMessageTemplates.length).toBeGreaterThan(0)
    expect(request.roleResearch?.playerMessageTemplates.join(' ')).not.toMatch(/中毒|醉酒|poison(?:ed)?|drunk/i)
    expect(request.roleKnowledge).toEqual(roleKnowledgeForAI('snakecharmer'))
    expect(request.roleKnowledge?.reminders.join(' ')).toContain('新舞蛇人的中毒是主持专用事实，不在玩家稿中泄露')
    const prompt = JSON.parse(buildNightSettlementProviderMessages(request)[1].content)
    expect(prompt.input.roleResearch).toEqual(request.roleResearch)
    expect(prompt.input.roleKnowledge).toEqual(request.roleKnowledge)
    expect(input).toEqual(before)
  })

  it('preserves correct private role/alignment messages and host-only poison through the production provider', async () => {
    const input = await captureNightQualityRequest(actualCrawlingCityInput())
    const raw = answer(input, ['你现在是哈迪寂亚，你属于邪恶阵营。', '你现在是舞蛇人，你属于善良阵营。'])
    expect(playerPoisonLeaks(raw)).toEqual([])
    const normalized = await throughProvider(input, raw)
    expect(normalized.status).toBe('answer')
    expect(normalized.playerMessageDrafts).toEqual(raw.playerMessageDrafts)
    expect(playerPoisonLeaks(normalized)).toEqual([])
    expect(normalized.stateChangeDrafts.map(draft => draft.text)).toEqual(raw.stateChangeDrafts)
    expect(normalized.stateChangeDrafts.map(draft => draft.text).join(' ')).toContain('中毒')
  })

  it('retains the old research-template leak as a rejected raw and normalized negative example', async () => {
    const input = await captureNightQualityRequest(actualCrawlingCityInput())
    const oldTemplate = '你变成了新的舞蛇人，并处于中毒状态。'
    const raw = answer(input, ['你现在是哈迪寂亚，你属于邪恶阵营。', oldTemplate])
    expect(playerPoisonLeaks(raw)).toEqual([oldTemplate])
    const normalized = await throughProvider(input, raw)
    expect(normalized.playerMessageDrafts).toEqual(raw.playerMessageDrafts)
    expect(playerPoisonLeaks(normalized)).toEqual([oldTemplate])
    expect(normalized.stateChangeDrafts.map(draft => draft.text)).toEqual(raw.stateChangeDrafts)
  })
})
