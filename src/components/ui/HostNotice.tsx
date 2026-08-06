import { useEffect, useRef, useState, type ReactNode } from 'react'
import './ui.css'

interface HostNoticeProps {
  /** 当前回执文本；空串表示没有回执。同一句话再次出现也要重新播报。 */
  message: string
  /** 自动收起时长；设为 0 表示常驻直到 message 变空。 */
  autoHideMs?: number
  className?: string
  /**
   * 挂在回执上的即时动作（魔典写入的 3.5 秒撤销就是它）。
   *
   * 它渲染在 live region **之外**，这一条是硬要求而不是排版偏好：
   * 按钮若在 aria-live 区域里，它的出现与消失都算区域内容变化，会被再播报一遍，
   * 说书人听到的是「已记录：3号 标记死亡 撤销」，几秒后又听一遍同一句。
   * 更糟的是超时那一下——按钮从 live region 里被移除时读屏正念到一半，
   * 而焦点若正落在它上面就会掉回 body，键盘用户被扔回页面开头。
   */
  action?: ReactNode
}

/**
 * 说书人操作回执的唯一出口。
 *
 * 它必须在所有断点下都可见：夜间工作台此前把回执条在窄屏 display:none 掉，
 * 于是「确认被 guard 挡下」在单手竖握时完全没有反馈——按钮没动、没有提示，
 * 说书人会以为记上了直接喊闭眼。任何隐藏这条的样式都是回归。
 *
 * live region 那个节点常驻（哪怕此刻没有消息）：读屏只播报**已经存在**的活动区域里的
 * 内容变化，随第一条消息一起挂上去的区域，那条消息本身通常整条丢掉。
 */
export function HostNotice({ message, autoHideMs = 3500, className = '', action }: HostNoticeProps) {
  const [visible, setVisible] = useState(Boolean(message))
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  /** 焦点此刻是否落在动作区里。动作被撤下时要靠它决定接不接这枚焦点。 */
  const actionHasFocus = useRef(false)
  const hasAction = Boolean(action)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    setVisible(Boolean(message))
    // 有即时动作时不自动收起：收起会把一颗**还能按**的按钮从屏幕上抹掉，
    // 而它恰好是这条回执此刻唯一的用处。动作撤下之后才开始计时。
    if (!message || !autoHideMs || hasAction) return
    timer.current = setTimeout(() => setVisible(false), autoHideMs)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [message, autoHideMs, hasAction])

  useEffect(() => {
    if (hasAction || !actionHasFocus.current) return
    // 动作在焦点还落在它身上时被撤下了（超时，或刚被按下）。浏览器会把焦点丢回 body，
    // 键盘用户得从头 Tab 一遍才能回到原处，所以这里主动接住。
    actionHasFocus.current = false
    containerRef.current?.focus()
  }, [hasAction])

  return (
    <div
      className={`ui-host-notice ${visible && message ? 'is-visible' : ''} ${className}`.trim()}
      ref={containerRef}
      tabIndex={-1}
    >
      <span className="ui-host-notice__text" role="status" aria-live="polite">
        {message}
      </span>
      {action ? (
        <span
          className="ui-host-notice__action"
          onFocusCapture={() => { actionHasFocus.current = true }}
          onBlurCapture={() => { actionHasFocus.current = false }}
        >
          {action}
        </span>
      ) : null}
    </div>
  )
}
