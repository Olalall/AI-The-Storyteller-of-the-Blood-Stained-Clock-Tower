/**
 * 环上的座位 token。
 *
 * 它是 SeatButton 的**另一种呈现**，不是另一种语义：同一个 seatId，共用选中态契约
 * （勾选 + 描边 + 颜色 + aria-pressed）。两边各自发明选中语义会让说书人在抽屉的号码网格
 * 和环之间来回时读错谁被选中了。
 *
 * 内部渲染纯展示的 RoleDisc，不给 RoleDisc 加任何新 prop——死亡、中毒、醉酒的表达
 * 一律在这一层覆盖，RoleDisc 保持零业务耦合。
 *
 * 遮蔽由 shieldVisibility 决定「渲不渲染」而不是「显不显示」：L1 下角色名、图标 src、
 * 标记 label 全部不进 DOM。这条不能靠 CSS，CSS 挡不住截屏、屏读器和 devtools。
 *
 * G2 起有两种根元素形态，由「chip 能不能操作」决定：
 * - 只读（G1 的观察面）：根就是那颗 token 键，chip 是 aria-hidden 的装饰。
 * - 可写：chip 各自是一颗键，而按钮不能套按钮，所以根退成一个定位容器，
 *   token 变成容器里的第一颗键。两种形态共用同一份 class 与行内定位，
 *   区别只在标签名——把它做成两个组件才是真正的分叉。
 */
import { Skull } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { RoleDisc } from '../../../components/ui/RoleDisc'
import type { PlayerState } from '../../game-session/model/playerTypes'
import { satellitePlacements } from '../layout/satelliteArc'
import { SEAT_ACTION_HOLD_MS } from '../write/seatActions'
import { useHoldGesture } from '../write/useHoldGesture'
import { shieldVisibility, type ShieldLevel } from '../shield/shieldLevel'
import { foldChips, seatChips, type SeatGhostChip } from './seatChips'
import { SeatChipLayer, type SeatChipGestureEvent } from './SeatChipLayer'
import './grimoire-seat.css'

/** 命中区外扩下限。token 降到 64px 时手指仍要够得着。 */
export const SEAT_HIT_TARGET = 56

export interface GrimoireSeatRole {
  roleId: string
  name: string
  initial: string
  imageSrc?: string
  /** 本局中途换过角色，沿用 RoleDisc 已有的 changed 角标。 */
  changed?: boolean
}

export interface GrimoireSeatProps {
  seatId: number
  nickname?: string
  state: PlayerState
  role: GrimoireSeatRole | null
  shield: ShieldLevel
  /** token 圆心，由 solveRingLayout 给出。 */
  centerX: number
  centerY: number
  tokenSize: number
  /** token 相对 core 的方位角（弧度），卫星弧沿它向外铺。 */
  radialAngle: number
  /** 弧距不足时卫星弧翻到内侧。 */
  satelliteInside?: boolean
  /**
   * 环退化为网格时改用正常流排布：此时 centerX/centerY 无意义，绝对定位会把所有
   * token 叠在原点。行内 left/top 会盖过样式表，所以只能在这一层决定要不要写。
   */
  flow?: boolean
  selected?: boolean
  /** 抽屉当前步骤决定点座位干什么；这行字会进可访问名，让读屏也知道此刻点下去等于什么。 */
  actionHint?: string
  onSelect?: (seatId: number) => void
  disabled?: boolean
  /** 尚未落盘的草稿幽灵 chip。 */
  ghosts?: readonly SeatGhostChip[]
  /** 这一座位上挂着一条生死草稿：token 上盖一层虚线幽灵帷幕，与实体帷幕明显不同。 */
  ghostLife?: 'dead' | 'alive'
  /** 长按 400ms 的加速器。它永远只是第二条路，等价入口在抽屉里。 */
  onHold?: (seatId: number) => void
  onChipGesture?: (seatId: number, event: SeatChipGestureEvent) => void
  /** 锚在这个座位下方的浮层（SeatActionBar）。只有可写形态才有地方挂它。 */
  anchored?: ReactNode
}

function accessibleName(
  seatId: number,
  nickname: string | undefined,
  state: PlayerState,
  role: GrimoireSeatRole | null,
  roleVisible: boolean,
  chipCount: number,
  actionHint: string | undefined,
): string {
  const parts = [`${seatId}号`]
  if (nickname) parts.push(nickname)
  if (roleVisible && role) parts.push(role.name)
  if (state.life === 'dead') parts.push('已死亡')
  if (state.poisoned) parts.push('中毒')
  if (state.drunk) parts.push('醉酒')
  // 遮蔽下只播报枚数，不播报是哪几枚——屏读器同样是泄密面。
  if (chipCount > 0 && !roleVisible) parts.push(`${chipCount}枚标记`)
  if (actionHint) parts.push(actionHint)
  return parts.join('，')
}

export function GrimoireSeat({
  seatId,
  nickname,
  state,
  role,
  shield,
  centerX,
  centerY,
  tokenSize,
  radialAngle,
  satelliteInside = false,
  flow = false,
  selected = false,
  actionHint,
  onSelect,
  disabled = false,
  ghosts,
  ghostLife,
  onHold,
  onChipGesture,
  anchored,
}: GrimoireSeatProps) {
  const visibility = shieldVisibility(shield)
  const hold = useHoldGesture(SEAT_ACTION_HOLD_MS, onHold ? () => onHold(seatId) : undefined)
  // L0 下整个座位不渲染任何内容——不是盖住，是不进 DOM。
  // hook 必须在这一句之前调用完，否则 L0 与 L1 之间会换一套 hook 顺序。
  if (!visibility.seatIdentity) return null

  const roleVisible = visibility.roleIdentity && role !== null
  const chips = visibility.markerCount
    ? foldChips(seatChips(state, visibility.markerDetail, ghosts))
    : []
  const placements = satellitePlacements({
    count: chips.length,
    tokenSize,
    radialAngle,
    inside: satelliteInside,
  })

  const dead = state.life === 'dead'
  const impaired = visibility.impairments && (state.poisoned || state.drunk)
  const style: CSSProperties = {
    ...(flow ? {} : { left: centerX - tokenSize / 2, top: centerY - tokenSize / 2 }),
    width: tokenSize,
    height: tokenSize,
    // 命中区靠 ::before 外扩，不靠把 token 画大——放大 token 会挤掉弧距。
    '--seat-hit': `${Math.max(tokenSize, SEAT_HIT_TARGET)}px`,
    '--hold-progress': hold.progress,
  } as CSSProperties

  const classes = [
    'grimoire-seat',
    flow ? 'grimoire-seat--flow' : '',
    selected ? 'grimoire-seat--selected' : '',
    dead ? 'grimoire-seat--dead' : '',
    impaired ? 'grimoire-seat--impaired' : '',
    ghostLife ? 'grimoire-seat--ghost-life' : '',
  ].filter(Boolean).join(' ')

  const tokenProps = {
    type: 'button' as const,
    'data-seat-id': seatId,
    disabled,
    'aria-pressed': selected,
    'aria-label': accessibleName(seatId, nickname, state, role, roleVisible, chips.length, actionHint),
    onClick: hold.wrapClick(onSelect ? () => onSelect(seatId) : undefined),
    ...(onHold ? {
      onPointerDown: hold.onPointerDown,
      onPointerUp: hold.onPointerUp,
      onPointerLeave: hold.onPointerLeave,
      onPointerCancel: hold.onPointerCancel,
    } : {}),
  }

  const tokenBody = (
    <>
      <RoleDisc
        // 遮蔽时 roleName / initial / imageSrc 都不会进 DOM：RoleDisc 的 concealed 态只渲染「隐」。
        initial={roleVisible ? role.initial : ''}
        roleName={roleVisible ? role.name : ''}
        concealed={!roleVisible}
        imageSrc={roleVisible ? role.imageSrc : undefined}
        changed={roleVisible ? role.changed : false}
        size="large"
      />
      <span className="grimoire-seat__number" aria-hidden="true">{seatId}</span>
      {dead ? (
        // 死亡不占 chip 位：底部 30% 实底帷幕 + Skull + 「亡」+ 语义色描边，图标文字颜色三重编码。
        <span className="grimoire-seat__shroud" aria-hidden="true">
          <Skull />
          <span className="grimoire-seat__shroud-text">亡</span>
        </span>
      ) : null}
      {ghostLife ? (
        // 幽灵帷幕：虚线 + 40% 不透明 + 「待确认」三重区分，绝不与实体帷幕长成一样。
        <span className="grimoire-seat__ghost-shroud" aria-hidden="true">
          {ghostLife === 'dead' ? '待确认 亡' : '待确认 活'}
        </span>
      ) : null}
    </>
  )

  const chipLayer = (
    <SeatChipLayer
      seatId={seatId}
      chips={chips}
      placements={placements}
      tokenSize={tokenSize}
      onChipGesture={onChipGesture ? (event) => onChipGesture(seatId, event) : undefined}
    />
  )

  // 只读形态：整个座位就是一颗键，Tab 序里只占一格。
  if (!onChipGesture && !anchored) {
    return (
      <button {...tokenProps} className={classes} style={style}>
        {tokenBody}
        {chipLayer}
      </button>
    )
  }

  return (
    <div className={classes} style={style} data-seat-container={seatId}>
      <button {...tokenProps} className="grimoire-seat__token">{tokenBody}</button>
      {chipLayer}
      {anchored}
    </div>
  )
}
