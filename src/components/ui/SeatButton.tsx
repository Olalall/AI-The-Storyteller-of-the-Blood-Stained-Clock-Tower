import { Check, Skull } from 'lucide-react'
import { useId } from 'react'
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
  /** 说书人端的核对文字；对外展示时由调用方省略。 */
  description?: string
}

export function SeatButton({
  seat,
  selected = false,
  subdued = false,
  dead = false,
  self = false,
  description,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SeatButtonProps) {
  const descriptionId = useId()
  const baseLabel = ariaLabel ?? `选择${seat}号`
  const classNames = [
    'seat-button',
    selected ? 'seat-button--selected' : '',
    dead ? 'seat-button--dead' : '',
    subdued ? 'seat-button--subdued' : '',
    description ? 'seat-button--detailed' : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      type="button"
      className={classNames}
      aria-label={`${baseLabel}${self ? '（本人）' : ''}${dead ? '（已死亡）' : ''}`}
      aria-describedby={[ariaDescribedBy, description ? descriptionId : undefined].filter(Boolean).join(' ') || undefined}
      aria-pressed={selected}
    >
      {self ? <span className="seat-button__self">本人</span> : null}
      <span className="seat-button__number">{seat}</span>
      {description ? <small id={descriptionId} className="seat-button__description">{description}</small> : null}
      {dead ? <span className="seat-button__dead"><Skull aria-hidden="true" /></span> : null}
      {selected ? <span className="seat-button__check"><Check aria-hidden="true" /></span> : null}
    </button>
  )
}
