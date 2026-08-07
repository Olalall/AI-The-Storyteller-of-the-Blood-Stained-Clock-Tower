import { Check, Skull } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import './ui.css'

interface SeatButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  seat: number
  selected?: boolean
  /** 纯低强调：只降低视觉权重，不表达死亡、规则限制或任何业务状态。 */
  subdued?: boolean
  /** 该座位玩家已死亡：虚线描边 + Skull 图标 + 语义色三重编码，并写进可访问名。 */
  dead?: boolean
  /** 该座位是当前行动者本人：左上角“本人”文字角标。 */
  self?: boolean
}

export function SeatButton({
  seat,
  selected = false,
  subdued = false,
  dead = false,
  self = false,
  className,
  'aria-label': ariaLabel,
  ...props
}: SeatButtonProps) {
  const baseLabel = ariaLabel ?? `选择${seat}号`
  const classNames = [
    'seat-button',
    selected ? 'seat-button--selected' : '',
    dead ? 'seat-button--dead' : '',
    subdued ? 'seat-button--subdued' : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      type="button"
      className={classNames}
      aria-label={`${baseLabel}${self ? '（本人）' : ''}${dead ? '（已死亡）' : ''}`}
      aria-pressed={selected}
    >
      {self ? <span className="seat-button__self">本人</span> : null}
      <span className="seat-button__number">{seat}</span>
      {dead ? <span className="seat-button__dead"><Skull aria-hidden="true" /></span> : null}
      {selected ? <span className="seat-button__check"><Check aria-hidden="true" /></span> : null}
    </button>
  )
}
