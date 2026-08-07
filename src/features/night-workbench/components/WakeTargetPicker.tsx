/**
 * 目标怎么选：两种呈现，一条写入。
 *
 * `grid` 是纯记录模式一直以来的 6 列号码网格，一个字没改。
 * `ring` 是魔典模式：主选择面搬到环上，抽屉里只留一行回显 + 一个折叠的同款网格。
 *
 * 抽成一个组件而不是在 CurrentWakeCard 里写一个三元，是因为这两支迟早要各自长东西
 * （环那支要加「已选顺序」，网格那支要保持纹丝不动），而 CurrentWakeCard 已经
 * 顶在 320 行预算上——下一个人会先删注释再加代码。
 */
import { SeatButton } from '../../../components/ui/SeatButton'
import { NightTargetEcho } from './NightTargetEcho'

export type WakeTargetPickerKind = 'grid' | 'ring'

interface WakeTargetPickerProps {
  picker: WakeTargetPickerKind
  playerCount: number
  selfSeatId: number
  targetLabel: string
  targetCount: number
  targets: readonly number[]
  disabled: boolean
  onTarget: (seat: number) => void
}

export function WakeTargetPicker({
  picker,
  playerCount,
  selfSeatId,
  targetLabel,
  targetCount,
  targets,
  disabled,
  onTarget,
}: WakeTargetPickerProps) {
  if (picker === 'ring') {
    return (
      <NightTargetEcho
        playerCount={playerCount}
        selfSeatId={selfSeatId}
        targetLabel={targetLabel}
        targetCount={targetCount}
        targets={targets}
        disabled={disabled}
        onTarget={onTarget}
      />
    )
  }

  return (
    <fieldset disabled={disabled}>
      <legend>{targetLabel} <span>{targets.length}/{targetCount}</span></legend>
      <div className="seat-grid">
        {Array.from({ length: playerCount }, (_value, index) => index + 1).map((seat) => (
          <SeatButton
            key={seat}
            seat={seat}
            selected={targets.includes(seat)}
            self={seat === selfSeatId}
            onClick={() => onTarget(seat)}
            aria-label={`选择${seat}号玩家`}
          />
        ))}
      </div>
    </fieldset>
  )
}
