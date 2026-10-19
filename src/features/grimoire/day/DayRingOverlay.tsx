/**
 * 白天的环上叠加层：提名弧 + 举手打卡徽标 + 死亡票二次确认 chip + 「本日处决」角标。
 *
 * 它是一层**盖在环之上的透明片**，本身不持有任何状态、不 dispatch：
 * 全部输入由 useDayRing 投影好后传进来，唯一的出口是 onConfirmGhostVote。
 * 这样「白天在环上能改什么」这件事有且只有一个可审的入口。
 *
 * 整层 pointer-events: none，只有死亡票 chip 单独打开——
 * 举手打卡靠的是 token 自己那颗键（主控把 onSelectSeat 换成打卡即可），
 * 在它上面再盖一层可点的东西，只会让「我到底点到了谁」多一种出错方式。
 *
 * L0 下整层不进 DOM。举手与提名虽然都是玩家自己看得见的公开信息，
 * 但 L0 的语义是「这块屏此刻什么都不该有」，不是「只藏秘密」。
 */
import { Check, Gavel, Hand, Skull } from 'lucide-react'
import type { CSSProperties } from 'react'
import { NominationArcLayer } from './NominationArcLayer'
import { RING_BADGE_REACH, ghostVoteChipPlacement, oppositeSatelliteOffset } from './dayRingAnchors'
import { nominationArc, seatRadialAngle } from './nominationArc'
import { shieldVisibility, type ShieldLevel } from '../shield/shieldLevel'
import type { RingLayout, RingStartOffset } from '../layout/ellipseRing'
import type { DayExecutionMark } from './executionMark'
import type { VoteRingBadge } from './voteRingBadges'
import './day-ring-overlay.css'

export interface DayRingOverlayProps {
  layout: RingLayout
  /** 环上的座位号，顺序必须与 layout.seats 一一对应。 */
  seatIds: readonly number[]
  startOffset?: RingStartOffset
  shield: ShieldLevel
  nominatorSeatId: number | null
  nomineeSeatId: number | null
  /** 提名步 = active（三角实心）；计票步 = settled（三角空心）。 */
  emphasis: 'active' | 'settled'
  /** 只在计票子态给；其余步骤传空数组。 */
  badges: readonly VoteRingBadge[]
  execution: DayExecutionMark | null
  /** null = 此刻白天只读（已有结论或确认条挂着），chip 退成不可点的展示态。 */
  onConfirmGhostVote: ((seatId: number) => void) | null
}

interface SeatAnchor {
  centerX: number
  centerY: number
  radialAngle: number
  satelliteInside: boolean
}

function centreStyle(x: number, y: number): CSSProperties {
  return { left: x, top: y }
}

export function DayRingOverlay({
  layout,
  seatIds,
  startOffset = 0,
  shield,
  nominatorSeatId,
  nomineeSeatId,
  emphasis,
  badges,
  execution,
  onConfirmGhostVote,
}: DayRingOverlayProps) {
  // 网格退化态没有环，也就没有弧与卫星位可落。此时白天的全部信息仍在抽屉那份
  // 单列步骤序列里，功能不缺，只是不再有空间版。
  if (layout.mode !== 'ring') return null
  if (!shieldVisibility(shield).seatIdentity) return null

  const anchorFor = (seatId: number): SeatAnchor | null => {
    const index = seatIds.indexOf(seatId)
    const place = layout.seats[index]
    if (index === -1 || !place) return null
    return {
      centerX: place.x + layout.tokenSize / 2,
      centerY: place.y + layout.tokenSize / 2,
      radialAngle: seatRadialAngle(index, seatIds.length, startOffset),
      satelliteInside: place.satelliteInside,
    }
  }

  const angleOf = (seatId: number | null) => (seatId === null ? null : anchorFor(seatId)?.radialAngle ?? null)
  const arc = nominationArc({
    centerX: layout.centerX,
    centerY: layout.centerY,
    radiusX: layout.radiusX,
    radiusY: layout.radiusY,
    tokenSize: layout.tokenSize,
    nominatorAngle: angleOf(nominatorSeatId),
    nomineeAngle: angleOf(nomineeSeatId),
  })

  const executionAnchor = execution ? anchorFor(execution.seatId) : null

  return (
    <div className="day-ring-overlay" data-emphasis={emphasis}>
      <NominationArcLayer
        arc={arc}
        width={layout.centerX * 2}
        height={layout.centerY * 2}
        emphasis={emphasis}
      />

      {badges.map((badge) => {
        const anchor = anchorFor(badge.seatId)
        if (!anchor) return null
        const offset = oppositeSatelliteOffset(layout.tokenSize, anchor.radialAngle, anchor.satelliteInside)
        return (
          <span
            key={`punch-${badge.seatId}`}
            className="day-ring-overlay__punch"
            data-seat-id={badge.seatId}
            style={centreStyle(anchor.centerX + offset.dx, anchor.centerY + offset.dy)}
            aria-hidden="true"
          >
            <Hand />
            <span>举</span>
            <strong className="day-ring-overlay__punch-order">{badge.order}</strong>
          </span>
        )
      })}

      {badges.filter((badge) => badge.ghostVote !== 'none').map((badge) => {
        const anchor = anchorFor(badge.seatId)
        if (!anchor) return null
        const placement = ghostVoteChipPlacement(layout.tokenSize, anchor.radialAngle, anchor.satelliteInside)
        const confirmed = badge.ghostVote === 'confirmed'
        return (
          <button
            key={`ghost-${badge.seatId}`}
            type="button"
            className="day-ring-overlay__ghost-vote"
            data-seat-id={badge.seatId}
            data-state={badge.ghostVote}
            style={{
              ...centreStyle(anchor.centerX + placement.dx, anchor.centerY + placement.dy),
              width: placement.size,
              height: placement.size,
            }}
            disabled={!onConfirmGhostVote}
            aria-pressed={confirmed}
            aria-label={`${badge.seatId}号 死亡票${confirmed ? '已标记，再点取消' : '未标记，点按标记'}`}
            onClick={() => onConfirmGhostVote?.(badge.seatId)}
          >
            {confirmed ? <Check aria-hidden="true" /> : <Skull aria-hidden="true" />}
            <span aria-hidden="true">死票</span>
          </button>
        )
      })}

      {execution && executionAnchor ? <ExecutionBadge mark={execution} anchor={executionAnchor} tokenSize={layout.tokenSize} /> : null}

      {/* 环上其余元素全是图形，读屏那一份在这里。抽屉里的单列步骤序列有完整的
          可操作等价路径，所以这里只报事实，不重复一遍操作入口。 */}
      <p className="ui-visually-hidden">{ringSummary(nominatorSeatId, nomineeSeatId, badges, execution)}</p>
    </div>
  )
}

/**
 * 「本日处决」角标比举手徽标再往外让一档。
 * 两者理论上不同时出现（票型落账后草稿即清空），但「理论上」不足以让一个 44px 的
 * 不可逆结论去和一枚计数徽标抢同一个像素。
 */
const EXECUTION_BADGE_REACH = RING_BADGE_REACH + 22

function ExecutionBadge({ mark, anchor, tokenSize }: { mark: DayExecutionMark; anchor: SeatAnchor; tokenSize: number }) {
  const offset = oppositeSatelliteOffset(tokenSize, anchor.radialAngle, anchor.satelliteInside, EXECUTION_BADGE_REACH)
  return (
    <span
      className="day-ring-overlay__execution"
      data-seat-id={mark.seatId}
      data-caused-death={mark.causedDeath}
      style={centreStyle(anchor.centerX + offset.dx, anchor.centerY + offset.dy)}
      aria-hidden="true"
    >
      <Gavel />
      <span>本日处决</span>
    </span>
  )
}

function ringSummary(
  nominatorSeatId: number | null,
  nomineeSeatId: number | null,
  badges: readonly VoteRingBadge[],
  execution: DayExecutionMark | null,
): string {
  const parts: string[] = []
  if (nominatorSeatId !== null && nomineeSeatId !== null) parts.push(`${nominatorSeatId}号提名${nomineeSeatId}号`)
  else if (nominatorSeatId !== null) parts.push(`${nominatorSeatId}号为提名人，被提名人未选`)
  else if (nomineeSeatId !== null) parts.push(`${nomineeSeatId}号为被提名人，提名人未选`)
  if (badges.length > 0) parts.push(`环上已打卡${badges.length}只手：${badges.map((badge) => `${badge.seatId}号`).join('、')}`)
  // 「造成死亡」与否由生死状态自己说，这里只报处决这件事发生过。
  if (execution) parts.push(`${execution.seatId}号本日被处决`)
  return parts.length ? parts.join('；') : '本日环上尚无提名'
}
