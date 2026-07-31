import { useState } from 'react'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { BadgeTone } from '../../components/ui/StatusBadge'
import type { ScriptQualityReport, ScriptQualityReviewReasonId, ScriptQualitySummary } from '../../domain/scripts'

interface ScriptQualityPanelProps {
  report: ScriptQualityReport
  currentScriptId: string
}

export function ScriptQualityPanel({ report, currentScriptId }: ScriptQualityPanelProps) {
  const [filter, setFilter] = useState<QualityFilter>('all')
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all')
  const visibleItems = prioritizeItems(report.items, currentScriptId)
  const readinessItems = filter === 'all' ? visibleItems : visibleItems.filter((item) => item.readiness === filter)
  const reasonOptions = buildReasonOptions(readinessItems)
  const filteredItems = reasonFilter === 'all'
    ? readinessItems
    : readinessItems.filter((item) => item.reviewReasons.some((reason) => reason.id === reasonFilter))
  const filterOptions: readonly { id: QualityFilter; label: string; count: number }[] = [
    { id: 'all', label: '全部', count: report.totals.scripts },
    { id: 'ready', label: '可直接开局', count: report.totals.ready },
    { id: 'review', label: '可开局·需核对', count: report.totals.review },
    { id: 'blocked', label: '暂缓开局', count: report.totals.blocked },
  ]

  return (
    <section className="script-library__section script-quality" aria-labelledby="script-quality-title">
      <div className="script-library__section-heading">
        <div>
          <span>质量</span>
          <h3 id="script-quality-title">智能板子看板</h3>
        </div>
        <p>开局门槛 / AI建议 / 复核进度</p>
      </div>

      <div className="script-quality__metrics" aria-label="智能板子统计">
        <Metric label="已导入" value={report.totals.scripts} />
        <Metric label="可开局" value={report.totals.ready} tone="success" />
        <Metric label="待核对" value={report.totals.review} tone="warning" />
        <Metric label="暂缓" value={report.totals.blocked} tone="danger" />
      </div>

      <div className="script-quality__filters" role="group" aria-label="按开局状态筛选">
        {filterOptions.map((option) => (
          <button
            type="button"
            className={`script-quality__filter ${filter === option.id ? 'is-active' : ''}`}
            aria-pressed={filter === option.id}
            aria-label={`${option.label} ${option.count}`}
            key={option.id}
            onClick={() => {
              setFilter(option.id)
              setReasonFilter('all')
            }}
          >
            <span>{option.label}</span>
            <strong>{option.count}</strong>
          </button>
        ))}
      </div>

      <p className="script-quality__filter-summary" aria-live="polite">
        {filter === 'all' ? '按优先级显示：本局板子 → 暂缓 → 待核对 → 已核验。' : `当前显示 ${filteredItems.length} 个板子。`}
      </p>

      {filter === 'review' || filter === 'blocked' ? (
        <div className="script-quality__reason-filters" role="group" aria-label="按复核项筛选">
          <button
            type="button"
            className={`script-quality__reason-filter ${reasonFilter === 'all' ? 'is-active' : ''}`}
            aria-pressed={reasonFilter === 'all'}
            onClick={() => setReasonFilter('all')}
          >全部复核项 <strong>{readinessItems.length}</strong></button>
          {reasonOptions.map((option) => (
            <button
              type="button"
              className={`script-quality__reason-filter ${reasonFilter === option.id ? 'is-active' : ''}`}
              aria-pressed={reasonFilter === option.id}
              aria-label={`${option.label} ${option.count}`}
              key={option.id}
              onClick={() => setReasonFilter(option.id)}
            >{option.label} <strong>{option.count}</strong></button>
          ))}
        </div>
      ) : null}

      <div className="script-quality__list" aria-label="板子质量清单">
        {filteredItems.map((item) => (
          <article className="script-quality__item" data-readiness={item.readiness} key={item.scriptId}>
            <header className="script-quality__item-header">
              <div>
                <h4>
                  {item.displayName}
                  {item.scriptId === currentScriptId ? <span className="script-quality__current-mark">本局使用</span> : null}
                </h4>
                <p>{item.playerCounts.covered[0]}—{item.playerCounts.covered.at(-1)}人 · 角色 {item.roleStatus.confirmed}/{item.roleStatus.total}</p>
              </div>
              <div className="script-quality__badges" aria-label={`${item.displayName}质量状态`}>
                <StatusBadge tone={readinessTone(item.readiness)}>{item.readinessLabel}</StatusBadge>
                <span className="script-quality__ai-label">{item.aiQualityLabel}</span>
              </div>
            </header>

            <dl className="script-quality__facts">
              <div><dt>调研</dt><dd>{item.roleResearch.reviewed}/{item.roleResearch.total}</dd></div>
              <div><dt>模板</dt><dd>{item.setupTemplates.verified}/{item.setupTemplates.total}</dd></div>
              <div><dt>夜序</dt><dd>{item.nightOrderStatus.confirmed}/{item.nightOrderStatus.total}</dd></div>
              <div><dt>规则</dt><dd>{item.setupRuleStatus.confirmed}/{item.setupRuleStatus.total}</dd></div>
            </dl>

            {item.reviewReasons.length > 0 ? (
              <div className="script-quality__review-reasons" aria-label={`${item.displayName}复核项`}>
                <span className="script-quality__review-reasons-title">复核项</span>
                {item.reviewReasons.map((reason) => (
                  <span className="script-quality__review-reason" key={reason.id}>{reason.label} {reason.count}</span>
                ))}
              </div>
            ) : null}

            {item.warnings.length > 0 ? (
              <ul className="script-quality__warnings" aria-label="待处理项">
                {item.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : <p className="script-quality__clean">已核对</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

type QualityFilter = ScriptQualitySummary['readiness'] | 'all'
type ReasonFilter = ScriptQualityReviewReasonId | 'all'

function Metric({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: BadgeTone }) {
  return (
    <div className={`script-quality__metric script-quality__metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function prioritizeItems(items: readonly ScriptQualitySummary[], currentScriptId: string) {
  return [...items].sort((a, b) => {
    if (a.scriptId === currentScriptId) return -1
    if (b.scriptId === currentScriptId) return 1
    return readinessRank(a.readiness) - readinessRank(b.readiness) || a.displayName.localeCompare(b.displayName, 'zh-CN')
  })
}

function readinessRank(readiness: ScriptQualitySummary['readiness']) {
  if (readiness === 'blocked') return 0
  if (readiness === 'review') return 1
  return 2
}

function readinessTone(readiness: ScriptQualitySummary['readiness']): BadgeTone {
  if (readiness === 'ready') return 'success'
  if (readiness === 'review') return 'warning'
  return 'danger'
}

function buildReasonOptions(items: readonly ScriptQualitySummary[]) {
  const counts = new Map<ScriptQualityReviewReasonId, { label: string; count: number }>()
  for (const item of items) {
    for (const reason of item.reviewReasons) {
      const current = counts.get(reason.id)
      counts.set(reason.id, { label: reason.label, count: (current?.count ?? 0) + 1 })
    }
  }
  return [...counts.entries()].map(([id, value]) => ({ id, ...value }))
}
