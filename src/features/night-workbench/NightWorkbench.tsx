import { ArrowLeft, MoonStar } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { HostNotice } from '../../components/ui/HostNotice'
import { roleSnapshotsForScript, scriptDisplayName } from '../../domain/scripts'
import { CurrentWakeCard } from './components/CurrentWakeCard'
import { NightActionBar } from './components/NightActionBar'
import { GameRecordSheet } from './components/GameRecordSheet'
import { NightCloseFooter } from './components/NightCloseFooter'
import { NightPlayerCarousel } from './components/NightPlayerCarousel'
import { NightQueueSheet } from './components/NightQueueSheet'
import { PrivateRevealOverlay } from './components/PrivateRevealOverlay'
import { RoleChangeSheet } from './components/RoleChangeSheet'
import { LeaveWorkbenchNotice } from '../game-session/components/LeaveWorkbenchNotice'
import { projectCurrentAssignments } from '../game-session/state/projectors'
import { projectGameRecordEntries } from './state/gameRecordProjection'
import { hasWakeDraftContent } from './state/projectWakeDraft'
import { projectWakePlayerStatus } from './state/projectWakePlayerStatus'
import { currentRoleForItem } from './state/roleChanges'
import { useNightAIAdvice } from './state/useNightAIAdvice'
import { useNightWorkbench } from './state/useNightWorkbench'
import type { NightWorkbenchSessionBinding } from './state/useNightWorkbench'
import type { OutcomeResolutionHint, WakeDraft, WakeItem } from './types'
import './night-workbench.css'
interface NightWorkbenchProps {
  sessionBinding: NightWorkbenchSessionBinding
  onExit: () => void
}
export function NightWorkbench({ sessionBinding, onExit }: NightWorkbenchProps) {
  const [openPanel, setOpenPanel] = useState<'night-order' | 'game-record' | 'role-change' | null>(null)
  const [leavePromptOpen, setLeavePromptOpen] = useState(false)
  const [privateInformation, setPrivateInformation] = useState<string | null>(null)
  const workbench = useNightWorkbench(sessionBinding)
  const { loadingItemId, requestAIAdvice } = useNightAIAdvice()
  const {
    state,
    dispatch,
    current,
    draft,
    activeIndex,
    previous,
    next,
    completed,
    deferred,
    needsReview,
    isPreviewing,
    isReadOnly,
    isCorrecting,
    canConfirm,
    currentRole,
    currentRoleChange,
    previousRole,
    nextRole,
  } = workbench
  const activeItem = state.queue[activeIndex]
  const activePlayerStatus = projectWakePlayerStatus(sessionBinding.session, current)
  const currentAssignments = projectCurrentAssignments(sessionBinding.session)
  const resolutionHint = createResolutionHint(current, draft, activePlayerStatus, currentAssignments)
  const activeRole = currentRoleForItem(activeItem, state.roleChangeEvents)
  const recordEntries = projectGameRecordEntries(state)
  const aiAvailable = current.outcomeOptions.length > 0
  const isAIAdviceLoading = loadingItemId === current.id
  const canUseAI = !isPreviewing && !isReadOnly && aiAvailable && !isAIAdviceLoading
  const aiReference = draft.outputSource?.kind === 'ai'
    ? draft.outputSource
    : draft.outputSource?.kind === 'preset'
      ? draft.outputSource.modifiedFromAI
      : undefined
  const currentInputAdvice = Object.values(state.aiAdviceLog)
    .filter((advice) =>
      advice.status === 'needs_input' &&
      advice.wakeItemId === current.id &&
      advice.contextRevision === state.revision &&
      advice.sourceDraftRevision === draft.draftRevision &&
      advice.knowledgeVersion === state.knowledgeVersion,
    )
    .at(-1)
  const aiAdvice = aiReference ? state.aiAdviceLog[aiReference.adviceId] : currentInputAdvice
  const activeLabel = state.privacyShielded ? `${activeItem.seatId}号角色` : `${activeItem.seatId}号 ${activeRole.name}`
  const previewLabel = state.privacyShielded ? `${current.seatId}号角色` : `${current.seatId}号 ${currentRole.name}`
  const canChangeRole = !isPreviewing && !isCorrecting && !(draft.updatedAt && current.progress !== 'confirmed')
  // progress 从不会是 'draft'（reducer 只写 drafts），所以必须按草稿内容判断，
  // 否则「草稿已保留」的离开守卫永远不会出现，误触返回时说书人会以为记录丢了。
  const hasInProgressDraft = Object.entries(state.drafts).some(([itemId, item]) =>
    hasWakeDraftContent(item) &&
    state.queue.find((entry) => entry.id === itemId)?.progress !== 'confirmed',
  ) || Boolean(state.correctionItemId)
  const canRevealInformation = !state.privacyShielded && !isPreviewing && Boolean(draft.informationGiven.trim())
  const visibleNotice = state.lastNotice?.includes('夜序快照') ? '' : state.lastNotice
  const isSettled = (current.progress === 'confirmed' && !isCorrecting)
    || current.progress === 'deferred'
    || current.progress === 'not_applicable'
  const missingReason = current.applicability === 'needs_review'
      ? '确认是否适用'
      : current.progress === 'deferred'
        ? '已暂缓'
        : current.progress === 'not_applicable'
          ? '本夜不适用'
          : isReadOnly
            ? '已确认'
            // 顺序必须是 目标 → 角色 → 结果：有些结果选项不要求输入（如「未受影响」），
            // 先判结果会在目标还没选时提示「选结果」，而此时唯一可点的正是那个空输入选项，
            // 一按就写下一条假记录。
            : current.targetCount > draft.targets.length
              ? `选${current.targetLabel ?? '目标'}`
              : current.roleChoices && !draft.roleChoice
                ? `选${current.roleLabel ?? '角色'}`
                : !draft.outcomeId || !draft.storytellerResult.trim()
                  ? '选结果'
                  : ''

  function requestExit() {
    if (hasInProgressDraft) {
      setLeavePromptOpen(true)
      return
    }
    onExit()
  }

  function exitAfterPrompt() {
    setLeavePromptOpen(false)
    onExit()
  }

  return (
    <main className={`night-workbench ${state.dimmed ? 'night-workbench--dimmed' : ''}`}>
      <header className="night-header">
        <div className="night-header__title">
          <div className="night-header__kicker"><MoonStar aria-hidden="true" /> 夜间工作台</div>
          <h1>{state.nightLabel}</h1>
          <span>{scriptDisplayName(state.scriptId)} · {state.playerCount}人</span>
        </div>
        <div className="night-progress" aria-label={`当前夜序第${activeIndex + 1}项，共${state.queue.length}项`}>
          <div className="night-progress__numbers">
            <span>夜序</span>
            <strong>{activeIndex + 1}<small>/{state.queue.length}</small></strong>
          </div>
          <div className="night-progress__track" aria-hidden="true">
            <i style={{ width: `${((activeIndex + 1) / state.queue.length) * 100}%` }} />
          </div>
          <div className="night-progress__meta">
            <span>已确认 {completed}</span>
            {deferred ? <span>暂缓 {deferred}</span> : null}
            {needsReview ? <span>待核对 {needsReview}</span> : null}
          </div>
        </div>

        <div className="night-header__actions">
          {!leavePromptOpen ? <Button variant="ghost" compact onClick={requestExit}>
            <ArrowLeft aria-hidden="true" />
            <span className="header-action-label header-action-label--full">返回本局</span>
            <span className="header-action-label header-action-label--compact">返回</span>
          </Button> : null}
          <NightQueueSheet
            open={openPanel === 'night-order'}
            onOpenChange={(open) => setOpenPanel(open ? 'night-order' : null)}
            queue={state.queue}
            nightType={state.nightType}
            activeCursorId={state.activeCursorId}
            previewEntryId={state.previewEntryId}
            concealed={state.privacyShielded}
            completed={completed}
            deferred={deferred}
            needsReview={needsReview}
            onPreview={(id) => dispatch({ type: 'preview', id })}
          />
          <GameRecordSheet
            open={openPanel === 'game-record'}
            onOpenChange={(open) => setOpenPanel(open ? 'game-record' : null)}
            phaseLabel={state.nightLabel}
            entries={recordEntries}
            concealed={state.privacyShielded}
          />
        </div>
      </header>
      {leavePromptOpen ? <LeaveWorkbenchNotice
        title="未完成草稿已保留"
        description="返回后可从本局重新进入夜晚，继续处理当前技能。"
        onStay={() => setLeavePromptOpen(false)}
        onLeave={exitAfterPrompt}
      /> : null}
      <HostNotice message={leavePromptOpen ? '' : visibleNotice} />
      <NightPlayerCarousel
        current={current}
        currentRole={currentRole}
        currentRoleChange={currentRoleChange}
        previous={previous}
        previousRole={previousRole}
        next={next}
        nextRole={nextRole}
        concealed={state.privacyShielded}
        isPreviewing={isPreviewing}
        onPrevious={() => previous && dispatch({ type: 'preview', id: previous.id })}
        onNext={() => next && dispatch({ type: 'preview', id: next.id })}
      />
      <div className="night-content-grid">
        <CurrentWakeCard
          item={current}
          playerStatus={activePlayerStatus}
          draft={draft}
          concealed={state.privacyShielded}
          isPreviewing={isPreviewing}
          isReadOnly={isReadOnly}
          playerCount={state.playerCount}
          aiAdvice={aiAdvice}
          resolutionHint={resolutionHint}
          aiAvailable={aiAvailable}
          canUseAI={canUseAI}
          isAIAdviceLoading={isAIAdviceLoading}
          roleChange={currentRoleChange}
          canChangeRole={canChangeRole}
          canClearDraft={!isPreviewing && !isReadOnly && !isCorrecting && Boolean(draft.updatedAt)}
          canRevealInformation={canRevealInformation}
          onUnshield={() => dispatch({ type: 'set-privacy', shielded: false })}
          onTarget={(seatId) => dispatch({ type: 'target', seatId })}
          onRoleChoice={(roleId) => dispatch({ type: 'role-choice', roleId })}
          onOutcome={(outcomeId) => dispatch({ type: 'outcome', outcomeId })}
          onUseAI={() => requestAIAdvice(state, current, draft, dispatch)}
          onChangeRole={() => setOpenPanel('role-change')}
          onClearDraft={() => dispatch({ type: 'clear-draft' })}
          onRevealInformation={() => {
            dispatch({ type: 'set-privacy', shielded: true })
            setPrivateInformation(draft.informationGiven)
          }}
          onResolveApplicability={(value) => dispatch({ type: 'resolve-applicability', value })}
        />
        <section className="night-action-zone" aria-label="确认本项">
          <NightActionBar
            activeItem={activeItem}
            current={current}
            isPreviewing={isPreviewing}
            isReadOnly={isReadOnly}
            isCorrecting={isCorrecting}
            isSettled={isSettled}
            missingReason={missingReason}
            canConfirm={canConfirm}
            activeLabel={activeLabel}
            previewLabel={previewLabel}
            onReturnCurrent={() => dispatch({ type: 'return-current' })}
            onActivatePreview={() => dispatch({ type: 'activate-preview' })}
            onResume={() => dispatch({ type: 'resume' })}
            onBeginCorrection={() => dispatch({ type: 'begin-correction' })}
            onCancelCorrection={() => dispatch({ type: 'cancel-correction' })}
            onDefer={() => dispatch({ type: 'defer' })}
            onAdvance={() => dispatch({ type: 'advance' })}
            onConfirmStay={() => dispatch({ type: 'confirm', advance: false })}
            onConfirmNext={() => dispatch({ type: 'confirm', advance: true })}
          />
        </section>
      </div>
      <NightCloseFooter
        session={sessionBinding.session}
        dispatch={sessionBinding.dispatchSession}
        nightRunId={state.nightRunId}
        unresolvedCount={state.queue.filter((item) => !['confirmed', 'not_applicable'].includes(item.progress)).length}
        onExit={onExit}
      />
      <RoleChangeSheet
        open={openPanel === 'role-change'}
        onOpenChange={(open) => setOpenPanel(open ? 'role-change' : null)}
        item={current}
        currentRole={currentRole}
        roles={roleSnapshotsForScript(state.scriptId)}
        onConfirm={(role, reason) => dispatch({ type: 'change-role', role, reason })}
      />
      <PrivateRevealOverlay
        open={privateInformation !== null}
        information={privateInformation ?? ''}
        onOpenChange={(open) => {
          if (!open) setPrivateInformation(null)
        }}
      />
    </main>
  )
}

function createResolutionHint(
  item: WakeItem,
  draft: WakeDraft,
  playerStatus: ReturnType<typeof projectWakePlayerStatus>,
  assignments: ReturnType<typeof projectCurrentAssignments>,
): OutcomeResolutionHint | undefined {
  if (item.roleId !== 'gambler' || draft.targets.length !== 1 || !draft.roleChoice) return undefined

  const selectedRole = item.roleChoices?.find((role) => role.id === draft.roleChoice)
  const actualRole = assignments.find((assignment) => assignment.seatId === draft.targets[0])?.role
  if (!selectedRole || !actualRole) return undefined

  if (playerStatus.impairments.includes('poisoned') || playerStatus.impairments.includes('drunk')) {
    return {
      recommendedOutcomeId: 'no-effect',
      title: '核对建议',
      detail: '赌徒当前中毒或醉酒；建议先选“未受影响”。是否另记死亡仍由说书人确认。',
    }
  }

  const correct = actualRole.id === draft.roleChoice
  return {
    recommendedOutcomeId: correct ? 'correct' : 'wrong',
    title: '核对建议',
    detail: `目标实际是${actualRole.name}，本次猜${selectedRole.label}；建议选“${correct ? '猜对 · 无事' : '猜错 · 待死亡'}”。不会自动改死亡状态。`,
  }
}
