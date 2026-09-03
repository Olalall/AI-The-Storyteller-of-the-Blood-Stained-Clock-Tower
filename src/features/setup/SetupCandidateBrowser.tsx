import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { createSetupAdviceDraftAsync, type AIContextSeat, type SetupAdviceRuntimeDraft, type SetupBalanceMicroAdjustment } from '../../services/ai'
import { detailForCandidate, type CandidateDetailContent } from './setupCandidateDetailContent'
import type { SetupPrototypeCandidate } from './types'

interface SetupCandidateBrowserProps {
  scriptId: string
  scriptName: string
  knowledgeVersion: string
  candidates: SetupPrototypeCandidate[]
  playerCount: number
  seats: readonly AIContextSeat[]
  onUseCandidate: (candidateId: string) => void
  onPreviewMicroAdjustment?: (candidateId: string, adjustment: SetupBalanceMicroAdjustment) => void
}

function paceLabel(pace: SetupPrototypeCandidate['rationale']['pace']) {
  return pace === 'steady' ? '稳定' : pace === 'long' ? '耐玩' : '反转'
}

function DetailList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="setup-candidate-detail__guide-card">
      <h4>{title}</h4>
      <ol>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ol>
    </section>
  )
}

function DetailGuide({ detail }: { detail: CandidateDetailContent }) {
  return (
    <>
      <section className="setup-candidate-detail__goal">
        <span>主持目标</span>
        <p>{detail.hostGoal}</p>
      </section>
      <div className="setup-candidate-detail__guide">
        <DetailList title="开局操作" items={detail.setupSteps} />
        <DetailList title="给信息" items={detail.informationPlan} />
        <DetailList title="趣味节奏" items={detail.funPlan} />
      </div>
      <section className="setup-candidate-detail__fit">
        <h4>玩家适配</h4>
        <div>
          {detail.playerFit.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.seats}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="setup-candidate-detail__tuning">
        <h4>可微调</h4>
        <ul>
          {detail.tuning.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </>
  )
}

function adviceOrderedCandidates(candidates: SetupPrototypeCandidate[], advice: SetupAdviceRuntimeDraft | null) {
  if (!advice) return candidates
  const order = new Map(advice.recommendedCandidateIds.map((id, index) => [id, index]))
  return [...candidates].sort((left, right) => {
    const leftRank = order.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightRank = order.get(right.id) ?? Number.MAX_SAFE_INTEGER
    return leftRank - rightRank
  })
}

function adviceRankById(advice: SetupAdviceRuntimeDraft | null) {
  return new Map(advice?.recommendedCandidateIds.map((id, index) => [id, index]) ?? [])
}

function adviceButtonLabel(advice: SetupAdviceRuntimeDraft | null, loading: boolean) {
  if (loading) return '推荐中'
  return advice ? '重新推荐' : '生成推荐'
}

function chineseStatement(value: string | undefined, fallback: string) {
  return value && !/[A-Za-z]/.test(value) ? value : fallback
}

export function SetupCandidateBrowser({
  scriptId,
  scriptName,
  knowledgeVersion,
  candidates,
  playerCount,
  seats,
  onUseCandidate,
  onPreviewMicroAdjustment: _onPreviewMicroAdjustment,
}: SetupCandidateBrowserProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [advice, setAdvice] = useState<SetupAdviceRuntimeDraft | null>(null)
  const [isAdviceLoading, setIsAdviceLoading] = useState(false)
  const [adviceRequestCount, setAdviceRequestCount] = useState(0)
  const [adviceStatus, setAdviceStatus] = useState('')
  const selected = candidates.find((candidate) => candidate.id === selectedId)
  const visibleCandidates = adviceOrderedCandidates(candidates, advice)
  const adviceRanks = adviceRankById(advice)
  const topAdvice = advice ? visibleCandidates[0] : undefined

  async function requestAdvice() {
    if (!candidates.length || isAdviceLoading) return
    const nextRequestCount = adviceRequestCount + 1
    const offset = advice ? adviceRequestCount % candidates.length : 0
    const requestCandidates = offset
      ? [...candidates.slice(offset), ...candidates.slice(0, offset)]
      : candidates
    setIsAdviceLoading(true)
    setAdviceStatus(advice ? '正在更新推荐' : '正在生成推荐')
    try {
      const draft = await createSetupAdviceDraftAsync({
        scriptId,
        scriptName,
        knowledgeVersion,
        playerCount,
        seats,
        candidates: requestCandidates,
      })
      setAdvice(draft)
      setAdviceRequestCount(nextRequestCount)
      setAdviceStatus(advice ? `推荐已更新（第${nextRequestCount}次）` : '推荐已生成')
    } finally {
      setIsAdviceLoading(false)
    }
  }

  if (selected) {
    const detail = detailForCandidate(selected)

    return (
      <section className="setup-candidate-detail" aria-labelledby="setup-candidate-detail-title">
        <div className="setup-candidate-detail__top">
          <button type="button" onClick={() => setSelectedId(null)}><ArrowLeft aria-hidden="true" />返回组合</button>
          <StatusBadge tone="neutral">{paceLabel(selected.rationale.pace)}</StatusBadge>
        </div>
        <div className="setup-candidate-detail__hero">
          <span>组合详情</span>
          <h3 id="setup-candidate-detail-title">{selected.title}</h3>
          <p>{selected.rationale.summary}</p>
        </div>
        <ol className="setup-candidate-detail__roles" aria-label={`${selected.title}角色组合`}>
          {selected.assignments.map((assignment) => <li key={assignment.seatId}><span>{assignment.seatId}号</span><strong>{assignment.role.name}</strong></li>)}
        </ol>
        {detail ? <DetailGuide detail={detail} /> : (
          <div className="setup-candidate-detail__notes">
            <section><span>组合特点</span><p>{selected.rationale.summary}</p></section>
            <section><span>适合玩家</span><p>{selected.rationale.playerFit}</p></section>
            <section><span>调整提醒</span><p>{selected.rationale.risk}</p></section>
          </div>
        )}
        <section className="setup-candidate-detail__bluffs" aria-label="恶魔伪装建议">
          <div><span>恶魔伪装</span><StatusBadge tone="info"><Sparkles aria-hidden="true" />未在场</StatusBadge></div>
          <div>
            {selected.demonBluffAdvice?.items.map((item, index) => <article key={item.role.id}>
              <span>伪装{index + 1}</span>
              <strong>{item.role.name}</strong>
              <p>{item.reason}</p>
              <small>{item.risk}</small>
            </article>)}
          </div>
        </section>
        <div className="setup-candidate-detail__actions">
          <Button variant="ghost" onClick={() => setSelectedId(null)}>返回列表</Button>
          <Button variant="primary" onClick={() => onUseCandidate(selected.id)}>选择组合</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="setup-panel__candidates" aria-labelledby="setup-candidates-title">
      <div className="setup-panel__section-heading">
        <div><span>智能配板</span><h3 id="setup-candidates-title">角色组合</h3></div>
        <div className="setup-candidate__heading-actions">
          <small role="status" aria-label="推荐状态" aria-live="polite">{adviceStatus}</small>
          <Button variant="ghost" compact disabled={!candidates.length || isAdviceLoading} onClick={requestAdvice}>
            <Sparkles aria-hidden="true" />{adviceButtonLabel(advice, isAdviceLoading)}
          </Button>
        </div>
      </div>
      {advice ? <div className="setup-candidate__ai-strip" role="status" aria-label="推荐结果">
        <div className="setup-candidate__ai-top">
          <div>
            <strong>推荐组合</strong>
            <span>{topAdvice?.title ?? '\u6682\u65e0\u5019\u9009'}</span>
          </div>
          <p>{chineseStatement(advice.reasons[0], topAdvice?.rationale.summary ?? '当前组合已按玩家经验排序。')}</p>
        </div>
      </div> : null}
      {!candidates.length ? <EmptyState
        className="setup-candidate-empty"
        title={`${playerCount}人暂无已核对模板`}
        description="先选 7 / 12 / 15 人，或后续补模板后再开。"
      /> : null}
      {visibleCandidates.map((candidate) => (
        <article className="setup-candidate" key={candidate.id}>
          <div><h4>{candidate.title}</h4><div className="setup-candidate__badges">
            {adviceRanks.has(candidate.id) ? (
              <StatusBadge tone={adviceRanks.get(candidate.id) === 0 ? 'info' : 'neutral'}>
                {adviceRanks.get(candidate.id) === 0 ? '智能首选' : `推荐第${(adviceRanks.get(candidate.id) ?? 0) + 1}`}
              </StatusBadge>
            ) : null}
            <StatusBadge tone="neutral">{paceLabel(candidate.rationale.pace)}</StatusBadge>
          </div></div>
          <ol className="setup-candidate__roles" aria-label={`${candidate.title}角色组合`}>
            {candidate.assignments.map((assignment) => <li key={assignment.seatId}><span>{assignment.seatId}号</span><strong>{assignment.role.name}</strong></li>)}
          </ol>
          <p className="setup-candidate__advice"><span>{candidate.rationale.summary}</span></p>
          <div className="setup-candidate__actions">
            <Button variant="secondary" compact onClick={() => setSelectedId(candidate.id)}>查看<ChevronRight aria-hidden="true" /></Button>
            <Button variant="primary" compact onClick={() => onUseCandidate(candidate.id)}>选择组合</Button>
          </div>
        </article>
      ))}
    </section>
  )
}
