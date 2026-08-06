/** 确认前 / 确认后的记录预览。确认前后用同一块渲染，说书人看到的就是将要写进档案的那段字。 */
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { WakeDraft } from '../types'

export function ConfirmDraftPreview({
  draft,
  settled,
}: {
  draft: WakeDraft
  /**
   * 这一项是否已落定（已确认且不在更正 / 已暂缓 / 本夜不适用）。
   *
   * 原名 isReadOnly，但它从来不是写入闸门——预览一个还没确认的项时这里是假、
   * 而那一屏其实完全不可写。改名是为了不让人顺手拿它当 disabled 用：
   * 只读一律走自上而下的 readOnly prop，这里只管文案。
   */
  settled: boolean
}) {
  if (!draft.storytellerResult.trim()) return null
  const sourceLabel = draft.outputSource?.kind === 'ai'
    ? 'AI草稿'
    : draft.outputSource?.kind === 'preset' && draft.outputSource.modifiedFromAI
      ? '手动覆盖AI'
      : '手动草稿'
  return (
    <section className="confirm-draft-preview" aria-label={settled ? '已确认记录' : '确认前预览'}>
      <div className="confirm-draft-preview__head">
        <strong>{settled ? '已写入' : '确认后写入'}</strong>
        <StatusBadge tone={draft.outputSource?.kind === 'ai' ? 'info' : 'neutral'}>{sourceLabel}</StatusBadge>
      </div>
      <p>{draft.storytellerResult}</p>
      {draft.informationGiven ? <small>告知：{draft.informationGiven}</small> : null}
      {!settled ? <small>不自动改身份、阵营、死亡、毒醉。</small> : null}
    </section>
  )
}
