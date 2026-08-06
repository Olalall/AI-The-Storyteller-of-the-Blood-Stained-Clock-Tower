import { AlertTriangle, BookOpenText, History, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { DayFactsBar } from './DayFactsBar'
import { shouldShowDayFacts, type DayFacts } from '../../game-session/state/projectDayFacts'
import { outcomeReady } from '../state/projectWakeDraft'
import { isPreviewMode, isSettledMode, type WorkbenchMode } from '../state/workbenchMode'
import type {
  AIResultAdvice,
  OutcomeResolutionHint,
  PlayerStatusSnapshot,
  RoleChangeEvent,
  WakeDraft,
  WakeItem,
} from '../types'
import { ConfirmDraftPreview } from './ConfirmDraftPreview'
import { PlayerStatusBar } from './PlayerStatusBar'
import { roleChoiceHint, roleChoiceTitle } from './roleChoiceLabels'
import { SystemStepFields, SystemStepRoster } from './SystemStepPanel'
import { SettlementAssistPanel } from './SettlementAssistPanel'
import { WakeTargetPicker, type WakeTargetPickerKind } from './WakeTargetPicker'

interface CurrentWakeCardProps {
  /** 当日客观事实；只对回溯型角色渲染，遮蔽态下由本组件跳过。 */
  dayFacts?: DayFacts | null
  item: WakeItem
  playerStatus: PlayerStatusSnapshot
  draft: WakeDraft
  concealed: boolean
  mode: WorkbenchMode
  /**
   * 唯一的写入闸门，由 useNightWorkbench 算好后自上而下传。本组件不得自己拼
   * `isPreviewing || isReadOnly`——那正是旧写法，每加一个只读来源都得回来补一次或。
   */
  readOnly: boolean
  /**
   * 目标怎么选。`grid` 是纯记录模式的 6 列号码网格；`ring` 是魔典模式——
   * 主选择面搬到环上，这里只留一行「已选：5号 ✕」回显加一个折叠的号码网格作无障碍通道。
   *
   * 做成 prop 而不是在组件里读 hostingMode：state 之外的地方读模式虽不违规，
   * 但每多一处读它，「模式不是行为开关」这条就松一分。调用方已经知道答案，传下来即可。
   */
  targetPicker?: WakeTargetPickerKind
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
  onSystemCheck: (checkId: string) => void
  onSystemBluff: (roleId: string) => void
  onOutcome: (outcomeId: string) => void
  onUseAI: () => void
  onChangeRole: () => void
  onClearDraft: () => void
  onRevealInformation: () => void
  onResolveApplicability: (value: 'applicable' | 'not_applicable') => void
}

export function CurrentWakeCard({
  dayFacts,
  item,
  playerStatus,
  draft,
  concealed,
  mode,
  readOnly,
  targetPicker = 'grid',
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
  onSystemCheck,
  onSystemBluff,
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

  // 旧代码在这里现算 `isPreviewing || isReadOnly` 当作表单禁用条件；
  // 现在直接用自上而下的 readOnly，本组件不再持有第二份「能不能写」的判断。
  // 「已落定」另算：它只决定文案（已写入 / 确认后写入、已确认徽标），不决定能不能写。
  const settled = isSettledMode(mode)
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
      {item.systemStep ? (
        // 系统步骤没有单一玩家，套一条「某某状态」的状态栏会把第一名爪牙的生死当成整步的状态。
        <SystemStepRoster step={item.systemStep} />
      ) : (
        <PlayerStatusBar
          playerLabel={item.playerLabel}
          status={playerStatus}
          queuedRoleName={roleChange ? item.roleName : undefined}
          canChangeRole={canChangeRole}
          onChangeRole={onChangeRole}
        />
      )}
      <div className="wake-facts">
        <div className="section-kicker">
          <BookOpenText aria-hidden="true" />
          {item.systemStep ? `步骤说明 · ${item.roleName}` : roleChange ? `角色能力 · ${item.roleName}` : '角色能力'}
        </div>
        <p>{item.ability}</p>
        {item.systemStep ? (
          <p className="system-step-tokens">
            出示信息标记：{item.systemStep.infoTokens.map((token) => `「${token}」`).join(' → ')}
          </p>
        ) : null}
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
        {shouldShowDayFacts(item.roleId, concealed, dayFacts) ? (
          <DayFactsBar facts={dayFacts} />
        ) : null}
        {item.history ? (
          <details className="wake-history">
            <summary><History aria-hidden="true" />上次记录</summary>
            <span>{item.history}</span>
          </details>
        ) : null}
      </div>

      <div className="wake-recorder" aria-disabled={readOnly}>
        <div className="section-heading">
          <div>
            <h2>本项记录</h2>
          </div>
          <div className="section-heading__state">
            {isPreviewMode(mode)
              ? <StatusBadge tone="warning">预览</StatusBadge>
              : settled
                ? <StatusBadge tone="success">已确认</StatusBadge>
                : draft.updatedAt
                  ? <StatusBadge tone="info">已暂存</StatusBadge>
                  : null}
            {canClearDraft ? <Button variant="ghost" compact onClick={onClearDraft}>清空重选</Button> : null}
          </div>
        </div>

        {item.systemStep ? (
          <SystemStepFields
            step={item.systemStep}
            draft={draft}
            disabled={readOnly}
            onToggleCheck={onSystemCheck}
            onToggleBluff={onSystemBluff}
          />
        ) : null}

        {item.targetCount > 0 ? (
          <WakeTargetPicker
            picker={targetPicker}
            playerCount={playerCount}
            selfSeatId={item.seatId}
            targetLabel={item.targetLabel ?? '目标'}
            targetCount={item.targetCount}
            targets={draft.targets}
            disabled={readOnly}
            onTarget={onTarget}
          />
        ) : null}

        {item.roleChoices ? (
          <fieldset disabled={readOnly}>
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

        <fieldset disabled={readOnly}>
          <legend className="result-legend">
            <span>结果候选</span>
            {aiAvailable && draft.outputSource?.kind !== 'ai' ? (
              <Button
                type="button"
                variant="ghost"
                compact
                className="ai-result-action"
                disabled={!canUseAI || readOnly}
                aria-label={isAIAdviceLoading ? 'AI推荐中' : aiActionLabel}
                onClick={onUseAI}
              >
                <Sparkles aria-hidden="true" />{aiActionLabel}
              </Button>
            ) : draft.outputSource?.kind === 'ai' ? <StatusBadge tone="info">AI草稿</StatusBadge> : null}
            {!draft.outcomeId
              ? <StatusBadge tone="neutral">待选择</StatusBadge>
              : !settled ? <StatusBadge tone="warning">待确认</StatusBadge> : null}
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

        <ConfirmDraftPreview draft={draft} settled={settled} />

        <SettlementAssistPanel
          aiAdvice={aiAdvice}
          aiOutcomeLabel={aiOutcomeLabel}
          resolutionHint={resolutionHint}
          resolutionOutcomeLabel={resolutionOutcomeLabel}
          modifiedFromAI={Boolean(modifiedFromAI)}
          // 这块面板不在任何 fieldset 里，「确认落盘」是本卡上唯一自带 dispatch 的键，
          // 所以只读必须显式压给它一次；靠 fieldset 兜住的那几块不需要这一行。
          readOnly={readOnly}
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
