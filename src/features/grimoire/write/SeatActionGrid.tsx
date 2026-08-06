/**
 * 六格 3×2 网格本体。
 *
 * 单独成文件，是因为它必须被**两处**用同一份实现渲染：环上的锚定浮层，
 * 和抽屉里的等价路径。抄一份到抽屉里，两边的格子顺序、开关文案、danger 色
 * 会在第一次改文案时分家——而分家的后果是同一个说书人在两条路上点到不同的东西。
 *
 * 网格自己不产生任何写入，也不认识 session：它只把「哪一格被按了」交回上层。
 */
import { Button } from '../../../components/ui/Button'
import { seatActionCells, type SeatActionCell } from './seatActions'
import type { PlayerState } from '../../game-session/model/playerTypes'
import './grimoire-write.css'

interface SeatActionGridProps {
  state: PlayerState
  onAction: (cell: SeatActionCell) => void
  /** 归档回看等只读场合把六格全禁掉；靠 prop 强制，不靠调用方自觉。 */
  readOnly?: boolean
  /**
   * 分组名。**不传就不成组**——浮层已经是一个叫「N号 座位操作」的分组，
   * 网格再叫同一个名字，读屏会连着念两个同名区域，用户以为自己开了两层。
   */
  label?: string
}

export function SeatActionGrid({ state, onAction, readOnly = false, label }: SeatActionGridProps) {
  return (
    <div className="seat-action-grid" role={label ? 'group' : undefined} aria-label={label}>
      {seatActionCells(state).map((cell) => (
        <Button
          key={cell.id}
          type="button"
          variant={cell.danger ? 'danger' : cell.active ? 'secondary' : 'ghost'}
          className={`seat-action-grid__cell seat-action-grid__cell--${cell.id}`}
          disabled={readOnly}
          // 前四格是开关，按下去把座位改成另一半状态；aria-pressed 说明「现在是不是这个状态」。
          aria-pressed={cell.draftKind ? cell.active : undefined}
          onClick={() => onAction(cell)}
        >
          {cell.label}
        </Button>
      ))}
    </div>
  )
}
