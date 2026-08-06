/**
 * 锚定在座位下方的 SeatActionBar 浮层。
 *
 * 打开它有两条路，缺一不可：
 * - **idle 单击**：抽屉当前这一步没有认领点座位这个手势时，单击就是打开它。
 *   这条路键盘（Enter/Space）与读屏都走得通，所以它才是主入口。
 * - **长按 400ms**：夜里单击已经被「选目标」占了，这时长按是加速器。
 *   它永不做唯一入口——设计系统禁止隐藏式长按，而键盘和读屏根本发不出这个手势。
 *   夜里的等价路径在抽屉（见 SeatActionDrawerPath）。
 *
 * 浮层期间禁止画布位移：逆向方案里的「rAF 持续跟随」在低端设备上是持续掉帧源，
 * 而它解决的问题（浮层跟着 token 跑）在这里根本不存在——浮层是 token 的子节点。
 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { SeatActionGrid } from './SeatActionGrid'
import type { SeatActionCell } from './seatActions'
import type { PlayerState } from '../../game-session/model/playerTypes'
import './grimoire-write.css'

export interface SeatActionBarProps {
  seatId: number
  state: PlayerState
  /** 前四格：只写草稿，永不 dispatch。 */
  onDraft: (cell: SeatActionCell) => void
  /** 「加标记」填完文字后。 */
  onAddMarker: (label: string) => void
  /** 第五格「更换角色」：抽屉 full 原样渲染现有 RoleChangeSheet。 */
  onOpenRoleChange: () => void
  /** 第六格「座位卡」：完整 PlayerStatusSheet。 */
  onOpenSeatCard: () => void
  onClose: () => void
}

export function SeatActionBar({
  seatId,
  state,
  onDraft,
  onAddMarker,
  onOpenRoleChange,
  onOpenSeatCard,
  onClose,
}: SeatActionBarProps) {
  const [markerStep, setMarkerStep] = useState(false)
  const [markerLabel, setMarkerLabel] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  // 打开就把焦点送进来：不移焦的话键盘用户按了 Enter 之后焦点还留在 token 上，
  // 浮层里的六格要再 Tab 六次才够得着，而 Esc 也不会落在这个 handler 上。
  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  // 点浮层之外任何地方就收起来。用 pointerdown 而不是 click：
  // 说书人的下一下往往落在另一个座位上，等到 click 才关会让那一下先被浮层吃掉。
  useEffect(() => {
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const root = rootRef.current
      if (root && event.target instanceof Node && !root.contains(event.target)) onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [onClose])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    onClose()
  }

  const handleCell = (cell: SeatActionCell) => {
    if (cell.id === 'add-marker') {
      setMarkerStep(true)
      return
    }
    if (cell.id === 'role-change') {
      onOpenRoleChange()
      return
    }
    if (cell.id === 'seat-card') {
      onOpenSeatCard()
      return
    }
    onDraft(cell)
  }

  const submitMarker = () => {
    const label = markerLabel.trim()
    if (!label) return
    onAddMarker(label)
    setMarkerLabel('')
    setMarkerStep(false)
  }

  return (
    <div
      className="seat-action-bar"
      ref={rootRef}
      tabIndex={-1}
      role="group"
      aria-label={`${seatId}号 座位操作`}
      onKeyDown={handleKeyDown}
    >
      {markerStep ? (
        <div className="seat-action-bar__marker">
          <label className="seat-action-bar__marker-label" htmlFor={`seat-marker-${seatId}`}>
            给 {seatId}号 加什么标记
          </label>
          <input
            id={`seat-marker-${seatId}`}
            className="seat-action-bar__marker-input"
            value={markerLabel}
            autoFocus
            onChange={(event) => setMarkerLabel(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') submitMarker() }}
          />
          <Button type="button" variant="primary" compact onClick={submitMarker} disabled={!markerLabel.trim()}>
            加为草稿
          </Button>
        </div>
      ) : (
        <SeatActionGrid state={state} onAction={handleCell} />
      )}
      {/* 明写这一句而不是靠说书人推断：六格里没有一格会立刻改状态，
          这是「点错了也没关系」这个心理前提的唯一出处。 */}
      <p className="seat-action-bar__contract">点任一格只记草稿，抽屉里确认才落账</p>
    </div>
  )
}
