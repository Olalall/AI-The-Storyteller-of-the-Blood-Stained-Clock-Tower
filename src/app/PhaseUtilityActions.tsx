import { BookOpenCheck, History, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { BeginnerTutorialSheet } from '../features/tutorial/BeginnerTutorialSheet'

interface PhaseUtilityActionsProps {
  tutorialOpen: boolean
  onTutorialOpenChange: (open: boolean) => void
  onOpenReview: () => void
  onOpenReset: () => void
}

export function PhaseUtilityActions({ tutorialOpen, onTutorialOpenChange, onOpenReview, onOpenReset }: PhaseUtilityActionsProps) {
  return <>
    <BeginnerTutorialSheet
      open={tutorialOpen}
      onOpenChange={onTutorialOpenChange}
      trigger={<Button variant="ghost" compact><BookOpenCheck aria-hidden="true" />新手教程</Button>}
    />
    <Button variant="ghost" compact onClick={onOpenReview}><History aria-hidden="true" />本局记录</Button>
    <Button variant="ghost" compact className="ui-phase-track__reset" onClick={onOpenReset}><RotateCcw aria-hidden="true" />重置游戏</Button>
  </>
}
