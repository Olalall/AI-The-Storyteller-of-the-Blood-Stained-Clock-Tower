import { Check } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import './ui.css'

interface SeatButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  seat: number
  selected?: boolean
  subdued?: boolean
}

export function SeatButton({ seat, selected = false, subdued = false, className, 'aria-label': ariaLabel, ...props }: SeatButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={`seat-button ${selected ? 'seat-button--selected' : ''} ${subdued ? 'seat-button--subdued' : ''} ${className ?? ''}`}
      aria-label={ariaLabel ?? `选择${seat}号`}
      aria-pressed={selected}
    >
      <span className="seat-button__number">{seat}</span>
      {selected ? <span className="seat-button__check"><Check aria-hidden="true" /></span> : null}
    </button>
  )
}
