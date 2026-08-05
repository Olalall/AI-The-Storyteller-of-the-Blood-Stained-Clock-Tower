import { ArrowLeft, Archive, Bot, ChevronRight, Flag, IdCard, MoonStar, Repeat2, SunMedium, Timer } from 'lucide-react'
import type { Dispatch } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { scriptDisplayName } from '../../domain/scripts'
import { assertNever } from '../../shared/assertNever'
import { OpeningScriptSheet } from '../host-tools/OpeningScriptSheet'
import { AISettingsSheet } from '../ai-settings/AISettingsSheet'
import { projectOpenSegmentLabels, projectStorytellerSeatSummaries } from '../game-session/state/projectors'
import { projectEffectiveTimelineEntries } from '../game-session/state/projectTimelineHistory'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import type { GameSessionState, TimelineEntry } from '../game-session/types'
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
  /** 档案是覆盖层：关闭后回到主持台原节点。 */
  onExitArchive?: () => void
}

function entrySummary(entry: TimelineEntry): string {
  switch (entry.kind) {
    case 'night_action': return entry.summary
    case 'day_action': return entry.summary
    case 'vote_round': return `${entry.nominatorSeatId}号提名${entry.nomineeSeatId}号 · ${entry.raisedSeatIds.length}票`
    case 'execution': return `确认处决${entry.executedSeatId}号`
    case 'no_execution': return '确认无处决'
    case 'player_state_changed': return `${entry.seatId}号状态已更新`
    case 'setup_confirmed': return '配板已确认'
    case 'setup_changed': return `${entry.seatId}号角色已调整`
    default:
      // 未知 kind 渲染为空，与穷尽检查加入前（返回 undefined）在界面上等价。
      assertNever(entry)
      return ''
  }
}

function continuationLabel(
  openSegments: ReturnType<typeof projectOpenSegmentLabels>,
  kind: 'night' | 'day',
) {
  const segment = openSegments.find((item) => item.kind === kind)
  return segment ? `继续记录 · ${segment.label}` : '首次确认后建立记录'
}

export function Dashboard({ session, dispatch, onEnterNight, onEnterDay, onOpenTimer, onOpenSetup, onOpenIdentityDeal, onOpenGameEnd, onOpenScriptLibrary, onOpenPlayerStatus, onExitArchive}: DashboardProps) {
  const scriptName = scriptDisplayName(session.scriptId)
  const storytellerSeats = projectStorytellerSeatSummaries(session)
  const openSegments = projectOpenSegmentLabels(session)
  const recentEntries = [...projectEffectiveTimelineEntries(session.timeline)]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id))
    .slice(0, 3)

  return (
    <main className="dashboard" aria-label="本局">
      {/* 单行页头：当前阶段与下一步由常驻阶段轨道承载，这里只留本局的稳定身份。 */}
      <header className="dashboard__header">
        {onExitArchive ? (
          <Button variant="ghost" compact onClick={onExitArchive}><ArrowLeft aria-hidden="true" />回到主持台</Button>
        ) : null}
        <h1>{scriptName}</h1>
        <span className="dashboard__session-meta">· {session.playerCount}人</span>
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
        <Card
          surface="soft"
          className="dashboard-card dashboard-card--recent"
          eyebrow="记录"
          title="最近记录"
          titleId="recent-title"
          aria-labelledby="recent-title"
          actions={<TimelineHistorySheet
            session={session}
            dispatch={dispatch}
            onOpenPlayerStatus={onOpenPlayerStatus}
            onOpenDayWorkbench={onEnterDay}
            onOpenSetup={onOpenSetup}
          />}
        >
          {recentEntries.length ? (
            <ul className="dashboard__recent-list">
              {recentEntries.map((entry) => {
                const segment = entry.segmentId ? session.phaseSegments.find((item) => item.id === entry.segmentId) : undefined
                return <li key={entry.id}><span>{segment?.label ?? (entry.kind.startsWith('setup_') ? '配板' : '本局')}</span><strong>{entrySummary(entry)}</strong></li>
              })}
            </ul>
          ) : <EmptyState compact title="尚无确认记录" description="夜间或白天确认第一条记录后，这里显示最近三条。" />}
        </Card>

        <Card
          surface="soft"
          className="dashboard-card dashboard-card--end"
          eyebrow="收尾"
          title="结束对局"
          titleId="game-end-title"
          aria-labelledby="game-end-title"
          actions={<StatusBadge tone="warning">危险动作</StatusBadge>}
        >
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
        </Card>
      </div>
    </main>
  )
}
