import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { savantInformation } from '../state/savantInformation'
import type { DaySkillDraft } from '../state/daySkill'
import type { GameSessionState } from '../../game-session/types'
import './savant-drafts.css'

export function SavantInformationDrafts({ session, draft, onChange }: {
  session: GameSessionState; draft: DaySkillDraft; onChange: (draft: DaySkillDraft) => void
}) {
  const [batch, setBatch] = useState(0)
  if (draft.abilityRoleId !== 'savant' || draft.actorSeatId === null) return null
  const information = savantInformation(session, draft.actorSeatId)
  const selected = information.pairs[batch % information.pairs.length]
  const stale = draft.savantContextKey && draft.savantContextKey !== information.contextKey
  return <section className="savant-drafts" aria-label="博学者信息草稿">
    <h3>信息草稿 · 仅说书人可见</h3><p>{information.warning}</p>
    <p>根据已记录的身份和状态编写。若有未录毒醉、误认或特殊登记，请先人工核对再采用。</p>
    {selected ? <ol>{selected.statements.map((s, i) => <li key={i}><strong>{s.text}</strong><small>{s.truth ? '真' : '假'} · {s.evidence}</small></li>)}</ol> : <p>目前没有足够的已确认信息，请手动编写。</p>}
    {stale ? <p role="alert">采用后局面已有变化，请重新核对草稿；手工修改结果表示已重新核对。</p> : null}
    <div><Button variant="secondary" onClick={() => setBatch(batch + 1)}>换一组信息</Button>
      <Button variant="secondary" disabled={!selected} onClick={() => onChange({ ...draft, outcomeKind: 'custom',
        outcomeNote: selected.statements.map((s, i) => `信息${i + 1}：${s.text}\n说书人核对：${s.truth ? '真' : '假'}；${s.evidence}`).join('\n'),
        savantContextKey: information.contextKey })}>采用到待确认记录</Button></div>
  </section>
}
