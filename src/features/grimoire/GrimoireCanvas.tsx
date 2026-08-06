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
import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { EmptyState } from '../../components/ui/EmptyState'
import { GrimoireCore } from './core/GrimoireCore'
import { GrimoireSeat, type GrimoireSeatRole } from './seat/GrimoireSeat'
import type { SeatChipGestureEvent } from './seat/SeatChipLayer'
import type { SeatGhostChip } from './seat/seatChips'
import { solveRingLayout } from './layout/ellipseRing'
import { shieldVisibility, type ShieldLevel } from './shield/shieldLevel'
import type { RingStartOffset } from './layout/ellipseRing'
import type { PlayerState } from '../game-session/model/playerTypes'
import type {
  GrimoireCorePhase,
  GrimoireDawnRoll,
  GrimoireDayTimer,
  GrimoireDuskBrief,
  GrimoireNightCursor,
  GrimoireVoteTally,
} from './core/corePhase'
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
  /**
   * G2 写入层。画布本身仍然零 dispatch——这三个回调全都只往上报手势，
   * 「点了什么就写什么」这条路在这一层依然不存在。
   */
  onSeatHold?: (seatId: number) => void
  onChipGesture?: (seatId: number, event: SeatChipGestureEvent) => void
  ghostsBySeat?: Readonly<Record<number, readonly SeatGhostChip[]>>
  ghostLifeBySeat?: Readonly<Record<number, 'dead' | 'alive'>>
  /** 锚在某个座位下方的浮层（SeatActionBar）。只有这一座会拿到它。 */
  anchoredSeatId?: number | null
  renderSeatAnchor?: (seatId: number) => ReactNode
  ghostVotesRemaining?: number | null
  pendingCount?: number | null
  pendingLabel?: string
  /** 核里多出哪一块相位内容；下面五个槽各自只在对应相位被读。 */
  phase?: GrimoireCorePhase
  night?: GrimoireNightCursor
  timer?: GrimoireDayTimer
  vote?: GrimoireVoteTally
  dusk?: GrimoireDuskBrief
  dawn?: GrimoireDawnRoll
  /** 核顶行「乌鸦渡口 · 12人」标识里的剧本名。 */
  scriptName?: string | null
  /** 顶行标识的点击目标：本局信息浮层（裁决 7 定下的模式切换入口就在里面）。 */
  onOpenSessionInfo?: () => void
  /**
   * 双指点画布 = 立刻全遮蔽。这是盲操作路径：说书人抬头发现有人凑过来时，
   * 手不必先找按钮——按钮在哪一档、在不在视野里，那一秒都来不及想。
   */
  onBlindCover?: () => void
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
  onSeatHold,
  onChipGesture,
  ghostsBySeat,
  ghostLifeBySeat,
  anchoredSeatId = null,
  renderSeatAnchor,
  ghostVotesRemaining = null,
  pendingCount = null,
  pendingLabel,
  phase = 'idle',
  night,
  timer,
  vote,
  dusk,
  dawn,
  scriptName = null,
  onOpenSessionInfo,
  onBlindCover,
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

  // 只认「同时落下两指」这一下。用 touchstart 而不是 pointerdown：多指要靠 touches 计数，
  // pointer 事件一指一条，攒两条就得自己维护一张按下中的指针表，那张表迟早在
  // 触控笔/鼠标混用时漏删一条，然后画布会莫名其妙自己盖上。
  const handleTouchStart = onBlindCover
    ? (event: TouchEvent<HTMLDivElement>) => { if (event.touches.length >= 2) onBlindCover() }
    : undefined

  // 环与网格两条渲染路径共用同一份写入 props。抄两遍的话，下一次加一个手势
  // 只会被加进其中一条，而窄屏那条正是最难被人工验到的那一条。
  const writeProps = (seatId: number) => ({
    onHold: onSeatHold,
    onChipGesture,
    ghosts: ghostsBySeat?.[seatId],
    ghostLife: ghostLifeBySeat?.[seatId],
    anchored: anchoredSeatId === seatId ? renderSeatAnchor?.(seatId) : undefined,
  })

  return (
    <div className="grimoire-canvas" data-mode={layout.mode} data-shield={shield}>
      <div className="grimoire-canvas__stage" ref={stageRef} onTouchStart={handleTouchStart}>
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
              phase={phase}
              night={night}
              timer={timer}
              vote={vote}
              dusk={dusk}
              dawn={dawn}
              scriptName={scriptName}
              onOpenSessionInfo={onOpenSessionInfo}
              shield={shield}
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
                    satelliteInside={place.satelliteInside}
                    selected={selected.has(seat.seatId)}
                    actionHint={actionHint}
                    onSelect={onSelectSeat}
                    {...writeProps(seat.seatId)}
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
                    {...writeProps(seat.seatId)}
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
