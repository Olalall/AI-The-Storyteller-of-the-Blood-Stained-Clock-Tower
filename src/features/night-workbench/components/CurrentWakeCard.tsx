import { AlertTriangle, BookOpenText, History, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { SeatButton } from '../../../components/ui/SeatButton'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { outcomeReady } from '../state/projectWakeDraft'
import type { AIResultAdvice, OutcomeResolutionHint, PlayerStatusSnapshot, RoleChangeEvent, WakeDraft, WakeItem } from '../types'
import { PlayerStatusBar } from './PlayerStatusBar'
import { SettlementAssistPanel } from './SettlementAssistPanel'

interface CurrentWakeCardProps {
  item: WakeItem
  playerStatus: PlayerStatusSnapshot
  draft: WakeDraft
  concealed: boolean
  isPreviewing: boolean
  isReadOnly: boolean
  playerCount: number
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
  onRoleChoice: (roleId: string) => void
  onOutcome: (outcomeId: string) => void
  onUseAI: () => void
  onChangeRole: () => void
  onClearDraft: () => void
  onRevealInformation: () => void
  onResolveApplicability: (value: 'applicable' | 'not_applicable') => void
}

export function CurrentWakeCard({
  item,
  playerStatus,
  draft,
  concealed,
  isPreviewing,
  isReadOnly,
  playerCount,
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
  onRoleChoice,
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

  const formDisabled = isPreviewing || isReadOnly
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
      <PlayerStatusBar
        playerLabel={item.playerLabel}
        status={playerStatus}
        queuedRoleName={roleChange ? item.roleName : undefined}
        canChangeRole={canChangeRole}
        onChangeRole={onChangeRole}
      />
      <div className="wake-facts">
        <div className="section-kicker"><BookOpenText aria-hidden="true" />{roleChange ? `角色能力 · ${item.roleName}` : '角色能力'}</div>
        <p>{item.ability}</p>
        {item.applicability === 'needs_review' ? <StatusBadge tone="warning">需要核对</StatusBadge> : null}
        {item.reason ? (
          <div className="inline-warning"><AlertTriangle aria-hidden="true" />{item.reason}</div>
        ) : null}
        {item.applicability === 'needs_review' ? (
          <div className="applicability-actions">
            <Button variant="secondary" compact onClick={() => onResolveApplicability('applicable')}>适用</Button>
            <Button variant="ghost" compact onClick={() => onResolveApplicability('not_applicable')}>不适用</Button>
          </div>
        ) : null}
        {item.history ? (
          <details className="wake-history">
            <summary><History aria-hidden="true" />上次记录</summary>
            <span>{item.history}</span>
          </details>
        ) : null}
      </div>

      <div className="wake-recorder" aria-disabled={formDisabled}>
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

        {item.targetCount > 0 ? (
          <fieldset disabled={formDisabled}>
            <legend>{item.targetLabel ?? '目标'} <span>{draft.targets.length}/{item.targetCount}</span></legend>
            <div className="seat-grid">
              {Array.from({ length: playerCount }, (_, index) => index + 1).map((seat) => (
                <SeatButton
                  key={seat}
                  seat={seat}
                  selected={draft.targets.includes(seat)}
                  subdued={seat === item.seatId}
                  onClick={() => onTarget(seat)}
                  aria-label={`选择${seat}号玩家`}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {item.roleChoices ? (
          <fieldset disabled={formDisabled}>
            <legend className="choice-legend">
              <span>{roleChoiceTitle(item)}</span>
              <small>{roleChoiceHint(item)}</small>
            </legend>
            <div className="choice-chips">
              {item.roleChoices.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={draft.roleChoice === role.id ? 'choice-chip choice-chip--selected' : 'choice-chip'}
                  onClick={() => onRoleChoice(role.id)}
                  aria-pressed={draft.roleChoice === role.id}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

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
                  {aiRecommended ? <small>AI建议</small> : resolutionRecommended ? <small>核对建议</small> : null}
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
        />

        {draft.informationGiven ? (
          <section className="information-preview">
            <div>
              <div><strong>告知玩家</strong><StatusBadge tone="neutral">待告知</StatusBadge></div>
              {canRevealInformation ? <Button variant="secondary" compact onClick={onRevealInformation}>展示信息</Button> : null}
            </div>
            <p>{draft.informationGiven}</p>
          </section>
        ) : null}

      </div>
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
      {!isReadOnly ? <small>不自动改身份、阵营、死亡、毒醉。</small> : null}
    </section>
  )
}

function roleChoiceTitle(item: WakeItem) {
  if (item.roleId === 'cerenovus') return '洗脑师要求声称'
  if (item.roleId === 'gambler') return '赌徒猜测身份'
  if (item.roleId === 'philosopher') return '哲学家获得能力'
  if (item.roleId === 'pithag') return '麻脸巫婆变成'
  return item.roleLabel ?? '角色'
}

function roleChoiceHint(item: WakeItem) {
  if (item.roleId === 'cerenovus') return '仅本技能出现 · 可选善良角色'
  if (item.roleId === 'gambler') return '仅本技能出现 · 猜错则死亡'
  if (item.roleId === 'philosopher') return '仅本技能出现 · 获得对应能力'
  if (item.roleId === 'pithag') return '仅本技能出现 · 改为目标角色'
  return '本项专属选项'
}
