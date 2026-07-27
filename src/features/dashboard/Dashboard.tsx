import { Archive, Bot, ChevronRight, Flag, IdCard, MoonStar, Repeat2, SunMedium, Timer } from 'lucide-react'
import type { Dispatch } from 'react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { scriptDisplayName } from '../../domain/scripts'
import { OpeningScriptSheet } from '../host-tools/OpeningScriptSheet'
import { AISettingsSheet } from '../ai-settings/AISettingsSheet'
import { projectConfirmedSetup, projectOpenSegmentLabels, projectStorytellerSeatSummaries } from '../game-session/state/projectors'
import { projectEffectiveTimelineEntries } from '../game-session/state/projectTimelineHistory'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import type { GameSessionState, PhaseKind, PhaseSegment, TimelineEntry } from '../game-session/types'
import { PlayerStatusBoard } from './components/PlayerStatusBoard'
import { TimelineHistorySheet } from '../history/TimelineHistorySheet'
import './dashboard.css'

interface DashboardProps {
  session: GameSessionState
  dispatch: Dispatch<GameSessionAction>
  onEnterNight: () => void
  onEnterDay: () => void
  onOpenTimer: () => void
  onOpenSetup: () => void
  onOpenIdentityDeal: () => void
  onOpenGameEnd: (mode?: 'end' | 'review') => void
  onOpenScriptLibrary: () => void
  onOpenPlayerStatus: (seatId: number) => void
}

function entrySummary(entry: TimelineEntry) {
  switch (entry.kind) {
    case 'night_action': return entry.summary
    case 'day_action': return entry.summary
    case 'vote_round': return `${entry.nominatorSeatId}号提名${entry.nomineeSeatId}号 · ${entry.raisedSeatIds.length}票`
    case 'execution': return `确认处决${entry.executedSeatId}号`
    case 'no_execution': return '确认无处决'
    case 'player_state_changed': return `${entry.seatId}号状态已更新`
    case 'setup_confirmed': return '配板已确认'
    case 'setup_changed': return `${entry.seatId}号角色已调整`
  }
}

function continuationLabel(
  openSegments: ReturnType<typeof projectOpenSegmentLabels>,
  kind: 'night' | 'day',
) {
  const segment = openSegments.find((item) => item.kind === kind)
  return segment ? `继续记录 · ${segment.label}` : '首次确认后建立记录'
}

type PhaseTimelineStep = {
  key: string
  label: string
  meta: string
  kind: PhaseKind | 'setup'
  state: 'done' | 'current' | 'next' | 'open'
}

function nextPhaseStep(segment: PhaseSegment): PhaseTimelineStep {
  const kind = segment.kind === 'night' ? 'day' : 'night'
  const sequence = segment.kind === 'night' ? segment.sequence : segment.sequence + 1
  return {
    key: `next-${kind}-${sequence}`,
    kind,
    label: kind === 'night' ? `第${sequence}夜` : `第${sequence}天`,
    meta: '下一步',
    state: 'next',
  }
}

function dashboardPhaseTimeline(session: GameSessionState) {
  const ordered = [...session.phaseSegments].sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
  const open = ordered.filter((segment) => !segment.closedAt).at(-1)
  const current = open ?? ordered.at(-1)
  const hasConfirmedSetup = Boolean(projectConfirmedSetup(session))

  if (!current) {
    const steps: PhaseTimelineStep[] = hasConfirmedSetup
      ? [
        { key: 'setup', kind: 'setup', label: '配板', meta: '已确认', state: 'done' },
        { key: 'next-night-1', kind: 'night', label: '第1夜', meta: '下一步', state: 'next' },
        { key: 'after-day-1', kind: 'day', label: '第1天', meta: '之后', state: 'next' },
      ]
      : [
        { key: 'setup', kind: 'setup', label: '待配板', meta: '未开始', state: 'current' },
        { key: 'next-night-1', kind: 'night', label: '第1夜', meta: '下一步', state: 'next' },
        { key: 'after-day-1', kind: 'day', label: '第1天', meta: '之后', state: 'next' },
      ]
    return { summary: hasConfirmedSetup ? '开局前，下一步第1夜' : '新局未开始，先配板和录入玩家', steps }
  }

  const previous = ordered.filter((segment) => segment.id !== current.id).at(-1)
  const currentIsOpen = !current.closedAt
  const next = nextPhaseStep(current)
  const steps: PhaseTimelineStep[] = [
    previous
      ? {
        key: previous.id,
        kind: previous.kind,
        label: previous.label,
        meta: previous.closedAt ? '已结束' : '可补记',
        state: previous.closedAt ? 'done' : 'open',
      }
      : { key: 'setup', kind: 'setup', label: '配板', meta: '已确认', state: 'done' },
    {
      key: current.id,
      kind: current.kind,
      label: current.label,
      meta: currentIsOpen ? '记录中' : '已结束',
      state: currentIsOpen ? 'current' : 'done',
    },
    next,
  ]

  return {
    summary: currentIsOpen ? `${current.label}，记录中` : `${current.label}已结束，下一步${next.label}`,
    steps,
  }
}

export function Dashboard({ session, dispatch, onEnterNight, onEnterDay, onOpenTimer, onOpenSetup, onOpenIdentityDeal, onOpenGameEnd, onOpenScriptLibrary, onOpenPlayerStatus }: DashboardProps) {
  const scriptName = scriptDisplayName(session.scriptId)
  const storytellerSeats = projectStorytellerSeatSummaries(session)
  const openSegments = projectOpenSegmentLabels(session)
  const phaseTimeline = dashboardPhaseTimeline(session)
  const recentEntries = [...projectEffectiveTimelineEntries(session.timeline)]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))
    .slice(0, 3)
  const currentStage = phaseTimeline.steps.find((step) => step.state === 'current' || step.state === 'open')
    ?? phaseTimeline.steps.find((step) => step.state === 'next')
    ?? phaseTimeline.steps[1]
    ?? phaseTimeline.steps[0]
  const currentStageMode = currentStage.kind === 'night' ? '夜间处理' : currentStage.kind === 'day' ? '白天处理' : '开局准备'

  return (
    <main className="dashboard" aria-label="本局">
      <header className="dashboard__header">
        <div>
          <span className="dashboard__eyebrow">本局</span>
          <h1>{scriptName}</h1>
          <section className="dashboard__stage-overview" aria-label={`当前阶段：${phaseTimeline.summary}`}>
            <div className={`dashboard__stage-current is-${currentStage.kind}`}>
              <div className="dashboard__stage-current-main">
                <span>当前阶段</span>
                <strong>{currentStage.label}</strong>
                <em>{currentStage.meta}</em>
              </div>
              <div className="dashboard__stage-current-info" aria-label="当前阶段信息">
                <span>{scriptName}</span>
                <span>{storytellerSeats.length} / {currentStageMode}</span>
              </div>
              <div className="dashboard__stage-current-decoration" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
          </section>
        </div>
        <AISettingsSheet />
      </header>

      <section className="dashboard__host-tools" aria-label="常用主持工具">
        <OpeningScriptSheet sessionId={session.id} />
        <Button variant="secondary" className="dashboard__setup-entry" aria-label="AI配板与调整" onClick={onOpenSetup}>
          <Bot aria-hidden="true" />
          <span>AI配板</span>
        </Button>
        <Button variant="secondary" className="dashboard__identity-entry" onClick={onOpenIdentityDeal}>
          <IdCard aria-hidden="true" />
          <span>发身份</span>
        </Button>
        <Button variant="secondary" className="dashboard__timer-entry" onClick={onOpenTimer}>
          <Timer aria-hidden="true" />
          <span>公聊倒计时</span>
        </Button>
        <Button variant="secondary" className="dashboard__script-switch" onClick={onOpenScriptLibrary}>
          <Repeat2 aria-hidden="true" />
          <span>切换板子</span>
        </Button>
      </section>

      <section className="dashboard__phase-launch" aria-label="工作台入口">
        <button type="button" className="dashboard__phase-button" onClick={onEnterNight}>
          <span className="dashboard__phase-icon"><MoonStar aria-hidden="true" /></span>
          <span><strong>进入夜晚</strong><small>{continuationLabel(openSegments, 'night')}</small></span>
          <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className="dashboard__phase-button" onClick={onEnterDay}>
          <span className="dashboard__phase-icon dashboard__phase-icon--day"><SunMedium aria-hidden="true" /></span>
          <span><strong>进入白天</strong><small>{continuationLabel(openSegments, 'day')}</small></span>
          <ChevronRight aria-hidden="true" />
        </button>
      </section>

      <PlayerStatusBoard seats={storytellerSeats} onSelectSeat={onOpenPlayerStatus} />

      <div className="dashboard__grid">
        <section className="dashboard-card dashboard-card--recent" aria-labelledby="recent-title">
          <div className="dashboard-card__header">
            <div><span>记录</span><h2 id="recent-title">最近记录</h2></div>
            <TimelineHistorySheet
              session={session}
              dispatch={dispatch}
              onOpenPlayerStatus={onOpenPlayerStatus}
              onOpenDayWorkbench={onEnterDay}
              onOpenSetup={onOpenSetup}
            />
          </div>
          {recentEntries.length ? (
            <ul className="dashboard__recent-list">
              {recentEntries.map((entry) => {
                const segment = entry.segmentId ? session.phaseSegments.find((item) => item.id === entry.segmentId) : undefined
                return <li key={entry.id}><span>{segment?.label ?? (entry.kind.startsWith('setup_') ? '配板' : '本局')}</span><strong>{entrySummary(entry)}</strong></li>
              })}
            </ul>
          ) : <p>尚无确认记录。</p>}
        </section>

        <section className="dashboard-card dashboard-card--end" aria-labelledby="game-end-title">
          <div className="dashboard-card__header">
            <div><span>收尾</span><h2 id="game-end-title">结束对局</h2></div>
            <StatusBadge tone="warning">危险动作</StatusBadge>
          </div>
          <p>保存本局后才能重置游戏；历史复盘会保留归档。</p>
          <div className="dashboard__end-actions">
            <Button variant="secondary" className="dashboard__end-entry" onClick={() => onOpenGameEnd('end')}>
              <Flag aria-hidden="true" />
              <span>结束对局</span>
            </Button>
            <Button variant="ghost" className="dashboard__review-entry" onClick={() => onOpenGameEnd('review')}>
              <Archive aria-hidden="true" />
              <span>历史复盘</span>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
