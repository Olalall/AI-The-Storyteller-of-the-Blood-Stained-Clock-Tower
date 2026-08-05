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
 */
import { Skull } from 'lucide-react'
import type { CSSProperties } from 'react'
import { RoleDisc } from '../../../components/ui/RoleDisc'
import type { ManualStatusMarker } from '../../night-workbench/types'
import type { PlayerState } from '../../game-session/model/playerTypes'
import { foldSatellites, satellitePlacements } from '../layout/satelliteArc'
import { shieldVisibility, type ShieldLevel } from '../shield/shieldLevel'
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
}

type ChipKind = 'poisoned' | 'drunk' | 'marker' | 'fold'

interface SeatChip {
  key: string
  kind: ChipKind
  /** L2 才进 DOM。 */
  label: string | null
  foldedCount?: number
}

/** 顺序恒定 中毒 → 醉酒 → 具名标记，与 PlayerStatusBar 一致：靠位置记比靠读字快。 */
function chipsFor(state: PlayerState, markerDetail: boolean): SeatChip[] {
  const chips: SeatChip[] = []
  if (state.poisoned) chips.push({ key: 'poisoned', kind: 'poisoned', label: '中毒' })
  if (state.drunk) chips.push({ key: 'drunk', kind: 'drunk', label: '醉酒' })
  for (const marker of state.markers as readonly ManualStatusMarker[]) {
    chips.push({
      key: `marker-${marker.id}`,
      kind: 'marker',
      // label 本身就是角色信息（「僧侣保护」「红鲱鱼」「是酒鬼」），L1 下一律不进 DOM。
      label: markerDetail ? marker.label : null,
    })
  }
  return chips
}

function foldChips(chips: SeatChip[]): SeatChip[] {
  const { visible, folded } = foldSatellites(chips.length)
  if (folded === 0) return chips
  return [
    ...chips.slice(0, visible - 1),
    { key: 'fold', kind: 'fold', label: null, foldedCount: folded },
  ]
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
}: GrimoireSeatProps) {
  const visibility = shieldVisibility(shield)
  // L0 下整个座位不渲染任何内容——不是盖住，是不进 DOM。
  if (!visibility.seatIdentity) return null

  const roleVisible = visibility.roleIdentity && role !== null
  const chips = visibility.markerCount
    ? foldChips(chipsFor(state, visibility.markerDetail))
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
  } as CSSProperties

  const classes = [
    'grimoire-seat',
    flow ? 'grimoire-seat--flow' : '',
    selected ? 'grimoire-seat--selected' : '',
    dead ? 'grimoire-seat--dead' : '',
    impaired ? 'grimoire-seat--impaired' : '',
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      style={style}
      data-seat-id={seatId}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={accessibleName(seatId, nickname, state, role, roleVisible, chips.length, actionHint)}
      onClick={onSelect ? () => onSelect(seatId) : undefined}
    >
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
      {chips.map((chip, index) => {
        const place = placements[index]
        return (
          <span
            key={chip.key}
            className={`grimoire-seat__chip grimoire-seat__chip--${chip.kind}`}
            data-chip={chip.kind}
            style={{
              width: place.size,
              height: place.size,
              left: tokenSize / 2 + place.dx - place.size / 2,
              top: tokenSize / 2 + place.dy - place.size / 2,
            }}
            aria-hidden="true"
          >
            {chip.kind === 'fold' ? `+${chip.foldedCount}` : chip.label}
          </span>
        )
      })}
    </button>
  )
}
