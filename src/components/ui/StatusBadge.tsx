import type { PropsWithChildren } from 'react'
import './ui.css'

export type BadgeTone = 'neutral' | 'current' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'md' | 'sm'

interface StatusBadgeProps {
  tone?: BadgeTone
  /** sm 只是密度更高的同一枚徽标（22px），字号不变；不要用它继续缩字。 */
  size?: BadgeSize
  /** 仅用于定位/间距等布局收尾，不得用来改颜色或形状。 */
  className?: string
}

export function StatusBadge({ tone = 'neutral', size = 'md', className = '', children }: PropsWithChildren<StatusBadgeProps>) {
  const classes = [
    'status-badge',
    `status-badge--${tone}`,
    size === 'sm' ? 'status-badge--sm' : '',
    className,
  ].filter(Boolean).join(' ')
  return <span className={classes}>{children}</span>
}
