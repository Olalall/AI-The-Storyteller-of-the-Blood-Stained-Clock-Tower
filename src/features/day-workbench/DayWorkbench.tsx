import { ArrowLeft, Check, Gavel, Hand, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { completeVoteRound, executionThresholdForAliveCount, setVoteNominator, setVoteNominee, toggleGhostVote, toggleRaisedVote, type VoteRoundDraft } from './state/voteRound'
import { projectStandingExecution } from './state/voteStanding'
import { DayTimer } from './components/DayTimer'
import { DayRecordSheet } from './components/DayRecordSheet'
import { DayStepRow } from './components/DayStepRow'
import { NominationStep } from './components/NominationStep'
import { leaveNoticeCopy } from './state/dayDraft'
import { useDayRingFocus } from './state/dayRingFocus'
import { projectDayStepContext, roundStatusLabel, type DayStep } from './state/dayStep'
import { savePhaseCloseSnapshot } from '../../services/session'
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

type PendingResolution =
  | { kind: 'execution'; seatId: number; segmentId: string; sourceRoundId: string; causesDeath: boolean }
  | { kind: 'no_execution'; segmentId: string }
type PendingDayClose = 'empty' | 'draft'

export function DayWorkbench({ session, dispatch, onExit, onOpenTimer }: DayWorkbenchProps) {
  const [pendingResolution, setPendingResolution] = useState<PendingResolution | null>(null)
  const [pendingDayClose, setPendingDayClose] = useState<PendingDayClose | null>(null)
  const [leavePromptOpen, setLeavePromptOpen] = useState(false)
  // 「指着哪个槽」与「手动回退到哪一步」两样都由 dayRingFocus 托管：
  // 魔典模式下环与这张抽屉是两块屏，必须共用同一个当前指向（没有 Provider 时退回本地 state）。
  const { nominationTarget, setNominationTarget, stepOverride, setStepOverride, setWriteLocked } = useDayRingFocus()
  const { draft, openDaySegmentId, hasResolution, hasUnrecordedVote, nominationReady, suggested } =
    projectDayStepContext(session)
  const playerStates = projectCurrentPlayerStates(session)
  const aliveCount = Object.values(playerStates).filter((state) => state.life === 'alive').length
  const suggestedThreshold = executionThresholdForAliveCount(aliveCount)
  const openDay = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
  const dayEntries = useMemo(() => session.timeline.filter((entry) => entry.kind === 'vote_round'), [session.timeline])
  const standing = openDay ? projectStandingExecution(dayEntries, openDay.id) : { status: 'none' as const }
  const roundNumber = dayEntries.filter((entry) => entry.segmentId === openDaySegmentId).length + 1
  // 白天这一屏唯一的写入闸门。硬规则同夜间工作台：只读在上层算一次、作为 readOnly prop 往下压，
  // 组件不得自己判断能不能写——将来归档回看接进来也走这同一个入口。
  const dayReadOnly = Boolean(pendingResolution || pendingDayClose || hasResolution)
  const dayActionKinds = dayActionDraftContentKinds(session.dayActionDraft)
  const hasUnrecordedDayAction = dayActionKinds.length > 0
  const leaveNotice = leaveNoticeCopy(hasUnrecordedVote, dayActionKinds)
  const selectedVotes = new Set(draft.raisedSeatIds)
  const ghostVotes = new Set(draft.ghostVoteSeatIds)
  const hasRecordedRound = dayEntries.some((entry) => entry.segmentId === openDaySegmentId)
  const activeStep: DayStep = stepOverride ?? suggested
  const roundStatus = roundStatusLabel(draft)

  // 把同一个闸门广播给环。离开这张台时解锁——否则说书人从白天退出去，
  // 环会带着一把没人再解得开的锁停在那儿。
  useEffect(() => setWriteLocked(dayReadOnly), [dayReadOnly, setWriteLocked])
  useEffect(() => () => setWriteLocked(false), [setWriteLocked])

  function selectNominationSeat(seatId: number) {
    if (dayReadOnly) return
    updateDraft((current) => nominationTarget === 'nominator'
      ? setVoteNominator(current, seatId)
      : setVoteNominee(current, seatId))
  }

  function updateDraft(update: VoteRoundDraft | ((current: VoteRoundDraft) => VoteRoundDraft)) {
    const next = typeof update === 'function' ? update(draft) : update
    dispatch({ type: 'set-day-vote-draft', draft: next })
  }

  function completeRound() {
    if (dayReadOnly) return
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
    if (!currentDay || currentDay.id !== pendingResolution.segmentId || hasResolution) {
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
    // 相位关闭不可逆，且它同时清掉当天的草稿。先把关闭前的这一份留下来：
    // 本地快照必落，后端救生圈尽力推一份（推不出去不影响这里往下走）。
    savePhaseCloseSnapshot(session)
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

        <NominationStep
          collapsed={activeStep !== 'nomination'}
          draft={draft}
          readOnly={dayReadOnly}
          playerCount={session.playerCount}
          playerStates={playerStates}
          target={nominationTarget}
          onChangeTarget={setNominationTarget}
          onSelectSeat={selectNominationSeat}
          onExpand={() => setStepOverride('nomination')}
        />

        {activeStep !== 'vote' ? (
          <DayStepRow
            index={2}
            title="举手"
            summary={draft.raisedSeatIds.length ? `举手${draft.raisedSeatIds.length} · 门槛${draft.threshold}` : '未记录'}
            done={hasRecordedRound && !hasUnrecordedVote}
            disabled={dayReadOnly || !nominationReady}
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
            <input type="number" disabled={dayReadOnly} min="1" max={session.playerCount} value={draft.threshold} onChange={(event) => updateDraft((current) => ({ ...current, threshold: Number(event.target.value) || 0 }))} />
          </Field>}
        >
          <p className={nominationReady ? 'day-vote-target' : 'day-vote-target is-pending'}>{nominationReady ? `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号` : '先选择提名双方'}</p>
          <div className="day-vote-grid" aria-label="本轮举手票">
            {Array.from({ length: session.playerCount }, (_value, index) => {
              const seatId = index + 1
              const dead = playerStates[seatId]?.life === 'dead'
              return <div className="day-vote-seat" key={seatId}>
                <SeatButton seat={seatId} disabled={dayReadOnly} selected={selectedVotes.has(seatId)} dead={dead} onClick={() => updateDraft((current) => toggleRaisedVote(current, seatId))} aria-label={`${selectedVotes.has(seatId) ? '取消' : '记录'}${seatId}号举手`} />
                {dead && selectedVotes.has(seatId) ? <button type="button" disabled={dayReadOnly} className={ghostVotes.has(seatId) ? 'day-ghost-vote is-active' : 'day-ghost-vote'} onClick={() => updateDraft((current) => toggleGhostVote(current, seatId))}>{ghostVotes.has(seatId) ? '死亡票' : '标死亡票'}</button> : null}
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

        {!pendingResolution && !pendingDayClose && !hasResolution ? (
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
                <Button variant="primary" onClick={completeRound} disabled={dayReadOnly || !nominationReady || draft.threshold < 1}>
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
