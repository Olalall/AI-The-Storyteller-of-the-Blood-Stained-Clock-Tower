/**
 * 魔典画布：座位环 + 核。
 *
 * G1 的硬约束——**画布内零 dispatch**。这一层只把 onSelectSeat 往上回调，
 * 任何状态编辑都仍走既有的 PlayerStatusSheet / 工作台面板。理由是环一旦能直接写状态，
 * 「点一下改了什么」就没有确认步骤，而这个工具的整个前提是说书人裁定、工具只记录。
 *
 * 舞台尺寸用 ResizeObserver 实测，不用断点猜：同一台 iPad 横竖屏、Mac 三档尺寸、
 * 抽屉三档高度都会改变可用矩形，猜出来的值必然在某一组合下出错。
 */
import { useEffect, useRef, useState } from 'react'
import { EmptyState } from '../../components/ui/EmptyState'
import { GrimoireCore } from './core/GrimoireCore'
import { GrimoireSeat, type GrimoireSeatRole } from './seat/GrimoireSeat'
import { solveRingLayout } from './layout/ellipseRing'
import { shieldVisibility, type ShieldLevel } from './shield/shieldLevel'
import type { RingStartOffset } from './layout/ellipseRing'
import type { PlayerState } from '../game-session/model/playerTypes'
import './grimoire-canvas.css'

export interface GrimoireCanvasSeat {
  seatId: number
  nickname?: string
  state: PlayerState
  role: GrimoireSeatRole | null
}

export interface GrimoireCanvasProps {
  seats: readonly GrimoireCanvasSeat[]
  shield: ShieldLevel
  startOffset?: RingStartOffset
  selectedSeatIds?: readonly number[]
  /** 抽屉当前步骤决定点座位干什么，透传给每个 token 进可访问名。 */
  actionHint?: string
  onSelectSeat?: (seatId: number) => void
  ghostVotesRemaining?: number | null
  pendingCount?: number | null
  pendingLabel?: string
}

/** 座位角度：与 solveRingLayout 同一个公式，这里只用来给卫星弧定方向。 */
function radialAngleFor(seatIndex: number, seatCount: number, startOffset: number) {
  return ((-90 + startOffset + (360 / seatCount) * seatIndex) * Math.PI) / 180
}

export function GrimoireCanvas({
  seats,
  shield,
  startOffset = 0,
  selectedSeatIds = [],
  actionHint,
  onSelectSeat,
  ghostVotesRemaining = null,
  pendingCount = null,
  pendingLabel,
}: GrimoireCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const node = stageRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      setStage({ width: box.width, height: box.height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const layout = solveRingLayout({
    seatCount: seats.length,
    stageWidth: stage.width,
    stageHeight: stage.height,
    startOffset,
  })
  const visibility = shieldVisibility(shield)
  const selected = new Set(selectedSeatIds)

  return (
    <div className="grimoire-canvas" data-mode={layout.mode} data-shield={shield}>
      <div className="grimoire-canvas__stage" ref={stageRef}>
        {!visibility.seatIdentity ? (
          // L0：秘密整段不进 DOM，只留一句话和恢复入口（恢复键在调用方的遮蔽栏上）。
          <p className="grimoire-canvas__blackout" role="status">魔典已盖上</p>
        ) : seats.length === 0 ? (
          <EmptyState
            title="尚未配座"
            description="确认配板后座位会排成环。"
          />
        ) : (
          <>
            <GrimoireCore
              seats={seats.map((seat) => ({
                seatId: seat.seatId,
                nickname: seat.nickname ?? '',
                role: null,
                state: seat.state,
              }))}
              layout={layout}
              ghostVotesRemaining={ghostVotesRemaining}
              pendingCount={pendingCount}
              pendingLabel={pendingLabel}
            />
            {layout.mode === 'ring' ? (
              seats.map((seat, index) => {
                const place = layout.seats[index]
                return (
                  <GrimoireSeat
                    key={seat.seatId}
                    seatId={seat.seatId}
                    nickname={seat.nickname}
                    state={seat.state}
                    role={seat.role}
                    shield={shield}
                    centerX={place.x + layout.tokenSize / 2}
                    centerY={place.y + layout.tokenSize / 2}
                    tokenSize={layout.tokenSize}
                    radialAngle={radialAngleFor(index, seats.length, startOffset)}
                    satelliteInside={layout.satelliteInside}
                    selected={selected.has(seat.seatId)}
                    actionHint={actionHint}
                    onSelect={onSelectSeat}
                  />
                )
              })
            ) : (
              // 窄屏退化：画不成能用的环时改网格，而不是硬画一个挤成一团的环。
              <div className="grimoire-canvas__grid">
                {seats.map((seat, index) => (
                  <GrimoireSeat
                    key={seat.seatId}
                    seatId={seat.seatId}
                    nickname={seat.nickname}
                    state={seat.state}
                    role={seat.role}
                    shield={shield}
                    centerX={0}
                    centerY={0}
                    tokenSize={layout.tokenSize}
                    radialAngle={radialAngleFor(index, seats.length, startOffset)}
                    satelliteInside={false}
                    flow
                    selected={selected.has(seat.seatId)}
                    actionHint={actionHint}
                    onSelect={onSelectSeat}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
