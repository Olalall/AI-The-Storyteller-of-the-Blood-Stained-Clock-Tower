import type { Dispatch } from 'react'
import type { GameSessionAction } from '../features/game-session/state/sessionActions'
import { StateFollowupSheet } from '../features/game-session/components/StateFollowupSheet'
import { Archive, BookOpenCheck, History, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { BeginnerTutorialSheet } from './deferredFeatures'
import { SessionBackupSheet } from '../features/game-session/components/SessionBackupSheet'
import type { GameSessionState } from '../features/game-session/types'

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
    <StateFollowupSheet session={session} dispatch={dispatch} />
    <SessionBackupSheet session={session} onRestore={onRestore} />
    <Button variant="ghost" compact onClick={() => onTutorialOpenChange(true)}><BookOpenCheck aria-hidden="true" />新手教程</Button>
    <BeginnerTutorialSheet
      open={tutorialOpen}
      onOpenChange={onTutorialOpenChange}
    />
    <Button variant="ghost" compact onClick={onOpenRecords}><History aria-hidden="true" />本局记录</Button>
    <Button variant="ghost" compact onClick={onOpenReview}><History aria-hidden="true" />历史复盘</Button>
    <Button variant="ghost" compact onClick={onOpenSave}><Archive aria-hidden="true" />保存本局</Button>
    <Button variant="ghost" compact className="ui-phase-track__reset" onClick={onOpenReset}><RotateCcw aria-hidden="true" />重置游戏</Button>
  </>
}
