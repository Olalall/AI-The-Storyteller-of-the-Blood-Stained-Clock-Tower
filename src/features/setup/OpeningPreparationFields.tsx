import { roleSnapshotsForScript, roleTeamByIdForScript } from '../../domain/scripts'
import { openingRole } from '../../domain/scripts/openingPreparation'
import type { SetupDraft } from '../game-session/types'
import type { OpeningChoice } from '../game-session/model/openingTypes'
import './opening-preparation.css'

export function OpeningPreparationFields({ scriptId, draft, disabled = false, onChange }: {
  scriptId: string
  draft: SetupDraft
  disabled?: boolean
  onChange: (choices: OpeningChoice[]) => void
}) {
  const roles = roleSnapshotsForScript(scriptId), teams = roleTeamByIdForScript(scriptId)
  const inPlay = new Set(draft.assignments.map(a => a.role.id))
  const actors = draft.assignments.filter(a => openingRole(a.role.id))
  if (!actors.length) return null
  const choices = draft.openingChoices ?? []
  function update(choice: OpeningChoice) {
    onChange([...choices.filter(c => c.seatId !== choice.seatId && draft.assignments.some(a => a.seatId === c.seatId && a.role.id === c.roleId)), choice])
  }
  return <section className="setup-opening" aria-labelledby="opening-preparation-title">
    <h4 id="opening-preparation-title">开局准备 · 仅说书人可见</h4>
    <p>确认配板时保存以下选择，并登记醉酒、能力与提示标记。换角色后请重新核对。</p>
    {actors.map(actor => {
      const spec = openingRole(actor.role.id)!
      const choice = choices.find(c => c.seatId === actor.seatId && c.roleId === actor.role.id) ?? { seatId: actor.seatId, roleId: actor.role.id }
      const options = roles.filter(r => teams[r.id] === spec.kind)
      const toggle = <T,>(values: T[], value: T) => values.includes(value) ? values.filter(v => v !== value) : [...values, value]
      return <fieldset key={actor.seatId} disabled={disabled} aria-label={`${actor.seatId}号 ${actor.role.name}开局准备`}>
        <legend>{actor.seatId}号 {actor.role.name}</legend><p>{spec.hint}</p>
        {spec.kind === 'townsfolk' ? <label>实际标记的镇民玩家<select value={choice.targetSeatId ?? ''} onChange={e => {
          const target = draft.assignments.find(a => a.seatId === Number(e.target.value))
          update({ ...choice, targetSeatId: target?.seatId, sourceRoleId: target?.role.id })
        }}><option value="">请选择</option>{draft.assignments.filter(a => teams[a.role.id] === 'townsfolk').map(a => <option key={a.seatId} value={a.seatId}>{a.seatId}号 {a.role.name}</option>)}</select></label> : null}
        {spec.kind === 'player' ? <label>{spec.label}<select value={choice.targetSeatId ?? ''} onChange={e => update({ ...choice, targetSeatId: Number(e.target.value) })}>
          <option value="">请选择</option>{draft.assignments.map(a => <option key={a.seatId} value={a.seatId}>{a.seatId}号 {a.role.name}</option>)}
        </select></label> : spec.kind === 'text' ? <label>{spec.label}<textarea maxLength={400} value={choice.text ?? ''} onChange={e => update({ ...choice, text: e.target.value })} /></label>
          : <label>{spec.label}<select value={choice.chosenRoleId ?? ''} onChange={e => update({ ...choice, chosenRoleId: e.target.value })}><option value="">请选择</option>{options.map(r => <option key={r.id} value={r.id}>{r.name}{inPlay.has(r.id) ? '（在场）' : ''}</option>)}</select></label>}
        {spec.kind === 'demon' ? <>
          <fieldset><legend>假的爪牙名单（{draft.assignments.filter(a => teams[a.role.id] === 'minion').length}人）</legend><div className="setup-opening__choices">{draft.assignments.filter(a => a.seatId !== actor.seatId).map(a => <label key={a.seatId}><input type="checkbox" aria-label={`${a.seatId}号假爪牙候选 ${a.role.name}`} checked={choice.minionSeatIds?.includes(a.seatId) ?? false} onChange={() => update({ ...choice, minionSeatIds: toggle(choice.minionSeatIds ?? [], a.seatId) })} />{a.seatId}号 {a.role.name}</label>)}</div></fieldset>
          <fieldset><legend>三张假伪装（允许在场）</legend><div className="setup-opening__choices">{roles.filter(r => ['townsfolk', 'outsider'].includes(teams[r.id])).map(r => <label key={r.id}><input type="checkbox" aria-label={`假伪装 ${r.name}`} checked={choice.bluffRoleIds?.includes(r.id) ?? false} onChange={() => update({ ...choice, bluffRoleIds: toggle(choice.bluffRoleIds ?? [], r.id) })} />{r.name}{inPlay.has(r.id) ? ' · 在场' : ''}</label>)}</div></fieldset>
        </> : null}
      </fieldset>
    })}
  </section>
}
