/**
 * AI 建议进入草稿前的校验。
 *
 * 这里刻意**不** import services/ai：建议由组件层取到后作为 action payload 传进来，
 * reducer 只负责判断这条建议是否仍然适用于当前这一刻的草稿。
 * 反过来（reducer 自己去取）会让「同一个 state 输入必然得到同一个输出」这条不再成立，
 * 而那正是整个事件溯源模型的地基。
 */
import type { AIResultAdvice, NightWorkbenchState, WakeDraft, WakeItem } from '../types'
import { applyAIOutcome } from './projectWakeDraft'

export function applyAIResultAdvice(
  state: NightWorkbenchState,
  item: WakeItem,
  draft: WakeDraft,
  advice: AIResultAdvice,
) {
  const valid = advice.status === 'answer' &&
    advice.nightRunId === state.nightRunId &&
    advice.wakeItemId === item.id &&
    advice.contextRevision === state.revision &&
    advice.sourceDraftRevision === draft.draftRevision &&
    advice.knowledgeVersion === state.knowledgeVersion &&
    Boolean(advice.recommendedOutcomeId)

  if (!valid) return null
  const next = applyAIOutcome(item, draft, advice.recommendedOutcomeId!, advice)
  return next === draft ? null : next
}
