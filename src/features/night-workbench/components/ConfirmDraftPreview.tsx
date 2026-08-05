/** 确认前 / 确认后的记录预览。确认前后用同一块渲染，说书人看到的就是将要写进档案的那段字。 */
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { WakeDraft } from '../types'

export function ConfirmDraftPreview({
  draft,
  isReadOnly,
}: {
  draft: WakeDraft
  isReadOnly: boolean
}) {
  if (!draft.storytellerResult.trim()) return null
  const sourceLabel = draft.outputSource?.kind === 'ai'
    ? 'AI草稿'
    : draft.outputSource?.kind === 'preset' && draft.outputSource.modifiedFromAI
      ? '手动覆盖AI'
      : '手动草稿'
  return (
    <section className="confirm-draft-preview" aria-label={isReadOnly ? '已确认记录' : '确认前预览'}>
      <div className="confirm-draft-preview__head">
        <strong>{isReadOnly ? '已写入' : '确认后写入'}</strong>
        <StatusBadge tone={draft.outputSource?.kind === 'ai' ? 'info' : 'neutral'}>{sourceLabel}</StatusBadge>
      </div>
      <p>{draft.storytellerResult}</p>
      {draft.informationGiven ? <small>告知：{draft.informationGiven}</small> : null}
      {!isReadOnly ? <small>不自动改身份、阵营、死亡、毒醉。</small> : null}
    </section>
  )
}
