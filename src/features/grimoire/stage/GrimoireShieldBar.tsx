/**
 * 遮蔽栏：三级遮蔽在屏幕上的可见入口。
 *
 * 双指点画布是盲操作路径，但盲操作不能是**唯一**路径——键盘用户、读屏用户、
 * 以及不知道有这个手势的人都必须能盖上和掀开，所以这一条常驻。
 *
 * 揭示刻意要按住 600ms：单击即揭示会让一次误触在满桌人面前掀开整局。
 * 恢复（L0 → L1）反过来只认单指点大按钮——慌乱中同一个双指手势不能既盖上又掀开。
 */
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Button } from '../../../components/ui/Button'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { GrimoireShield } from '../shield/useGrimoireShield'
import './grimoire-stage.css'

interface GrimoireShieldBarProps {
  shield: GrimoireShield
}

const LEVEL_TEXT = {
  L0: '魔典已盖上',
  L1: '席位视图',
  L2: '魔典已揭示',
} as const

export function GrimoireShieldBar({ shield }: GrimoireShieldBarProps) {
  const { level, coverNow, uncover, beginReveal, cancelReveal, revealProgress, conceal, holding } = shield

  return (
    <div className="grimoire-shield-bar" data-level={level} role="group" aria-label="遮蔽">
      <StatusBadge tone={level === 'L2' ? 'warning' : 'info'} size="sm">{LEVEL_TEXT[level]}</StatusBadge>
      {level === 'L0' ? (
        <Button variant="primary" onClick={uncover}>
          <Eye aria-hidden="true" />恢复魔典
        </Button>
      ) : level === 'L2' && !holding ? (
        <>
          {/* 90 秒自动落回仍然生效；这颗键是「现在就盖」，不是唯一的收口。 */}
          <Button variant="secondary" compact onClick={conceal}><EyeOff aria-hidden="true" />收起角色</Button>
          <Button variant="ghost" compact onClick={coverNow}><ShieldAlert aria-hidden="true" />全遮蔽</Button>
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            compact
            className="grimoire-shield-bar__reveal"
            style={{ '--reveal-progress': revealProgress } as CSSProperties}
            aria-label="按住 600 毫秒揭示角色"
            onPointerDown={beginReveal}
            onPointerUp={cancelReveal}
            onPointerLeave={cancelReveal}
            onPointerCancel={cancelReveal}
          >
            <Eye aria-hidden="true" />按住揭示
          </Button>
          <Button variant="ghost" compact onClick={coverNow}><ShieldAlert aria-hidden="true" />全遮蔽</Button>
        </>
      )}
    </div>
  )
}
