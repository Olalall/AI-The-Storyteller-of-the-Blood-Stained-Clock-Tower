import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { createNightWorkbenchCommit, sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from '../../night-workbench/state/nightWorkbenchReducer'
import { nightSeatTap } from './nightTargetTap'
import { projectNightRing } from './projectNightRing'
import type { GameSessionState } from '../../game-session/types'

const AT = '2026-08-05T22:00:00.000Z'
const SINGLE = 'night-3-cerenovus'

/**
 * 走一遍真正的往返：夜间 reducer 算出新状态 → commit 进 session → 再从 session 投影回来。
 * 直接手改 session.nightRuns 会跳过 commit 那一段，而环读的正是 commit 之后的 session。
 */
function withNightIntent(session: GameSessionState, ...intents: NightWorkbenchIntent[]): GameSessionState {
  return intents.reduce((current, intent) => {
    const binding = { session: current, dispatchSession: () => undefined }
    const next = nightWorkbenchReducer(sessionInitialNightState(binding), { ...intent, at: AT })
    return gameSessionReducer(current, createNightWorkbenchCommit(next, binding))
  }, session)
}

describe('环需要的夜间事实，一次投影出来', () => {
  it('没有进行中的夜晚时返回 null，而不是一份空壳', () => {
    const session = createPrototypeGameSession()
    expect(projectNightRing({ ...session, activeNightRunId: null })).toBeNull()
  })

  it('角标、当前项座位、目标上下文都对上抽屉里那一项', () => {
    const ring = projectNightRing(createPrototypeGameSession())

    expect(ring?.focusSeatId).toBe(10)
    expect(ring?.focusItemId).toBe(SINGLE)
    expect(ring?.badges.get(10)?.kind).toBe('focus')
    expect(ring?.target).toEqual({ targetCount: 1, targetLabel: '玩家', targets: [], readOnly: false })
  })

  it('环上选的目标与抽屉里的草稿是同一份，不是各存一份', () => {
    const session = withNightIntent(createPrototypeGameSession(), { type: 'target', seatId: 6 })

    const ring = projectNightRing(session)
    expect(ring?.target.targets).toEqual([6])
    expect(ring?.targetOrdinalBySeat.get(6)).toBe(1)
    // 抽屉那一侧读的是同一个 run.drafts，两边必然一致——这条钉住的是「不许再存一份」。
    expect(sessionInitialNightState({ session, dispatchSession: () => undefined }).drafts[SINGLE]?.targets).toEqual([6])
  })

  it('多目标项按点击顺序编号，取消中间一个之后序号会重排', () => {
    let session = withNightIntent(
      createPrototypeGameSession(),
      { type: 'preview', id: 'night-3-fortuneteller' },
      { type: 'activate-preview' },
      { type: 'target', seatId: 1 },
      { type: 'target', seatId: 6 },
    )
    expect(projectNightRing(session)?.targetOrdinalBySeat.get(6)).toBe(2)

    session = withNightIntent(session, { type: 'target', seatId: 1 })
    expect(projectNightRing(session)?.target.targets).toEqual([6])
    expect(projectNightRing(session)?.targetOrdinalBySeat.get(6)).toBe(1)
  })

  it('预览别的项时环上点不动，与抽屉里那张卡是同一个只读闸门', () => {
    const session = withNightIntent(createPrototypeGameSession(), { type: 'preview', id: 'night-3-pithag' })

    const ring = projectNightRing(session)
    expect(ring?.target.readOnly).toBe(true)
    expect(nightSeatTap(ring!.target, 5).kind).toBe('blocked')
    // 焦点跟着抽屉走：预览谁，环上的暖金环就在谁身上，两块屏不各说各的。
    expect(ring?.focusSeatId).toBe(11)
  })

  it('已确认的项停在光标上时同样只读', () => {
    const session = withNightIntent(
      createPrototypeGameSession(),
      { type: 'preview', id: 'night-3-philosopher' },
      { type: 'activate-preview' },
    )

    const ring = projectNightRing(session)
    expect(ring?.focusSeatId).toBe(7)
    expect(ring?.target.readOnly).toBe(true)
  })

  it('死亡座位照样可点，夜序光标也不因生死跳过', () => {
    const base = createPrototypeGameSession()
    const before = projectCurrentPlayerStates(base)[11]
    // 11 号是后续第一项（①）。把他改成死亡。
    const killed = gameSessionReducer(base, {
      type: 'confirm-player-state-change',
      seatId: 11,
      expectedBefore: before,
      after: { ...before, life: 'dead' },
      segmentId: null,
      entryId: 'ring-test-kill-11',
      confirmedAt: AT,
      reason: '用例：让 11 号死亡',
    })
    // 前置：真的死了，否则下面两条断言什么都没测到。
    expect(projectCurrentPlayerStates(killed)[11].life).toBe('dead')

    const ring = projectNightRing(killed)
    expect(ring?.badges.get(11)).toMatchObject({ kind: 'upcoming', ordinal: 1 })
    expect(nightSeatTap(ring!.target, 11).kind).toBe('select')
  })

  it('毒醉不改变夜序，也不改变能不能被点', () => {
    // 夹具里 3 号出厂就中毒。中毒者照样要被叫醒、照样能被指为目标。
    const session = createPrototypeGameSession()
    expect(projectCurrentPlayerStates(session)[3].poisoned).toBe(true)

    const ring = projectNightRing(session)
    expect(nightSeatTap(ring!.target, 3).kind).toBe('select')
  })
})
