/**
 * 抽屉 peek 档上的单动作条：「确认 5号 状态」。
 *
 * 它是草稿与落账之间那一步，也是魔典写入的**唯一**出口。
 * 之所以放在抽屉而不是浮层里：浮层跟着手指走、离刚点的那一格只有几十像素，
 * 「点错一格顺手把确认也点了」是最容易发生的一串误操作。抽屉在屏幕另一端，
 * 手要走一段路，这段路就是那道摩擦。
 *
 * 死亡走 danger 色并与其余状态分开：死亡是六格里唯一会改变整局走向的一下。
 *
 * 「记入哪个段」的下拉留在这条上，默认取当前相位。它必须可改——
 * 说书人常常在下一段才想起来「刚才那一下其实是上一夜的事」，
 * 而 createdAt 一律是真实此刻（投影严格按 createdAt 叠加，回填会改变覆盖顺序）。
 */
import { Button } from '../../../components/ui/Button'
import type { ProjectedSeatWrite } from './seatDraft'
import './grimoire-write.css'

export interface ConfirmSegmentOption {
  id: string
  label: string
}

interface SeatConfirmBarProps {
  projected: ProjectedSeatWrite
  segments: readonly ConfirmSegmentOption[]
  segmentId: string | null
  onSegmentChange: (segmentId: string | null) => void
  onConfirm: () => void
  onCancel: () => void
}

export function SeatConfirmBar({
  projected,
  segments,
  segmentId,
  onSegmentChange,
  onConfirm,
  onCancel,
}: SeatConfirmBarProps) {
  return (
    <div className="seat-confirm-bar" data-danger={projected.danger ? 'true' : undefined}>
      <p className="seat-confirm-bar__what">{projected.label}</p>
      <label className="seat-confirm-bar__segment">
        <span className="seat-confirm-bar__segment-label">记入</span>
        <select
          className="seat-confirm-bar__segment-select"
          value={segmentId ?? ''}
          onChange={(event) => onSegmentChange(event.target.value || null)}
        >
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>{segment.label}</option>
          ))}
          <option value="">不记入相位</option>
        </select>
      </label>
      <Button type="button" variant="ghost" compact onClick={onCancel}>取消</Button>
      <Button
        type="button"
        variant={projected.danger ? 'danger' : 'primary'}
        onClick={onConfirm}
      >
        确认 {projected.seatId}号 状态
      </Button>
    </div>
  )
}
