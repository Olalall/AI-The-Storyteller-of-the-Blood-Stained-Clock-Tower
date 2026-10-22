import type { Dispatch } from 'react'
import type { GameSessionAction } from '../features/game-session/state/sessionActions'
import { StateFollowupSheet } from '../features/game-session/components/StateFollowupSheet'
import { AbilityChangeSheet } from '../features/game-session/components/AbilityChangeSheet'
import { Archive, BookOpenCheck, History, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { BeginnerTutorialSheet } from './deferredFeatures'
import { SessionBackupSheet } from '../features/game-session/components/SessionBackupSheet'
import type { GameSessionState } from '../features/game-session/types'
import { RulesAdvisorLauncher } from '../features/rules-advisor/RulesAdvisorLauncher'

interface PhaseUtilityActionsProps {
  dispatch: Dispatch<GameSessionAction>
  session: GameSessionState
  onRestore: (next: GameSessionState) => Promise<void>
  tutorialOpen: boolean
  onTutorialOpenChange: (open: boolean) => void
  onOpenReview: () => void
  onOpenRecords: () => void
  onOpenSave: () => void
  onOpenReset: () => void
}

export function PhaseUtilityActions({ session, dispatch, onRestore, tutorialOpen, onTutorialOpenChange, onOpenReview, onOpenRecords, onOpenSave, onOpenReset }: PhaseUtilityActionsProps) {
  return <>
    <RulesAdvisorLauncher scriptId={session.scriptId} concealed={Boolean(session.activeNightRunId && session.nightRuns[session.activeNightRunId]?.privacyShielded)} />
    <AbilityChangeSheet session={session} dispatch={dispatch} />
    <StateFollowupSheet session={session} dispatch={dispatch} />
    <SessionBackupSheet session={session} onRestore={onRestore} />
    <Button variant="ghost" compact aria-label="新手教程" title="新手教程" onClick={() => onTutorialOpenChange(true)}><BookOpenCheck aria-hidden="true" />教程</Button>
    <BeginnerTutorialSheet
      open={tutorialOpen}
      onOpenChange={onTutorialOpenChange}
    />
    <Button variant="ghost" compact aria-label="本局记录" title="本局记录" onClick={onOpenRecords}><History aria-hidden="true" />记录</Button>
    <Button variant="ghost" compact aria-label="历史复盘" title="历史复盘" onClick={onOpenReview}><History aria-hidden="true" />复盘</Button>
    <Button variant="ghost" compact aria-label="保存本局" title="保存本局" onClick={onOpenSave}><Archive aria-hidden="true" />保存</Button>
    <Button variant="ghost" compact aria-label="重置游戏" title="重置游戏" className="ui-phase-track__reset" onClick={onOpenReset}><RotateCcw aria-hidden="true" />重置</Button>
  </>
}
