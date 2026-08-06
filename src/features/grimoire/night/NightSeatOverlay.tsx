/**
 * 夜间叠加在一枚座位 token 上的那一层：夜序角标 + 草稿目标描边。
 *
 * 它是**独立叠加组件**，不是 GrimoireSeat 的一部分。GrimoireSeat 已经承担了
 * 生死、毒醉、标记、长按与草稿幽灵五件事；把夜序再塞进去，它就变成了
 * 「所有相位的所有装饰」的集散地，而白天那批（提名弧线、举手打卡）紧接着要来。
 * 一个相位一层叠加层、各自可以独立不渲染，是这里唯一能扩展下去的形状。
 *
 * 整层 `aria-hidden`：读屏要听的是「点下去等于什么」，那句话由 nightSeatTapHint
 * 算出来后进 GrimoireSeat 的可访问名（接线说明见 blockedBy）。装饰层再自报一遍，
 * 读屏会把同一件事念两次。
 *
 * 三重编码是硬要求（形状 + 文字 + 颜色）：暗光下、色觉差异下只靠颜色一定失效。
 * 所以每一种角标都带一个汉字或符号，而不是四种颜色的圆点。
 */
import { isNightBadgeVisible, nightBadgeVisibility, ordinalGlyph, type NightSeatBadge } from './nightRingCursor'
import type { ShieldLevel } from '../shield/shieldLevel'
import './night-ring.css'

const BADGE_TEXT: Record<NightSeatBadge['kind'], string> = {
  focus: '当前',
  // upcoming 的文字一律由 ordinal 覆盖；这里给兜底只是不让 Record 出现可选值。
  upcoming: '后续',
  confirmed: '✓',
  deferred: '缓',
}

export interface NightSeatOverlayProps {
  /** 这一座位的夜序角标。null / undefined = 今晚夜序没碰过它。 */
  badge?: NightSeatBadge | null
  /** 已被点成本项目标（草稿，未落账）。 */
  targeted?: boolean
  /** 多目标项里这是第几个目标（1 起）。单目标项传 null，不画序号。 */
  targetOrdinal?: number | null
  /** 遮蔽级别决定角标**渲不渲染**，不是显不显示。 */
  shield: ShieldLevel
}

export function NightSeatOverlay({
  badge,
  targeted = false,
  targetOrdinal = null,
  shield,
}: NightSeatOverlayProps) {
  const visibleBadge = badge && isNightBadgeVisible(badge, shield) ? badge : null
  // 草稿目标描边跟焦点同一档：它表达「说书人此刻正指着谁」，与焦点同粒度，
  // 而且它是点座位选目标唯一的即时回执——没有它，环上按下去毫无反应。
  const showTarget = targeted && nightBadgeVisibility(shield).focus
  if (!visibleBadge && !showTarget) return null

  const glyph = !visibleBadge
    ? null
    : visibleBadge.kind === 'upcoming' && visibleBadge.ordinal
      ? ordinalGlyph(visibleBadge.ordinal)
      : BADGE_TEXT[visibleBadge.kind]

  return (
    <span
      className={`night-seat-overlay${visibleBadge ? ` night-seat-overlay--${visibleBadge.kind}` : ''}`}
      aria-hidden="true"
      data-night-badge={visibleBadge?.kind ?? 'none'}
    >
      {visibleBadge?.kind === 'focus' ? <span className="night-seat-overlay__focus-ring" /> : null}
      {showTarget ? (
        /* 虚线暖金 + 「目标」两个字：与已落账的实线标记一眼分得开。
           幽灵做得像实体，就成了「工具已经替我选好了」。 */
        <span className="night-seat-overlay__target">
          <span className="night-seat-overlay__target-text">
            目标{targetOrdinal ? ordinalGlyph(targetOrdinal) : ''}
          </span>
        </span>
      ) : null}
      {glyph ? <span className="night-seat-overlay__badge">{glyph}</span> : null}
    </span>
  )
}
