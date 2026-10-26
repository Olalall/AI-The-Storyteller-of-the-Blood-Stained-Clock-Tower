import { AlertTriangle, BookOpenText, History, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { outcomeReady } from '../state/projectWakeDraft'
import type { AIResultAdvice, NightSeatSnapshot, OutcomeResolutionHint, PlayerStatusSnapshot, RoleChangeEvent, WakeDraft, WakeItem } from '../types'
import { PlayerStatusBar } from './PlayerStatusBar'
import { SettlementAssistPanel } from './SettlementAssistPanel'
import { canRevealNightResult } from '../../../domain/scripts/nightInteractionInputs'
import { NightRoleChoices } from './NightRoleChoices'
import { NightTargetChoices } from './NightTargetChoices'
import { NightTargetRoleChoices } from './NightTargetRoleChoices'
import { SystemStepFields, SystemStepRoster } from './SystemStepPanel'
import { WakeRegistrationFields } from './WakeRegistrationFields'
import { NightTargetEcho } from './NightTargetEcho'
import { DayFactsBar } from './DayFactsBar'
import { shouldShowDayFacts } from '../../game-session/state/projectDayFacts'
import type { DayFacts } from '../../game-session/state/projectDayFacts'
import { StorytellerContextEditor } from './StorytellerContextEditor'
import { Field } from '../../../components/ui/Field'
import { formalInformationValid } from '../state/projectWakeDraft'

interface CurrentWakeCardProps {
  item: WakeItem
  playerStatus: PlayerStatusSnapshot
  draft: WakeDraft
  concealed: boolean
  isPreviewing: boolean
  isReadOnly: boolean
  targetsOnRing?: boolean
  dayFacts?: DayFacts | null
  onRegistrationChoice?: (value: string) => void
  onSystemCheck?: (checkId: string) => void
  onSystemBluff?: (roleId: string) => void
  playerCount: number
  seats?: Record<number, NightSeatSnapshot>
  unavailableTargetSeatIds?: number[]
  aiAdvice?: AIResultAdvice
  resolutionHint?: OutcomeResolutionHint
  aiAvailable: boolean
  canUseAI: boolean
  isAIAdviceLoading: boolean
  roleChange?: RoleChangeEvent
  canChangeRole: boolean
  canClearDraft: boolean
  canRevealInformation: boolean
  onUnshield: () => void
  onTarget: (seat: number) => void
  onTargetRoleChoice: (index: number, choice: { seatId?: number; roleId?: string }) => void
  onTargetCountChoice?: (count: number) => void
  onRoleChoice: (roleId: string) => void
  onSecondRoleChoice: (roleId: string) => void
  onAdditionalRoleChoice?: (index: 0 | 1, roleId: string) => void
  onStorytellerContext: (value: string) => void
  onInformation: (value: string) => void
  onOutcome: (outcomeId: string) => void
  onUseAI: () => void
  onChangeRole: () => void
  onClearDraft: () => void
  onRevealInformation: () => void
  onResolveApplicability: (value: 'applicable' | 'not_applicable', advance?: boolean) => void
}

export function CurrentWakeCard({
  item,
  playerStatus,
  draft,
  concealed,
  isPreviewing,
  isReadOnly,
  targetsOnRing,
  dayFacts,
  onRegistrationChoice,
  onSystemCheck,
  onSystemBluff,
  playerCount,
  seats,
  unavailableTargetSeatIds,
  aiAdvice,
  resolutionHint,
  aiAvailable,
  canUseAI,
  isAIAdviceLoading,
  roleChange,
  canChangeRole,
  canClearDraft,
  canRevealInformation,
  onUnshield,
  onTarget,
  onTargetRoleChoice,
  onTargetCountChoice,
  onRoleChoice,
  onSecondRoleChoice,
  onAdditionalRoleChoice,
  onStorytellerContext,
  onInformation,
  onOutcome,
  onUseAI,
  onChangeRole,
  onClearDraft,
  onRevealInformation,
  onResolveApplicability,
}: CurrentWakeCardProps) {
  if (concealed) {
    return (
      <section className="privacy-curtain">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>已遮蔽</strong>
          <p>玩家看完信息后，点这里恢复说书人视图。</p>
        </div>
        <Button variant="primary" onClick={onUnshield}>解除遮蔽</Button>
      </section>
    )
  }

  const formDisabled = isPreviewing || isReadOnly || item.interactionVersion === 'farmer/trigger-review-v1' && item.applicability !== 'applicable'
  const modifiedFromAI = draft.outputSource?.kind === 'preset'
    ? draft.outputSource.modifiedFromAI
    : undefined
  const aiOutcomeLabel = aiAdvice?.status === 'answer' && aiAdvice.recommendedOutcomeId
    ? item.outcomeOptions.find((option) => option.id === aiAdvice.recommendedOutcomeId)?.label
    : undefined
  const resolutionOutcomeLabel = resolutionHint
    ? item.outcomeOptions.find((option) => option.id === resolutionHint.recommendedOutcomeId)?.label
    : undefined
  const aiActionLabel = isAIAdviceLoading ? '推荐中' : aiAdvice?.status === 'needs_input' ? '重新推荐' : 'AI推荐'

  return (
    <section className="wake-workspace">
      {!item.systemStep && !item.lilMonstaStep && item.interactionVersion !== 'legion/collective-night-v1' ? <PlayerStatusBar
        playerLabel={item.playerLabel}
        status={playerStatus}
        queuedRoleName={roleChange && roleChange.toRole.id !== item.roleId ? item.roleName : undefined}
        canChangeRole={canChangeRole}
        onChangeRole={onChangeRole}
      /> : null}
      <div className="wake-facts">
        {item.hostConfirmation ? <fieldset disabled={formDisabled || Boolean(item.hostConfirmation.blockedReason)} className="night-disclosure">
          <legend>信息交接核对</legend><p>{item.hostConfirmation.summary}</p>
          {item.hostConfirmation.blockedReason ? <p role="alert">{item.hostConfirmation.blockedReason}</p> : <label><input type="checkbox" checked={draft.systemChecks?.includes(item.hostConfirmation.checkId) ?? false} onChange={() => onSystemCheck?.(item.hostConfirmation!.checkId)} />{item.hostConfirmation.label}</label>}
        </fieldset> : null}
        <div className="section-kicker"><BookOpenText aria-hidden="true" />{item.systemStep ? `步骤说明 · ${item.roleName}` : roleChange ? `角色能力 · ${item.roleName}` : '角色能力'}</div>
        <p>{item.ability}</p>
        {item.openingNote ? <p className="night-disclosure">{item.openingNote}</p> : null}
        {item.applicability === 'needs_review' ? <StatusBadge tone="warning">需要核对</StatusBadge> : null}
        {item.reason ? (
          <div className="inline-warning"><AlertTriangle aria-hidden="true" />{item.reason}</div>
        ) : null}
        {item.applicability === 'needs_review' ? (
          <div className="applicability-actions">
            <Button variant="secondary" compact disabled={isPreviewing} onClick={() => onResolveApplicability('applicable')}>适用</Button>
            <Button variant="ghost" compact disabled={isPreviewing} onClick={() => onResolveApplicability('not_applicable', playerStatus.life === 'dead')}>{playerStatus.life === 'dead' ? '确认不适用并继续' : '不适用'}</Button>
          </div>
        ) : null}
        {item.systemStep ? <><SystemStepRoster step={item.systemStep} /><p>出示信息标记：{item.systemStep.infoTokens.map((token) => `「${token}」`).join('、')}</p></> : null}
        {shouldShowDayFacts(item.roleId, concealed, dayFacts) ? <DayFactsBar facts={dayFacts} /> : null}
        {item.history ? (
          <details className="wake-history">
            <summary><History aria-hidden="true" />上次记录</summary>
            <span>{item.history}</span>
          </details>
        ) : null}
      </div>

      {item.applicability === 'not_applicable' ? <div className="wake-recorder" role="status">
        <h2>本夜不适用</h2><p>{item.history ?? item.reason ?? '无需录入技能结果；确认后可继续夜序。'}</p>
      </div> : <div className="wake-recorder" aria-disabled={formDisabled}>
        <div className="section-heading">
          <div>
            <h2>本项记录</h2>
          </div>
          <div className="section-heading__state">
            {isPreviewing
              ? <StatusBadge tone="warning">预览</StatusBadge>
              : isReadOnly
                ? <StatusBadge tone="success">已确认</StatusBadge>
                : draft.updatedAt
                  ? <StatusBadge tone="info">已暂存</StatusBadge>
                  : null}
            {canClearDraft ? <Button variant="ghost" compact onClick={onClearDraft}>清空重选</Button> : null}
          </div>
        </div>

        {item.systemStep ? <SystemStepFields step={item.systemStep} draft={draft} disabled={formDisabled} onToggleCheck={(id) => onSystemCheck?.(id)} onToggleBluff={(id) => onSystemBluff?.(id)} /> : null}
        {item.registrationSpec ? <WakeRegistrationFields spec={item.registrationSpec} draft={draft} forbiddenValues={item.forbiddenRegistrationValues} disabled={formDisabled} onChange={(value) => onRegistrationChoice?.(value)} /> : null}
        {targetsOnRing && item.targetCount > 0 && item.targetRoleChoiceCount === undefined ? <NightTargetEcho seats={seats} playerCount={playerCount} selfSeatId={item.seatId} targetLabel={item.targetLabel ?? '目标'} targetCount={item.targetCount} targets={draft.targets} forbiddenSeatIds={item.forbiddenTargetSeatIds} disabled={formDisabled} onTarget={onTarget} /> : null}
        {item.targetRoleChoiceCount !== undefined
          ? <NightTargetRoleChoices seats={seats} item={item} draft={draft} disabled={formDisabled} playerCount={playerCount} onChange={onTargetRoleChoice} />
          : <>{!targetsOnRing ? <NightTargetChoices seats={seats} item={item} draft={draft} disabled={formDisabled} playerCount={playerCount} onTarget={onTarget} onTargetCountChoice={onTargetCountChoice} unavailableSeatIds={unavailableTargetSeatIds} /> : null}
            <NightRoleChoices item={item} draft={draft} disabled={formDisabled} onRoleChoice={onRoleChoice} onSecondRoleChoice={onSecondRoleChoice} onAdditionalRoleChoice={onAdditionalRoleChoice} /></>}
        <StorytellerContextEditor key={`${item.id}:${formDisabled}:${draft.storytellerContext ?? ''}`} value={draft.storytellerContext} disabled={formDisabled} onSave={onStorytellerContext} />

        {item.informationInput ? <Field label="正式告知数字" hint={`填写${item.informationInput.minimum}-${item.informationInput.maximum}的整数；毒醉、误登记等情况仍由说书人决定答案，不自动计算。`}
          error={!formDisabled && draft.informationGiven && !formalInformationValid(item, draft) ? `请输入${item.informationInput.minimum}-${item.informationInput.maximum}的整数` : undefined}>
          <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="正式告知数字" aria-invalid={Boolean(!formDisabled && draft.informationGiven && !formalInformationValid(item, draft))} value={draft.informationGiven} disabled={formDisabled} onChange={(event) => onInformation(event.target.value)} />
        </Field> : null}

        <fieldset disabled={formDisabled}>
          <legend className="result-legend">
            <span>结果候选</span>
            {aiAvailable && draft.outputSource?.kind !== 'ai' ? (
              <Button
                type="button"
                variant="ghost"
                compact
                className="ai-result-action"
                disabled={!canUseAI || formDisabled}
                aria-label={isAIAdviceLoading ? 'AI推荐中' : aiActionLabel}
                onClick={onUseAI}
              >
                <Sparkles aria-hidden="true" />{aiActionLabel}
              </Button>
            ) : draft.outputSource?.kind === 'ai' ? <StatusBadge tone="info">AI草稿</StatusBadge> : null}
            {!draft.outcomeId
              ? <StatusBadge tone="neutral">待选择</StatusBadge>
              : !isReadOnly ? <StatusBadge tone="warning">待确认</StatusBadge> : null}
          </legend>
          <div className="outcome-grid">
            {item.outcomeOptions.map((option) => {
              const aiRecommended = aiAdvice?.status === 'answer' && aiAdvice.recommendedOutcomeId === option.id
              const resolutionRecommended = resolutionHint?.recommendedOutcomeId === option.id
              const isException = option.id === 'no-effect' || option.label === '未受影响'
              return (
                <button
                  key={option.id}
                  type="button"
                  className={[
                    'outcome-button',
                    draft.outcomeId === option.id ? 'outcome-button--selected' : '',
                    isException ? 'outcome-button--exception' : '',
                  ].filter(Boolean).join(' ')}
                  disabled={!outcomeReady(option, item, draft)}
                  onClick={() => onOutcome(draft.outcomeId === option.id ? '' : option.id)}
                  aria-pressed={draft.outcomeId === option.id}
                  aria-label={`${option.label}${aiRecommended ? '，AI建议' : resolutionRecommended ? '，核对建议' : ''}`}
                >
                  <span>{option.label}</span>
                  {aiRecommended ? <StatusBadge tone="info" size="sm">AI建议</StatusBadge>
                    : resolutionRecommended ? <StatusBadge tone="info" size="sm">核对建议</StatusBadge>
                      : null}
                </button>
              )
            })}
          </div>
        </fieldset>

        <ConfirmDraftPreview draft={draft} isReadOnly={isReadOnly} />

        <SettlementAssistPanel
          aiAdvice={aiAdvice}
          aiOutcomeLabel={aiOutcomeLabel}
          resolutionHint={resolutionHint}
          resolutionOutcomeLabel={resolutionOutcomeLabel}
          modifiedFromAI={Boolean(modifiedFromAI)}
          readOnly={formDisabled}
        />

        {draft.outcomeId && draft.informationGiven && item.targetRoleChoiceCount === undefined && canRevealNightResult(item.roleId) ? (
          <section className="information-preview">
            <div>
              <div><strong>告知玩家</strong><StatusBadge tone="neutral">待告知</StatusBadge></div>
              {canRevealInformation ? <Button variant="secondary" compact onClick={onRevealInformation}>展示信息</Button> : null}
            </div>
            <p>{draft.informationGiven}</p>
          </section>
        ) : null}

      </div>}
    </section>
  )
}

function ConfirmDraftPreview({
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
      {draft.storytellerContext ? <small>已核对事实：{draft.storytellerContext}</small> : null}
      {!isReadOnly ? <small>不自动改身份、阵营、死亡、毒醉。</small> : null}
    </section>
  )
}

