import { describe, expect, it } from 'vitest'
import { assertsDawnDeath } from './nightDeathTiming'
import { createOpenAICompatibleNightSettlementProvider } from './nightSettlementProvider'
import { nightSemanticCases } from './nightSettlementSemantics.test-support'

describe('night death timing claim boundary', () => {
  it('adds the trusted action timing to a structured death candidate without applying state', async () => {
    const input = nightSemanticCases.find((item) => item.id === 'imp-timing')!.makeInput()
    const before = JSON.stringify(input)
    const provider = createOpenAICompatibleNightSettlementProvider({
      baseUrl: 'https://ai.example.test/v1', model: 'test-model', apiKey: 'test-secret', timeoutSeconds: 1,
      fetcher: async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
        status: 'answer', recommendedOutcomeId: 'record', summary: '待确认的夜杀候选',
        stateChangeDrafts: [{ text: '将5号标记为死亡', seatId: 5, change: { field: 'life', to: 'dead' } }],
      }) } }] }), { headers: { 'Content-Type': 'application/json' } }),
    })
    const { draft } = await provider.generateNightSettlementAdvice(input)
    expect(draft.status).toBe('answer')
    expect(draft.stateChangeDrafts[0]).toMatchObject({ seatId: 5, change: { field: 'life', to: 'dead' } })
    expect(draft.stateChangeDrafts[0].text).toContain('在本行动时')
    expect(JSON.stringify(input)).toBe(before)
  })
  it.each(['若目标玩家未受到保护，该玩家将在黎明时死亡。', '在黎明结算5号死亡。', '5号的死亡推迟到黎明。', '不要自动改状态，但目标将在黎明死亡。', '不是现在死亡而是黎明时死亡。', 'The player dies at dawn.'])('detects the explicit delayed claim: %s', (text) => {
    expect(assertsDawnDeath(text)).toBe(true)
  })
  it.each(['本夜行动时死亡，不能等到黎明再结算死亡。', '在行动时立即死亡，黎明仅公布死讯。', '本夜实际死亡，黎明只公布死亡信息。', 'Do not defer death until dawn.', '小恶魔选择了5号。'])('keeps a correct timing statement: %s', (text) => {
    expect(assertsDawnDeath(text)).toBe(false)
  })
  it.each(['summary', 'ruleFacts', 'journalDrafts', 'playerMessageDrafts', 'stateChangeDrafts', 'warnings', 'authorityWarnings', 'disclaimer'])('withholds contradictory %s, including when the old client omitted role knowledge', async (field) => {
    const input = nightSemanticCases.find((item) => item.id === 'imp-timing')!.makeInput()
    input.roleKnowledge = undefined
    input.draft.outcomeId = 'record'
    const bad = '若目标玩家未受到保护，该玩家将在黎明时死亡。'
    const provider = createOpenAICompatibleNightSettlementProvider({
      baseUrl: 'https://ai.example.test/v1', model: 'test-model', apiKey: 'test-secret', timeoutSeconds: 1,
      fetcher: async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
        status: 'answer', confidence: 'high', recommendedOutcomeId: 'record', summary: '夜间攻击草稿',
        ruleFacts: [], warnings: [], journalDrafts: ['已选5号'], playerMessageDrafts: ['你已死亡'],
        stateChangeDrafts: ['5号死亡'], authorityWarnings: [],
        [field]: ['summary', 'disclaimer'].includes(field) ? bad : [bad],
      }) } }] }), { headers: { 'Content-Type': 'application/json' } }),
    })
    const { draft, warnings } = await provider.generateNightSettlementAdvice(input)
    expect(draft).toMatchObject({ provider: 'openai-compatible', status: 'needs_input', confidence: 'low', journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts: [] })
    expect(draft.recommendedOutcomeId).toBeUndefined()
    expect(draft.missing.join(' ')).toContain('已拦截')
    expect(draft.ruleFacts.join(' ')).toContain('行动时')
    expect(warnings).toContain('night_death_timing_conflict')
    expect(JSON.stringify(draft)).not.toContain('将在黎明时死亡')
  })
})
