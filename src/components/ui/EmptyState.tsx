import type { HTMLAttributes, ReactNode } from 'react'
import './ui.css'

interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 一句话说清「这里现在为什么是空的」。 */
  title: ReactNode
  /** 可选的下一步说明。空列表本身已经说明状态，不要在这里堆解释。 */
  description?: ReactNode
  /** 可选图标，渲染在标题之前。 */
  icon?: ReactNode
  /** 收窄到 72px 高，供列表内联空态使用。 */
  compact?: boolean
  /** 可选的单个下一步动作。空态最多一个主动作，不要在这里堆按钮组。 */
  children?: ReactNode
}

export function EmptyState({ title, description, icon, compact = false, className = '', children, ...rest }: EmptyStateProps) {
  const classes = ['ui-empty', compact ? 'ui-empty--compact' : '', className].filter(Boolean).join(' ')
  return (
    <div className={classes} {...rest}>
      {icon}
      <strong className="ui-empty__title">{title}</strong>
      {description !== undefined && description !== null && description !== false
        ? <span className="ui-empty__description">{description}</span>
        : null}
      {children !== undefined && children !== null && children !== false
        ? <div className="ui-empty__action">{children}</div>
        : null}
    </div>
  )
}
