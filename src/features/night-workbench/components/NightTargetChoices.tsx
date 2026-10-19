import { SeatButton } from '../../../components/ui/SeatButton'
import { selectedTargetCount, targetCountChosen } from '../state/projectWakeDraft'
import type { WakeDraft, WakeItem } from '../types'

interface Props {
  item: WakeItem
  draft: WakeDraft
  disabled: boolean
  playerCount: number
  onTarget: (seat: number) => void
  onTargetCountChoice?: (count: number) => void
  unavailableSeatIds?: number[]
}

export function NightTargetChoices({ item, draft, disabled, playerCount, onTarget, onTargetCountChoice, unavailableSeatIds = [] }: Props) {
  const count = selectedTargetCount(item, draft)
  const chosen = targetCountChosen(item, draft)
  return <>
    {item.allowedTargetCounts ? <fieldset disabled={disabled}>
      <legend>本次目标人数</legend>
      <p>先按已核实的技能状态选择人数；此选择不会自动判断蓄力或改变玩家状态。</p>
      <div className="choice-chips">
        {item.allowedTargetCounts.map((value) => <button key={value} type="button"
          className={draft.targetCountChoice === value ? 'choice-chip choice-chip--selected' : 'choice-chip'}
          aria-pressed={draft.targetCountChoice === value} onClick={() => onTargetCountChoice?.(value)}
        >{value === 0 ? '不选目标' : `选择${value}名玩家`}</button>)}
      </div>
    </fieldset> : null}
    {chosen && count > 0 ? <fieldset disabled={disabled}>
      <legend>{item.targetLabel ?? '目标'} <span>{draft.targets.length}/{count}</span></legend>
      <div className="seat-grid">
        {Array.from({ length: playerCount }, (_, index) => index + 1).map((seat) => <SeatButton
          key={seat} seat={seat} selected={draft.targets.includes(seat)} self={seat === item.seatId}
          disabled={unavailableSeatIds.includes(seat) || Boolean(item.forbiddenTargetSeatIds?.includes(seat) && !draft.targets.includes(seat))} dead={unavailableSeatIds.includes(seat)}
          onClick={() => onTarget(seat)} aria-label={`选择${seat}号玩家`}
        />)}
      </div>
    </fieldset> : null}
  </>
}
