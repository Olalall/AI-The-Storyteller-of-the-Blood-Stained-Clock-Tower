import { FlaskConical, HeartPulse, RefreshCw, Skull, Tag, Wine } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { ImpairmentState, LifeState, PlayerStatusSnapshot } from '../types'
import { impairmentMeta, lifeMeta } from './statusMeta'

interface PlayerStatusBarProps {
  playerLabel: string
  status: PlayerStatusSnapshot
  queuedRoleName?: string
  canChangeRole?: boolean
  onChangeRole?: () => void
}

const lifeIcon: Record<LifeState, typeof HeartPulse> = {
  alive: HeartPulse,
  dead: Skull,
}

const impairmentIcon: Record<ImpairmentState, typeof FlaskConical> = {
  poisoned: FlaskConical,
  drunk: Wine,
}

const impairmentOrder: ImpairmentState[] = ['poisoned', 'drunk']

export function PlayerStatusBar({ playerLabel, status, queuedRoleName, canChangeRole = true, onChangeRole }: PlayerStatusBarProps) {
  const LifeIcon = lifeIcon[status.life]
  const life = lifeMeta[status.life]

  return (
    <section className="player-state-bar" aria-label={`${playerLabel}状态`}>
      <strong>状态</strong>
      <div className="player-state-bar__badges">
        <StatusBadge tone={life.tone}>
          <LifeIcon aria-hidden="true" />{life.label}
        </StatusBadge>
        {impairmentOrder.filter((condition) => status.impairments.includes(condition)).map((condition) => {
          const meta = impairmentMeta[condition]
          const Icon = impairmentIcon[condition]
          return (
            <StatusBadge key={condition} tone={meta.tone}>
              <Icon aria-hidden="true" />{meta.label}
            </StatusBadge>
          )
        })}
        {status.markers.map((marker) => (
          <StatusBadge key={marker.id} tone="info">
            <Tag aria-hidden="true" />标记：{marker.label}
          </StatusBadge>
        ))}
        {queuedRoleName ? <StatusBadge tone="warning"><RefreshCw aria-hidden="true" />本夜仍按{queuedRoleName}</StatusBadge> : null}
      </div>
      {onChangeRole ? (
        <Button variant="secondary" compact className="player-state-bar__action" disabled={!canChangeRole} onClick={onChangeRole}>
          更换角色
        </Button>
      ) : null}
    </section>
  )
}
