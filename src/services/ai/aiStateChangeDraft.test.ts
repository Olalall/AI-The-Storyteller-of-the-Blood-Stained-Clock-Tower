import { describe, expect, it } from 'vitest'
import { normalizeStateChangeDrafts, textStateChangeDrafts } from './aiStateChangeDraft'

const seats = [3, 7]

describe('normalizeStateChangeDrafts', () => {
  /*
   * 旧后端（以及任何代理）仍会返回 string[]。整批丢掉会让说书人在离线/降级时
   * 一条状态提醒都看不到，而那正是他最需要提醒的时候。
   */
  it('accepts a legacy string array as plain text', () => {
    expect(normalizeStateChangeDrafts(['可能涉及死亡', '  ', '可能涉及中毒'], seats)).toEqual([
      { text: '可能涉及死亡' },
      { text: '可能涉及中毒' },
    ])
  })

  /*
   * 结构完整时才带 seatId 与 change 出去——那两样东西是落盘按钮出现的唯一条件。
   */
  it('keeps a fully structured draft', () => {
    expect(normalizeStateChangeDrafts([
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
    ], seats)).toEqual([
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
    ])
  })

  /*
   * 座位号不在 input 里 → **整条丢弃**，不是降级成文本。
   * 违反的后果：屏幕上留下一句「给 9 号加中毒」，而 9 号这一步根本没被提到；
   * 说书人没有任何办法看出这句话是编的。
   */
  it('drops the whole draft when the seat never appeared in the request', () => {
    expect(normalizeStateChangeDrafts([
      { text: '给9号加中毒', seatId: 9, change: { field: 'poisoned', to: 'true' } },
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
    ], seats)).toEqual([
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
    ])
  })

  /*
   * change 不合规只降级成 text + seatId，文字仍然留给说书人看。
   * 违反的后果（若改成整条丢弃）：模型每写错一次枚举值，说书人就少看到一条提醒。
   */
  it('degrades to text when change is unparseable but keeps the sentence', () => {
    expect(normalizeStateChangeDrafts([
      { text: '3号可能中毒', seatId: 3, change: { field: 'poisoned', to: '中毒' } },
      { text: '3号可能死亡', seatId: 3, change: { field: 'mood', to: 'dead' } },
    ], seats)).toEqual([
      { text: '3号可能中毒', seatId: 3 },
      { text: '3号可能死亡', seatId: 3 },
    ])
  })

  /*
   * marker 必须带 label，其它字段一律不许带 label。
   * 违反的后果：`{field:'life', markerLabel:'红鲱鱼'}` 这种串了字段的输出会被当成
   * 一条合法的生死改动放行，而它真正想说的是别的事。
   */
  it('enforces markerLabel presence exactly on marker changes', () => {
    expect(normalizeStateChangeDrafts([
      { text: '贴标记', seatId: 3, change: { field: 'marker', to: 'add' } },
      { text: '标死', seatId: 3, change: { field: 'life', to: 'dead', markerLabel: '红鲱鱼' } },
      { text: '贴红鲱鱼', seatId: 3, change: { field: 'marker', to: 'add', markerLabel: '红鲱鱼' } },
    ], seats)).toEqual([
      { text: '贴标记', seatId: 3 },
      { text: '标死', seatId: 3 },
      { text: '贴红鲱鱼', seatId: 3, change: { field: 'marker', to: 'add', markerLabel: '红鲱鱼' } },
    ])
  })

  /* text 必填：没有人话的建议在界面上是一行空白，点了却会写状态。 */
  it('drops entries without text and non-objects', () => {
    expect(normalizeStateChangeDrafts([
      { seatId: 3, change: { field: 'poisoned', to: 'true' } },
      { text: '   ', seatId: 3 },
      42,
      null,
    ], seats)).toEqual([])
  })

  /* 非数组输入（模型返回了对象或字符串）不得抛错——它会把整条建议链带崩。 */
  it('returns an empty list for non-array payloads', () => {
    expect(normalizeStateChangeDrafts({ text: '给3号加中毒' }, seats)).toEqual([])
    expect(normalizeStateChangeDrafts(undefined, seats)).toEqual([])
  })

  /* 条数上限与既有 stringArray(…, 5) 一致；结构化不是放宽条数的借口。 */
  it('caps the list at the existing limit', () => {
    const many = Array.from({ length: 9 }, (_, index) => `提醒${index}`)
    expect(normalizeStateChangeDrafts(many, seats)).toHaveLength(5)
  })

  /* 小数座位号不是座位号；Set.has(3.0) 会命中而 has(3.5) 不会，靠整数判定兜住。 */
  it('rejects non-integer seat ids', () => {
    expect(normalizeStateChangeDrafts([{ text: 'x', seatId: 3.5 }], seats)).toEqual([])
  })
})

describe('textStateChangeDrafts', () => {
  /*
   * 本地降级路径的唯一构造口：它必须只产 text。
   * 违反的后果：本地适配器会从静态 riskTags 推出一个座位号，
   * 而那份表只知道「这个角色可能涉及中毒」，不知道今晚谁中了毒。
   */
  it('produces text-only drafts and never invents structure', () => {
    const drafts = textStateChangeDrafts(['可能涉及死亡', '', '可能涉及中毒'])

    expect(drafts).toEqual([{ text: '可能涉及死亡' }, { text: '可能涉及中毒' }])
    expect(drafts.every((draft) => draft.seatId === undefined && draft.change === undefined)).toBe(true)
  })
})
