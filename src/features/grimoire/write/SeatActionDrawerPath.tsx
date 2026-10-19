/**
 * 抽屉里的等价路径：不用碰环也能改任何一个座位的状态。
 *
 * 这不是「顺便也做一份」，而是环上那两个手势的**前提条件**。
 * idle 单击在夜里被「选目标」占着，长按键盘发不出来、读屏也不会播报它存在——
 * 也就是说，没有这一块，键盘与读屏用户在夜里根本改不了状态。
 * 设计文档把这条写成硬要求，理由就是这个：长按只能是加速器。
 *
 * 删除标记在这里走**二段确认**（第一下变成「确认删除 X」，第二下才装填草稿），
 * 与环上的长按是同一条摩擦的两种形态。单点即删在任何一条路上都不允许。
 */
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { SeatButton } from '../../../components/ui/SeatButton'
import { SeatActionGrid } from './SeatActionGrid'
import { SEAT_ACTION_EQUIVALENT_PATH_LABEL, type SeatActionCell } from './seatActions'
import type { PlayerState } from '../../game-session/model/playerTypes'
import './grimoire-write.css'

interface SeatActionDrawerPathProps {
  /** 座位号顺序由调用方给：这一块不认识布局，也不该自己排座。 */
  seatIds: readonly number[]
  playerStates: Readonly<Record<number, PlayerState>>
  /** 标记文字在 L1 下不进 DOM，所以能不能列出标记由调用方按遮蔽级别决定。 */
  markerDetail: boolean
  onDraft: (seatId: number, cell: SeatActionCell) => void
  onAddMarker: (seatId: number, label: string) => void
  onRemoveMarker: (seatId: number, markerId: string) => void
  onOpenRoleChange: (seatId: number) => void
  onOpenSeatCard: (seatId: number) => void
}

export function SeatActionDrawerPath({
  seatIds,
  playerStates,
  markerDetail,
  onDraft,
  onAddMarker,
  onRemoveMarker,
  onOpenRoleChange,
  onOpenSeatCard,
}: SeatActionDrawerPathProps) {
  const [open, setOpen] = useState(false)
  const [seatId, setSeatId] = useState<number | null>(null)
  const [markerLabel, setMarkerLabel] = useState('')
  /** 二段删除的第一段：记住此刻哪一枚标记处于「再按一次就删」的状态。 */
  const [armedMarkerId, setArmedMarkerId] = useState<string | null>(null)

  const state = seatId === null ? undefined : playerStates[seatId]

  const submitMarker = () => {
    const label = markerLabel.trim()
    if (!label || seatId === null) return
    onAddMarker(seatId, label)
    setMarkerLabel('')
  }

  return (
    <section className="seat-action-path" aria-label={SEAT_ACTION_EQUIVALENT_PATH_LABEL}>
      <Button
        type="button"
        variant="ghost"
        compact
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {SEAT_ACTION_EQUIVALENT_PATH_LABEL}（不碰环也能改）
      </Button>
      {open ? (
        <div className="seat-action-path__body">
          <div className="seat-action-path__seats" role="group" aria-label="选择座位">
            {seatIds.map((id) => (
              <SeatButton
                key={id}
                seat={id}
                selected={id === seatId}
                dead={playerStates[id]?.life === 'dead'}
                onClick={() => { setSeatId(id === seatId ? null : id); setArmedMarkerId(null) }}
              />
            ))}
          </div>
          {seatId !== null && state ? (
            <>
              <SeatActionGrid
                state={state}
                onAction={(cell) => {
                  if (cell.id === 'role-change') return onOpenRoleChange(seatId)
                  if (cell.id === 'seat-card') return onOpenSeatCard(seatId)
                  if (cell.id === 'add-marker') return
                  onDraft(seatId, cell)
                }}
              />
              <div className="seat-action-path__marker">
                <label className="seat-action-path__marker-label" htmlFor="drawer-marker-label">加标记</label>
                <input
                  id="drawer-marker-label"
                  className="seat-action-path__marker-input"
                  value={markerLabel}
                  onChange={(event) => setMarkerLabel(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') submitMarker() }}
                />
                <Button type="button" variant="secondary" compact onClick={submitMarker} disabled={!markerLabel.trim()}>
                  加为草稿
                </Button>
              </div>
              {markerDetail ? (
                <ul className="seat-action-path__markers">
                  {state.markers.map((marker) => (
                    <li key={marker.id}>
                      <span className="seat-action-path__marker-name">{marker.label}</span>
                      <Button
                        type="button"
                        variant={armedMarkerId === marker.id ? 'danger' : 'ghost'}
                        compact
                        onClick={() => {
                          if (armedMarkerId !== marker.id) return setArmedMarkerId(marker.id)
                          setArmedMarkerId(null)
                          onRemoveMarker(seatId, marker.id)
                        }}
                      >
                        {armedMarkerId === marker.id ? `确认删除 ${marker.label}` : '删除'}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                // L1 下标记文字不进 DOM，所以这里连列表都不列——列出来就等于把 label 放进了 DOM。
                <p className="seat-action-path__concealed">标记文字在席位视图下不显示；要逐枚处理请先揭示魔典。</p>
              )}
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
