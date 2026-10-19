/**
 * 常驻的回看诚实条。
 *
 * 三条纪律：
 * 1. **没有关闭键**。它是免责声明不是提示；能关掉的免责声明等于没有。
 * 2. **冷色**（info），不是 warning。没有人做错任何事——纯记录模式本来就是保底通道，
 *    用告警色说这件事等于责怪说书人当年没录。
 * 3. **不是新界面**。它就是画布顶上的一条，与完整度提示条同一族的横条，
 *    没有自己的容器、没有自己的排版语言。回看态是既有画布的一个属性，
 *    做成第二套魔典的话，两套会各自漂移，而漂移的那一半正是没人回归测的那一半。
 */
import { BookLock } from 'lucide-react'
import { replayHonestyNotice } from './replayHonesty'
import type { ReplayContext } from './writeAccess'
import './replay-honesty-bar.css'

interface ReplayHonestyBarProps {
  context: ReplayContext
}

export function ReplayHonestyBar({ context }: ReplayHonestyBarProps) {
  const notice = replayHonestyNotice(context)
  if (!notice) return null

  return (
    <div className={`replay-honesty-bar replay-honesty-bar--${notice.kind}`} role="note" aria-label="回看说明">
      <BookLock className="replay-honesty-bar__icon" aria-hidden="true" />
      <div className="replay-honesty-bar__text">
        <strong className="replay-honesty-bar__title">{notice.title}</strong>
        <p className="replay-honesty-bar__body">{notice.body}</p>
        <p className="replay-honesty-bar__ledger">{notice.ledger}</p>
      </div>
      <span className="replay-honesty-bar__lock">{notice.readOnlyNote}</span>
    </div>
  )
}
