import { Sparkles } from 'lucide-react'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { AIResultAdvice, OutcomeResolutionHint } from '../types'

interface MissingGuidance {
  label: string
  action: string
}

interface SettlementAssistPanelProps {
  aiAdvice?: AIResultAdvice
  aiOutcomeLabel?: string
  resolutionHint?: OutcomeResolutionHint
  resolutionOutcomeLabel?: string
  modifiedFromAI?: boolean
}

export function SettlementAssistPanel({
  aiAdvice,
  aiOutcomeLabel,
  resolutionHint,
  resolutionOutcomeLabel,
  modifiedFromAI,
}: SettlementAssistPanelProps) {
  if (!aiAdvice && !resolutionHint) return null
  const needsInput = aiAdvice?.status === 'needs_input'
  const missingGuidance = needsInput ? createMissingGuidance(aiAdvice.missing) : []
  const stateConfirmations = aiAdvice?.stateChangeDrafts ?? []
  const riskWarnings = aiAdvice?.authorityWarnings ?? []
  const hasDraftPreview = aiAdvice && !needsInput && (
    Boolean(aiOutcomeLabel)
    || aiAdvice.journalDrafts.length
    || aiAdvice.playerMessageDrafts.length
    || stateConfirmations.length
    || riskWarnings.length
  )

  return (
    <section className="settlement-assist" aria-label={'\u672c\u9879\u8f85\u52a9'}>
      <div className="settlement-assist__header">
        <span><Sparkles aria-hidden="true" />{'\u8f85\u52a9\u5224\u65ad'}</span>
        <small>{'\u786e\u8ba4\u540e\u5199\u5165'}</small>
      </div>
      {resolutionHint ? (
        <article>
          <strong>{'\u672c\u5730\u6838\u5bf9'}{resolutionOutcomeLabel ? ` \u00b7 ${resolutionOutcomeLabel}` : ''}</strong>
          <p>{resolutionHint.detail}</p>
        </article>
      ) : null}
      {aiAdvice ? (
        <article className={[
          'settlement-assist__ai',
          modifiedFromAI ? 'settlement-assist__ai--modified' : '',
          needsInput ? 'settlement-assist__ai--missing' : '',
        ].filter(Boolean).join(' ')}>
          <div className="settlement-assist__line">
            <strong>{needsInput ? 'AI\u7f3a\u5c11' : modifiedFromAI ? '\u5df2\u6539\u4e3a\u624b\u52a8\u7ed3\u679c' : 'AI\u5efa\u8bae'}</strong>
            {!needsInput && aiOutcomeLabel ? <StatusBadge tone="info" size="sm">{modifiedFromAI ? `\u539f\u5efa\u8bae\uff1a${aiOutcomeLabel}` : aiOutcomeLabel}</StatusBadge> : null}
          </div>
          <p>{needsInput ? (aiAdvice.missing.join('\u3001') || '\u5148\u8865\u9f50\u672c\u9879\u9009\u62e9') : modifiedFromAI ? '\u4ee5\u5f53\u524d\u624b\u52a8\u7ed3\u679c\u4e3a\u51c6\u3002' : '\u5df2\u91c7\u7528\u5230\u8349\u7a3f\u3002'}</p>
          {needsInput && missingGuidance.length ? (
            <dl className="settlement-assist__missing-list">
              {missingGuidance.map((item) => (
                <div key={`${item.label}-${item.action}`}>
                  <dt>{item.label}</dt>
                  <dd>{item.action}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {hasDraftPreview ? (
            <div className="settlement-assist__draft-grid">
              {aiOutcomeLabel ? <DraftPreview title={'建议结果'} items={[aiOutcomeLabel]} tone="result" /> : null}
              <DraftPreview title={'\u5efa\u8bae\u8bb0\u5f55'} items={aiAdvice.journalDrafts} />
              <DraftPreview title={'告知玩家'} items={aiAdvice.playerMessageDrafts} />
              <DraftPreview title={'状态确认'} items={stateConfirmations} tone="warning" />
              <DraftPreview title={'风险提醒'} items={riskWarnings} tone="danger" />
            </div>
          ) : null}
          <small>{needsInput ? '\u8865\u9f50\u540e\u53ef\u91cd\u65b0\u63a8\u8350' : `${aiAdvice.facts.join(' \u00b7 ')} \u00b7 ${confidenceLabel(aiAdvice.confidence)}`}</small>
        </article>
      ) : null}
    </section>
  )
}

function DraftPreview({
  title,
  items,
  tone = 'default',
}: {
  title: string
  items: readonly string[]
  tone?: 'default' | 'result' | 'warning' | 'danger'
}) {
  if (!items.length) return null
  return (
    <div className={`settlement-assist__draft-card settlement-assist__draft-card--${tone}`}>
      <span>{title}</span>
      {items.slice(0, 3).map((item) => <p key={item}>{item}</p>)}
    </div>
  )
}

function confidenceLabel(confidence: AIResultAdvice['confidence']) {
  if (confidence === 'high') return '高置信度'
  if (confidence === 'medium') return '中置信度'
  return '低置信度'
}

function createMissingGuidance(missing: readonly string[]): MissingGuidance[] {
  const items = missing.length ? missing : ['缺少本项选择']
  return items.map((raw) => {
    const label = raw.replace(/^缺少/, '') || raw
    return {
      label,
      action: actionForMissing(raw),
    }
  })
}

function actionForMissing(raw: string) {
  if (/玩家|目标/.test(raw)) return '在上方目标区点玩家号码。'
  if (/声称|角色|身份|能力/.test(raw)) return '在角色区选择本次声明或猜测。'
  if (/结果|候选/.test(raw)) return '在结果候选里选一项。'
  if (/历史|状态|日志/.test(raw)) return '先查看本局记录或玩家状态。'
  return '先手动补齐本项信息。'
}
