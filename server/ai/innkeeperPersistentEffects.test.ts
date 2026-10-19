import { describe, expect, it } from 'vitest'
import { roleKnowledgeForAI } from '../../src/domain/role-knowledge'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider } from './nightSettlementProvider'
import type { NightSettlementProviderRequest } from './types'

function poRequest(order: number[]): NightSettlementProviderRequest {
  const healthy = { life: 'alive', impairments: [], markers: [] }
  const roles: Record<number, string> = { 2: 'innkeeper', 3: 'courtier', 4: 'professor' }
  return {
    scriptId: 'yi-ge-xue-bu', knowledgeVersion: 'persistent-effects-regression', nightRunId: 'innkeeper-po', phaseLabel: '第3夜', playerCount: 12,
    wakeItem: { id: 'po', orderIndex: 1, seatId: 12, playerLabel: '12号', roleId: 'po', roleName: '珀',
      ability: 'Each night*, you may choose a player: they die. If your last choice was no-one, choose 3 players tonight.',
      storytellerPrompt: '逐次核对已确认事实，只给草稿。', targetCount: 3, allowedTargetCounts: [0, 1, 3], status: healthy },
    currentActor: { seatId: 12, playerLabel: '12号', roleId: 'po', roleName: '珀', status: healthy },
    draft: { targets: order, roleChoice: '', outcomeId: '', playerChoice: '', draftRevision: 1,
      storytellerContext: `健康珀12上夜已空刀，本夜按${order.join('→')}攻击。健康旅店2先有效保护3/4并使4醉酒，2没有任何保护。三者原先存活，无其他保护、替死、毒醉或干扰。只核对本次有序攻击及旅店效果。` },
    selectedTargets: order.map((seatId) => ({ seatId, playerLabel: `${seatId}号`, roleId: roles[seatId], roleName: roles[seatId],
      status: { ...healthy, impairments: seatId === 4 ? ['drunk'] : [] }, roleKnowledge: roleKnowledgeForAI(roles[seatId]) })),
    roleKnowledge: roleKnowledgeForAI('po'),
    availableOutcomes: [{ id: 'record', label: '记录已核对结果', ready: true, requiredInputs: [] }],
  }
}

const complete = (stateChangeDrafts: string[], summary: string) => ({ status: 'answer', recommendedOutcomeId: 'record', confidence: 'high', summary,
  missing: [], warnings: [], ruleFacts: [], journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts,
  authorityWarnings: ['只供主持确认的草稿，不自动改变状态。'] })

// Offline semantic oracle only. It never runs in production or changes a model's answer.
function deathErrors(value: ReturnType<typeof complete>, dead: number[], alive: number[]) {
  const errors: string[] = []
  for (const seat of dead) if (!value.stateChangeDrafts.some((line) => new RegExp(`${seat}号[^。；]{0,20}(?<!免于|不会|没有|不能)死亡`).test(line))) errors.push(`${seat}: missing death`)
  for (const seat of alive) if (!value.stateChangeDrafts.some((line) => new RegExp(`${seat}号[^。；]{0,20}(?:存活|未死)`).test(line))) errors.push(`${seat}: missing survival`)
  return errors
}

async function throughProvider(input: NightSettlementProviderRequest, answer: object) {
  const before = structuredClone(input)
  const provider = createOpenAICompatibleNightSettlementProvider({ baseUrl: 'https://offline.example.test/v1', model: 'offline-test', apiKey: 'offline-test-only', timeoutSeconds: 1,
    fetcher: async (_url, init) => {
      const sent = JSON.parse(String(init?.body))
      const prompt = JSON.parse(sent.messages[1].content)
      expect(prompt.input).toEqual(input)
      expect(prompt.constraints).toEqual(expect.arrayContaining([
        expect.stringMatching(/持续保护、毒醉.*来源死亡或换角.*立即结束.*独立来源/),
        expect.stringMatching(/多次攻击.*顺序逐个.*不.*追溯/),
      ]))
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(answer) } }] }), { status: 200 })
    } })
  const result = await provider.generateNightSettlementAdvice(input)
  expect(input).toEqual(before)
  return result.draft
}

describe('Innkeeper persistent effects and bounded local advice', () => {
  it('projects source dependence and ordered attacks within the existing three-reminder limit', () => {
    const knowledge = roleKnowledgeForAI('innkeeper')!
    expect(knowledge.reminders).toHaveLength(3)
    expect(knowledge.requiredContext).toEqual(expect.arrayContaining(['旅店老板是否存活且清醒健康', '有序死亡尝试和来源失效时点']))
    expect(knowledge.reminders.join(' ')).toMatch(/死亡或换角时立即结束.*其他来源醉酒或中毒时暂时失效/)
    expect(knowledge.reminders.join(' ')).toMatch(/先前已被有效保护挡下的攻击不追溯重算/)
    expect(knowledge.reminders.join(' ')).toMatch(/自身被其能力致醉.*仍醉酒至黄昏/)
    expect(knowledge.reminders.join(' ')).not.toMatch(/2号|3号|4号|001/)
    const prompt = JSON.parse(buildNightSettlementProviderMessages(poRequest([2, 3, 4]))[1].content)
    expect(prompt.input.selectedTargets[0].roleKnowledge).toEqual(knowledge)
    expect(prompt.input.selectedTargets[2].status.impairments).toEqual(['drunk'])
  })

  it('retains and rejects the original real 001 order error without rewriting provider output', async () => {
    const input = poRequest([2, 3, 4])
    const old001 = complete([
      '【待确认】2号（旅店老板）：状态变更为死亡。',
      '【待确认】3号（侍臣）：受到袭击但免于死亡，维持存活。',
      '【待确认】4号（教授）：受到袭击但免于死亡，维持存活；其醉酒状态维持至明日黄昏结束。',
    ], '12号珀三杀结算：2号旅店老板无保护死亡；3号侍臣与4号教授受旅店老板保护免于死亡，4号教授的醉酒状态持续至明日黄昏。')
    expect(deathErrors(old001, [2, 3, 4], [])).toEqual(['3: missing death', '4: missing death'])
    const raw = await throughProvider(input, old001)
    expect(raw.summary).toBe(old001.summary)
    expect(raw.stateChangeDrafts).toEqual(old001.stateChangeDrafts)
    expect(deathErrors(raw, [2, 3, 4], [])).not.toEqual([])
    const correct = complete(['2号死亡；旅店保护和其致醉立即结束。', '3号随后死亡。', '4号随后死亡；不再因旅店醉酒。'],
      '第一刀先使保护源死亡，后两刀按已经失去保护的状态核对。')
    expect(deathErrors(await throughProvider(input, correct), [2, 3, 4], [])).toEqual([])
  })

  it('does not retroactively kill targets whose attacks were blocked before their source died', async () => {
    const input = poRequest([3, 4, 2])
    const correct = complete(['3号受有效保护存活。', '4号受有效保护存活。', '2号最后死亡；其保护和致醉此时结束，旧攻击不重算。'],
      '两次攻击发生时旅店仍有能力；保护源最后死亡不追溯造成先前目标死亡。')
    expect(deathErrors(await throughProvider(input, correct), [2], [3, 4])).toEqual([])
    expect(deathErrors(complete(['2号死亡。', '3号追溯死亡。', '4号追溯死亡。'], '保护源后来死亡，所以前两人也死亡。'), [2], [3, 4])).toHaveLength(2)
  })

  it.each(['poisoned', 'drunk'] as const)('carries externally %s source loss without clearing an independent poison', async (impairment) => {
    const input = poRequest([2, 3, 4])
    input.wakeItem = { ...input.wakeItem, seatId: 2, playerLabel: '2号', roleId: 'innkeeper', roleName: '旅店老板', targetCount: 2,
      ability: 'Each night*, choose 2 players: they cannot die tonight, but 1 is drunk until dusk.', status: { life: 'alive', impairments: [impairment], markers: [] } }
    input.currentActor = { ...input.currentActor!, ...input.wakeItem }
    input.roleKnowledge = roleKnowledgeForAI('innkeeper')
    input.draft.targets = [3, 4]
    input.selectedTargets = input.selectedTargets!.filter((t) => t.seatId !== 2).map((t) => t.seatId === 4
      ? { ...t, status: { ...t.status, impairments: ['poisoned'] } } : t)
    input.draft.storytellerContext = `2号先健康有效保护3/4并使4醉酒；此后2号被外来能力${impairment === 'poisoned' ? '中毒' : '醉酒'}，不是自己致醉。本题只核对既有持续效果，无新发动；4还受到另一个仍有效的独立毒源影响。`
    const correct = complete(['旅店保护及其对4的致醉暂时失效。', '4号不再因旅店醉酒，但另一独立毒源仍有效。'], '来源外来失能，不能沿用保护，也不能宣布目标绝对健康。')
    const result = await throughProvider(input, correct)
    expect(result.stateChangeDrafts).toEqual(correct.stateChangeDrafts)
    expect(result.authorityWarnings.join(' ')).toContain(impairment === 'poisoned' ? '中毒' : '醉酒')
  })

  it('keeps protection active when no source-loss event occurred', async () => {
    const input = poRequest([2, 3, 4])
    input.draft.storytellerContext = '健康旅店2已有效保护3/4并使4醉酒。珀本夜按3→4→5攻击，5是无保护镇民。旅店2未被攻击且一直存活健康，无其他干扰。'
    input.draft.targets = [3, 4, 5]
    input.selectedTargets = [...input.selectedTargets!.filter((t) => t.seatId !== 2),
      { seatId: 5, playerLabel: '5号', roleId: 'fisherman', roleName: '渔夫', status: { life: 'alive', impairments: [], markers: [] } }]
    const correct = complete(['3号受有效保护存活。', '4号受有效保护存活；旅店醉酒仍在原持续期内有效。', '5号死亡。'], '没有已确认来源失效事件，不能假设保护失效。')
    expect(deathErrors(await throughProvider(input, correct), [5], [3, 4])).toEqual([])
  })

  it('blocks unprovided named mechanisms in the prompt while preserving the determined local Lleech answer', async () => {
    const input = poRequest([2, 3, 4])
    input.wakeItem = { ...input.wakeItem, roleId: 'lleech', roleName: '痢蛭', targetCount: 1 }
    input.currentActor = { ...input.currentActor!, roleId: 'lleech', roleName: '痢蛭' }
    input.roleKnowledge = roleKnowledgeForAI('lleech')
    input.draft.targets = [2]
    input.draft.storytellerContext = '健康痢蛭12的唯一宿主2已经实际死亡；只核对痢蛭本次生存，不要求全局胜负。'
    input.selectedTargets = [{ seatId: 2, playerLabel: '2号', roleId: 'sailor', roleName: '水手', status: { life: 'dead', impairments: [], markers: [] } }]
    const prompt = JSON.parse(buildNightSettlementProviderMessages(input)[1].content)
    expect(prompt.constraints).toEqual(expect.arrayContaining([
      expect.stringMatching(/不引入输入未提供的具体角色.*不发明角色名/),
      expect.stringMatching(/本项局部后果已确定.*保留局部 answer/),
    ]))
    const correct = complete(['12号因宿主已死而死亡，待主持确认。'], '局部后果已确定，不要求全局条件。')
    correct.authorityWarnings.push('若另需全局判定，再核对已知的其他存续或继任条件。')
    const result = await throughProvider(input, correct)
    expect(result.status).toBe('answer')
    expect(JSON.stringify(result)).not.toMatch(/猩红女巫|红唇女郎/)
    const old003Warning = '请说书人核对场上是否存在其他存活恶魔、继任机制（如红唇女郎、猩红女巫等）。'
    const unsupportedNames = (text: string) => ['红唇女郎', '猩红女巫'].filter((name) => text.includes(name) && !JSON.stringify(input).includes(name))
    expect(unsupportedNames(old003Warning)).toEqual(['红唇女郎', '猩红女巫'])
    expect(unsupportedNames(JSON.stringify(result))).toEqual([])
    expect(JSON.stringify(input)).not.toMatch(/猩红女巫|红唇女郎/)
  })
})
