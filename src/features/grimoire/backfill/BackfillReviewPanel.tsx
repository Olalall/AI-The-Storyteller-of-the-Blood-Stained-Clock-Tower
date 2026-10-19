/**
 * 补录建议卡：一串可跳过的卡片，每张一条。
 *
 * 「逐条核对（约 1 分钟）」按钮落在这里。此前它把人送去本局记录——那是让说书人
 * 自己对着一整条时间线找哪几笔没记，一分钟根本不够，实际结果是他看两眼就退出去了。
 *
 * 三条不可动的规矩：
 * 1. **没有「全部应用」**。批量键会让人不看内容直接按下去，那一刻工具就替说书人
 *    裁定了一整局的生死。
 * 2. **每张都能跳过**，跳完不影响使用。跳过只在本次核对里生效，不写进任何存档——
 *    「我这次不管」和「这件事不存在」是两回事。
 * 3. **来源显式**。卡面上原样引用那条记录说的话，让人一眼看出建议是从哪儿来的。
 */
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { BackfillCard } from './backfillHints'
import './backfill-panel.css'

interface BackfillReviewPanelProps {
  cards: readonly BackfillCard[]
  /** 本次核对里被跳过的卡片 id。 */
  skipped: ReadonlySet<string>
  onMark: (card: BackfillCard) => void
  onSkip: (card: BackfillCard) => void
  onClose: () => void
  /** 建议卡只覆盖「记录点名了座位」的那些欠账；剩下的仍要靠人翻记录。 */
  onOpenRecords: () => void
}

export function BackfillReviewPanel({ cards, skipped, onMark, onSkip, onClose, onOpenRecords }: BackfillReviewPanelProps) {
  const remaining = cards.filter((card) => !skipped.has(card.id))

  return (
    <section className="backfill-panel" aria-label="逐条核对">
      <header className="backfill-panel__head">
        <h2 className="backfill-panel__title">逐条核对 · 还剩 {remaining.length} 条</h2>
        <Button type="button" variant="ghost" compact onClick={onOpenRecords}>打开本局记录</Button>
        <Button type="button" variant="ghost" compact onClick={onClose}>先这样</Button>
      </header>
      {remaining.length === 0 ? (
        <EmptyState
          title="没有待核对的记录"
          description="记录里宣称过的状态变化都已经在魔典上了。"
        />
      ) : (
        <ul className="backfill-panel__cards">
          {remaining.map((card) => (
            <li key={card.id} className="backfill-panel__card" data-danger={card.danger ? 'true' : undefined}>
              <p className="backfill-panel__message">{card.message}</p>
              <div className="backfill-panel__actions">
                <Button type="button" variant={card.danger ? 'danger' : 'primary'} compact onClick={() => onMark(card)}>
                  标记
                </Button>
                <Button type="button" variant="ghost" compact onClick={() => onSkip(card)}>跳过</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
