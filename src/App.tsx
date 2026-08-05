import { useMemo, useState } from 'react'
import { AppFrame } from './app/AppFrame'
import { PhaseTrack } from './components/ui/PhaseTrack'
import { Button } from './components/ui/Button'
import { projectPhaseTrack } from './features/game-session/state/projectPhaseTrack'
import { projectEffectiveTimelineEntries } from './features/game-session/state/projectTimelineHistory'
import { Dashboard } from './features/dashboard/Dashboard'
import { SessionRail } from './features/dashboard/components/SessionRail'
import { PlayerStatusOverlay } from './features/dashboard/components/PlayerStatusOverlay'
import { TimelineHistorySheet } from './features/history/TimelineHistorySheet'
import { DayWorkbench } from './features/day-workbench/DayWorkbench'
import { PublicChatTimerPage } from './features/day-workbench/PublicChatTimerPage'
import { DuskHandoff } from './features/hosting-deck/handoff/DuskHandoff'
import { DawnHandoff } from './features/hosting-deck/handoff/DawnHandoff'
import { deckNodeForSession, isFirstNight, latestNightSegmentId, nextDayLabel, nextNightLabel, type DeckNode } from './features/hosting-deck/deckNode'
import { DiscussionTimerProvider } from './features/day-workbench/state/discussionTimer'
import { useGameSession } from './features/game-session/state/useGameSession'
import { GameEndSheet } from './features/game-end/GameEndSheet'
import { IdentityDealSheet } from './features/identity-deal/IdentityDealSheet'
import { NightWorkbench } from './features/night-workbench/NightWorkbench'
import { ScriptLibrarySheet } from './features/script-library/ScriptLibrarySheet'
import { SetupPanel } from './features/setup/SetupPanel'
import { clearIdentityDealReceipts } from './services/identity-deal'
import type { ScriptId } from './domain/scripts'
/** 顶层只有主持台与档案两个视图：档案是覆盖层，主持台在其后保持挂载。 */
type View = 'deck' | 'archive'

function App() {
  const [view, setView] = useState<View>('deck')
  const [timerOpen, setTimerOpen] = useState(false)
  const [recordsOpen, setRecordsOpen] = useState(false)
  const { session, dispatch } = useGameSession()
  const [deckNode, setDeckNode] = useState<DeckNode>(() => deckNodeForSession(session))
  const [setupOpen, setSetupOpen] = useState(false)
  const [identityDealOpen, setIdentityDealOpen] = useState(false)
  const [gameEndOpen, setGameEndOpen] = useState(false)
  const [gameEndMode, setGameEndMode] = useState<'end' | 'review'>('end')
  const [scriptLibraryOpen, setScriptLibraryOpen] = useState(false)
  const [setupScriptId, setSetupScriptId] = useState<ScriptId>('catfishing')
  const [playerStatusSeatId, setPlayerStatusSeatId] = useState<number | null>(null)
  const nightBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])

  function enterNight() {
    const activeRun = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
    const segment = activeRun?.phaseSegmentId
      ? session.phaseSegments.find((item) => item.id === activeRun.phaseSegmentId)
      : undefined
    if (!activeRun || segment?.closedAt) dispatch({ type: 'start-next-night-run' })
    dispatch({ type: 'open-phase-segment', phaseKind: 'night', createdAt: new Date().toISOString() })
    setDeckNode('night')
    setView('deck')
  }

  function enterDay() {
    dispatch({ type: 'open-phase-segment', phaseKind: 'day', createdAt: new Date().toISOString() })
    setDeckNode('day')
    setView('deck')
  }

  function resetGame() {
    clearIdentityDealReceipts(session.id)
    setSetupScriptId(session.scriptId)
    dispatch({ type: 'reset-session' })
    setView('deck')
    setDeckNode('dusk')
    setSetupOpen(true)
    setIdentityDealOpen(false)
    setGameEndOpen(false)
    setScriptLibraryOpen(false)
    setPlayerStatusSeatId(null)
  }

  return (
    <DiscussionTimerProvider key={session.id} sessionId={session.id}>
      <AppFrame
        rail={view === 'deck' && (deckNode === 'night' || deckNode === 'day') ? <SessionRail session={session} onOpenPlayerStatus={setPlayerStatusSeatId} /> : undefined}
        phaseTrack={(
          <PhaseTrack
            nodes={projectPhaseTrack(session, view === 'deck' ? deckNode : undefined)}
            actions={(
              <>
                <Button variant="ghost" compact onClick={() => setRecordsOpen(true)}>
                  本局记录 {projectEffectiveTimelineEntries(session.timeline).length}
                </Button>
                <Button variant="ghost" compact onClick={() => setView(view === 'archive' ? 'deck' : 'archive')}>
                  {view === 'archive' ? '回到主持台' : '本局'}
                </Button>
                <Button variant="ghost" compact onClick={() => { setGameEndMode('end'); setGameEndOpen(true) }}>收尾</Button>
              </>
            )}
          />
        )}
      >
        {/* 档案打开时卸载主持台：覆盖层背后留一份完整 DOM 会让同名内容出现两份，
            读屏与键盘也仍能走进去。deckNode 保存在 App 上，返回时回到原节点。 */}
        <div className="app-frame__deck" hidden={view === 'archive'}>
          {view === 'deck' ? <>
        {deckNode === 'dusk' ? (
          <DuskHandoff
            session={session}
            nightLabel={nextNightLabel(session)}
            isFirstNight={isFirstNight(session)}
            onStartNight={enterNight}
          />
        ) : null}
        {deckNode === 'night' ? (
          <NightWorkbench sessionBinding={nightBinding} onExit={() => setView('archive')} onCloseNight={() => setDeckNode('dawn')} />
        ) : null}
        {deckNode === 'dawn' ? (
          <DawnHandoff
            session={session}
            nightSegmentId={latestNightSegmentId(session) ?? ''}
            dayLabel={nextDayLabel(session)}
            onStartDay={enterDay}
            onOpenPlayerStatus={setPlayerStatusSeatId}
          />
        ) : null}
        {deckNode === 'day' ? (
          <DayWorkbench session={session} dispatch={dispatch} onExit={() => setView('archive')} onOpenTimer={() => setTimerOpen(true)} />
        ) : null}
          </> : null}
        </div>
        {view === 'archive' ? (
          <Dashboard session={session} dispatch={dispatch} onEnterNight={enterNight} onEnterDay={enterDay} onOpenTimer={() => setTimerOpen(true)} onOpenSetup={() => setSetupOpen(true)} onOpenIdentityDeal={() => setIdentityDealOpen(true)} onOpenGameEnd={(mode = 'end') => { setGameEndMode(mode); setGameEndOpen(true) }} onOpenScriptLibrary={() => setScriptLibraryOpen(true)} onOpenPlayerStatus={setPlayerStatusSeatId} onExitArchive={() => setView('deck')} />
        ) : null}
        {timerOpen ? <PublicChatTimerPage onExit={() => setTimerOpen(false)} /> : null}
        <SetupPanel open={setupOpen} onOpenChange={setSetupOpen} session={session} dispatch={dispatch} setupScriptId={setupScriptId} onSetupScriptChange={setSetupScriptId} />
        <IdentityDealSheet open={identityDealOpen} onOpenChange={setIdentityDealOpen} session={session} />
        <GameEndSheet open={gameEndOpen} onOpenChange={setGameEndOpen} session={session} initialMode={gameEndMode} onResetGame={resetGame} />
        <ScriptLibrarySheet open={scriptLibraryOpen} onOpenChange={setScriptLibraryOpen} session={session} onSelectScript={(scriptId) => { setSetupScriptId(scriptId); setSetupOpen(true) }} />
        <TimelineHistorySheet
          session={session}
          dispatch={dispatch}
          open={recordsOpen}
          onOpenChange={setRecordsOpen}
          onOpenPlayerStatus={setPlayerStatusSeatId}
          onOpenDayWorkbench={enterDay}
          onOpenSetup={() => setSetupOpen(true)}
        />
        <PlayerStatusOverlay seatId={playerStatusSeatId} session={session} dispatch={dispatch} onOpenChange={(open) => { if (!open) setPlayerStatusSeatId(null) }} />
      </AppFrame>
    </DiscussionTimerProvider>
  )
}

export default App
