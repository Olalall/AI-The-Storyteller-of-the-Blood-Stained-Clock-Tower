import { createContext, useContext, useEffect, type HTMLAttributes, type ReactNode } from 'react'
import './ui.css'

// 设计系统「禁止：卡片套卡片超过两层」的唯一执行点。
// 深度靠 context 累加，不靠 DOM 查询，因此跨文件、跨 feature 组合也能算准。
const CardDepthContext = createContext(0)
const maxCardDepth = 2

export type CardSurface = 'panel' | 'soft'
export type CardEyebrowTone = 'accent' | 'info'

// title 被重定义为 ReactNode（卡片标题），因此从原生属性里排除同名的 title 提示文本。
interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 语义标签。默认 section，需要非地标容器时传 div/article。 */
  as?: 'section' | 'article' | 'div'
  /** 标题上方的小字分类，例如「记录」「步骤 1」。 */
  eyebrow?: ReactNode
  /** 卡片标题，渲染成 h2。 */
  title?: ReactNode
  /** 标题 id，配合 aria-labelledby 使用。 */
  titleId?: string
  /** 暖金（默认，当前焦点语境）或冷青（信息语境）。 */
  eyebrowTone?: CardEyebrowTone
  /** 卡片底色，对齐既有两种面板色。 */
  surface?: CardSurface
  /** 标题行右侧操作区，直接作为 header 的第二个子节点渲染。 */
  actions?: ReactNode
  children?: ReactNode
}

export function Card({
  as = 'section',
  eyebrow,
  title,
  titleId,
  eyebrowTone = 'accent',
  surface = 'panel',
  actions,
  className = '',
  children,
  ...rest
}: CardProps) {
  const depth = useContext(CardDepthContext) + 1
  const overNested = depth > maxCardDepth

  useEffect(() => {
    if (!import.meta.env.DEV || !overNested) return
    console.error(
      `[ui/Card] 卡片嵌套到第 ${depth} 层，设计系统上限是 ${maxCardDepth} 层。`
      + '把最内层改成分组标题、列表或普通 div，不要继续套卡片。（仅开发态提示，生产态渲染不变）',
    )
  }, [depth, overNested])

  const Tag = as
  const classes = [
    'ui-card',
    surface === 'soft' ? 'ui-card--soft' : '',
    import.meta.env.DEV && overNested ? 'ui-card--over-nested' : '',
    className,
  ].filter(Boolean).join(' ')
  const hasHeader = eyebrow !== undefined || title !== undefined || actions !== undefined

  return (
    <CardDepthContext.Provider value={depth}>
      <Tag className={classes} {...rest}>
        {hasHeader ? (
          <div className="ui-card__header">
            <div className="ui-card__titles">
              {eyebrow !== undefined ? (
                <span className={eyebrowTone === 'info' ? 'ui-card__eyebrow ui-card__eyebrow--info' : 'ui-card__eyebrow'}>{eyebrow}</span>
              ) : null}
              {title !== undefined ? <h2 className="ui-card__title" id={titleId}>{title}</h2> : null}
            </div>
            {actions}
          </div>
        ) : null}
        {children}
      </Tag>
    </CardDepthContext.Provider>
  )
}
