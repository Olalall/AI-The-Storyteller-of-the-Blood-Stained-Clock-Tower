import { ArrowLeft } from 'lucide-react'
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
import { projectDayFacts } from '../game-session/state/projectDayFacts'
import { projectGameRecordEntries } from './state/gameRecordProjection'
import { hasWakeDraftContent } from './state/projectWakeDraft'
import { projectWakePlayerStatus } from './state/projectWakePlayerStatus'
import { createResolutionHint } from './state/resolutionHint'
import { currentRoleForItem } from './state/roleChanges'
import { systemStepMissingReason } from './state/systemSteps'
import { useNightAIAdvice } from './hooks/useNightAIAdvice'
import { useNightWorkbench } from './hooks/useNightWorkbench'
import { isCorrectionMode, isLiveFocusMode, isSettledMode } from './state/workbenchMode'
import type { NightWorkbenchSessionBinding } from './hooks/useNightWorkbench'
import './night-workbench.css'
interface NightWorkbenchProps {
  sessionBinding: NightWorkbenchSessionBinding
  /** 「返回本局」：离开工作台去看档案，不改变任何相位。 */
  onExit: () => void
  /** 「关闭本夜」：夜晚段已关闭，交给上层决定下一步（默认走黎明播报）。 */
  onCloseNight?: () => void
  /**
   * 转盘已由外层承担（魔典模式下它降级进了 core），这里不要再画一份。
   *
   * 两份的代价不只是重复：转盘一次显示三个角色名，而环此刻是遮蔽态，
   * 于是「环上一个名字都没有、抽屉里八个名字」——遮蔽看起来生效了，实际没有。
   * 文档第 152 行的原话就是「转盘不再占一屏」，一屏两份是它要消除的东西。
   */
  carouselElsewhere?: boolean
}
export function NightWorkbench({ sessionBinding, onExit, onCloseNight, carouselElsewhere = false }: NightWorkbenchProps) {
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
    mode,
    readOnly,
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
  const dayFacts = projectDayFacts(sessionBinding.session)
  // 系统步骤是流程记录，不是可结算的技能：AI 结算链路对它没有任何依据可用。
  const aiAvailable = current.outcomeOptions.length > 0 && !current.systemStep
  const isAIAdviceLoading = loadingItemId === current.id
  // 原式 `!isPreviewing && !isReadOnly`：两者的并集就是「这一屏不可写」，即 readOnly。
  const canUseAI = !readOnly && aiAvailable && !isAIAdviceLoading
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
  const activeLabel = activeItem.systemStep
    ? activeItem.roleName
    : state.privacyShielded ? `${activeItem.seatId}号角色` : `${activeItem.seatId}号 ${activeRole.name}`
  const previewLabel = current.systemStep
    ? current.roleName
    : state.privacyShielded ? `${current.seatId}号角色` : `${current.seatId}号 ${currentRole.name}`
  // 原式 `!isPreviewing && !isCorrecting`：焦点要落在正在处理的那一项上，且不在更正过程中。
  // 注意它不等于「可写」——已确认（settled）的项仍然允许换角，所以不能写成 !readOnly。
  const canChangeRole = isLiveFocusMode(mode) && !isCorrectionMode(mode) && !current.systemStep && !(draft.updatedAt && current.progress !== 'confirmed')
  // progress 从不会是 'draft'（reducer 只写 drafts），所以必须按草稿内容判断，
  // 否则「草稿已保留」的离开守卫永远不会出现，误触返回时说书人会以为记录丢了。
  const hasInProgressDraft = Object.entries(state.drafts).some(([itemId, item]) =>
    hasWakeDraftContent(item) &&
    state.queue.find((entry) => entry.id === itemId)?.progress !== 'confirmed',
  ) || Boolean(state.correctionItemId)
  // 原式 `!isPreviewing`：展示信息是读动作，已确认的项照样能再展示一次给玩家看。
  const canRevealInformation = !state.privacyShielded && isLiveFocusMode(mode) && Boolean(draft.informationGiven.trim())
  const visibleNotice = state.lastNotice?.includes('夜序快照') ? '' : state.lastNotice
  const systemMissing = systemStepMissingReason(current, draft)
  const missingReason = current.applicability === 'needs_review'
      ? '确认是否适用'
      : current.progress === 'deferred'
        ? '已暂缓'
        : current.progress === 'not_applicable'
          ? '本夜不适用'
          // 原式 isReadOnly：走到这里 deferred / not_applicable 已被上面两支接掉，剩下的只可能是「已确认」。
          : isSettledMode(mode)
            ? '已确认'
            : systemMissing
              ? systemMissing
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
        {/*
          「第N夜」与夜序进度都由常驻阶段轨道承载，页头只留不随相位变化的稳定信息。
          h1 视觉上收起但保留在无障碍树里：页面仍需要一个可被屏读定位的标题。
        */}
        <h1 className="ui-visually-hidden">{state.nightLabel}</h1>
        <span className="night-header__session">{scriptDisplayName(state.scriptId)} · {state.playerCount}人</span>

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
      {carouselElsewhere ? null : <NightPlayerCarousel
        current={current}
        currentRole={currentRole}
        currentRoleChange={currentRoleChange}
        previous={previous}
        previousRole={previousRole}
        next={next}
        nextRole={nextRole}
        concealed={state.privacyShielded}
        mode={mode}
        onPrevious={() => previous && dispatch({ type: 'preview', id: previous.id })}
        onNext={() => next && dispatch({ type: 'preview', id: next.id })}
      />}
      <div className="night-content-grid">
        <div className="night-progress" aria-label={`当前夜序第${activeIndex + 1}项，共${state.queue.length}项`}>
          <p className="night-progress__numbers">
            <span>夜序</span>
            <strong>{activeIndex + 1}</strong>
            <small>/{state.queue.length}</small>
          </p>
          <div className="night-progress__track" aria-hidden="true">
            <i style={{ width: `${((activeIndex + 1) / state.queue.length) * 100}%` }} />
          </div>
          <div className="night-progress__meta">
            <span>已确认 {completed}</span>
            {deferred ? <span>暂缓 {deferred}</span> : null}
            {needsReview ? <span>待核对 {needsReview}</span> : null}
          </div>
        </div>
        <CurrentWakeCard
          dayFacts={dayFacts}
          item={current}
          playerStatus={activePlayerStatus}
          draft={draft}
          concealed={state.privacyShielded}
          mode={mode}
          readOnly={readOnly}
          playerCount={state.playerCount}
          aiAdvice={aiAdvice}
          resolutionHint={resolutionHint}
          aiAvailable={aiAvailable}
          canUseAI={canUseAI}
          isAIAdviceLoading={isAIAdviceLoading}
          roleChange={currentRoleChange}
          canChangeRole={canChangeRole}
          // 原式 `!isPreviewing && !isReadOnly && !isCorrecting`：前两项合起来是 readOnly，
          // 再排掉更正态——更正中的草稿是原确认快照的副本，「清空重选」清掉它等于凭空丢掉已写入的记录。
          canClearDraft={!readOnly && !isCorrectionMode(mode) && Boolean(draft.updatedAt)}
          canRevealInformation={canRevealInformation}
          onUnshield={() => dispatch({ type: 'set-privacy', shielded: false })}
          onTarget={(seatId) => dispatch({ type: 'target', seatId })}
          onRoleChoice={(roleId) => dispatch({ type: 'role-choice', roleId })}
          onSystemCheck={(checkId) => dispatch({ type: 'system-check', checkId })}
          onSystemBluff={(roleId) => dispatch({ type: 'system-bluff', roleId })}
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
            mode={mode}
            readOnly={readOnly}
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
        onExit={onCloseNight ?? onExit}
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
