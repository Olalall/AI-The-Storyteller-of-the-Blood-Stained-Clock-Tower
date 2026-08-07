import { describe, expect, it } from 'vitest'
import { normalizeStateChangeDrafts, seatIdsInRequest, textStateChangeDrafts } from './nightStateChangeDraft'
import type { NightSettlementProviderRequest } from './types'

function request(overrides: Partial<NightSettlementProviderRequest> = {}): NightSettlementProviderRequest {
  return {
    scriptId: 'catfishing',
    knowledgeVersion: 'catfishing/test-v1',
    nightRunId: 'night-test',
    phaseLabel: '第3夜',
    playerCount: 12,
    wakeItem: {
      id: 'night-3-poisoner',
      orderIndex: 2,
      seatId: 10,
      playerLabel: '10号玩家',
      roleId: 'poisoner',
      roleName: '下毒者',
      ability: '每夜选择一名玩家：该玩家今晚与明天白天中毒。',
      storytellerPrompt: '记录中毒目标。',
      targetCount: 1,
      status: { life: 'alive', impairments: [], markers: [] },
    },
    draft: { targets: [3], roleChoice: '', outcomeId: '', playerChoice: '', draftRevision: 1 },
    availableOutcomes: [{ id: 'applied', label: '生效', ready: true, requiredInputs: ['targets'] }],
    selectedTargets: [{
      seatId: 3,
      playerLabel: '3号玩家',
      roleId: 'chef',
      roleName: '厨师',
      status: { life: 'alive', impairments: [], markers: [] },
    }],
    ...overrides,
  }
}

describe('seatIdsInRequest', () => {
  /*
   * 白名单只含请求里真的出现过的座位：发动者 + 已选目标。
   * 违反的后果（比如改成按 playerCount 放行 1..12）：模型可以对一个它从没收到过
   * 任何信息的座位提状态建议，而那条建议在界面上和真建议长得一模一样。
   */
  it('allows only seats the model actually saw', () => {
    expect([...seatIdsInRequest(request())].sort((left, right) => left - right)).toEqual([3, 10])
  })
})

describe('normalizeStateChangeDrafts', () => {
  const seats = seatIdsInRequest(request())

  /* 模型仍按旧 outputShape 回 string[] 时按纯文本收下，而不是整批丢掉。 */
  it('accepts legacy string arrays as plain text', () => {
    expect(normalizeStateChangeDrafts(['目标今晚中毒，待确认'], seats)).toEqual([{ text: '目标今晚中毒，待确认' }])
  })

  it('keeps a fully structured draft for an in-request seat', () => {
    expect(normalizeStateChangeDrafts([
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
    ], seats)).toEqual([
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
    ])
  })

  /*
   * 座位不在请求里 → 整条丢弃。
   * 违反的后果：一句「给 7 号加中毒」会原样送到说书人眼前，而 7 号这一步根本没被提到。
   */
  it('drops drafts naming a seat that never appeared', () => {
    expect(normalizeStateChangeDrafts([{ text: '给7号加中毒', seatId: 7 }], seats)).toEqual([])
  })

  /*
   * to 走白名单。违反的后果：`to: '中毒'` 会造出一条谁也不知道该写 true 还是 false
   * 的建议，而它长得和合法建议一样。
   */
  it('degrades change to plain text when the target value is off the whitelist', () => {
    expect(normalizeStateChangeDrafts([
      { text: '3号可能中毒', seatId: 3, change: { field: 'poisoned', to: '中毒' } },
    ], seats)).toEqual([{ text: '3号可能中毒', seatId: 3 }])
  })

  /* marker 必须带 label，其它字段一律不许带——带了说明模型串了字段。 */
  it('binds markerLabel to marker changes only', () => {
    expect(normalizeStateChangeDrafts([
      { text: '贴标记', seatId: 3, change: { field: 'marker', to: 'add' } },
      { text: '标死', seatId: 3, change: { field: 'life', to: 'dead', markerLabel: '红鲱鱼' } },
    ], seats)).toEqual([
      { text: '贴标记', seatId: 3 },
      { text: '标死', seatId: 3 },
    ])
  })

  /* text 必填、非数组不抛错、上限 5：这三条都会让整条建议链在牌桌上崩掉。 */
  it('is total: no text, no array, no crash, and a hard cap', () => {
    expect(normalizeStateChangeDrafts([{ seatId: 3 }, '  ', null], seats)).toEqual([])
    expect(normalizeStateChangeDrafts('not an array', seats)).toEqual([])
    expect(normalizeStateChangeDrafts(Array.from({ length: 9 }, (_, i) => `提醒${i}`), seats)).toHaveLength(5)
  })
})

describe('textStateChangeDrafts', () => {
  it('never invents seatId or change', () => {
    expect(textStateChangeDrafts(['可能涉及死亡', ''])).toEqual([{ text: '可能涉及死亡' }])
  })
})
