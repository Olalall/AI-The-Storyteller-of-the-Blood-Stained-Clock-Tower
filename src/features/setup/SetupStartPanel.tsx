import { UsersRound } from 'lucide-react'
import { useId, useMemo, useRef, useState } from 'react'
import { scriptManifest, type PlayerCount, type ScriptId } from '../../domain/scripts'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
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
  const [roster, setRoster] = useState(() => buildRosterForPlayerCount(15, memory))
  const [scriptSearch, setScriptSearch] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  const searchStatusId = useId()
  const query = scriptSearch.trim().toLowerCase()
  const matchingScripts = scriptManifest.filter((pack) => `${pack.displayName} ${pack.scriptId}`.toLowerCase().includes(query))
  const selectedScriptMatches = matchingScripts.some((pack) => pack.scriptId === scriptId)
  const canReuse = Boolean(memory?.seats.length)

  function selectPlayerCount(nextCount: PlayerCount) {
    setPlayerCount(nextCount)
  }

  function updateSeat(seatId: number, patch: Partial<SetupRosterSeatInput>) {
    setRoster((current) => current.map((seat) => seat.seatId === seatId ? { ...seat, ...patch } : seat))
  }

  return (
    <section className="setup-start" aria-labelledby="setup-start-title">
      <div className="setup-start__hero">
        <span><UsersRound aria-hidden="true" />新局开局</span>
        <h3 id="setup-start-title">选择人数</h3>
        <p>{scriptName}</p>
      </div>

      <div className="setup-start__script-row">
        <div className="setup-start__script-search">
          <Field label="搜索板子">
            <input ref={searchInput} type="search" placeholder="输入中文名或英文名" value={scriptSearch} aria-describedby={searchStatusId} onChange={(event) => setScriptSearch(event.target.value)} />
          </Field>
          {scriptSearch ? <Button variant="ghost" onClick={() => { setScriptSearch(''); searchInput.current?.focus() }}>清除搜索</Button> : null}
        </div>
        <div className="setup-start__script-choice">
          <Field label="开局板子">
            <select
              aria-label="开局板子"
              aria-describedby={searchStatusId}
              value={scriptId}
              disabled={matchingScripts.length === 0}
              onChange={(event) => onScriptChange(event.target.value as ScriptId)}
            >
              {!selectedScriptMatches ? <option value={scriptId}>当前选择：{scriptName}</option> : null}
              {matchingScripts.map((pack) => (
                <option key={pack.scriptId} value={pack.scriptId}>
                  {chineseDisplayName(pack.displayName)}
                </option>
              ))}
            </select>
          </Field>
          <small>开始配板后生效</small>
        </div>
        <p id={searchStatusId} className="setup-start__script-status" role="status">
          {query ? matchingScripts.length ? `找到 ${matchingScripts.length} 个板子` : '没有匹配的板子，请换个关键词或清除搜索。' : `共 ${scriptManifest.length} 个板子`}
          {!selectedScriptMatches ? ` · 当前选择仍为${scriptName}` : null}
        </p>
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

      <div className="setup-start__roster-heading">
        <div>
          <span>玩家</span>
          <strong>{playerCount}个座位</strong>
        </div>
        <Button variant="ghost" compact disabled={!canReuse} onClick={() => setRoster(buildRosterForPlayerCount(15, memory))}>
          复用昵称
        </Button>
      </div>

      <div className="setup-start__roster" role="list" aria-label="新局玩家昵称和经验">
        {roster.slice(0, playerCount).map((seat) => (
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

      <div className="setup-start__footer">
        <Button variant="primary" onClick={() => onStart({ playerCount, seats: roster.slice(0, playerCount) })}>开始配板</Button>
      </div>
    </section>
  )
}
