import { FlaskConical, HeartPulse, Skull, Tag, Wine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { RoleDisc } from '../../../components/ui/RoleDisc'
import { Sheet } from '../../../components/ui/Sheet'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { PlayerSeat, PlayerState } from '../../game-session/types'
import type { RoleSnapshot } from '../../night-workbench/types'
import type { SeatActivity } from '../state/projectSeatActivity'

interface PlayerStatusSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  seat: PlayerSeat
  role?: RoleSnapshot
  playerState: PlayerState
  openSegments: Array<{ id: string; label: string }>
  activity: SeatActivity[]
  onConfirm: (input: { expectedBefore: PlayerState; after: PlayerState; segmentId: string | null }) => void
}

function cloneState(state: PlayerState): PlayerState {
  return { ...state, markers: state.markers.map((marker) => ({ ...marker })) }
}

function sameState(left: PlayerState, right: PlayerState) {
  return left.life === right.life && left.poisoned === right.poisoned && left.drunk === right.drunk &&
    left.markers.length === right.markers.length && left.markers.every((marker, index) => marker.id === right.markers[index]?.id && marker.label === right.markers[index]?.label)
}

export function PlayerStatusSheet({ open, onOpenChange, seat, role, playerState, openSegments, activity, onConfirm }: PlayerStatusSheetProps) {
  const [draft, setDraft] = useState(() => cloneState(playerState))
  const [segmentId, setSegmentId] = useState('')

  useEffect(() => {
    if (!open) return
    setDraft(cloneState(playerState))
    setSegmentId('')
  }, [open, playerState])

  const changed = !sameState(playerState, draft)
  const roleName = role?.name ?? '未分配身份'

  function confirm() {
    if (!changed) return
    onConfirm({ expectedBefore: cloneState(playerState), after: cloneState(draft), segmentId: segmentId || null })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={`${seat.label}玩家`} description="查看身份、修改状态和相关记录。" contentClassName="sheet-content--player-status" presentation="page">
      <div className="player-status-sheet">
        <section className="player-status-sheet__identity" aria-label="身份">
          <RoleDisc initial={role?.initial ?? '?'} roleName={roleName} imageSrc={role?.iconPath} size="medium" />
          <div><span>身份</span><strong>{roleName}</strong><small>{seat.nickname}</small></div>
        </section>

        <section className="player-status-sheet__editor" aria-labelledby="player-state-editor-title">
          <div className="player-status-sheet__section-heading"><div><span>状态</span><h3 id="player-state-editor-title">手动更新</h3></div><StatusBadge tone={draft.life === 'alive' ? 'success' : 'neutral'}>{draft.life === 'alive' ? '存活' : '死亡'}</StatusBadge></div>
          <div className="player-status-sheet__life" role="group" aria-label="生死状态">
            <button type="button" className={draft.life === 'alive' ? 'is-active' : ''} aria-pressed={draft.life === 'alive'} onClick={() => setDraft((state) => ({ ...state, life: 'alive' }))}><HeartPulse aria-hidden="true" />存活</button>
            <button type="button" className={draft.life === 'dead' ? 'is-active' : ''} aria-pressed={draft.life === 'dead'} onClick={() => setDraft((state) => ({ ...state, life: 'dead' }))}><Skull aria-hidden="true" />死亡</button>
          </div>
          <div className="player-status-sheet__conditions" aria-label="状态标记">
            <button type="button" className={draft.poisoned ? 'is-active is-poisoned' : ''} aria-pressed={draft.poisoned} onClick={() => setDraft((state) => ({ ...state, poisoned: !state.poisoned }))}><FlaskConical aria-hidden="true" />中毒</button>
            <button type="button" className={draft.drunk ? 'is-active is-drunk' : ''} aria-pressed={draft.drunk} onClick={() => setDraft((state) => ({ ...state, drunk: !state.drunk }))}><Wine aria-hidden="true" />醉酒</button>
          </div>
          {draft.markers.length ? <div className="player-status-sheet__markers">{draft.markers.map((marker) => <StatusBadge key={marker.id} tone="info"><Tag aria-hidden="true" />标记：{marker.label}</StatusBadge>)}</div> : null}
          <label className="player-status-sheet__segment">记入<select aria-label="记录位置" value={segmentId} onChange={(event) => setSegmentId(event.target.value)}><option value="">本局状态</option>{openSegments.map((segment) => <option key={segment.id} value={segment.id}>{segment.label}</option>)}</select></label>
          <p>确认后追加记录；不会处决、判胜或切换昼夜。</p>
          <Button variant={draft.life === 'dead' && playerState.life !== 'dead' ? 'danger' : 'primary'} disabled={!changed} onClick={confirm}>确认状态</Button>
        </section>

        <section className="player-status-sheet__activity" aria-labelledby="player-activity-title">
          <div className="player-status-sheet__section-heading"><div><span>记录</span><h3 id="player-activity-title">相关记录</h3></div></div>
          {activity.length
            ? <ul>{activity.map((entry) => <li key={entry.id}><span>{entry.phaseLabel}</span><strong>{entry.summary}</strong></li>)}</ul>
            : <EmptyState compact title="暂无结构化相关记录" />}
        </section>
      </div>
    </Sheet>
  )
}
