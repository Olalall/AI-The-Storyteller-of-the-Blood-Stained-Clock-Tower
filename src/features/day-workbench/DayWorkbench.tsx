import { ArrowLeft, Check, Gavel, Hand, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { SeatButton } from '../../components/ui/SeatButton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { scriptDisplayName } from '../../domain/scripts'
import { projectCurrentPlayerStates } from '../game-session/state/projectors'
import { dayActionDraftContentKinds } from '../game-session/state/dayActionDraft'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import type { GameSessionState } from '../game-session/types'
import { completeVoteRound, createVoteRoundDraft, executionThresholdForAliveCount, hasVoteRoundDraftContent, setVoteNominator, setVoteNominee, toggleGhostVote, toggleRaisedVote, type VoteRoundDraft } from './state/voteRound'
import { projectStandingExecution } from './state/voteStanding'
import { DayTimer } from './components/DayTimer'
import { DayRecordSheet } from './components/DayRecordSheet'
import { DayStepRow } from './components/DayStepRow'
import { StickyActionBar } from '../../components/ui/StickyActionBar'
import { LeaveWorkbenchNotice } from '../game-session/components/LeaveWorkbenchNotice'
import './day-workbench.css'

interface DayWorkbenchProps {
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
  onExit: () => void
  /** 打开投屏倒计时遮蔽层；它不再是顶层视图，收起后回到原位。 */
  onOpenTimer?: () => void
}

type NominationTarget = 'nominator' | 'nominee'
type PendingResolution =
  | { kind: 'execution'; seatId: number; segmentId: string; sourceRoundId: string; causesDeath: boolean }
  | { kind: 'no_execution'; segmentId: string }
type PendingDayClose = 'empty' | 'draft'
/** 白天是一个时序：讨论 → 提名 → 举手 → 暂列 → 处决。同一时刻只展开一步。 */
type DayStep = 'discussion' | 'nomination' | 'vote' | 'standing'

function openDaySegmentId(session: GameSessionState) {
  return session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)?.id ?? 'day-pending'
}

function aliveSeatCount(session: GameSessionState) {
  return Object.values(projectCurrentPlayerStates(session)).filter((state) => state.life === 'alive').length
}

function newDraft(session: GameSessionState, threshold = executionThresholdForAliveCount(aliveSeatCount(session))) {
  return createVoteRoundDraft(openDaySegmentId(session), threshold)
}

function voteDraftForSession(session: GameSessionState) {
  const openDayId = openDaySegmentId(session)
  const stored = session.dayVoteDraft
  if (stored && (stored.segmentId === 'day-pending' || stored.segmentId === openDayId)) return stored
  return newDraft(session)
}

function leaveNoticeCopy(hasVoteDraft: boolean, dayActionKinds: readonly ('skill' | 'public_event')[]) {
  const actionLabel = dayActionKinds.length === 2
    ? '技能和公开事件'
    : dayActionKinds[0] === 'public_event'
      ? '公开事件'
      : '技能记录'
  if (hasVoteDraft && dayActionKinds.length) {
    return {
      title: `本轮票型与${actionLabel}已暂存`,
      description: '返回后可从本局重新进入白天，继续编辑或确认未完成记录。',
    }
  }
  if (hasVoteDraft) {
    return {
      title: '本轮票型已暂存',
      description: '返回后可从本局重新进入白天，继续记录本轮投票。',
    }
  }
  return {
    title: `${actionLabel}已暂存`,
    description: '返回后可从本局重新进入白天，继续编辑后再确认记录。',
  }
}

export function DayWorkbench({ session, dispatch, onExit, onOpenTimer }: DayWorkbenchProps) {
  const [nominationTarget, setNominationTarget] = useState<NominationTarget>('nominator')
  const [pendingResolution, setPendingResolution] = useState<PendingResolution | null>(null)
  const [pendingDayClose, setPendingDayClose] = useState<PendingDayClose | null>(null)
  const [leavePromptOpen, setLeavePromptOpen] = useState(false)
  // 只记录「说书人手动回退到哪一步」；为空时按进度推导。切换步骤不动任何已填内容。
  const [stepOverride, setStepOverride] = useState<DayStep | null>(null)
  const draft = voteDraftForSession(session)
  const playerStates = projectCurrentPlayerStates(session)
  const aliveCount = Object.values(playerStates).filter((state) => state.life === 'alive').length
  const suggestedThreshold = executionThresholdForAliveCount(aliveCount)
  const openDay = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
  const dayEntries = useMemo(() => session.timeline.filter((entry) => entry.kind === 'vote_round'), [session.timeline])
  const standing = openDay ? projectStandingExecution(dayEntries, openDay.id) : { status: 'none' as const }
  const roundNumber = dayEntries.filter((entry) => entry.segmentId === openDay?.id).length + 1
  const dayResolution = openDay
    ? [...session.timeline].filter((entry) => entry.segmentId === openDay.id && (entry.kind === 'execution' || entry.kind === 'no_execution')).at(-1)
    : undefined
  const dayLocked = Boolean(pendingResolution || pendingDayClose || dayResolution)
  const hasUnrecordedVote = hasVoteRoundDraftContent(draft)
  const dayActionKinds = dayActionDraftContentKinds(session.dayActionDraft)
  const hasUnrecordedDayAction = dayActionKinds.length > 0
  const leaveNotice = leaveNoticeCopy(hasUnrecordedVote, dayActionKinds)
  const selectedVotes = new Set(draft.raisedSeatIds)
  const ghostVotes = new Set(draft.ghostVoteSeatIds)
  const nominationReady = draft.nominatorSeatId !== null && draft.nomineeSeatId !== null
  const hasRecordedRound = dayEntries.some((entry) => entry.segmentId === openDay?.id)
  const hasVoteMarks = draft.raisedSeatIds.length > 0 || draft.ghostVoteSeatIds.length > 0
  /**
   * 步骤不自动跨越：选完提名双方后停在提名步，由底栏的「下一步」显式推进。
   * 自动前进会让卡片在手指底下收起来，说书人来不及确认自己刚点了谁。
   */
  const suggestedStep: DayStep = hasRecordedRound && !hasUnrecordedVote
    ? 'standing'
    : !nominationReady
      ? 'nomination'
      : hasVoteMarks
        ? 'vote'
        : 'nomination'
  const activeStep: DayStep = stepOverride ?? suggestedStep
  const roundStatus = draft.nominatorSeatId === null
    ? '待选提名人'
    : draft.nomineeSeatId === null
      ? '待选被提名人'
      : `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号`

  function selectNominationSeat(seatId: number) {
    if (dayLocked) return
    updateDraft((current) => nominationTarget === 'nominator'
      ? setVoteNominator(current, seatId)
      : setVoteNominee(current, seatId))
  }

  function updateDraft(update: VoteRoundDraft | ((current: VoteRoundDraft) => VoteRoundDraft)) {
    const next = typeof update === 'function' ? update(draft) : update
    dispatch({ type: 'set-day-vote-draft', draft: next })
  }

  function completeRound() {
    if (dayLocked) return
    const entry = completeVoteRound(draft, {
      id: `vote-round-${Date.now()}`,
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
        {/*
          「第N天」与「记录中」都由常驻阶段轨道承载，页头只留不随相位变化的稳定信息。
          h1 视觉上收起但保留在无障碍树里：页面仍需要一个可被屏读定位的标题。
        */}
        <h1 className="ui-visually-hidden">{openDay?.label ?? '白天工作台'}</h1>
        <span className="day-workbench__session">{scriptDisplayName(session.scriptId)} · {session.playerCount}人</span>
        <Button className="day-workbench__back" variant="ghost" compact onClick={requestExit}><ArrowLeft aria-hidden="true" /><span>返回本局</span></Button>
      </header>

      {leavePromptOpen ? <LeaveWorkbenchNotice
        title={leaveNotice.title}
        description={leaveNotice.description}
        onStay={() => setLeavePromptOpen(false)}
        onLeave={exitAfterPrompt}
      /> : null}

      <div className="day-workbench__content">
        <DayTimer onProject={onOpenTimer} />

        <section className="day-round-context" aria-label={`第${roundNumber}轮状态`}>
          <div><span>第{roundNumber}轮</span><strong>{roundStatus}</strong></div>
          <DayRecordSheet session={session} dispatch={dispatch} />
        </section>

        {activeStep !== 'nomination' ? (
          <DayStepRow
            index={1}
            title="提名"
            summary={nominationReady ? `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号` : '未选'}
            done={nominationReady}
            disabled={dayLocked}
            onEdit={() => setStepOverride('nomination')}
          />
        ) : (
        <Card className="day-card--nomination" eyebrow="步骤 1" eyebrowTone="info" title="选择提名" titleId="nomination-title" aria-labelledby="nomination-title">
          <div className="day-selection-tabs" role="tablist" aria-label="选择提名对象">
            <button type="button" disabled={dayLocked} role="tab" aria-selected={nominationTarget === 'nominator'} className={nominationTarget === 'nominator' ? 'is-active' : ''} onClick={() => setNominationTarget('nominator')}>提名人 · {draft.nominatorSeatId ? `${draft.nominatorSeatId}号` : '未选'}</button>
            <button type="button" disabled={dayLocked} role="tab" aria-selected={nominationTarget === 'nominee'} className={nominationTarget === 'nominee' ? 'is-active' : ''} onClick={() => setNominationTarget('nominee')}>被提名人 · {draft.nomineeSeatId ? `${draft.nomineeSeatId}号` : '未选'}</button>
          </div>
          <div className="day-seat-grid" aria-label="提名座位">
            {Array.from({ length: session.playerCount }, (_value, index) => {
              const seatId = index + 1
              return <SeatButton key={seatId} seat={seatId} disabled={dayLocked} selected={seatId === (nominationTarget === 'nominator' ? draft.nominatorSeatId : draft.nomineeSeatId)} dead={playerStates[seatId]?.life === 'dead'} onClick={() => selectNominationSeat(seatId)} aria-label={`选择${seatId}号为${nominationTarget === 'nominator' ? '提名人' : '被提名人'}`} />
            })}
          </div>
        </Card>
        )}

        {activeStep !== 'vote' ? (
          <DayStepRow
            index={2}
            title="举手"
            summary={draft.raisedSeatIds.length ? `举手${draft.raisedSeatIds.length} · 门槛${draft.threshold}` : '未记录'}
            done={hasRecordedRound && !hasUnrecordedVote}
            disabled={dayLocked || !nominationReady}
            onEdit={() => setStepOverride('vote')}
          />
        ) : (
        <Card
          className="day-card--vote"
          eyebrow="步骤 2"
          eyebrowTone="info"
          title="记录举手"
          titleId="vote-title"
          aria-labelledby="vote-title"
          actions={<Field
            className="day-threshold"
            label="处决门槛"
            hint={`存活${aliveCount}人 · 建议${suggestedThreshold}`}
            title={`存活 ${aliveCount} 人，建议门槛 ${suggestedThreshold}（存活人数的一半，向上取整）`}
          >
            <input type="number" disabled={dayLocked} min="1" max={session.playerCount} value={draft.threshold} onChange={(event) => updateDraft((current) => ({ ...current, threshold: Number(event.target.value) || 0 }))} />
          </Field>}
        >
          <p className={nominationReady ? 'day-vote-target' : 'day-vote-target is-pending'}>{nominationReady ? `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号` : '先选择提名双方'}</p>
          <div className="day-vote-grid" aria-label="本轮举手票">
            {Array.from({ length: session.playerCount }, (_value, index) => {
              const seatId = index + 1
              const dead = playerStates[seatId]?.life === 'dead'
              return <div className="day-vote-seat" key={seatId}>
                <SeatButton seat={seatId} disabled={dayLocked} selected={selectedVotes.has(seatId)} dead={dead} onClick={() => updateDraft((current) => toggleRaisedVote(current, seatId))} aria-label={`${selectedVotes.has(seatId) ? '取消' : '记录'}${seatId}号举手`} />
                {dead && selectedVotes.has(seatId) ? <button type="button" disabled={dayLocked} className={ghostVotes.has(seatId) ? 'day-ghost-vote is-active' : 'day-ghost-vote'} onClick={() => updateDraft((current) => toggleGhostVote(current, seatId))}>{ghostVotes.has(seatId) ? '死亡票' : '标死亡票'}</button> : null}
              </div>
            })}
          </div>
          <div className="day-vote-summary" aria-label={`举手${draft.raisedSeatIds.length}票，死亡票${draft.ghostVoteSeatIds.length}张，处决门槛${draft.threshold || '未设置'}`}><span>举手<strong>{draft.raisedSeatIds.length}</strong></span><span>死亡票<strong>{draft.ghostVoteSeatIds.length}</strong></span><span>门槛<strong>{draft.threshold || '—'}</strong></span></div>
        </Card>
        )}

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
        </Card>

        {!pendingResolution && !pendingDayClose && !dayResolution ? (
          <StickyActionBar>
            <div className="day-action-bar">
              <span className="day-action-bar__hint">
                {activeStep === 'nomination'
                  ? (nominationReady ? '提名双方已选' : '还差：选择提名双方')
                  : activeStep === 'vote'
                    ? (draft.threshold < 1 ? '还差：设置处决门槛' : `举手${draft.raisedSeatIds.length} · 门槛${draft.threshold}`)
                    : standing.nomineeSeatId
                      ? `${standing.nomineeSeatId}号暂列 · ${standing.voteCount}票`
                      : '本日尚无暂列结果'}
              </span>
              {activeStep === 'nomination' ? (
                <Button variant="primary" disabled={!nominationReady} onClick={() => setStepOverride('vote')}>
                  下一步：记录举手
                </Button>
              ) : activeStep === 'vote' ? (
                <Button variant="primary" onClick={completeRound} disabled={dayLocked || !nominationReady || draft.threshold < 1}>
                  <Hand aria-hidden="true" />记录本轮票型
                </Button>
              ) : (
                <div className="day-action-bar__pair">
                  <Button variant="secondary" disabled={Boolean(hasUnrecordedVote) || !openDay} onClick={() => openDay && setPendingResolution({ kind: 'no_execution', segmentId: openDay.id })}>记录无处决</Button>
                  {openDay && (standing.status === 'leading' || standing.status === 'replaced') ? (
                    <Button variant="danger" disabled={Boolean(hasUnrecordedVote)} onClick={() => setPendingResolution({ kind: 'execution', seatId: standing.nomineeSeatId!, segmentId: openDay.id, sourceRoundId: standing.sourceRoundId!, causesDeath: playerStates[standing.nomineeSeatId!]?.life === 'alive' })}>
                      <Gavel aria-hidden="true" />记录处决{standing.nomineeSeatId}号
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </StickyActionBar>
        ) : null}

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
    </main>
  )
}
