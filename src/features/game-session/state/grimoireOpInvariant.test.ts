import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PlayerState } from '../types'
import type { GrimoireOp } from '../model/grimoireOp'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { checkGrimoireOpInvariant } from './grimoireOpInvariant'
import { projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'

const SEAT = 3

function state(patch: Partial<PlayerState> = {}): PlayerState {
  return { life: 'alive', poisoned: false, drunk: false, markers: [], ...patch }
}

const marker = { id: 'm1', label: '僧侣保护', sourceRoleId: 'monk' }

function check(before: PlayerState, after: PlayerState, ops?: GrimoireOp[]) {
  return checkGrimoireOpInvariant({ seatId: SEAT, before, after, ops })
}

/** 每种 op 一条合法、一条越界。越界样本一律是「顺手多改一个字段」——真实漂移就长这样。 */
const cases: { op: GrimoireOp; legal: [PlayerState, PlayerState]; overreach: [PlayerState, PlayerState]; why: string }[] = [
  {
    op: { op: 'token_added', seatId: SEAT, token: marker },
    legal: [state(), state({ markers: [marker] })],
    overreach: [state(), state({ markers: [marker], poisoned: true })],
    why: '「加中毒标记顺手把 poisoned 置真」是文档点名的第一号级联写入',
  },
  {
    op: { op: 'token_removed', seatId: SEAT, tokenId: 'm1', tokenLabel: '僧侣保护' },
    legal: [state({ markers: [marker] }), state()],
    overreach: [state({ markers: [marker] }), state({ life: 'dead' })],
    why: '「标记到了移除时机顺手清掉并结算死亡」等于工具替说书人裁定了保护失效',
  },
  {
    op: { op: 'token_moved', fromSeatId: SEAT, toSeatId: 5, tokenId: 'm1' },
    legal: [state({ markers: [marker] }), state()],
    overreach: [state({ markers: [marker] }), state({ drunk: true })],
    why: '搬一张贴纸不该改任何人的醉酒态',
  },
  {
    op: { op: 'token_inverted', seatId: SEAT, tokenId: 'm1', inverted: true },
    legal: [state({ markers: [marker] }), state({ markers: [{ ...marker, label: '僧侣保护（失效）' }] })],
    overreach: [state({ markers: [marker] }), state({ markers: [], poisoned: true })],
    why: '翻面只是改标记文案，不是一次状态结算',
  },
  {
    op: { op: 'life_set', seatId: SEAT, life: 'dead' },
    legal: [state(), state({ life: 'dead' })],
    overreach: [state({ markers: [marker] }), state({ life: 'dead', markers: [] })],
    why: '「标死顺手把他身上的标记清干净」会让复盘再也看不出他死时带着什么标记',
  },
  {
    op: { op: 'impairment_set', seatId: SEAT, impairment: 'poisoned', value: true },
    legal: [state(), state({ poisoned: true })],
    overreach: [state(), state({ poisoned: true, markers: [marker] })],
    why: '「置中毒顺手补一枚中毒标记」是反方向的同一条级联，同样得两次显式操作',
  },
  {
    op: { op: 'alignment_set', seatId: SEAT, alignment: 'evil', inverted: true },
    legal: [state(), state()],
    overreach: [state(), state({ poisoned: true })],
    why: '阵营不在 PlayerState 上（裁决 8），带这个 op 的写入不该动任何座位字段',
  },
  {
    op: { op: 'perceived_role_set', seatId: SEAT, role: null },
    legal: [state(), state()],
    overreach: [state(), state({ life: 'dead' })],
    why: '认知角色是 G4 的事，现在借它的名字改生死等于绕过 life_set 的审计',
  },
  {
    op: { op: 'role_type_override_set', seatId: SEAT, roleType: 'outsider' },
    legal: [state(), state()],
    overreach: [state(), state({ drunk: true })],
    why: '同上：登记裁定推后了，它的 op 名字不该成为改字段的通行证',
  },
  {
    op: { op: 'madness_issued', seatId: SEAT, directiveId: 'd1' },
    legal: [state(), state()],
    overreach: [state(), state({ markers: [marker] })],
    why: '疯狂指令是说书人对玩家的口头要求，不是座位状态',
  },
  {
    op: { op: 'madness_lifted', seatId: SEAT, directiveId: 'd1' },
    legal: [state(), state()],
    overreach: [state(), state({ life: 'dead' })],
    why: '「疯狂没做到所以处决」是裁定，必须走处决那条链路，不能挂在解除疯狂上',
  },
  {
    op: { op: 'ghost_vote_set', seatId: SEAT, available: false },
    legal: [state(), state()],
    overreach: [state(), state({ markers: [marker] })],
    why: '幽灵票没有建模，用标记去模拟它会让「已用死亡票」同时是标记又是状态',
  },
  {
    op: { op: 'private_note_set', seatId: SEAT },
    legal: [state(), state()],
    overreach: [state(), state({ poisoned: true })],
    why: '私有笔记只记「改过」，它绝不该顺带改任何可被投影读到的事实',
  },
]

describe('不变量：after 与 before 的差异字段集必须是 ops[0] 名字的字面子集', () => {
  for (const { op, legal, overreach, why } of cases) {
    it(`accepts a ${op.op} that only touches what its name promises`, () => {
      expect(check(legal[0], legal[1], [op])).toBeNull()
    })

    it(`rejects a ${op.op} that also changes something else`, () => {
      const violation = check(overreach[0], overreach[1], [op])
      expect(violation, why).not.toBeNull()
      expect(violation?.code).toBe('field_out_of_scope')
    })
  }

  it('does not constrain writes that carry no ops at all', () => {
    // 旧归档与纯记录路径都不带 ops。把它们判成越界会让整个玩家状态板停摆，
    // 而裁决 4 约束的是「声明了意图的写入」，不是「所有写入」。
    expect(check(state(), state({ life: 'dead', poisoned: true }))).toBeNull()
  })
})

describe('不变量：魔典路径上 ops 长度恒为 1', () => {
  it('rejects two ops in one entry', () => {
    // 这是级联写入最自然的伪装形态：不用改 reducer，构造 action 的组件里多 push 一条就成立，
    // 而它读起来完全合理——「加中毒标记，并且中毒」。放行一次，边界就没了。
    const violation = check(state(), state({ markers: [marker], poisoned: true }), [
      { op: 'token_added', seatId: SEAT, token: marker },
      { op: 'impairment_set', seatId: SEAT, impairment: 'poisoned', value: true },
    ])

    expect(violation?.code).toBe('ops_not_single')
  })

  it('rejects an empty ops array', () => {
    // 填了字段却没写意图，记录里会出现一条「有 ops 但读不出做了什么」的条目，
    // 比不填更糟：它看起来是新格式，实际什么都没说。
    expect(check(state(), state({ life: 'dead' }), [])?.code).toBe('ops_not_single')
  })
})

describe('不变量：op 描述的座位必须就是被改的座位', () => {
  it('rejects an op that names a different seat', () => {
    // 记录说改的是 9 号、实际改的是 3 号，审计链从此对不上账，
    // 而这种错在批量手势里（同 batchId 多座位）最容易发生。
    const violation = check(state(), state({ life: 'dead' }), [{ op: 'life_set', seatId: 9, life: 'dead' }])

    expect(violation?.code).toBe('seat_mismatch')
  })

  it('accepts token_moved from either end of the move', () => {
    // 跨座位移动按裁决 4 拆成两条 entry（原座位删、新座位加），
    // 所以同一条 op 会分别挂在起点和终点座位上，两端都必须合法。
    const removed = checkGrimoireOpInvariant({
      seatId: SEAT,
      before: state({ markers: [marker] }),
      after: state(),
      ops: [{ op: 'token_moved', fromSeatId: SEAT, toSeatId: 5, tokenId: 'm1' }],
    })
    const added = checkGrimoireOpInvariant({
      seatId: 5,
      before: state(),
      after: state({ markers: [marker] }),
      ops: [{ op: 'token_moved', fromSeatId: SEAT, toSeatId: 5, tokenId: 'm1' }],
    })

    expect(removed).toBeNull()
    expect(added).toBeNull()
  })
})

describe('confirm-player-state-change 上的运行时断言', () => {
  afterEach(() => vi.restoreAllMocks())

  function openDay() {
    return gameSessionReducer(createPrototypeGameSession(), {
      type: 'open-phase-segment',
      phaseKind: 'day',
      createdAt: '2026-08-05T09:00:00.000Z',
    })
  }

  function dispatchChange(after: Partial<PlayerState>, ops?: GrimoireOp[], entryId = 'state-op-1') {
    const session = openDay()
    const day = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
    const before = projectCurrentPlayerStates(session)[SEAT]
    return gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: SEAT,
      expectedBefore: before,
      after: { ...before, ...after },
      segmentId: day?.id ?? null,
      entryId,
      confirmedAt: '2026-08-05T09:01:00.000Z',
      reason: '说书人确认',
      ops,
      origin: 'grimoire',
    })
  }

  it('stays silent on a write that matches its op', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const next = dispatchChange({ life: 'dead' }, [{ op: 'life_set', seatId: SEAT, life: 'dead' }])

    // 也断言写入确实落了盘：否则「没报警」可能只是因为这条 action 压根被拒了。
    expect(next.timeline.some((entry) => entry.id === 'state-op-1')).toBe(true)
    expect(spy).not.toHaveBeenCalled()
  })

  it('reports the overreach but still records the change', () => {
    // 断言只报警不抛错：在牌桌上抛错会把说书人这一次改动整个丢掉，
    // 而「记录完整性是产品本体」——宁可留一条越界但完整的记录。
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // 用 drunk 而不是 poisoned 当越界字段：样例局的 3 号本来就中毒，
    // 拿它当「多改的那个字段」等于什么都没改，用例会假绿。
    const next = dispatchChange(
      { life: 'dead', drunk: true },
      [{ op: 'life_set', seatId: SEAT, life: 'dead' }],
    )

    expect(spy).toHaveBeenCalledOnce()
    expect(String(spy.mock.calls[0][0])).toContain('life_set')
    expect(next.timeline.some((entry) => entry.id === 'state-op-1')).toBe(true)
  })

  it('says nothing when the write was rejected anyway', () => {
    // 守卫拒绝的 action 没有产生任何记录。对它报越界只会在真实漂移之外制造噪音，
    // 而一条被噪音淹没的护栏等于没有护栏。
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // segmentId 指向一个不存在的段落 → confirmPlayerStateChange 原样返回。
    const session = openDay()
    const before = projectCurrentPlayerStates(session)[SEAT]
    const next = gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: SEAT,
      expectedBefore: before,
      after: { ...before, life: 'dead', drunk: true },
      segmentId: 'no-such-segment',
      entryId: 'state-op-2',
      confirmedAt: '2026-08-05T09:01:00.000Z',
      reason: '说书人确认',
      ops: [{ op: 'life_set', seatId: SEAT, life: 'dead' }],
    })

    expect(next).toBe(session)
    expect(spy).not.toHaveBeenCalled()
  })

  it('leaves the legacy op-less path completely unchanged', () => {
    // 玩家状态板与夜间工作台现在都不带 ops。它们必须一条警告都不产生，
    // 否则这条护栏上线第一天就会被当成噪音关掉。
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const next = dispatchChange({ life: 'dead', poisoned: true, drunk: true })

    expect(spy).not.toHaveBeenCalled()
    expect(next.timeline.some((entry) => entry.id === 'state-op-1')).toBe(true)
  })
})

/**
 * 上面那张表里，七个在 G2 没有落点的 op（alignment_set / madness_issued 等）
 * 的「合法」样本是 before === after。那条断言不具判别力：任何 op 配一对相同状态
 * 都会通过，包括拼错名字的 op。真正要锁的是「它们只允许出现在不改状态的写入上」——
 * 于是逐个字段试一遍，每改一个都必须判违规。
 */
describe('G2 没有落点的 op：改动任何一个字段都越界', () => {
  const G4_ONLY: GrimoireOp[] = [
    { op: 'alignment_set', seatId: SEAT, alignment: 'evil', inverted: false },
    { op: 'perceived_role_set', seatId: SEAT, role: null },
    { op: 'role_type_override_set', seatId: SEAT, roleType: null },
    { op: 'madness_issued', seatId: SEAT, directiveId: 'd1' },
    { op: 'madness_lifted', seatId: SEAT, directiveId: 'd1' },
    { op: 'ghost_vote_set', seatId: SEAT, available: false },
    { op: 'private_note_set', seatId: SEAT },
  ]
  const EVERY_SINGLE_CHANGE: [string, Partial<PlayerState>][] = [
    ['life', { life: 'dead' }],
    ['poisoned', { poisoned: true }],
    ['drunk', { drunk: true }],
    ['markers', { markers: [marker] }],
  ]

  for (const op of G4_ONLY) {
    it(`${op.op} 不改状态时合法，改任何一个字段都不合法`, () => {
      expect(check(state(), state(), [op])).toBeNull()
      for (const [field, patch] of EVERY_SINGLE_CHANGE) {
        expect(check(state(), state(patch), [op]), `${op.op} 改了 ${field}`).not.toBeNull()
      }
    })
  }
})

describe('op 自称改成什么，after 里就得是什么', () => {
  it('rejects a life_set that says dead while the seat ends up alive', () => {
    // 字段对得上而值对不上是最坏的一种不一致：它看起来像一条正常记录，
    // 只有把两边逐字比对才看得出来「我把他标死了」其实把人标活了。
    const violation = check(state({ life: 'dead' }), state({ life: 'alive' }), [{ op: 'life_set', seatId: SEAT, life: 'dead' }])
    expect(violation?.code).toBe('value_mismatch')
  })

  it('rejects an impairment_set whose value contradicts the result', () => {
    const violation = check(state({ poisoned: true }), state({ poisoned: false }), [
      { op: 'impairment_set', seatId: SEAT, impairment: 'poisoned', value: true },
    ])
    expect(violation?.code).toBe('value_mismatch')
  })

  it('rejects a token_added whose token is nowhere in the result', () => {
    const violation = check(state(), state({ markers: [{ id: 'other', label: '别的' }] }), [
      { op: 'token_added', seatId: SEAT, token: marker },
    ])
    expect(violation?.code).toBe('value_mismatch')
  })

  it('rejects a token_removed whose token is still there', () => {
    const violation = check(state({ markers: [marker] }), state({ markers: [marker], drunk: true }), [
      { op: 'token_removed', seatId: SEAT, tokenId: 'm1', tokenLabel: '僧侣保护' },
    ])
    expect(violation?.code).toBe('value_mismatch')
  })

  it('rejects an op that claims a change while nothing changed at all', () => {
    // 声明了意图却什么都没改：要么手势没生效，要么记录是凭空写的。
    const violation = check(state(), state(), [{ op: 'life_set', seatId: SEAT, life: 'alive' }])
    expect(violation?.code).toBe('no_change')
  })
})

describe('裁决 8：G1/G2 不给 PlayerState 加字段', () => {
  it('locks the exact key set, so adding a field fails here first', () => {
    // 此前这条只比对一份手抄的键名清单，给 PlayerState 加字段照样绿——
    // 它守的是「表别乱写」，不是「PlayerState 别长胖」。
    const keys = Object.keys(state()).sort()
    expect(keys).toEqual(['drunk', 'life', 'markers', 'poisoned'])
  })
})
