import { describe, expect, it } from 'vitest'
import { roleKnowledgeForAI } from '../../src/domain/role-knowledge'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider } from './nightSettlementProvider'
import type { NightSettlementProviderRequest } from './types'

const healthy = { life: 'alive', impairments: [], markers: [] }
const complete = (summary: string, ruleFacts: string[], stateChangeDrafts: string[]) => ({
  status: 'answer', confidence: 'high', recommendedOutcomeId: 'record', summary, ruleFacts,
  missing: [], warnings: [], journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts,
  authorityWarnings: ['只给草稿，身份和胜负均由主持单独确认。'],
})

// Exact real 001 ruleFacts are retained: its local Fang Gu outcome was correct, but this general rule was not.
const raw001 = {
  status: 'answer', confidence: 'high', recommendedOutcomeId: 'record',
  summary: '12号健康方古命中健康存活外来者（2号理发师），首次转化条件已满足：2号变成邪恶方古存活，12号（旧方古）替代死亡。由于2号理发师未死亡（仅身份转变），不触发理发师亡语换角；红唇女郎在方古死亡时场上已有新方古在场，故不触发红唇女郎继任恶魔。',
  ruleFacts: [
    '方古首次击杀外来者时，该外来者不死亡，而是变为邪恶方古，原方古替代死亡。',
    '理发师能力触发条件为其死亡；由于2号理发师转变为方古且存活，理发师能力今晚不触发。',
    '红唇女郎仅在恶魔死亡且场上没有其他活着的恶魔时变为该恶魔；方古跳跃结算中，新方古已产生并存活，恶魔阵营存续，红唇女郎不会变成恶魔。',
  ],
  missing: [], warnings: [],
  journalDrafts: ['12号方古选择2号理发师，触发首次外来者转化：2号变为邪恶方古且存活，12号死亡。'],
  playerMessageDrafts: ['你是方古，你属于邪恶阵营。'],
  stateChangeDrafts: ['待确认角色与阵营变更：2号由理发师变为邪恶方古（阵营变为邪恶）。', '待确认死亡结算：12号（旧方古）死亡（失去原恶魔能力）。'],
  authorityWarnings: ['角色、阵营和死亡变化均需说书人单独在魔典中执行确认，本草稿不自动生效。', '请单独私下通知2号其新角色为方古且阵营变为邪恶；注意核对不要触发2号理发师能力或红唇女郎变身。'],
  disclaimer: '建议仅供线下说书人参考，所有角色、阵营及生死状态变更须由说书人核实并手动执行。',
}

// Exact raw 010: local jinx outcome was corrected, but authorityWarnings leaked unsupported colleague information.
const raw010 = {
  "status": "answer",
  "confidence": "high",
  "recommendedOutcomeId": "record",
  "summary": "12号方古健康命中首个存活外来者（2号理发师），成功触发方古跳转：12号（旧方古）替代死亡，2号（理发师）不死亡且转变为邪恶方古。因转化产生新存活方古，红唇女郎不触发继承保持原角色；理发师未死亡故不触发理发师换人能力。",
  "ruleFacts": [
    "方古整局首次有效杀死外来者时，该外来者不死亡并变成邪恶的方古，改为方古自身死亡。",
    "红唇女郎与方古相克规则：当方古成功跳转产生新恶魔时，红唇女郎不变成恶魔，保持红唇女郎身份。",
    "理发师能力触发条件为理发师死亡；本次理发师并未死亡（由方古替代死亡），因此不触发理发师的换人能力。"
  ],
  "missing": [],
  "warnings": [
    "2号理发师因方古跳转未死亡，理发师能力不触发，今晚恶魔没有理发师换人唤醒。",
    "红唇女郎因场上存在新存活方古（2号），受相克规则约束保持红唇女郎身份。"
  ],
  "journalDrafts": [
    "12号方古选择2号（理发师），触发方古首次外来者跳转：12号死亡，2号转变为邪恶方古。"
  ],
  "playerMessageDrafts": [
    "你是方古，你现在属于邪恶阵营。"
  ],
  "stateChangeDrafts": [
    "12号玩家状态标记为死亡（待说书人确认执行）。",
    "2号玩家真实角色变更为方古，阵营变更为邪恶（待说书人确认执行）。"
  ],
  "authorityWarnings": [
    "角色转变、阵营转变及玩家死亡均需说书人手动确认并执行，草稿不自动生效。",
    "请说书人在夜间适当时机唤醒2号，告知其新角色（方古）与新阵营（邪恶），并告知其同伴恶魔/爪牙信息（按规则流程）。"
  ],
  "disclaimer": "本建议仅供说书人参考，实际死亡、身份与阵营变更须由说书人确认执行。"
}

function fangGuRequest(): NightSettlementProviderRequest {
  return {
    scriptId: 'jiu-ri-shu-shi', knowledgeVersion: 'scarlet-jinx-scope-regression', nightRunId: 'fang-gu-first-transfer', phaseLabel: '第3夜', playerCount: 12,
    wakeItem: { id: 'fang-gu', orderIndex: 1, seatId: 12, playerLabel: '12号', roleId: 'fanggu', roleName: '方古', targetCount: 1,
      ability: 'Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]', status: healthy },
    currentActor: { seatId: 12, playerLabel: '12号', roleId: 'fanggu', roleName: '方古', status: healthy },
    draft: { targets: [2], roleChoice: '', outcomeId: '', playerChoice: '', draftRevision: 1,
      storytellerContext: '健康方古12首次有效命中真实外来者理发师2，首次转化成功；2变邪恶方古存活、12死亡。红唇存活清醒健康，旧方古死亡前至少5名非旅行者存活。主持已确认本局适用方古/红唇相克，无其他干扰。' },
    selectedTargets: [{ seatId: 2, playerLabel: '2号', roleId: 'barber', roleName: '理发师', status: healthy, roleKnowledge: roleKnowledgeForAI('barber') }],
    roleKnowledge: roleKnowledgeForAI('fanggu'),
    availableOutcomes: [{ id: 'record', label: '记录核对后的草稿', ready: true, requiredInputs: [] }],
  }
}

function ordinaryMultiDemonRequest(beforeNonTravellers = 5): NightSettlementProviderRequest {
  return {
    scriptId: 'jiu-ri-shu-shi', knowledgeVersion: 'scarlet-jinx-scope-regression', nightRunId: 'ordinary-two-demons', phaseLabel: '第3夜', playerCount: 7,
    wakeItem: { id: 'scarlet', orderIndex: 1, seatId: 3, playerLabel: '3号', roleId: 'scarletwoman', roleName: '红唇女郎', targetCount: 0,
      ability: 'If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers do not count)', status: healthy },
    currentActor: { seatId: 3, playerLabel: '3号', roleId: 'scarletwoman', roleName: '红唇女郎', status: healthy },
    draft: { targets: [], roleChoice: '', outcomeId: '', playerChoice: '', draftRevision: 1,
      storytellerContext: `这是主持已确认的普通多恶魔局面，7号小恶魔和6号涡流原先都存活。7号小恶魔本次实际死亡，死亡前恰有${beforeNonTravellers}名非旅行者存活；另有2名存活旅行者，不计入门槛。3号红唇存活且清醒健康、能力有效。6号涡流继续存活。完整在场角色见inPlayRoleIds，无方古及其他适用相克、无替死或继任干扰。只核对红唇继任，不回溯该已确认局面如何产生，不询问全局胜负。` },
    inPlayRoleIds: ['chef', 'librarian', 'scarletwoman', 'monk', 'soldier', 'vortox', 'imp'],
    roleKnowledge: roleKnowledgeForAI('scarletwoman'), selectedTargets: [],
    availableOutcomes: [{ id: 'record', label: '记录继任草稿', ready: true, requiredInputs: [] }],
  }
}

// Independent offline semantic oracle. The provider deliberately does not repair bad model prose.
function semanticErrors(answer: { summary: string; ruleFacts: string[]; stateChangeDrafts: string[] }, scope: 'fang-gu-jinx' | 'ordinary') {
  const errors: string[] = []
  const text = [answer.summary, ...answer.ruleFacts].join(' ')
  if (/红唇女郎仅在恶魔死亡且场上没有其他活着的恶魔时|只要还有另一(?:名)?活恶魔[^。；]*(?:不能|不会)继任/.test(text)) errors.push('unsupported universal no-other-Demon condition')
  if (scope === 'ordinary' && !answer.stateChangeDrafts.some(line => /3号[^。；]*成为小恶魔/.test(line))) errors.push('ordinary Scarlet succession missing')
  if (scope === 'fang-gu-jinx' && !/方古.{0,15}相克|相克.{0,15}方古/.test(text)) errors.push('specific Fang Gu jinx basis missing')
  return errors
}

// Check every text field, including host warnings; unsafe host instructions can leak just like player prose.
function privacyErrors(value: unknown, path = ''): string[] {
  if (typeof value === 'string') {
    const unsafe = value.split(/[。；]/).some(clause =>
      /并告知其同伴恶魔\/爪牙信息|为新方古补发首夜同伴信息|告知新方古爪牙是谁/.test(clause)
      && !/(?:不能|不得|不应|不要|不会)[^。；]{0,12}(?:补发|告知|获知|告诉)/.test(clause))
    return unsafe ? [path] : []
  }
  if (Array.isArray(value)) return value.flatMap((entry, i) => privacyErrors(entry, `${path}[${i}]`))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, entry]) => privacyErrors(entry, path ? `${path}.${key}` : key))
  return []
}

async function throughProvider(input: NightSettlementProviderRequest, answer: object) {
  const before = structuredClone(input)
  let fetches = 0
  const provider = createOpenAICompatibleNightSettlementProvider({ baseUrl: 'https://offline.example.test/v1', model: 'offline-test', apiKey: 'offline-test-only', timeoutSeconds: 1,
    fetcher: async (_url, init) => {
      fetches++
      const sent = JSON.parse(String(init?.body))
      const prompt = JSON.parse(sent.messages[1].content)
      expect(prompt.input).toEqual(input)
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(answer) } }] }), { status: 200 })
    } })
  const result = await provider.generateNightSettlementAdvice(input)
  expect(input).toEqual(before)
  expect(fetches).toBe(1)
  return result.draft
}

describe('Scarlet Woman basic trigger and named-jinx scope', () => {
  it('projects the pre-death non-Traveller threshold and ordinary multi-Demon rule within three reminders', () => {
    const knowledge = roleKnowledgeForAI('scarletwoman')!
    expect(knowledge.reminders).toHaveLength(3)
    expect(knowledge.requiredContext).toEqual(expect.arrayContaining(['恶魔死亡前的存活非旅行者人数', '红唇当前是否有能力', '本局是否适用具体相克']))
    expect(knowledge.reminders[0]).toMatch(/死亡前至少 5 名非旅行者存活/)
    expect(knowledge.reminders[1]).toContain('场上没有其他存活恶魔不是基础触发条件')
    expect(knowledge.reminders[2]).toContain('不要把方古与红唇相克推广成所有恶魔更替的通则')
    expect(knowledge.reminders.join(' ')).not.toMatch(/001|010|011|3号|6号|7号/)
    const prompt = JSON.parse(buildNightSettlementProviderMessages(ordinaryMultiDemonRequest())[1].content)
    expect(prompt.input.roleKnowledge).toEqual(knowledge)
    expect(prompt.input.inPlayRoleIds).not.toContain('fanggu')
  })

  it('preserves the raw real 001 incorrect ruleFacts and independently rejects its generalization', async () => {
    const raw = await throughProvider(fangGuRequest(), raw001)
    expect(raw.summary).toBe(raw001.summary)
    expect(raw.ruleFacts).toEqual(raw001.ruleFacts)
    expect(raw.stateChangeDrafts).toEqual(raw001.stateChangeDrafts)
    expect(semanticErrors(raw, 'fang-gu-jinx')).toContain('unsupported universal no-other-Demon condition')
    const correct = complete('本局适用方古与红唇相克，2号为邪恶方古存活，12号旧方古死亡，红唇保持原角色。',
      ['结论来自本局已确认适用的方古/红唇相克，不添加基础触发条件。'], ['2号成为邪恶方古并存活。', '12号死亡。'])
    expect(semanticErrors(await throughProvider(fangGuRequest(), correct), 'fang-gu-jinx')).toEqual([])
  })

  it('allows ordinary succession with another living Demon instead of importing the Fang Gu jinx', async () => {
    const input = ordinaryMultiDemonRequest()
    const correct = complete('恶魔死亡前5名非旅行者存活，健康红唇满足基础触发，6号涡流存活不阻止继任。',
      ['人数取恶魔死亡前，旅行者不计。', '角色知识提到方古相克不代表本局适用。'], ['3号红唇成为小恶魔，待主持确认。'])
    const result = await throughProvider(input, correct)
    expect(result.status).toBe('answer')
    expect(semanticErrors(result, 'ordinary')).toEqual([])
    const bad = complete('只要还有另一名活恶魔，红唇不会继任。', ['把方古相克套为通则。'], ['3号保持红唇。'])
    expect(semanticErrors(await throughProvider(input, bad), 'ordinary')).toEqual(['unsupported universal no-other-Demon condition', 'ordinary Scarlet succession missing'])
  })

  it('does not let living Travellers supply a missing fifth non-Traveller', async () => {
    const input = ordinaryMultiDemonRequest(4)
    const correct = complete('死亡前只有4名非旅行者存活；另2名旅行者不计，红唇不触发。',
      ['5人门槛按恶魔死亡前的非旅行者计数。'], ['3号保持红唇女郎，不产生继任草稿。'])
    const result = await throughProvider(input, correct)
    expect(result.summary).toBe(correct.summary)
    expect(result.stateChangeDrafts).toEqual(correct.stateChangeDrafts)
  })

  it('rejects exact raw 010 colleague-disclosure instructions in host warnings without rewriting them', async () => {
    const knowledge = roleKnowledgeForAI('fanggu')!
    expect(knowledge.reminders).toHaveLength(3)
    expect(knowledge.reminders[0]).toContain('不获知爪牙是谁')
    expect(knowledge.reminders[0]).toContain('不得补发首夜恶魔同伴信息')
    const result = await throughProvider(fangGuRequest(), raw010)
    expect(result.summary).toBe(raw010.summary)
    expect(result.ruleFacts).toEqual(raw010.ruleFacts)
    expect(result.authorityWarnings).toEqual([...raw010.warnings, ...raw010.authorityWarnings])
    expect(privacyErrors(raw010)).toEqual(['authorityWarnings[1]'])
    expect(privacyErrors(result)).toEqual(['authorityWarnings[3]'])
    const correct = complete('方古跳转成立，私下只通知2号新角色和邪恶阵营。', ['新方古不会得知爪牙身份，不得补发首夜恶魔同伴信息。'], ['2号成为邪恶方古；12号死亡，待主持确认。'])
    expect(privacyErrors(await throughProvider(fangGuRequest(), correct))).toEqual([])
  })

  it.each(['summary', 'ruleFacts', 'warnings', 'journalDrafts', 'playerMessageDrafts', 'stateChangeDrafts', 'authorityWarnings'] as const)('privacy oracle inspects %s, not only player messages', (field) => {
    const unsafe = '请说书人并告知其同伴恶魔/爪牙信息（按规则流程）。'
    const value = field === 'summary' ? { [field]: unsafe } : { [field]: [unsafe] }
    expect(privacyErrors(value)).toEqual([field === 'summary' ? field : `${field}[0]`])
  })
})
