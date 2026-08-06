/**
 * 座位浮层的构造。
 *
 * 从舞台里搬出来，是因为它把「哪一格通向哪里」这条映射和舞台的排版混在了一起——
 * 第五格「更换角色」现在还走过渡桥（退回座位卡），改起来要能一眼找到它在哪。
 */
import { SeatActionBar } from '../write/SeatActionBar'
import type { ReactNode } from 'react'
import type { PlayerState } from '../../game-session/model/playerTypes'
import type { SeatWriteBindings } from '../write/useSeatWriteBindings'

export interface SeatAnchorInput {
  playerStates: Readonly<Record<number, PlayerState>>
  bindings: SeatWriteBindings
  onOpenRoleChange: (seatId: number) => void
  onOpenSeatCard: (seatId: number) => void
}

export function renderSeatAnchorWith({
  playerStates,
  bindings,
  onOpenRoleChange,
  onOpenSeatCard,
}: SeatAnchorInput): (seatId: number) => ReactNode {
  return (seatId) => playerStates[seatId] ? (
    <SeatActionBar
      seatId={seatId}
      state={playerStates[seatId]}
      onDraft={(cell) => bindings.draftFromCell(seatId, cell)}
      onAddMarker={(label) => bindings.addMarker(seatId, label)}
      onOpenRoleChange={() => { bindings.closeActionBar(); onOpenRoleChange(seatId) }}
      onOpenSeatCard={() => { bindings.closeActionBar(); onOpenSeatCard(seatId) }}
      onClose={bindings.closeActionBar}
    />
  ) : null
}
