import { BookOpenText } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import type { GameRecordEntry } from '../state/gameRecordProjection'
import { GameRecordList } from './GameRecordList'

interface GameRecordSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phaseLabel: string
  entries: GameRecordEntry[]
  concealed: boolean
}

export function GameRecordSheet({ open, onOpenChange, phaseLabel, entries, concealed }: GameRecordSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="本局记录"
      description={`${phaseLabel} · ${entries.length}条`}
      contentClassName="sheet-content--record"
      presentation="page"
      trigger={(
        <Button variant="secondary" compact aria-label={`本局记录，共${entries.length}条`}>
          <BookOpenText aria-hidden="true" />
          <span className="header-action-label header-action-label--full">本局记录</span>
          <span className="header-action-label header-action-label--compact" aria-hidden="true">记录</span>
          <span className="record-count" aria-hidden="true">{entries.length}</span>
        </Button>
      )}
    >
      {concealed ? <div className="game-record-privacy"><strong>记录已遮蔽</strong></div> : <GameRecordList entries={entries} />}
    </Sheet>
  )
}
