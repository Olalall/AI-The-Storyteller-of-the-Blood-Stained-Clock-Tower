import { StatusBadge } from '../../components/ui/StatusBadge'
import type { BadgeTone } from '../../components/ui/StatusBadge'
import type { ScriptQualityReport, ScriptQualitySummary } from '../../domain/scripts'

interface ScriptQualityPanelProps {
  report: ScriptQualityReport
  currentScriptId: string
}

export function ScriptQualityPanel({ report, currentScriptId }: ScriptQualityPanelProps) {
  const visibleItems = prioritizeItems(report.items, currentScriptId)

  return (
    <section className="script-library__section script-quality" aria-labelledby="script-quality-title">
      <div className="script-library__section-heading">
        <div>
          <span>质量</span>
          <h3 id="script-quality-title">智能板子看板</h3>
        </div>
        <p>开局 / AI / 夜序</p>
      </div>

      <div className="script-quality__metrics" aria-label="智能板子统计">
        <Metric label="已导入" value={report.totals.scripts} />
        <Metric label="可开局" value={report.totals.ready} tone="success" />
        <Metric label="需复核" value={report.totals.review} tone="warning" />
        <Metric label="暂缓" value={report.totals.blocked} tone="danger" />
      </div>

      <div className="script-quality__list" aria-label="板子质量清单">
        {visibleItems.map((item) => (
          <article className="script-quality__item" data-readiness={item.readiness} key={item.scriptId}>
            <header className="script-quality__item-header">
              <div>
                <h4>{item.displayName}</h4>
                <p>{item.playerCounts.covered[0]}—{item.playerCounts.covered.at(-1)}人 · 角色 {item.roleStatus.confirmed}/{item.roleStatus.total}</p>
              </div>
              <div className="script-quality__badges" aria-label={`${item.displayName}质量状态`}>
                {item.scriptId === currentScriptId ? <StatusBadge tone="current">当前</StatusBadge> : null}
                <StatusBadge tone={readinessTone(item.readiness)}>{item.readinessLabel}</StatusBadge>
                <StatusBadge tone={item.readiness === 'ready' ? 'success' : 'warning'}>{item.aiQualityLabel}</StatusBadge>
              </div>
            </header>

            <dl className="script-quality__facts">
              <div><dt>调研</dt><dd>{item.roleResearch.reviewed}/{item.roleResearch.total}</dd></div>
              <div><dt>模板</dt><dd>{item.setupTemplates.verified}/{item.setupTemplates.total}</dd></div>
              <div><dt>夜序</dt><dd>{item.nightOrderStatus.confirmed}/{item.nightOrderStatus.total}</dd></div>
              <div><dt>规则</dt><dd>{item.setupRuleStatus.confirmed}/{item.setupRuleStatus.total}</dd></div>
            </dl>

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
