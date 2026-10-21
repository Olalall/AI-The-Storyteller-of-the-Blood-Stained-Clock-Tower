import { DayWorkbench, PublicChatTimerPage, GameEndSheet, IdentityDealSheet, NightWorkbench, ScriptLibrarySheet, SetupPanel } from './app/deferredFeatures'
import { useMemo, useState } from 'react'
import { useScriptRequest } from './app/useScriptRequest'
import { usePhaseEntry } from './app/usePhaseEntry'
import { AppFrame } from './app/AppFrame'
import { PhaseUtilityActions } from './app/PhaseUtilityActions'
import { PhaseTrack } from './components/ui/PhaseTrack'
import { projectPhaseTrack } from './features/game-session/state/projectPhaseTrack'
import { projectConfirmedSetup } from './features/game-session/state/projectors'
import { Dashboard } from './features/dashboard/Dashboard'
import { SessionRail } from './features/dashboard/components/SessionRail'
import { PlayerStatusOverlay } from './features/dashboard/components/PlayerStatusOverlay'
import { DiscussionTimerProvider } from './features/day-workbench/state/discussionTimer'
import { useGameSession } from './features/game-session/state/useGameSession'
import { SessionSaveNotice } from './features/game-session/components/SessionSaveNotice'
import { SessionEditorNotice } from './features/game-session/components/SessionEditorNotice'
import { SessionRecoveryNotice } from './features/game-session/components/SessionRecoveryNotice'
import { clearIdentityDealReceipts } from './services/identity-deal'
import { scriptDisplayName, type ScriptId } from './domain/scripts'
import type { GameSessionState } from './features/game-session/types'
import type { GameEndMode } from './features/game-end/GameEndSheet'
import { HostNotice } from './components/ui/HostNotice'
import { PWAInstallProvider } from './features/pwa/PWAInstallProvider'
import { PWAStatusNotices } from './features/pwa/PWAStatusNotices'
import { TimelineHistorySheet } from './features/history/TimelineHistorySheet'
type View = 'dashboard' | 'night' | 'day' | 'timer'

function App() {
  const { session, dispatch, resetSession, saveFailed, saving, retrySave, editorStatus, restoreSession, reopenLatest, recovery, startAfterRecovery } = useGameSession()
  const [view, setView] = useState<View>('dashboard')
  const [setupOpen, setSetupOpen] = useState(false)
  const [identityDealOpen, setIdentityDealOpen] = useState(false)
  const [gameEndOpen, setGameEndOpen] = useState(false)
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [gameEndMode, setGameEndMode] = useState<GameEndMode>('save')
  const [resetNotice, setResetNotice] = useState('')
  const [scriptLibraryOpen, setScriptLibraryOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [nextScriptAfterReset, setNextScriptAfterReset] = useState<ScriptId | null>(null)
  const [setupScriptId, setSetupScriptId] = useState<ScriptId>(session.scriptId)
  const [playerStatusSeatId, setPlayerStatusSeatId] = useState<number | null>(null)
  const scriptRequest = useScriptRequest(session)
  const nightBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])
  const phaseEntry = usePhaseEntry(session, dispatch, () => { if (session.playerCount > 0) setSetupScriptId(session.scriptId); setSetupOpen(true) }, setView, view, editorStatus === 'ready' && !recovery)

  async function resetGame(expectedSession: GameSessionState) {
    await resetSession(expectedSession)
    try { clearIdentityDealReceipts(expectedSession.id) } catch { /* 旧回执按对局隔离，清理失败不能阻断已保存的新局。 */ }
    setSetupScriptId(nextScriptAfterReset ?? session.scriptId)
    setResetNotice('本局已重置，记录已归档。请选择人数，开始新局。')
    setView('dashboard')
    setSetupOpen(true)
    setIdentityDealOpen(false)
    setGameEndOpen(false)
    setRecordsOpen(false)
    setScriptLibraryOpen(false)
    setPlayerStatusSeatId(null)
    setNextScriptAfterReset(null)
  }

  function selectSetupScript(scriptId: ScriptId) {
    setSetupScriptId(scriptId)
    if (session.playerCount > 0 && !projectConfirmedSetup(session)) {
      dispatch({
        type: 'start-setup-session',
        scriptId,
        createdAt: new Date().toISOString(),
        playerCount: session.playerCount,
        seats: Object.values(session.seats).map((seat) => ({
          seatId: seat.seatId,
          nickname: seat.nickname,
          experience: seat.experience,
        })),
      })
    }
    setSetupOpen(true)
  }

  return (
    <PWAInstallProvider><DiscussionTimerProvider key={session.id} sessionId={session.id}>
      <AppFrame
        notice={<>{!setupOpen && session.playerCount === 0 && resetNotice ? <HostNotice message={resetNotice} autoHideMs={0} /> : null}{scriptRequest.feedback}{!setupOpen ? phaseEntry.feedback : null}<SessionRecoveryNotice recovery={recovery} onStart={startAfterRecovery} canStart={editorStatus === 'ready'} />{!recovery ? <SessionEditorNotice status={editorStatus} session={session} onReopen={reopenLatest} /> : null}{saveFailed && editorStatus === 'ready' ? <SessionSaveNotice session={session} onRetry={retrySave} /> : null}</>}
        rail={view === 'night' || view === 'day' ? <SessionRail session={session} onOpenPlayerStatus={setPlayerStatusSeatId} /> : undefined}
        phaseTrack={(
          <PhaseTrack
            nodes={projectPhaseTrack(session)}
            actions={(
              <PhaseUtilityActions dispatch={dispatch} session={session} onRestore={async (next) => { await restoreSession(next); setSetupScriptId(next.scriptId) }} tutorialOpen={tutorialOpen} onTutorialOpenChange={setTutorialOpen}
                onOpenRecords={() => setRecordsOpen(true)}
                onOpenReview={() => { setGameEndMode('review'); setGameEndOpen(true) }}
                onOpenSave={() => { setGameEndMode('save'); setGameEndOpen(true) }}
                onOpenReset={() => { setGameEndMode('reset'); setGameEndOpen(true) }} />
            )}
          />
        )}
      >
        <PWAStatusNotices hasStarted={session.playerCount > 0} canReload={editorStatus === 'ready' && !saveFailed && !saving && !recovery} />
        {view === 'dashboard' ? <Dashboard session={session} dispatch={dispatch} onEnterNight={phaseEntry.enterNight} onEnterDay={phaseEntry.enterDay} onOpenTimer={() => setView('timer')} onOpenSetup={() => setSetupOpen(true)} onOpenIdentityDeal={() => setIdentityDealOpen(true)} onOpenScriptLibrary={() => setScriptLibraryOpen(true)} onOpenPlayerStatus={setPlayerStatusSeatId} /> : null}
        {view === 'night' ? <NightWorkbench sessionBinding={nightBinding} onExit={() => setView('dashboard')} /> : null}
        {view === 'day' ? <DayWorkbench session={session} dispatch={dispatch} onExit={() => setView('dashboard')} /> : null}
        {view === 'timer' ? <PublicChatTimerPage onExit={() => setView('dashboard')} /> : null}
        <SetupPanel open={setupOpen} onOpenChange={(open) => { setSetupOpen(open); if (!open) phaseEntry.clearNotice() }} session={session} dispatch={dispatch} setupScriptId={setupScriptId} notice={phaseEntry.notice || (session.playerCount === 0 ? resetNotice : '')} onSetupScriptChange={(id) => { void scriptRequest.run(id, () => setSetupScriptId(id), '返回配板') }} />
        <IdentityDealSheet open={identityDealOpen} onOpenChange={setIdentityDealOpen} session={session} dispatch={dispatch} />
        <GameEndSheet open={gameEndOpen} session={session} initialMode={gameEndMode} onResetGame={resetGame}
          nextScriptLabel={nextScriptAfterReset ? scriptDisplayName(nextScriptAfterReset) : null}
          onOpenChange={(nextOpen) => { setGameEndOpen(nextOpen); if (!nextOpen) { if (nextScriptAfterReset) setScriptLibraryOpen(true); setNextScriptAfterReset(null) } }} />
        <TimelineHistorySheet open={recordsOpen} onOpenChange={setRecordsOpen} session={session} dispatch={dispatch}
          onOpenPlayerStatus={setPlayerStatusSeatId} onOpenDayWorkbench={phaseEntry.enterDay} onOpenSetup={() => setSetupOpen(true)} />
        <ScriptLibrarySheet open={scriptLibraryOpen} onOpenChange={setScriptLibraryOpen} session={session} onSelectScript={(id) => { void scriptRequest.run(id, () => { setScriptLibraryOpen(false); selectSetupScript(id) }, '返回选板') }}
          onRequestResetSwitch={(id) => { void scriptRequest.run(id, () => { setScriptLibraryOpen(false); setNextScriptAfterReset(id); setGameEndMode('reset'); setGameEndOpen(true) }, '返回选板') }} />
        <PlayerStatusOverlay seatId={playerStatusSeatId} session={session} dispatch={dispatch} onOpenChange={(open) => { if (!open) setPlayerStatusSeatId(null) }} />
      </AppFrame>
    </DiscussionTimerProvider></PWAInstallProvider>
  )
}

export default App
