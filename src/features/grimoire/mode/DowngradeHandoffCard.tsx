/**
 * 切回纯记录前的一次性交接卡。这是唯一需要二次确认的模式切换。
 *
 * 主动作刻意是「留在魔典模式」而不是「切回」：这张卡出现的时刻，
 * 说书人多半只是想关掉那张环，并没有想清楚状态从此归谁管。
 */
import { Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { formatDowngradeSummary, type DowngradeSummary } from './downgradeSummary'
import './downgrade-handoff-card.css'

interface DowngradeHandoffCardProps {
  summary: DowngradeSummary
  onStay: () => void
  onConfirm: () => void
}

export function DowngradeHandoffCard({ summary, onStay, onConfirm }: DowngradeHandoffCardProps) {
  const [copied, setCopied] = useState(false)

  async function copyList() {
    try {
      await navigator.clipboard.writeText(formatDowngradeSummary(summary))
      setCopied(true)
    } catch {
      // 剪贴板被拒时清单本身仍在屏幕上，照着抄即可——不为此弹错误。
      setCopied(false)
    }
  }

  return (
    <Card
      as="div"
      className="downgrade-handoff"
      eyebrow="切换模式"
      eyebrowTone="info"
      title="切回纯记录 · 状态由你和实体魔典负责"
    >
      <p className="downgrade-handoff__lede">
        工具会保留现在魔典上的全部内容（不会删），但不再显示为魔典，也不会再提醒你更新。
        {summary.isEmpty ? '当前没有任何非默认状态需要抄。' : '请确认实体魔典上已经有这些：'}
      </p>
      {summary.isEmpty ? null : (
        <dl className="downgrade-handoff__list">
          {summary.groups.map((group) => (
            <div key={group.label}>
              <dt>{group.label} {group.seats.length} 项</dt>
              <dd>{group.seats.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="downgrade-handoff__actions">
        {summary.isEmpty ? null : (
          <Button variant="ghost" compact onClick={copyList}>
            <Copy aria-hidden="true" />{copied ? '已复制' : '复制清单'}
          </Button>
        )}
        <Button variant="primary" onClick={onStay}>留在魔典模式</Button>
        <Button variant="secondary" onClick={onConfirm}>已抄好，切回纯记录</Button>
      </div>
    </Card>
  )
}
