import { useEffect, useRef, useState } from 'react'
import './ui.css'

interface HostNoticeProps {
  /** 当前回执文本；空串表示没有回执。同一句话再次出现也要重新播报。 */
  message: string
  /** 自动收起时长；设为 0 表示常驻直到 message 变空。 */
  autoHideMs?: number
  className?: string
}

/**
 * 说书人操作回执的唯一出口。
 *
 * 它必须在所有断点下都可见：夜间工作台此前把回执条在窄屏 display:none 掉，
 * 于是「确认被 guard 挡下」在单手竖握时完全没有反馈——按钮没动、没有提示，
 * 说书人会以为记上了直接喊闭眼。任何隐藏这条的样式都是回归。
 */
export function HostNotice({ message, autoHideMs = 3500, className = '' }: HostNoticeProps) {
  const [visible, setVisible] = useState(Boolean(message))
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    setVisible(Boolean(message))
    if (!message || !autoHideMs) return
    timer.current = setTimeout(() => setVisible(false), autoHideMs)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [message, autoHideMs])

  return (
    <div
      className={`ui-host-notice ${visible && message ? 'is-visible' : ''} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      {message ? <span className="ui-host-notice__text">{message}</span> : null}
    </div>
  )
}
