/**
 * 座位卫星 chip 层。
 *
 * 两种形态，由「这一局的环能不能写」决定：
 * - 只读（G1 的观察面）：chip 是 aria-hidden 的 span，整个座位只有 token 一颗键。
 *   读屏用户从 token 的可访问名里听到「3枚标记」，不必逐枚 Tab 过去。
 * - 可写（G2）：每枚 chip 是自己的一颗键。按钮不能套按钮，所以这一层由 GrimoireSeat
 *   在 token 之外渲染，而不是塞进 token 里。
 *
 * 为什么不干脆一律做成按钮：只读环上有 20 个座位 × 最多 3 枚 chip，
 * 全变成键会在 Tab 序里插进 60 个什么都不做的停靠点，把键盘用户从环上走一遍的成本
 * 从 20 次按键抬到 80 次。可操作性要付的代价只在真正可操作时付。
 */
import { Sparkles } from 'lucide-react'
import type { CSSProperties } from 'react'
import { SEAT_ACTION_HOLD_MS } from '../write/seatActions'
import { chipGestureFor, type ChipHoldIntent, type ChipTapIntent } from '../write/chipGesture'
import { useHoldGesture } from '../write/useHoldGesture'
import type { SatellitePlacement } from '../layout/satelliteArc'
import type { SeatChip } from './seatChips'

export interface SeatChipGestureEvent {
  chip: SeatChip
  tap?: ChipTapIntent
  hold?: ChipHoldIntent
}

interface SeatChipLayerProps {
  seatId: number
  chips: readonly SeatChip[]
  placements: readonly SatellitePlacement[]
  tokenSize: number
  /** 不传 = 只读环，chip 退回 aria-hidden 的 span。 */
  onChipGesture?: (event: SeatChipGestureEvent) => void
}

function chipStyle(placement: SatellitePlacement, tokenSize: number): CSSProperties {
  return {
    width: placement.size,
    height: placement.size,
    left: tokenSize / 2 + placement.dx - placement.size / 2,
    top: tokenSize / 2 + placement.dy - placement.size / 2,
  }
}

function chipClassName(chip: SeatChip) {
  return [
    'grimoire-seat__chip',
    `grimoire-seat__chip--${chip.kind}`,
    chip.draft ? 'grimoire-seat__chip--draft' : '',
  ].filter(Boolean).join(' ')
}

function chipBody(chip: SeatChip) {
  if (chip.kind === 'fold') return `+${chip.foldedCount}`
  return chip.label
}

export function SeatChipLayer({ seatId, chips, placements, tokenSize, onChipGesture }: SeatChipLayerProps) {
  return (
    <>
      {chips.map((chip, index) => {
        const placement = placements[index]
        if (!placement) return null
        if (!onChipGesture) {
          return (
            <span key={chip.key} className={chipClassName(chip)} data-chip={chip.kind} style={chipStyle(placement, tokenSize)} aria-hidden="true">
              {chipBody(chip)}
            </span>
          )
        }
        return (
          <SeatChipButton
            key={chip.key}
            seatId={seatId}
            chip={chip}
            index={index}
            style={chipStyle(placement, tokenSize)}
            onChipGesture={onChipGesture}
          />
        )
      })}
    </>
  )
}

interface SeatChipButtonProps {
  seatId: number
  chip: SeatChip
  index: number
  style: CSSProperties
  onChipGesture: (event: SeatChipGestureEvent) => void
}

/**
 * 可访问名不能泄密：L1 下 chip.label 是 null，这里就只说「第几枚标记」。
 * 读屏同样是泄密面——把 label 写进 aria-label 等于给 L1 开了一扇后门。
 */
function chipAccessibleName(seatId: number, chip: SeatChip, index: number, hint: string) {
  const what = chip.draft
    ? `待确认 ${chip.label ?? '改动'}`
    : chip.kind === 'fold'
      ? `另有${chip.foldedCount}项`
      : chip.label ?? `标记${index + 1}`
  return [`${seatId}号`, what, hint].filter(Boolean).join('，')
}

export function SeatChipButton({ seatId, chip, index, style, onChipGesture }: SeatChipButtonProps) {
  const contract = chipGestureFor(chip)
  const hold = useHoldGesture(
    SEAT_ACTION_HOLD_MS,
    contract.hold ? () => onChipGesture({ chip, hold: contract.hold }) : undefined,
  )
  const tap = contract.tap === 'none' ? undefined : () => onChipGesture({ chip, tap: contract.tap })

  return (
    <button
      type="button"
      className={chipClassName(chip)}
      data-chip={chip.kind}
      data-draft={chip.draft ? 'true' : undefined}
      style={{ ...style, '--hold-progress': hold.progress } as CSSProperties}
      aria-label={chipAccessibleName(seatId, chip, index, contract.hint)}
      onClick={hold.wrapClick(tap)}
      onPointerDown={hold.onPointerDown}
      onPointerUp={hold.onPointerUp}
      onPointerLeave={hold.onPointerLeave}
      onPointerCancel={hold.onPointerCancel}
    >
      {chipBody(chip)}
      {chip.fromAI ? <Sparkles className="grimoire-seat__chip-ai" aria-hidden="true" /> : null}
    </button>
  )
}
