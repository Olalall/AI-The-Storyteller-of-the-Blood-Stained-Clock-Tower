/**
 * 环上此刻承载什么语义。
 *
 * 抽出来不只是为了行数：夜、昼、座位操作三种语义的**优先级**是一条独立规则，
 * 混在舞台的渲染流程里，下一个人加第四种时会在 JSX 中间再插一个三元，
 * 而那正是「环上点一下到底会发生什么」变得没人说得清的开始。
 */
import { useMemo } from 'react'
import { projectNightRing } from '../night/projectNightRing'
import { NightSeatOverlay } from '../night/NightSeatOverlay'
import { commitNightRingTarget } from '../night/nightRingBridge'
import { nightSeatTapHint } from '../night/nightTargetTap'
import { useDayRing, type DayRingBinding } from '../day/useDayRing'
import { DayRingOverlay } from '../day/DayRingOverlay'
import type { RingLayout } from '../layout/ellipseRing'
import type { ReactNode } from 'react'
import type { ShieldLevel } from '../shield/shieldLevel'
import type { DeckNode } from '../../hosting-deck/deckNode'
import type { GameSessionState } from '../../game-session/types'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { NightWorkbenchSessionBinding } from '../../night-workbench/state/gameSessionAdapter'

export interface RingBindings {
  /** 座位角标层（夜序 ①②✓「缓」与草稿目标描边）。非夜间为 undefined。 */
  seatOverlays: Readonly<Record<number, ReactNode>> | undefined
  /** 点座位等于什么，进 token 的可访问名。 */
  actionHint: string
  onSelectSeat: (seatId: number) => void
  day: DayRingBinding
  /** 环层叠加（提名弧、举手角标、处决帷幕）。拿到已解出的几何再画。 */
  renderRingOverlay: (layout: RingLayout) => ReactNode
  /**
   * 抽屉顶那行手势契约。null = 用节点的缺省文案。
   *
   * 它必须跟着 actionHint 同一个判据走：那行字是说书人唯一能读到的
   * 「此刻点座位会发生什么」，与实际行为不一致比不写更坏。
   */
  gestureContract: string | null
}

export interface UseRingBindingsInput {
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  deckNode: DeckNode
  seatIds: readonly number[]
  shield: ShieldLevel
  nightBinding: NightWorkbenchSessionBinding
  /** 环上点不动时要说的那句话。按下去毫无反应是最坏的反馈——他会以为自己点上了。 */
  notify: (message: string) => void
  /** 兜底：任何相位都能开的座位操作浮层。 */
  openActionBar: (seatId: number) => void
}

export function useRingBindings({
  session,
  dispatch,
  deckNode,
  seatIds,
  shield,
  nightBinding,
  notify,
  openActionBar,
}: UseRingBindingsInput): RingBindings {
  /* 夜：角标 + 点座位选目标。停在夜节点才生效——别的相位环上点座位仍是座位操作。 */
  const nightRing = deckNode === 'night' ? projectNightRing(session) : null
  const seatOverlays = useMemo(() => {
    if (!nightRing) return undefined
    return Object.fromEntries(seatIds.map((seatId) => [seatId, (
      <NightSeatOverlay
        key={seatId}
        badge={nightRing.badges.get(seatId) ?? null}
        targeted={nightRing.target.targets.includes(seatId)}
        targetOrdinal={nightRing.targetOrdinalBySeat.get(seatId) ?? null}
        shield={shield}
      />
    )]))
  }, [nightRing, seatIds, shield])

  /* 昼：提名弧、举手角标、处决帷幕。 */
  const day = useDayRing({
    session,
    dispatch,
    seatIds: seatIds,
    active: deckNode === 'day',
  })

  /**
   * 环上点座位此刻等于什么，只有一处判据。
   * 夜间选目标 > 白天记票型 > 座位操作——前两者是「这一步正在做的事」，
   * 座位操作是任何时候都在的兜底，所以它排最后。
   */
  const seatTap = nightRing && nightRing.target.targetCount > 0
    ? {
      hint: nightSeatTapHint(nightRing.target, 0),
      onSelect: (seatId: number) => {
        if (!commitNightRingTarget(nightBinding, seatId)) {
          notify(nightSeatTapHint(nightRing.target, seatId))
        }
      },
    }
    : day.onSelectSeat
      ? { hint: day.actionHint, onSelect: day.onSelectSeat }
      : { hint: '座位操作', onSelect: openActionBar }


  const renderRingOverlay = (layout: RingLayout) => (
    <DayRingOverlay
      layout={layout}
      seatIds={seatIds}
      shield={shield}
      nominatorSeatId={day.nominatorSeatId}
      nomineeSeatId={day.nomineeSeatId}
      emphasis={day.emphasis}
      badges={day.badges}
      execution={day.execution}
      onConfirmGhostVote={day.onConfirmGhostVote}
    />
  )

  const gestureContract = nightRing && nightRing.target.targetCount > 0
    ? `点座位 = 选${nightRing.target.targetLabel ?? '目标'}；确认仍在抽屉底栏`
    : day.onSelectSeat
      ? `点座位 = ${day.actionHint}；落账仍在抽屉里`
      : null

  return {
    seatOverlays,
    actionHint: seatTap.hint,
    onSelectSeat: seatTap.onSelect,
    day,
    renderRingOverlay,
    gestureContract,
  }
}
