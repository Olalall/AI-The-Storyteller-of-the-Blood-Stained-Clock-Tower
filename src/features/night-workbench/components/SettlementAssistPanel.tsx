import { Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import {
  buildStateChangeAdoption,
  projectStateChangeAdoption,
  type StateChangeAdoptionContext,
} from '../../../services/ai/stateChangeAdoption'
import type { AIResultAdvice, AIStateChangeDraft, OutcomeResolutionHint } from '../types'

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
  /** 缺省 = 不提供落盘入口，建议只作为文字显示。 */
  adoption?: StateChangeAdoptionContext
  onAdoptStateChange?: (action: GameSessionAction) => void
  /**
   * 唯一的写入闸门，自上而下压下来。
   *
   * 这块面板是本卡片上**唯一一个不在 fieldset 里的写入口**——「确认落盘」直接构造
   * confirm-player-state-change 交给 session。当前还没有调用方接 onAdoptStateChange，
   * 所以它今天不可达；但闸门必须先于接线存在，否则接线的那个人得先想起来有这回事。
   * 归档回看（replay）与预览别人那一项时，这颗键必须和目标网格一起哑掉。
   */
  readOnly?: boolean
}

export function SettlementAssistPanel({
  aiAdvice,
  aiOutcomeLabel,
  resolutionHint,
  resolutionOutcomeLabel,
  modifiedFromAI,
  adoption,
  onAdoptStateChange,
  readOnly = false,
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
    <section className="settlement-assist" aria-label={'本项辅助'}>
      <div className="settlement-assist__header">
        <span><Sparkles aria-hidden="true" />{'辅助判断'}</span>
        <small>{'确认后写入'}</small>
      </div>
      {resolutionHint ? (
        <article>
          <strong>{'本地核对'}{resolutionOutcomeLabel ? ` · ${resolutionOutcomeLabel}` : ''}</strong>
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
            <strong>{needsInput ? 'AI缺少' : modifiedFromAI ? '已改为手动结果' : 'AI建议'}</strong>
            {!needsInput && aiOutcomeLabel ? <StatusBadge tone="info" size="sm">{modifiedFromAI ? `原建议：${aiOutcomeLabel}` : aiOutcomeLabel}</StatusBadge> : null}
          </div>
          <p>{needsInput ? (aiAdvice.missing.join('、') || '先补齐本项选择') : modifiedFromAI ? '以当前手动结果为准。' : '已采用到草稿。'}</p>
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
              <DraftPreview title={'建议记录'} items={aiAdvice.journalDrafts} />
              <DraftPreview title={'告知玩家'} items={aiAdvice.playerMessageDrafts} />
              <StateChangeDrafts
                advice={aiAdvice}
                drafts={stateConfirmations}
                adoption={adoption}
                onAdopt={onAdoptStateChange}
                readOnly={readOnly}
              />
              <DraftPreview title={'风险提醒'} items={riskWarnings} tone="danger" />
            </div>
          ) : null}
          <small>{needsInput ? '补齐后可重新推荐' : `${aiAdvice.facts.join(' · ')} · ${confidenceLabel(aiAdvice.confidence)}`}</small>
        </article>
      ) : null}
    </section>
  )
}

/**
 * 状态建议卡。纯文本建议只显示文字；带 seatId + change 且当前局面确实会被改变的那些，
 * 额外给一枚落盘键。
 *
 * 按钮文案取三段式的第三段「确认落盘」（ABILITY_SETTLEMENT_BOUNDARY:135-137 与
 * AI_AUTHORITY_BOUNDARY:76 已声明它与夜间表单的「确认本项」是同一段动作的两种措辞）。
 * 这里不能沿用「确认本项」：那四个字在同一张卡上已经指「确认这条唤醒项」，
 * 拿它命名一次玩家状态写入，屏幕上就会有两个同名按钮做两件事——那才是第三种叫法。
 */
function StateChangeDrafts({
  advice,
  drafts,
  adoption,
  onAdopt,
  readOnly,
}: {
  advice: AIResultAdvice
  drafts: readonly AIStateChangeDraft[]
  adoption?: StateChangeAdoptionContext
  onAdopt?: (action: GameSessionAction) => void
  readOnly: boolean
}) {
  // 收进 const 才能让下面闭包里的窄化成立：参数是可变绑定，TS 不会把它的窄化带进回调。
  const context = adoption
  if (!drafts.length) return null
  return (
    <div className="settlement-assist__draft-card settlement-assist__draft-card--warning">
      <span>状态确认</span>
      {drafts.slice(0, 3).map((draft) => {
        const projected = context ? projectStateChangeAdoption(draft, context.playerStates) : null
        return (
          <div key={`${draft.seatId ?? 'text'}-${draft.text}`}>
            <p>{draft.text}</p>
            {context && onAdopt && projected ? (
              <Button variant="secondary" compact disabled={readOnly} onClick={() => {
                const action = buildStateChangeAdoption(advice, draft, context, new Date().toISOString())
                if (action) onAdopt(action)
              }}>{`确认落盘 · ${projected.label}`}</Button>
            ) : null}
          </div>
        )
      })}
    </div>
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
