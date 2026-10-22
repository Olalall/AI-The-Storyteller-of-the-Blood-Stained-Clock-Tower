import { useEffect, useState, type Dispatch } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import type { GameSessionState } from '../types'
import type { GameSessionAction } from '../state/sessionActions'
import { abilityRoleChoices, abilitySourceLabels, projectAbilityGrants } from '../state/abilityChanges'
import { projectCurrentAssignments } from '../state/projectors'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import '../../night-workbench/components/night-close-checklist.css'

const prompts: Readonly<Record<string, string>> = {
  philosopher: '确认本次选择有效，并核对在场同角色醉酒、使用次数和发动时点；不会改变真实身份。',
  alchemist: '确认获得的是爪牙能力，并核对开局修正与相克；可重复在场爪牙，仍是善良炼金术士。',
  boffin: '仅一名恶魔获得不在场善良能力；核对科学怪人的存活、毒醉与相克，毒醉恶魔仍可保留此能力。',
  pixie: '首夜告知角色不会立即授予能力。请确认被标记玩家已死亡，并且小精灵满足疯狂条件；获得的是最初告知的镇民能力。',
  cannibal: '确认最近一次处决确实杀死了玩家；死者未死或处决尸体均不触发。核对死者当时能力与阵营，中毒和假装能力需主持分别处理。',
}

export function AbilityChangeSheet({ session, dispatch, suggestedSourceId }: { session: GameSessionState; dispatch: Dispatch<GameSessionAction>; suggestedSourceId?: string }) {
  const [open, setOpen] = useState(false), [sourceKey, setSourceKey] = useState(''), [seat, setSeat] = useState('')
  const [role, setRole] = useState(''), [reason, setReason] = useState(''), [checked, setChecked] = useState(false)
  const [timing, setTiming] = useState<'tonight' | 'later'>('tonight'), [pendingId, setPendingId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [triggerSeat, setTriggerSeat] = useState('')
  const assignments = projectCurrentAssignments(session), grants = projectAbilityGrants(session)
  const sources = assignments.flatMap(a => [a.role.id, ...grants.filter(g => g.seatId === a.seatId).map(g => g.abilityRole!.id)]
    .filter(id => Object.hasOwn(abilitySourceLabels, id)).map(id => ({ seatId: a.seatId, roleId: id, key: `${a.seatId}:${id}` })))
  const source = sources.find(s => s.key === sourceKey), recipient = assignments.find(a => a.seatId === Number(seat))
  const choices = source ? abilityRoleChoices(session, source.roleId) : []
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  const concealed = Boolean(run?.privacyShielded)
  useEffect(() => {
    if (pendingId && session.timeline.some(e => e.id === pendingId)) { setPendingId(''); setOpen(false); setFeedback('能力调整已确认；真实身份保留，夜序已按选择更新。') }
  }, [pendingId, session.timeline])
  if (!sources.length && !grants.length) return null
  function changeSource(key: string) {
    const next = sources.find(s => s.key === key)
    setSourceKey(key); setSeat(next?.roleId === 'boffin' ? '' : String(next?.seatId ?? '')); setRole(''); setChecked(false); setTriggerSeat('')
  }
  function changeOpen(next: boolean) {
    if (next) {
      const entry = session.timeline.find(e => e.id === suggestedSourceId)
      const item = entry?.kind === 'night_action' ? session.nightRuns[entry.nightRunId]?.queue.find(i => i.id === entry.wakeItemId) : undefined
      const suggested = item && sources.find(s => s.seatId === item.seatId && s.roleId === item.roleId)
      const initial = suggested ?? sources[0]
      if (initial) { changeSource(initial.key); setRole(entry?.kind === 'night_action' ? entry.record.snapshot.roleChoice : '') }
      setReason(''); setChecked(false); setFeedback('')
    }
    setOpen(next)
  }
  return <>
    {feedback ? <span role="status">{feedback}</span> : null}
    <Sheet open={open} onOpenChange={changeOpen} title="能力继承" description="由主持确认获得、替换或撤销；身份与生死、毒醉分别记录。"
      trigger={<Button variant="ghost" compact aria-label="能力继承" title="确认获得、替换或撤销能力">{suggestedSourceId ? '能力继承' : '能力'}</Button>}>
      <div className="night-close-checklist">{concealed ? <p>请先退出遮蔽再调整能力。</p> : <>
        {grants.length ? <ul>{grants.map(g => <li key={g.id}>{g.seatId}号 {g.actorRole.name} · {g.abilityRole!.name}能力</li>)}</ul> : null}
        <form onSubmit={event => {
          event.preventDefault(); if (!source || !recipient || !checked || !reason.trim() || !role) return
          const id = `ability-${crypto.randomUUID()}`; setPendingId(id)
          dispatch({ type: 'confirm-ability-change', id, sourceSeatId: source.seatId, sourceRoleId: source.roleId, seatId: recipient.seatId,
            expectedRoleId: recipient.role.id, roleId: role === 'revoke' ? null : role, timing, reason,
            sourceEntryId: suggestedSourceId, triggerSeatId: triggerSeat ? Number(triggerSeat) : undefined, expectedContextKey: nightContextKey(session), confirmedAt: new Date().toISOString() })
        }}>
          <label>能力来源<select value={sourceKey} onChange={e => changeSource(e.target.value)}>{sources.map(s => <option key={s.key} value={s.key}>{s.seatId}号 {abilitySourceLabels[s.roleId]}</option>)}</select></label>
          {source ? <p>{prompts[source.roleId]}</p> : null}
          <label>获得能力的玩家<select value={seat} onChange={e => { setSeat(e.target.value); setChecked(false) }} disabled={source?.roleId !== 'boffin'}>
            <option value="">选择玩家</option>{assignments.map(a => <option key={a.seatId} value={a.seatId}>{a.seatId}号 {a.role.name}</option>)}
          </select></label>
          <label>获得或撤销<select value={role} onChange={e => { setRole(e.target.value); setChecked(false) }}><option value="">选择能力</option>
            {choices.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}<option value="revoke">撤销该来源的能力</option>
          </select></label>
          <label>当晚时点<select value={timing} onChange={e => setTiming(e.target.value as 'tonight' | 'later')}><option value="tonight">当晚按对应能力的夜序处理</option><option value="later">本夜不再发动，下次按夜序处理</option></select></label>
          {source?.roleId === 'pixie' ? <label>最初标记并已死亡的玩家<select value={triggerSeat} onChange={e => { setTriggerSeat(e.target.value); setChecked(false) }}><option value="">选择玩家</option>{assignments.map(a => <option key={a.seatId} value={a.seatId}>{a.seatId}号</option>)}</select></label> : null}
          <label>判定依据<input value={reason} maxLength={500} onChange={e => setReason(e.target.value)} placeholder="记录死亡、疯狂、处决或能力变化的依据" /></label>
          <label><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />我已核对触发条件、能力有效性、相克及发动时点</label>
          {pendingId && !session.timeline.some(e => e.id === pendingId) ? <p role="alert">尚未保存。请核对来源、接收人的身份及当前局面，再确认。</p> : null}
          <Button type="submit" disabled={!source || !recipient || !role || !checked || !reason.trim()}>确认能力调整</Button>
        </form>
      </>}</div>
    </Sheet>
  </>
}
