import { ChevronDown, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { smartScriptPacks, type PlayerCount, type ScriptId } from '../../domain/scripts'
import { Button } from '../../components/ui/Button'
import type { PlayerExperience } from '../game-session/types'
import {
  buildRosterForPlayerCount,
  loadSetupRosterMemory,
  supportedPlayerCounts,
  type SetupRosterSeatInput,
} from './setupRosterMemory'
import { chineseDisplayName } from './setupPresentation'

interface SetupStartPanelProps {
  scriptId: ScriptId
  scriptName: string
  onScriptChange: (scriptId: ScriptId) => void
  onStart: (input: { playerCount: PlayerCount; seats: readonly SetupRosterSeatInput[] }) => void
}

const experienceLabels: Record<PlayerExperience, string> = {
  new: '新手',
  regular: '标准',
  veteran: '熟手',
}

export function SetupStartPanel({ scriptId, scriptName, onScriptChange, onStart }: SetupStartPanelProps) {
  const memory = useMemo(() => loadSetupRosterMemory(), [])
  const [playerCount, setPlayerCount] = useState<PlayerCount>(12)
  const [roster, setRoster] = useState(() => buildRosterForPlayerCount(12, memory))
  const canReuse = Boolean(memory?.seats.length)

  function selectPlayerCount(nextCount: PlayerCount) {
    setPlayerCount(nextCount)
    setRoster(buildRosterForPlayerCount(nextCount, memory))
  }

  function updateSeat(seatId: number, patch: Partial<SetupRosterSeatInput>) {
    setRoster((current) => current.map((seat) => seat.seatId === seatId ? { ...seat, ...patch } : seat))
  }

  return (
    <section className="setup-start" aria-labelledby="setup-start-title">
      <div className="setup-start__hero">
        <span><UsersRound aria-hidden="true" />开局引导 · 第 2 / 4 步</span>
        <h3 id="setup-start-title">设置本局</h3>
        <p>选择板子和人数；昵称、经验可以先用默认值。</p>
      </div>

      <div className="setup-start__script-row">
        <label>
          <span>开局板子</span>
          <select
            aria-label="开局板子"
            value={scriptId}
            onChange={(event) => onScriptChange(event.target.value as ScriptId)}
          >
            {smartScriptPacks.map((pack) => (
              <option key={pack.scriptId} value={pack.scriptId}>
                {chineseDisplayName(pack.displayName)}
              </option>
            ))}
          </select>
        </label>
        <small>当前：{scriptName}</small>
      </div>

      <div className="setup-start__counts" aria-label="选择玩家人数">
        {supportedPlayerCounts().map((count) => (
          <button
            key={count}
            type="button"
            aria-pressed={count === playerCount}
            className={count === playerCount ? 'is-selected' : ''}
            onClick={() => selectPlayerCount(count)}
          >
            {count}人
          </button>
        ))}
      </div>

      <details className="setup-start__roster-details">
        <summary>
          <span><strong>玩家昵称与经验</strong><small>可选，默认值可以直接开局</small></span>
          <b>{playerCount}个座位</b>
          <ChevronDown aria-hidden="true" />
        </summary>
        <div className="setup-start__roster-heading">
          <span>AI 会参考玩家经验排序候选；不填写也能正常配板。</span>
          <Button variant="ghost" compact disabled={!canReuse} onClick={() => setRoster(buildRosterForPlayerCount(playerCount, memory))}>
            复用上局昵称
          </Button>
        </div>

        <div className="setup-start__roster" role="list" aria-label="新局玩家昵称和经验">
          {roster.map((seat) => (
            <div key={seat.seatId} role="listitem" className="setup-start__seat-row">
              <span>{seat.seatId}号</span>
              <input
                aria-label={`${seat.seatId}号昵称`}
                value={seat.nickname}
                onChange={(event) => updateSeat(seat.seatId, { nickname: event.target.value })}
              />
              <select
                aria-label={`${seat.seatId}号经验`}
                value={seat.experience}
                onChange={(event) => updateSeat(seat.seatId, { experience: event.target.value as PlayerExperience })}
              >
                {Object.entries(experienceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          ))}
        </div>
      </details>

      <div className="setup-start__footer">
        <span><small>下一步</small><strong>生成可调整的配板候选，不会发送身份</strong></span>
        <Button variant="primary" onClick={() => onStart({ playerCount, seats: roster })}>生成配板方案</Button>
      </div>
    </section>
  )
}
