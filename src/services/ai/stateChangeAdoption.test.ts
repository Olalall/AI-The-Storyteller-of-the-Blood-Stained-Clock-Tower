import { describe, expect, it } from 'vitest'
import type { PlayerState } from '../../features/game-session/model/playerTypes'
import { buildStateChangeAdoption, projectStateChangeAdoption, type StateChangeAdoptionContext } from './stateChangeAdoption'

function alive(overrides: Partial<PlayerState> = {}): PlayerState {
  return { life: 'alive', poisoned: false, drunk: false, markers: [], ...overrides }
}

function context(playerStates: Record<number, PlayerState>): StateChangeAdoptionContext {
  return { playerStates, segmentId: 'segment-night-1' }
}

describe('projectStateChangeAdoption', () => {
  /*
   * 一条建议最多改一个字段。若 after 除声明字段外还动了别的，
   * grimoireOpInvariant 会判 field_out_of_scope——那正是级联写入的运行时形态。
   */
  it('touches exactly the field the op names', () => {
    const before = alive({ drunk: true, markers: [{ id: 'm1', label: '红鲱鱼' }] })
    const projected = projectStateChangeAdoption(
      { text: '3号死亡', seatId: 3, change: { field: 'life', to: 'dead' } },
      { 3: before },
    )

    expect(projected?.after).toEqual({ ...before, life: 'dead' })
    expect(projected?.op).toEqual({ op: 'life_set', seatId: 3, life: 'dead' })
    expect(projected?.after.markers).toBe(before.markers)
    expect(projected?.after.drunk).toBe(true)
  })

  /*
   * 中毒与醉酒是两件事，op 里写哪个就只能改哪个。
   * 违反的后果：记录写着「改了醉酒」，实际改的是中毒——invariant 判 value_mismatch，
   * 而这种记录看起来完全正常，只有逐字比对才看得出来。
   */
  it('keeps poisoned and drunk apart', () => {
    const projected = projectStateChangeAdoption(
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
      { 3: alive() },
    )

    expect(projected?.after).toEqual(alive({ poisoned: true }))
    expect(projected?.op).toEqual({ op: 'impairment_set', seatId: 3, impairment: 'poisoned', value: true })
  })

  /*
   * 建议的座位不在当前局面里 → 不给按钮。
   * 违反的后果：playerStates[seatId] 是 undefined，expectedBefore 会带着 undefined 落盘，
   * 乐观锁从此对这条记录失效。
   */
  it('refuses to build anything for a seat missing from the current projection', () => {
    expect(projectStateChangeAdoption(
      { text: '给9号加中毒', seatId: 9, change: { field: 'poisoned', to: 'true' } },
      { 3: alive() },
    )).toBeNull()
  })

  /* 只有一句人话、没有结构的建议（本地降级路径给的就是这种）永远不出按钮。 */
  it('refuses text-only drafts', () => {
    expect(projectStateChangeAdoption({ text: '可能涉及中毒' }, { 3: alive() })).toBeNull()
    expect(projectStateChangeAdoption({ text: '可能涉及中毒', seatId: 3 }, { 3: alive() })).toBeNull()
  })

  /*
   * 已经是这个值时不出按钮。
   * 违反的后果：写出一条 before 与 after 相同的记录，时间线上看起来说书人操作过、
   * 实际什么都没发生；grimoireOpInvariant 也会判 no_change。
   */
  it('suppresses adoption when the seat is already in the proposed state', () => {
    expect(projectStateChangeAdoption(
      { text: '3号死亡', seatId: 3, change: { field: 'life', to: 'dead' } },
      { 3: alive({ life: 'dead' }) },
    )).toBeNull()

    expect(projectStateChangeAdoption(
      { text: '给3号贴红鲱鱼', seatId: 3, change: { field: 'marker', to: 'add', markerLabel: '红鲱鱼' } },
      { 3: alive({ markers: [{ id: 'existing', label: '红鲱鱼' }] }) },
    )).toBeNull()
  })

  /*
   * 移除标记只能移除真实存在的那一枚，且必须用它自己的 id。
   * 违反的后果：op 里写着移除 tokenId，after 里那枚还在——invariant 判 value_mismatch。
   */
  it('removes the marker it actually found, by id', () => {
    const before = alive({ markers: [{ id: 'm1', label: '僧侣保护' }, { id: 'm2', label: '红鲱鱼' }] })
    const projected = projectStateChangeAdoption(
      { text: '移除3号的僧侣保护', seatId: 3, change: { field: 'marker', to: 'remove', markerLabel: '僧侣保护' } },
      { 3: before },
    )

    expect(projected?.op).toEqual({ op: 'token_removed', seatId: 3, tokenId: 'm1', tokenLabel: '僧侣保护' })
    expect(projected?.after.markers).toEqual([{ id: 'm2', label: '红鲱鱼' }])
  })

  /* 想移除一枚不存在的标记 → 不给按钮，而不是当成空操作放行。 */
  it('refuses to remove a marker that is not on the seat', () => {
    expect(projectStateChangeAdoption(
      { text: '移除3号的僧侣保护', seatId: 3, change: { field: 'marker', to: 'remove', markerLabel: '僧侣保护' } },
      { 3: alive() },
    )).toBeNull()
  })
})

describe('buildStateChangeAdoption', () => {
  /*
   * ops 长度恒为 1（裁决 4）。放宽到多条，「加中毒标记」和「置 poisoned=true」
   * 就能合法地待在同一条 entry 里，级联写入从此有了通过评审的外壳。
   */
  it('emits exactly one op and carries the adviceId into reason', () => {
    const action = buildStateChangeAdoption(
      { adviceId: 'advice-42' },
      { text: '给3号贴红鲱鱼', seatId: 3, change: { field: 'marker', to: 'add', markerLabel: '红鲱鱼' } },
      context({ 3: alive() }),
      '2026-08-05T12:00:00.000Z',
    )

    if (action?.type !== 'confirm-player-state-change') throw new Error('expected a player state change')
    expect(action.ops).toHaveLength(1)
    expect(action.origin).toBe('night_workbench')
    expect(action.segmentId).toBe('segment-night-1')
    expect(action.confirmedAt).toBe('2026-08-05T12:00:00.000Z')
    // 溯源复用 advice 已有的 adviceId，不新建字段——PlayerStateChangedEntry 上没有别的地方放它。
    expect(action.reason).toBe('采纳AI建议(advice-42)：给3号贴红鲱鱼')
  })

  /*
   * expectedBefore 只能来自传入的权威局面，不能来自建议。
   * 违反的后果：AI 顺带把「改之前是什么」也说了，乐观锁就变成它自己给自己签收，
   * 中途被别处改过的状态会被这次落盘悄悄覆盖。
   */
  it('reads expectedBefore from the authoritative projection', () => {
    const before = alive({ life: 'dead', drunk: true })
    const action = buildStateChangeAdoption(
      { adviceId: 'advice-42' },
      { text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } },
      context({ 3: before }),
      '2026-08-05T12:00:00.000Z',
    )

    if (action?.type !== 'confirm-player-state-change') throw new Error('expected a player state change')
    expect(action.expectedBefore).toEqual(before)
    expect(action.after).toEqual({ ...before, poisoned: true })
  })

  /* 投影不出改动就一个字都不写，而不是写一条空记录。 */
  it('never turns an unusable draft into an action', () => {
    expect(buildStateChangeAdoption(
      { adviceId: 'advice-42' },
      { text: '3号还活着', seatId: 3, change: { field: 'life', to: 'alive' } },
      context({ 3: alive() }),
      '2026-08-05T12:00:00.000Z',
    )).toBeNull()
  })
})
