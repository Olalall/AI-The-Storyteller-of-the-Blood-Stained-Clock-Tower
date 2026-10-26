import type { DragEvent } from 'react'
import { RoleDisc } from '../../components/ui/RoleDisc'
import type { SetupAssignment } from '../game-session/types'

export function SetupSeatGrid({ assignments, action, selectedSeatId, onSelect, onSwap, onDragStart }: {
  assignments: SetupAssignment[]; action: 'swap' | 'role' | 'nickname'; selectedSeatId: number | null
  onSelect: (seatId: number) => void; onSwap: (from: number, to: number) => void; onDragStart: (seatId: number) => void
}) {
  function start(event: DragEvent<HTMLButtonElement>, seatId: number) {
    if (action !== 'swap') return
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(seatId))
    onDragStart(seatId)
  }
  function drop(event: DragEvent<HTMLButtonElement>, target: number) {
    event.preventDefault()
    const source = Number(event.dataTransfer.getData('text/plain'))
    if (Number.isInteger(source)) onSwap(source, target)
  }
  return <div className="setup-seat-grid" role="list" aria-label="配板座位">
    {assignments.map(a => <div key={a.seatId} role="listitem"><button type="button" draggable={action === 'swap'}
      aria-label={`${a.seatId}号 ${a.role.name}`} aria-pressed={action === 'swap' && a.seatId === selectedSeatId}
      className={`${a.seatId === selectedSeatId ? 'is-selected ' : ''}is-action-${action}`}
      onClick={() => onSelect(a.seatId)} onDragStart={e => start(e, a.seatId)}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }} onDrop={e => drop(e, a.seatId)}>
      <RoleDisc initial={a.role.initial} roleName={a.role.name} imageSrc={a.role.iconPath} size="small" />
      <span>{a.seatId}号</span><strong>{a.role.name}</strong>
    </button></div>)}
  </div>
}
