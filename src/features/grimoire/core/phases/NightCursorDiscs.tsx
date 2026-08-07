/**
 * 夜态：250px 转盘降级进核。
 *
 * 只留「当前 / 下一位」两枚 small(58px) RoleDisc 与两侧带座位号标签的 ‹ ›。
 * 空间定位这件事交给环去做（当前项座位是全屏唯一暖金焦点环），
 * 核里这两枚盘回答的是另一个问题：「我现在叫的是谁、下一个叫谁」。
 *
 * ‹ › 只回调，不改任何东西。核不持有夜序光标——光标真值在夜序状态机里，
 * 核复制一份就会出现两个「当前是第几项」，而它们迟早不一致。
 */
import { RoleDisc } from '../../../../components/ui/RoleDisc'
import { CORE_PHASE_LABEL, CORE_UNKNOWN, type GrimoireNightCursor, type NightCursorItem } from '../corePhase'

interface NightCursorDiscsProps {
  cursor: GrimoireNightCursor
  /** 角色面能不能进 DOM。L1 下双盘只画 concealed 态，角色名与图标 src 一律不渲染。 */
  roleVisible: boolean
}

interface StepButtonProps {
  direction: 'back' | 'forward'
  seatId: number | null
  onPress?: () => void
}

function StepButton({ direction, seatId, onPress }: StepButtonProps) {
  const forward = direction === 'forward'
  const seatText = seatId === null ? CORE_UNKNOWN : `${seatId}号`
  return (
    <button
      type="button"
      className="grimoire-core__step"
      // 核整块 pointer-events: none，可点元素必须逐个开。这一行就是「只有这几个能点」的执行点。
      style={{ pointerEvents: 'auto' }}
      data-step={direction}
      disabled={!onPress || seatId === null}
      aria-label={`${forward ? '下一位' : '上一位'}：${seatText}`}
      // 刻意包一层空参调用：直接把 onPress 挂上去会把 MouseEvent 塞进回调，
      // 而回调签名一旦能收东西，早晚会有人往里塞算出来的值。
      onClick={onPress ? () => onPress() : undefined}
    >
      <span className="grimoire-core__step-arrow" aria-hidden="true">{forward ? '›' : '‹'}</span>
      <span className="grimoire-core__step-seat" aria-hidden="true">{seatText}</span>
    </button>
  )
}

interface CursorDiscProps {
  slot: string
  item: NightCursorItem | null
  roleVisible: boolean
  active?: boolean
}

function CursorDisc({ slot, item, roleVisible, active = false }: CursorDiscProps) {
  const role = roleVisible ? item?.role ?? null : null
  // 三种「画不出角色」要分清楚：队列到头（没有这一项）、遮蔽（有但不许进 DOM）、
  // 工具里没配过板（有这一项但根本没有角色）。只有第二种才画「隐」态盘——
  // 对另外两种画「隐」等于宣称「有个角色藏在这」，那是编造。
  const showDisc = item !== null && (!roleVisible || item.role !== null)
  return (
    <div className="grimoire-core__disc" data-slot={slot} data-filled={item !== null}>
      {showDisc ? (
        <RoleDisc
          initial={role?.initial ?? ''}
          roleName={role?.name ?? ''}
          concealed={role === null}
          imageSrc={role?.imageSrc}
          active={active}
          size="small"
        />
      ) : (
        <span className="grimoire-core__disc-blank" aria-hidden="true">{CORE_UNKNOWN}</span>
      )}
      <span className="grimoire-core__disc-caption">
        <span className="grimoire-core__disc-slot">{slot}</span>
        <strong className="grimoire-core__disc-seat">{item === null ? CORE_UNKNOWN : `${item.seatId}号`}</strong>
      </span>
    </div>
  )
}

export function NightCursorDiscs({ cursor, roleVisible }: NightCursorDiscsProps) {
  const { current, next, previousSeatId = null, onStepBack, onStepForward } = cursor
  return (
    <div className="grimoire-core__night" role="group" aria-label={CORE_PHASE_LABEL.night}>
      <StepButton direction="back" seatId={previousSeatId} onPress={onStepBack} />
      <div className="grimoire-core__discs">
        <CursorDisc slot="当前" item={current} roleVisible={roleVisible} active />
        <CursorDisc slot="下一位" item={next} roleVisible={roleVisible} />
      </div>
      <StepButton direction="forward" seatId={next?.seatId ?? null} onPress={onStepForward} />
    </div>
  )
}
