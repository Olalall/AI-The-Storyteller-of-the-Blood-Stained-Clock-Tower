import { describe, expect, it } from 'vitest'
import type { FetchLike } from './aiProviderClient'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider, fallbackNightSettlementAdviceDraft } from './nightSettlementProvider'
import type { NightSettlementProviderRequest } from './types'

const secret = 'sk-night-provider-secret'

function nightInput(): NightSettlementProviderRequest {
  return {
    scriptId: 'catfishing',
    knowledgeVersion: 'catfishing/test-v1',
    nightRunId: 'night-test',
    phaseLabel: '第3夜',
    playerCount: 12,
    wakeItem: {
      id: 'night-3-cerenovus',
      orderIndex: 4,
      seatId: 10,
      playerLabel: '10号玩家',
      roleId: 'cerenovus',
      roleName: '洗脑师',
      ability: '每夜选择一名玩家和一个善良角色；该玩家明天需疯狂地声称自己是该角色。',
      storytellerPrompt: '记录目标玩家明天要声称的善良角色。',
      targetCount: 1,
      targetLabel: '玩家',
      roleLabel: '声称角色',
    },
    draft: {
      targets: [3],
      roleChoice: 'investigator',
      outcomeId: '',
      playerChoice: '选择3号 · 声称角色：调查员',
      draftRevision: 2,
    },
    availableOutcomes: [
      { id: 'applied', label: '受到影响', ready: true, requiredInputs: ['targets', 'role'] },
      { id: 'no-effect', label: '未受影响', ready: true, requiredInputs: ['targets', 'role'] },
      { id: 'blocked', label: '缺输入', ready: false, requiredInputs: ['targets'] },
    ],
    selectedTargets: [
      {
        seatId: 3,
        playerLabel: '3号玩家',
        roleId: 'investigator',
        roleName: '调查员',
        status: { life: 'alive', impairments: [], markers: [] },
      },
    ],
    statusFacts: [
      '发动者：10号洗脑师，状态：存活',
      '目标：3号调查员，状态：存活',
    ],
    roleKnowledge: {
      roleId: 'cerenovus',
      title: '洗脑师',
      riskTags: ['madness', 'death', 'discretion'],
      requiredContext: ['被洗脑玩家', '善良角色'],
      reminders: ['玩家明天需疯狂证明自己是指定善良角色。', '处决是说书人裁量。'],
      aiCannot: ['自动处决', '判断玩家是否足够疯狂'],
    },
    roleResearch: {
      roleId: 'cerenovus',
      name: '洗脑师',
      officialName: 'Cerenovus',
      knowledgeStatus: 'confirmed',
      inputKinds: ['player', 'role'],
      setupImpact: [],
      possibleOutcomes: ['Target is made mad as the chosen good character.'],
      stateChanges: [],
      identityChanges: [],
      teamChanges: [],
      playerMessageTemplates: ['You are mad as {role}.'],
      highRiskNotes: ['Do not auto-judge whether madness was broken.'],
      sourceUrls: ['https://release.botc.app/resources/data/roles.json'],
      reviewedAt: '2026-07-19',
    },
  }
}

function response(content: unknown) {
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(content) } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

describe('night settlement provider', () => {
  it('builds a minimal current-item prompt only', () => {
    const messages = buildNightSettlementProviderMessages(nightInput())
    const serialized = JSON.stringify(messages)

    expect(serialized).toContain('draft_night_settlement_advice')
    expect(serialized).toContain('journalDrafts')
    expect(serialized).toContain('playerMessageDrafts')
    expect(serialized).toContain('stateChangeDrafts')
    expect(serialized).toContain('authorityWarnings')
    expect(serialized).toContain('night-3-cerenovus')
    expect(serialized).toContain('处决是说书人裁量')
    expect(serialized).toContain('Do not auto-judge')
    expect(serialized).toContain('statusFacts')
    expect(serialized).toContain('发动者：10号洗脑师')
    expect(serialized).toContain('3号玩家')
    expect(serialized).not.toContain('"timeline"')
    expect(serialized).not.toContain('"confirmedRecords"')
    expect(serialized).not.toContain('BOTC_AI_API_KEY')
  })

  it('generates a draft through mock fetch and filters non-ready outcomes', async () => {
    const fetcher: FetchLike = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      expect(String(init?.body)).not.toContain(secret)
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
      return response({
        status: 'answer',
        confidence: 'medium',
        recommendedOutcomeId: 'blocked',
        summary: '不应采用未就绪结果。',
        ruleFacts: ['AI 不改状态。'],
        missing: [],
        warnings: [],
        disclaimer: 'AI 只给夜间草稿。',
      })
    }

    const provider = createOpenAICompatibleNightSettlementProvider({
      baseUrl: 'https://ai.example.test/v1',
      model: 'night-model',
      apiKey: secret,
      timeoutSeconds: 1,
      fetcher,
    })
    const result = await provider.generateNightSettlementAdvice(nightInput())

    expect(result.draft.provider).toBe('openai-compatible')
    expect(result.draft.draftOnly).toBe(true)
    expect(result.draft.status).toBe('needs_input')
    expect(result.draft.recommendedOutcomeId).toBeUndefined()
    expect(JSON.stringify(result)).not.toContain(secret)
    expect(result.draft.authorityWarnings).toContain('\u786e\u8ba4\u672c\u9879\u524d\u4e0d\u5199\u65e5\u5fd7\u3001\u4e0d\u6539\u72b6\u6001\u3002')
  })

  it('falls back to a ready local outcome without writing authority', () => {
    const draft = fallbackNightSettlementAdviceDraft(nightInput())

    expect(draft.provider).toBe('fake')
    expect(draft.status).toBe('answer')
    expect(draft.recommendedOutcomeId).toBe('applied')
    expect(draft.ruleFacts.join(' ')).toContain('自动处决')
    expect(draft.ruleFacts.join(' ')).toContain('发动者：10号洗脑师')
    expect(draft.disclaimer).toContain('说书人确认')
  })

  it('adds deterministic warnings when the acting role is impaired', async () => {
    const input = nightInput()
    input.wakeItem.status = {
      life: 'alive',
      impairments: ['poisoned', 'drunk'],
      markers: [],
    }
    const fetcher: FetchLike = async () => response({
      status: 'answer',
      confidence: 'medium',
      recommendedOutcomeId: 'applied',
      summary: '可先作为草稿采用。',
      ruleFacts: [],
      missing: [],
      warnings: ['模型提醒：核对疯狂裁量。'],
      authorityWarnings: [],
      disclaimer: 'AI 只给草稿。',
    })

    const provider = createOpenAICompatibleNightSettlementProvider({
      baseUrl: 'https://ai.example.test/v1',
      model: 'night-model',
      apiKey: secret,
      timeoutSeconds: 1,
      fetcher,
    })
    const result = await provider.generateNightSettlementAdvice(input)

    expect(result.draft.status).toBe('answer')
    expect(result.draft.warnings.join(' ')).toContain('当前中毒')
    expect(result.draft.warnings.join(' ')).toContain('当前醉酒')
    expect(result.draft.warnings.join(' ')).toContain('模型提醒')
    expect(result.draft.authorityWarnings.join(' ')).toContain('当前中毒')
    expect(result.draft.authorityWarnings.join(' ')).toContain('当前醉酒')
  })
})
