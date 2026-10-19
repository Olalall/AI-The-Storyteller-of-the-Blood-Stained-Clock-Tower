import { describe, expect, it } from 'vitest'
import { smartScriptPacks } from '../../src/domain/scripts/allPacks'
import { isNightSettlementRequest } from './aiRequestValidators'
import { kazaliMinionRoleIds, missingKazaliTargetRoleChoices } from './kazaliTargetRoleChoices'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider, fallbackNightSettlementAdviceDraft } from './nightSettlementProvider'
import type { NightSettlementProviderRequest } from './types'

function input(playerCount = 10): NightSettlementProviderRequest {
  const count = playerCount <= 9 ? 1 : playerCount <= 12 ? 2 : 3
  const targetRoleChoices = ['poisoner', 'spy', 'harpy'].slice(0, count).map((roleId, index) => ({ seatId: index + 1, roleId }))
  return {
    scriptId: 'one-in-one-out', knowledgeVersion: 'kazali-test', nightRunId: 'first-night-test', nightType: 'first', phaseLabel: '第1夜', playerCount,
    wakeItem: { id: 'kazali-first', orderIndex: 1, seatId: playerCount, playerLabel: `${playerCount}号`, roleId: 'kazali', roleName: '卡扎力',
      ability: '每个夜晚*，你要选择一名玩家：他死亡。首个夜晚你要选择玩家和爪牙角色：他们变成这些邪恶爪牙。', storytellerPrompt: '逐项记录玩家和爪牙。',
      targetCount: count, targetRoleChoiceCount: count, targetRoleChoiceRoleIds: [...kazaliMinionRoleIds['one-in-one-out']], status: { life: 'alive', impairments: [], markers: [] } },
    draft: { targets: targetRoleChoices.map(choice => choice.seatId), roleChoice: '', targetRoleChoices, outcomeId: 'record', playerChoice: '待分配', draftRevision: 1 },
    availableOutcomes: [{ id: 'record', label: '记录选择', requiredInputs: ['targets'], ready: true }, { id: 'skip', label: '不发动', requiredInputs: [], ready: true }],
    selectedTargets: targetRoleChoices.map(choice => ({ seatId: choice.seatId, playerLabel: `${choice.seatId}号`, roleId: 'soldier', roleName: '士兵', status: { life: 'alive', impairments: [], markers: [] } })),
  }
}

function rawAnswer() {
  return { status: 'answer', confidence: 'high', recommendedOutcomeId: 'record', missing: [], summary: '配对选择完整，等待主持另行应用身份和阵营。',
    journalDrafts: ['记录卡扎力爪牙配对选择。'], playerMessageDrafts: ['1号变成投毒者；2号变成间谍。'], stateChangeDrafts: ['待主持确认身份与邪恶阵营。'] }
}

describe('Kazali AI paired-choice boundary', () => {
  it('keeps the independent server Minion projection equal to all affected real packs', () => {
    const projection = Object.fromEntries(smartScriptPacks.filter(pack => pack.roles.some(role => role.id === 'kazali'))
      .map(pack => [pack.scriptId, pack.roles.filter(role => role.team === 'minion').map(role => role.id).sort()]))
    expect(projection).toEqual(kazaliMinionRoleIds)
  })

  it.each([7, 9, 10, 12, 13, 15])('accepts the correct initial paired choices for %i players', playerCount => {
    const request = input(playerCount)
    expect(isNightSettlementRequest(request)).toBe(true)
    expect(missingKazaliTargetRoleChoices(request)).toEqual([])
    expect(fallbackNightSettlementAdviceDraft(request)).toMatchObject({ status: 'answer', recommendedOutcomeId: 'record', playerMessageDrafts: [] })
  })

  it.each([
    ['empty', (request: NightSettlementProviderRequest) => { request.draft.targetRoleChoices = [] }],
    ['partial', (request: NightSettlementProviderRequest) => { request.draft.targetRoleChoices![1] = { seatId: 0, roleId: '' } }],
    ['duplicate player', (request: NightSettlementProviderRequest) => { request.draft.targetRoleChoices![1].seatId = 1; request.draft.targets = [1, 1] }],
    ['duplicate role', (request: NightSettlementProviderRequest) => { request.draft.targetRoleChoices![1].roleId = 'poisoner' }],
    ['out of range', (request: NightSettlementProviderRequest) => { request.draft.targetRoleChoices![1].seatId = 11; request.draft.targets[1] = 11 }],
    ['forged non-Minion whitelist', (request: NightSettlementProviderRequest) => { request.wakeItem.targetRoleChoiceRoleIds = ['soldier']; request.draft.targetRoleChoices![1].roleId = 'soldier' }],
    ['off-script Minion', (request: NightSettlementProviderRequest) => { request.draft.targetRoleChoices![1].roleId = 'cerenovus' }],
    ['target drift', (request: NightSettlementProviderRequest) => { request.draft.targets.reverse() }],
    ['other night', (request: NightSettlementProviderRequest) => { request.nightType = 'other' }],
    ['wrong count', (request: NightSettlementProviderRequest) => { request.wakeItem.targetRoleChoiceCount = 1 }],
    ['missing phase', (request: NightSettlementProviderRequest) => { delete request.nightType }],
    ['legacy first-night form', (request: NightSettlementProviderRequest) => { delete request.wakeItem.targetRoleChoiceCount; delete request.draft.targetRoleChoices }],
  ] as const)('does not let ready flags or a model bypass %s', async (_name, mutate) => {
    const request = input(); mutate(request)
    expect(isNightSettlementRequest(request)).toBe(!['duplicate player', 'out of range'].includes(_name))
    const before = structuredClone(request)
    let calls = 0
    const provider = createOpenAICompatibleNightSettlementProvider({ baseUrl: 'https://offline.example.test/v1', apiKey: 'offline-only', model: 'offline-only', timeoutSeconds: 1,
      fetcher: async () => { calls++; return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(rawAnswer()) } }] })) } })
    const { draft } = await provider.generateNightSettlementAdvice(request)
    expect(draft).toMatchObject({ status: 'needs_input', recommendedOutcomeId: undefined, playerMessageDrafts: [], stateChangeDrafts: [] })
    expect(draft.missing.length).toBeGreaterThan(0)
    expect(calls).toBe(0)
    expect(request).toEqual(before)
  })

  it('allows a self choice without inventing an official restriction, but checks Marionette adjacency', () => {
    const self = input(7); self.draft.targetRoleChoices![0].seatId = 7; self.draft.targets = [7]
    expect(missingKazaliTargetRoleChoices(self)).toEqual([])
    const marionette = input(7); marionette.scriptId = 'devout-theists'; marionette.draft.targetRoleChoices = [{ seatId: 1, roleId: 'marionette' }]; marionette.draft.targets = [1]
    expect(missingKazaliTargetRoleChoices(marionette)).toEqual([])
    marionette.draft.targetRoleChoices[0].seatId = 3; marionette.draft.targets = [3]
    expect(missingKazaliTargetRoleChoices(marionette).join(' ')).toContain('相邻')
  })

  it('does not expose a complete assignment table or Marionette identity as a player message', async () => {
    const request = input(7); request.scriptId = 'devout-theists'; request.draft.targetRoleChoices = [{ seatId: 1, roleId: 'marionette' }]; request.draft.targets = [1]
    const before = structuredClone(request)
    const raw = { ...rawAnswer(), playerMessageDrafts: ['你现在是邪恶的提线木偶。'] }
    const provider = createOpenAICompatibleNightSettlementProvider({ baseUrl: 'https://offline.example.test/v1', apiKey: 'offline-only', model: 'offline-only', timeoutSeconds: 1,
      fetcher: async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(raw) } }] })) })
    const { draft } = await provider.generateNightSettlementAdvice(request)
    expect(draft).toMatchObject({ status: 'answer', recommendedOutcomeId: 'record', playerMessageDrafts: [] })
    expect(draft.authorityWarnings.join(' ')).toMatch(/另行应用.*当晚新爪牙夜序.*原技能/)
    expect(request).toEqual(before)
  })

  it('uses server-verified roles and keeps proposed and current roles distinct in the actual prompt', () => {
    const request = input()
    request.wakeItem.targetRoleChoiceRoleIds = ['soldier']
    const prompt = JSON.parse(buildNightSettlementProviderMessages(request)[1].content)
    expect(prompt.verifiedTargetRoleChoiceRoleIds).toEqual(kazaliMinionRoleIds['one-in-one-out'])
    expect(prompt.input.selectedTargets[0].roleId).toBe('soldier')
    expect(prompt.input.draft.targetRoleChoices[0].roleId).toBe('poisoner')
    expect(prompt.constraints).toEqual(expect.arrayContaining([
      expect.stringMatching(/7–9 人为 1 组.*10–12 人为 2 组.*13–15 人为 3 组/),
      expect.stringMatching(/拟分配清单.*当前的真实原角色.*当晚正确时点行动/),
      expect.stringMatching(/playerMessageDrafts 必须为空.*提线木偶.*中途创造卡扎力/),
      expect.stringMatching(/卡扎力本人当然知道.*不得据此声称严禁.*暗中替选/),
      expect.stringMatching(/不等于木偶永不唤醒.*酒鬼.*真正的原角色能力不产生效果/),
    ]))
  })

  it('keeps ordinary later-night and legacy requests compatible, but rejects malformed paired data', () => {
    const request = input(); delete request.nightType; delete request.wakeItem.targetRoleChoiceCount; delete request.wakeItem.targetRoleChoiceRoleIds; delete request.draft.targetRoleChoices
    expect(isNightSettlementRequest(request)).toBe(true)
    expect(missingKazaliTargetRoleChoices(request).join(' ')).toContain('刷新')
    request.nightType = 'first'
    expect(missingKazaliTargetRoleChoices(request).join(' ')).toContain('旧表单')
    request.nightType = 'other'
    expect(missingKazaliTargetRoleChoices(request)).toEqual([])
    delete request.nightType; request.wakeItem.roleId = 'cerenovus'
    expect(missingKazaliTargetRoleChoices(request)).toEqual([])
    for (const targetRoleChoices of [null, {}, ['poisoner'], [{ seatId: -1, roleId: 'spy' }], [{ seatId: 1.5, roleId: 'spy' }], [{ seatId: 1, roleId: 'x'.repeat(101) }], Array(4).fill({ seatId: 1, roleId: 'spy' })]) {
      expect(isNightSettlementRequest({ ...request, draft: { ...request.draft, targetRoleChoices } })).toBe(false)
    }
    expect(isNightSettlementRequest({ ...request, nightType: 'unknown' })).toBe(false)
  })
})
