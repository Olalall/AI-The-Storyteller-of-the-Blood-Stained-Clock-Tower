/**
 * 黄昏：核显示上一天结论回执与本夜队列预览。
 *
 * 「回执」是这一块存在的理由：黄昏是不可逆相位门的前一步，说书人要在推门之前
 * 看见自己上一天到底记成了什么，而不是凭记忆推门。
 *
 * 队列预览的元素是角色名，等同于身份信息（裁决 6：谁在场本身就是秘密）。
 * 所以遮蔽态下只报枚数，一个角色名都不进 DOM。
 */
import { CORE_PHASE_LABEL, CORE_UNKNOWN, type GrimoireDuskBrief } from '../corePhase'

interface DuskBriefingProps {
  brief: GrimoireDuskBrief
  /** 角色名能不能进 DOM。false 时只渲染「本夜 N 项」。 */
  queueVisible: boolean
}

/** 核只有一小块地方，队列预览超过三项就折成「另 N 项」，不把核撑破。 */
const QUEUE_PREVIEW_LIMIT = 3

export function DuskBriefing({ brief, queueVisible }: DuskBriefingProps) {
  const total = brief.nightQueue.length
  const shown = brief.nightQueue.slice(0, QUEUE_PREVIEW_LIMIT)
  const rest = total - shown.length

  return (
    <div className="grimoire-core__handoff" role="group" aria-label={CORE_PHASE_LABEL.dusk}>
      <dl className="grimoire-core__handoff-rows">
        <div className="grimoire-core__handoff-row" data-row="outcome">
          <dt className="grimoire-core__handoff-label">上一天结论</dt>
          <dd className="grimoire-core__handoff-value" data-empty={brief.dayOutcome === null}>
            {brief.dayOutcome ?? CORE_UNKNOWN}
          </dd>
        </div>
        <div className="grimoire-core__handoff-row" data-row="queue">
          <dt className="grimoire-core__handoff-label">本夜队列</dt>
          <dd className="grimoire-core__handoff-value" data-empty={total === 0}>
            {total === 0
              ? CORE_UNKNOWN
              : queueVisible
                ? `${shown.join(' · ')}${rest > 0 ? ` 另${rest}项` : ''}`
                : `${total}项 · 揭示后可见`}
          </dd>
        </div>
      </dl>
    </div>
  )
}
