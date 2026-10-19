import { ArrowLeft, Check, Gavel, Hand, SunMedium, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { StickyActionBar } from '../../components/ui/StickyActionBar'
import { projectCurrentPlayerStates } from '../game-session/state/projectors'
import { dayActionDraftContentKinds } from '../game-session/state/dayActionDraft'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import type { GameSessionState } from '../game-session/types'
import { canCompleteVoteRound, completeVoteRound, setVoteNominator, setVoteNominee, type VoteRoundDraft } from './state/voteRound'
import { leaveNoticeCopy } from './state/dayDraft'
import { projectDayStepContext, roundStatusLabel } from './state/dayStep'
import { useDayRingFocus } from './state/dayRingFocus'
import { DayStepRow } from './components/DayStepRow'
import { NominationStep } from './components/NominationStep'
import { DayVoteEditor } from './components/DayVoteEditor'
import { DayVoteHistory } from './components/DayVoteHistory'
import { SpecialExecution } from './components/SpecialExecution'
import { projectStandingExecution } from './state/voteStanding'
import { DayTimer } from './components/DayTimer'
import { DayRecordSheet } from './components/DayRecordSheet'
import { LeaveWorkbenchNotice } from '../game-session/components/LeaveWorkbenchNotice'
import './day-workbench.css'

interface DayWorkbenchProps {
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
  onExit: () => void
  onOpenTimer?: () => void
}

type PendingResolution =
  | { kind: 'execution'; seatId: number; segmentId: string; sourceRoundId: string; causesDeath: boolean }
  | { kind: 'no_execution'; segmentId: string }
type PendingDayClose = 'empty' | 'draft'

export function DayWorkbench({ session, dispatch, onExit, onOpenTimer }: DayWorkbenchProps) {
  const [pendingResolution, setPendingResolution] = useState<PendingResolution | null>(null)
  const [pendingDayClose, setPendingDayClose] = useState<PendingDayClose | null>(null)
  const [leavePromptOpen, setLeavePromptOpen] = useState(false)
  const { nominationTarget, setNominationTarget, stepOverride, setStepOverride, setWriteLocked } = useDayRingFocus()
  const { draft, nominationReady, hasUnrecordedVote, suggested } = projectDayStepContext(session)
  const activeStep = stepOverride ?? suggested
  const playerStates = projectCurrentPlayerStates(session)
  const openDay = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
  const dayEntries = useMemo(() => session.timeline.filter((entry) => entry.kind === 'vote_round'), [session.timeline])
  const standing = openDay ? projectStandingExecution(dayEntries, openDay.id) : { status: 'none' as const }
  const roundNumber = dayEntries.filter((entry) => entry.segmentId === openDay?.id && !entry.correctionOf).length + 1
  const dayResolution = openDay
    ? [...session.timeline].filter((entry) => entry.segmentId === openDay.id && (entry.kind === 'execution' || entry.kind === 'no_execution')).at(-1)
    : undefined
  const dayLocked = Boolean(pendingResolution || pendingDayClose || dayResolution)
  const dayActionKinds = dayActionDraftContentKinds(session.dayActionDraft)
  const hasUnrecordedDayAction = dayActionKinds.length > 0
  const leaveNotice = leaveNoticeCopy(hasUnrecordedVote, dayActionKinds)
  const roundStatus = roundStatusLabel(draft)

  // 环与抽屉共用确认闸门；只广播 UI 状态，不写入对局事实。
  useEffect(() => { setWriteLocked(dayLocked || leavePromptOpen) }, [dayLocked, leavePromptOpen, setWriteLocked])
  useEffect(() => () => setWriteLocked(false), [setWriteLocked])

  function selectNominationSeat(seatId: number) {
    updateDraft((current) => nominationTarget === 'nominator'
      ? setVoteNominator(current, seatId)
      : setVoteNominee(current, seatId))
  }

  function cancelRound() {
    if (dayLocked) return
    dispatch({ type: 'clear-day-vote-draft' })
    setNominationTarget('nominator')
    setStepOverride(null)
  }

  function updateDraft(update: VoteRoundDraft | ((current: VoteRoundDraft) => VoteRoundDraft)) {
    if (dayLocked || leavePromptOpen) return
    const next = typeof update === 'function' ? update(draft) : update
    dispatch({ type: 'set-day-vote-draft', draft: next })
  }

  function completeRound() {
    if (dayLocked || leavePromptOpen) return
    const entry = completeVoteRound(draft, {
      id: `vote-round-${crypto.randomUUID()}`,
      roundId: `round-${roundNumber}`,
      createdAt: new Date().toISOString(),
    })
    if (!entry) return
    const { segmentId: _segmentId, createdAt: _createdAt, id: _id, confirmedBy: _confirmedBy, ...input } = entry
    dispatch({
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: input,
      input: { id: entry.id, createdAt: entry.createdAt },
    })
    setNominationTarget('nominator')
    setStepOverride(null)
  }

  function confirmResolution() {
    if (!pendingResolution) return
    const currentDay = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
    if (!currentDay || currentDay.id !== pendingResolution.segmentId || dayResolution) {
      setPendingResolution(null)
      return
    }
    const createdAt = new Date().toISOString()
    const entrySuffix = Date.now()
    if (pendingResolution.kind === 'execution') {
      const currentStanding = projectStandingExecution(session.timeline, pendingResolution.segmentId)
      if (!['leading', 'replaced'].includes(currentStanding.status) || currentStanding.nomineeSeatId !== pendingResolution.seatId || currentStanding.sourceRoundId !== pendingResolution.sourceRoundId) {
        setPendingResolution(null)
        return
      }
      dispatch({
        type: 'confirm-day-execution',
        daySegmentId: pendingResolution.segmentId,
        nomineeSeatId: pendingResolution.seatId,
        sourceRoundId: pendingResolution.sourceRoundId,
        executionEntryId: `execution-${pendingResolution.seatId}-${entrySuffix}`,
        playerStateEntryId: `state-${pendingResolution.seatId}-${entrySuffix}`,
        confirmedAt: createdAt,
        causesDeath: pendingResolution.causesDeath,
      })
    } else {
      dispatch({
        type: 'confirm-day-no-execution',
        daySegmentId: pendingResolution.segmentId,
        entryId: `no-execution-${entrySuffix}`,
        confirmedAt: createdAt,
      })
    }
    setPendingResolution(null)
  }

  function requestDayClose() {
    setPendingDayClose(hasUnrecordedVote || hasUnrecordedDayAction ? 'draft' : 'empty')
  }

  function closeDay() {
    dispatch({ type: 'clear-day-vote-draft' })
    dispatch({ type: 'close-open-segment', phaseKind: 'day', closedAt: new Date().toISOString() })
    setPendingDayClose(null)
  }

  function requestExit() {
    if (hasUnrecordedVote || hasUnrecordedDayAction) {
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
    <main className="day-workbench">
      <header className="day-workbench__header">
        <Button className="day-workbench__back" variant="ghost" compact onClick={requestExit}><ArrowLeft aria-hidden="true" /><span>返回本局</span></Button>
        <div className="day-workbench__focus">
          <div className="day-workbench__title">
            <span><SunMedium aria-hidden="true" />白天工作台</span>
            <div><h1>{openDay?.label ?? '白天工作台'}</h1>{openDay ? <StatusBadge tone="current">记录中</StatusBadge> : null}</div>
          </div>
          <DayTimer onProject={onOpenTimer} />
        </div>
      </header>

      {leavePromptOpen ? <LeaveWorkbenchNotice
        title={leaveNotice.title}
        description={leaveNotice.description}
        onStay={() => setLeavePromptOpen(false)}
        onLeave={exitAfterPrompt}
      /> : null}

      <div className="day-workbench__content">
        <section className="day-round-context" aria-label={`第${roundNumber}轮状态`}>
          <div><span>第{roundNumber}轮</span><strong>{roundStatus}</strong></div>
          <DayRecordSheet session={session} dispatch={dispatch} />
        </section>

        <NominationStep
          collapsed={activeStep !== 'nomination'} draft={draft} readOnly={dayLocked}
          playerCount={session.playerCount} playerStates={playerStates}
          target={nominationTarget} onChangeTarget={setNominationTarget}
          onSelectSeat={selectNominationSeat} onExpand={() => setStepOverride('nomination')}
        />
        {activeStep === 'vote' ? <DayVoteEditor
          key={roundNumber} draft={draft} playerCount={session.playerCount} playerStates={playerStates}
          showNomination={false} disabled={dayLocked} onChange={updateDraft}
        /> : <DayStepRow index={2} title="举手"
          summary={draft.raisedSeatIds.length ? `举手${draft.raisedSeatIds.length} · 门槛${draft.threshold}` : '未记录'}
          done={dayEntries.some((entry) => entry.segmentId === openDay?.id) && !hasUnrecordedVote}
          disabled={dayLocked || !nominationReady} onEdit={() => setStepOverride('vote')}
        />}
        <Card
          className="day-card--standing"
          eyebrow="本日票面"
          eyebrowTone="info"
          title="暂列结果"
          titleId="standing-title"
          aria-labelledby="standing-title"
          actions={<StatusBadge tone={standing.status === 'leading' || standing.status === 'replaced' ? 'warning' : 'neutral'}>{standing.status === 'leading' ? '暂列' : standing.status === 'replaced' ? '已更新' : standing.status === 'tied' ? '同票' : standing.status === 'below_threshold' ? '未达门槛' : '暂无'}</StatusBadge>}
        >
          <p className="day-standing-copy">{standing.status === 'tied' ? <><strong>{standing.tiedSeatIds?.join('、')}号同票</strong><span>尚无暂列结果</span></> : standing.nomineeSeatId ? <><strong>{standing.nomineeSeatId}号暂列</strong><span>{standing.voteCount}票 · 门槛{standing.threshold}</span></> : <><strong>暂无暂列结果</strong><span>记录票型后更新</span></>}</p>
          {openDay && !dayResolution ? <div className="day-resolution-actions">
            <Button variant="secondary" disabled={dayLocked || hasUnrecordedVote} onClick={() => setPendingResolution({ kind: 'no_execution', segmentId: openDay.id })}>记录无处决</Button>
            {(standing.status === 'leading' || standing.status === 'replaced') ? <Button variant="danger" disabled={dayLocked || hasUnrecordedVote} onClick={() => setPendingResolution({ kind: 'execution', seatId: standing.nomineeSeatId!, segmentId: openDay.id, sourceRoundId: standing.sourceRoundId!, causesDeath: playerStates[standing.nomineeSeatId!]?.life === 'alive' })}><Gavel aria-hidden="true" />记录处决{standing.nomineeSeatId}号</Button> : null}
          </div> : null}
        </Card>

        <SpecialExecution session={session} dispatch={dispatch} disabled={dayLocked} />
        <DayVoteHistory session={session} dispatch={dispatch} disabled={Boolean(pendingResolution || pendingDayClose)} />

        {pendingResolution ? <section className="day-resolution-confirm" aria-live="polite">
          <div>{pendingResolution.kind === 'execution' ? <Gavel aria-hidden="true" /> : <Check aria-hidden="true" />}<div><strong>{pendingResolution.kind === 'execution' ? `确认处决${pendingResolution.seatId}号？` : '确认无处决？'}</strong><span>{pendingResolution.kind === 'execution' ? (playerStates[pendingResolution.seatId]?.life === 'dead' ? '该玩家已死亡：只记录处决事实，占用今天的处决机会。' : pendingResolution.causesDeath ? '将追加死亡状态与日终记录；不会进入夜晚。' : '只记录处决事实，不改变存活状态（弄臣、魔鬼代言人等）。') : '将追加无处决记录；不会改变玩家状态。'}</span></div></div>
          {pendingResolution.kind === 'execution' && playerStates[pendingResolution.seatId]?.life === 'alive' ? <label className="day-execution-death"><input type="checkbox" checked={pendingResolution.causesDeath} onChange={(event) => setPendingResolution({ ...pendingResolution, causesDeath: event.target.checked })} />本次处决造成死亡</label> : null}
          <div><Button variant="ghost" onClick={() => setPendingResolution(null)}><X aria-hidden="true" />取消</Button><Button variant={pendingResolution.kind === 'execution' ? 'danger' : 'primary'} onClick={confirmResolution}>确认记录</Button></div>
        </section> : null}

        {pendingDayClose ? <section className="day-close-confirm" aria-live="polite">
          {pendingDayClose === 'draft' ? <>
            <div><strong>{leaveNotice.title}</strong><span>结束今天会清空草稿，且不会写入日记或改变玩家状态。</span></div>
            <div><Button variant="ghost" onClick={() => setPendingDayClose(null)}>继续处理</Button><Button variant="danger" onClick={closeDay}>清空并结束</Button></div>
          </> : <>
            <div><strong>确认结束今天？</strong><span>只关闭当前白天记录，不会进入夜晚。</span></div>
            <div><Button variant="ghost" onClick={() => setPendingDayClose(null)}>取消</Button><Button variant="danger" onClick={closeDay}>确认结束</Button></div>
          </>}
        </section> : null}

        {openDay ? <footer className="day-workbench__footer">
          <div><span>结束白天</span><strong>关闭当前白天记录；不会开始夜晚</strong></div>
          <Button variant="ghost" disabled={Boolean(pendingResolution || pendingDayClose)} onClick={requestDayClose}>结束今天</Button>
        </footer> : null}
      </div>
      {!dayLocked && !leavePromptOpen ? <StickyActionBar>
        <div className="day-action-bar">
          <span className="day-action-bar__hint">{activeStep === 'nomination'
            ? (nominationReady ? '提名双方已选' : '还差：选择提名双方')
            : activeStep === 'vote' ? '核对举手、死亡票及特殊票数；确认后记录本轮。'
              : '票型已记录，等待下一轮提名或确认本日结果。'}</span>
          <div className="day-action-bar__pair">
            {hasUnrecordedVote ? <Button variant="ghost" onClick={cancelRound}>取消本轮提名</Button> : null}
            {activeStep === 'nomination' ? <Button variant="primary" disabled={!nominationReady} onClick={() => setStepOverride('vote')}>下一步：记录举手</Button>
              : activeStep === 'vote' ? <Button variant="primary" disabled={!canCompleteVoteRound(draft)} onClick={completeRound}><Hand aria-hidden="true" />记录本轮票型</Button>
                : <Button variant="primary" onClick={() => { setNominationTarget('nominator'); setStepOverride('nomination') }}>开始下一轮提名</Button>}
          </div>
        </div>
      </StickyActionBar> : null}
    </main>
  )
}

