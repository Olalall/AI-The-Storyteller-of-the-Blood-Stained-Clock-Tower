/**
 * 环上点座位选目标的**写入本身**。
 *
 * 这条链此前一条测试都没有：夜侧现有的三份测的是「按下去等于什么」的描述
 * 与「环上该画什么」的投影，全都绕开桥直接打 reducer。
 * 复核实测把 commitNightRingTarget 整段改成 `return false`（点了永远不写），
 * 427 条测试全绿——说书人点环没反应，而 CI 一条都不会红。
 */
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { commitNightRingTarget } from './nightRingBridge'
import { projectNightRing } from './projectNightRing'
import type { GameSessionState } from '../../game-session/types'

const AT = '2026-08-07T02:00:00.000Z'

function binding(session: GameSessionState) {
  let current = session
  const dispatchSession = vi.fn((action) => { current = gameSessionReducer(current, action) })
  return { get session() { return current }, dispatchSession }
}

function targetsOf(session: GameSessionState) {
  const run = session.nightRuns[session.activeNightRunId!]
  return run?.drafts[run.previewEntryId]?.targets ?? []
}

describe('环上点座位真的把目标写进草稿', () => {
  it('lands the target in the draft and says it did', () => {
    const b = binding(createPrototypeGameSession())
    expect(targetsOf(b.session)).not.toContain(2)

    expect(commitNightRingTarget(b, 2, AT)).toBe(true)

    expect(b.dispatchSession).toHaveBeenCalledOnce()
    expect(targetsOf(b.session)).toContain(2)
  })

  it('stamps the timestamp the caller gave it', () => {
    // reducer 必须可重放：桥自己取 now 会让同一组输入产生不同结果，
    // 而漏传 at 会让草稿的 updatedAt 变成 undefined——抽屉里「已暂存」不出现、
    // 「清空草稿」永远灰着。
    const b = binding(createPrototypeGameSession())
    commitNightRingTarget(b, 2, AT)

    const run = b.session.nightRuns[b.session.activeNightRunId!]
    expect(run.drafts[run.previewEntryId]?.updatedAt).toBe(AT)
  })

  it('writes a draft and nothing else — no confirmed record appears', () => {
    const before = createPrototypeGameSession()
    const b = binding(before)

    commitNightRingTarget(b, 2, AT)

    expect(b.session.timeline).toHaveLength(before.timeline.length)
  })

  it('toggles the same seat off on a second tap', () => {
    const b = binding(createPrototypeGameSession())
    commitNightRingTarget(b, 2, AT)
    commitNightRingTarget(b, 2, AT)

    expect(targetsOf(b.session)).not.toContain(2)
  })

  it('reports false instead of writing when the reducer refuses', () => {
    // 返回值是调用方决定「要不要说一句话」的唯一依据。
    // 按下去毫无反应是本工具里最坏的一种反馈——他会以为自己点上了。
    const b = binding(createPrototypeGameSession())
    const bogus = commitNightRingTarget(b, 999, AT)

    expect(bogus).toBe(false)
    expect(b.dispatchSession).not.toHaveBeenCalled()
  })

  it('agrees with the projection about which seats are targeted', () => {
    // 环上画的描边与实际草稿必须是同一个真相，否则「看起来选上了」与
    // 「真的选上了」会分家。
    const b = binding(createPrototypeGameSession())
    commitNightRingTarget(b, 2, AT)

    expect([...projectNightRing(b.session)!.target.targets]).toEqual(targetsOf(b.session))
  })
})
