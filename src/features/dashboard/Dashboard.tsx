import {
  Bot,
  ChevronRight,
  IdCard,
  MoonStar,
  Repeat2,
  SlidersHorizontal,
  SunMedium,
  Timer,
} from 'lucide-react'
import type { Dispatch } from 'react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { scriptDisplayName } from '../../domain/scripts'
import { loadIdentityDealReceipts } from '../../services/identity-deal'
import { AISettingsSheet } from '../ai-settings/AISettingsSheet'
import { projectOpenSegmentLabels, projectStorytellerSeatSummaries } from '../game-session/state/projectors'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import type { GameSessionState } from '../game-session/types'
import { HostingModeSection } from '../grimoire/stage/HostingModeSection'
import { nextDayLabel, nextNightLabel, type DeckNode } from '../hosting-deck/deckNode'
import { OpeningScriptSheet } from '../host-tools/OpeningScriptSheet'
import { PlayerStatusBoard } from './components/PlayerStatusBoard'
import './dashboard.css'

interface DashboardProps {
  session: GameSessionState
  dispatch: Dispatch<GameSessionAction>
  activeNode: DeckNode
  onEnterNight: () => void
  onEnterDay: () => void
  onOpenTimer: () => void
  onOpenSetup: () => void
  onOpenIdentityDeal: () => void
  onOpenScriptLibrary: () => void
  onOpenPlayerStatus: (seatId: number) => void
  onImportSession: (session: GameSessionState) => void
  onExitArchive: () => void
}

const modeNames = {
  record: '实体魔典',
  grimoire: '电子魔典',
} as const

function phaseTask(
  activeNode: DeckNode,
  session: GameSessionState,
  openSegments: ReturnType<typeof projectOpenSegmentLabels>,
) {
  const openNight = openSegments.find((segment) => segment.kind === 'night')
  const openDay = openSegments.find((segment) => segment.kind === 'day')

  if (activeNode === 'night') return {
    label: openNight?.label ?? nextNightLabel(session),
    title: `继续${openNight?.label ?? '夜晚'}`,
    description: '按夜序处理当前角色，结果仍由说书人逐项确认。',
    icon: MoonStar,
    kind: 'night' as const,
  }
  if (activeNode === 'day') return {
    label: openDay?.label ?? nextDayLabel(session),
    title: `继续${openDay?.label ?? '白天'}`,
    description: '继续记录提名、票型、公开事件与日终结论。',
    icon: SunMedium,
    kind: 'day' as const,
  }
  if (activeNode === 'dawn') return {
    label: '黎明交接',
    title: '完成黎明播报',
    description: '核对本夜生死变化，宣布睁眼后再进入白天。',
    icon: SunMedium,
    kind: 'return' as const,
  }
  return {
    label: '黄昏准备',
    title: `准备${nextNightLabel(session)}`,
    description: '核对上一白天结论和夜间准备项，再开始下一夜。',
    icon: MoonStar,
    kind: 'return' as const,
  }
}

export function Dashboard({
  session,
  dispatch,
  activeNode,
  onEnterNight,
  onEnterDay,
  onOpenTimer,
  onOpenSetup,
  onOpenIdentityDeal,
  onOpenScriptLibrary,
  onOpenPlayerStatus,
  onImportSession,
  onExitArchive,
}: DashboardProps) {
  const fullScriptName = scriptDisplayName(session.scriptId)
  const scriptNameSeparator = fullScriptName.indexOf(' / ')
  const primaryScriptName = scriptNameSeparator >= 0 ? fullScriptName.slice(0, scriptNameSeparator) : fullScriptName
  const secondaryScriptName = scriptNameSeparator >= 0 ? fullScriptName.slice(scriptNameSeparator) : ''
  const storytellerSeats = projectStorytellerSeatSummaries(session)
  const openSegments = projectOpenSegmentLabels(session)
  const task = phaseTask(activeNode, session, openSegments)
  const receipts = loadIdentityDealReceipts(session.id)
  const receivedCount = storytellerSeats.filter((seat) => receipts[seat.seatId]).length
  const identityPending = session.phaseSegments.length === 0 && receivedCount < storytellerSeats.length
  const TaskIcon = identityPending ? IdCard : task.icon

  function continueCurrentTask() {
    if (identityPending) {
      onOpenIdentityDeal()
      return
    }
    if (task.kind === 'night') onEnterNight()
    else if (task.kind === 'day') onEnterDay()
    else onExitArchive()
  }

  return (
    <main className="dashboard" aria-label="本局">
      <header className="dashboard__header">
        <h1 aria-label={fullScriptName} title={fullScriptName}>
          <span>{primaryScriptName}</span>
          {secondaryScriptName ? <span className="dashboard__script-alt">{secondaryScriptName}</span> : null}
        </h1>
        <span className="dashboard__session-meta">· {session.playerCount}人</span>
        <StatusBadge tone="neutral">{modeNames[session.hostingMode ?? 'record']}</StatusBadge>
        <AISettingsSheet session={session} onImportSession={onImportSession} />
      </header>

      <section className="dashboard__focus" aria-labelledby="dashboard-focus-title">
        <div className={`dashboard__focus-icon${identityPending ? ' dashboard__focus-icon--identity' : task.kind === 'day' ? ' dashboard__focus-icon--day' : ''}`}>
          <TaskIcon aria-hidden="true" />
        </div>
        <div className="dashboard__focus-copy">
          <span>{identityPending ? '开局准备' : task.label}</span>
          <h2 id="dashboard-focus-title">{identityPending ? `身份领取 ${receivedCount}/${storytellerSeats.length}` : task.title}</h2>
          <p>{identityPending
            ? '先让玩家领取身份；使用实体身份牌时也可以手动标记领取，工具不会强制拦截开夜。'
            : task.description}</p>
        </div>
        <div className="dashboard__focus-actions">
          <Button variant="primary" onClick={continueCurrentTask}>
            {identityPending ? '去发身份' : task.title}<ChevronRight aria-hidden="true" />
          </Button>
          {identityPending ? <Button variant="ghost" onClick={onExitArchive}>已用实体牌 · 返回首夜准备</Button> : null}
        </div>
      </section>

      <PlayerStatusBoard seats={storytellerSeats} onSelectSeat={onOpenPlayerStatus} />

      <details className="dashboard__more-tools">
        <summary><SlidersHorizontal aria-hidden="true" /><span><strong>更多主持工具</strong><small>配板、身份、计时、板子与主持方式</small></span><ChevronRight aria-hidden="true" /></summary>
        <div className="dashboard__more-body">
          <section aria-labelledby="dashboard-tools-title">
            <h3 id="dashboard-tools-title">主持工具</h3>
            <div className="dashboard__tool-grid">
              <OpeningScriptSheet sessionId={session.id} />
              <Button variant="secondary" aria-label="AI配板与调整" onClick={onOpenSetup}><Bot aria-hidden="true" />AI配板</Button>
              {!identityPending ? <Button variant="secondary" onClick={onOpenIdentityDeal}><IdCard aria-hidden="true" />发身份</Button> : null}
              <Button variant="secondary" onClick={onOpenTimer}><Timer aria-hidden="true" />公聊倒计时</Button>
              <Button variant="secondary" onClick={onOpenScriptLibrary}><Repeat2 aria-hidden="true" />切换板子</Button>
            </div>
          </section>

          <section aria-labelledby="dashboard-phase-switch-title">
            <h3 id="dashboard-phase-switch-title">手动切换工作台</h3>
            <p>只在需要补记或跳转时使用；进入工作台仍由你明确确认。</p>
            <div className="dashboard__manual-phase">
              <Button variant="ghost" onClick={onEnterNight}><MoonStar aria-hidden="true" />进入夜晚</Button>
              <Button variant="ghost" onClick={onEnterDay}><SunMedium aria-hidden="true" />进入白天</Button>
            </div>
          </section>

          <section aria-labelledby="dashboard-hosting-mode-title">
            <h3 id="dashboard-hosting-mode-title">主持方式</h3>
            <HostingModeSection session={session} dispatch={dispatch} />
          </section>
        </div>
      </details>
    </main>
  )
}
