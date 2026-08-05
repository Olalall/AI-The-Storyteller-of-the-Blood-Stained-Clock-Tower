/**
 * 耐久性的两条界面回执：可恢复的快照、以及「这个标签页只读」。
 *
 * 恢复永远是一次人的选择。自动回滚会在说书人毫不知情的情况下把刚记的东西换掉，
 * 而他没有任何办法判断眼前这份到底是哪一份。
 */
import { History, Lock } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { SessionDurability } from '../state/useSessionDurability'
import './durability-notices.css'

interface DurabilityNoticesProps {
  durability: SessionDurability
}

function describeAge(savedAt: string, now: number): string {
  const minutes = Math.max(0, Math.round((now - Date.parse(savedAt)) / 60_000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  return `${Math.round(minutes / 60)} 小时前`
}

export function DurabilityNotices({ durability }: DurabilityNoticesProps) {
  const { lock, candidates, restore, dismiss } = durability
  const candidate = candidates[0]
  if (lock === 'owner' && !candidate) return null

  return (
    <div className="durability-notices">
      {lock === 'readonly' ? (
        <p className="durability-notice durability-notice--lock" role="alert">
          <Lock aria-hidden="true" />
          <span>
            另一个窗口正在主持这局。这个窗口只读——两个窗口同时记录会让后写的那份整份覆盖先写的。
          </span>
        </p>
      ) : null}
      {candidate ? (
        <p className="durability-notice durability-notice--recovery" role="status">
          <History aria-hidden="true" />
          <span>
            有一份 {describeAge(candidate.savedAt, Date.now())}的备份，比现在这份多 {candidate.extraEntries} 条记录。
            这通常意味着上次没能正常保存。要用它替换吗？替换前的这份会作为新快照留下。
          </span>
          <Button variant="secondary" compact onClick={() => restore(candidate)}>恢复这份</Button>
          <Button variant="ghost" compact onClick={dismiss}>保留当前</Button>
        </p>
      ) : null}
    </div>
  )
}
