import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { GameRecordBadge, GameRecordEntry } from '../state/gameRecordProjection'

const badgeTone: Record<GameRecordBadge, 'neutral' | 'success' | 'warning' | 'info'> = {
  '更正': 'warning',
  '已更正': 'neutral',
  '角色变更': 'info',
  'AI采用': 'info',
  '待告知': 'warning',
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function GameRecordList({ entries }: { entries: GameRecordEntry[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  if (entries.length === 0) {
    return <EmptyState
      className="game-record-empty"
      title="暂无记录"
      description="确认第一条夜间或白天记录后，这里按夜/天分组显示。"
    />
  }

  const groups = entries.reduce<Array<{ key: string; label: string; entries: GameRecordEntry[] }>>((result, entry) => {
    const group = result.find((candidate) => candidate.key === entry.phaseKey)
    if (group) group.entries.push(entry)
    else result.push({ key: entry.phaseKey, label: entry.phaseLabel, entries: [entry] })
    return result
  }, [])

  return (
    <div className="game-record-groups">
      {groups.map((group) => (
        <section className="game-record-group" key={group.key}>
          <h3>{group.label}</h3>
          <ol>
            {group.entries.map((entry) => {
              const expanded = entry.id === expandedId
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="game-record-entry"
                    aria-expanded={expanded}
                    onClick={() => setExpandedId(expanded ? null : entry.id)}
                  >
                    <span className="game-record-entry__main">
                      <strong>{entry.summary}</strong>
                      <span>{timeLabel(entry.createdAt)} · {entry.meta}</span>
                    </span>
                    <span className="game-record-entry__badges">
                      {entry.badges.map((badge) => <StatusBadge key={badge} tone={badgeTone[badge]}>{badge}</StatusBadge>)}
                    </span>
                    <ChevronDown className={expanded ? 'game-record-entry__chevron is-open' : 'game-record-entry__chevron'} aria-hidden="true" />
                  </button>
                  {expanded && entry.details.length > 0 ? (
                    <div className="game-record-entry__details">
                      {entry.details.map((detail) => <p key={detail}>{detail}</p>)}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
